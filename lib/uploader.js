'use strict';

var request = require('request');

var Uploader = function (remoteConfig, db, logger, timer) {

    this.host = remoteConfig.host;
    this.interval = remoteConfig.interval || 3600;
    this.shift = remoteConfig.shift || 10;

    this.db = db;
    this.logger = logger;
    this.timer = timer;
};

Uploader.prototype.start = function () {

    this.logger.info('Starting uploader.');

    this.timer(
        this.upload,
        this.interval,
        1000,
        this.shift);
};

Uploader.prototype.upload = function () {

    this.logger.info('Starting upload');

    var that = this,
        uri = 'http://' + this.host + '/db/info';

    this.logger.debug('Calling GET', uri);
    request.get(uri, function (err, res, body) {

        if (err) { that.logger.error('Error requesting GET ' + uri + ':' + err.message); return; }

        that.logger.debug('Response', res.code, body);
    });
};

module.exports = {
    start: function (remoteConfig, db, logger, timer) {

        if (!remoteConfig) { logger.error('remote configuration is missing'); return; }
        if (remoteConfig['enabled'] === false) { logger.info('remote function is disabled'); return; }
        if (!remoteConfig['host']) { logger.error('remote host configuration is missing'); return; }

        if (!remoteConfig['interval']) { logger.warning('remote interval configuration is missing'); }
        if (!remoteConfig['shift']) { logger.warning('remote host configuration is missing'); }

        var uploader = new Uploader(remoteConfig, db, logger, timer);
        uploader.start();
    }
}