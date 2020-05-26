import { Asset, AssetOptions } from './asset';
import { AppEngine } from './app-engine';
import { Site, SiteType } from './site';
import { AppEngineDispatchYaml } from './app-engine/dispatch-yaml';
import { removeTrailingDot } from './util';

export type AppProps = {
  defaultSite: {
    packageId: string;
    siteType: SiteType;
    zoneName: string;
  };
  otherSites?: {
    packageId: string;
    siteName: string;
    siteType: SiteType;
    zoneName: string;
  }[];
};

export class App extends Asset<AppProps> {
  private readonly sites: Site[];

  public constructor(options: AssetOptions<AppProps>) {
    super(options);
    const sites = [this.factory(Site, this.props.defaultSite)];
    if (Array.isArray(this.props.otherSites)) {
      sites.push(
        ...this.props.otherSites.map((siteProps) => this.factory(Site, siteProps)),
      );
    }
    this.sites = sites;
  }

  private async getDispatchConfig() {
    const dispatchConfig: { url: string; service: string }[] = [];
    for (const namedSite of this.sites) {
      const dnsName = await namedSite.getDnsName();
      dispatchConfig.push({
        url: `${removeTrailingDot(dnsName)}/*`,
        service: namedSite.name,
      });
    }
    return dispatchConfig;
  }

  public async create(): Promise<void> {
    const appEngine = this.factory(AppEngine, null);
    await appEngine.create();
    for (const site of this.sites) {
      await site.preValidate();
    }
    for (const site of this.sites) {
      await site.create();
    }
    const dispatchConfig = await this.getDispatchConfig();
    const dispatchYaml = this.factory(AppEngineDispatchYaml, { config: dispatchConfig });
    await dispatchYaml.create();
    await dispatchYaml.deploy();
    await dispatchYaml.destroy();
  }
}
