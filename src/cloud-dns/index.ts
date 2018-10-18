import { Asset } from '../asset';
import { Zone, DNS } from '@google-cloud/dns';

export class CloudDns extends Asset<{}> {
  public get name() {
    return this.context.zoneName;
  }
  public async create(): Promise<never> {
    this.log.creating();
    throw new Error('Cloud DNS must be initialized manually');
  }

  public async getDomainName() {
    const zone = new Zone(
      new DNS({ projectId: this.context.projectId }),
      this.context.zoneName,
    );
    await zone.get();
    const domainName = zone.metadata.dnsName;
    return domainName;
  }
}
