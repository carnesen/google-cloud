import { App } from './app';
import { SiteType } from './site';

export type DeployAppOptions = {
	/** Unique identifier for a Google Cloud project */
	projectId: string;
	/**  Unique identifier for a Cloud DNS zone. In some places in the Google
	 * Cloud documentation, this referred to as "zone ID" */
	zoneName: string;
	/** A relative path like `../sites/site-x` or a package name like
	 * `@carnesen/redirector`. By convention the "default site" is the "apex" of
	 * the domain. For example if your domain name is "example.com" then your
	 * "default site" is "example.com" */
	defaultSite: {
		siteType: SiteType;
		packageId: string;
	};
	/** Only the default site is required, but an App Engine app can serve any
	 * number of other sites/services too. Each item in the `otherSites` array
	 * has the same `siteType` and `packageId` properties as `defaultSite` as
	 * well as an additional property `siteName` that defines the subdomain on
	 * which this site will be served. If the domain name is carnesen.com and
	 * `siteName` is `'meme-me'`, that site will be served at
	 * [meme-me.carnesen.com](https://meme-me.carnesen.com/). */
	otherSites?: {
		siteType: SiteType;
		packageId: string;
		siteName: string;
	}[];
	/** A function used to resolve packageId's into filesystem paths */
	requireResolve?: typeof require.resolve;
};

/**
 * Deploy one or more sites to Google Cloud
 * @param options
 */
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
