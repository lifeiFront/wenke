#wenke

[![NPM](https://nodei.co/npm/wenke.png)](https://nodei.co/npm/wenke/)

[![NPM version](https://badge.fury.io/js/wenke.png)](http://badge.fury.io/js/wenke)
[![Build Status](https://travis-ci.org/skyaspnet/wenke.png?branch=master)](https://travis-ci.org/skyaspnet/wenke)
[![dependencies Status](https://david-dm.org/skyaspnet/wenke.png)](https://github.com/skyaspnet/wenke)
[![devDependencies Status](https://david-dm.org/skyaspnet/wenke/dev-status.png)](https://github.com/skyaspnet/wenke)


> 腾讯问问 & 百科项目定制开发的前端自动化构建工具，wenke为"wenwen and baike"的缩写，有“温可”含义，寓为"温柔可人"，对开发同学和项目友好，配置灵活，**因为简单，所以好用**。


##安装
```
npm install -g wenke
```

##Demo for wenke
> 为wenke写的一个非常简单的demo， 请移步：<a href="https://github.com/skyaspnet/wenke-demo.git" target="_blank" title="专为wenke写的简单入门demo">demo for wenke</a>


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

###--stack
启用grunt编译遇到错误时抛出堆栈信息

##Report an issue
>欢迎大家将使用wenke中遇到的任何问题提交给我，提问地址：<a href="https://github.com/skyaspnet/wenke/issues" target="_blank">Report an issue</a>


##Pull Requests
>如果您发现了代码中的问题，可以 <a href="https://github.com/skyaspnet/wenke/compare/" target="_blank">New pull request</a>


##Release History
+    Mar. 20 2014 1.0.1 版本发布 增加构建出错时，stack信息是否输出的选项
  
+    Mar. 18 2014 1.0.0 版本发布
  
+    每天都有快速迭代，并且在问问和百科新上线项目中应用
  
+    Feb. 14 2014 创建工程，完成相关初始化操作
  


##License

wenke 使用 <a href="https://github.com/skyaspnet/wenke/blob/master/LICENSE" target="_blank" title="wenke use MIT license">MIT License</a>
