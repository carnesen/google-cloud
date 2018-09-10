import * as childProcess from 'child_process';

export function getGitHash() {
  return childProcess
    .execFileSync('git', ['rev-parse', '--short=10', 'HEAD'], {
      encoding: 'utf8'
    })
    .replace(/\n/g, '');
}
