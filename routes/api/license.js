/**
 * Created by krakenboss on 2015-08-02.
 *
 * Serve the license file which has to be accepted to access the application.
 */

var express = require('express');
var app = express();
var protocol = require('./protocol');

var version = 1.0;
var title = 'app license';
var text = 'license for x.. y.. and z.';

app.get('/', function(req, res) {
    res.status = protocol.success;
    res.send({title: title, text: text, version: version});
});

module.exports = app;