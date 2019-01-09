# @carnesen/google-cloud [![Build Status](https://travis-ci.com/carnesen/google-cloud.svg?branch=master)](https://travis-ci.com/carnesen/google-cloud)

A Node.js library for deploying websites to Google Cloud Platform

## Install

```
npm install @carnesen/google-cloud
```

## Setup

- Install the [Google Cloud SDK](https://cloud.google.com/sdk/), and make sure the `gcloud` command-line utility is on your [PATH](https://en.wikipedia.org/wiki/PATH_(variable)) with valid credentials initialized on your system.

- Purchase a domain name using [Google Domains](https://domains.google) or any other [registrar](https://en.wikipedia.org/wiki/Domain_name_registrar).

- Sign in to the [Google Cloud console](https://console.cloud.google.com) and create a new ["project"](https://console.cloud.google.com/project) taking note of the project ID.

- Navigate to "Network Services" > "Cloud DNS". Click "Create zone" and follow the prompts to create a new public Cloud DNS Zone for your domain name. Take note of the "zone name".

- Still in Cloud DNS, click on the "Registrar Setup" link in the upper right-hand corner. You'll need to configure those "NS" (name server) records with your domain registrar.

## Usage

```js
// deploy.js
const { deployApp } = require('@carnesen/google-cloud');

// In the context of this library is an "App" is a Google Cloud
// App Engine "App", which is comprised of one or more websites
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
```

Invoking that Node.js script looks like:

```
$ node deploy.js
AppEngine : carnesen-tmp : Creating...
AppEngine : carnesen-tmp : Already exists
Site : default : Pre-validating...
Site : www : Pre-validating...
Site : meme-me : Pre-validating...
...
```

## API

### deployApp(options)
An `async` function that takes an object of type `DeployAppOptions` and deploys one or more sites to Google Cloud. 

```ts
type DeployAppOptions = {
  projectId: string;
  zoneName: string;
  defaultSite: {
    siteType: 'nodejs' | 'static';
    packageId: string;
  };
  otherSites?: {
    siteType: 'nodejs' | 'static';
    packageId: string;
    siteName: string;
  }[];
  requireResolve?: typeof require.resolve;
};
```
#### projectId
The globally unique identifier for the Google Cloud project to which the websites should be deployed.

#### zoneName
The unique "zone name" identifier for the Cloud DNS zone for your custom domain. In some places in the Google Cloud API and documentation, this is referred to as the "zone ID".

#### defaultSite
In the parlance of Google App Engine, an app is made up of one or more "services". The required service is called the "default" service. In the parlance of this project, that's the "default site". There's a one-to-one correspondence between App Engine "services" and `@carnesen/google-cloud` "sites", but a site has other things associated with it too such as Cloud DNS records. The "default site" serves the "apex" of the domain. In the example above, the default site is a Node.js service [`@carnesen/redirector`](https://github.com/carnesen/redirector) that redirects domain apex requests to the www subdomain. [Try it on carnesen.com!](https://carnesen.com).

#### siteType
`'nodejs'` or `'static'`

#### packageId
Indicates a module that contains the site code/content to be deployed. `@carnesen/google-cloud` uses the internal `require()` machinery of Node.js to look up the location of the module. So as with any `require` statement, `packageId` can be a relative path like `../sites/site-x` or a package name like `@carnesen/redirector`. If you don't want to `npm publish` your sites, keep in mind that `npm` allows dependencies to be specified [as GitHub URLs](https://docs.npmjs.com/files/package.json#github-urls).

#### otherSites
Only the default site is required, but an App Engine app can contain other services/sites too. Each object item in the `otherSites` array has the same `siteType` and `packageId` properties as `defaultSite` as well as an additional property `siteName`. If your domain name is "carnesen.com" and `siteName` is `'meme-me'`, that site will be deployed to [meme-me.carnesen.com](https://meme-me.carnesen.com/).

## Conventions

This project favors convention over configuration...

### nodejs

### static

## Related
- [@carnesen/cli](https://github.com/carnesen/cli): A library for building Node.js command-line interfaces
- [@carnesen/tslint-config](https://github.com/carnesen/tslint-config): TSLint configurations for `@carnesen` projects
- [@carnesen/tsconfig](https://github.com/carnesen/tsconfig): TypeScript configurations for `@carnesen` projects

## License

MIT © [Chris Arnesen](https://www.carnesen.com)
