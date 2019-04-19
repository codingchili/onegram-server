/**
 * Created by krakenboss on 2015-08-02.
 *
 * route to create new account.
 *
 */


var http = require('./api/protocol');
var express = require('express');
var app = express();
var account = require('../model/account');
var mail = require('../bin/mail');
var debug = require('debug')('anigram:mailer');

const MIN_PASSWORD = 8;
const MIN_USERNAME = 5;

app.post('/', function (req, res) {
    let username = req.body.username || '';
    let password = req.body.password || '';

    if (password >= MIN_PASSWORD &&
        username >= MIN_USERNAME) {

        account.registered(username, function (result) {
            if (result) {
                res.sendStatus(http.conflict);
            } else {
                account.create(username, password, function (err, key) {
                    mail.send(username, key,
                        function (err) {
                            if (err) {
                                debug(err);
                                // rollback: remove the account, the email could not be sent.
                                res.sendStatus(http.illegal);
                                account.remove(username, function () {
                                    //
                                });
                            } else {
                                res.sendStatus(http.success);
                            }
                        });
                });
            }
        });
    } else {
        res.sendStatus(http.unaccepted);
    }
});

app.get('/verify', function (req, res) {
    token = req.query.token;

    if (token) {
        account.verify(token, function (err, result) {
            if (result.verification) {
                res.render('registered.jade', {activation: result.verification, username: result.name});
            } else
                res.render('registered.jade', {activation: result.verification});
        });
    } else
        res.sendStatus(http.error);
});

module.exports = app;