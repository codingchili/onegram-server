/**
 * Created by krakenboss on 2015-08-02.
 *
 * register devices by email
 * create registration for unregistered
 * do not store email addresses
 * a hash of the android id is the user account token
 */

var hash = require('../bin/hash');
var mongoose = require('../bin/database').get();
var uuid = require('node-uuid');

var Account = mongoose.model('Account', {
    username: String,
    password: String,
    salt: String,
    verified: Boolean,
    key: String,
    gallery: []
});

module.exports = {
    create: function create(username, password, callback) {
        Account.findOne({username: username}, function (err, result) {
            if (!err && !result) {
                hash.calculate({data: password}, function (err, password, salt) {
                    var account = new Account({
                        username: username,
                        password: password,
                        salt: salt,
                        key: uuid.v4(),
                        gallery: [],
                        verified: false
                    });
                    account.save(function (err, result) {
                        if (err)
                            callback(err);
                        else
                            callback(null, result.key);
                    })
                });
            } else {
                callback(new Error('Account Already Exists!'));
            }
        });
    },

    authenticate: function authenticate(username, password, callback) {
        Account.findOne({username: username}, function (err, account) {
            if (!err && account) {
                hash.calculate({data: password, salt: account.salt}, function (err, password, salt) {
                    callback(password == account.password, account._id);
                });
            } else
                callback(false);
        });
    },

    verified: function verified(id, callback) {
        Account.findOne({_id: id}, function (err, result) {
            if (result)
                callback(err, result.verified);
        });
    },

    verify: function verify(token, callback) {
        Account.update({key: token}, {verified: true}, function (err, result) {
            if (err)
                throw err;

            if (result.n == 1) {
                Account.findOne({key:token}, function (err, result) {
                    callback(err, {verification: true, name: result.username});
                });
            } else
                callback(err, {verification: false});
        })
    },

    addToGallery: function addToGallery(picture, user, callback) {
        Account.update({_id: user}, {$push: {gallery: picture}}, {upsert: false}, function (err, result) {
            if (err)
                throw err;

            callback(err);
        });
    },

    removeFromGallery: function removeFromGallery(picture, user, callback) {
        Account.update({_id: user}, {$pull: {gallery: picture}}, {upsert: false}, function (err, result) {
            if (err)
                throw err;

            callback(err);
        });
    },

    gallery: function gallery(user, callback) {
        Account.findOne({_id: user}, function (err, result) {
            if (err)
                throw err;

            if (result)
                callback(err, result.gallery);
            else
                callback(new Error('No Such Account!'), null);
        })
    },

    clear: function clear(callback) {
        Account.remove({}, callback);
    },

    remove: function remove(username, callback) {
        Account.remove({'username': username}, function (err) {
            callback(err);
        });
    },

    registered: function registered(username, callback) {
        Account.findOne({'username': username}, function (err, result) {
            console.log(result);

            if (result)
                callback(true);
            else
                callback(false);
        });
    }
};