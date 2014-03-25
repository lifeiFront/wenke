'use strict';

function hasArgv(argv, search) {
	var ret = false;

	for (var i = 0; i < argv.length; i++) {
		if (argv[i] == search) {
			ret = true;
			break;
		}
	}
	return ret;
}

var path = require('path');
var fs = require('fs');
var grunt = require('spm-grunt');
var getConfig = require('./lib/config').getConfig;

exports = module.exports = function(options) {
	if (options.staticDirectory && typeof options.staticDirectory == 'string' && fs.existsSync(path.resolve(options.staticDirectory))) {
		global.static_directory = path.resolve(options.staticDirectory);
	} else {
		grunt.log.writeln('static_directory is not exists!');
		process.exit();
	}

	//检查目录规范
	if (!fs.existsSync(path.join(global.static_directory, 'src'))) {
		grunt.log.writeln("can't find 'src' directory in static_directory ");
		process.exit();
	}

	if (options.templateDirectory && typeof options.templateDirectory == 'string') {

		if (fs.existsSync(path.resolve(options.templateDirectory))) {
			global.template_directory = path.resolve(options.templateDirectory).replace(/[\\]/ig, '/');
		} else {
			grunt.log.writeln('template_directory is not exists!');
			process.exit();
		}

		//检查目录规范
		if (!fs.existsSync(path.join(global.template_directory, 'src'))) {
			grunt.log.writeln("can't find 'src' directory in template_directory ");
			process.exit();
		}
	}


	global.static_map_function = typeof options.staticMapFunction == 'string' ? options.staticMapFunction : '$StaticUrl.getUrl';

	global.md5 = hasArgv(process.argv, '-m') ? true : false;

	if (global.md5) {
		if (options.staticMapPath){
			if(fs.existsSync(path.resolve(path.dirname(options.staticMapPath)))) {
				global.static_map_path = path.resolve(options.staticMapPath);
			}else{
				grunt.log.writeln('static_map_path is not exists!');
				process.exit();
			}
		}

		global.static_map = [];
	}

	global.debug_domain = typeof options.debugDomain == 'string' ? options.debugDomain : '${wenwenPage.getStaticFilesPathPrefix()}';

	global.deploy_domain = typeof options.deployDomain == 'string' ? options.deployDomain : 'http://127.0.0.1:8022';

	global.static_src_prefix = typeof options.staticSrcPrefix == 'string' ? options.staticSrcPrefix : '/src/';

	global.static_deploy_prefix = typeof options.staticDeployPrefix == 'string' ? options.staticDeployPrefix : '/deploy/';

	global.tpl_src_prefix = typeof options.tplSrcPrefix == 'string' ? options.tplSrcPrefix : '/src/';

	global.tpl_deploy_prefix = typeof options.tplDeployPrefix == 'string' ? options.tplDeployPrefix : '/deploy/';

	global.spm_directory = options.spmDirectory;

	global.sea_modules_directory = typeof options.seaModulesDirectory == 'string' ? options.seaModulesDirectory.replace(/[\\|\/]/ig, '') : 'sea_modules' ;
	if(options.stack){
		grunt.option('stack', true); 
	}

	if (!(typeof global.spm_directory == 'string' && fs.existsSync(path.resolve(path.join(global.static_directory, 'src/js', options.spmDirectory))))) {
		grunt.log.writeln('spm_directory is not exists!');
		process.exit();
	}

	grunt.invokeTask('mop-build', options, function(grunt) {
		try {
			var config = getConfig(options);
			grunt.initConfig(config);
			loadTasks(grunt);

			//根据-m参数判断md5任务的处理方式
			var taskList = [
				'clean:static_dist',
				'csscombo-dist',
				'transport:spm', // src/* -> .build/src/*
				'concat:relative' // .build/src/* -> .build/dist/*.js
			];

			if (hasArgv(process.argv, '--concat-all')) {
				taskList.push('concat:all'); //all
			}

			taskList.push(
				'uglify:js', // .build/dist/*.js -> .build/dist/*.js
				'md5:js', // .build/dist/*.js -> dist/*-md5.js
				'spm-newline',
				'modify-config',
				'copy:sea_modules',
				'clean:spm'
			);

			if (global.template_directory) {
				taskList.push('clean:view_dist');
				taskList.push('tplcompile-dist');
			}

			grunt.registerInitTask('mop-build', taskList);
		} catch (e) {
			grunt.log.error(e);
		}
	});
}

function loadTasks(grunt) {
	// load built-in tasks
	[
		'grunt-cmd-transport',
		'grunt-cmd-concat',
		'grunt-contrib-uglify',
		'grunt-contrib-copy',
		'grunt-contrib-clean',
		'grunt-md5'
	].forEach(function(task) {
		var taskdir = path.join(__dirname, 'node_modules', task, 'tasks');
		if (grunt.file.exists(taskdir)) {
			grunt.loadTasks(taskdir);
		}
	});

	grunt.loadTasks(path.join(__dirname, 'tasks'));
}

exports.loadTasks = loadTasks;
exports.getConfig = getConfig;