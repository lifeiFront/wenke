'use strict';

var path = require('path');
var http = require('http');
var fs = require('fs');

/**
 *
 * @returns {string}
 */
function getDate() {
    var date = new Date();

    return date.getFullYear() + (date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + '_' + (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + '_' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + '_' + (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
}

exports.getDate = getDate;

/**
 *
 * @param arr
 * @param search
 * @returns {boolean}
 */
function isInArray(arr, search) {
    if (typeof arr == 'object' && typeof arr.length == 'number') {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == search) {
                return true;
            }
        }
    }

    return false;
}

exports.isInArray = isInArray;

/**
 *
 * @param content
 * @returns {*}
 */
function md5(content) {
    var crypto = require('crypto');

    return crypto.createHash('md5').update(content, 'utf8').digest('hex');
}

exports.md5 = md5;

/**
 *
 * @param reg
 * @returns {*}
 */
function escapeRegexp(reg) {
    if (typeof reg == 'string') {
        reg = reg.replace(/[\$|\{|\}|\(|\)|\\.]/ig, function ($0) {
            return '\\' + $0;
        });
    }

    return reg;
}

exports.escapeRegexp = escapeRegexp;

/**
 *
 * @param path
 * @returns {string}
 */
function normalizePath(path) {
    if (typeof path == 'string') {
        return path.replace(/[\\|\\\\|//|////]/ig, '/');
    }

    return path;
}

exports.normalizePath = normalizePath;

/**
 *
 * @param arr
 * @returns {Array}
 */
function arrUnique(arr) {
    var n = {}, r = [];
    for (var i = 0; i < arr.length; i++) {
        if (!n[arr[i]]) {
            n[arr[i]] = true;
            r.push(arr[i]);
        }
    }
    return r;
}

exports.arrUnique = arrUnique;

/**
 *
 * @param jsonArray
 * @returns {Array}
 */
function jsonArrayUnique(jsonArray) {
    var n = {}, r = [];
    for (var i = 0; i < jsonArray.length; i++) {
        if (!n[jsonArray[i].path]) {
            n[jsonArray[i].path] = true;
            r.push(jsonArray[i]);
        }
    }
    return r;
}

exports.jsonArrayUnique = jsonArrayUnique;

/**
 *
 * @param argv
 * @param search
 * @returns {boolean}
 */
function hasArgument(argv, search) {
    var ret = false;

    for (var i = 0; i < argv.length; i++) {
        if (argv[i] == search) {
            ret = true;
            break;
        }
    }
    return ret;
}

exports.hasArgument = hasArgument;

function errorHandler(errorInfo) {
    console.log(errorInfo);
    process.exit();
}

exports.errorHandler = errorHandler;

/**
 * 下载文件
 * @param url
 * @param localPath
 * @param successCallback
 * @param refreshCallback
 */
function downloadFile(url, localPath, successCallback, refreshCallback) {
    http.get(url, function (res) {
        var data = '';

        res.on('data', function (chunk) {
            data += chunk.toString();
        });

        res.on('end', function () {
            //检测CDN文件与本地文件是否内容完全一致
            var fileContent = fs.readFileSync(localPath).toString();
            if (fileContent === data) {
                successCallback();
            } else {
                console.log('check: file ' + localPath + ' fail! begin refresh...');
                refreshCallback();
            }
        });
    }).on('error', function () {
        console.log('downloadFile Error! URL: ', url);

        process.exit();
    });
}

exports.downloadFile = downloadFile;

/**
 * 获取本地调试下的静态资源前缀
 * @returns {RegExp}
 */
function getRegexpStaticFilesPrefix() {
    global.debugDomain.lastIndex = 0;
    return global.debugDomain;
}

exports.getRegexpStaticFilesPrefix = getRegexpStaticFilesPrefix;

/**
 * 截取文件MD5前N位，默认截取前7位
 * @param md5Str
 * @returns {string}
 */
function cutOutMD5(md5Str) {
    return md5Str.substr(0, global.md5Length || 7);
}

exports.cutOutMD5 = cutOutMD5;

function getRegexpCSSUrlPath() {
    return /[\s|\:]{0,1}url\((\$\{page\.getStaticFilesPathPrefix\(\)}['|"]{0,1}[\w|\W]+?)['|"]{0,1}\)/ig;
}

exports.getRegexpCSSUrlPath = getRegexpCSSUrlPath;

function delFiles() {
    var del = require('del');
    return del.sync([path.join(global.staticDirectory, 'deploy/*'), path.join(global.templateDir, 'deploy/*')], {force: true});
}

exports.delFiles = delFiles;