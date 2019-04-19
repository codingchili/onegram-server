/**
 * Created by krakenboss on 2015-08-02.
 *
 * Picture model.
 */

var MAX_COMPLETION = 50;
var MAX_LATEST = 50;
var MAX_HISTORY = 100;
var MAX_GALLERY = 1000;
var REPORT_TOLERANCE = 1;
var mongoose = require('../bin/database').get();

var Picture = mongoose.model('Picture', {
    tags: [String],
    description: String,
    date: Number,
    reported: Number,
    views: Number,
    data: String
});

function findByTagArray(tags, callback) {
    Picture.find({tags: {'$in': tags}}, {data: 0, reported: 0}).sort({date:-1}).limit(MAX_HISTORY).exec(function (err, result) {
        if (err)
            throw err;

        callback(err, result);
    });
}

function findBySingleTag(tags, callback) {
    Picture.find({tags: tags}, {data: 0, reported: 0}).sort({date:-1}).limit(MAX_HISTORY).exec(function (err, result) {
        if (err)
            throw err;

        callback(err, result);
    });
}

function extractTags(text) {
    var regex = new RegExp('(#).[^ #]*', 'gi');
    return text.match(regex);
}

module.exports = {
    upload: function upload(data, description, callback) {
        var picture = new Picture({
            description: description,
            tags: extractTags(description),
            date: Date.now(),
            data: data,
            views: 0,
            reported: 0
        });

        picture.save(function (err, result) {
            if (err)
                throw err;

            callback(err, result._id)
        });
    },

    getLatest: function getLatest(callback) {
        Picture.find({}, {data: 0, reported: 0}).sort({date:-1}).limit(MAX_LATEST).exec(function (err, result) {
            if (err)
                throw err;

            callback(err, result);
        });
    },

    completeTag: function completeTag(query, callback) {
        var pattern = '^(%query%)[^ #]*'.replace('%query%', query);
        var regex = new RegExp(pattern, 'gi');

        Picture.find({tags: {$in: [regex]}}, {tags: 1}).limit(MAX_COMPLETION).exec(function (err, result) {
            if (err)
                throw err;
            var matches = [];

            for (var i = 0; i < result.length; i++) {
                var tags = result[i].tags;

                for (var k = 0; k < tags.length; k++) {
                    if (tags[k].match(regex)) {
                        var tag = tags[k].replace(/#/g, '');

                        if (matches[tag] == undefined)
                            matches[tag] = tag;
                    }
                }
            }

            var completions = [];
            for (var key in matches) {
                if (matches.hasOwnProperty(key)) {
                    completions.push(matches[key]);
                }
            }

            callback(err, completions);
        });
    },

    addViews: function addView(pictures, callback) {
        for (var i = 0; i < pictures.length; i++)
            Picture.update({_id: pictures[i]._id}, {$inc: {views: 1}}).exec(callback);
    },


    findByTags: function findByTags(tags, callback) {
        if (tags instanceof Array) {
            findByTagArray(tags, callback);
        } else {
            findBySingleTag(tags, callback);
        }
    },

    report: function report(picture, callback) {
        Picture.update({_id: picture}, {$inc: {reported: 1}}, function (err, result) {
            if (err)
                callback(err);
            else {
                Picture.findOne({_id: picture}, {reported: 1}, function (err, result) {
                    if (result.reported >= REPORT_TOLERANCE) {
                        Picture.remove({_id: picture}).exec(function (err, result) {
                            callback(err, REPORT_TOLERANCE);
                        });
                    } else
                        callback(err, result.reported);
                });
            }
        });
    },

    download: function download(picture, callback) {
        Picture.findOne({_id: picture}, {data: 1}, function (err, result) {
            callback(err, result);
        });
    },

    gallery: function gallery(pictures, callback) {
        Picture.find({_id: {'$in': pictures}}, {data: 0}).sort({date:-1}).limit(MAX_GALLERY).exec(function (err, result) {
            callback(err, result);
        })
    },

    clear: function clear(callback) {
        Picture.deleteMany({}, function (err, result) {
            callback(err);
        });
    }
};