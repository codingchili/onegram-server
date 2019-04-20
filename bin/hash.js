/**
 * Created by krakenboss on 2015-08-02.
 *
 * Hash stuff.
 */

const debug = require('debug')('anigram:hash');
const crypto = require('crypto');

const SALT_LENGTH = 256;
const ITERATIONS = 16384;

function salt(callback) {
    crypto.randomBytes(SALT_LENGTH, function (err, salt) {
        if (err)
            throw err;

        callback(salt.toString("hex"))
    })
}

function hash(options, callback) {
    let start = new Date().getTime();
    crypto.pbkdf2(options.data, options.salt, ITERATIONS, 512, 'sha512', function (err, key) {
        debug(`password hashed in ${new Date().getTime() - start}ms.`);
        callback(err, key.toString("hex"), options.salt);
    })
}

module.exports = {
    calculate: function calculate(options, callback) {
        if (options.salt) {
            hash(options, callback);
        } else {
            salt(function (salt) {
                options.salt = salt;
                hash(options, callback);
            })
        }
    }
};