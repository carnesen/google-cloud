import { promisify } from 'util';
import { stat } from 'fs';
import { join, dirname } from 'path';

import { Asset, AssetOptions } from './asset';
import { AppEngineAppYaml } from './app-engine/app-yaml';
import { AppEngineCustomDomain } from './app-engine/custom-domain';
import { CloudDnsZone } from './cloud-dns-zone';
import { AppEngineIgnoreFile } from './app-engine/ignore-file';

export type SiteType = 'nodejs' | 'static';

export type SiteProps = {
	packageId: string;
	siteName?: string;
	siteType: SiteType;
	zoneName: string;
};

export class Site extends Asset<SiteProps> {
	get name(): string {
		return this.props.siteName || 'default';
	}

	private readonly cloudDnsZone: CloudDnsZone;

	public constructor(options: AssetOptions<SiteProps>) {
		super(options);
		this.cloudDnsZone = this.assetFactory(CloudDnsZone, {
			zoneName: this.props.zoneName,
		});
	}

	private get packageDir(): string {
		const packageDir = dirname(
			this.context.requireResolve(`${this.props.packageId}/package.json`),
		);
		return packageDir;
	}

	private async getServiceConfig() {
		// https://cloud.google.com/appengine/docs/standard/nodejs/config/appref
		const baseConfig = {
			// With basic scaling, App Engine attempts to keep $ cost low, even
			// though that may result in higher latency as the volume of incoming
			// requests increases.
			// https://cloud.google.com/appengine/docs/standard/java/how-instances-are-managed#apps_with_basic_scaling
			instance_class: 'B1',
			basic_scaling: {
				max_instances: 3, // to cap runaway costs
			},
			service: this.name,
			env: 'standard',
		};
		switch (this.props.siteType) {
			case 'nodejs':
				return {
					...baseConfig,
					runtime: 'nodejs16',
					handlers: [
						{
							url: '/.*',
							secure: 'always',
							redirect_http_response_code: 301,
							script: 'auto',
						},
					],
				};
			case 'static':
				return {
					...baseConfig,
					runtime: 'python27',
					api_version: 1,
					threadsafe: true,
					handlers: [
						{
							url: '/',
							static_files: 'dist/index.html',
							upload: 'dist/index.html',
						},
						{
							url: '/(.*)',
							static_files: 'dist/\\1',
							upload: 'dist/(.*)',
						},
					],
				};
			default:
				throw new Error(`Unknown siteType "${this.props.siteType}"`);
		}
	}

	public async preValidate(): Promise<string[]> {
		this.logger.info('Pre-validating...');
		const messages: string[] = [];
		switch (this.props.siteType) {
			case 'nodejs': {
				// TODO
				break;
			}
			case 'static': {
				const stats = await promisify(stat)(
					join(this.packageDir, 'dist/index.html'),
				);
				if (!stats.isFile()) {
					messages.push(
						`Expected to find dist/index.html in package "${this.props.packageId}"`,
					);
				}
				break;
			}
			default: {
				messages.push(`Unknown siteType "${this.props.siteType}"`);
			}
		}
		return messages;
	}

	public async getDnsName(): Promise<string> {
		const rootDnsName = await this.cloudDnsZone.getDnsName();
		const dnsName =
			this.name === 'default' ? rootDnsName : `${this.name}.${rootDnsName}`;
		return dnsName;
	}

	public async create(): Promise<void> {
		const config = await this.getServiceConfig();
		const appYaml = this.assetFactory(AppEngineAppYaml, {
			config,
			packageDir: this.packageDir,
		});
		const ignoreFile = this.assetFactory(AppEngineIgnoreFile, {
			packageDir: this.packageDir,
		});
		await appYaml.create();
		await ignoreFile.create();
		await appYaml.deploy();
		await appYaml.destroy();
		await ignoreFile.destroy();

		const dnsName = await this.getDnsName();

		const appCustomDomain = this.assetFactory(AppEngineCustomDomain, {
			dnsName,
		});
		await appCustomDomain.create();
		const appResourceRecords = await appCustomDomain.getResourceRecords();

		await this.cloudDnsZone.addRecords(
			appResourceRecords.map(({ rrdata, type }) => ({
				dnsName,
				recordType: type,
				rrdata: [rrdata],
			})),
		);
	}
}
