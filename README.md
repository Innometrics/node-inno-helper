# node-inno-helper

For more info read [API reference](http://public.innomdc.com/node-helper/)

## Changelog

### [0.0.11] - 2016-04-27
- Method ```getProfileFromRequest``` was returning "dirty" profile, which is going to be send to Profile Cloud, even though nothing was changed
- Updated documentation for method ```mergeProfiles```

### [0.0.12] - 2017-01-16
- Schema validation bugfix.

### [0.0.13] - 2017-02-07
- Preparing for remove the modifiedAt properties.
- Migrate from jshint + jscs to eslint.

### [0.0.14] - 2017-02-07
- Return back compatibility with older version Js after 0.0.12 release.

### [0.0.15] - 2017-05-22
- Added support Scheduler API

### [0.0.16] - 2017-06-13
- Added delay parameter for the Scheduler API

### [0.0.17] - 2017-06-26
- Added validation in methods for the Scheduler API
- Added unit tests for methods for Scheduler API

### [0.0.18] - 2017-11-20
- Added method getting list of tasks

### [0.0.20] - 2017-11-23
- Fixed broken compatibilities with older versions Node.js after last release
