import { NamedApp } from './app';

describe(__filename, () => {
  describe('instantiation', () => {
    it('getGitHash returns a ten-character hash', async () => {
      const namedApp = new NamedApp({ projectId: 'foo', services: [] });
    });
  });
});
