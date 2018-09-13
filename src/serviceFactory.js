const fs = require('fs');
const path = require('path');
const util = require('util');

const yaml = require('js-yaml');

const { createLogger, runGcloudCli } = require('./util');

const writeFile = util.promisify(fs.writeFile);

const serviceFactory = ({ projectId, packageDir, serviceName }) => {
  const log = createLogger('service', serviceName);
  const create = async () => {
    log.creating();
    await writeFile(
      path.join(packageDir, 'app.yaml'),
      yaml.dump({
        runtime: 'nodejs8',
        env: 'standard',
        service: serviceName,
        instance_class: 'B1',
        basic_scaling: {
          max_instances: 3,
        },
      }),
    );

    await runGcloudCli(projectId, ['app', 'deploy'], {
      cwd: packageDir,
    });
    log.created();
  };

  return {
    create,
  };
};

module.exports = serviceFactory;
