import { App } from './app';
import { SiteType } from './site';

export type DeployAppOptions = {
	projectId: string;
	zoneName: string;
	defaultSite: {
		siteType: SiteType;
		packageId: string;
	};
	otherSites?: {
		siteType: SiteType;
		packageId: string;
		siteName: string;
	}[];
	requireResolve?: typeof require.resolve;
};

export async function deployApp(options: DeployAppOptions): Promise<void> {
	const {
		projectId,
		zoneName,
		defaultSite,
		otherSites = [],
		requireResolve = require.resolve,
	} = options;
	const app = new App({
		context: {
			projectId,
			requireResolve,
		},
		props: {
			defaultSite: { ...defaultSite, zoneName },
			otherSites: otherSites.map((otherSite) => ({ ...otherSite, zoneName })),
		},
	});
	await app.create();
}
