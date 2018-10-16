import { Zone, DNS, Record } from '@google-cloud/dns';
import { Asset } from '../asset';
import { ResourceRecord } from '../interface';

export class CloudDns extends Asset {
  private readonly zone: Zone;
  constructor(options: { projectId: string; zoneName: string }) {
    const { projectId } = options;
    super({
      projectId,
      description: 'Cloud DNS',
      name: options.zoneName,
    });
    this.zone = new Zone(new DNS({ projectId }), options.zoneName);
  }

  public async create(): Promise<never> {
    this.log.creating();
    throw new Error('Cloud DNS must be initialized manually');
  }

  public async getDomainName() {
    await this.zone.get();
    debugger;
  }
}
