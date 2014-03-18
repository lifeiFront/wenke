'use strict';


global.ht_res = {};
global.ht_pkg = {};

function parseMap(map) {
	if (map.res) {
		for (var key in map.res) {
			key = key.replace(/\\/ig, '/');
			var item = map.res[key];

			if (!global.ht_res[key]) {
				global.ht_res[key] = item["uri"];
			}
		}
	}

	if (map.pkg) {
		for (var key in map.pkg) {
			key = key.replace(/\\/ig, '/');
			var item = map.pkg[key];

			if (!global.ht_pkg[item.uri]) {
				global.ht_pkg[item.uri.replace(/\\/ig, '/')] = item.has;
			}
		}
	}
}

function getDate() {
	var date = new Date();

	return date.getFullYear() + (date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + '_' + (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + '_' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + '_' + (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
}

function inArray(arr, search) {
	if (typeof arr == 'object' && typeof arr.length == 'number') {
		for(var i = 0; i< arr.length;i++){
			if(arr[i] == search){

				return true;
			}
		}

		return false;
	}

	return false;
}

exports.parseMap = parseMap;
exports.getDate = getDate;
exports.inArray =  inArray;