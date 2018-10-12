const { runGcloudCli, createLogger, stripRootLabel } = require('../src/util');

const domainMappingFactory = ({ projectId, getDnsName, resourceRecordFactory }) => {
  const create = async () => {
    const dnsName = await getDnsName();
    const log = createLogger('domain mapping', dnsName);
    log.creating();
    try {
      await runGcloudCli(projectId, [
        'app',
        'domain-mappings',
        'create',
        stripRootLabel(dnsName),
      ]);
    } catch (ex) {
      if (!ex.message.includes('already exists')) {
        throw ex;
      } else {
        log.alreadyCreated();
      }
    }
  };

  const getResourceRecords = async () => {
    const dnsName = await getDnsName();
    const description = await runGcloudCli(projectId, [
      'app',
      'domain-mappings',
      'describe',
      stripRootLabel(dnsName),
    ]);
    // Note the resource records returned don't have CNAME value in proper canonical form
    return description.resourceRecords.map(({ rrdata, type }) =>
      resourceRecordFactory({
        type,
        data: type === 'CNAME' ? `${rrdata}.` : rrdata,
        name: dnsName,
      }),
    );
  };
  return {
    create,
    getResourceRecords,
  };
};

module.exports = domainMappingFactory;
