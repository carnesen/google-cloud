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
};

export async function deployApp(options: DeployAppOptions): Promise<void> {
  const { projectId, zoneName, defaultSite, otherSites = [] } = options;
  const app = new App({
    context: {
      projectId,
      requireResolve: require.resolve,
    },
    props: {
      defaultSite: { ...defaultSite, zoneName },
      otherSites: otherSites.map((otherSite) => ({ ...otherSite, zoneName })),
    },
  });
  await app.create();
}
