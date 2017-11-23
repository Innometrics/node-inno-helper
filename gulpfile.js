'use strict';

var pack = require('./package.json'),
    gulp = require('gulp'),
    JsDuck = require('jsduck');

var sources = [
    'libs/index.js',
    'libs/profile.js',
    'libs/cache.js'
];

gulp.task('generate-docs', function () {
    var jsDuck = new JsDuck(['--output', 'docs/' + pack.version, '--categories', 'defines.json']);
    var result = jsDuck.doc(sources);
    if (result.status === 0) {
        console.error(result.stderr.toString());
    }
});
