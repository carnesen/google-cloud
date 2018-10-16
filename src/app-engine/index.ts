import { Asset } from '../asset';

export class AppEngine extends Asset {
  constructor(options: { projectId: string }) {
    super({
      projectId: options.projectId,
      description: 'app engine',
      name: options.projectId,
    });
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
