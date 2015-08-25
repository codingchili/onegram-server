/**
 * Created by krakenboss on 2015-08-02.
 *
 * Hash stuff.
 */

var crypto = require('crypto');
var SALT_LENGTH = 256;
var ITERATIONS = 100;

function salt(callback) {
    crypto.randomBytes(SALT_LENGTH, function (err, salt) {
        if (err)
            throw err;

        callback(salt.toString("hex"))
    })
}


function hash(options, callback) {
    crypto.pbkdf2(options.data, options.salt, ITERATIONS, 512, 'sha512', function(err, key) {
        callback(err, key.toString("hex"), options.salt);
    })
}

module.exports = {
    calculate: function calculate(options, callback) {
        if (options.salt) {
            hash(options, callback);
        } else {
            salt(function(salt) {
                options.salt = salt;
                hash(options, callback);
            })
        }
    }
};