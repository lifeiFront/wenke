'use strict';

var path = require('path');
var fs = require('fs');
var validate = require('./lib/validate');
var cssCompile = require('./lib/css-compile.js');
var jsCompile = require('./lib/js-compile.js');
var tplCompile = require('./lib/tpl-compile.js');
var cdn = require('./lib/cdn.js');
var gulp = require('gulp');
var utils = require("./lib/utils");

exports = module.exports = function (options) {
	validate.init(options);

	gulp.task('clean', function () {
		return utils.delFiles();
	});

	gulp.task('css-compile', ['clean'], function () {
		return cssCompile.compile();
	});

	gulp.task('js-compile', ['css-compile'], function (cb) {
		return jsCompile.compile(cb);
	});

	gulp.task('tpl-compile', ['js-compile'], function (cb) {
		return tplCompile.compile(cb);
	});

	if (!utils.hasArgument(process.argv, '--local')) {
		gulp.task('cdn-publish', ['tpl-compile'], function (cb) {
			return cdn.publish(cb);
		});
	}

	gulp.start();
};