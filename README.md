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
const doc = new kdoc(src,output)//src为源目录,output为输出目录
const doc2 = new kdoc(src,output)//src为源目录,output为输出目录

doc.run()
doc2.run()

async function sequential() {
    console.log("======串行开始");
    await doc.run();
    await doc2.run();
    console.log("======串行结束");
}
sequential(); //串行

```

```shell
#shell
kdoc -s ./api/**/*.md -o ./dist/api
kdoc -s ./pages/**/*.md -o ./dist/pages
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

    module.exports = plugin
    ```

    ```js
    /*
    *node
    */
    //index.js
    const kdoc = require('kdoc')
    const plugin = require('./plugin.js')
    const path = require('path')
    const doc = new kdoc(src,output)//src为源目录,output为输出目录
    const plugin2 = function(ctx) {
        console.log("=====plugin");
    };
    const plugin3 = function(ctx) {
        console.log("=====plugin2");
    };

    kdoc.use(plugin);//此时plugin 中的ctx 代表的为KDoc类原型
    kdoc.use(path.resolve(__dirname,'./plugin.js')); //此时plugin 中的ctx 代表的为KDoc类原型
    doc.use(plugin2);
    doc.use(plugin3);

    doc.run().then(function(){}) //此方法为异步方法 , 提供then 与 call 两种方式回调
    doc.run(function(){})
    doc.run() //无回调

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
    const doc = new kdoc(src,output)//src为源目录,output为输出目录
    kdoc.hook.add('initBefore',function(ctx){ // 所有实例都会执行
      const self = this //此为当前实例
      console.log(ctx) //此为当前实例
    })
    doc.hook.add('initBefore',function(){ //当前实例执行
      const self = this //此为当前实例
      console.log(ctx) //此为当前实例
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
