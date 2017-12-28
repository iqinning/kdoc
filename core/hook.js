"use strict";
const chalk = require("chalk");
const hookNames = [];
class Hook {
    constructor(ctx = {}, names = hookNames) {
        this.ctx = ctx;
        this.hooks = {};
        this.hookNames = names;
    }
    isUsableHook(hookName) {
        if (this.hookNames.length <= 0) {
            return true;
        }
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
    async run(hookName, ctx = this.ctx, ...arg) {
        this.isUsableHook(hookName);
        const hookList = this.hooks[hookName];
        if (hookList) {
            console.log(`hook ${hookName} is ${chalk.green("running...")}`);
            for (let i = 0; i < hookList.length; i++) {
                await hookList[i].call(ctx, ctx, ...arg);
            }
            console.log(`hook ${hookName} is ${chalk.green("end...")}`);
        }
    }
}

module.exports = Hook;
