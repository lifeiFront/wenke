'use strict';

var fs = require('fs');
var path = require('path');
var file = require('../lib/file.js');
var CleanCSS = require('clean-css');
var async = require('async');
var utils = require('./utils');

global.cacheBackgroundImageList = {};

function compile() {
    var start = new Date();
    console.log('cssCompileList：');
    console.log(cssCompileList.toString());

    cssCompileList.forEach(function (cssHrefValue, index) {
        cssHrefValue = path.join(global.staticDirectory, cssHrefValue);
        compileCallback(cssHrefValue);
    });

    var end = new Date();
    console.log('css-compile-complete: spend ' + (end - start) + ' ms!');
}

function compileCallback(cssHrefValue, onlyReturnSource) {
    //用来标记某个import CSS是否被引用过，保证不重复合并
    //全局缓存，key为link href，value
    //global.
    var cleanCSS = new CleanCSS({compatibility: "ie7"});

    if (!fs.existsSync(cssHrefValue)) {
        utils.errorHandler("can't find the css file " + cssHrefValue);
    }

    var regexpImportCSS = /@import\s+(?:url\(){0,1}['"]{0,1}((?:(?![\r\n])[\w\W\s\S])+\.css)['"]{0,1}\)?;?/ig;
    var cssConcatListMap = {};
    var cssConcatContent = getCSSConcatList(cssHrefValue, regexpImportCSS, cssConcatListMap);
    cssConcatContent = cleanCSS.minify(cssConcatContent).styles;

    if (!onlyReturnSource) {
        var md5 = utils.md5(cssConcatContent);
        var basename = path.basename(cssHrefValue);
        var targetDirPath = utils.normalizePath(path.dirname(cssHrefValue));
        var position = targetDirPath.lastIndexOf(global.srcPrefix);
        targetDirPath = path.join(targetDirPath.substring(0, position), global.deployPrefix, targetDirPath.substring(position + global.srcPrefix.length, targetDirPath.length));
        file.mkdirRecursive(targetDirPath);

        var targetFileName = basename.replace('.css', '_' + utils.cutOutMD5(md5) + '.css');
        var targetFilePath = path.join(targetDirPath, targetFileName);
        basename = basename.replace('.css', '') + '_' + utils.cutOutMD5(md5) + '.css';
        fs.writeFileSync(targetFilePath, cssConcatContent);

        //注意：此处utils.normalizePath(cssHrefValue).replace(utils.normalizePath(global.staticDirectory), '/')不能写成utils.normalizePath(cssHrefValue).replace(utils.normalizePath(global.staticDirectory), '')
        //对传入的-w 和 -s 两个路径参数以 / 或者 \ 结尾时进行兼容处理
        var cssHrefValueToDeploy = global.deployDomain + utils.normalizePath(path.join(path.dirname(utils.normalizePath(cssHrefValue).replace(utils.normalizePath(global.staticDirectory), '/')), basename)).replace(global.srcPrefix, global.deployPrefix);

        var key = utils.normalizePath(path.join('/', utils.normalizePath(cssHrefValue).replace(utils.normalizePath(global.staticDirectory), '')));
        key = key.replace(global.srcPrefix, global.deployPrefix).replace(utils.getRegexpStaticFilesPrefix(), '');
        var _k = key.replace(/[\\|/|\.]/ig, '_');
        global.staticFilesMapHash[_k] = cssHrefValueToDeploy.replace(/\\/ig, '/');
    } else {
        return cssConcatContent;
    }
}

/**
 *
 * @param cssPath
 * @param regexpImportCSS
 * @param cssConcatListMap
 * @returns {*|String|string}
 */
function getCSSConcatList(cssPath, regexpImportCSS, cssConcatListMap) {
    var cssContent = fs.readFileSync(cssPath).toString();

    cssContent = cssContent.replace(regexpImportCSS, function ($1, $2) {
        if ($2) {
            var cssImportPath = utils.normalizePath(path.resolve(path.dirname(cssPath), $2));
            if (cssConcatListMap[cssImportPath]) {
                return '';
            }

            var _c = fs.readFileSync(cssImportPath).toString();
            if (regexpImportCSS.test(_c)) {
                return getCSSConcatList(cssImportPath, regexpImportCSS, cssConcatListMap);
            } else {
                cssConcatListMap[cssImportPath] = true;

                var contentOfCSSPath = fs.readFileSync(cssImportPath).toString();
                return getBackgroundImageList(cssImportPath, contentOfCSSPath);
            }
        }
    });

    cssContent = getBackgroundImageList(cssPath, cssContent);

    return cssContent;
}


function getBackgroundImageList(cssPath, cssContent) {
    //支持css3 多个background image 写法
    var regexpBackgroundImage = /[\s|\:]{0,1}url\(['|"]{0,1}([\w|\W]+?)['|"]{0,1}\)/ig;

    cssContent = cssContent.replace(regexpBackgroundImage, function ($1, $imgSrc) {
        if ($imgSrc) {
            if (($imgSrc.indexOf('http://') == -1 && $imgSrc.indexOf('//') != 0) && utils.isInArray(global.imageExtList, path.extname($imgSrc)) && $imgSrc != 'about:blank') {
                var imageSrc = utils.normalizePath(path.resolve(path.join(path.dirname(cssPath), $imgSrc)));

                //发布系统调用wenke时会导致JS内嵌的CSS和图片路径发生错误，导致无法上传CDN，需要兼容
                if (imageSrc.indexOf(utils.normalizePath(global.staticDirectory)) == -1) {
                    //对错误路径进行分隔提取处理，将相对CSS路径提取出来
                    var splitIndex = imageSrc.indexOf('/src/');
                    imageSrc = utils.normalizePath(path.join(global.staticDirectory, imageSrc.substr(splitIndex)));
                }

                if (typeof global.cacheBackgroundImageList[imageSrc] == 'undefined') {
                    var md5 = utils.md5(fs.readFileSync(imageSrc).toString());
                    var basename = path.basename(imageSrc);
                    var targetDir = utils.normalizePath(imageSrc);
                    file.mkdirRecursive(targetDir);

                    var ext = path.extname(imageSrc);
                    var targetFilename = basename.replace(ext, '_' + utils.cutOutMD5(md5) + ext);
                    var key = utils.normalizePath(path.join('/', imageSrc.replace(utils.normalizePath(global.staticDirectory), '')));
                    var src = global.imgDeployDomain + utils.normalizePath(path.join(path.dirname(key.replace(global.srcPrefix, global.deployPrefix).replace(global.debug_domain, '')), targetFilename));
                    key = key.replace(global.srcPrefix, global.deployPrefix).replace(utils.getRegexpStaticFilesPrefix(), '');
                    var _k = key.replace(/[\\|/|\.]/ig, '_');

                    global.staticFilesMapHash[_k] = src;

                    var imageTargetDir = path.dirname(targetDir.replace(global.srcPrefix, global.deployPrefix));
                    var imageTargetPath = path.join(imageTargetDir, targetFilename);

                    file.mkdirRecursive(imageTargetDir);
                    fs.writeFileSync(imageTargetPath, fs.readFileSync(imageSrc));

                    global.cacheBackgroundImageList[imageSrc] = src;
                    console.log('findImg: ' + $imgSrc);

                    return $1.replace($imgSrc, src);
                } else {
                    return $1.replace($imgSrc, global.cacheBackgroundImageList[imageSrc]);
                }
            } else {
                return $1;
            }
        } else {
            return $1;
        }
    });

    return cssContent;
}

exports.compile = compile;