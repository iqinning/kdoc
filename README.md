# kdoc

## 这是一个文档生成工具

### folder

```bash
.
├── bin                 #shell可执行文件
├── index.js
├── core
│   ├── hook.js         #钩子管理
│	├── glob.js         #解析路径
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
const doc = new kdoc(src , output , options)//src[array<string>]为源目录,output[string]为输出目录
const doc2 = new kdoc(src , output , options)//src[array<string>]为源目录,output[string]为输出目录

doc.run()
doc2.run()

//串行
async function run(){
  await doc.run()
  await doc2.run()
} 
run()

```

```shell
#shell
kdoc -h #获取帮助
kdoc -s ./api/**/*.md -o ./dist/api -p './plugin/plugin1.js,./plugin/plugin2.js'
kdoc -s ./pages/**/*.md -o ./dist/pages
```



### features

1. 支持插件机制

    > - 插件为node模块只要能够被 require
    > - es6模块请注意`export default {}` 与 `module.exports = {}` 的区别 ,`module.exports = exports['default']`
    > - 如果使用babel 可以使用[babel-plugin-add-module-exports](https://github.com/59naga/babel-plugin-add-module-exports)
    > - 必须导出为可执行函数 , 如不是函数则不会被执行
    > - 将会按照装载顺序执行
    > - 相同的plugin只会执行一次
    > - 支持异步promise

    ```js
    //plugin.js
    const plugin2 = require('./plugin2')
    const plugin = function (ctx){ //ctx为kdoc实例
      	ctx.data.files //这里是所有的文件对象 , key为文件路径 , value为虚拟的File对象 , 在插件中可以通过更改File.contents改变输出结果
        //装载时执行
        ctx.interface('pluginHandler',function(){//在原型链上注册方法
    		console.log('run pluginHandler ing...')
        })
      	console.log(ctx.data) //kdoc实例中共享的数据
        ctx.pluginHandler2 = function(){//在实例上注册方法
    		console.log('run pluginHandler2 ing...')
        }
      	ctx.use(plugin2);//添加额外的插件
        ctx.hook.add('initBefore',function (ctx){ //注册新的钩子
            //初始化之前
        })
      	return new Promise(function(resolve,reject){})
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
    const doc = new kdoc(src , output)

    const plugin2 = function(ctx,...arg) {
        console.log("=====plugin");
    };

    const plugin3 = function(ctx,...arg) {
        console.log("=====plugin2",...arg);
    };

    kdoc.use(plugin);//此时plugin 中的ctx 代表doc 实例 , 使用ctx.prototype 将能访问KDoc
    kdoc.use(path.resolve(__dirname,'./plugin.js'));//此时plugin 中的ctx 代表doc 实例 , 使用ctx.prototype 将能访问KDoc
    doc.use(plugin2,'a','b','c');//此时plugin 中的ctx 代表doc 实例 , 使用ctx.prototype 将能访问KDoc
    doc.use(plugin3,'a','b','c');//此时plugin 中的ctx 代表doc 实例 , 使用ctx.prototype 将能访问KDoc
    ```


    ​```


2. 提供hook

    ```js
    /**
    ctx 内置提供如下 usable hook :
    scan.before
    scan.after
    pipe
    dist.before
    dist.after
    */
    const kdoc = require('kdoc')
    const doc = new kdoc(src , output)//src为源目录,output为输出目录
    const doc2 = new kdoc(src , output)//src为源目录,output为输出目录

    /**支持自定义hook**/
    kdoc.hook.add('aaaa',function(){})
    kdoc.hook.run('aaaa')
    /**支持自定义hook**/

    kdoc.hook.add('pipe',function(file){ // 所有实例都会执行
      const self = this //此为当前实例
      console.log(file) //此为当前文件
    })
    doc.hook.add('pipe',function(file){ // 当前实例执行
      const self = this //此为当前实例
      console.log(file) //此为当前文件
      return new Promise(function(resolve,reject) {
        setTimeout(function() {
          console.log("ctx",self);
          resolve();
        }, 1001);
      });
    })

    doc.run()
    doc2.run()
    ```

### API
```js

```

### notes
