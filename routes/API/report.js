/**
 * Created by root on 2015-08-05.
 */

var express = require('express');
var app = express();
var protocol = require('./protocol');
var picture = require('../../model/picture');
var account = require('../../model/account');
var token = require('../../model/token');

app.post('/', function (req, res) {
    if (req.body.image) {

        token.user(req.body.token, function (err, result) {
            account.verified(result.user, function (err, result) {
                if (result == true) {
                    picture.report(req.body.image, function (err, result) {
                        if (err)
                            res.sendStatus(protocol.error);
                        else {
                            res.status = protocol.success;
                            res.send({reported: result});
                        }
                    });
                } else
                    res.sendStatus(protocol.forbidden);
            });
        });
    } else
        res.sendStatus(protocol.error);
});

module.exports = app;