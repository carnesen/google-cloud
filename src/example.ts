import { runAndExit } from '../src';
import { NamedApp } from './named-app';

const projectId = 'carnesen-tmp';
const zoneName = 'carnesen-tmp-com';

const testApp = new NamedApp({
  context: {
    projectId,
    zoneName,
  },
  props: {
    nodejs: [
      {
        serviceName: 'www',
        packageName: 'meme-me',
      },
    ],
  },
});

if (require.main === module) {
  runAndExit(async () => {
    await testApp.create();
  });
}
