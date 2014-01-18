'use strict';

var level = require('level'),
    path = require('path'),

    config = require('../conf.json'),
    dbPath = path.resolve(__dirname, '..', config['db']),

    db = level(dbPath, { valueEncoding: 'json' }),

	count = 0
	days = {}
	months = {};

db.createReadStream()
    .on('data',  function (data) {
		
		
	})
    .on('error', function (err)  { console.log('Oh my!', err); })
    .on('close', function ()     { console.log('Stream\'s closed'); })
    .on('end',   function ()     { console.log('Stream\'s at an end'); });

function recordDay(key
