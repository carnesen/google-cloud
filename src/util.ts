import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

// tslint-disable-next-line no-console
const echo = (data: any) => console.log(data);

export const createLogger = (description: string, name: string) => {
  const e = (message: string) => () => echo(`${description} "${name}": ${message}`);

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

type AsyncFunc = (...args: any[]) => Promise<any>;

export const runAndExit = async (func: AsyncFunc) => {
  try {
    const value = await func();
    if (value) {
      echo(value);
    } else {
      echo('Success :)');
    }
    process.exit(0); // eslint-disable-line no-process-exit
  } catch (err) {
    echo('Failed :(');
    echo(err.message);
    echo(err.stack);
    process.exit(1); // eslint-disable-line no-process-exit
  }
};

export type GcloudOptions = {
  projectId?: string;
  cwd?: string;
  args: string[];
};

export const gcloud = async ({ projectId, cwd, args }: GcloudOptions) => {
  const defaultArgs = ['--quiet', '--format=json'];
  if (projectId) {
    defaultArgs.push(`--project=${projectId}`);
  }
  const allArgs = [...defaultArgs, ...args];
  const { stdout } = await execFileAsync('gcloud', allArgs, { cwd });
  if (!stdout) {
    return {};
  }
  return JSON.parse(stdout);
};

export const getGitHash = async (cwd?: string) => {
  const { stdout } = await execFileAsync('git', ['rev-parse', '--short=10', 'HEAD'], {
    encoding: 'utf8',
    cwd,
  });
  return stdout.replace(/\n/g, '');
};

export const removeTrailingDot = (s: string) => s.replace(/\.$/, '');
