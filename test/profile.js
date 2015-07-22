var inno = require('../'),
    Profile = inno.Profile,
    assert = require('assert'),
    sinon  = require('sinon');

describe('Profile', function () {

    function createProfile (conf) {
        return new Profile(conf);
    }

    describe('Initialization', function () {

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

        it('should create attributes from config', function () {
            var profile = createProfile({
                    id: 'pid',
                    attributes: [{
                        collectApp: 'app',
                        section: 'sec',
                        data: {
                            test: 1,
                            foo: 'bar'
                        }
                    }]
                }),
                attributes = profile.getAttributes(),
                attribute;

            assert.strictEqual(attributes.length, 2);
            attribute = attributes[0];
            assert.equal(attribute.getCollectApp(), 'app');
            assert.equal(attribute.getSection(), 'sec');
            assert.equal(attribute.getName(), 'test');
            assert.equal(attribute.getValue(), 1);

            attribute = attributes[1];
            assert.equal(attribute.getCollectApp(), 'app');
            assert.equal(attribute.getSection(), 'sec');
            assert.equal(attribute.getName(), 'foo');
            assert.equal(attribute.getValue(), 'bar');
        });

        it('should create sessions from config', function () {
            var profile = createProfile({
                    id: 'pid',
                    sessions: [{
                        collectApp: 'app',
                        section: 'sec',
                        data: {},
                        events: []
                    }]
                }),
                sessions = profile.getSessions(),
                session;

            assert.strictEqual(sessions.length, 1);
            session = sessions[0];
            assert.equal(session.getCollectApp(), 'app');
            assert.equal(session.getSection(), 'sec');
        });

    });

    describe('Attributes', function () {

        var profile;

        beforeEach(function () {
            profile = createProfile();
        });

        describe('Create',  function () {

            it('should throw error if collectApp or section is empty', function () {
                assert['throws'](function () {
                    profile.createAttributes(null, 'section', {});
                }, /collectApp and section should be filled to create attribute correctly/);

                assert['throws'](function () {
                    profile.createAttributes('app', null, {});
                }, /collectApp and section should be filled to create attribute correctly/);
            });

            it('should throw error if data is not an object or empty', function () {
                assert['throws'](function () {
                    profile.createAttributes('app', 'section', null);
                }, /attributes should be an object/);

                assert['throws'](function () {
                    profile.createAttributes('app', 'section', true);
                }, /attributes should be an object/);

                assert['throws'](function () {
                    profile.createAttributes('app', 'section', {});
                }, /attributes are empty/);
            });

            it('should create attributes', function () {
                var attributes = profile.createAttributes('app', 'section', {
                    test: 1,
                    foo: 'bar'
                });
                assert.equal(attributes.length, 2);
            });

        });

        describe('Set', function () {

            it('should throw error if non array passed', function () {
                assert['throws'](function () {
                    profile.setAttributes();
                }, /attributes should be an array/);

                assert['throws'](function () {
                    profile.setAttributes(true);
                }, /attributes should be an array/);

                assert['throws'](function () {
                    profile.setAttributes({});
                }, /attributes should be an array/);
            });

            it('should throw error if try to set invalid attributes', function () {
                assert['throws'](function () {
                    profile.setAttributes([{
                        collectApp: 'app',
                        section: 'sec',
                        no: 'name!',
                        value: 'hi'
                    }]);
                }, /Attribute is not valid/);
            });

            it('should set attributes', function () {
                var profile = createProfile(),
                    attribute1 = {
                        collectApp: 'app',
                        section: 'sec',
                        name: 'test',
                        value: 'hi'
                    },
                    attribute2 = new Profile.Attribute({
                        collectApp: 'app',
                        section: 'sec',
                        name: 'foo',
                        value: 'bar'
                    }),
                    attribute;

                profile.setAttributes([attribute1, attribute2]);
                assert.equal(profile.getAttributes().length, 2);

                attribute = profile.getAttribute(attribute1.name, attribute1.collectApp, attribute1.section);
                assert.strictEqual(attribute.getValue(), attribute1.value);

                attribute = profile.getAttribute(attribute2.getName(), attribute2.getCollectApp(), attribute2.getSection());
                assert.strictEqual(attribute.getValue(), attribute2.getValue());
            });

            it('should set attribute and rewrite existing value', function () {
                var profile = createProfile(),
                    attribute1 = {
                        collectApp: 'app',
                        section: 'sec',
                        name: 'test',
                        value: 'hi'
                    },
                    attribute2 = {
                        collectApp: 'app',
                        section: 'sec',
                        name: 'test',
                        value: 'bazzzzzzz'
                    },
                    attribute;

                profile.setAttributes([attribute1, attribute2]);
                assert.equal(profile.getAttributes().length, 1);
                attribute = profile.getAttribute(attribute1.name, attribute1.collectApp, attribute1.section);
                assert.strictEqual(attribute.getValue(), attribute2.value);
            });

            it('should delegate setAttribute to setAttributes', function () {
                var profile = createProfile(),
                    attribute1 = {
                        collectApp: 'app',
                        section: 'sec',
                        name: 'test',
                        value: 'hi'
                    };

                sinon.spy(profile, 'setAttributes');
                profile.setAttribute(attribute1);

                assert(profile.setAttributes.calledWith([attribute1]));
                profile.setAttributes.restore();
            });

        });

        describe('Get', function () {

            it('should throw error if no name, collectApp or section specified', function () {
                assert['throws'](function () {
                    profile.getAttribute(null, 'app', 'section');
                }, /Name, collectApp and section should be filled to get attribute/);

                assert['throws'](function () {
                    profile.getAttribute('name', null, 'section');
                }, /Name, collectApp and section should be filled to get attribute/);

                assert['throws'](function () {
                    profile.getAttribute('name', 'app', null);
                }, /Name, collectApp and section should be filled to get attribute/);
            });

            it('should return null if attribute does not exist', function () {
                assert.strictEqual(profile.getAttribute('name', 'app', 'section'), null);
            });

            it('should return attribute', function () {
                var profile = createProfile(),
                    attribute1 = {
                        collectApp: 'app',
                        section: 'sec',
                        name: 'test',
                        value: 'hi'
                    },
                    attribute;

                profile.setAttribute(attribute1);

                attribute = profile.getAttribute(attribute1.name, attribute1.collectApp, attribute1.section);
                assert(attribute);
                assert.strictEqual(attribute.getValue(), attribute1.value);
            });

        });


    });

    describe('Sessions', function () {
        var profile;

        beforeEach(function () {
            profile = createProfile();
        });

        describe('Create', function () {

            it('should create session instance', function () {
                var sessionData = {
                        id: 'sid',
                        collectApp: 'app',
                        section: 'sec'
                    },
                    session = profile.createSession(sessionData);

                assert(session);
                assert.equal(session.getId(), sessionData.id);
                assert.equal(session.getCollectApp(), sessionData.collectApp);
                assert.equal(session.getSection(), sessionData.section);
            });

        });

        describe('Set', function () {

            it('it should throw error if session is invalid', function () {
                assert['throws'](function () {
                    profile.setSession({id: "asd"});
                }, /Session is not valid/);
            });

            it('should set session', function () {
                var session1 = {
                        id: 'qwe',
                        collectApp: 'app',
                        section: 'sec'
                    },
                    session2 = new Profile.Session({
                        id: 'asd',
                        collectApp: 'app2',
                        section: 'sec2'
                    });
                assert.equal(profile.getSessions().length, 0);
                profile.setSession(session1);
                assert.equal(profile.getSessions().length, 1);
                profile.setSession(session2);
                assert.equal(profile.getSessions().length, 2);
            });

            it('should replace session if exists with same id', function () {
                var session1 = {
                        id: 'qwe',
                        collectApp: 'app',
                        section: 'sec'
                    },
                    session2 = new Profile.Session({
                        id: 'qwe',
                        collectApp: 'app2',
                        section: 'sec2'
                    }),
                    session;
                assert.equal(profile.getSessions().length, 0);
                profile.setSession(session1);
                assert.equal(profile.getSessions().length, 1);
                profile.setSession(session2);
                assert.equal(profile.getSessions().length, 1);
                session = profile.getSessions()[0];
                assert.equal(session.getCollectApp(), 'app2');
                assert.equal(session.getSection(), 'sec2');
            });

            it('should ignore session if this one already in profile', function () {
                var session1 = new Profile.Session({
                        id: 'qwe',
                        collectApp: 'app',
                        section: 'sec'
                    }),
                    session;
                assert.equal(profile.getSessions().length, 0);
                profile.setSession(session1);
                assert.equal(profile.getSessions().length, 1);
                profile.setSession(session1);
                assert.equal(profile.getSessions().length, 1);
                session = profile.getSessions()[0];
                assert.strictEqual(session, session1);
            });

        });

        describe('Get', function () {

            it('should return session', function () {
                assert.strictEqual(profile.getSession('no existing'), null);
                profile.setSession({
                    id: 'sid',
                    collectApp: 'app',
                    section: 'sec'
                });
                assert.strictEqual(profile.getSession('no existing'), null);
                assert(profile.getSession('sid'));
            });

            it('should throw error if filter no a function', function () {
                assert['throws'](function () {
                    profile.getSessions(null);
                }, /filter should be a function/);

                assert['throws'](function () {
                    profile.getSessions(true);
                }, /filter should be a function/);

                assert['throws'](function () {
                    profile.getSessions({});
                }, /filter should be a function/);
            });

            it('should return all sessions if no filter function', function () {
                var sessions = profile.getSessions();

                assert(sessions);
                assert.equal(sessions.length, 0);

                profile.setSession({
                    id: 'sid1',
                    collectApp: 'app1',
                    section: 'sec1'
                });

                profile.setSession({
                    id: 'sid2',
                    collectApp: 'app2',
                    section: 'sec2'
                });

                sessions = profile.getSessions();

                assert(sessions);
                assert.equal(sessions.length, 2);
            });


            it('should return only filtered sessions', function () {
                var sessions = profile.getSessions(),
                    session;

                assert(sessions);
                assert.equal(sessions.length, 0);

                profile.setSession({
                    id: 'sid1',
                    collectApp: 'app1',
                    section: 'sec1'
                });

                profile.setSession({
                    id: 'sid2',
                    collectApp: 'app2',
                    section: 'sec2'
                });

                sessions = profile.getSessions(function (session) {
                    return session.getCollectApp() === 'app2';
                });

                assert(sessions);
                assert.equal(sessions.length, 1);
                session = sessions[0];
                assert.equal(session.getId(), 'sid2');
                assert.equal(session.getCollectApp(), 'app2');
                assert.equal(session.getSection(), 'sec2');
            });

            it('should return null if no last session', function () {
                assert.strictEqual(profile.getLastSession(), null);
            });

            it('should return last session (with newer modifiedAt value)', function () {
                var session;

                profile.setSession({
                    id: 'sid1',
                    collectApp: 'app1',
                    section: 'sec1',
                    modifiedAt: 100
                });

                profile.setSession({
                    id: 'sid2',
                    collectApp: 'app2',
                    section: 'sec2',
                    modifiedAt: 50
                });

                session = profile.getLastSession();
                assert(session);
                assert.strictEqual(session.getId(), 'sid1');
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
                        data: {},
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

        });

    });

});
