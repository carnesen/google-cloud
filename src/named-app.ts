import { Asset } from './asset';
import { AppEngine } from './app-engine';
import { NamedNodejsService } from './named-nodejs-service';

export type Props = {
  nodejs: {
    serviceName: string;
    packageName: string;
  }[];
};

export class NamedApp extends Asset<Props> {
  public async create() {
    const appEngine = this.factory(AppEngine, { name: this.context.projectId });
    await appEngine.create();
    const defaultService = this.factory(NamedNodejsService, {
      serviceName: 'default',
      packageName: '@carnesen/redirector',
    });
    await defaultService.create();
    for (const options of this.props.nodejs) {
      const nodejsService = this.factory(NamedNodejsService, options);
      await nodejsService.create();
    }
  }
}
