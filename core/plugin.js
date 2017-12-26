"use strict";

const _ = require("lodash");
class plugin {
    constructor(plugins) {
        this.ctx = {};
        this._ctx = {};
        this.plugins = plugins || [];
    }
    require(plugin) {
        try {
            require.resolve(plugin);
            return require(plugin);
        } catch (error) {
            return null;
        }
    }
    install(plugin) {
        try {
            require.resolve(plugin);
            plugins.push({
                path: plugin,
                source: require(plugin)
            });
            return require(plugin);
        } catch (error) {
            return null;
        }
    }
    uninstall(plugin) {
        try {
            const _index = _.findIndex(plugins, function(obj) {
                return obj.path === plugin;
            });
            plugins.splice(_index, 1);
        } catch (error) {}
    }
    find(plugin) {
        try {
            const _index = _.findIndex(plugins, function(obj) {
                return obj.path === plugin;
            });
            return _index > -1 ? plugins[_index]["source"] : null;
        } catch (error) {
            return null;
        }
    }
    all() {
        const result = [];
        _.each(plugins, function(plugin) {
            result.push(plugin.source);
        });
        return result;
    }
}

module.exports = plugin;
