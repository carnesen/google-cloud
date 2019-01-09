import { deployApp } from '.';

// In the context of this library is an "App" is a Google Cloud
// App Engine "App", which is comprised of one or more websites.
deployApp({
  projectId: 'carnesen-tmp',
  zoneName: 'carnesen-tmp-com',
  defaultSite: {
    siteType: 'nodejs',
    packageId: '@carnesen/redirector',
  },
  otherSites: [
    {
      siteType: 'static',
      siteName: 'www',
      packageId: '@carnesen/www',
    },
    {
      siteType: 'nodejs',
      siteName: 'meme-me',
      packageId: '@carnesen/meme-me',
    },
  ],
});
