/**
 * Created by krakenboss on 2015-08-02.
 */
const http = require('./api/protocol');
const express = require('express');
const app = express();
const account = require('../model/account');
const session = require('../model/token');


app.post('/', (req, res) => {
      account.authenticate(req.body.username, req.body.password, (authenticated, id) => {
          if (authenticated) {
              session.add(id, (err, token) => {
                  if (err) {
                      throw err;
                  }
                  res.send({token: token});
              });
          } else {
              res.sendStatus(http.unauthorized);
          }
      });
});

module.exports = app;