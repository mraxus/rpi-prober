'use strict';

var sensors = require('ds18x20'),
    intervalId;

sensors.getAll(function (err, results) { if (err) throw err;

    var list = Object.keys(results),
        results = list.map(function (item) { return results[item]; });

    intervalId = setInterval(function () {
        sensors.get(list, function (err, newResults) { if (err) throw err;

            var diff = newResults.map(function (temp, i) { return Math.abs(temp - results[i]); });

            console.log(diff);
            system.exit();
        });
    }, 500);

});

