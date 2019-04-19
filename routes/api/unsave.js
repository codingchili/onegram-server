/**
 * Created by root on 2015-08-05.
 */

var express = require('express');
var app = express();
var protocol = require('./protocol');
var token = require('../../model/token');
var account = require('../../model/account');



app.post('/', function (req, res) {
    var params = req.body;

    if (params.image && params.token) {
        token.user(req.body.token, function(err, result) {
            account.removeFromGallery(params.image, result.user, function(err) {

                if (err)
                    res.sendStatus(protocol.error);
                else {
                    res.sendStatus(protocol.success);
                }
            })
        });
    } else
        res.sendStatus(protocol.error);
});

module.exports = app;