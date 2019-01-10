# @carnesen/google-cloud [![Build Status](https://travis-ci.com/carnesen/google-cloud.svg?branch=master)](https://travis-ci.com/carnesen/google-cloud)

A Node.js library for deploying websites to Google Cloud Platform

## Features
This library can be used to automate the deployment of [static websites](https://en.wikipedia.org/wiki/Static_web_page) and Node.js services to Google Cloud Platform (GCP) with minimal configuration and just a handful of conventions. Its features include:

- Custom domains
- [https](https://en.wikipedia.org/wiki/HTTPS)
- Version management
- Low cost
- High availability

## Install
```
npm install @carnesen/google-cloud
```
The package includes runtime JavaScript files suitable for Node.js >=8 as well as the corresponding TypeScript type declarations. In addition to installing this library from npm, you'll also need to do the following one-time steps if you haven't already:

- Install the [Google Cloud SDK](https://cloud.google.com/sdk/), and make sure the `gcloud` command-line utility is on your [PATH](https://en.wikipedia.org/wiki/PATH_(variable)) with valid credentials initialized on your system.

- Purchase a domain name using [Google Domains](https://domains.google) or any other [registrar](https://en.wikipedia.org/wiki/Domain_name_registrar).

- Sign in to the [Google Cloud console](https://console.cloud.google.com) and create a new ["project"](https://console.cloud.google.com/project) and note its "project ID", which you'll need later.

- In "Network Services" > "Cloud DNS", create a new public "zone" for your domain name, and take note of its "zone name", which you'll need later.

- Clicking on the "Registrar Setup" link in the upper right-hand corner of the Cloud DNS console reveals the "NS" (name server) records for your new zone. Copy these NS records over to your domain registrar. Details differ by provider, but [here's the help article for how to do it with Google Domains](https://support.google.com/domains/answer/3290309?hl=en).

## Usage

In the same way that your site leverages npm to version and install the library code that it uses, `@carnesen/google-cloud` leverages npm to version and install the site code that it deploys. This usage example assumes you've already completed the setup in the "Install" section above. We use npm to pull down the site code that we want to deploy:

```
npm install --save @carnesen/redirector @carnesen/www github:carnesen/meme-me @carnesen/run-and-exit
```

- [@carnesen/redirector](https://github.com/carnesen/redirector) is a Node.js service published to npm
- [@carnesen/www](https://github.com/carnesen/www) is a static site published to npm
- [github:carnesen/meme-me](https://github.com/carnesen/meme-me) is a Node.js site installed from GitHub as an [npm GitHub url](https://docs.npmjs.com/files/package.json#github-urls)
- [@carnesen/run-and-exit](https://github.com/carnesen/run-and-exit) is not site code, just a little helper that runs an async function then calls `process.exit`

For deploying a single site, your deployment code might even be co-located with the application code in which case you wouldn't need to `npm install` anything beyond `@carnesen/google-cloud`.

Create a Node.js script `deploy.js` with contents:

```js
const runAndExit = require('@carnesen/run-and-exit');
const { deployApp } = require('@carnesen/google-cloud');

// In the context of this library is an "App" is a Google Cloud
// App Engine "App", which is comprised of one or more websites
runAndExit(deployApp, {
  projectId: '<project id>',
  zoneName: '<zone name>',
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

And run it:

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
};
```
#### projectId
Unique identifier for a Google Cloud project

#### zoneName
Unique identifier for a Cloud DNS zone in the project identified by `projectId`. In some places in the Google Cloud API and documentation, the "zone name" is referred to as the "zone ID".

#### defaultSite
In the parlance of Google App Engine, an app is comprised of "services" one of which is the "default service". In the parlance of this project, that's the "default site". A "site" corresponds to a "service" together with other associated resources such as Cloud DNS records. By this project's conventions, the "default site" serves the "apex" domain of the zone, i.e. the domain that doesn't have a subdomain part. E.g. "example.com." is the [FQDN](https://en.wikipedia.org/wiki/Fully_qualified_domain_name) of the apex of the zone "example.com".

#### siteType
`'nodejs'` or `'static'`

#### packageId
Package name/location of site code/content to be deployed. Can be a relative path like `../sites/site-x` or a package name like `@carnesen/redirector`. Internally, `@carnesen/google-cloud` does the following to locate your site code:

```ts
const packageDir = path.dirname(require.resolve(`${packageId}/package.json`));
```
For example, right now for me in this project, `path.dirname(require.resolve('@carnesen/meme-me/package.json'))` resolves to `'/Users/carnesen/GitHub/google-cloud/node_modules/@carnesen/meme-me'`. Keep in mind that if you don't want to `npm publish` your sites/services, `npm` allows dependencies to be specified [as GitHub URLs](https://docs.npmjs.com/files/package.json#github-urls). Also, you can use [npm link](https://docs.npmjs.com/cli/link.html) to install local dependencies that are kept in sync automatically via symlinks.

#### otherSites
Only the default site is required, but an App Engine app can serve any number of other sites/services too. Each item in the `otherSites` array has the same `siteType` and `packageId` properties as `defaultSite` as well as an additional property `siteName` that defines the subdomain on which this site will be served. If the domain name is carnesen.com and `siteName` is `'meme-me'`, that site will be served at [meme-me.carnesen.com](https://meme-me.carnesen.com/).

## Conventions

This project favors convention over configuration, and hopefully the conventions will align pretty well with what you're already doing. As mentioned above, for both Node.js and static sites, the site content must be in a place where ``require.resolve(`${packageId}/package.json`)`` will return the path of a `package.json` file. That file's containing directory is what gets uploaded to Google Cloud App Engine using `gcloud app deploy`.

### nodejs
The package directory is uploaded to Google Cloud as-is. In particular that means that `npm start` should fire up your Node.js server process.

### static
Similar to Node.js sites, the package directory is uploaded to Google Cloud as-is. The root of the package, however, is not what gets served by App Engine. Instead by convention it's assumed that the `dist` subdirectory that contains the static content that you want to serve. If that convention doesn't suit you, please just let me know and I'd be happy to parameterize it.

## More information
This library doesn't have many unit tests, but I use it on a semi-regular basis to deploy sites to [carnesen.com](https://carnesen.com). To be sure, I don't get much traffic on those sites, but my GCP bill is typically less than a dollar a month! If you encounter any bugs or have any questions or feature requests, please don't hesitate to file an issue or submit a pull request on this project's repository on GitHub.

## Related
- [@carnesen/carnesen-dot-com](https://github.com/carnesen/carnesen-dot-com): Automates deployment of carnesen.com to Google Cloud Platform
- [@carnesen/cli](https://github.com/carnesen/cli): A library for building Node.js command-line interfaces
- [@carnesen/tslint-config](https://github.com/carnesen/tslint-config): TSLint configurations for `@carnesen` projects
- [@carnesen/tsconfig](https://github.com/carnesen/tsconfig): TypeScript configurations for `@carnesen` projects

## License

MIT © [Chris Arnesen](https://www.carnesen.com)
