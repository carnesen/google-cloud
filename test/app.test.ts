import { NamedApp } from '../src/app';

describe(__filename, () => {
  describe('instantiation', () => {
    it('creates a new NamedApp', async () => {
      const namedApp = new NamedApp({
        projectId: 'foo',
        domainName: 'foo.com.',
        services: [],
      });
    });
  });
});
