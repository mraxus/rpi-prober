module.exports = function (callback, interval, accuracy, shift) {
	
	accuracy = accuracy || 90;
    shift = (shift || 0) * 1000;

	var time = Date.now(),
		msInterval = interval * 1000,
		target = time + msInterval - time % msInterval + shift,

		timerFn = function() {
			time = Date.now();
			if ( time >= target) {
				target += msInterval;
				callback();
			}
		};

	setInterval(timerFn, accuracy);
};

