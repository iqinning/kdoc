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

class KDoc {
    constructor(
        src,
        output,
        globOptions,
        hook = new Hook(this),
        plugin = new Plugin(this)
    ) {
        this.data = {
            files: [],
            src: [],
            output: "./dist"
        };
        this.hook = hook || {};
        this.plugin = plugin || {};
        this.globOptions = globOptions || {};
        this.setSrc(src);
        this.setOutput(output);
    }
    get fs() {
        fs.each = async handler => {
            const _files = this.data.files;
            for (let index = 0; index < _files.length; index++) {
                const _file = _files[index];
                await handler.call(this, _file, index);
            }
        };
        fs.add = _files => {
            if (!Array.isArray(_files)) {
                _files = [_files];
            }
            this.data.files = [...new Set([...this.data.files, ..._files])];
        };
        fs.remove = _files => {
            if (!Array.isArray(_files)) {
                _files = [_files];
            }
            this.data.files = [
                ...new Set(
                    [...this.data.files].filter(x => !_files.includes(x))
                )
            ];
        };
        fs.new = obj => {
            return new Vinyl(obj);
        };
        return fs;
    }
    async scan() {
        await KDoc.hook.run("scan.before");
        await this.hook.run("scan.before");
        const paths = await this.paths();
        const _files = [];
        for (let i = 0; i < paths.length; i++) {
            const _path = paths[i];
            const _file = await vinylFile.read(_path);
            _files.push(_file);
        }
        this.fs.add(_files);
        await KDoc.hook.run("scan.after");
        await this.hook.run("scan.after");
    }
    async dist() {
        let _output = this.data.output;
        await this.fs.each(async file => {
            if (!file.contents) {
                return;
            }
            file.path = path.join(_output, file.relative);
            file.dirname = path.dirname(file.path);
            await mkdirp(file.dirname);
            await KDoc.hook.run("dist.before", this, file);
            await this.hook.run("dist.before", this, file);
            await fs.writeFile(file.path, file.contents, {
                flag: "w+"
            });
            await KDoc.hook.run("dist.after", this, file);
            await this.hook.run("dist.after", this, file);
        });
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
        return _paths;
    }
}

const use = function(plugin) {
    KDoc.plugin.install(plugin);
};

KDoc.hook = new Hook();
KDoc.plugin = new Plugin();
KDoc.use = use;

module.exports = KDoc;
