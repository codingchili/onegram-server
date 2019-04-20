/**
 * Created by krakenboss on 2015-08-02.
 */
const mongoose = require('../bin/database').get();
const uuid = require('node-uuid');

const IDLE_TIMEOUT = 3 * 3600 * 1000;    // the base timeout for sessions to expire.
const ACTIVE_TIMEOUT = 30 * 3600 * 1000; // the session will not expire if it has been used recently.

const Token = mongoose.model('Token', {
    user: String,
    key: String,
    created: Number,
    used: Number
});


module.exports = {
    add: (id, callback) => {
        Token.deleteOne({user: id}, (err, result) => {
            const token = new Token({
                user: id,
                key: uuid.v4(),
                created: new Date().getTime(),
                used: new Date().getTime()
            });

            token.save((err, result) => {
                callback(err, result.key);
            });
        });
    },

    verify: (key, callback) => {
        Token.findOne({key: key}, (err, result) => {
            if (err)
                throw err;

            if (result) {
                if (new Date().getTime() < result.created + IDLE_TIMEOUT &&
                    new Date().getTime() < result.used + ACTIVE_TIMEOUT) {

                    result.used = new Date().getTime();
                    result.save((err, result) => {});
                    callback(err, true);
                } else {
                    Token.remove({_id: result._id}, (err) => {
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

    user: (token, callback) => {
        Token.findOne({key: token}, (err, result) => {
            if (err)
                throw err;

            callback(err, result);
        })
    },

    clear: (callback) => {
        Token.deleteMany({}, (err) => {
            callback(err);
        })
    }
};