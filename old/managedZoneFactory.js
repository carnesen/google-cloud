const GoogleCloudDns = require('@google-cloud/dns');

const { createLogger } = require('../src/util');

const managedZoneFactory = ({ projectId, managedZoneName }) => {
  const googleCloudDns = new GoogleCloudDns({
    projectId,
  });

  const googleCloudZone = googleCloudDns.zone(managedZoneName);

  const getDnsName = async () => {
    if (!googleCloudZone.metadata.dnsName) {
      await googleCloudZone.get();
    }
    return googleCloudZone.metadata.dnsName;
  };

  const resourceRecordFactory = ({ name, type, data }) => {
    const log = createLogger('record set', name);
    const googleCloudRecord = googleCloudZone.record(type, {
      name,
      data,
      ttl: 300,
    });
    const create = async () => {
      log.creating();
      try {
        await googleCloudZone.addRecords(googleCloudRecord);
        log.created();
      } catch (ex) {
        if (!ex.message.includes('already exists')) {
          throw ex;
        } else {
          log.alreadyCreated();
        }
      }
    };
    const destroy = async () => {
      log.destroying();
      try {
        await googleCloudZone.deleteRecords(googleCloudRecord);
        log.destroyed();
      } catch (ex) {
        if (!ex.message.includes('does not exist')) {
          throw ex;
        } else {
          log.alreadyDestroyed();
        }
      }
    };
    return {
      create,
      destroy,
    };
  };

  return {
    getDnsName,
    resourceRecordFactory,
  };
};

module.exports = managedZoneFactory;
