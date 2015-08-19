var inno = require('../'),
    Profile = inno.Profile,
    assert = require('assert');

describe('Session', function () {

    function createSession (conf) {
        return new Profile.Session(conf);
    }

    describe('Creation', function () {

        it('should not throw error when create with empty data', function () {
            assert.doesNotThrow(function () {
                createSession();
            });
        });

    });

    describe('Get/Set methods', function () {

        [
            {
                field: 'Id',
                value: 'id1'
            },
            {
                field: 'Section',
                value: 's1'
            },
            {
                field: 'CollectApp',
                value: 'rest'
            }
        ].forEach(function (test) {
            it('should set/get "' + test.field + '"', function () {
                var sess = createSession(),
                    getter = 'get' + test.field,
                    setter = 'set' + test.field;

                assert.notEqual(sess[getter](), test.value);
                sess[setter](test.value);
                assert.equal(sess[getter](), test.value);
            });
        });

        it('should get/set "CreatedAt"', function () {
            var sess = createSession(),
                date = new Date(),
                ts   = 123456789;

            sess.setCreatedAt(ts);
            assert.equal(sess.getCreatedAt(), ts, 'Check correct setting timestamp');

            sess.setCreatedAt(date);
            assert.equal(sess.getCreatedAt(), +date, 'Check correct setting Date');
        });

        it('should get/set "Data"', function () {
            var sess = createSession();

            assert.deepEqual(sess.getData(), {}, 'Check init value');

            sess.setData();
            assert.deepEqual(sess.getData(), {}, 'Check settings empty value');

            sess.setData({
                test: 123,
                foo: 'bar'
            });
            assert.deepEqual(sess.getData(), {
                test: 123,
                foo: 'bar'
            }, 'Check correct setting');

            sess.setData({
                test: 123456789,
                my: 'cat'
            });
            assert.deepEqual(sess.getData(), {
                test: 123456789,
                foo: 'bar',
                my: 'cat'
            }, 'Check correct merging');

        });

        it('should get/set "Data value"', function () {
            var sess = createSession();
            assert.equal(sess.getDataValue('val'), null);
            sess.setDataValue('val', 0);
            assert.equal(sess.getDataValue('val'), 0);
            sess.setDataValue('val', 'qwe');
            assert.equal(sess.getDataValue('val'), 'qwe');
        });

        it('should get "ModifiedAt"', function () {
            var sess = createSession({
                modifiedAt: 123456789
            });

            assert.equal(sess.getModifiedAt(), 123456789);
        });
    });

    describe('Events', function () {

        it('should create session with Events', function () {

            var sess = createSession({
                section: 'section',
                events: [{definitionId: 'defId'}]
            });

            var events = sess.getEvents();
            assert.equal(events.length, 1);
            assert(events[0] instanceof Profile.Event);

        });

        it('should add event to session', function () {
            var sess  = createSession(),
                event = sess.addEvent({
                    definitionId: 'test'
                }),
                events = sess.getEvents();

            assert(event instanceof Profile.Event);
            assert.equal(events.length, 1);
            assert(events[0] instanceof Profile.Event);
        });

        it('should throw error on existing event', function () {
            var sess = createSession({events: [{
                    id: '123',
                    definitionId: 'old-def'
                }]}),
                event = new Profile.Event({
                    id: '123',
                    definitionId: 'new-def'
                }),
                events = sess.getEvents();

            assert.equal(events.length, 1);
            assert.equal(events[0].getDefinitionId(), 'old-def');

            assert['throws'](function () {
                sess.addEvent(event);
            }, /Event with id "123" already exists/);
        });

        it('Should throw error on invalid event', function () {
            var sess = createSession();
            assert['throws'](function () {
                sess.addEvent();
            });
        });

        it('Should get event by id', function () {
            var event,
                sess = createSession({events: [{
                id: '123',
                definitionId: 'defId'
            }]});

            event = sess.getEvent('none');
            assert.equal(event, null);

            event = sess.getEvent('123');
            assert.equal(event.getDefinitionId(), 'defId');
        });

        it('should get events', function () {
            var sess   = createSession();
            var events = sess.getEvents();

            assert.equal(events.length, 0);

            sess.addEvent({definitionId: 'defId-123'});
            sess.addEvent({definitionId: 'defId-234'});

            events = sess.getEvents();
            assert.equal(events.length, 2);
            assert.equal(events[0].getDefinitionId(), 'defId-123');
            assert.equal(events[1].getDefinitionId(), 'defId-234');

            events = sess.getEvents('defId-123');
            assert.equal(events.length, 1);
            assert.equal(events[0].getDefinitionId(), 'defId-123');
        });

        it('should test backref of events', function () {
            var sess  = createSession(),
                event = sess.addEvent({
                    definitionId: 'test'
                }),
                events = sess.getEvents();

            assert.equal(events[0].getDefinitionId(), 'test');

            event.setDefinitionId('defId');
            assert.equal(events[0].getDefinitionId(), 'defId');
        });

        it('should sort events', function () {
            var session = createSession({
                    events: [{
                        id: 'ev1',
                        createdAt: 10
                    }, {
                        id: 'ev2',
                        createdAt: 5
                    }]
                }),
                events;

            events = session.getEvents();
            assert.equal(events[0].getId(), 'ev1');
            assert.equal(events[1].getId(), 'ev2');

            events = session.sortEvents().getEvents();
            assert.equal(events[0].getId(), 'ev2');
            assert.equal(events[1].getId(), 'ev1');
        });

        it('should return null if there os no last event', function () {
            var sess  = createSession();
            assert.strictEqual(sess.getLastEvent(), null);
        });

        it('should return last event from sesson', function () {
            var session = createSession({
                    events: [{
                        id: 'ev1',
                        createdAt: 10
                    }, {
                        id: 'ev2',
                        createdAt: 5
                    }]
                });

            assert.strictEqual(session.getLastEvent().getId(), 'ev2');
        });

    });

    describe('Serialization', function () {

        it('should serialize session', function () {
            var sess = createSession({
                id: '123456',
                section: 'foo',
                collectApp: 'rest',
                createdAt: 123,
                modifiedAt: 456,
                data: {key: 'value'}
            });

            assert.deepEqual(sess.serialize(), {
                id: '123456',
                section: 'foo',
                collectApp: 'rest',
                createdAt: 123,
                modifiedAt: 456,
                events: [],
                data: {key: 'value'}
            });
        });

        it('should serialize data', function () {
            var rawData = {
                id: 'qwe',
                collectApp: 'app',
                section: 'sec',
                createdAt: 1,
                modifiedAt: 2,
                data: {
                    test: 'cool'
                },
                events: [{
                    id: 'ev1',
                    definitionId: 'defId',
                    createdAt: 3,
                    data: {
                        foo: 'bar'
                    }
                }]
            };
            var session = createSession(rawData);
            assert.deepEqual(session.serialize(), rawData);
        });

    });

    describe('Validation', function () {

        it('should be valid if all required fields exist', function () {
            var sess = createSession({
                id: 'sid',
                collectApp: 'app',
                section: 'section'
            });
            assert(sess.isValid());
        });

        [
            "Id", "Section", "CollectApp", "CreatedAt"
        ].forEach(function (field) {
                it('should be invalid if required field "' + field + '" not defined', function () {
                    var event = createSession({
                        id: 'sid',
                        collectApp: 'app',
                        section: 'section'
                    });
                    assert(event.isValid());

                    event['set' + field](null);
                    assert.equal(event.isValid(), false);
                });
            });
    });

    describe('Merging', function () {

        it('should throw error if session is not instance of Session', function () {
            var fakeSession = {id: 1},
                session = createSession();

            assert['throws'](function () {
                session.merge(fakeSession);
            }, /Argument "session" should be a Session instance/);
        });

        it('should throw error if ids are different', function () {
            var session1 = createSession({id: "1"}),
                session2 = createSession({id: "2"});

            assert['throws'](function () {
                session1.merge(session2);
            }, /Session IDs should be similar/);
        });

        it('should properly merge session to other one', function () {
            var session1 =  createSession({
                    id: "1",
                    data: {
                        name: 'value',
                        a: 1
                    },
                    events: [{
                        id: 'ev1'
                    }]
                }),
                session2 = createSession({
                    id: "1",
                    data: {
                        name: 'new',
                        b: 2
                    },
                    events: [{
                        id: 'ev1'
                    }, {
                        id: 'ev2'
                    }]
                });

            session1.merge(session2);

            assert.strictEqual(session1.getId(), "1");
            assert.deepEqual(session1.getData(), {
                name: 'new',
                a: 1,
                b: 2
            });
            assert.strictEqual(session1.getEvents().length, 2);
        });

    });

});
