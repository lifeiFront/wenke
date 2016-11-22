'use strict';

var path = require('path');
var fs = require('fs');
var file = require('./file.js');
var utils = require('./utils');
var async = require('async');

global.cssConcatListMap = global.cssConcatListMap || {};
global.cacheBackgroundImageList = global.cacheBackgroundImageList || {};

function compile(cb) {
    var start = new Date();
    async.map(templateSrcFileList, function (tplPath, callback) {
        var tplDeployDir = path.dirname(tplPath);
        tplDeployDir = utils.normalizePath(path.join(tplDeployDir, '/'));

        var position = tplDeployDir.lastIndexOf(global.srcPrefix);
        tplDeployDir = tplDeployDir.substring(0, position) + global.deployPrefix + tplDeployDir.substring(position + global.srcPrefix.length, tplDeployDir.length);

        file.mkdirRecursive(tplDeployDir);

        var html = fs.readFileSync(tplPath).toString();

        var regexpCSSLinkElements = /<link((?![\r\n>\+])[\s\S\w\W])+(rel\="stylesheet")((?![\r\n>\+])[\s\S\w\W])*>{1}?/gi;
        var regexpCSSHrefVal = /<link((?![\r\n>\+])[\s\S\w\W])+href\="((?![\r\n>\+])[\s\S\w\W]+?)"((?![\r\n>\+])[\s\S\w\W])*>{1}?/gi;

        html = html.replace(regexpCSSLinkElements, function ($link, $stylesheet) {
            $link = $link.replace(regexpCSSHrefVal, function ($1, $2, $href) {
                if ($href && !($href.indexOf('http') == 0)) {
                    var regexpStaticFilesPathPrefix = utils.getRegexpStaticFilesPrefix();
                    var deployKey = $href.replace(global.srcPrefix, global.deployPrefix).replace(regexpStaticFilesPathPrefix, '');

                    var href = global.staticFilesMapHash[$href];

                    if (global.staticFilesMapHash) {
                        deployKey = deployKey.replace(/[\\|/|\.]/ig, '_');

                        if (typeof global.staticFilesMapHash[deployKey] == 'undefined') {
                            global.staticFilesMapHash[deployKey] = href;
                        }

                        return $1.replace($href, global.staticFilesMapHash[deployKey]);
                    } else {
                        return $1.replace($href, href);
                    }
                }

                return $1;
            });
            return $link;
        });

        var regexpScriptElements = /<script(((?![\r\n\+<])[\s\S\w\W])+)>[\s\S\w\W]{0,}?<\/script>/ig;
        var regexpScriptElementSrcAttrValue = /<script((?![\r\n><\+])[\s\S\w\W])+src\="((?![\r\n><\+"])[\s\S\w\W]+?)"((?![\r\n><\+])[\s\S\w\W])*>(<\/script>)?/gi;

        var regexpImgElements = /<img[\S\s\W\w]{1,}?src\="(.+?)"[\S\s\W\w]{1,}?>/ig;
        var regexpBackgroundImage = utils.getRegexpCSSUrlPath();

        html = html.replace(regexpScriptElements, function ($1, $2) {
            if ($2.indexOf('type="text/html"') > -1) {
                return $1;
            }

            if ($2.toLowerCase().indexOf('release="false"') > -1) {
                return '';
            }

            var babelAttribute = 'babel="true"';
            if ($2.toLowerCase().indexOf(babelAttribute) > -1) {
                $1 = $1.replace(babelAttribute, '');
            }

            return $1.replace(regexpScriptElementSrcAttrValue, function ($2_1, $2_2, $src) {
                var crossoriginStr = 'crossorigin="anonymous" src=';
                if ($src && $src.toLowerCase().indexOf('http') == -1) {
                    var regexpStaticFilesPrefix = utils.getRegexpStaticFilesPrefix();
                    var remoteFilePath = $src.replace(global.srcPrefix, global.deployPrefix).replace(regexpStaticFilesPrefix, '');
                    var deployKey = remoteFilePath.replace(/[\\|/|\.]/ig, '_').replace(global.hotTag, '');;
                    var srcByDeployKey = global.staticFilesMapHash[deployKey];
                    return $2_1.replace($src, srcByDeployKey).replace("src=", crossoriginStr);
                } else {
                    if($src && $src.indexOf('wenwen/deploy/js/') > -1){
                        return $2_1.replace("src=", crossoriginStr);
                    }
                    return $2_1;
                }
            });
        });

        html = html.replace(regexpImgElements, function ($0, $src) {
            if ($src && $src.indexOf('<%') == -1) {
                if ($src.indexOf('http://') == -1 && utils.isInArray(global.imageExtList, path.extname($src)) && $0 != 'about:blank') {
                    var regexpStaticFilesPrefix = utils.getRegexpStaticFilesPrefix();

                    var imageSrc = path.join(global.staticDirectory, $src.replace(regexpStaticFilesPrefix, ''));

                    imageSrc = utils.normalizePath(imageSrc);

                    console.log("findImg: " + imageSrc);

                    if (typeof global.cacheBackgroundImageList[imageSrc] == 'undefined') {
                        var md5 = utils.md5(fs.readFileSync(imageSrc).toString());
                        var basename = path.basename(imageSrc);
                        var targetDir = utils.normalizePath(imageSrc);
                        file.mkdirRecursive(targetDir);

                        var ext = path.extname(imageSrc);
                        var targetFilename = basename.replace(ext, '_' + utils.cutOutMD5(md5) + ext);
                        var key = utils.normalizePath(path.join('/', imageSrc.replace(global.staticDirectory, '')));

                        var src = global.imgDeployDomain + utils.normalizePath(path.join(path.dirname(key.replace(global.srcPrefix, global.deployPrefix).replace(global.debug_domain, '')), targetFilename));

                        key = key.replace(global.srcPrefix, global.deployPrefix).replace(utils.getRegexpStaticFilesPrefix(), '');
                        var _k = key.replace(/[\\|/|\.]/ig, '_');

                        if (typeof global.staticFilesMapHash[_k] == 'undefined') {
                            global.staticFilesMapArray.push(_k + ' = ' + src);
                        }

                        global.staticFilesMapHash[_k] = src;

                        var imageTargetDir = path.dirname(targetDir.replace(global.srcPrefix, global.deployPrefix));
                        var imageTargetPath = path.join(imageTargetDir, targetFilename);

                        file.mkdirRecursive(imageTargetDir);

                        fs.writeFileSync(imageTargetPath, fs.readFileSync(imageSrc));

                        global.cacheBackgroundImageList[imageSrc] = src;

                        return $0.replace($src, src);
                    } else {
                        console.log('cache: ' + global.cacheBackgroundImageList[imageSrc]);
                        return $0.replace($src, global.cacheBackgroundImageList[imageSrc]);
                    }
                } else {
                    return $0;
                }
            } else {
                return $0;
            }
        });


        html = html.replace(regexpBackgroundImage, function ($0, $src) {
            if ($src && $src.indexOf('<%') == -1) {
                if ($src.indexOf('http://') == -1 && $0 != 'about:blank') {
                    var regexpStaticFilesPrefix = utils.getRegexpStaticFilesPrefix();

                    var imageSrc = path.join(global.staticDirectory, $src.replace(regexpStaticFilesPrefix, ''));

                    imageSrc = utils.normalizePath(imageSrc);

                    console.log("findImg: " + imageSrc);

                    if (typeof global.cacheBackgroundImageList[imageSrc] == 'undefined') {
                        var md5 = utils.md5(fs.readFileSync(imageSrc).toString());
                        var basename = path.basename(imageSrc);
                        var targetDir = utils.normalizePath(imageSrc);
                        file.mkdirRecursive(targetDir);

                        var ext = path.extname(imageSrc);
                        var targetFilename = basename.replace(ext, '_' + utils.cutOutMD5(md5) + ext);
                        var key = utils.normalizePath(path.join('/', imageSrc.replace(global.staticDirectory, '')));
                        var src = global.imgDeployDomain + utils.normalizePath(path.join(path.dirname(key.replace(global.srcPrefix, global.deployPrefix).replace(global.debug_domain, '')), targetFilename));
                        key = key.replace(global.srcPrefix, global.deployPrefix).replace(utils.getRegexpStaticFilesPrefix(), '');

                        var _k = key.replace(/[\\|/|\.]/ig, '_');

                        if (typeof global.staticFilesMapHash[_k] == 'undefined') {
                            global.staticFilesMapArray.push(_k + ' = ' + src);
                        }

                        global.staticFilesMapHash[_k] = src;

                        var imageTargetDir = path.dirname(targetDir.replace(global.srcPrefix, global.deployPrefix));
                        var imageTargetPath = path.join(imageTargetDir, targetFilename);

                        file.mkdirRecursive(imageTargetDir);
                        fs.writeFileSync(imageTargetPath, fs.readFileSync(imageSrc));

                        global.cacheBackgroundImageList[imageSrc] = src;

                        return $0.replace($src, src);
                    } else {
                        console.log('cache: ' + global.cacheBackgroundImageList[imageSrc]);
                        return $0.replace($src, global.cacheBackgroundImageList[imageSrc]);
                    }
                } else {
                    return $0;
                }
            } else {
                return $0;
            }
        });

        var tplTargetPath = path.join(tplDeployDir, path.basename(tplPath));
        fs.writeFile(tplTargetPath, html.replace(/scriptInludeStrTagWillBeReplaced/ig, 'script'), function (err) {
            if (err) {
                throw err;
            }

            console.log('tpl-compile: ' + tplTargetPath + ' success!');
            callback();
        });
    }, function (err) {
        if (err) {
            throw err;
        }

        var end = new Date();
        console.log('tpl-compile-complete： spend ' + (end - start) + ' ms!');

        if (utils.hasArgument(process.argv, '--local')) {
            console.log('complete: deploy success!');
            console.log('Done: without errors.');
        }

        cb();
    });
}

exports.compile = compile;