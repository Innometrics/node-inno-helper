var InnoHelper = require('../..').InnoHelper,
    Profile = require('../..').Profile,
    assert = require('assert'),
    sinon = require('sinon'),
    request = require('request');

var config = {
        bucketName: 'bucketName',
        appName: 'appName',
        appKey: 'appKey',
        apiUrl: 'apiUrl',
        evaluationApiUrl: 'evaluationApiUrl',
        groupId: 4
    },
    helper;

function createHelper (conf) {
    return new InnoHelper(conf);
}

describe('Inno Helper/Segments', function () {
    beforeEach(function () {
        helper = createHelper(config);
    });

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

describe('Inno Helper/Segment evaluation', function () {
    beforeEach(function () {
        helper = createHelper(config);
    });

    it('should return error if segment is not an instance of Segment', function () {
        var fakeSegment = {
                id: 1
            },
            fakeProfile = {
                id: 2
            };
        helper.evaluateProfileBySegment(fakeProfile, fakeSegment, function (error) {
            assert(error);
            assert.equal(error.message, 'Argument "segment" should be a Segment instance');
        });
    });

    it('should delegate evaluation ProfileBySegment', function () {
        var profile = helper.createProfile('pid'),
            segment = new Profile.Segment({
                id: '1',
                iql: 'my-iql'
            }),
            callback = function () {};

        sinon.stub(helper, 'evaluateProfileBySegmentId');

        helper.evaluateProfileBySegment(profile, segment, callback);
        assert(helper.evaluateProfileBySegmentId.calledWith(profile, '1', callback));
        helper.evaluateProfileBySegmentId.restore();
    });

    it('should delegate evaluation ProfileBySegmentId', function () {
        var profile = helper.createProfile('pid'),
            segmentId = '1',
            callback = function () {};

        sinon.stub(helper, '_evaluateProfileByParams');
        helper.evaluateProfileBySegmentId(profile, segmentId, callback);
        assert(helper._evaluateProfileByParams.calledWith(profile, {
            segment_id: [segmentId],
            typeSegmentEvaluation: 'segment-id-evaluation'
        }, callback));
        helper._evaluateProfileByParams.restore();
    });

    it('should delegate evaluation ProfileByIql', function () {
        var profile = helper.createProfile('pid'),
            segmentIql = 'my-iql',
            callback = function () {};

        sinon.stub(helper, '_evaluateProfileByParams');
        helper.evaluateProfileByIql(profile, segmentIql, callback);
        assert(helper._evaluateProfileByParams.calledWith(profile, {
            iql: segmentIql,
            typeSegmentEvaluation: 'iql-evaluation'
        }, callback));
        helper._evaluateProfileByParams.restore();
    });

    it('should return error from Profile evaluation if profile is not instance of Profile', function (done) {
        var fakeProfile = {
            id: 1
        };

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

        helper._evaluateProfileByParams(profile, {
            some: 'params',
            are: 'here',
            typeSegmentEvaluation: 'segment-id-evaluation'
        }, function () {
            assert(request.get.calledWith({
                url: 'evaluationApiUrl/v1/companies/4/buckets/bucketName/segment-id-evaluation?app_key=appKey&some=params&are=here&profile_id=pid',
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
                results: 'some result'
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
