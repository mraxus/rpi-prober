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
}
    ,
    sensors = require('ds18x20'),
    intervalId;

sensors.getAll(function (err, results) { if (err) throw err;

    var list = Object.keys(results),
        results = list.map(function (item) { return results[item]; });

    if (list.length <= 1) {
        if (list.length === 0) { logger.warn('No devices found'); }
        else                   { logger.info('Only one device found'); }
        process.exit();
    }

    intervalId = setInterval(function () {
        sensors.get(list, function (err, newResults) { if (err) throw err;

            var finding = findDeviantDevice(list, results, newResults);

            results = newResults;

            // No deviant sensor detected
            if (finding === false) { logger.info('No deviant sensor found.'); return; }

            clearInterval(intervalId);

            logger.info('Found deviant device:', finding);
        });
    }, 1000);

});

function findDeviantDevice(ids, previousResults, newResults) {

    if (ids.length === 2) return findDeviantDeviceOutOfTwo(ids, previousResults, newResults);

    var diff = diffOfArray(previousResults, newResults),
        median = medianOfArray(diff),
        threshold = median * 10,
        findings = [];

    logger.debug('median:', median, 'threshold:', threshold)

    diff.forEach(function (value, index) {
        if (value > threshold) {
            logger.debug('OJOJ, found one!', ids[index], 'with difference:', value);
            findings.push(ids[index]);
        }
    });

    if (findings.length > 1) logger.warn('Found more than one deviant device. Ignoring readout!')

    return (findings.length === 1) ? findings[0] : false;
}

function findDeviantDeviceOutOfTwo(ids, previousResults, newResults) {

    var diff = diffOfArray(previousResults, newResults),
        deviant = false;

    if (diff[0] > 0.3) deviant = ids[0];
    if (diff[1] > 0.3) deviant = ids[1];

    return deviant;
}

function diffOfArray(a, b) {
    return a.map(function (item, index) { return Math.abs(item - b[index]); });
}

function medianOfArray(values) {

    var l = values.length,
        m = Math.floor(l / 2),
        v = values
            .map(function (x) { return x; })
            .sort();

    return (l % 2) ? v[m] : (v[m - 1] + v[m]) / 2.0;
}

logger.setLevel(logger.levels.debug);

//var finding = findDeviantDevice(
//    ['a', 'b', 'c', 'd', 'e'],
//    [1.0, 2.0, 3.0, 4.0, 5.0],
//    [5.1, 2.3, 3.2, 4.1, 5.3]
//);
//
//logger.info('finding:', finding);
