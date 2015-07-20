var InnoHelper = require('..').InnoHelper,
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
