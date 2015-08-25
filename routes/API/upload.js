/**
 * Created by krakenboss on 2015-08-02.
 *
 */

var express = require('express');
var app = express();
var picture = require('../../model/picture');
var protocol = require('./protocol');
var account = require('../../model/account');
var token = require('../../model/token');


app.post('/', function (req, res) {
    var params = req.body;

    console.log(req.body);

    if (params.image && params.description) {
        token.user(params.token, function (err, result) {
            account.verified(result.user, function (err, result) {
                if (result == true) {
                    picture.upload(params.image, params.description, function (err, id) {
                        if (err) {
                            res.statusCode = protocol.error;
                            res.send();
                        } else {
                            res.statusCode = protocol.success;
                            res.send({id: id})
                        }
                    });
                } else
                    res.sendStatus(protocol.forbidden);
            });
        });
    }
    else {
        res.statusCode = protocol.error;
        res.send();
    }
});

module.exports = app;