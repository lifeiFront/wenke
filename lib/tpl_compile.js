'use strict';

var path = require('path');
var fs = require('fs');
var cheerio = require('mcheerio');
var file = require('./file.js');

var grunt = require('spm-grunt');
var utils = require('./utils');

function CombineJSAndCSS(file_path) {
	var target_dir = path.dirname(file_path);

	target_dir = target_dir.replace(/\\/ig, '/');

	var position = target_dir.lastIndexOf(global.tpl_src_prefix);

	target_dir = target_dir.substring(0, position) + global.tpl_deploy_prefix + target_dir.substring(position + global.tpl_src_prefix.length, target_dir.length);

	file.mkdirRecursive(target_dir);

	var html = fs.readFileSync(file_path).toString();

	var $ = cheerio.load(html);

	var css_nodes = $('link');

	var js_nodes = $('script');

	if (css_nodes.length == 0 && js_nodes.length == 0) {
		grunt.file.write(path.join(target_dir, path.basename(file_path)), grunt.file.read(file_path));
		return;
	}

	if (js_nodes.length > 0) {
		for (var i = 0; i < js_nodes.length; i++) {
			var node = $(js_nodes[i]);
			var src = node.attr('src');

			if (src) {
				src = src.replace(global.version_tag, 'src').replace(global.static_src_prefix, global.static_deploy_prefix);
			}

			if (src && src.toLowerCase().indexOf('http://') == -1) {
				var key = src.replace(global.static_src_prefix, global.static_deploy_prefix).replace(global.debug_domain, '');
				var src = global.deploy_domain + key;

				if (global.md5) {
					var _k = key.replace(/[\\|/|\.]/ig, '_');
					global.static_map.push(_k + ' = ' + src);

					if (node.attr('id') == "seajsnode") {
						node.replaceWith('<script src="' + global.static_map_function + "(\'" + _k + "\')" + '" id="seajsnode"></script>');
					} else {
						node.replaceWith('<script src="' + global.static_map_function + "(\'" + _k + "\')" + '"></script>');
					}
				} else {
					node.attr('src', src);
				}
			} else {
				node.html(node.html().replace(global.version_tag, 'deploy').replace(global.debug_domain, global.deploy_domain).replace('${space}', '/sea_modules'));
			}
		}

		var seajsnode = $('script[id="seajsnode"]');

		if (seajsnode) {
			seajsnode.after("\r\n<script>" + global.seajs_config + "</script>\r\n");
		}
	}

	if (css_nodes.length > 0) {
		for (var key in global.ht_pkg) {
			var pkg = true;
			var arr = global.ht_pkg[key];

			for (var j = 0; j < arr.length; j++) {
				if ($("link[href='" + global.debug_domain + global.static_src_prefix + 'css/' + arr[j] + "']").length == 0) {
					pkg = false;
					break;
				}
			}

			if (pkg) {
				if (arr.length <= 1) {
					var node = $("link[href='" + global.debug_domain + global.static_src_prefix + 'css/' + arr[0] + "']");

					if (node.length > 0) {
						node.remove();
					}
				} else {
					for (var j = 0; j < arr.length; j++) {
						var node = $("link[href='" + global.debug_domain + global.static_src_prefix + 'css/' + arr[j] + "']");

						if (j != 0) {
							node.remove();
						}
					}

					var href = global.deploy_domain + global.static_deploy_prefix + 'css/' + key;

					var _k = global.static_deploy_prefix + 'css/' + key;

					var link = $('<link href="' + href + '" rel="stylesheet" type ="text/css" />');

					var head = $("link[href='" + global.debug_domain + global.static_src_prefix + 'css/' + arr[0] + "']");

					if (global.md5) {

						link = $('<link href="' + global.static_map_function + "(\'" + _k + "\')" + '" rel="stylesheet" type ="text/css" />');

						global.static_map.push(_k + '=' + href);
					}

					head.replaceWith(link);
				}
			}
		}


		for (var key in global.ht_res) {

			var node = $("link[href='" + global.debug_domain + global.static_src_prefix + 'css/' + key + "']");

			var href = global.deploy_domain + global.static_deploy_prefix + 'css/' + global.ht_res[key].replace(global.debug_domain, '');

			var _k = global.static_deploy_prefix + 'css/' + global.ht_res[key].replace(global.debug_domain, '');

			if (node.attr('href')) {
				if (global.md5) {
					_k = _k.replace(/[\\|/|\.]/ig, '_');
					global.static_map.push(_k + '=' + href);
					node.replaceWith($('<link href="' + global.static_map_function + "(\'" + _k + "\')" + '" rel="stylesheet" type ="text/css" />'));
				} else {
					node.attr('href', href);
				}
			}
		}
	}

	fs.writeFileSync(path.join(target_dir, path.basename(file_path)), $.xml());
}

exports.CombineJSAndCSS = CombineJSAndCSS;
