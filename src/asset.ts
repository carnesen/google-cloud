import { promisify } from 'util';
import { execFile } from 'child_process';
import { echo } from './util';

export interface Context {
  projectId: string;
  zoneName: string;
}

export interface IAsset<P> {
  context: Context;
  props: P;
}

export const logFactory = (instance: { name: string; constructor: { name: string } }) => {
  const e = (message: string) => () =>
    echo(`${instance.constructor.name} : ${instance.name} : ${message}`);

  return {
    info: (message: string) => e(message)(),
    creating: e('Creating...'),
    created: e('Created'),
    alreadyCreated: e('Already exists'),
    maybeCreated: e('Maybe created'),
    destroying: e('Destroying...'),
    destroyed: e('Destroyed'),
    alreadyDestroyed: e('Does not exist'),
    maybeDestroyed: e('Maybe destroyed'),
  };
};

export class Asset<P> implements IAsset<P> {
  public readonly context: Context;
  public readonly props: P;
  public readonly log: ReturnType<typeof logFactory>;

  public constructor(options: IAsset<P>) {
    this.context = options.context;
    this.props = options.props;
    this.log = logFactory(this);
  }

  public get name(): string {
    return '"name" getter should be overridden by subclass';
  }

  public factory<P, A>(
    ctor: {
      new (options: IAsset<P>): A;
    },
    props: P,
  ) {
    return new ctor({ context: this.context, props });
  }

  public async gcloud(options: { cwd?: string; args: string[] }) {
    const defaultArgs = [
      `--project=${this.context.projectId}`,
      '--quiet',
      '--format=json',
    ];
    const allArgs = [...defaultArgs, ...options.args];
    const { stdout } = await promisify(execFile)('gcloud', allArgs, { cwd: options.cwd });
    if (!stdout) {
      return {};
    }
    return JSON.parse(stdout);
  }
}
