import { resolvePackageDir } from '../util';
import { Asset } from '../asset';

export class AppEngineVersion extends Asset {
  private readonly packageName: string;
  constructor(options: { projectId: string; packageName: string }) {
    super({
      projectId: options.projectId,
      description: 'app version for package',
      name: options.packageName,
    });
    this.packageName = options.packageName;
  }

  public async create() {
    this.log.creating();
    const packageDir = await resolvePackageDir(this.packageName);

    await this.gcloud({
      args: ['app', 'deploy'],
      cwd: packageDir,
    });

    this.log.created();
  }
}
