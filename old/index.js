const { runAndExit } = require('../src/util');
const namedAppFactory = require('../src/namedAppFactory');

const carnesenDotCom = namedAppFactory({
  projectId: 'carnesen-209303',
  managedZoneName: 'carnesen',
});

module.exports = {
  carnesenDotCom,
  runAndExit,
};
