'use strict';

var level = require('level'),
    timer = require('./lib/timer'),
    sensor = require('ds18x20'),

    config = require('./conf.json'),
    server = config['server'],
    serverName = server['name'],
    deviceNames = config['devices'] || {},
    dbPath = config['db'],
    pollingInterval = server['polling-interval'], // sec

    db = level(dbPath, { valueEncoding: 'json' });

//sensor.getAll = function (callback) {
//    setTimeout(function () {
//        callback(null, {
//            '28-012312312312': 16.9 + Math.floor(Math.random() * 10),
//            '28-0ab0ab0ab0ab': -4.3 + Math.floor(Math.random() * 10),
//            '28-089089089089': -0.1 + Math.floor(Math.random() * 10)
//        }); },
//        350 + Math.random() * 200);
//};

console.log('Starting sensor sweeps for ' + serverName);

timer(function () {

    var key = Date.now();

    getData(function (err, value) {

        console.log( key, '=', value );

        db.put(key, value, function (err) {
            if (err) return console.log('Ooops putting it:', err); // some kind of I/O error
            console.log( '  saved' );
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