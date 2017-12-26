"use strict";
const _ = require("lodash");
const path = require("path");
const hook = require("./core/hook");
const plugin = require("./core/plugin");
const glob = require("glob");
const md = require("markdown-it");
class main {
    constructor(src, output, hook, plugin) {
        this.hook = hook || {};
        this.hook.ctx = this || {};
        this.hook._ctx = main;
        this.plugin = plugin || {};
        this.plugin.ctx = this || {};
        this.plugin._ctx = main || {};
        this.data = {};
        this.setSrc(src);
        this.setOutput(output);
        this.scanPath();
    }
    interface(name, handler) {
        main.prototype[name] = handler;
    }
    initHandler() {}
    htmlHandler() {}
    scriptHandler() {}
    mdHandler() {}
    outputHandler() {}
    async run() {
        //初始化操作
        await this.hook.run("initBefore");
        this.initHandler();
        await this.hook.run("initAfter");

        //编译html部分
        await this.hook.run("htmlBefore");
        this.htmlHandler();
        await this.hook.run("htmlAfter");

        //解析脚本部分
        await this.hook.run("scriptBefore");
        this.scriptHandler();
        await this.hook.run("scriptAfter");

        //编译md部分
        await this.hook.run("mdBefore");
        this.mdHandler();
        await this.hook.run("mdAfter");

        //输出
        await this.hook.run("outputBefore");
        this.outputHandler();
        await this.hook.run("outputAfter");

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

module.exports = function(src, output, h, p) {
    const m = new main(src, output, h || new hook(), p || new plugin());
    return m;
};
