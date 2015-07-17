var InnoHelper = require('..').InnoHelper,
    assert = require('assert');

describe.only('Inno Helper', function () {

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
        var config = {bucketName: 'bucketName', appName: 'appName', appKey: 'appKey', apiUrl: 'apiUrl', groupId: 4},
            helper;

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

        describe('profile', function () {

            it('should properly create new profile', function () {
                var id = 'profile-id',
                    profile = helper.createProfile('profile-id');

                assert.equal(profile.getId(), id);
                assert.deepEqual(profile.getSessions(), []);
                assert.deepEqual(profile.getAttributes(), []);
            });

            // it('should properly create profile from Profile Stream', function () {

            // });

        });

    });

});
