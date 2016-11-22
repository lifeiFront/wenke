var utils = require('./utils');
var async = require('async');
var webpack = require("webpack");
var fs = require('fs');
var path = require('path');
var file = require('./file.js');

/**
 *  JS编译
 * @param cb 编译全部完成后的回调
 */
function compile(cb) {
    var compileStart = new Date();
    console.log('jsCompileList：');
    console.log(global.jsCompileList);
    async.map(global.jsCompileList, function (jsCompileItem, callback) {
        var config = {
            context: path.join(global.staticDirectory, global.srcPrefix, 'js'),
            entry: {},
            plugins: [new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            })],
            externals: {
                "react": "React",
                "react-dom": "ReactDOM"
            },
            resolve: {extensions: ['', '.js', '.jsx'], fallback: path.join(__dirname, "/../node_modules")},
            resolveLoader: {fallback: path.join(__dirname, "/../node_modules")},
            module: {
                loaders: [
                    {
                        test: /\.(jpe?g|png|gif|svg)$/i,
                        loaders: [
                            'file?hash=md5&digest=hex&name=[name]_[hash:6].[ext]'
                        ]
                    },
                    {test: /\.(html|tpl)$/, loader: "raw-loader"},
                    {test: /\.css$/, loader: "style-loader!css-loader"},
                    {test: /\.vue/, loader: "vue-loader"}
                ]
            },
            output: {
                path: path.join(global.staticDirectory, global.deployPrefix, 'js', path.dirname(jsCompileItem.path)),
                hashFunction: 'md5',
                hashDigest: 'hex',
                filename: "[name]_[chunkhash:" + global.md5Length + "].js",
                chunkFilename: "[name]_[chunkhash:" + global.md5Length + "].js",
                publicPath: global.deployDomain + global.deployPrefix + 'js/' + path.dirname(jsCompileItem.path) + '/'
            },
            babel: {
                presets: [__dirname + "/../node_modules/babel-preset-latest", __dirname + '/../node_modules/babel-preset-react']
            }
        };

        if (jsCompileItem.path.indexOf('bundle.js') > -1) {
            config.entry[path.basename(jsCompileItem.path, '.js')] = './' + jsCompileItem.path.replace('bundle.js', 'main.js');
        } else {
            config.entry[path.basename(jsCompileItem.path, '.js')] = './' + jsCompileItem.path;
        }

        if (jsCompileItem.babel) {
            var LOOSE = {loose: true};
            config.module.loaders.push({
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                query: {
                    presets: [__dirname + "/../node_modules/babel-preset-latest", __dirname + '/../node_modules/babel-preset-react'],
                    plugins: [
                        [__dirname + '/../node_modules/babel-plugin-transform-es2015-template-literals', LOOSE],
                        [__dirname + '/../node_modules/babel-plugin-transform-es2015-classes', LOOSE],
                        [__dirname + '/../node_modules/babel-plugin-transform-es2015-computed-properties', LOOSE],
                        [__dirname + '/../node_modules/babel-plugin-transform-es2015-for-of', LOOSE],
                        [__dirname + '/../node_modules/babel-plugin-transform-es2015-spread', LOOSE],
                        [__dirname + '/../node_modules/babel-plugin-transform-es2015-destructuring', LOOSE],
                        [__dirname + '/../node_modules/babel-plugin-transform-es2015-modules-commonjs', LOOSE]
                    ],
                    compact: false
                }
            });
        }

        if (jsCompileItem.path.indexOf('bundle.js') > -1) {
            config.entry[path.basename(jsCompileItem.path, '.js')] = './' + jsCompileItem.path.replace('bundle.js', 'main.js');
        } else {
            config.entry[path.basename(jsCompileItem.path, '.js')] = './' + jsCompileItem.path;
        }

        webpack(config,
            function (err, stats) {
                if (err) {
                    throw err;
                    process.exit();
                }

                if (stats.hasErrors()) {
                    console.log('webpack error! ');
                    console.log(stats.toString());
                    process.exit();
                }

                console.log(stats.toString());

                //生成静态资源映射表
                for (var k in stats.compilation.assets) {
                    var newPath = stats.compilation.assets[k].existsAt;
                    newPath = utils.normalizePath(newPath);
                    var cdnPath = utils.normalizePath(path.join('/', utils.normalizePath(newPath).replace(global.staticDirectory, '')));

                    var src = global.deployDomain + cdnPath;
                    var basenameNoExt = path.basename(cdnPath).split('_')[0];
                    var key = utils.normalizePath(path.join(path.dirname(cdnPath), (basenameNoExt.toLowerCase() == 'main' ? 'bundle' : basenameNoExt) + path.extname(cdnPath))).replace(global.srcPrefix, global.deployPrefix).replace(/[\\|/|\.]/ig, '_');
                    global.staticFilesMapHash[key] = src;
                }

                callback();
            }
        );
    }, function (err) {
        if (err) {
            throw err;
        }

        var compileEnd = new Date();
        console.log('js-compile-complete: spend ' + (compileEnd - compileStart) + ' ms!');
        cb();
    });
}

exports.compile = compile;