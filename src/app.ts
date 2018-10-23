import { Asset, IAsset } from './asset';
import { AppEngine } from './app-engine';
import { Site, SiteProps, SiteType } from './site';
import { AppEngineDispatchYaml } from './app-engine/dispatch-yaml';
import { removeTrailingDot } from './util';

type Props = SiteProps[];

export class App extends Asset<Props> {
  private readonly sites: Site[];
  public constructor(options: IAsset<Props>) {
    super(options);
    const sites = this.props.map(siteProps => this.factory(Site, siteProps));
    const wwwSite = sites.find(site => site.props.siteName === 'www');
    if (!wwwSite) {
      throw new Error('Expected to find siteName "www"');
    }
    const defaultSite = this.factory(Site, {
      siteName: 'default',
      siteType: SiteType.nodejs,
      packageName: '@carnesen/redirector',
      zoneName: wwwSite.props.zoneName,
    });

    this.sites = [defaultSite, ...sites];
  }

  private async getDispatchConfig() {
    const dispatchConfig: { url: string; service: string }[] = [];
    for (const namedSite of this.sites) {
      const dnsName = await namedSite.getDnsName();
      dispatchConfig.push({
        url: `${removeTrailingDot(dnsName)}/*`,
        service: namedSite.props.siteName,
      });
    }
    return dispatchConfig;
  }

  public async create() {
    const appEngine = this.factory(AppEngine, null);
    await appEngine.create();
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
