'use strict';

var CleanCSS = require('clean-css');

var fs = require('fs');

var path = require('path');

var file = require('./file.js');

var utils = require('./utils.js');

var css_config = require(path.join(global.static_directory, 'src/css/map.json'));

var pkg = (typeof css_config.css != 'undefined' && typeof css_config.css.pack != 'undefined') ? css_config.css.pack : {};

var map = {
	"res": {

	},
	"pkg": {

	}
};

function Minify(dir) {
	var list = [];
	list = file.getAllFilesByFolder(dir, list, ['.css']);

	var clean = new CleanCSS();

	for (var i = 0; i < list.length; i++) {
		var filename = list[i];

		var source = fs.readFileSync(list[i]);

		var content = clean.minify(source)

		var md5 = utils.md5(content);

		var basename = path.basename(filename);

		var target_dir = path.dirname(filename);

		target_dir = target_dir.replace(/\\/ig, '/');

		var position = target_dir.lastIndexOf(global.static_src_prefix);

		target_dir = path.join(target_dir.substring(0, position), global.static_deploy_prefix, target_dir.substring(position + global.static_src_prefix.length, target_dir.length));

		file.mkdirRecursive(target_dir);

		var target_filename = basename;

		if (global.md5) {
			target_filename = basename.replace('.css', '') + '_' + md5.substring(0, 7) + '.css';
		}

		var target_path = path.join(target_dir, target_filename);

		map.res[filename.replace(global.static_directory, '').replace(/\\/ig, '/').replace(/\/src\/css\//ig, '')] = {
			"uri": path.join(path.dirname(filename.replace(global.static_directory, '').replace(/\\/ig, '/').replace(/\/src\/css\//ig, '')), target_filename).replace(/\\/ig, '/'),
			"local": target_path
		};

		fs.writeFileSync(target_path, content);
	}

	return map;
}

function Combo(dir) {
	Minify(dir);

	var index = 0;

	for (var key in pkg) {
		var content = '';

		for (var i = 0; i < pkg[key].length; i++) {
			content += fs.readFileSync(map.res[pkg[key][i]].local);
		}

		var md5 = utils.md5(content);

		var basename = path.basename(key);

		var target_dir = path.dirname(path.join(dir, key));

		target_dir = target_dir.replace(/\\/ig, '/');

		var position = target_dir.lastIndexOf(global.static_src_prefix);

		target_dir = path.join(target_dir.substring(0, position), global.static_deploy_prefix, target_dir.substring(position + global.static_src_prefix.length, target_dir.length));

		file.mkdirRecursive(target_dir);

		var target_filename = basename;

		if (global.md5) {
			target_filename = basename.replace('.css', '') + '_' + md5.substring(0, 7) + '.css';
		}

		var target_path = path.join(target_dir, target_filename);

		fs.writeFileSync(target_path, content);

		map.pkg['p' + index] = {
			"uri": path.join(path.dirname(key), target_filename).replace(/\\/ig, '/'),
			"has": pkg[key]
		}

		index++;
	}

	return map;
}

exports.Combo = Combo;