import { DNS, Zone } from '@google-cloud/dns';

import { REGION } from './constants';
import { createLogger, gcloud, GcloudOptions } from './util';
import lodashKebabcase = require('lodash.kebabcase');
import { CreateOptions, GetConfig } from '@google-cloud/common';
import pkgDir = require('pkg-dir');
import { promisify } from 'util';
import { writeFile } from 'fs';
import { join } from 'path';
import { dump } from 'js-yaml';
import is from '@sindresorhus/is';

export type ServiceOptions = {
  serviceName: string;
  packageName: string;
};

export type NamedAppOptions = {
  domainName: string;
  projectId: string;
  services: ServiceOptions[];
};

export class NamedApp {
  private readonly zone: Zone;
  private readonly projectId: string;
  private readonly domainName: string;
  private readonly services: ServiceOptions[];

  constructor({ projectId, domainName, services }: NamedAppOptions) {
    const dns = new DNS({ projectId });
    this.zone = dns.zone(lodashKebabcase(domainName));
    this.projectId = projectId;
    this.domainName = domainName;
    this.services = services;
  }

  private gcloud(options: GcloudOptions) {
    return gcloud({ ...options, projectId: this.projectId });
  }

  private async createApp() {
    const log = createLogger('app for project', this.projectId);
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
    const log = createLogger('dns zone', this.domainName);
    log.creating();
    await this.zone.get({
      autoCreate: true,
      dnsName: this.domainName,
    } as GetConfig);
    log.maybeCreated();
  }

  private async createService(options: ServiceOptions) {
    const { packageName, serviceName } = options;
    const log = createLogger('service', serviceName);
    log.creating();
    const packageDir = await pkgDir(require.resolve(packageName));

    if (is.null_(packageDir)) {
      throw new Error(`Failed to find package directory for "${packageName}"`);
    }

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

    await this.gcloud({
      args: ['app', 'deploy'],
      cwd: packageDir,
    });

    log.created();
  }

  private async createDefaultService() {
    return await this.createService({
      serviceName: 'default',
      packageName: '@carnesen/redirector',
    });
  }

  public async create() {
    // await this.createApp();
    // await this.createZone();
    // await this.createDefaultService();
    for (const serviceOptions of this.services) {
      await this.createService(serviceOptions);
    }
  }
}
