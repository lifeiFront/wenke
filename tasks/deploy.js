module.exports = function(grunt) {
	var path = require('path');
	var fs = require('fs');
	var css_combo = require('../lib/css_combo.js');
	var tpl_compile = require('../lib/tpl_compile.js');
	var file = require('../lib/file.js');

	var utils = require('../lib/utils.js');

	// add md5-map to seajs config
	grunt.registerMultiTask('modify-config', function() {
		var mapArr = grunt.config.get('md5map'),
			code = '';
		code = grunt.template.process(grunt.file.read(path.join(__dirname, 'seajs_config.tpl')), {
			data: {
				mapJSON: JSON.stringify(mapArr, null, '\t')
			}
		}) + '\n' + code;
		global.seajs_config = code;
	});

	grunt.registerMultiTask('spm-newline', function() {
		grunt.file.recurse(this.data.dist, function(f) {
			var extname = path.extname(f);
			if (extname === '.js' || extname === '.css') {
				var text = grunt.file.read(f);
				if (!/\n$/.test(text)) {
					grunt.file.write(f, text + '\n');
				}
			}
		});
	});

	grunt.registerMultiTask('csscombo-dist', function() {
		var map = css_combo.Combo(path.join(global.static_directory, 'src/css'));
		utils.parseMap(map);
		grunt.log.writeln('css combo success!');
	});


	grunt.registerMultiTask('tplcompile-dist', function() {
		var list = [];

		list = file.getAllFilesByFolder(path.join(global.template_directory, 'src'), list, ['.vm','.html']);

		for (var i = 0; i < list.length; i++) {
			tpl_compile.compile(list[i]);
		}


		if (global.md5 && fs.existsSync(global.static_map_path)) {
			var _d = new Date();
			global.static_map.push('timestamp=' + utils.getDate());
			fs.writeFileSync(global.static_map_path, global.static_map.join('\r\n'));
		}

		grunt.log.writeln('tpl compile success!');
	});
};