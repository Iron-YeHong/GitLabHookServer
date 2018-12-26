var log4js = require('log4js');

log4js.configure({
    appenders:{
        std: { type: "stdout", layout:{type: "basic", } },
        file: { type: "file", filename: "log.txt", encoding: "utf-8" }
    },
    categories: {
        default: {appenders: ["std"], level: "debug"},
        custom: {appenders: ["std", "file"], level: "all"},
        logfile: {appenders: ["file"], level: "all"}
    }
});

module.exports = log4js;