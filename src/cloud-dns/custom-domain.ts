import { Zone, DNS, Record } from '@google-cloud/dns';
import { Asset, BaseProps, Context } from '../asset';
import { ResourceRecord } from '../interface';

type Props = BaseProps & { data: ResourceRecord[] };

export class CloudDnsCustomDomain extends Asset<Props> {
  private readonly zone: Zone;
  private readonly records: Record[];
  constructor(context: Context, props: Props) {
    super(context, props);
    const dns = new DNS({ projectId: this.context.projectId });
    this.zone = new Zone(dns, this.context.zoneName);
    this.records = this.props.data.map(({ domainName, recordType, data }) =>
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
