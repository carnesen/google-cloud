import { Zone, DNS, Record } from '@google-cloud/dns';
import { Asset } from '../asset';
import { ResourceRecord } from '../interface';

export class CloudDnsCustomDomain extends Asset {
  private readonly zone: Zone;
  private readonly records: Record[];
  constructor(options: { projectId: string; zoneName: string; data: ResourceRecord[] }) {
    const { projectId } = options;
    super({
      projectId,
      description: 'Cloud DNS custom domain',
      name: options.projectId,
    });
    this.zone = new Zone(new DNS({ projectId }), options.zoneName);
    this.records = options.data.map(({ domainName, recordType, data }) =>
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
