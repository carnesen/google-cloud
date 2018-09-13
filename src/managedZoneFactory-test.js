const { projectId, managedZoneName } = require('./constants-test');
const { runAndExit, echo } = require('./util');

const managedZoneFactory = require('./managedZoneFactory');

const managedZone = managedZoneFactory({
  projectId,
  managedZoneName,
});

runAndExit(async () => {
  const dnsName = await managedZone.getDnsName();
  echo('dnsName', dnsName);
  const record = managedZone.recordFactory({
    dnsName: `www.${dnsName}`,
    recordType: 'A',
    data: ['1.2.3.4'],
  });
  await record.destroy();
  await record.create();
  await record.create();
  await record.destroy();
  await record.destroy();
});
