'use strict';

var request = require('request');

var Uploader = function (remoteConfig, db, logger, timer, serverName) {

    this.host = remoteConfig.host;
    this.interval = remoteConfig.interval || 3600;
    this.shift = remoteConfig.shift || 10;
    this.serverName = serverName;

    this.db = db;
    this.logger = logger;
    this.timer = timer;
    this.working = false;
};

Uploader.prototype.start = function () {

    this.logger.info('Starting uploader.');

    var that = this;

    this.timer(
        function () { that.upload(); },
        this.interval,
        1000,
        this.shift);
};

Uploader.prototype.upload = function () {

    this.logger.info('Starting upload');

    if (this.working) { this.logger.warning('Already working. Skipping this round...'); return; }

    this.working = true;

    var that = this,
        url = 'http://' + this.host + '/db/info';

    this.logger.debug('Calling GET', url);
    request.get(url, function (err, res, body) {

        if (err) { that.logger.error('Error requesting GET ' + url + ':' + err.message); return; }
        body = JSON.parse(body);
        that.logger.debug('Response from ' + url + ': ', body);

        var options = {
                start: body.latest + 1,
                limit: 100
            };

        that.console.debug('Reading stream with options', options);

        url = 'http://' + that.host + '/db';

        that.db.createReadStream(options)
            .on('data', function (err, data) {
                if (err) { that.logger.error(err); return; }

                that.logger.debug('Calling PUT', url, 'for key', data.key);

                request(
                    { method: 'PUT'
                        , url: url
                        , json: {key: data.key, value: data.value, serverName: that.serverName}
                    }
                    , function (err, res, body) {
                        if(res.statusCode == 200){
                            that.logger.info('timestamp', data.key, 'transmitted');
                        } else {
                            that.logger.error('timestamp', data.key, 'error: '+ res.statusCode);
                            that.logger.error(body);
                        }
                    }
                );
            })
            .on('close', function () {
                that.logger.info('Transfer complete')
                that.working = false;
            });
    });
};

module.exports = {
    start: function (remoteConfig, db, logger, timer, serverName) {

        if (!remoteConfig) { logger.error('remote configuration is missing'); return; }
        if (remoteConfig['enabled'] === false) { logger.info('remote function is disabled'); return; }
        if (!remoteConfig['host']) { logger.error('remote host configuration is missing'); return; }

        if (!remoteConfig['interval']) { logger.warning('remote interval configuration is missing'); }
        if (!remoteConfig['shift']) { logger.warning('remote host configuration is missing'); }

        var uploader = new Uploader(remoteConfig, db, logger, timer, serverName);
        uploader.start();
    }
}