import { Asset } from '../asset';

export type Props = {
  rootDir: string;
};

export class AppEngineVersion extends Asset<Props> {
  public get name() {
    return this.props.rootDir;
  }
  // TODO: make more idempotent based on git hash for sake of alacrity
  public async create() {
    this.log.creating();
    await this.gcloud({
      args: ['app', 'deploy'],
      cwd: this.props.rootDir,
    });
    this.log.created();
  }
}
