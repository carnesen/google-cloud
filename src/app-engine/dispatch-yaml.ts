import { removeTrailingDot } from '../util';
import { Asset } from '../asset';
import { promisify } from 'util';
import { writeFile } from 'fs';
import { dump } from 'js-yaml';

export type Props = {
  data: {
    serviceName: string;
    domainName: string;
  }[];
};

export class AppEngineDispatchYaml extends Asset<Props> {
  public get name() {
    return process.cwd();
  }
  public async create() {
    this.log.creating();
    const fileName = 'dispatch.yaml';
    await promisify(writeFile)(
      fileName,
      dump({
        dispatch: this.props.data.map(({ serviceName, domainName }) => ({
          url: `${removeTrailingDot(domainName)}/*`,
          service: serviceName,
        })),
      }),
    );
    await this.gcloud({ args: ['app', 'deploy', fileName] });
    this.log.created();
  }
}
