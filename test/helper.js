var InnoHelper = require('..').InnoHelper,
    Profile = require('..').Profile,
    assert = require('assert'),
    sinon = require('sinon'),
    request = require('request');

describe('Inno Helper', function () {
    var config = {bucketName: 'bucketName', appName: 'appName', appKey: 'appKey', apiUrl: 'apiUrl', groupId: 4};

    function createHelper (conf) {
        return new InnoHelper(conf);
    }

    describe('initialization', function () {

        it('should throw error on empty config', function () {
            assert['throws'](function () {
                createHelper();
            }, /Config should be defined/);
        });

        it('should throw error on non-object config', function () {
            assert['throws'](function () {
                createHelper(true);
            }, /Config should be an object/);
        });

        [{
            field: 'bucketName',
            initConf: {}
        }, {
            field: 'appName',
            initConf: {bucketName: 'bucketName'}
        }, {
            field: 'appKey',
            initConf: {bucketName: 'bucketName', appName: 'appName'}
        }, {
            field: 'apiUrl',
            initConf: {bucketName: 'bucketName', appName: 'appName', appKey: 'appKey'}
        }, {
            field: 'groupId',
            initConf: {bucketName: 'bucketName', appName: 'appName', appKey: 'appKey', apiUrl: 'apiUrl'}
        }].forEach(function (test) {
            var field = test.field,
                conf = test.initConf;

            it('should throw error if ' + field + ' not defined', function () {
                assert['throws'](function () {
                    createHelper(conf);
                }, new RegExp('Property "' + field + '" in config should be defined'));
            });
            it('should throw error if ' + field + ' not a string', function () {
                conf[field] = true;
                assert['throws'](function () {
                    createHelper(conf);
                }, new RegExp('Property "' + field + '" in config should be a string'));
            });
            it('should throw error if ' + field + ' is empty', function () {
                conf[field] = '       ';
                assert['throws'](function () {
                    createHelper(conf);
                }, new RegExp('Property "' + field + '" in config can not be empty'));
            });
        });

        it('should not throw error if all required props present', function () {
            assert.doesNotThrow(function () {
                createHelper({bucketName: 'bucketName', appName: 'appName', appKey: 'appKey', apiUrl: 'apiUrl', groupId: 4});
            });
            assert.doesNotThrow(function () {
                createHelper({bucketName: 'bucketName', appName: 'appName', appKey: 'appKey', apiUrl: 'apiUrl', groupId: '42'});
            });
        });

    });

    describe('interface', function () {
        var helper;

        beforeEach(function () {
            helper = createHelper(config);
        });

        describe('settings', function () {

            it('should properly get settings', function () {
                assert.strictEqual(helper.getBucket(), config.bucketName);
                assert.strictEqual(helper.getCollectApp(), config.appName);
                assert.strictEqual(helper.getAppKey(), config.appKey);
                assert.strictEqual(helper.getApiHost(), config.apiUrl);
                assert.strictEqual(helper.getCompany(), config.groupId);
            });

        });

        describe('url generation', function () {

            it('should return ProfileUrl', function () {
                assert.equal(helper.getProfileUrl('some-profile'), 'apiUrl/v1/companies/4/buckets/bucketName/profiles/some-profile?app_key=appKey');
            });

            it('should return AppSettingsUrl', function () {
                assert.equal(helper.getAppSettingsUrl(), 'apiUrl/v1/companies/4/buckets/bucketName/apps/appName/custom?app_key=appKey');
            });

            it('should return SegmentsUrl', function () {
                assert.equal(helper.getSegmentsUrl(), 'apiUrl/v1/companies/4/buckets/bucketName/segments?app_key=appKey');
            });

            it('should return SegmentEvaluationUrl', function () {
                assert.equal(helper.getSegmentEvaluationUrl({param1: 'value1'}), 'apiUrl/v1/companies/4/buckets/bucketName/segment-evaluation?app_key=appKey&param1=value1');
            });

        });

        describe('Profile', function () {

            it('should properly create new profile', function () {
                var id = 'profile-id',
                    profile = helper.createProfile('profile-id');

                assert.equal(profile.getId(), id);
                assert.deepEqual(profile.getSessions(), []);
                assert.deepEqual(profile.getAttributes(), []);
            });

            describe('Load', function () {

                it('should make properly request to load profile', function (done) {
                    var pid = 'pid';

                    sinon.stub(request, 'get', function (opts, callback) {
                        callback();
                    });

                    helper.loadProfile(pid, function () {

                        assert(request.get.calledWith({
                            url: 'apiUrl/v1/companies/4/buckets/bucketName/profiles/pid?app_key=appKey',
                            json: true
                        }));

                        request.get.restore();
                        done();
                    });
                });

                it('should return error if occurred while request', function (done) {
                    sinon.stub(request, 'get', function (opts, callback) {
                        callback(new Error('request error'));
                    });
                    helper.loadProfile('pid', function (error) {
                        assert(error);
                        assert(error.message, 'request error');
                        request.get.restore();
                        done();
                    });
                });

                [{
                    body: {}
                }, {
                    body: {profile: true}
                }].forEach(function (test) {
                        it('should return null if profile data corrupted', function (done) {
                            sinon.stub(request, 'get', function (opts, callback) {
                                var response = {
                                    statusCode: 200,
                                    body: test.body
                                };
                                callback(null, response);
                            });
                            helper.loadProfile('pid', function (error, profile) {
                                assert.ifError(error);
                                assert.strictEqual(profile, null);
                                request.get.restore();
                                done();
                            });
                        });
                    });

                it('should return profile', function (done) {
                    sinon.stub(request, 'get', function (opts, callback) {
                        var response = {
                            statusCode: 200,
                            body: {
                                profile: {id: 'pid'}
                            }
                        };
                        callback(null, response);
                    });
                    helper.loadProfile('pid', function (error, profile) {
                        assert.ifError(error);
                        assert(profile);
                        assert.equal(profile.getId(), 'pid');
                        request.get.restore();
                        done();
                    });
                });

            });

            describe('Delete', function () {

                it('should make properly request to delete profile', function (done) {
                    var pid = 'pid';

                    sinon.stub(request, 'del', function (opts, callback) {
                        callback();
                    });

                    helper.deleteProfile(pid, function () {
                        assert(request.del.calledWith({
                            url: 'apiUrl/v1/companies/4/buckets/bucketName/profiles/pid?app_key=appKey',
                            json: true
                        }));
                        request.del.restore();
                        done();
                    });
                });

                it('should return error if occurred while request', function (done) {
                    sinon.stub(request, 'del', function (opts, callback) {
                        callback(new Error('request error'));
                    });
                    helper.deleteProfile('pid', function (error) {
                        assert(error);
                        assert(error.message, 'request error');
                        request.del.restore();
                        done();
                    });
                });

                it('should not return error if success', function (done) {
                    sinon.stub(request, 'del', function (opts, callback) {
                        var response = {
                            statusCode: 204,
                            body: {}
                        };
                        callback(null, response);
                    });
                    helper.deleteProfile('pid', function (error) {
                        assert.ifError(error);
                        request.del.restore();
                        done();
                    });
                });

            });


            describe('Profile Stream', function () {

                it('should throw error on wrong data', function () {
                    var rawBody = 'some non json data';
                    assert['throws'](function () {
                        helper.getProfileFromRequest(rawBody);
                    }, /Wrong stream data/);
                });

                it('should throw error if data has not "profile" property', function () {
                    var jsonBody = {noprofile: 'hahaha'};
                    assert['throws'](function () {
                        helper.getProfileFromRequest(jsonBody);
                    }, /Profile not found/);
                });

                it('should properly create profile from Profile Stream', function () {
                    var id = 'profile-id',
                        jsonBody = {profile: {id: id}},
                        profile;

                    profile = helper.getProfileFromRequest(jsonBody);
                    assert(profile);
                    assert.equal(profile.getId(), id);

                    profile = helper.getProfileFromRequest(JSON.stringify(jsonBody));
                    assert(profile);
                    assert.equal(profile.getId(), id);
                });

                describe('meta', function () {

                    it('should throw error on wrong meta data', function () {
                        var rawBody = 'some non json data';
                        assert['throws'](function () {
                            helper.getMetaFromRequest(rawBody);
                        }, /Wrong stream data/);
                    });

                    it('should throw error if data has not "meta" property', function () {
                        var jsonBody = {nometa: 'hahaha'};
                        assert['throws'](function () {
                            helper.getMetaFromRequest(jsonBody);
                        }, /Meta not found/);
                    });

                    it('should properly create profile from Profile Stream', function () {
                        var meta = {some: 'data', or: 'ip', and: 42},
                            jsonBody = {meta: meta};

                        assert.deepEqual(helper.getMetaFromRequest(jsonBody), meta);
                        assert.deepEqual(helper.getMetaFromRequest(JSON.stringify(jsonBody)), meta);
                    });

                });

            });
        });

        describe('AppSettings', function () {

            describe('GET', function () {

                it('should make properly request to get application settings', function (done) {
                    sinon.stub(request, 'get', function (opts, callback) {
                        callback();
                    });
                    helper.getAppSettings(function () {
                        assert(request.get.calledWith({
                            url: 'apiUrl/v1/companies/4/buckets/bucketName/apps/appName/custom?app_key=appKey',
                            json: true
                        }));
                        request.get.restore();
                        done();
                    });
                });

                it('should return error if occurred while request', function (done) {
                    sinon.stub(request, 'get', function (opts, callback) {
                        callback(new Error('request error'));
                    });
                    helper.getAppSettings(function (error) {
                        assert(error);
                        assert(error.message, 'request error');
                        request.get.restore();
                        done();
                    });
                });

                it('should return error if "custom" field not found', function (done) {
                    sinon.stub(request, 'get', function (opts, callback) {
                        callback(null, {statusCode: 200, body: {no: 'custom'}});
                    });
                    helper.getAppSettings(function (error) {
                        assert(error);
                        assert(error.message, 'CUSTOM not found');
                        request.get.restore();
                        done();
                    });
                });

                it('should return settings', function (done) {
                    sinon.stub(request, 'get', function (opts, callback) {
                        callback(null, {statusCode: 200, body: {custom: ['settings', 'here']}});
                    });
                    helper.getAppSettings(function (error, settings) {
                        assert.ifError(error);
                        assert.deepEqual(settings, ['settings', 'here']);
                        request.get.restore();
                        done();
                    });
                });

            });


            describe('SET', function () {

                it('should throw error if no settings passed', function (done) {

                    helper.setAppSettings(null, function (error) {
                        assert(error);
                        assert.equal(error.message, 'Settings not found');
                        done();
                    });
                });

                it('should make properly request to set application settings', function (done) {
                    var settings = {test: 'qwe'};

                    sinon.stub(request, 'put', function (opts, callback) {
                        callback();
                    });

                    helper.setAppSettings(settings, function () {
                        assert(request.put.calledWith({
                            url: 'apiUrl/v1/companies/4/buckets/bucketName/apps/appName/custom?app_key=appKey',
                            body: settings,
                            json: true
                        }));
                        request.put.restore();
                        done();
                    });
                });

                it('should return error if occurred while request', function (done) {
                    sinon.stub(request, 'put', function (opts, callback) {
                        callback(new Error('request error'));
                    });
                    helper.setAppSettings({}, function (error) {
                        assert(error);
                        assert(error.message, 'request error');
                        request.put.restore();
                        done();
                    });
                });

                it('should return error if "custom" field not found', function (done) {
                    sinon.stub(request, 'put', function (opts, callback) {
                        callback(null, {statusCode: 200, body: {no: 'custom'}});
                    });
                    helper.setAppSettings({}, function (error) {
                        assert(error);
                        assert(error.message, 'CUSTOM not found');
                        request.put.restore();
                        done();
                    });
                });

                it('should return settings', function (done) {
                    sinon.stub(request, 'put', function (opts, callback) {
                        callback(null, {statusCode: 200, body: {custom: ['settings', 'here']}});
                    });
                    helper.setAppSettings({}, function (error, settings) {
                        assert.ifError(error);
                        assert.deepEqual(settings, ['settings', 'here']);
                        request.put.restore();
                        done();
                    });
                });

            });

        });

        describe('Segments', function () {

            it('should make properly request to get segmensts', function (done) {
                sinon.stub(request, 'get', function (opts, callback) {
                    callback();
                });
                helper.getSegments(function () {
                    assert(request.get.calledWith({
                        url: 'apiUrl/v1/companies/4/buckets/bucketName/segments?app_key=appKey',
                        json: true
                    }));
                    request.get.restore();
                    done();
                });
            });

            it('should return error if occurred while request', function (done) {
                sinon.stub(request, 'get', function (opts, callback) {
                    callback(new Error('request error'));
                });
                helper.getSegments(function (error) {
                    assert(error);
                    assert(error.message, 'request error');
                    request.get.restore();
                    done();
                });
            });

            [
                {
                    body: [{
                        segment: {
                            id: '1',
                            iql: 'test1'
                        }
                    }, {
                        segment: {
                            id: '1',
                            noiql: 'HAHA'
                        }
                    }, {
                        no: 'segment'
                    },
                        'non object!!'
                    ],
                    count: 1
                }, {
                    body: {
                        non: {
                            array: 'data'
                        }
                    },
                    count: 0
                }
            ].forEach(function (test) {
                it('should return array of segments', function (done) {
                    sinon.stub(request, 'get', function (opts, callback) {
                        var response = {
                            statusCode: 200,
                            body: test.body
                        };
                        callback(null, response);
                    });
                    helper.getSegments(function (error, segments) {
                        assert.ifError(error);
                        assert(segments);
                        assert(segments instanceof Array);
                        assert.equal(segments.length, test.count);
                        request.get.restore();
                        done();
                    });
                });
            });

        });

        describe('Segment evaluation', function () {

            it('should return error if segment is not an instance of Segment', function () {
                var fakeSegment = {id: 1},
                    fakeProfile = {id: 2};
                helper.evaluateProfileBySegment(fakeProfile, fakeSegment, function (error) {
                    assert(error);
                    assert.equal(error.message, 'Argument "segment" should be a Segment instance');
                });
            });

            it('should delegate evaluation ProfileBySegment', function () {
                var profile = helper.createProfile('pid'),
                    segment = new Profile.Segment({
                        id: "1",
                        iql: 'my-iql'
                    }),
                    callback = function () {};

                sinon.stub(helper, 'evaluateProfileBySegmentId');

                helper.evaluateProfileBySegment(profile, segment, callback);
                assert(helper.evaluateProfileBySegmentId.calledWith(profile, "1", callback));
                helper.evaluateProfileBySegmentId.restore();
            });

            it('should delegate evaluation ProfileBySegmentId', function () {
                var profile = helper.createProfile('pid'),
                    segmentId = "1",
                    callback = function () {};

                sinon.stub(helper, '_evaluateProfileByParams');
                helper.evaluateProfileBySegmentId(profile, segmentId, callback);
                assert(helper._evaluateProfileByParams.calledWith(profile, {
                    segment_id: segmentId
                }, callback));
                helper._evaluateProfileByParams.restore();
            });

            it('should delegate evaluation ProfileByIql', function () {
                var profile = helper.createProfile('pid'),
                    segmentIql = "my-iql",
                    callback = function () {};

                sinon.stub(helper, '_evaluateProfileByParams');
                helper.evaluateProfileByIql(profile, segmentIql, callback);
                assert(helper._evaluateProfileByParams.calledWith(profile, {
                    iql: segmentIql
                }, callback));
                helper._evaluateProfileByParams.restore();
            });

            it('should return error from Profile evaluation if profile is not instance of Profile', function (done) {
                var fakeProfile = {id: 1};

                helper._evaluateProfileByParams(fakeProfile, {}, function (error) {
                    assert(error);
                    assert.equal(error.message, 'Argument "profile" should be a Profile instance');
                    done();
                });
            });

            it('should make properly request while evaluate Profile', function (done) {
                var profile = helper.createProfile('pid');

                sinon.stub(request, 'get', function (params, callback) {
                    callback();
                });

                helper._evaluateProfileByParams(profile, {some: 'params', are: 'here'}, function () {
                    assert(request.get.calledWith({
                        url: 'apiUrl/v1/companies/4/buckets/bucketName/segment-evaluation?app_key=appKey&some=params&are=here&profile_id=pid',
                        json: true
                    }));
                    request.get.restore();
                    done();
                });
            });

            it('should return error if occurred while request', function (done) {
                var profile = helper.createProfile('pid');
                sinon.stub(request, 'get', function (opts, callback) {
                    callback(new Error('request error'));
                });
                helper._evaluateProfileByParams(profile, {}, function (error) {
                    assert(error);
                    assert(error.message, 'request error');
                    request.get.restore();
                    done();
                });
            });

            [{
                body: {
                    segmentEvaluation: {
                        noresult: 'here'
                    }
                },
                result: null
            }, {
                body: {
                    segmentEvaluation: {
                        result: 'some result'
                    }
                },
                result: 'some result'
            }].forEach(function (test) {
                it('should return Profile evaluation result', function (done) {
                    var profile = helper.createProfile('pid');

                    sinon.stub(request, 'get', function (opts, callback) {
                        var responce = {
                            statusCode: 200,
                            body: test.body
                        };
                        callback(null, responce);
                    });

                    helper._evaluateProfileByParams(profile, {}, function (error, result) {
                        assert.ifError(error);
                        assert.equal(result, test.result);
                        request.get.restore();
                        done();
                    });
                });
            });

        });
    });

    describe('object validation', function () {
        var helper;

        beforeEach(function () {
            helper = createHelper(config);
        });

        it('should return error on non-object', function () {
            var err;

            err = helper.validateObject('non obj');
            assert(err);
            assert.equal(err.message, 'Object is not defined');
        });

        it('should return error if required field does not exist', function () {
            var err;

            err = helper.validateObject({foo: 'bar'}, 'baz');
            assert(err);
            assert.equal(err.message, 'BAZ not found');

            err = helper.validateObject({foo: 'bar'}, ['cat']);
            assert(err);
            assert.equal(err.message, 'CAT not found');
        });

        it('should return null all required field present', function () {
            var err;

            err = helper.validateObject({foo: 'bar', test: false}, 'test');
            assert.strictEqual(err, null);
            err = helper.validateObject({foo: 'bar', test: false}, ['test', 'foo']);
            assert.strictEqual(err, null);
        });

    });

    describe('error checker', function () {
        var helper;

        beforeEach(function () {
            helper = createHelper(config);
        });

        it('should return error if it presents', function () {
            var error = new Error('crash');
            assert.strictEqual(helper.checkErrors(error, 'some response', 200), error);
        });

        it('should return error if response is empty or has not body', function () {
            var error;
            error = helper.checkErrors(null, false);
            assert.equal(error.message, 'Response does not contain data');

            error = helper.checkErrors(null, {no: 'body'});
            assert.equal(error.message, 'Response does not contain data');
        });

        [
            null,
            201
        ].forEach(function (code) {
            var msg = code || 'default 200';
            it('should return error it current status code does not equal to ' + msg, function () {
                var error;
                error = helper.checkErrors(null, {body: {message: 'error message'}, statusCode: 418}, code);
                assert.equal(error.message, 'error message');
                assert.equal(error.name, 'Server failed with status code 418');
            });
        });

        it('should return null if no error found', function () {
            var error;
            error = helper.checkErrors(null, {body: {some: 'data'}, statusCode: 418}, 418);
            assert.strictEqual(error, null);
        });

    });









});
