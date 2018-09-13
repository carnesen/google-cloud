const childProcess = require('child_process');
const util = require('util');

const execFile = util.promisify(childProcess.execFile);

const echo = (...args) => {
  console.log(...args); // eslint-disable-line no-console
};

const createLogger = (description, name) => {
  const echoer = (...args) => (...moreArgs) => {
    echo(`${description} "${name}":`, ...args, ...moreArgs);
  };

  return {
    info: echoer(),
    creating: echoer('Creating...'),
    created: echoer('Created'),
    alreadyCreated: echoer('Already exists'),
    maybeCreated: echoer('Maybe created'),
    destroying: echoer('Destroying...'),
    destroyed: echoer('Destroyed'),
    alreadyDestroyed: echoer('Does not exist'),
    maybeDestroyed: echoer('Maybe destroyed'),
  };
};

async function runAndExit(func) {
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
}

async function runGcloudCli(projectId, args, options) {
  const defaultArgs = [`--project=${projectId}`, '--quiet', '--format=json'];
  const allArgs = [...defaultArgs, ...args];

  const { stdout } = await execFile('gcloud', allArgs, options);
  if (!stdout) {
    return {};
  }
  return JSON.parse(stdout);
}

async function getGitHash() {
  const { stdout } = await execFile('git', ['rev-parse', '--short=10', 'HEAD'], {
    encoding: 'utf8',
  });
  return stdout.replace(/\n/g, '');
}

const stripRootLabel = dnsName => dnsName.replace(/\.$/, '');

module.exports = {
  createLogger,
  echo,
  getGitHash,
  runAndExit,
  runGcloudCli,
  stripRootLabel,
};
