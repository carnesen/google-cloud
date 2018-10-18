import { Asset } from './asset';
import { AppEngineAppYaml } from './app-engine/app-yaml';
import { AppEngineVersion } from './app-engine/version';
import { AppEngineCustomDomain } from './app-engine/custom-domain';
import { CloudDns } from './cloud-dns';
import { CloudDnsCustomDomain } from './cloud-dns/custom-domain';
import { resolvePackageDir } from './util';

export type Props = { packageName: string; serviceName: string };

export class NamedNodejsService extends Asset<Props> {
  public async create() {
    const { packageName, serviceName } = this.props;
    const rootDir = resolvePackageDir(packageName);

    const appYaml = this.factory(AppEngineAppYaml, {
      rootDir,
      serviceName,
    });
    await appYaml.create();

    const version = this.factory(AppEngineVersion, {
      rootDir,
    });
    await version.create();

    const cloudDns = this.factory(CloudDns, { name: 'TODO' });
    const domainName = await cloudDns.getDomainName();
    const subdomainName =
      serviceName === 'default' ? domainName : `${serviceName}.${domainName}.`;

    const appCustomDomain = this.factory(AppEngineCustomDomain, {
      name: domainName,
      domainName: subdomainName,
    });
    await appCustomDomain.create();
    const appResourceRecords = await appCustomDomain.getResourceRecords();

    const dnsCustomDomain = this.factory(CloudDnsCustomDomain, {
      records: appResourceRecords.map(({ rrdata, type }) => ({
        domainName: subdomainName,
        recordType: type,
        rrdata: [rrdata],
      })),
    });
    await dnsCustomDomain.create();
  }
}
