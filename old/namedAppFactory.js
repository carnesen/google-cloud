const domainMappingFactory = require('./domainMappingFactory');
const managedZoneFactory = require('./managedZoneFactory');
const serviceFactory = require('./serviceFactory');
const appFactory = require('./appFactory');

const namedAppFactory = ({ projectId, managedZoneName }) => {
  const managedZone = managedZoneFactory({ projectId, managedZoneName });
  const app = appFactory({ projectId });

  const namedServiceFactory = ({ packageDir, serviceName }) => {
    const domainMapping = domainMappingFactory({
      projectId,
      getDnsName: async () => {
        const dnsName = await managedZone.getDnsName();
        if (serviceName === 'default') {
          return dnsName;
        }
        return `${serviceName}.${dnsName}`;
      },
      resourceRecordFactory: managedZone.resourceRecordFactory,
    });

    const service = serviceFactory({ projectId, packageDir, serviceName });

    const create = async () => {
      await service.create();
      await domainMapping.create();
      const resourceRecords = await domainMapping.getResourceRecords();
      for (const resourceRecord of resourceRecords) {
        await resourceRecord.create();
      }
    };

    return {
      create,
    };
  };

  const create = async () => {
    await app.create();
  };

  return {
    create,
    namedServiceFactory,
  };
};

module.exports = namedAppFactory;
