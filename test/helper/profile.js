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
            groupId: 4
        },
        helper;

    function createHelper (conf) {
        return new InnoHelper(conf);
    }

    beforeEach(function () {
        helper = createHelper(config);
    });

    it('should properly create new profile', function () {
        var id = 'profile-id',
            profile = helper.createProfile('profile-id');

        assert.equal(profile.getId(), id);
        assert.deepEqual(profile.getSessions(), []);
        assert.deepEqual(profile.getAttributes(), []);
        assert.equal(profile.hasChanges(), false);
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

        [{body: {}}, {body: {profile: true}}].forEach(function (test) {
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
                    body: {profile: {id: 'pid'}}
                };
                callback(null, response);
            });
            helper.loadProfile('pid', function (error, profile) {
                assert.ifError(error);
                assert(profile);
                assert.equal(profile.getId(), 'pid');
                assert.equal(profile.hasChanges(), false);
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

    describe('Save', function () {
        it('should return error if profile is not instance of Profile', function (done) {
            var fakeProfile = {id: 1};
            helper.saveProfile(fakeProfile, function (error) {
                assert(error);
                assert.equal(error.message, 'Argument "profile" should be a Profile instance');
                done();
            });
        });

        it('should make properly request to save profile', function () {
            var profile = helper.createProfile('pid');

            sinon.stub(request, 'post');
            sinon.spy(profile, 'serialize');

            helper.saveProfile(profile, function () {});
            assert(request.post.calledWith({
                url: 'apiUrl/v1/companies/4/buckets/bucketName/profiles/pid?app_key=appKey',
                body: {
                    id: 'pid',
                    attributes: [],
                    sessions: []
                },
                json: true
            }));
            request.post.restore();
            assert(profile.serialize.called);
            profile.serialize.restore();
        });

        it('should return error if occurred while request', function (done) {
            var profile = helper.createProfile('pid');

            sinon.stub(request, 'post', function (opts, callback) {
                callback(new Error('request error'));
            });
            sinon.spy(profile, 'serialize');

            helper.saveProfile(profile, function (error) {
                assert(error);
                assert(error.message, 'request error');
                request.post.restore();
                assert(profile.serialize.called);
                profile.serialize.restore();
                done();
            });
        });

        it('should return same profile if in received response no profile data', function (done) {
            var profile = helper.createProfile('pid');

            sinon.stub(request, 'post', function (opts, callback) {
                var response = {
                    statusCode: 200,
                    body: {}
                };
                callback(null, response);
            });
            sinon.spy(profile, 'serialize');

            helper.saveProfile(profile, function (error, returnedProfile) {
                assert.ifError(error);
                assert.strictEqual(returnedProfile, profile);
                request.post.restore();
                assert(profile.serialize.called);
                profile.serialize.restore();
                done();
            });
        });

        it('should return profile received after save request', function (done) {
            var profile = helper.createProfile('pid');

            sinon.stub(request, 'post', function (opts, callback) {
                var response = {
                    statusCode: 200,
                    body: {profile: {id: 'pidSaved'}}
                };
                callback(null, response);
            });
            sinon.spy(profile, 'serialize');

            helper.saveProfile(profile, function (error, returnedProfile) {
                assert.ifError(error);
                assert(returnedProfile);
                assert.equal(returnedProfile.getId(), 'pidSaved');
                assert.equal(returnedProfile.hasChanges(), false);
                request.post.restore();
                assert(profile.serialize.called);
                assert(profile.serialize.calledWith(true));
                profile.serialize.restore();
                done();
            });
        });
    });

    describe('Merge', function () {
        it('should return error if profile1 is not instance of Profile', function (done) {
            var fakeProfile1 = {id: 1},
                fakeProfile2 = {id: 2};

            helper.mergeProfiles(fakeProfile1, fakeProfile2, function (error) {
                assert(error);
                assert('Argument "profile1" should be a Profile instance');
                done();
            });
        });

        it('should return error if profile2 is not instance of Profile', function (done) {
            var profile1 = helper.createProfile('pid1'),
                fakeProfile2 = {id: 2};

            helper.mergeProfiles(profile1, fakeProfile2, function (error) {
                assert(error);
                assert('Argument "profile2" should be a Profile instance');
                done();
            });
        });

        it('should make properly request to merge profiles', function (done) {
            var profile1 = helper.createProfile('pid1'),
                profile2 = helper.createProfile('pid2');

            sinon.stub(request, 'post', function (opts, callback) {
                callback();
            });

            helper.mergeProfiles(profile1, profile2, function () {});

            assert(request.post.calledWith({
                url: 'apiUrl/v1/companies/4/buckets/bucketName/profiles/pid1?app_key=appKey',
                body: {
                    id: 'pid1',
                    mergedProfiles: ['pid2']
                },
                json: true
            }));

            request.post.restore();
            done();
        });

        it('should return error if occurred while request', function (done) {
            var profile1 = helper.createProfile('pid1'),
                profile2 = helper.createProfile('pid2');

            sinon.stub(request, 'post', function (opts, callback) {
                callback(new Error('request error'));
            });

            helper.mergeProfiles(profile1, profile2, function (error) {
                assert(error);
                assert(error.message, 'request error');
                request.post.restore();
                done();
            });
        });

        it('should return null if in received response no profile data', function (done) {
            var profile1 = helper.createProfile('pid1'),
                profile2 = helper.createProfile('pid2');

            sinon.stub(request, 'post', function (opts, callback) {
                var response = {
                    statusCode: 200,
                    body: {}
                };
                callback(null, response);
            });

            helper.mergeProfiles(profile1, profile2, function (error, profile) {
                assert.ifError(error);
                assert.strictEqual(profile, null);
                request.post.restore();
                done();
            });
        });

        it('should return profile received after merge request', function (done) {
            var profile1 = helper.createProfile('pid1'),
                profile2 = helper.createProfile('pid2');

            sinon.stub(request, 'post', function (opts, callback) {
                var response = {
                    statusCode: 200,
                    body: {profile: {id: 'pid12'}}
                };
                callback(null, response);
            });

            helper.mergeProfiles(profile1, profile2, function (error, profile) {
                assert.ifError(error);
                assert(profile);
                assert.equal(profile.getId(), 'pid12');
                assert.equal(profile.hasChanges(), false);
                request.post.restore();
                done();
            });
        });
    });

    describe('Refresh', function () {
        it('should return error if profile is not instance of Profile', function () {
            var fakeProfile = {id: 1};
            helper.refreshLocalProfile(fakeProfile, function (error) {
                assert(error);
                assert.equal(error.message, 'Argument "profile" should be a Profile instance');
            });
        });

        it('should call loadProfile properly', function () {
            var profile = helper.createProfile('pid');
            sinon.stub(helper, 'loadProfile');
            helper.refreshLocalProfile(profile, function () {});
            assert(helper.loadProfile.calledWith('pid'));
            helper.loadProfile.restore();
        });

        it('should return error from loadProfile if occurred', function (done) {
            var profile = helper.createProfile('pid');
            sinon.stub(helper, 'loadProfile', function (profileId, callback) {
                callback(new Error('load-error'));
            });
            helper.refreshLocalProfile(profile, function (error) {
                assert(error);
                assert.equal(error.message, 'load-error');
                helper.loadProfile.restore();
                done();
            });
        });

        it('should call profile.merge', function (done) {
            var profile = helper.createProfile('pid'),
                loadedProfile = helper.createProfile('pid');

            sinon.spy(profile, 'merge');

            sinon.stub(helper, 'loadProfile', function (profileId, callback) {
                callback(null, loadedProfile);
            });
            helper.refreshLocalProfile(profile, function (error, profile) {
                assert.ifError(error);
                assert(profile);
                profile.merge.calledWith(loadedProfile);
                profile.merge.restore();
                done();
            });
        });
    });

    describe('Profile Stream', function () {
        it('should throw error on wrong data', function () {
            var rawBody = 'some non json data';
            assert.throws(function () {
                helper.getProfileFromRequest(rawBody);
            }, /Wrong stream data/);
        });

        it('should throw error if data has not "profile" property', function () {
            var jsonBody = {noprofile: 'hahaha'};
            assert.throws(function () {
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
                assert.throws(function () {
                    helper.getMetaFromRequest(rawBody);
                }, /Wrong stream data/);
            });

            it('should throw error if data has not "meta" property', function () {
                var jsonBody = {nometa: 'hahaha'};
                assert.throws(function () {
                    helper.getMetaFromRequest(jsonBody);
                }, /Meta not found/);
            });

            it('should properly create profile from Profile Stream', function () {
                var meta = {
                        some: 'data',
                        or: 'ip',
                        and: 42
                    },
                    jsonBody = {meta: meta};

                assert.deepEqual(helper.getMetaFromRequest(jsonBody), meta);
                assert.deepEqual(helper.getMetaFromRequest(JSON.stringify(jsonBody)), meta);
            });
        });
    });
});
