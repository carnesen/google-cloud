import { promisify } from 'util';
import { execFile } from 'child_process';
import { logFactory } from './util';

export interface Context {
  projectId: string;
  zoneName: string;
}

export type BaseProps = {
  name: string;
};

export type AllProps<P> = BaseProps & P;

export interface IAsset<P> {
  context: Context;
  props: AllProps<P>;
}

export class Asset<P> implements IAsset<P> {
  public readonly context: Context;
  public readonly props: AllProps<P>;
  public readonly log: ReturnType<typeof logFactory>;

  public constructor(options: IAsset<P>) {
    this.context = options.context;
    this.props = options.props;
    this.log = logFactory(this.constructor.name, this.props.name);
  }

  public factory<P>(
    ctor: {
      new (options: IAsset<P>): IAsset<P>;
    },
    props: AllProps<P>,
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
