import { Asset } from './asset';
import { AppEngine } from './app-engine';
import { NamedNodejsService } from './named-nodejs-service';

export class NamedApp extends Asset {
  private readonly appEngine: AppEngine;
  constructor(options: {
    projectId: string;
    nodejsServices: {
      serviceName: string;
      packageName: string;
    }[];
  }) {
    const { projectId } = options;
    super({ projectId, description: 'Named App', name: projectId });
    this.appEngine = new AppEngine({ projectId });
    this.defaultService = new NamedNodejsService(``);
  }

  public async create() {
    await this.appEngine.create();
  }
}
