import { Asset } from './asset';
import { Zone as GoogleCloudZone, DNS } from '@google-cloud/dns';
import { addTrailingDot } from './util';

type Props = {
  zoneName: string;
};

export class CloudDnsZone extends Asset<Props> {
  public get name() {
    return this.props.zoneName;
  }

  public async create(): Promise<never> {
    this.log.creating();
    throw new Error(
      `Cloud DNS must be initialized manually https://console.cloud.google.com/net-services/dns/zones?project=${
        this.context.projectId
      }`,
    );
  }

  private async getGoogleCloudZone() {
    const zone = new GoogleCloudZone(
      new DNS({ projectId: this.context.projectId }),
      this.props.zoneName,
    );
    await zone.get();
    return zone;
  }

  public async getDnsName() {
    const zone = await this.getGoogleCloudZone();
    const dnsName = addTrailingDot(zone.metadata.dnsName);
    return dnsName;
  }

  public async addRecords(
    data: {
      dnsName: string;
      recordType: string;
      rrdata: string[];
    }[],
  ) {
    this.log.info('Adding records');
    const zone = await this.getGoogleCloudZone();
    const records = data.map(({ dnsName, recordType, rrdata }) =>
      zone.record(recordType, {
        data: rrdata,
        name: dnsName,
        ttl: 300,
      }),
    );
    try {
      await (zone as any).addRecords(records);
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
