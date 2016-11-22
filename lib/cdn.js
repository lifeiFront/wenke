'use strict';

var fs = require('fs');
var utils = require('./utils');
var path = require('path');
var async = require('async');

/**
 *
 * @param localRemoteArrMap
 * @param cb
 */
function upload(localRemoteArrMap, cb) {
    var start = new Date();
    async.map(localRemoteArrMap, function (item, callback) {
        var uploadStart = new Date();
        var localPath = item.localPath;
        var remotePath = item.remotePath;

        //校验文件上传是否正确
        //如果上传CDN错误, 别忘记refresh
        var uploadEnd = new Date();
        console.log('upload ' + localPath + ' to ' + global.deployDomain + remotePath
            + ' success ! verify cdn file success! spend ' + (uploadEnd - uploadStart) + ' ms!');
        callback();
    }, function (err) {
        if (err) {
            throw err;
        }

        var staticUrlINIContent = '';
        for (var hashKey in global.staticFilesMapHash) {
            staticUrlINIContent += hashKey + '=' + global.staticFilesMapHash[hashKey] + '\r\n';
        }
        global.staticFilesMapArray.push('timestamp = ' + utils.getDate());

        fs.writeFileSync(global.staticUrlMapPath, staticUrlINIContent);
        if (localRemoteArrMap.length) {
            console.log('complete: publish static files to cdn success!');
        } else {
            console.log('complete: there\'re nothing to be uploaded!');
        }
        var end = new Date();
        console.log('uploadToCDN-complete: spend ' + (end - start) + ' ms!');
        console.log('content of static_url.ini：');
        console.log(staticUrlINIContent);
        console.log('complete: deploy success!');
        console.log('Done: without errors.');
        cb();
    });
}

/**
 *
 */
function publish(cb) {
    var remote = {};
    var localRemoteArrMap = [];

    var local = global.staticFilesMapHash;

    var lineReader = require('line-reader');

    lineReader.eachLine(global.staticUrlMapPath, function (line, last) {
        line = line.trim();
        var arr = line.split('=');

        if (arr.length == 2 && arr[0].trim().length > 0 && arr[1].trim().length > 0 && arr[0].trim() != 'timestamp') {
            remote[arr[0].trim()] = arr[1].trim();
        }
    }).then(function () {
        //对比hash
        for (var key in local) {
            //(如果本地存在某一项配置，但是远程不存在) 或者 （本地和远程都存在同一项配置，但是地址不同，以本地为准） ，则添加到待上传文件列表
            if ((typeof local[key] != 'undefined' && typeof remote[key] == 'undefined') ||
                (typeof local[key] != 'undefined' && typeof remote[key] != 'undefined' && local[key] != remote[key])) {
                var remotePath = local[key].trim().replace(global.deployDomain, '').replace(global.imgDeployDomain, '');

                var localPath = path.join(global.staticDirectory, remotePath);

                localRemoteArrMap.push({
                    "localPath": localPath,
                    "remotePath": remotePath
                });
            }
        }

        upload(localRemoteArrMap, cb);
    });
}

exports.publish = publish;