var InnoHelper = require('../..').InnoHelper,
    util = require('util'),
    assert = require('assert');

describe('Inno Helper/Common', function () {
    var config = {bucketName: 'bucketName', appName: 'appName', appKey: 'appKey', apiUrl: 'apiUrl', groupId: 4};

    function createHelper (conf) {
        return new InnoHelper(conf);
    }

    describe('Creation', function () {

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

    describe('Get methods', function () {
        var helper;

        beforeEach(function () {
            helper = createHelper(config);
        });

        describe('settings', function () {

            it('should properly get settings', function () {
                var helper = createHelper(config);
                assert.strictEqual(helper.getBucket(), config.bucketName);
                assert.strictEqual(helper.getCollectApp(), config.appName);
                assert.strictEqual(helper.getAppKey(), config.appKey);
                assert.strictEqual(helper.getApiHost(), config.apiUrl);
                assert.strictEqual(helper.getCompany(), config.groupId);
                assert.equal(helper.isCacheAllowed(), true);
            });

            it('should properly set that cache is allowed', function () {
                var helper = createHelper(util._extend(config, {
                    noCache: true
                }));

                assert.equal(helper.isCacheAllowed(), false);
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

    });

    describe('Internal methods', function () {

        describe('Object validation', function () {
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

        describe('Error checker', function () {
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



});
