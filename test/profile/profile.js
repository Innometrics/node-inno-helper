var inno = require('../../'),
    assert = require('assert');
var Profile = inno.Profile;

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
                data: {data1: 'value1'},
                events: []
            }, {
                id: 'sid2',
                collectApp: 'app2',
                section: 'sec2',
                createdAt: 3,
                data: {},
                events: [{
                    id: 'ev1',
                    definitionId: 'def1',
                    createdAt: 5,
                    data: {spider: 'man'}
                }]
            }, {
                id: 'sid3',
                collectApp: 'app3',
                section: 'sec3',
                createdAt: 5,
                data: {},
                events: []
            }]
        };

        it('should properly serialize profile', function () {
            var profile = createProfile(profileData);

            assert.deepEqual(profile.serialize(), profileData);
        });

        describe('Partially serialization', function () {
            it('should serialize only changed parts', function () {
                var profile = createProfile(profileData);
                profile.resetDirty();
                assert.equal(profile.hasChanges(), false);

                profile.getAttribute('test', 'app1', 'sec1').setValue('babar');
                profile.getSession('sid1').addEvent({
                    id: 'a',
                    definitionId: 'b',
                    createdAt: 10
                });
                profile.getSession('sid2').setDataValue('dd', 'bb');

                assert(profile.hasChanges());
                assert.deepEqual(profile.serialize(true), {
                    id: 'pid',
                    attributes: [{
                        collectApp: 'app1',
                        section: 'sec1',
                        data: {test: 'babar'}
                    }],
                    sessions: [{
                        id: 'sid1',
                        collectApp: 'app1',
                        section: 'sec1',
                        createdAt: 1,
                        data: {},
                        events: [{
                            id: 'a',
                            definitionId: 'b',
                            data: {},
                            createdAt: 10
                        }]
                    }, {
                        id: 'sid2',
                        collectApp: 'app2',
                        section: 'sec2',
                        createdAt: 3,
                        data: {dd: 'bb'},
                        events: []
                    }]
                });
            });
        });
    });

    describe('Merge', function () {
        it('should throw error if non Profile instance passed', function () {
            var profile = createProfile();
            assert.throws(function () {
                profile.merge(null);
            }, /Argument "profile" should be a Profile instance/);
            assert.throws(function () {
                profile.merge(true);
            }, /Argument "profile" should be a Profile instance/);
            assert.throws(function () {
                profile.merge({});
            }, /Argument "profile" should be a Profile instance/);
        });

        it('should throw error if ids are different', function () {
            var profile1 = createProfile('pid1'),
                profile2 = createProfile('pid2');

            assert.throws(function () {
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
                        data: {data1: 'value1'},
                        events: []
                    }, {
                        id: 'sid2',
                        collectApp: 'app2',
                        section: 'sec2',
                        createdAt: 3,
                        data: {
                            test1: 'q',
                            test2: 'w'
                        },
                        events: [{
                            id: 'ev1',
                            definitionId: 'def1',
                            createdAt: 5,
                            data: {spider: 'man'}
                        }]
                    }]
                }),
                profile2 = createProfile({
                    id: 'pid',
                    attributes: [{
                        collectApp: 'app1',
                        section: 'sec1',
                        data: {foo: 'baz'}
                    }, {
                        collectApp: 'app2',
                        section: 'sec2',
                        data: {cat: 'dog'}
                    }],
                    sessions: [{
                        id: 'sid0',
                        collectApp: 'app1',
                        section: 'sec2',
                        createdAt: 0,
                        data: {car: 'moto'},
                        events: []
                    }, {
                        id: 'sid2',
                        collectApp: 'app2',
                        section: 'sec2',
                        createdAt: 3,
                        data: {test1: 'e'},
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

    describe('Dirty flag', function () {
        it('should be changed if has changed attribute', function () {
            var profile = createProfile();
            assert.equal(profile.hasChanges(), false);

            profile.setAttribute({
                collectApp: 'web',
                section: 'sec',
                name: 'a',
                value: 1
            });
            assert(profile.hasChanges());
        });

        it('should be changed if has changed session', function () {
            var profile = createProfile();
            assert.equal(profile.hasChanges(), false);

            profile.setSession({
                collectApp: 'web',
                section: 'sec',
                id: '1'
            });
            assert(profile.hasChanges());
        });

        it('should be no changed after call resetDirty', function () {
            var profile = createProfile({
                attributes: [{
                    collectApp: 'web',
                    section: 'sec',
                    data: {a: 1}
                }]
            });
            assert(profile.hasChanges());

            profile.resetDirty();
            assert.equal(profile.hasChanges(), false);
        });
    });
});
