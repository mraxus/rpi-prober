var timer = require('../lib/timer'),
	sensor = require('ds18x20');

timer( function () {
	var t = new Date();
	console.log( t.toTimeString().split(' ')[0] + '.' +  t.getMilliseconds() );
	sensor.getAll(function (err, result) {
		console.log('  ', result, 'in', (Date.now() - t), 'ms' );
	});
}, 5);

