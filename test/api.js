/**
 * Created by krakenboss on 2015-08-02.
 *
 * tests login and registration.
 */

// starts the server.
//const www = require('../bin/www');

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

describe('API', () => {
    const url = 'https://localhost:1443';
    const key = {token: '', verification: ''};
    const image = {id: '', data: 'data', description: '#life #nodejs #attack haha!'};
    const user = {name: 'codingchili@testing.com', password: 'oneflowertwoflower'};
    const user2 = {name: 'coderchili@testing.com', password: 'nullifish'};

    after((done) => {
        account.clear((err) => {
            if (err) throw err;
            token.clear((err) => {
                if (err) throw err;
                picture.clear((err) => {
                    if (err) throw err;

                    done();
                });
            });
        });
    });

    before((done) => {
        done();
    });

    describe('register', () => {
        it('Should return success on creation.', (done) => {
            request(url)
                .post('/register')
                .send({username: user.name, password: user.password})
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }

                    key.verification = res.body.key;

                    assert.equal(res.status, protocol.success, 'should return success.');
                    done();
                });
        });

        it('Should return conflict on already exists.', (done) => {
            request(url)
                .post('/register')
                .send({username: user.name, password: user.password})
                .end((err, res) => {

                    if (err) {
                        throw err;
                    }

                    assert.equal(res.status, protocol.conflict, 'should return conflict.');
                    done();
                });
        });

        it('Should return unaccepted on invalid indata.', (done) => {
            request(url)
                .post('/register')
                .send({username: user.name, password: 'Error'})
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.status, protocol.unaccepted, 'should return unaccepted.');
                    done();
                });
        });

        it('Should verify an existing account.', (done) => {
            request(url)
                .get('/register/verify?' + querystring.stringify({token: key.verification}))
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.status, protocol.success, 'should return success.');
                    done();
                });
        });

        it('Should reject invalid verification tokens.', (done) => {
            request(url)
                .get('/register/verify?' + querystring.stringify({token: 'INVALID_TOKEN'}))
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.status, protocol.unaccepted, 'should return unaccepted.');
                    done();
                });
        });
    });

    describe('login', () => {

        it('Should return authorized for existing.', (done) => {
            request(url)
                .post('/login')
                .send({username: user.name, password: user.password})
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }

                    key.token = res.body.token;

                    assert.equal(res.status, protocol.success, 'should be authorized.');
                    done();
                });
        });

        it('Should return unauthorized for non-existing or invalid.', (done) => {
            request(url)
                .post('/login')
                .send({username: 'INVALID_USERNAME', password: 'INVALID_PASSWORD'})
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.status, protocol.unauthorized, 'should return unauthorized.');
                    done();
                });
        });
    });

    describe('token', () => {

        it('Should return success for existing token.', (done) => {
            request(url)
                .get('/api/token?' + querystring.stringify({token: key.token}))
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.status, protocol.success, 'should return success');
                    done();
                });
        });

        it('Should return error on invalid token.', (done) => {
            request(url)
                .get('/api/token?' + querystring.stringify({token: 'INVALID_TOKEN'}))
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.status, protocol.error, 'should return error');
                    done();
                });
        });
    });


    describe('license', () => {

        it('Should return the license text with success.', (done) => {
            request(url)
                .get('/api/license')
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.statusCode, protocol.success, 'should have 200 status');
                    done();
                });
        })
    });


    describe('upload', () => {
        it('Should not allow uploading of images while not verified.', (done) => {
            request(url)
                .post('/register')
                .send({username: user2.name, password: user2.password})
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.status, protocol.success, 'account registration failure.');

                    request(url)
                        .post('/login')
                        .send({username: user2.name, password: user2.password})
                        .end((err, res) => {
                            if (err) {
                                throw err;
                            }
                            let params = {
                                image: image.data,
                                description: image.description,
                                token: res.body.token
                            };

                            request(url)
                                .post('/api/upload')
                                .send(params)
                                .end((err, res) => {
                                    if (err) {
                                        throw err;
                                    }

                                    assert.equal(res.status, protocol.forbidden, 'should return forbidden.');
                                    done();
                                });
                        });
                });
        }).timeout(5000);

        it('Should return a post ID and success.', (done) => {
            var params = {
                image: image.data,
                description: image.description,
                token: key.token
            };
            request(url)
                .post('/api/upload')
                .send(params)
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }

                    image.id = res.body.id;
                    assert.equal(res.status, protocol.success, 'should have 200 status.');
                    assert.notEqual(res.body.id, null, 'should have id.');
                    done();
                });
        });

        it('Should return error on missing data.', (done) => {
            var params = {token: key.token};
            request(url)
                .post('/api/upload')
                .send(params)
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.status, protocol.error, 'should have 400 status.');
                    assert.equal(res.body.id, null, 'should not have id.');
                    done();
                });
        });

        it('Should return unauthorized for invalid tokens.', (done) => {
            var params = {image: '', description: '', token: ''};

            request(url)
                .post('/api/upload')
                .send(params)
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.status, protocol.unauthorized, 'should have 401 status.');
                    done();
                });
        });

    });

    describe('browse', () => {

        it('Should return the correct image data for browsed picture.', (done) => {
            request(url)
                .get('/api/browse/download?' + querystring.stringify({image: image.id, token: key.token}))
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.status, protocol.success, 'should have success status.');
                    assert.equal(res.body.image, image.data, 'Should equal image data.');
                    done();
                });
        });

        it('Should return images containing the tag.', (done) => {
            request(url)
                .get('/api/browse/tags?' + querystring.stringify({tags: 'life', token: key.token}))
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.body.length, 1, 'Should contain the tag searched.');
                    assert.equal(res.status, protocol.success, 'should have success status.');
                    done();
                });
        });

        it('Should return unauthorized for invalid tokens.', (done) => {
            request(url)
                .get('/api/browse/tags?' + querystring.stringify({tags: 'life', token: 'invalid_token'}))
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.status, protocol.unauthorized, 'Should not be authorized.');
                    done();
                });
        });

        it('Should not return images not containing the tag.', (done) => {
            request(url)
                .get('/api/browse/tags?' + querystring.stringify({tags: 'noexist', token: key.token}))
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.body.length, 0, 'Should not return any images.');
                    assert.equal(res.status, protocol.success, 'should have success status.');
                    done();
                });
        });

        it('Should track the amount of times image viewed.', (done) => {
            request(url)
                .get('/api/browse/tags?' + querystring.stringify({tags: 'life', token: key.token}))
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.body[0].views, 1, 'Should have the view count increased.');
                    assert.equal(res.status, protocol.success, 'should have success status.');
                    done();
                });
        });

        it('Should return tag completion successfully.', (done) => {
            request(url)
                .get('/api/browse/tagcompletion?' + querystring.stringify({search: 'li', token: key.token}))
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.body[0], 'life', 'Should complete the tag.');
                    assert.equal(res.status, protocol.success, 'should have success status.');
                    done();
                });
        });
    });


    describe('gallery', () => {

        it('Should add an image to the users gallery.', (done) => {
            request(url)
                .post('/api/save')
                .send({image: image.id, token: key.token})
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.status, protocol.success, 'should have success status.');
                    done();
                });
        });


        it('Should return images in the gallery.', (done) => {
            request(url)
                .get('/api/browse/gallery?' + querystring.stringify({token: key.token}))
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.body[0].description, image.description, 'Image description should be equal.');
                    assert.equal(res.status, protocol.success, 'should have success status.');
                    done();
                });
        });

        it('Should return unauthorized for invalid tokens.', (done) => {
            request(url)
                .get('/api/browse/gallery' + querystring.stringify({token: 'invalid_token'}))
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.status, protocol.unauthorized, 'Should not be authorized.');
                    done();
                });
        });
    });


    describe('report', () => {
        it('Should increase the reported counter of the image', (done) => {
            request(url)
                .post('/api/report')
                .send({image: image.id, token: key.token})
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.body.reported, 1, 'Should have the report count increased.');
                    assert.equal(res.status, protocol.success, 'should have success status.');
                    done();
                });
        });

        it('Should remove images that have been reported.', (done) => {
            request(url)
                .get('/api/browse/download?' + querystring.stringify({image: image.id, token: key.token}))
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.status, protocol.missing, 'should have missing status.');
                    done();
                });
        });

        it('Should unsave an image from the gallery.', (done) => {
            request(url)
                .post('/api/unsave')
                .send({image: image.id, token: key.token})
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.status, protocol.success, 'should have success status.');
                    done();
                });
        });


        it('Should return unauthorized for invalid tokens.', (done) => {
            request(url)
                .post('/api/report')
                .send({token: 'invalid_token'})
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }

                    assert.equal(res.status, protocol.unauthorized, 'Should not be authorized.');

                    request(url)
                        .get('/api/save?' + querystring.stringify({token: 'invalid_token'}))
                        .end((err, res) => {
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