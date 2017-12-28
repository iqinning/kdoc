"use strict";
const _ = require("lodash");
const path = require("path");
const Hook = require("./core/hook");
const Plugin = require("./core/plugin");
const glob = require("./core/glob");
const vinylFile = require("vinyl-file");

const pify = require("pify");
const fs = pify(require("graceful-fs"));
const mkdirp = pify(require("mkdirp"));
const rimraf = pify(require("rimraf"));

class KDoc {
    constructor(
        src,
        output,
        globOptions,
        hook = new Hook(this),
        plugin = new Plugin(this)
    ) {
        this.data = {
            files: {},
            src: [],
            paths: [],
            output: ""
        };
        this.hook = hook || {};
        this.plugin = plugin || {};
        this.globOptions = globOptions || {};
        this.setSrc(src);
        this.setOutput(output);
    }
    async generateFiles(_paths) {
        const files = {};
        for (let i = 0; i < _paths.length; i++) {
            const _path = _paths[i];
            files[_path] = await vinylFile.read(_path);
        }
        this.data.files = Object.assign(this.data.files, files);
        return files;
    }
    async scan() {
        await KDoc.hook.run("scan.before");
        await this.hook.run("scan.before");
        const paths = await this.paths();
        await this.generateFiles(paths);
        await KDoc.hook.run("scan.after");
        await this.hook.run("scan.after");
    }
    async dist() {
        await KDoc.hook.run("dist.before");
        await this.hook.run("dist.before");
        const files = this.data.files;
        const output = this.data.output;
        const _paths = Object.keys(files);
        for (let i = 0; i < _paths.length; i++) {
            const _path = _paths[i];
            const _output = path.join(output, _path);
            const dir = path.dirname(_output);
            const _contents = files[_path].contents;
            await mkdirp(dir);
            await fs.writeFile(_output, _contents, {
                flag: "w+"
            });
        }
        await KDoc.hook.run("dist.after");
        await this.hook.run("dist.after");
    }
    async del(_paths, globOptions) {
        _paths = await glob(_paths, globOptions);
        for (let i = 0; i < _paths.length; i++) {
            const _path = _paths[i];
            await rimraf(_path);
        }
    }
    async run() {
        await this.scan();
        await KDoc.plugin.run(this);
        await this.plugin.run(this);
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
        _.each(src, s => {
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
        this.data.paths = _paths;
        return this.data.paths;
    }
}

const use = function(plugin) {
    KDoc.plugin.install(plugin);
};

KDoc.hook = new Hook();
KDoc.plugin = new Plugin();
KDoc.use = use;

module.exports = KDoc;
