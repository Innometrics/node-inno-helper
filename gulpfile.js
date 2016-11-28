'use strict';

var pack = require('./package.json'),
    gulp = require('gulp'),
    JsDuck = require('jsduck');

var sources = [
    "libs/index.js",
    "libs/profile.js",
    "libs/cache.js"
];

/*
var others = [
            "<script type='text/javascript'>",
            "Docs.otherProducts = [",
                "{text: 'MyDocs 3.0', href: 'http://example.com/docs/3.0'},",
                "{text: 'MyDocs 2.0', href: 'http://example.com/docs/2.0'},",
                "{text: 'MyDocs 1.0', href: 'http://example.com/docs/1.0'}",
            "];",
            "</script>"].join("");
var jsDuck = new JsDuck(["--output", "docs/" + pack.version, "--categories", "defines.json", "--body-html", others]);
*/
var jsDuck = new JsDuck(["--output", "docs/" + pack.version, "--categories", "defines.json"]);

gulp.task('generate-docs', function () {
    jsDuck.doc(sources);
});
