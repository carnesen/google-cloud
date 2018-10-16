import { resolvePackageDir } from '../util';
import { Asset } from '../asset';
import { promisify } from 'util';
import { writeFile } from 'fs';
import { dump } from 'js-yaml';
import { join } from 'path';

export class AppEngineAppYaml extends Asset {
  private readonly packageDir: string;
  private readonly contents: any;
  constructor(options: { projectId: string; packageName: string; serviceName: string }) {
    super({
      projectId: options.projectId,
      description: 'app.yaml file',
      name: options.packageName,
    });

    this.packageDir = resolvePackageDir(options.packageName);

    this.contents = {
      runtime: 'nodejs8',
      env: 'standard',
      service: options.serviceName,
      instance_class: 'B1',
      basic_scaling: {
        max_instances: 3,
      },
      handlers: [
        {
          url: '/.*',
          secure: 'always',
          redirect_http_response_code: 301,
          script: 'auto',
        },
      ],
    };
  }

  public async create() {
    this.log.creating();
    await promisify(writeFile)(join(this.packageDir, 'app.yaml'), dump(this.contents));
    await this.gcloud({
      args: ['app', 'deploy'],
      cwd: this.packageDir,
    });
    this.log.created();
  }
}
