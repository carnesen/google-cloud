import { NamedApp, NamedAppOptions } from './app';
import { runAndExit, gcloud } from './util';

const projectId = 'carnesen-tmp';

const options: NamedAppOptions = {
  projectId,
  domainName: 'carnesen-tmp.com.',
  services: [
    {
      serviceName: 'meme-me',
      packageName: 'meme-me',
    },
  ],
};

const testApp = new NamedApp(options);

runAndExit(async () => {
  // return await gcloudFactory({ projectId })('version');
  await testApp.create();
});
