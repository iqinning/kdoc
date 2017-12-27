"use strict";
const _ = require("lodash");
const path = require("path");
const Hook = require("./core/hook");
const Plugin = require("./core/plugin");
const glob = require("glob");
const md = require("markdown-it");
class KDoc {
    constructor(src, output, hook = new Hook(this), plugin = new Plugin(this)) {
        this.data = {};
        this.global = {};
        this.hook = hook || {};
        this.plugin = plugin || {};
        this.setSrc(src);
        this.setOutput(output);
        this.scanPath();
    }
    use(plugin, ...arg) {
        this.plugin.install(plugin, this, ...arg);
    }
    interface(name, handler) {
        KDoc.prototype[name] = handler;
    }
    async output() {
        await KDoc.hook.run("outputBefore", this);
        await this.hook.run("outputBefore", this);

        await KDoc.hook.run("outputAfter", this);
        await this.hook.run("outputAfter", this);
    }
    async init() {
        await KDoc.hook.run("initBefore", this);
        await this.hook.run("initBefore", this);

        await KDoc.hook.run("initAfter", this);
        await this.hook.run("initAfter", this);
    }
    async md() {
        await KDoc.hook.run("mdBefore", this);
        await this.hook.run("mdBefore", this);

        await KDoc.hook.run("mdAfter", this);
        await this.hook.run("mdAfter", this);
    }
    async run(cb) {
        //初始化操作
        await this.init();

        //编译md部分
        await this.md();

        //输出
        await this.output();

        _.isFunction(cb) && cb();
        
        return this;
    }
    setSrc(src) {
        this.data.src = path.resolve(process.cwd(), src);
        return this;
    }
    setOutput(output) {
        this.data.output = path.resolve(process.cwd(), output);
        return this;
    }
    scanPath(_path) {
        _path = _path || this.data.src;
        const dir = path.dirname(_path);
        const files = glob.sync(_path, {
            ignore: `${dir}/node_modules/**/*`,
            nodir: true
        });
        this.data.files = files;
        return this;
    }
}

KDoc.hook = new Hook();
KDoc.plugin = new Plugin();

KDoc.use = (plugin, ...arg) => {
    KDoc.plugin.install(plugin, KDoc, ...arg);
};

module.exports = KDoc;
