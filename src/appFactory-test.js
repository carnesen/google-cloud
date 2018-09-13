const { projectId } = require('./constants-test');
const { runAndExit } = require('./util');

const appFactory = require('./appFactory');

const app = appFactory({
  projectId,
});

runAndExit(async () => {
  await app.create();
});
