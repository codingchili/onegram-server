/**
 * Created by krakenboss on 2015-08-02.
 *
 * Authenticates any routes beyond this point.
 */


var express = require('express');
var app = express();
var token = require('../model/token');
var protocol = require('../routes/API/protocol');


app.all('*', function(req, res, next) {
    var key = (req.body.token) || (req.query.token);

    if (key) {
        token.verify(key, function (err, result) {
            if (result) {
                next();
            } else {
                res.statusCode = protocol.unauthorized;
                res.send();
            }
        });
    } else
        res.render('missing.jade');
});

module.exports = app;