import { Asset, IAsset } from './asset';
import { AppEngineAppYaml } from './app-engine/app-yaml';
import { AppEngineCustomDomain } from './app-engine/custom-domain';
import { CloudDnsZone } from './cloud-dns-zone';
import { promisify } from 'util';
import { stat } from 'fs';
import { join } from 'path';
import { AppEngineIgnoreFile } from './app-engine/ignore-file';
import pkgDir = require('pkg-dir');
import is from '@sindresorhus/is';

export const enum SiteType {
  nodejs = 'nodejs',
  static = 'static',
}

export type SiteProps = {
  zoneName: string;
  siteType: SiteType;
  siteName: 'default' | string;
  packageId: string;
};

export class Site extends Asset<SiteProps> {
  get name() {
    return this.props.siteName;
  }
  private readonly cloudDnsZone: CloudDnsZone;
  public constructor(options: IAsset<SiteProps>) {
    super(options);
    this.cloudDnsZone = this.factory(CloudDnsZone, { zoneName: this.props.zoneName });
  }

  private get packageDir() {
    const packageDir = pkgDir.sync(this.context.requireResolve(this.props.packageId));
    if (is.null_(packageDir)) {
      throw new Error(`Failed to find package directory for "${this.props.packageId}"`);
    }
    return packageDir;
  }

  private async getServiceConfig() {
    const baseConfig = {
      instance_class: 'B1',
      basic_scaling: {
        max_instances: 3,
      },
      service: this.props.siteName,
      env: 'standard',
    };
    switch (this.props.siteType) {
      case SiteType.nodejs:
        return {
          ...baseConfig,
          runtime: 'nodejs8',
          handlers: [
            {
              url: '/.*',
              secure: 'always',
              redirect_http_response_code: 301,
              script: 'auto',
            },
          ],
        };
      case SiteType.static:
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

  public async preValidate() {
    this.log.info('Pre-validating...');
    const messages: string[] = [];
    switch (this.props.siteType) {
      case SiteType.nodejs:
        // TODO
        break;
      case SiteType.static:
        const stats = await promisify(stat)(join(this.packageDir, 'dist/index.html'));
        if (!stats.isFile()) {
          messages.push(
            `Expected to find dist/index.html in package "${this.props.packageId}"`,
          );
        }
        break;
      default:
        messages.push(`Unknown siteType "${this.props.siteType}"`);
    }
    return messages;
  }

  public async getDnsName() {
    const { siteName } = this.props;
    const rootDnsName = await this.cloudDnsZone.getDnsName();
    const dnsName = siteName === 'default' ? rootDnsName : `${siteName}.${rootDnsName}`;
    return dnsName;
  }

  public async create() {
    const config = await this.getServiceConfig();
    const appYaml = this.factory(AppEngineAppYaml, {
      config,
      packageDir: this.packageDir,
    });
    const ignoreFile = this.factory(AppEngineIgnoreFile, { packageDir: this.packageDir });
    await appYaml.create();
    await ignoreFile.create();
    await appYaml.deploy();
    await appYaml.destroy();
    await ignoreFile.destroy();

    const dnsName = await this.getDnsName();

    const appCustomDomain = this.factory(AppEngineCustomDomain, {
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
