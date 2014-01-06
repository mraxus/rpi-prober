'use strict';

var SensorRetries = function (sensor, maxRetries) {
    this._sensor = sensor;
    this._maxRetries = maxRetries;
};

SensorRetries.prototype.get = function (callback) {

    var that = this;

    this._sensor.getAll(function (err, values) {

        if (err) return callback(err);

        var result = {},
            retryList = [],
            retries = 0;

        Object.keys(values).forEach(function (key) {

            result[key] = { value: values[key] };

            if (values[key] === false) {
                retryList.push(key);
            }
        });

        if (retryList.length === 0) {
            return callback(null, result);
        }

        return that.retry(0, retryList, result, callback);
    });
};

SensorRetries.prototype.retry = function (retries, keys, result, callback) {

    var that = this;

    if (retries > this._maxRetries) {

        keys.forEach(function (key) {
            result[key].retries = retries;
        });

        return callback(null, result);
    }

    return this._sensor.get(keys, function (err, values) {

        if (err) return callback(err);

        var retryList = [];

        values.forEach(function (value, index) {

            var key = keys[index];

            if (value === false) {
                retryList.push(key);
            } else {
                result[key].value = value;
                result[key].retries = retries;
            }
        });

        if (retryList.length === 0) {
            return callback(null, result);
        }

        return that.retry(retries + 1, retryList, result, callback);
    });
};

module.exports = SensorRetries;