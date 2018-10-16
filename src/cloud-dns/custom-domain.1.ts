import { Zone, DNS, Record } from '@google-cloud/dns';
import { Asset, IAsset } from '../asset.1';
import { ResourceRecord } from '../interface';

export class CloudDnsCustomDomain extends Asset {
  private readonly zone: Zone;
  private readonly records: Record[];
  constructor(
    options: IAsset & { records: { domainName: string; recordType: string; data: any } },
  ) {
    super(options);
    const dns = new DNS({ projectId: this.projectId });
    this.zone = new Zone(dns, this.zoneName);
    this.records = options.map(({ domainName, recordType, data }) =>
      this.zone.record(recordType, {
        data,
        name: domainName,
        ttl: 300,
      }),
    );
  }

  public async create() {
    this.log.creating();
    try {
      await this.zone.addRecords(this.records);
      this.log.created();
    } catch (ex) {
      if (!ex.message.includes('already exists')) {
        throw ex;
      } else {
        this.log.alreadyCreated();
      }
    }
    this.log.created();
  }
}
