#wenke

[![NPM](https://nodei.co/npm/wenke.svg?downloads=true)](https://nodei.co/npm/wenke/)

[![NPM version](https://badge.fury.io/js/wenke.svg)](http://badge.fury.io/js/wenke)
[![dependencies Status](https://david-dm.org/mopduan/wenke.svg)](https://github.com/mopduan/wenke)
[![devDependencies Status](https://david-dm.org/mopduan/wenke/dev-status.svg)](https://github.com/mopduan/wenke)


> wenke 是为腾讯问问 & 百科项目定制开发的前端自动化构建工具，其基于模块化开发思想，wenke为"wenwen and baike"的缩写，有“温可”含义，寓为"温柔可人"，追求*提升项目同学开发效率*，*进一步解耦页面*，模块化开发虽然比较高效好用，但是它的构建有一定的复杂性，wenke基于grunt开发完成了构建功能，*配置灵活*，**因为简单，所以好用**。关于更多模块化开发的资料，请访问：<a href="http://seajs.org/" target="_blank">Sea.js</a>，延伸阅读：<a href="https://github.com/seajs/seajs/issues/547" target="_blank">前端模块化开发的价值</a>


##安装
```
npm install -g wenke
```

##使用说明
```
wenke -w 后端模板文件目录（同时处理多个工程请用"," 英文逗号分隔) -s 静态资源文件目录
```


##目录规范说明

###js文件引入规范
在后端模板中引入的JS主要有3种情况:

1. 直接引入CDN中的JS, 这种引入方法会被 wenke 排除在编译列表之外;

2. 业务共用库, 例如: 

    ```
    <script src="http://local.wenwen.sogou.com/src/js/lib/wenke/entry.js"></script>
    ```

3. 具体页面入口JS文件, 例如:
    
    ```
    <script src="http://local.wenwen.sogou.com/deploy/js/project1/wenke/wenke/bundle.js"></script>
    ```

**注意: **
> 1. 页面入口文件名必须为: main.js
> 2. 地址中的src必须修改为deploy, 这样主要是为了避免svn识别src目录下实时编译产生的中间文件


###后端模板文件目录
> 后端模板文件目录下**必须要有src目录**，例如后端模板文件目录为view的话，如下：

    view
    └─src

  构建后的后端模板文件会放置在与src同级目录下的deploy目录，无需用户手动创建，构建时会自动建立，编译后的目录结构如下：
  
    view
    ├─deploy
    └─src  
    
###静态资源文件目录
> 静态资源根目录下**必须要有src目录**，例如静态资源根目录为static的话，如下：

    static
    └─src

  构建后的静态资源会放置在与src同级目录下的deploy目录，无需用户手动创建，构建时会自动建立，编译后的目录结构如下：
  
    static
    ├─deploy
    └─src  

##demo说明

cd切换至demo目录, 执行如下命令即可看到运行结果: 

```
    wenke -w ./demo/server -s ./demo/static
```

##命令行参数说明

###-s  必需
静态资源文件目录

###-w 必需
后端模板文件目录

###--cdn-root-dir-name
静态资源文件发布所在的CDN目录

###--debug-domain
调试时的静态资源文件域名前缀

###--deploy-domain
JS、CSS文件CDN域名前缀

###--img-deploy-domain
图片类型文件CDN域名前缀

###--local
只进行本地编译, 不上传静态资源文件到CDN

##Report an issue
>欢迎大家将使用wenke中遇到的任何问题提交给我，提问地址：<a href="https://github.com/mopduan/wenke/issues" target="_blank">Report an issue</a>


##Pull Requests
>如果您发现了代码中的问题，可以 <a href="https://github.com/mopduan/wenke/compare/" target="_blank">New pull request</a>


---

如果wenke对您有帮助，欢迎打赏：）

![欢迎打赏](https://cloud.githubusercontent.com/assets/675025/20477523/f4bc4a56-b010-11e6-9b55-13138ffcf0bb.png)


##License

wenke 使用 <a href="https://github.com/mopduan/wenke/blob/master/LICENSE" target="_blank" title="wenke use MIT license">MIT License</a>