import { Asset } from './asset';
import { AppEngineAppYaml } from './app-engine/app-yaml';
import { AppEngineVersion } from './app-engine/version';
import { AppEngineCustomDomain } from './app-engine/custom-domain';
import { CloudDns } from './cloud-dns';

// const DEFAULT_NODEJS_SERVICE_OPTIONS: NamedNodejsServiceOptions = {
//   serviceName: 'default',
//   packageName: '@carnesen/redirector',
// };

export class NamedNodejsService extends Asset {
  private readonly appEngineAppYaml: AppEngineAppYaml;
  private readonly appEngineVersion: AppEngineVersion;
  private readonly cloudDns: CloudDns;

  constructor(options: {
    projectId: string;
    packageName: string;
    serviceName: string;
    zoneName: string;
  }) {
    const { projectId, serviceName, packageName } = options;
    super({ projectId, description: 'Nodejs Service', name: serviceName });
    this.appEngineAppYaml = new AppEngineAppYaml({ projectId, packageName, serviceName });
    this.appEngineVersion = new AppEngineVersion({ projectId, packageName });
    this.cloudDns = new CloudDns({ projectId, zoneName });
  }

  public async create() {
    const { projectId } = this;
    await this.appEngineAppYaml.create();
    await this.appEngineVersion.create();
    const v = this.asset(AppEngineVersion);
    const domainName;
    // const appEngineCustomDomain = new AppEngineCustomDomain({
    //   projectId,
    //   domainName,
    // });
  }
}
