import { promisify } from 'util';
import { writeFile } from 'fs';
import { join } from 'path';

import { DNS, Zone } from '@google-cloud/dns';
import lodashKebabcase = require('lodash.kebabcase');
import pkgDir = require('pkg-dir');
import { dump } from 'js-yaml';
import is from '@sindresorhus/is';

import { REGION } from './constants';
import { createLogger, gcloud, GcloudOptions, removeTrailingDot } from './util';

export type ServiceOptions = {
  serviceName: string;
  packageName: string;
};

export type NamedAppOptions = {
  domainName: string;
  projectId: string;
  services: ServiceOptions[];
};

const DEFAULT_SERVICE_OPTIONS: ServiceOptions = {
  serviceName: 'default',
  packageName: '@carnesen/redirector',
};

export class NamedApp {
  private readonly zone: Zone;
  private readonly options: NamedAppOptions;

  constructor(options: NamedAppOptions) {
    const dns = new DNS({ projectId: options.projectId });
    this.zone = dns.zone(lodashKebabcase(options.domainName));
    this.options = options;
  }

  private gcloud(options: GcloudOptions) {
    return gcloud({ ...options, projectId: this.options.projectId });
  }

  private async createApp() {
    const log = createLogger('app for project', this.options.projectId);
    try {
      log.creating();
      await this.gcloud({
        args: ['app', 'create', `--region=${REGION}`],
      });
      log.created();
    } catch (ex) {
      if (!ex.message.includes('already contains')) {
        throw ex;
      }
      log.alreadyCreated();
    }
  }

  private async createZone() {
    const log = createLogger('dns zone', this.options.domainName);
    log.creating();
    await this.zone.get({
      autoCreate: true,
      dnsName: this.options.domainName,
    } as any);
    log.maybeCreated();
  }

  private async createRoutingRules() {
    const allServices = [DEFAULT_SERVICE_OPTIONS, ...this.options.services];
    const fileName = 'dispatch.yaml';
    await promisify(writeFile)(
      fileName,
      dump({
        dispatch: allServices.map(({ serviceName }) => ({
          url: `${removeTrailingDot(this.getSubdomainName(serviceName))}/`,
          service: serviceName,
        })),
      }),
    );
    await this.gcloud({ args: ['app', 'deploy', fileName] });
  }

  private async createResourceRecord(options: { name: string; type: string; data: any }) {
    const { name, type, data } = options;
    const log = createLogger('record set', `${type} ${name} -> ${data}`);
    const record = this.zone.record(type, {
      name,
      data,
      ttl: 300,
    });
    log.creating();
    try {
      await this.zone.addRecords(record);
      log.created();
    } catch (ex) {
      if (!ex.message.includes('already exists')) {
        throw ex;
      } else {
        log.alreadyCreated();
      }
    }
  }

  private getSubdomainName(serviceName: string) {
    const { domainName } = this.options;
    return serviceName === 'default' ? domainName : `${serviceName}.${domainName}`;
  }

  private async createDomainMapping(serviceName: string) {
    const subdomainName = this.getSubdomainName(serviceName);
    const log = createLogger('domain mapping', subdomainName);
    log.creating();
    try {
      await this.gcloud({
        args: ['app', 'domain-mappings', 'create', removeTrailingDot(subdomainName)],
      });
    } catch (ex) {
      if (!ex.message.includes('already exists')) {
        throw ex;
      } else {
        log.alreadyCreated();
      }
    }
    const description = await this.gcloud({
      args: ['app', 'domain-mappings', 'describe', removeTrailingDot(subdomainName)],
    });
    // Note the resource records returned don't have CNAME value in proper canonical form
    for (const resourceRecord of description.resourceRecords) {
      const { rrdata, type } = resourceRecord;
      await this.createResourceRecord({
        type,
        data: type === 'CNAME' ? `${rrdata}.` : rrdata,
        name: subdomainName,
      });
    }
  }

  private async createService(options: ServiceOptions) {
    const { packageName, serviceName } = options;
    const log = createLogger('service', serviceName);
    log.creating();
    const packageDir = await pkgDir(require.resolve(packageName));

    if (is.null_(packageDir)) {
      throw new Error(`Failed to find package directory for "${packageName}"`);
    }

    log.info('writing app.yaml...');
    await promisify(writeFile)(
      join(packageDir, 'app.yaml'),
      dump({
        runtime: 'nodejs8',
        env: 'standard',
        service: serviceName,
        instance_class: 'B1',
        basic_scaling: {
          max_instances: 3,
        },
      }),
    );

    log.info('running "gcloud app deploy"...');
    await this.gcloud({
      args: ['app', 'deploy'],
      cwd: packageDir,
    });

    await this.createDomainMapping(serviceName);

    log.created();
  }

  private async createDefaultService() {
    return await this.createService(DEFAULT_SERVICE_OPTIONS);
  }

  private async createServices() {
    for (const serviceOptions of this.options.services) {
      await this.createService(serviceOptions);
    }
  }

  public async create() {
    // await this.createApp();
    // await this.createZone();
    // await this.createDefaultService();
    await this.createServices();
    await this.createRoutingRules();
  }
}
