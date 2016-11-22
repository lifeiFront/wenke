'use strict';

var path = require('path');
var utils = require('./utils');
var fs = require('fs');
var path = require('path');
var file = require('./file.js');
var async = require('async');
global.hotTag = '?hot=true';

/**
 *
 * @param options
 */
function init(options) {
    var webappDirectory = options.webappDirectory;

    if (webappDirectory && typeof webappDirectory == 'string') {
        if (!fs.existsSync(webappDirectory)) {
            console.log('can\'t find the webapp directory ' + webappDirectory);
            process.exit();
        }
    } else {
        console.log('can\'t find the arugment -w, this argument is webapp directory!');
        process.exit();
    }

    global.webappDirectory = path.resolve(webappDirectory);
    global.templateViewSrcPagePath = path.join(global.webappDirectory, '/view/src/');

    //if no webapp directory, then exit;
    if (!fs.existsSync(global.templateViewSrcPagePath)) {
        console.log('without: errors');
        process.exit();
    }

    var staticFilesDirectory = options.staticFilesDirectory;

    if (staticFilesDirectory && typeof staticFilesDirectory == 'string') {
        if (!fs.existsSync(staticFilesDirectory)) {
            console.log('can\'t find the static files directory ', staticFilesDirectory);
            process.exit();
        }
    } else {
        console.log('can\'t find the arugment -s, this argument is webapp static file directory!');
        process.exit();
    }

    global.staticDirectory = utils.normalizePath(path.resolve(staticFilesDirectory));

    if (!fs.existsSync(path.join(global.staticDirectory, 'src'))) {
        console.log("can't find 'src' directory in staticDirectory ");
        process.exit();
    }

    global.debugDomain = typeof options.debugDomain == 'string' ? options.debugDomain : /\$\{.+?\}/ig;

    global.deployDomain = typeof options.deployDomain == 'string' ? options.deployDomain : 'http://static.cdn.com/';

    global.imgDeployDomain = typeof options.imgDeployDomain == 'string' ? options.imgDeployDomain : 'http://img.cdn.com/';

    global.srcPrefix = '/src/';

    global.deployPrefix = '/deploy/';

    global.cdnRootDirName = typeof options.cdnRootDirName == 'string' ? options.cdnRootDirName.replace(/[\\|\/]/ig, '') : 'static';

    global.local = utils.hasArgument(process.argv, '--local') ? true : false;

    global.jsCompileList = [];

    global.staticFilesMapArray = [];

    global.staticFilesMapHash = {};

    global.imageExtList = ['.jpg', '.png', '.gif', '.jpeg', 'bmp'];

    var templateDirPath = path.join(global.webappDirectory, '/view/');

    global.templateDir = templateDirPath;

    global.templateSrcFileList = file.getAllFilesByDir(path.join(templateDirPath, 'src'), [], ['.vm', '.html', '.jetx']);

    global.md5Length = 7;

    if (!fs.existsSync(path.resolve(templateDirPath))) {
        console.log('template directory ', templateDirPath, ' is not exists!');
        process.exit();
    }

    global.staticUrlMapPath = path.join(global.webappDirectory, 'static_url.ini');

    if (!fs.existsSync(global.staticUrlMapPath)) {
        fs.writeFileSync(global.staticUrlMapPath, '');
    }

    if (!(global.deployDomain.indexOf('http') > -1 || global.deployDomain.indexOf('https') > -1)) {
        console.log('--deploy-domain must starts with "http" or "https" !');
        process.exit();
    }

    var deployDomainSuffix = global.deployDomain.substr(global.deployDomain.length - 1, 1);
    if (!(deployDomainSuffix == '/' || deployDomainSuffix == '\\')) {
        global.deployDomain += '/';
    }

    global.deployDomain += global.cdnRootDirName;
    global.imgDeployDomain += global.cdnRootDirName;

    _getCSSAndJSCompileList();
}

var cssAndJSCacheList = {};
global.cssCompileList = [];
/**
 *
 */
function _getCSSAndJSCompileList() {
    var startTime = new Date();
    var regexpStaticFilesPrefix = utils.getRegexpStaticFilesPrefix();

    global.templateSrcFileList.forEach(function (tplPath) {
        var regexpScriptElements = /<script(((?![\r\n\+<])[\s\S\w\W])+)>[\s\S\w\W]{0,}?<\/script>/ig;
        var regexpScriptElementSrcAttrValue = /<script[\s\S\w\W]{1,}?src\="([\s\S\w\W]{1,}?)"[\s\S\w\W]{0,}?><\/script>/gi;

        var tplContent = fs.readFileSync(tplPath).toString();

        tplContent.replace(regexpScriptElements, function ($1, $2) {
            if ($2.indexOf('type="text/html"') > -1) {
                return $1;
            }

            if ($2.toLowerCase().indexOf('release="false"') > -1) {
                return $1;
            }

            $1.replace(regexpScriptElementSrcAttrValue, function ($2_1, $src) {
                if ($src.indexOf('http') != 0) {
                    var jsPath = $src.replace(regexpStaticFilesPrefix, '').replace('/src/js/', '').replace('/deploy/js/', '').replace(global.hotTag, '');
                    if (!cssAndJSCacheList[jsPath]) {
                        var isES6 = $2.toLowerCase().indexOf('babel="true"') > -1;
                        global.jsCompileList.push({"babel": isES6, "path": jsPath});
                        cssAndJSCacheList[jsPath] = true;
                    }
                }
            });
        });

        var regexpCSSLinkElements = /<link((?![\r\n>\+])[\s\S\w\W])+(rel\="stylesheet")((?![\r\n>\+])[\s\S\w\W])*>{1}?/gi;
        var regexpCSSHrefValue = /<link((?![\r\n>\+])[\s\S\w\W])+href\="((?![\r\n>\+])[\s\S\w\W]+?)"((?![\r\n>\+])[\s\S\w\W])*>{1}?/gi;

        tplContent.replace(regexpCSSLinkElements, function ($link) {
            $link.replace(regexpCSSHrefValue, function ($1, $2, $href) {
                var cssPath = $href.replace(regexpStaticFilesPrefix, '');
                if (!cssAndJSCacheList[cssPath]) {
                    if ($href && !($href.indexOf('http') == 0)) {
                        global.cssCompileList.push(cssPath);
                        cssAndJSCacheList[cssPath] = true;
                    }
                }

                return $1;
            });

            return $link;
        });
    });

    global.jsCompileList = utils.jsonArrayUnique(global.jsCompileList);

    var endTime = new Date();
    console.log('validate-complete: spend ' + (endTime - startTime) + ' ms!');
}

exports.init = init;