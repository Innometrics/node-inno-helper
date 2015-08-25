var inno = require('../../'),
    Profile = inno.Profile,
    assert = require('assert');

describe('Profile/Common', function () {

    function createProfile (conf) {
        return new Profile(conf);
    }

    describe('Creation', function () {

        it('should not throw error on empty config', function () {
            assert.doesNotThrow(function () {
                createProfile();
            });

            assert.doesNotThrow(function () {
                createProfile({});
            });
        });

        it('should be inited with default data', function () {
            var profile = createProfile(),
                sessions = profile.getSessions(),
                attributes = profile.getAttributes();

            assert(profile.getId());
            assert(Array.isArray(sessions));
            assert.strictEqual(sessions.length, 0);
            assert(Array.isArray(attributes));
            assert.strictEqual(attributes.length, 0);
        });

        it('should use id from config', function () {
            var id = 'pid',
                profile = createProfile({id: id});

            assert.strictEqual(profile.getId(), id);
        });

        it('should support creation like factory (not as constructor)', function () {
            assert.doesNotThrow(function () {
                var constructor = Profile;
                constructor({});
            });
        });

    });

    describe('Serialization', function () {

        it('should properly serialize profile', function () {
            var profileData = {
                    id: 'pid',
                    attributes: [{
                        collectApp: 'app1',
                        section: 'sec1',
                        data: {
                            foo: 'bar',
                            test: 1
                        }
                    }, {
                        collectApp: 'app2',
                        section: 'sec2',
                        data: {
                            cat: 'dog',
                            hi: 'bye'
                        }
                    }],
                    sessions: [{
                        id: 'sid1',
                        collectApp: 'app1',
                        section: 'sec1',
                        createdAt: 1,
                        modifiedAt: 2,
                        data: {
                            data1: 'value1'
                        },
                        events: []
                    }, {
                        id: 'sid2',
                        collectApp: 'app2',
                        section: 'sec2',
                        createdAt: 3,
                        modifiedAt: 4,
                        data: {},
                        events: [{
                            id: 'ev1',
                            definitionId: 'def1',
                            createdAt: 5,
                            data: {
                                spider: 'man'
                            }
                        }]
                    }]
                },
                profile = new Profile(profileData);

            assert.deepEqual(profile.serialize(), profileData);
        });

    });

    describe('Merge', function () {

        it('should throw error if non Profile instance passed', function () {
            var profile = createProfile();
            assert['throws'](function () {
                profile.merge(null);
            }, /Argument "profile" should be a Profile instance/);
            assert['throws'](function () {
                profile.merge(true);
            }, /Argument "profile" should be a Profile instance/);
            assert['throws'](function () {
                profile.merge({});
            }, /Argument "profile" should be a Profile instance/);
        });

        it('should throw error if ids are different', function () {
            var profile1 = createProfile('pid1'),
                profile2 = createProfile('pid2');

            assert['throws'](function () {
                profile1.merge(profile2);
            }, /Profile IDs should be similar/);
        });

        it('should properly merge data from profile to other one', function () {
            var profile1 = createProfile({
                    id: 'pid',
                    attributes: [{
                        collectApp: 'app1',
                        section: 'sec1',
                        data: {
                            foo: 'bar',
                            test: 1
                        }
                    }],
                    sessions: [{
                        id: 'sid1',
                        collectApp: 'app1',
                        section: 'sec1',
                        createdAt: 1,
                        modifiedAt: 2,
                        data: {
                            data1: 'value1'
                        },
                        events: []
                    }, {
                        id: 'sid2',
                        collectApp: 'app2',
                        section: 'sec2',
                        createdAt: 3,
                        modifiedAt: 4,
                        data: {
                            test1: 'q',
                            test2: 'w'
                        },
                        events: [{
                            id: 'ev1',
                            definitionId: 'def1',
                            createdAt: 5,
                            data: {
                                spider: 'man'
                            }
                        }]
                    }]
                }),
                profile2 = createProfile({
                    id: 'pid',
                    attributes: [{
                        collectApp: 'app1',
                        section: 'sec1',
                        data: {
                            foo: 'baz'
                        }
                    }, {
                        collectApp: 'app2',
                        section: 'sec2',
                        data: {
                            cat: 'dog'
                        }
                    }],
                    sessions: [{
                        id: 'sid0',
                        collectApp: 'app1',
                        section: 'sec2',
                        createdAt: 0,
                        modifiedAt: 0,
                        data: {
                            car: 'moto'
                        },
                        events: []
                    }, {
                        id: 'sid2',
                        collectApp: 'app2',
                        section: 'sec2',
                        createdAt: 3,
                        modifiedAt: 10,
                        data: {
                            test1: 'e'
                        },
                        events: [{
                            id: 'ev1',
                            definitionId: 'def1',
                            createdAt: 5,
                            data: {
                                spider: 'fly',
                                java: 'script'
                            }
                        }]
                    }]
                });

            profile1.merge(profile2);


            assert.strictEqual(profile1.getAttributes().length, 3);
            assert.strictEqual(profile1.getAttribute('foo', 'app1', 'sec1').getValue(), 'baz');

            assert.strictEqual(profile1.getSessions().length, 3);
            assert.deepEqual(profile1.getSession('sid2').getData(), {
                test1: 'e',
                test2: 'w'
            });

        });

    });

});
