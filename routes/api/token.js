/**
 * Created by root on 2015-08-03.
 *
 * verifies the status of an existing token.
 */



var express = require('express');
var app = express();
var token = require('../../model/token');
var protocol = require('./protocol');


app.get('/', function(req, res) {
    var key = req.query.token;

    if (key) {
        token.verify(key, function (err, valid) {
            if (valid) {
                res.sendStatus(protocol.success);
            } else
                res.sendStatus(protocol.error);
        });

    } else {
        res.sendStatus(protocol.error);
    }
});

module.exports = app;