/**
 * Created by krakenboss on 2015-08-02.
 */


var mongoose = require('../bin/database').get();
var uuid = require('node-uuid');

var IDLE_TIMEOUT = 3 * 3600 * 1000;    // the base timeout for sessions to expire.
var ACTIVE_TIMEOUT = 30 * 3600 * 1000; // the session will not expire if it has been used recently.

var Token = mongoose.model('Token', {
    user: String,
    key: String,
    created: Number,
    used: Number
});


module.exports = {
    add: function add(id, callback) {
        Token.deleteOne({user: id}, function (err, result) {
            var token = new Token(
                {
                    user: id,
                    key: uuid.v4(),
                    created: new Date().getTime(),
                    used: new Date().getTime()
                });

            token.save(function (err, result) {
                callback(err, result.key);
            });
        });
    },

    verify: function verify(key, callback) {
        Token.findOne({key: key}, function (err, result) {
            if (err)
                throw err;

            if (result) {
                if (new Date().getTime() < result.created + IDLE_TIMEOUT &&
                    new Date().getTime() < result.used + ACTIVE_TIMEOUT) {

                    result.used = new Date().getTime();
                    result.save(function (err, result) {});
                    callback(err, true);
                } else {
                    Token.remove({_id: result._id}, function (err) {
                        if (err)
                            throw err;

                        callback(err, false);
                    });
                }
            }
            else
                callback(err, false);
        });
    },

    user: function user(token, callback) {
        Token.findOne({key: token}, function (err, result) {
            if (err)
                throw err;

            callback(err, result);
        })
    },

    clear: function clear(callback) {
        Token.deleteMany({}, function (err) {
            callback(err);
        })
    }
};