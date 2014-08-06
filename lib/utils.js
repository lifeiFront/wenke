'use strict';


global.ht_res = {};
global.ht_pkg = {};

function parseMap(map) {
	if (map.res) {
		for (var key in map.res) {
			key = key.replace(/\\/ig, '/');
			var item = map.res[key];

			if (!global.ht_res[key]) {
				global.ht_res[key] = {
					"uri": item["uri"],
					"origin_uri": item["origin_uri"]
				};
			}
		}
	}

	if (map.pkg) {
		for (var key in map.pkg) {
			key = key.replace(/\\/ig, '/');
			var item = map.pkg[key];

			if (!global.ht_pkg[item.uri]) {
				global.ht_pkg[item.uri.replace(/\\/ig, '/')] = {
					"has": item.has,
					"origin_uri": item["origin_uri"]
				}
			}
		}
	}
}

function getDate() {
	var date = new Date();

	return date.getFullYear() + (date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + '_' + (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + '_' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + '_' + (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
}

function isInArray(arr, search) {
	if (typeof arr == 'object' && typeof arr.length == 'number') {
		for (var i = 0; i < arr.length; i++) {
			if (arr[i] == search) {

				return true;
			}
		}

		return false;
	}

	return false;
}

function md5(content) {
	var crypto = require('crypto');

	return crypto.createHash('md5').update(content).digest('hex');
}

function parseRegExp(reg){
	if(typeof reg == 'string'){
		reg = reg.replace(/[\$|\{|\}|\(|\)|\\.]/ig, function($0){
			return '\\' + $0;
		});
	}

	return reg;
}

exports.parseMap = parseMap;
exports.getDate = getDate;
exports.isInArray = isInArray;
exports.md5 = md5;
exports.parseRegExp = parseRegExp;