# node-inno-helper

For more info read [API reference](http://public.innomdc.com/node-helper/)

## Changelog

### [0.0.11] - 2016-04-27
- Method ```getProfileFromRequest``` was returning "dirty" profile, which is going to be send to Profile Cloud, even though nothing was changed
- Updated documentation for method ```mergeProfiles```