import { Asset, IAsset } from './asset';
import { AppEngine } from './app-engine';
import { Site, SiteProps } from './site';
import { AppEngineDispatchYaml } from './app-engine/dispatch-yaml';
import { removeTrailingDot } from './util';

type Props = SiteProps[];

export class App extends Asset<Props> {
  private readonly sites: Site[];
  public constructor(options: IAsset<Props>) {
    super(options);
    const sites = this.props.map(siteProps => this.factory(Site, siteProps));
    if (typeof sites[0] === 'undefined') {
      throw new Error('You must define at least one site');
    }
    if (sites[0].props.siteName !== 'default') {
      throw new Error('The first siteName must be "default"');
    }
    this.sites = sites;
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
