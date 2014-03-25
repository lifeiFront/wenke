var grunt = require('spm-grunt');
var _ = grunt.util._;
var fs = require('fs');
var path = require('path');

function getConfig(options) {
	var map_path = path.join(global.static_directory, 'src/js', 'map.json')
	if (!fs.existsSync(map_path)) {
		throw new Error('can not find map.json in `' + global.spm_directory + '`!');
	}

	var pkg = grunt.file.readJSON(map_path);

	var deployConfig = pkg.spm;
	deployConfig.src = path.join(global.static_directory, 'src/js', global.spm_directory.replace(/[\\\/\.]/g, ''));
	deployConfig.outputDir = global.sea_modules_directory.replace(/\\/g, '/').replace(/\/$/g, '');
	deployConfig.dist = path.join(global.static_directory, 'deploy/js', deployConfig.outputDir, global.spm_directory);
	deployConfig.alias = deployConfig.alias || {};

	var data = {
		clean: {
			options: {
				force: true
			},
			static_dist: cleanStaticDistConfig(options),
			view_dist: cleanViewDistConfig(options),
			spm: ['.deploy']
		},

		"csscombo-dist": {
			target: {

			}
		},

		transport: {
			spm: transportConfig(deployConfig)
		},
		concat: {
			relative: concatRelativeConfig(deployConfig),
			all: concatAllConfig(deployConfig)
		},
		uglify: {
			js: uglifyConfig(deployConfig)
		},
		md5: md5Config(deployConfig),
		"spm-newline": {
			target: {
				dist: deployConfig.dist
			}
		},
		"modify-config": {
			target: {

			}
		},
		"tplcompile-dist": {
			target: {

			}
		},
		copy: {
			sea_modules: {
				files: [
					// includes files within path
					{
						expand: true,
						cwd: global.static_directory,
						src: ['src/js/seajs-config.js'],
						dest: path.join(global.static_directory, 'deploy/js/'),
						flatten: true,
						filter: 'isFile'
					},

					// includes files within path and its sub-directories
					{
						expand: true,
						cwd: global.static_directory + '/src/js',
						src: ['sea_modules/**'],
						dest: path.join(global.static_directory, 'deploy/js')
					}
				]
			}
		}
	}

	return data;
}
exports.getConfig = getConfig;

// clean:static_dist
function cleanStaticDistConfig(options) {
	return [path.join(options.staticDirectory, 'deploy')];
}

//clean:view_dist
function cleanViewDistConfig(options) {
	if (options.templateDirectory) {
		return [path.join(options.templateDirectory, 'deploy')];
	} else {
		return [];
	}
}

// transport:spm
function transportConfig(deployConfig) {
	var transport = require('grunt-cmd-transport');
	var script = transport.script.init(grunt);
	var style = transport.style.init(grunt);
	var text = transport.text.init(grunt);
	var template = transport.template.init(grunt);

	return {
		options: {
			idleading: global.spm_directory + '/',
			paths: [deployConfig.outputDir],
			alias: deployConfig.alias || {},
			parsers: {
				'.js': [script.jsParser],
				'.css': [style.css2jsParser],
				'.html': [text.html2jsParser],
				'.handlebars': [template.handlebarsParser]
			},
			handlebars: {
				id: deployConfig.alias.handlebars || 'handlebars',
				knownHelpers: [],
				knownHelpersOnly: false
			},
			debug: false
		},
		files: [{
			cwd: deployConfig.src,
			expand: true,
			src: '**/*',
			filter: function(filepath) {
				// exclude outputDir dir
				return grunt.file.isFile(filepath) && !grunt.file.doesPathContain(deployConfig.outputDir, filepath);
			},
			dest: '.deploy/src'
		}]
	};
}

// concat:relative
// support format
// ["main.js", {"xx.js": ["xx.js", "templates/*.html.js"]}]
function concatRelativeConfig(deployConfig) {
	var files = {};
	(deployConfig.output.relative || deployConfig.output || []).forEach(function(f) {
		if (_.isString(f)) {
			files['.deploy/dist/' + f] = '.deploy/src/' + f;
		} else {
			var filename = _.keys(f)[0];
			files['.deploy/dist/' + filename] = f[filename].map(function(path) {
				return '.deploy/src/' + path;
			});
		}
	});

	return {
		options: {
			include: 'relative'
		},
		files: files
	};
}

// concat:all
function concatAllConfig(deployConfig) {
	var files = {};
	(deployConfig.output.all || []).forEach(function(f) {
		files['.deploy/dist/' + f] = '.deploy/src/' + f;
	});

	return {
		options: {
			include: 'all',
			paths: [deployConfig.outputDir]
		},
		files: files
	};
}

// uglify:js
function uglifyConfig(deployConfig) {
	var files = {};
	(deployConfig.output.relative || deployConfig.output || []).forEach(function(f) {
		f = _.isString(f) ? f : _.keys(f)[0];
		files['.deploy/dist/' + f] = '.deploy/dist/' + f;
	});
	(deployConfig.output.all || []).forEach(function(f) {
		files['.deploy/dist/' + f] = '.deploy/dist/' + f;
	});
	return {
		files: files
	};
}

function md5Config(deployConfig) {
	var afterMd5 = function(fileChanges) {
		var map = [];
		fileChanges.forEach(function(obj) {
			obj.oldPath = obj.oldPath.replace('.deploy/dist/', '');

			obj.newPath = obj.newPath.replace(deployConfig.dist.replace(/[\\]/ig, '/') + '/', '');

			if (global.md5) {
				var _k = obj.oldPath.replace(/[\\|/|\.]/ig, '_');
				global.static_map.push(_k + '=' + obj.newPath);

				if(global.static_map_path){
					map.push([obj.oldPath, global.static_map_function + "('" + _k + "')"]);
				}else{
					map.push([obj.oldPath, obj.newPath]);
				}

			} else {
				fs.rename(path.resolve(obj.newPath), path.join(path.resolve(path.dirname(obj.newPath)), path.basename(obj.oldPath)));
				map.push([obj.oldPath, obj.oldPath]);
			}
		});
		grunt.config.set('md5map', map);
	}

	var data = {
		options: {
			encoding: 'utf8',
			keepBasename: true,
			keepExtension: true,
			after: afterMd5
		},
		js: {
			files: [{
				expand: true, // Enable dynamic expansion.
				cwd: '.deploy/dist/', // Src matches are relative to this path.
				src: ['**/*.js'], // Actual pattern(s) to match.
				dest: deployConfig.dist // Destination path prefix.
			}]
		}
	}
	return data;
}