import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export const echo = (data: any) => {
  if (process.env.NODE_ENV !== 'test') {
    // tslint-disable-next-line no-console
    console.log(data);
  }
};

export const getGitHash = async (cwd?: string) => {
  const { stdout } = await execFileAsync('git', ['rev-parse', '--short=10', 'HEAD'], {
    encoding: 'utf8',
    cwd,
  });
  return stdout.replace(/\n/g, '');
};

export const removeTrailingDot = (s: string) => s.replace(/\.$/, '');
export const addTrailingDot = (s: string) => (s.slice(-1) === '.' ? s : `${s}.`);
