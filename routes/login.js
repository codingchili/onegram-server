/**
 * Created by krakenboss on 2015-08-02.
 */

var http = require('./API/protocol');
var express = require('express');
var app = express();
var account = require('../model/account');
var session = require('../model/token');


app.post('/', function(req, res) {
      account.authenticate(req.body.username, req.body.password, function (authenticated, id) {

          if (authenticated) {
              session.add(id, function(err, token) {
                  if (err)
                    throw err;

                  res.statusCode = http.success;
                  res.send({token: token});
              });
          } else
            res.sendStatus(http.unauthorized);
      });
});

module.exports = app;