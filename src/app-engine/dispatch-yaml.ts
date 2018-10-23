import { Asset } from '../asset';
import { promisify } from 'util';
import { writeFile } from 'fs';
import { dump } from 'js-yaml';

type Props = {
  config: any;
};

const fileName = 'dispatch.yaml';

export class AppEngineDispatchYaml extends Asset<Props> {
  public get name() {
    return this.context.projectId;
  }

  public async create() {
    this.log.creating();
    await promisify(writeFile)(fileName, dump({ dispatch: this.props.config }));
    this.log.created();
  }

  public async deploy() {
    this.log.deploying();
    await this.gcloud({ args: ['app', 'deploy', fileName] });
    this.log.deployed();
  }

  public async destroy() {
    this.log.destroying();
    // TODO
    this.log.destroyed();
  }
}
