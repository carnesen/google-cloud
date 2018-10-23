import { runAndExit, App, SiteType } from '../src';

const projectId = 'carnesen-tmp';
const zoneName = 'carnesen-tmp-com';

const testApp = new App({
  context: {
    projectId,
  },
  props: [
    {
      zoneName,
      siteType: SiteType.static,
      siteName: 'www',
      packageName: '@carnesen/www',
    },
    {
      zoneName,
      siteType: SiteType.nodejs,
      siteName: 'meme-me',
      packageName: '@carnesen/meme-me',
    },
  ],
});

if (require.main === module) {
  runAndExit(async () => {
    await testApp.create();
  });
}
