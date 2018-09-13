const { runAndExit } = require('./util');
const namedAppFactory = require('./namedAppFactory');

const carnesenDotCom = namedAppFactory({
  projectId: 'carnesen-209303',
  managedZoneName: 'carnesen',
});

module.exports = {
  carnesenDotCom,
  runAndExit,
};
