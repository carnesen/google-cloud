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

export function deployApp(options: DeployAppOptions) {
  const {
    projectId,
    requireResolve = require.resolve,
    zoneName,
    defaultSite,
    otherSites = [],
  } = options;
  const app = new App({
    context: {
      projectId,
      requireResolve,
    },
    props: {
      defaultSite: { ...defaultSite, zoneName },
      otherSites: otherSites.map(otherSite => ({ ...otherSite, zoneName })),
    },
  });
  return app.create();
}
