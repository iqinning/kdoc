"use strict";
const chalk = require("chalk");
class hook {
    constructor(hookNames) {
        this.ctx = {};
        this._ctx = {};
        this.hooks = {};
        this.hookNames = hookNames || [
            "initBefore",
            "initAfter",
            "mdBefore",
            "mdAfter",
            "htmlBefore",
            "htmlAfter",
            "scriptBefore",
            "scriptAfter",
            "outputBefore",
            "outputAfter"
        ];
    }
    isUsableHook(hookName) {
        const _findIndex = this.hookNames.indexOf(hookName);
        if (_findIndex < 0) {
            throw new Error(
                `${hookName} don't support , usable hook : ${this.hookNames.join(
                    "、"
                )}`
            );
        } else {
            return;
        }
    }
    remove(hookName, hookFunction) {
        this.isUsableHook(hookName);
        let hookList = this.hooks[hookName];
        const _findIndex = hookList.indexOf(hookFunction);
        if (_findIndex >= 0) {
            hookList.splice(_findIndex, 1);
            this.hooks[hookName] = hookList;
        }
    }
    add(hookName, hookFunction) {
        this.isUsableHook(hookName);
        let hookList = this.hooks[hookName];
        if (hookList) {
            hookList.push(hookFunction);
        } else {
            hookList = [hookFunction];
        }
        this.hooks[hookName] = hookList;
    }
    async run(hookName) {
        this.isUsableHook(hookName);
        const hookList = this.hooks[hookName];
        if (hookList) {
            console.log(`hook ${hookName} is ${chalk.green("running...")}`);
            for (var i = 0; i < hookList.length; i++) {
                await hookList[i].call(this.ctx);
            }
            console.log(`hook ${hookName} is ${chalk.green("end...")}`);
        }
    }
}

module.exports = hook;
