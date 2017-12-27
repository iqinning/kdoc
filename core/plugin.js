"use strict";

const _ = require("lodash");
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
                require.resolve(plugin);
                const _plugin = require(plugin);
                if (_.isFunction(_plugin)) {
                    return _plugin;
                }
            }
            return false;
        } catch (error) {
            return false;
        }
    }
    install(plugin, ctx = this.ctx, ...arg) {
        const _index = this._plugins.indexOf(plugin);
        if (_index >= 0) {
            return this;
        }
        const _plugin = this.require(plugin);
        if (_plugin) {
            _plugin.call(ctx, ctx, ...arg);
            this._plugins.push(_plugin);
        }
        return this;
    }
    uninstall(plugin) {
        const _index = this._plugins.indexOf(plugin);
        if (_index >= 0) {
            plugins.splice(_index, 1);
        }
        return this;
    }
    plugins() {
        return this._plugins;
    }
}
module.exports = Plugin;
