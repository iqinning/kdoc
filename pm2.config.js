const path = require('path');
const dir = path.resolve(__dirname, ".", "./log");
module.exports = {
    apps: [
    {
        "name": "kdoc",
        "cwd": path.resolve(__dirname),
        "script": "index.js",
        "exec_mode": "cluster",
        "instances": 3,
        "node_args": [
            "--harmony"
        ],
        "log_date_format": "YYYY-MM-DDTHH:mm:ssZ",
        "error_file": `${dir}/kdoc.stderr.log`,
        "out_file": `${dir}/kdoc.stdout.log`,
        //"pid_file": `${dir}/kdoc.pid`,
        "merge_logs": true,
        "max_memory_restart": "500M",
        "env": {
            "NODE_ENV": "prod"
        }
    }]
};
