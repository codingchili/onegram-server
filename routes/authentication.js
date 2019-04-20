/**
 * Created by krakenboss on 2015-08-02.
 *
 * Authenticates any routes beyond this point.
 */


var express = require('express');
var app = express();
var token = require('../model/token');
var http = require('../routes/api/protocol');


app.all('*', function(req, res, next) {
    let key = (req.body.token) || (req.query.token);

    if (key) {
        token.verify(key, function (err, result) {
            if (result) {
                next();
            } else {
                res.statusCode = http.unauthorized;
                res.send();
            }
        });
    } else {
        res.sendStatus(http.unauthorized);
    }
});

module.exports = app;