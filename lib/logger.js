'use strict';

var logger = {
    levels: { debug: 0, info: 1, warn: 2, error: 3 },

    _level: 1,

    setLevel: function (level) { this._level = level; },

    debug: function () { this._log(0, 'DEBUG', arguments); },
    info: function () { this._log(1, 'INFO ', arguments); },
    log: function () { this._log(1, 'INFO ', arguments); },
    warn: function () { this._log(2, 'WARN ', arguments); },
    error: function () { this._log(3, 'ERROR', arguments); },

    _log: function (level, txt, args) {
        args = Object.keys(args).map(function (x) { return args[x]; });
        if (level >= this._level) {
            args.unshift(txt);
            console.log.apply(this, args);
        }
    }
};

module.exports = logger;