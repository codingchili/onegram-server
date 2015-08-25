/**
 * Created by krakenboss on 2015-08-02.
 *
 * route to create new account.
 *
 */


var http = require('./API/protocol');
var express = require('express');
var app = express();
var account = require('../model/account');
var protocol = require('./API/protocol');
var mail = require('../bin/mail');


app.post('/', function (req, res) {

    if (req.body.password && req.body.username) {
        if (req.body.password.length >= 8 && req.body.username.length >= 5) {

            account.registered(req.body.username, function (result) {
                if (result) {
                    res.sendStatus(http.conflict);
                } else {
                    account.create(req.body.username, req.body.password, function (err, key) {
                        mail.send(req.body.username, key,
                            function (err) {
                                if (err) {
                                    // rollback: remove the account, the email could not be sent.
                                    res.sendStatus(http.illegal);
                                    account.remove(req.body.username, function()  {});
                                } else {
                                    res.sendStatus(http.success);
                                }
                            });
                    });
                }
            });
        }
        else
            res.sendStatus(http.unaccepted);
    } else
        res.sendStatus(http.unaccepted);
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
        res.sendStatus(protocol.error);
});

module.exports = app;