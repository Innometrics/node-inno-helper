var InnoHelper = require('../..').InnoHelper,
    assert = require('assert'),
    sinon = require('sinon'),
    request = require('request');

describe('Inno Helper/Profile', function () {
    var config = {
            bucketName: 'bucketName',
            appName: 'appName',
            appKey: 'appKey',
            apiUrl: 'apiUrl',
            groupId: 4,
            schedulerApiHost: 'http://schedulerApiHost'
        },
        helper;

    function createHelper (conf) {
        return new InnoHelper(conf);
    }

    beforeEach(function () {
        helper = createHelper(config);
    });

    it('should use schedulerApiHost form config', function () {
        assert.equal(helper.getSchedulerApiHost(), 'http://schedulerApiHost');
    });

    it('should use company, bucket and app as ID', function () {
        assert.equal(helper.getSchedulerId(), '4-bucketName-appName');
    });

    it('should return ', function () {
        assert.equal(helper.getSchedulerApiUrl(), 'http://schedulerApiHost/scheduler/4-bucketName-appName?token=appKey');
        assert.equal(helper.getSchedulerApiUrl({taskId: false}), 'http://schedulerApiHost/scheduler/4-bucketName-appName?token=appKey');
        assert.equal(helper.getSchedulerApiUrl({taskId: 123}), 'http://schedulerApiHost/scheduler/4-bucketName-appName/123?token=appKey');
    });

    it('should return scheduler token equal appkey', function () {
        assert.equal(helper.getSchedulerToken(), 'appKey');
    });

    describe('Tasks API', function () {
        describe('GET', function () {
            it('should make properly request to get tasks', function (done) {
                var resBody = JSON.stringify({hello: 'kitty'});
                sinon.stub(request, 'get', function (params, callback) {
                    callback(null, {
                        body: resBody,
                        statusCode: 200
                    });
                });
                helper.getTasks(function (error, body) {
                    assert.ifError(error);
                    request.get.calledWith({
                        url: 'http://schedulerApiHost/scheduler/4-bucketName-appName?token=appKey',
                        json: true
                    });
                    assert.equal(body, resBody);
                    request.get.restore();
                    done();
                });
            });

            it('should return error from request to get tasks', function (done) {
                sinon.stub(request, 'get', function (params, callback) {
                    callback(new Error('some error'));
                });
                helper.getTasks(function (error) {
                    assert.ok(error);
                    assert.equal(error.message, 'some error');
                    request.get.restore();
                    done();
                });
            });
        });

        describe('ADD', function () {
            it('should throw error if no timestamp and no delay', function (done) {
                helper.addTask({}, function (error) {
                    assert.ok(error);
                    assert.equal(error.message, 'Either use timestamp or delay');
                    done();
                });
            });

            it('should throw error if both timestamp and delay passed', function (done) {
                helper.addTask({
                    timestamp: 1,
                    delay: 2
                }, function (error) {
                    assert.ok(error);
                    assert.equal(error.message, 'You should use only one field: timestamp or delay');
                    done();
                });
            });

            it('should make properly request to add task', function (done) {
                var params = {delay: 1},
                    resBody = JSON.stringify({hello: 'kitty'});

                sinon.stub(request, 'post', function (params, callback) {
                    callback(null, {
                        body: resBody,
                        statusCode: 201
                    });
                });
                helper.addTask(params, function (error) {
                    assert.ifError(error);
                    request.post.calledWith({
                        url: 'http://schedulerApiHost/scheduler/4-bucketName-appName?token=appKey',
                        json: true,
                        body: params
                    });
                    request.post.restore();
                    done();
                });
            });

            it('should return error from request to add task', function (done) {
                var params = {delay: 1};
                sinon.stub(request, 'post', function (params, callback) {
                    callback(new Error('some error'));
                });
                helper.addTask(params, function (error) {
                    assert.ok(error);
                    assert.equal(error.message, 'some error');
                    request.post.restore();
                    done();
                });
            });
        });

        describe('DELETE', function () {
            it('should throw error if no taskId', function (done) {
                helper.deleteTask({}, function (error) {
                    assert.ok(error);
                    assert.equal(error.message, 'Parameter "taskId" required');
                    done();
                });
            });

            it('should make properly request to delete task', function (done) {
                var taskId = 42,
                    params = {taskId: taskId};

                var resBody = JSON.stringify({hello: 'kitty'});
                sinon.stub(request, 'del', function (params, callback) {
                    callback(null, {
                        body: resBody,
                        statusCode: 204
                    });
                });
                helper.deleteTask(params, function (error) {
                    assert.ifError(error);
                    request.del.calledWith({
                        url: 'http://schedulerApiHost/scheduler/4-bucketName-appName/' + taskId + '?token=appKey',
                        json: true
                    });
                    request.del.restore();
                    done();
                });
            });

            it('should return error from request to delete task', function (done) {
                sinon.stub(request, 'del', function (params, callback) {
                    callback(new Error('some error'));
                });
                helper.deleteTask({taskId: 123}, function (error) {
                    assert.ok(error);
                    assert.equal(error.message, 'some error');
                    request.del.restore();
                    done();
                });
            });
        });
    });
});
