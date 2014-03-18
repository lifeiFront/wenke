//'use strict';

var fs = require('fs');
var path = require('path');
var cheerio = require('mcheerio');
var utils = require('./utils');

/**
 @desc 读取单个文件
*/
function readFileSync(path) {
	fs.readFileSync(path, function(err, data) {
		if (err) {
			throw err;
		}
		return data;
	});
}


function GetAllFilesByFolder(dir, list, extension) {
	var files_list = fs.readdirSync(dir);

	for (var i = files_list.length - 1; i >= 0; i--) {
		var file_name = files_list[i];
		var file = path.join(dir, file_name);

		var stat = fs.statSync(file);

		if (stat.isDirectory()) {
			GetAllFilesByFolder(file, list, extension);
		} else {
			if (utils.inArray(extension, path.extname(file))) {
				list.push(file);
			}
		}
	};

	return list;
}

function CopyDir(source, target) {
	if (!fs.existsSync(target)) {
		fs.mkdirSync(target);
	}

	var files_list = fs.readdirSync(source);

	for (var i = files_list.length - 1; i >= 0; i--) {
		var file_name = path.basename(files_list[i]);
		var target_path = path.join(target, file_name);

		var stat = fs.statSync(path.join(source, file_name));

		if (stat.isDirectory()) {
			CopyDir(path.join(source, file_name), target_path);
		} else {
			var readable = fs.createReadStream(path.join(source, file_name));

			// 创建写入流

			var writable = fs.createWriteStream(target_path);

			// 通过管道来传输流

			readable.pipe(writable);
			//fs.createReadStream(path.join(source, file_name)).pipe(target_path);
		}
	}
}

function canWrite(owner, inGroup, mode) {
	return owner && (mode & 00200) || // User is owner and owner can write.

	inGroup && (mode & 00020) || // User is in group and group can write.

	(mode & 00002); // Anyone can write.

}

function MD5(content) {
	var crypto = require('crypto');

	return crypto.createHash('md5').update(content).digest('hex');

}

function deleteFolderRecursive(path, del_root) {
	if (fs.existsSync(path)) {
		fs.readdirSync(path).forEach(function(file, index) {
			var curPath = path + '/' + file;
			var stat = fs.statSync(curPath);

			if (stat.isDirectory()) {
				// recurse
				deleteFolderRecursive(curPath, false);
			} else {
				if (canWrite(process.uid === stat.uid, process.gid === stat.gid, stat.mode)) {
					// delete file
					fs.unlinkSync(curPath);
				}
			}
		});

		if (del_root) {
			var file_stat = fs.statSync(path);

			if (canWrite(process.uid === file_stat.uid, process.gid === file_stat.gid, file_stat.mode)) {
				fs.rmdirSync(path);
			}
		}
	}
};

function mkdirRecursive(dir) {
	//console.log(dir);
	if (fs.existsSync(dir)) {
		return;
	}


	if (!fs.existsSync(path.dirname(dir))) {
		mkdirRecursive(path.dirname(dir));
	}

	fs.mkdirSync(dir);
}

exports.readFileSync = readFileSync;

exports.GetAllFilesByFolder = GetAllFilesByFolder;

exports.MD5 = MD5;

exports.deleteFolderRecursive = deleteFolderRecursive;

exports.CopyDir = CopyDir;

exports.mkdirRecursive = mkdirRecursive;