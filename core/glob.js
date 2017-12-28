const sourceGlob = require("glob");
const _ = require("lodash");

function isNegatedGlob(pattern) {
    if (typeof pattern !== "string") {
        throw new Error("must be a string");
    }
    let obj = { negated: false, pattern: pattern, original: pattern };
    const reg = /^(\!)(?!\(.*?\))/;
    if (reg.test(pattern)) {
        obj.negated = true;
        obj.pattern = pattern.replace(reg, "");
    }
    return obj;
}
function unique(array) {
    return [...new Set(array)];
}
function _glob(pattern, options) {
    return new Promise(function(resolve, reject) {
        try {
            sourceGlob(pattern, options, function(err, files) {
                if (err) {
                    return reject(err);
                }
                resolve(files);
            });
        } catch (error) {
            reject(error);
        }
    });
}
async function glob(globs, options, cb = () => {}) {
    if (!Array.isArray(globs)) {
        globs = [globs];
    }
    try {
        let result = [];
        for (let i = 0; i < globs.length; i++) {
            const _obj = isNegatedGlob(globs[i]);
            const files = await _glob(_obj.pattern, options);
            let sets = new Set();
            if (_obj.negated === true) {
                sets = new Set([...result].filter(x => !files.includes(x)));
            } else {
                sets = new Set([...result, ...files]);
            }
            result = [...sets];
        }
        cb(null, result);
        return result;
    } catch (error) {
        cb(error, null);
        throw error;
    }
}
glob.sync = function(globs, options) {
    if (!Array.isArray(globs)) {
        globs = [globs];
    }
    try {
        let result = [];
        for (let i = 0; i < globs.length; i++) {
            const _obj = isNegatedGlob(globs[i]);
            const files = sourceGlob.sync(_obj.pattern, options);
            let sets = new Set();
            if (_obj.negated === true) {
                sets = new Set([...result].filter(x => !files.includes(x)));
            } else {
                sets = new Set([...result, ...files]);
            }
            result = [...sets];
        }
        return result;
    } catch (error) {
        throw error;
    }
};

glob._glob = _glob;

module.exports = glob;
