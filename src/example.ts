import { runAndExit, App, SiteType } from '../src';

const projectId = 'carnesen-tmp';
const zoneName = 'carnesen-tmp-com';

const testApp = new App({
  context: {
    projectId,
    requireResolve: require.resolve,
  },
  props: [
    {
      zoneName,
      siteType: SiteType.nodejs,
      siteName: 'default',
      packageId: '@carnesen/redirector',
    },
    {
      zoneName,
      siteType: SiteType.static,
      siteName: 'www',
      packageId: '@carnesen/www',
    },
    {
      zoneName,
      siteType: SiteType.nodejs,
      siteName: 'meme-me',
      packageId: '@carnesen/meme-me',
    },
  ],
});

if (require.main === module) {
  runAndExit(async () => {
    await testApp.create();
  });
}
