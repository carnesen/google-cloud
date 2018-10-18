import { Asset } from '../asset';

export type Props = {};

export class AppEngine extends Asset<Props> {
  public get name() {
    return this.context.projectId;
  }
  public async create() {
    this.log.creating();
    try {
      // TODO: Parameterize "region"
      await this.gcloud({
        args: ['app', 'create', `--region=us-central`],
      });
      this.log.created();
    } catch (ex) {
      if (!ex.message.includes('already contains')) {
        throw ex;
      }
      this.log.alreadyCreated();
    }
  }
}
