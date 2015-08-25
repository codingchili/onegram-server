/**
 * Created by krakenboss on 2015-08-02.
 *
 * Browse all posts for x tags.
 */

var express = require('express');
var app = express();
var picture = require('../../model/picture');
var protocol = require('./protocol');
var token = require('../../model/token');
var account = require('../../model/account');


function tagArray(tags) {
    tags = '#' + tags;
    tags = tags.replace(/,/gi, ' #');
    tags = tags.split(' ');
    return tags;
}

app.get('/tags', function (req, res) {
    var tags = req.query.tags;

    if (tags) {
        tags = tagArray(tags);
        picture.findByTags(tags, function (err, result) {
            if (err) {
                res.statusCode = protocol.error;
                res.send();
            } else {
                res.statusCode = protocol.success;
                res.send(result);
                picture.addViews(result, function (err, result) {});
            }
        });
    } else {
        picture.getLatest(function (err, result) {
            if (err)
                res.sendStatus(protocol.error);

            if (result) {
                res.send(result);
                picture.addViews(result, function (err, result) {});
            }
        });
    }
});

app.get('/tagcompletion', function (req, res) {
    var search = req.query.search;

    if (search) {
        picture.completeTag('#' + search, function (err, result) {
           if (err) {
               res.sendStatus(protocol.error);
           }  else {
               if (result) {
                   res.status = protocol.success;
                   res.send(result);
               }
           }
        });
    } else {
        req.sendStatus(protocol.error);
    }
});

app.get('/gallery', function (req, res) {
    var key = req.query.token;

    if (key) {
        token.user(key, function (err, result) {
            if (result) {
                account.gallery(result.user, function (err, gallery) {
                    picture.gallery(gallery, function (err, pictures) {
                        if (pictures) {
                            res.statusCode = protocol.success;
                            res.send(pictures)
                        } else {
                            res.statusCode = protocol.error;
                            res.send();
                        }
                    });
                });
            } else {
                res.sendStatus(protocol.error);
            }
        });
    } else
        res.sendStatus(protocol.error);
});

app.get('/download', function (req, res) {
    var image_id = req.query.image;

    if (image_id) {
        picture.download(image_id, function (err, image) {
            if (image) {
                res.statusCode = protocol.success;
                res.send({image: image.data});
            } else {
                res.statusCode = protocol.missing;
                res.send();
            }
        });
    } else
        res.sendStatus(protocol.error);
});

module.exports = app;