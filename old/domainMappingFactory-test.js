const { projectId, dnsName } = require('./constants-test');
const { runAndExit } = require('../src/util');

const domainMappingFactory = require('./domainMappingFactory');

const getDnsName = async () => dnsName;

const domainMapping = domainMappingFactory({
  projectId,
  getDnsName,
  resourceRecordFactory: () => {},
});

runAndExit(async () => {
  await domainMapping.create();
  await domainMapping.getResourceRecords();
});
