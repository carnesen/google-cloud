import { resolvePackageDir } from '../util';
import { Asset, IAsset } from '../asset';
import { promisify } from 'util';
import { writeFile } from 'fs';
import { dump } from 'js-yaml';
import { join } from 'path';

export type P = {
  packageName: string;
  serviceName: string;
};

export class AppEngineAppYaml extends Asset<P> {
  public async create() {
    this.log.creating();
    const packageDir = resolvePackageDir(this.props.packageName);
    const contents = {
      runtime: 'nodejs8',
      env: 'standard',
      service: this.props.serviceName,
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
    await promisify(writeFile)(join(packageDir, 'app.yaml'), dump(contents));
    await this.gcloud({
      args: ['app', 'deploy'],
      cwd: packageDir,
    });
    this.log.created();
  }
}
