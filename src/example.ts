import { runAndExit } from '../src';
import { NamedApp } from './named-app';

const projectId = 'carnesen-tmp';

const testApp = new NamedApp({
  projectId,
  nodejsServices: [
    {
      serviceName: 'www',
      packageName: 'meme-me',
    },
  ],
});

runAndExit(async () => {
  await testApp.create();
});
