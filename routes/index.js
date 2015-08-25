/**
 * Created by root on 2015-08-24.
 */


var express = require('express');
var app = express();


app.get('/', function(req, res) {
    res.render('index.jade', {});
});

module.exports = app;