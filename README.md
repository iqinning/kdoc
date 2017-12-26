# kdoc

## 这是一个文档生成工具

### folder

```bash
.
├── bin                 #shell可执行文件
├── index.js
├── core
│   ├── hook.js         #钩子管理
│   └── plugin.js   	#插件管理
├── node_modules        #依赖node 包文件
└── package.json        #包配置文件
```

### install

```Shell
npm install kdoc -g 
#or
npm install kdoc -S
```



### run

> 支持node与shell命令行

```js
/*
*node
*/
const kdoc = require('kdoc')
const doc = kdoc(src,output)//src为源目录,output为输出目录
doc.run()
```

```shell
#shell
kdoc -s ./**/* -o ./dist
```



### features

1. 支持插件机制
    
    > - 插件为node模块只要能够被 require
    > - es6模块请注意`export default {}` 与 `module.exports = {}` 的区别 ,`module.exports = exports['default']`
    > - 如果使用babel 可以使用[babel-plugin-add-module-exports](https://github.com/59naga/babel-plugin-add-module-exports)
    > - 插件提供生命周期钩子, install , 与 uninstall 
    > - 必须导出为可执行函数 , 如不是函数则不会被执行
    
    ```js
    //plugin.js
    const plugin2 = require('./plugin2')
    const plugin = function (ctx){ //ctx为kdoc实例
        //装载时执行
        ctx.interface('pluginHandler',function(){//在原型链上注册方法
    		console.log('run pluginHandler ing...')
        })
      	console.log(ctx.data) //kdoc实例中共享的数据
        ctx.pluginHandler2 = function(){//在实例上注册方法
    		console.log('run pluginHandler2 ing...')
        }
      	ctx.plugin.install(plugin2);//添加额外的插件
        ctx.hook.add('initBefore',function (ctx){ //注册新的钩子
            //初始化之前
        })
    }
    
    plugin.install = function(){
      console.log('plugin will install')
    } //插件安装时执行
    plugin.uninstall = function(){
      console.log('plugin will uninstall')
    } //插件卸载时执行
    
    module.exports = plugin
    ```
    
    ```js
    /*
    *node
    */
    //index.js
    const kdoc = require('kdoc')
    const plugin = require('./plugin.js')
    const doc = kdoc(src,output)//src为源目录,output为输出目录
    doc.plugin.install(plugin)
    doc.run()
    ```
    


2. 提供hook
    
    ```js
    /**
    ctx 提供如下 usable hook :
    initBefore
    initAfter
    mdBefore
    mdAfter
    scriptBefore
    scriptAfter
    outputBefore
    outputAfter
    */
    const kdoc = require('kdoc')
    const doc = kdoc(src,output)//src为源目录,output为输出目录
    doc.hook.add('initBefore',function(){
      const self = this
      return new Promise(function(resolve) {
        setTimeout(function() {
          console.log("ctx",self);
          resolve();
        }, 1001);
      });
    })
    doc.run()
    ```

### notes
