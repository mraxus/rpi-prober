'use strict';

var level = require('level'),
    sensor = require('ds18x20'),

    logger = require('./lib/logger'),
    timer = require('./lib/timer'),

    config = require('./conf.json'),
    server = config['server'],
    serverName = server['name'],
    deviceNames = config['devices'] || {},
    dbPath = config['db'],
    pollingInterval = server['polling-interval'], // sec
    logLevel = config['logger']['level'],

    db = level(dbPath, { valueEncoding: 'json' });

logger.setLevel(logger.levels[logLevel]);

logger.info(Date.now(), 'Starting sensor sweeps for ' + serverName);

timer(function () {

    var key = Date.now();

    getData(function (err, value) {

        logger.debug( key, '=', value );

        db.put(key, value, function (err) {
            if (err) return logger.error('Ooops putting it:', err); // some kind of I/O error
            logger.debug( '  saved' );
        });
    });
}, pollingInterval);

function getData(callback) {

    var t = Date.now();

    sensor.getAll(function (err, result) {

        var value = {
            data: [],
            duration: Date.now() - t,
            error: err || undefined
        };
        Object.keys(result).forEach(function (key) { value.data.push({id: key, value: result[key], name: deviceNames[key]}); });

        callback(err, value);
    });
}