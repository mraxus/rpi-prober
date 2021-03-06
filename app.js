'use strict';

var level = require('level'),
    sensor = require('ds18x20'),

    logger = require('./lib/logger'),
    SensorRetries = require('./lib/sensor-retries'),
    sensorRetries,
    timer = require('./lib/timer'),
    uploader = require('./lib/uploader'),

    config = require('./conf.json'),
    server = config['server'],
    serverName = server['name'],
    info = config['info'],
    deviceNames = config['devices'] || {},
    dbPath = config['db'],
    pollingInterval = server['polling-interval'], // sec
    maxRetries = server['sensor-max-retries'],
    logLevel = config['logger']['level'],

    db = level(dbPath, { valueEncoding: 'json' });

logger.setLevel(logger.levels[logLevel]);
logger.info(Date.now(), 'Starting sensor sweeps for ' + serverName);

sensorRetries = new SensorRetries(sensor, maxRetries, logger);

// Start uploader
uploader.start(config['remote'], db, logger, timer, serverName, info);

timer(function () {

    var key = Date.now();

    getData(function (err, value) {

        logger.debug( key, '=', JSON.parse(JSON.stringify(value)) );

        db.put(key, value, function (err) {
            if (err) return logger.error('Ooops putting it:', err); // some kind of I/O error
            logger.debug( '  saved' );
			logInfo(value.data);
        });
    });
}, pollingInterval);

function logInfo(value) {

	var arr = value.map(function (val) {
		return val.name + ': ' + val.value;
	});

	logger.info(new Date(), arr.join(', '));
}

function getData(callback) {

    var t = Date.now();

    sensorRetries.get(function (err, result) {

        var value = {
            data: [],
            duration: Date.now() - t,
            error: err || undefined
        };

		if (err) {
			logger.error(err);
			result = {};
		}

        Object.keys(result).forEach(function (key) {
            value.data.push({
                id: key,
                value: result[key].value,
                name: deviceNames[key],
                retries: result[key].retries
            });
        });

        callback(err, value);
    });
}
