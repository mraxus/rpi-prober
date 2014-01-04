module.exports = function (callback, interval, accuracy) {
	
	accuracy = accuracy || 90;

	var time = Date.now(),
		msInterval = interval * 1000,
		target = time + msInterval - time % msInterval,

		timerFn = function() {
			time = Date.now();
			if ( time >= target) {
				target += msInterval;
				callback();
			}
		};

	setInterval(timerFn, accuracy);
};

