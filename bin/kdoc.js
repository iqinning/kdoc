#!/usr/bin/env node  --harmony
"use strict";
const program = require("commander");
const KDoc = require("../index");
const path = require("path");
const chalk = require("chalk");
const _ = require("lodash");


const list = function(val) {
    return val.split(",");
};

program
    .version("0.1.0")
    .option(
        "-p, --plugins <plugins> <options>",
        "add plugins,可以被require引入的模块名,或js文件路径,逗号分隔,qs可以传递参数,请参见文档",
        list
    )
    .option("--addmd <addmd>", `是否添加md插件`, false)
    .option("--addpug <addpug>", `是否添加pug插件`, false)
    .option(
        "-s, --src <src>",
        `src path,${chalk.red(
            "glob模式时必须使用引号包裹,逗号分隔"
        )},当前目录的相对路径,或绝对路径`,
        list,
        ["./**/*.md", "!./node_modules/**/*", "!./dist/**/*"]
    )
    .option(
        "-o, --output <output>",
        "output path,当前目录的相对路径,或绝对路径",
        "./dist"
    )
    .parse(process.argv);

const doc = new KDoc(program.src, program.output);

_.each(program.plugins, function(plugin) {
    doc.use(plugin);
});

if (program.addmd) {
    doc.use(KDoc.plugins.md);
}
if (program.addpug) {
    doc.use(KDoc.plugins.pugRender);
}


doc.run();
