# **@carnesen/google-cloud** changelog

## Upcoming

## carnesen-google-cloud-0.4.0 (2023-01-28)

- Performance: Call `site.create` in parallel. This dramatically speeds up the deployment of a multi-site app.

## carnesen-google-cloud-0.3.0 (2022-02-26)

- Upgrade to Node.js 16 both in this project and in deployed App Engine ones

## 0.2.0 - 2020-09-13

### Added

- deployApp option requireResolve, passed into Asset

### Breaking

- Drop support for Node.js 10 for running _this_ library

### Internal

- Convert tabs to spaces in source code
- Update dependencies

## 0.1.0

### Breaking

- Drop support for Node.js 8 for using _this_ library
- Deploy siteType=nodejs as ~~nodejs8~~ nodejs12 runtime

### Internal

- Use ESLint instead of TSLint
- Use GitHub Action instead of Travis CI

## 0.0.0

Initial release
