const { region } = require('./constants');
const { createLogger, runGcloudCli } = require('./util');

const appFactory = ({ projectId }) => {
  const log = createLogger('app', projectId);

  const create = async () => {
    try {
      log.creating();
      await runGcloudCli(projectId, ['app', 'create', `--region=${region}`]);
      log.created();
    } catch (ex) {
      if (!ex.message.includes('already contains')) {
        throw ex;
      }
      log.alreadyCreated();
    }
  };

  return {
    create,
  };
};

module.exports = appFactory;
