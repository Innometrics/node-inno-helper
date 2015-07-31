var InnoHelper = require('../..').InnoHelper,
    assert = require('assert'),
    sinon = require('sinon'),
    request = require('request');

describe('Inno Helper/AppSettings', function () {

    var config = {bucketName: 'bucketName', appName: 'appName', appKey: 'appKey', apiUrl: 'apiUrl', groupId: 4},
        helper;

    function createHelper (conf) {
        return new InnoHelper(conf);
    }

    beforeEach(function () {
        helper = createHelper(config);
    });

    describe('Get methods', function () {

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


    describe('Set methods', function () {

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
