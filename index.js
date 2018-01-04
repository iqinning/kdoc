#!/usr/bin/env node  --harmony
"use strict";
const _ = require("lodash");
const path = require("path");
const Hook = require("./core/hook");
const Plugin = require("./core/plugin");
const glob = require("./core/glob");
const vinylFile = require("vinyl-file");
const Vinyl = require("vinyl");
const pify = require("pify");
const fs = pify(require("graceful-fs"));
const mkdirp = pify(require("mkdirp"));
const rimraf = pify(require("rimraf"));
const markedPlugin = require("kdoc-plugin-md");
const pugRenderPlugin = require("kdoc-plugin-pugrender");

class KDoc {
    constructor(
        src,
        output,
        {
            hook = new Hook(this),
            plugin = new Plugin(this),
            globOptions = {},
            debug = false
        } = {}
    ) {
        this.data = {
            files: [],
            src: [],
            output: "./dist"
        };
        this.hook = hook;
        this.plugin = plugin;
        this.globOptions = globOptions;
        this.debug = debug;
        this.setSrc(src);
        this.setOutput(output);
    }
    async each(list, handler) {
        for (let index = 0; index < list.length; index++) {
            try {
                const item = list[index];
                await handler.call(this, item, index);
            } catch (error) {
                throw error;
            }
        }
    }
    async fsEach(handler) {
        const _files = this.data.files;
        try {
            await this.each(_files, handler);
        } catch (error) {
            throw error;
        }
    }
    fsAdd(_files) {
        if (!Array.isArray(_files)) {
            _files = [_files];
        }
        this.data.files = [...new Set([...this.data.files, ..._files])];
    }
    fsRemove(_files) {
        if (!Array.isArray(_files)) {
            _files = [_files];
        }
        this.data.files = [
            ...new Set([...this.data.files].filter(x => !_files.includes(x)))
        ];
    }
    fsNew(obj) {
        return new Vinyl(obj);
    }
    async fsWrite(_path, _content) {
        if (!_path || !_content) {
            return;
        }
        const dirname = path.dirname(_path);
        await mkdirp(dirname);
        await fs.writeFile(_path, _content, {
            flag: "w+"
        });
    }
    async scan() {
        await KDoc.hook.run("scan.before", this);
        await this.hook.run("scan.before", this);
        const _paths = await this.paths();
        const _files = [];
        await this.each(_paths, async function(_path) {
            const _file = await vinylFile.read(_path);
            _files.push(_file);
        });
        this.fsAdd(_files);
        await KDoc.hook.run("scan.after", this);
        await this.hook.run("scan.after", this);
    }
    async dist() {
        let _output = this.data.output;
        await this.fsEach(async file => {
            await KDoc.hook.run("pipe", this, file);
            await this.hook.run("pipe", this, file);
        });
        await KDoc.hook.run("dist.before", this, this.data.files);
        await this.hook.run("dist.before", this, this.data.files);
        await this.fsEach(async file => {
            if (!file.contents) {
                return;
            }
            file.path = path.join(_output, file.relative);
            await this.fsWrite(file.path, file.contents);
        });
        await KDoc.hook.run("dist.after", this, this.data.files);
        await this.hook.run("dist.after", this, this.data.files);
    }
    async del(_paths, globOptions) {
        _paths = await glob(_paths, globOptions);
        for (let i = 0; i < _paths.length; i++) {
            const _path = _paths[i];
            await rimraf(_path);
        }
    }
    async run() {
        await KDoc.plugin.run(this);
        await this.plugin.run(this);
        await this.scan();
        await this.dist();
    }
    use(plugin) {
        this.plugin.install(plugin);
    }
    interface(name, handler) {
        KDoc.prototype[name] = handler;
    }
    setSrc(src) {
        if (!Array.isArray(src)) {
            src = [src];
        }
        this.data.src = this.data.src || [];
        this.each(src, s => {
            this.data.src.push(s);
        });
        return this.data.src;
    }
    setOutput(output) {
        this.data.output = path.resolve(process.cwd(), output);
    }
    async paths(_paths) {
        _paths = _paths || this.data.src;
        _paths = await glob(
            _paths,
            Object.assign(
                {
                    nodir: true
                },
                this.globOptions
            )
        );
        return _paths;
    }
}

const use = function(plugin) {
    KDoc.plugin.install(plugin);
};

KDoc.hook = new Hook();
KDoc.plugin = new Plugin();
KDoc.plugins = {
    md: markedPlugin,
    pugRender: pugRenderPlugin
};
KDoc.use = use;
KDoc.prototype.fs = fs;
KDoc.prototype.vf = Vinyl;
KDoc.prototype.mkdirp = mkdirp;
KDoc.prototype.rimraf = rimraf;

module.exports = KDoc;
