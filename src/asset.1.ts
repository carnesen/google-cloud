import { promisify } from 'util';
import { execFile } from 'child_process';
import { echo } from './util';

const messagesByMethodName = {
  creating: 'Creating...',
  created: 'Created',
  alreadyCreated: 'Already exists',
  maybeCreated: 'Maybe created',
  destroying: 'Destroying...',
  destroyed: 'Destroyed',
  alreadyDestroyed: 'Does not exist',
  maybeDestroyed: 'Maybe destroyed',
};

export type Log = { [P in keyof typeof messagesByMethodName]: () => void };

export type BaseProps = {
  name: string;
};

export type Props<T> = BaseProps & T;

export interface IAsset<T> {
  projectId: string;
  zoneName: string;
  props: Props<T>;
}

export type AssetFactoryConstructable<T> = {
  new (options: IAsset<T>): IAsset<T>;
};

export class Asset<T> implements IAsset<T> {
  public readonly projectId: string;
  public readonly zoneName: string;
  public readonly props: Props<T>;
  protected readonly log: Log;
  protected constructor(options: IAsset<T>) {
    this.projectId = options.projectId;
    this.zoneName = options.zoneName;
    this.props = options.props;

    const log: Partial<Log> = {};
    Object.entries(messagesByMethodName).forEach(([methodName, message]) => {
      log[methodName as keyof Log] = () =>
        echo(`${this.constructor.name} "${this.props.name}": ${message}`);
    });
    this.log = log as Log;
  }

  protected factory(ctor: AssetFactoryConstructable<T>, props: Props<T>) {
    const options: IAsset<T> = {
      props,
      projectId: this.projectId,
      zoneName: this.zoneName,
    };
    return new ctor(options);
  }

  protected async gcloud(options: { cwd?: string; args: string[] }) {
    const defaultArgs = [`--project=${this.projectId}`, '--quiet', '--format=json'];
    const allArgs = [...defaultArgs, ...options.args];
    const { stdout } = await promisify(execFile)('gcloud', allArgs, { cwd: options.cwd });
    if (!stdout) {
      return {};
    }
    return JSON.parse(stdout);
  }
}
