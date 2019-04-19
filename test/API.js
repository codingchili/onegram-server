/**
 * Created by krakenboss on 2015-08-02.
 *
 * tests login and registration.
 */
const protocol = require('../routes/API/protocol');
const should = require('should');
const assert = require('assert');
const request = require('supertest');
const account = require('../model/account');
const token = require('../model/token');
const picture = require('../model/picture');
const querystring = require('querystring');
const describe = require('mocha').describe;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

describe('API', function () {
    const url = 'https://localhost:1443';
    const key = {token: '', verification: ''};
    const image = {id: '', data: 'data', description: '#life #nodejs #attack haha!'};
    const user = {name: 'chilimannen93@testing.com', password: 'oneflowertwoflower'};
    const user2 = {name: 'chilimannen', password: 'nullifish'};

    after(function () {
        account.clear(function (err) {
           if (err)
                throw err;
        });

        token.clear(function (err) {
            if (err)
                throw err;
        });

        picture.clear(function (err) {
            if (err)
                throw err;
        });
    });

    before(function () {
    });

    describe('register', function () {
        it('Should return success on creation.', function (done) {
            request(url)
                .post('/register')
                .send({username: user.name, password: user.password})
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    key.verification = res.body.key;

                    assert.equal(res.status, protocol.success, 'should return success.');
                    done();
                });
        });

        it('Should return conflict on already exists.', function (done) {
            request(url)
                .post('/register')
                .send({username: user.name, password: user.password})
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    assert.equal(res.status, protocol.conflict, 'should return conflict.');
                    done();
                });
        });

        it('Should return unaccepted on invalid indata.', function (done) {
            request(url)
                .post('/register')
                .send({username: user.name, password: 'Error'})
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.status, protocol.unaccepted, 'should return unaccepted.');
                    done();
                });
        });

        it('Should verify an existing account.', function (done) {
            request(url)
                .get('/register/verify?' + querystring.stringify({token: key.verification}))
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.status, protocol.success, 'should return success.');
                    done();
                });
        });

        it('Should reject invalid verification tokens.', function (done) {
            request(url)
                .get('/register/verify?' + querystring.stringify({token: 'INVALID_TOKEN'}))
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.status, protocol.unaccepted, 'should return unaccepted.');
                    done();
                });
        });
    });

    describe('login', function () {

        it('Should return authorized for existing.', function (done) {
            request(url)
                .post('/login')
                .send({username: user.name, password: user.password})
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    key.token = res.body.token;

                    assert.equal(res.status, protocol.success, 'should be authorized.');
                    done();
                });
        });

        it('Should return unauthorized for non-existing or invalid.', function (done) {
            request(url)
                .post('/login')
                .send({username: 'INVALID_USERNAME', password: 'INVALID_PASSWORD'})
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.status, protocol.unauthorized, 'should return unauthorized.');
                    done();
                });
        });
    });

    describe('token', function () {

        it('Should return success for existing token.', function (done) {
            request(url)
                .get('/api/token?' + querystring.stringify({token: key.token}))
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.status, protocol.success, 'should return success');
                    done();
                });
        });

        it('Should return error on invalid token.', function (done) {
            request(url)
                .get('/api/token?' + querystring.stringify({token: 'INVALID_TOKEN'}))
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.status, protocol.error, 'should return error');
                    done();
                });
        });
    });


    describe('license', function () {

        it('Should return the license text with success.', function (done) {
            request(url)
                .get('/api/license')
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.statusCode, protocol.success, 'should have 200 status');
                    done();
                });
        })
    });


    describe('upload', function () {

        it('Should not allow uploading of images while not verified.', function (done) {
            request(url)
                .post('/register')
                .send({username: user2.name, password: user2.password})
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    request(url)
                        .post('/login')
                        .send({username: user2.name, password: user2.password})
                        .end(function (err, res) {
                            if (err) {
                                throw err;
                            }

                            var params = {
                                image: image.data,
                                description: image.description,
                                token: res.body.token
                            };

                            request(url)
                                .post('/api/upload')
                                .send(params)
                                .end(function (err, res) {
                                    if (err) {
                                        throw err;
                                    }

                                    assert.equal(res.status, protocol.forbidden, 'should return forbidden.');
                                    done();
                                });
                        });
                });
        });

        it('Should return a post ID and success.', function (done) {
            var params = {
                image: image.data,
                description: image.description,
                token: key.token
            };
            request(url)
                .post('/api/upload')
                .send(params)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    image.id = res.body.id;
                    assert.equal(res.status, protocol.success, 'should have 200 status.');
                    assert.notEqual(res.body.id, null, 'should have id.');
                    done();
                });
        });

        it('Should return error on missing data.', function (done) {
            var params = {token: key.token};
            request(url)
                .post('/api/upload')
                .send(params)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.status, protocol.error, 'should have 400 status.');
                    assert.equal(res.body.id, null, 'should not have id.');
                    done();
                });
        });

        it('Should return unauthorized for invalid tokens.', function (done) {
            var params = {image: '', description: '', token: ''};

            request(url)
                .post('/api/upload')
                .send(params)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.status, protocol.unauthorized, 'should have 401 status.');
                    done();
                });
        });

    });

    describe('browse', function () {

        it('Should return the correct image data for browsed picture.', function (done) {
            request(url)
                .get('/api/browse/download?' + querystring.stringify({image: image.id, token: key.token}))
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.status, protocol.success, 'should have success status.');
                    assert.equal(res.body.image, image.data, 'Should equal image data.');
                    done();
                });
        });

        it('Should return images containing the tag.', function (done) {
            request(url)
                .get('/api/browse/tags?' + querystring.stringify({tags: 'life', token: key.token}))
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.body.length, 1, 'Should contain the tag searched.');
                    assert.equal(res.status, protocol.success, 'should have success status.');
                    done();
                });
        });

        it('Should return unauthorized for invalid tokens.', function (done) {
            request(url)
                .get('/api/browse/tags?' + querystring.stringify({tags: 'life', token: 'invalid_token'}))
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.status, protocol.unauthorized, 'Should not be authorized.');
                    done();
                });
        });

        it('Should not return images not containing the tag.', function (done) {
            request(url)
                .get('/api/browse/tags?' + querystring.stringify({tags: 'noexist', token: key.token}))
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.body.length, 0, 'Should not return any images.');
                    assert.equal(res.status, protocol.success, 'should have success status.');
                    done();
                });
        });

        it('Should track the amount of times image viewed.', function (done) {
            request(url)
                .get('/api/browse/tags?' + querystring.stringify({tags: 'life', token: key.token}))
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.body[0].views, 1, 'Should have the view count increased.');
                    assert.equal(res.status, protocol.success, 'should have success status.');
                    done();
                });
        });

        it('Should return tag completion successfully.', function (done) {
            request(url)
                .get('/api/browse/tagcompletion?' + querystring.stringify({search: 'li', token: key.token}))
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.body[0], 'life', 'Should complete the tag.');
                    assert.equal(res.status, protocol.success, 'should have success status.');
                    done();
                });
        });
    });


    describe('gallery', function () {

        it('Should add an image to the users gallery.', function (done) {
            request(url)
                .post('/api/save')
                .send({image: image.id, token: key.token})
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.status, protocol.success, 'should have success status.');
                    done();
                });
        });


        it('Should return images in the gallery.', function (done) {
            request(url)
                .get('/api/browse/gallery?' + querystring.stringify({token: key.token}))
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.body[0].description, image.description, 'Image description should be equal.');
                    assert.equal(res.status, protocol.success, 'should have success status.');
                    done();
                });
        });

       it('Should return unauthorized for invalid tokens.', function (done) {
            request(url)
                .get('/api/browse/gallery' + querystring.stringify({token: 'invalid_token'}))
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.status, protocol.unauthorized, 'Should not be authorized.');
                    done();
                });
        });
    });


    describe('report', function () {
        it('Should increase the reported counter of the image', function (done) {
            request(url)
                .post('/api/report')
                .send({image: image.id, token: key.token})
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.body.reported, 1, 'Should have the report count increased.');
                    assert.equal(res.status, protocol.success, 'should have success status.');
                    done();
                });
        });

        it('Should remove images that have been reported.', function (done) {
            request(url)
                .get('/api/browse/download?' + querystring.stringify({image: image.id, token: key.token}))
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.status, protocol.missing, 'should have missing status.');
                    done();
                });
        });

        it('Should unsave an image from the gallery.', function (done) {
            request(url)
                .post('/api/unsave')
                .send({image: image.id, token: key.token})
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.status, protocol.success, 'should have success status.');
                    done();
                });
        });


        it('Should return unauthorized for invalid tokens.', function (done) {
            request(url)
                .post('/api/report')
                .send({token: 'invalid_token'})
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.status, protocol.unauthorized, 'Should not be authorized.');

                    request(url)
                        .get('/api/save?' + querystring.stringify({token: 'invalid_token'}))
                        .end(function (err, res) {
                            if (err) {
                                throw err;
                            }

                            assert.equal(res.status, protocol.unauthorized, 'Should not be authorized.');
                            done();
                        });
                });
        });
    });

});