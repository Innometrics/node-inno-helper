var inno = require('../../'),
    Profile = inno.Profile,
    assert = require('assert');

describe('Profile/Sessions', function () {
    var profile;

    function createProfile (conf) {
        return new Profile(conf);
    }

    beforeEach(function () {
        profile = createProfile();
    });

    describe('Initialization', function () {

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

    describe('Creation', function () {

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

    describe('Set methods', function () {

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

    describe('Get methods', function () {

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