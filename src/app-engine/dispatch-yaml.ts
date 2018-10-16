import { removeTrailingDot } from '../util';
import { Asset } from '../asset';
import { promisify } from 'util';
import { writeFile } from 'fs';
import { dump } from 'js-yaml';

export class AppEngineDispatchYaml extends Asset {
  private readonly data: {
    serviceName: string;
    domainName: string;
  }[];
  constructor(options: {
    projectId: string;
    data: {
      serviceName: string;
      domainName: string;
    }[];
  }) {
    super({
      projectId: options.projectId,
      description: 'app routing rule',
      name: options.projectId,
    });
    this.data = options.data;
  }

  public async create() {
    this.log.creating();
    const fileName = 'dispatch.yaml';
    await promisify(writeFile)(
      fileName,
      dump({
        dispatch: this.data.map(({ serviceName, domainName }) => ({
          url: `${removeTrailingDot(domainName)}/*`,
          service: serviceName,
        })),
      }),
    );
    await this.gcloud({ args: ['app', 'deploy', fileName] });
    this.log.created();
  }
}
