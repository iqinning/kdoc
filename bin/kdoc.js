#!/usr/bin/env node  --harmony
"use strict";
const program = require("commander");
const KDoc = require("../index");
const path = require("path");
const chalk = require("chalk");

program
    .version("0.1.0")
    .option(
        "-p, --plugins <plugins>",
        "add plugins,可以被require引入的模块名,或js文件路径,逗号分隔"
    )
    .option(
        "-s, --src <src>",
        `src path,${chalk.red(
            "glob模式时必须使用引号包裹"
        )},当前目录的相对路径,或绝对路径`,
        `./**/*.md`
    )
    .option(
        "-o, --output <output>",
        "output path,当前目录的相对路径,或绝对路径",
        "./mds"
    )
    .parse(process.argv);

const doc = new KDoc(program.src, program.output);
doc.run();
