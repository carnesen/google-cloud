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

export interface AssetConstructorOptions {}

export class Asset {
  protected readonly projectId: string;
  protected readonly log: Log;
  protected constructor(options: {
    projectId: string;
    description: string;
    name: string;
  }) {
    this.projectId = options.projectId;
    const log: Partial<Log> = {};
    Object.entries(messagesByMethodName).forEach(([methodName, message]) => {
      log[methodName as keyof Log] = () =>
        echo(`${options.description} "${options.name}": ${message}`);
    });
    this.log = log as Log;
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
