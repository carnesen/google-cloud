import { NamedApp, NamedAppOptions, runAndExit } from '../src';

const projectId = 'carnesen-tmp';

const options: NamedAppOptions = {
  projectId,
  domainName: 'carnesen-tmp.com.',
  services: [
    {
      serviceName: 'www',
      packageName: 'meme-me',
    },
  ],
};

const testApp = new NamedApp(options);

runAndExit(async () => {
  // return await gcloudFactory({ projectId })('version');
  await testApp.create();
});
