#wenke

[![NPM](https://nodei.co/npm/wenke.png?downloads=true)](https://nodei.co/npm/wenke/)

[![NPM version](https://badge.fury.io/js/wenke.png)](http://badge.fury.io/js/wenke)
[![Build Status](https://travis-ci.org/mopduan/wenke.png?branch=master)](https://travis-ci.org/mopduan/wenke)
[![dependencies Status](https://david-dm.org/mopduan/wenke.png)](https://github.com/mopduan/wenke)
[![devDependencies Status](https://david-dm.org/mopduan/wenke/dev-status.png)](https://github.com/mopduan/wenke)


> wenke 是为腾讯问问 & 百科项目定制开发的前端自动化构建工具，其基于模块化开发思想，wenke为"wenwen and baike"的缩写，有“温可”含义，寓为"温柔可人"，追求*提升项目同学开发效率*，*进一步解耦页面*，模块化开发虽然比较高效好用，但是它的构建有一定的复杂性，wenke基于grunt开发完成了构建功能，*配置灵活*，**因为简单，所以好用**。关于更多模块化开发的资料，请访问：<a href="http://seajs.org/" target="_blank">Sea.js</a>，延伸阅读：<a href="https://github.com/seajs/seajs/issues/547" target="_blank">前端模块化开发的价值</a>

##安装
```
npm install -g wenke
```

##使用说明
```
wenke -s 静态资源文件目录
```


##Demo for wenke
> 为wenke写的一个非常简单的demo， 请移步：<a href="https://github.com/mopduan/wenke-demo.git" target="_blank" title="专为wenke写的简单入门demo">demo for wenke</a>


##目录规范说明

###静态资源目录
> 静态资源根目录下**必须要有src目录**，例如静态资源根目录为static的话，如下：

    static
    └─src

  构建后的静态资源会放置在与src同级目录下的deploy目录，无需用户手动创建，构建时会自动建立，编译后的目录结构如下：
  
    static
    ├─deploy
    └─src  
    
####JS配置文件
>js目录下必须要有map.json文件，用于指定 *transport规则*，例如

```javascript
{
    "spm" : {
        "output" : {
            "relative" : [
                "page/mask/main.js"
            ]
        },
        "alias" : {
			
        }
    }
}
```

####CSS配置文件
>css目录下必须要有map.json文件，用于指定 *css合并打包规则*，例如：

```javascript
{
	"pack": {
		"pkg/page/mask/mask.css": [
			"base/base.css",
			"page/mask/mask.css"
		]
	}
}
```

###模板目录规范说明  
> 模板文件不是必须选项，但是如果指定编译模板的话，也需要满足如下规范：
  
    view
    └─src  

  同样，编译后的目录结构如下：
  
    view
    ├─deploy
    └─src  
  
##调试说明
> wenke可以非常方便地实现线下模拟线上的调试，__快速定位并解决问题__



##命令行参数说明

###-s  <span style="color:red;">必需</span>
静态资源文件夹目录

###-t
模板文件夹目录

###-m
是否为编译后的静态资源文件增加md5戳

###--spm-directory
指定的js业务文件夹，默认为 wenwen，目前暂时不支持同时编译多个业务文件夹，后续版本会支持

###--debug-domain
调试时的静态资源文件域名前缀

###--deploy-domain
上线后的静态资源文件域名前缀

###--static-map-path
如果是maven目录结构的话可以指定生成的静态资源映射表的生成路径

###--static-map-function
获取静态资源文件映射关系的函数名

###--concat-all
是否合并非相对路径模块

###--sea-modules-directory
seajs模块文件夹名称

##Report an issue
>欢迎大家将使用wenke中遇到的任何问题提交给我，提问地址：<a href="https://github.com/mopduan/wenke/issues" target="_blank">Report an issue</a>


##Pull Requests
>如果您发现了代码中的问题，可以 <a href="https://github.com/mopduan/wenke/compare/" target="_blank">New pull request</a>


##Release History
+    Mar. 31 2014 1.1.1 版本发布 修复mac、*nix下npm发包line endings问题

+    Mar. 28 2014 1.1.0 版本发布 增加--clean-view-dist配置

+    Mar. 25 2014 1.0.10 版本发布 增加clean-css依赖，默认抛出构建异常信息，限制bin/wenke换行符为unix风格

+    Mar. 25 2014 1.0.5 版本发布 修改模板文件生成方法$.xml为$.html，增加sea_modules_directory配置

+    Mar. 24 2014 1.0.4 版本发布 删除冗余的--version-tag

+    Mar. 20 2014 1.0.3 版本发布 更新配置

+    Mar. 16 2014 1.0.2 版本发布 分离-m与--static-map-path功能

+    Mar. 10 2014 1.0.1 版本发布 增加构建出错时，stack信息是否输出的选项
  
+    Mar. 8 2014 1.0.0 版本发布
  
+    每天都有快速迭代，并且在问问和百科新上线项目中应用
  
+    Feb. 14 2014 创建工程，完成相关初始化操作
  


##License

wenke 使用 <a href="https://github.com/mopduan/wenke/blob/master/LICENSE" target="_blank" title="wenke use MIT license">MIT License</a>
