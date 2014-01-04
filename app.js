'use strict';

var level = require('level'),
    db = level('./db/first.lvl', { valueEncoding: 'json' }),
    intervalId,
    startTime = Date.now(),
    i = 15;

startTime = 0;
getLatestInputs();

return;

intervalId = setInterval(function () {

    if (--i === 0) {
        clearInterval(intervalId);
        console.log('last run...');
        setTimeout(getLatestInputs, 1000);
    }

    var key = Date.now(),
        value = [
        {id: '28-1234', name: 'indoor', value: 21.4 + Math.floor(Math.random() * 10)},
        {id: '28-2341', name: 'utdoor', value: 2.1 + Math.floor(Math.random() * 10)},
        {id: '28-3412', name: 'upside', value: 13.7 + Math.floor(Math.random() * 10)}
    ];

    db.put(key, value, function (err) {
        if (err) return console.log('Ooops putting it:', err); // some kind of I/O error

        // 3) fetch by key
        db.get(key, function (err, value) {
            if (err) return console.log('Yay, no getting it:', err); // likely the key was not found

            console.log(key + '=' + JSON.stringify(value));


            if (i === 0) console.log('done!');
        });
    });
}, 750);

function getLatestInputs() {
    db.createReadStream({start: startTime})
        .on('data', function (data) {
            console.log(data.key, '=', JSON.stringify(data.value));
        })
        .on('error', function (err) {
            console.log('Oh my!', err);
        })
        .on('close', function () {
            console.log('Stream\'s closed');
        })
        .on('end', function () {
            console.log('Stream\'s to an end');
        })
    ;
}

function runAt(hour, minute, second, callback) {

}