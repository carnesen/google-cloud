import { Zone, DNS } from '@google-cloud/dns';
import { Asset } from '../asset';

export type Props = {
  records: {
    domainName: string;
    recordType: string;
    rrdata: string[];
  }[];
};

export class CloudDnsCustomDomain extends Asset<Props> {
  public get name() {
    return this.context.zoneName;
  }
  public async create() {
    this.log.creating();
    const dns = new DNS({ projectId: this.context.projectId });
    const zone = new Zone(dns, this.context.zoneName);
    const records = this.props.records.map(({ domainName, recordType, rrdata }) =>
      zone.record(recordType, {
        data: rrdata,
        name: domainName,
        ttl: 300,
      }),
    );
    try {
      await zone.addRecords(records);
      this.log.created();
    } catch (ex) {
      if (!ex.message.includes('already exists')) {
        throw ex;
      } else {
        this.log.alreadyCreated();
      }
    }
  }
}
