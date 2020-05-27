# @carnesen/google-cloud [![build status badge](https://github.com/carnesen/google-cloud/workflows/test/badge.svg)](https://github.com/carnesen/google-cloud/actions?query=workflow%3Atest+branch%3Amaster) [![npm version badge](https://badge.fury.io/js/%40carnesen%2Fgoogle-cloud.svg)](https://www.npmjs.com/package/@carnesen/google-cloud)

A Node.js library for deploying websites and Node.js services to Google Cloud Platform (GCP) using Google App Engine

## Features
This library can be used to automate the deployment of [static websites](https://en.wikipedia.org/wiki/Static_web_page) and [Node.js services](https://en.wikipedia.org/wiki/Node.js) to GCP with minimal configuration and just a handful of conventions. Its features include:

- Custom domains
- [https](https://en.wikipedia.org/wiki/HTTPS)
- Version management
- Low cost
- High availability

## Install
```
npm install @carnesen/google-cloud
```
The package includes runtime JavaScript files suitable for Node.js >=8 as well as the corresponding TypeScript type declarations. There are also a number of one-time manual setup steps that you'll need to do if you haven't already:

#### Create a project
Sign in to the [Google Cloud console](https://console.cloud.google.com) and create a new ["project"](https://console.cloud.google.com/project) and note its "project ID", which you'll need later.

#### Purchase a domain name
Use [Google Domains](https://domains.google) or any other [registrar](https://en.wikipedia.org/wiki/Domain_name_registrar) to purchase a top-level domain, e.g. "example.com". Your sites and services will be served at the apex "example.com" and on subdomains "www.example.com". 

#### Create a Cloud DNS zone
In the [Google Cloud console](https://console.cloud.google.com), navigate to "Network Services" > "Cloud DNS". Follow the prompts to create a new public "zone". Note its "zone name", which you'll need later.

#### Delegate name resolution to Google Cloud
In the [Google Cloud console](https://console.cloud.google.com), navigate to "Network Services" > "Cloud DNS". Click on the "Registrar Setup" link in the upper right-hand corner. This reveals the "NS" (name server) records for your managed zone. Copy these NS records over to your domain registrar. Details differ by provider. [Here's how to do it with Google Domains](https://support.google.com/domains/answer/3290309?hl=en).

#### [Install the Google Cloud SDK](https://cloud.google.com/sdk/install)
When the SDK is properly installed you should see, e.g.:
```
$ gcloud -v
Google Cloud SDK 232.0.0
bq 2.0.40
core 2019.01.27
gsutil 4.35
```

#### `gcloud auth login`
Sets authentication credentials for the `gcloud` command-line utility

#### `gcloud auth application-default login`
Sets ["Application Default Credentials"](https://cloud.google.com/docs/authentication/production#providing_credentials_to_your_application) for use by the `@google-cloud` Node.js SDKs.

#### `gcloud config set project <project id>`
Set the current active "project" for the `gcloud` CLI.

#### `gcloud app create`
Follow the prompts to initialize your project for "App Engine". You'll be asked to choose a region for your app. This cannot be changed later.

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

### deployApp({projectId, zoneName, defaultSite, otherSites?)
Deploys one or more sites to Google Cloud
#### projectId
`string`. Unique identifier for a Google Cloud project
#### zoneName
`string`. Unique identifier for a Cloud DNS zone. In some places documentation, this referred to as "zone ID".
#### defaultSite
```ts
{
  siteType: 'nodejs' | 'static';
  packageId: string;
}
```
`packageId` can be a relative path like `../sites/site-x` or a package name like `@carnesen/redirector`. By convention the "default site" is the "apex" of the domain. For example if your domain name is "example.com" then your "default site" is "example.com".

#### otherSites
Optional.
```ts
{
  siteType: 'nodejs' | 'static';
  packageId: string;
  siteName: string;
}[];
```

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
