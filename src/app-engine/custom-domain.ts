import { removeTrailingDot, addTrailingDot } from '../util';
import { Asset } from '../asset';

export class AppEngineCustomDomain extends Asset {
  private readonly domainName: string;
  constructor(options: { projectId: string; domainName: string }) {
    super({
      projectId: options.projectId,
      description: 'app engine custom domain',
      name: options.domainName,
    });
    this.domainName = options.domainName;
  }

  public async create() {
    this.log.creating();
    try {
      await this.gcloud({
        args: ['app', 'domain-mappings', 'create', removeTrailingDot(this.domainName)],
      });
      this.log.created();
    } catch (ex) {
      if (!ex.message.includes('already exists')) {
        throw ex;
      } else {
        this.log.alreadyCreated();
      }
    }
  }

  public async getResourceRecords() {
    const description = await this.gcloud({
      args: ['app', 'domain-mappings', 'describe', removeTrailingDot(this.domainName)],
    });

    const appResourceRecords: { rrdata: string; type: string }[] =
      description.resourceRecords;

    const resourceRecords = appResourceRecords.map(({ rrdata, type }) => ({
      type,
      rrdata: type === 'CNAME' ? addTrailingDot(rrdata) : rrdata,
    }));
    return resourceRecords;
  }
}
