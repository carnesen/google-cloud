import { execFile } from 'child_process';
import { promisify } from 'util';
import pkgDir = require('pkg-dir');
import is from '@sindresorhus/is';

const execFileAsync = promisify(execFile);

export const echo = (data: any) => {
  if (process.env.NODE_ENV !== 'test') {
    // tslint-disable-next-line no-console
    console.log(data);
  }
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
    process.exit(0);
  } catch (err) {
    echo('Failed :(');
    echo(err.message);
    echo(err.stack);
    process.exit(1);
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

export const resolvePackageDir = (packageName: string) => {
  const packageDir = pkgDir.sync(require.resolve(packageName));
  if (is.null_(packageDir)) {
    throw new Error(`Failed to find package directory for "${packageName}"`);
  }
  return packageDir;
};
