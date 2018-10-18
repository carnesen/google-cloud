import { Asset } from '../asset';

import { promisify } from 'util';
import { writeFile } from 'fs';
import { dump } from 'js-yaml';
import { join } from 'path';

export type Props = {
  rootDir: string;
  serviceName: string;
};

export class AppEngineAppYaml extends Asset<Props> {
  public get name() {
    return this.props.rootDir;
  }
  public async create() {
    const { rootDir, serviceName } = this.props;
    this.log.creating();
    const contents = {
      runtime: 'nodejs8',
      env: 'standard',
      service: serviceName,
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
    await promisify(writeFile)(join(rootDir, 'app.yaml'), dump(contents));
    this.log.created();
  }
}
