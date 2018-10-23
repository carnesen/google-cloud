import { removeTrailingDot, addTrailingDot } from '../util';
import { Asset } from '../asset';

type Props = {
  dnsName: string;
};

export class AppEngineCustomDomain extends Asset<Props> {
  public get name() {
    return this.props.dnsName;
  }
  public async create() {
    this.log.creating();
    try {
      await this.gcloud({
        args: ['app', 'domain-mappings', 'create', removeTrailingDot(this.props.dnsName)],
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
      args: ['app', 'domain-mappings', 'describe', removeTrailingDot(this.props.dnsName)],
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
