"use strict";

const _ = require("lodash");
const path = require("path");

function requireGlobal(packageName) {
    var childProcess = require("child_process");
    var path = require("path");
    var fs = require("fs");

    var globalNodeModules = childProcess
        .execSync("npm root -g")
        .toString()
        .trim();
    var packageDir = path.join(globalNodeModules, packageName);
    if (!fs.existsSync(packageDir))
        packageDir = path.join(
            globalNodeModules,
            "npm/node_modules",
            packageName
        ); //find package required by old npm

    if (!fs.existsSync(packageDir))
        throw new Error("Cannot find global module '" + packageName + "'");

    var packageMeta = JSON.parse(
        fs.readFileSync(path.join(packageDir, "package.json")).toString()
    );
    var main = path.join(packageDir, packageMeta.main);

    return require(main);
}

function requirePkg(packageName) {
    let pkg;
    try {
        require.resolve(packageName);
        pkg = require(packageName);
    } catch (error) {
        pkg = requireGlobal(packageName);
    }
    if (_.isFunction(pkg)) {
        return pkg;
    } else {
        throw new Error(`Cannot find module '${packageName}'`);
    }
}

class Plugin {
    constructor(ctx = {}) {
        this.ctx = ctx;
        this._plugins = [];
    }
    require(plugin) {
        try {
            if (_.isFunction(plugin)) {
                return plugin;
            }
            if (_.isString(plugin)) {
                return requirePkg(plugin);
            }
            throw new Error(`Must be a available modules '${plugin}'`);
        } catch (error) {
            throw error;
        }
    }
    install(plugin) {
        const _index = this._plugins.indexOf(plugin);
        if (_index >= 0) {
            return this;
        }
        const _plugin = this.require(plugin);
        this._plugins.push(_plugin);
        return this;
    }
    uninstall(plugin) {
        const _index = this._plugins.indexOf(plugin);
        if (_index >= 0) {
            plugins.splice(_index, 1);
        }
        return this;
    }
    async run(ctx = this.ctx, ...arg) {
        const _plugins = this._plugins;
        for (let i = 0; i < _plugins.length; i++) {
            await _plugins[i].call(ctx, ctx, ...arg);
        }
    }
    plugins() {
        return this._plugins;
    }
}
module.exports = Plugin;
