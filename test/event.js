var inno = require('../'),
    Profile = inno.Profile,
    assert = require('assert');

describe('Event', function () {

    function createEvent (conf) {
        return new Profile.Event(conf);
    }

    describe('Creation', function () {

        it('should not throw error when create with empty data', function () {
            assert.doesNotThrow(function () {
                createEvent();
            });
        });

        it('should generate only some props by default', function () {
            var event = createEvent();
            assert(event.getId());
            assert(event.getCreatedAt());
            assert(event.getData());
            assert.notStrictEqual(event.getDefinitionId(), false);
            assert.equal(event.isValid(), false);
        });

    });

    describe('Validation', function () {

        it('should be valid if all required fields exist', function () {
            var event = createEvent({
                definitionId: 'defIf'
            });
            assert(event.isValid());
        });

        [
            'Id', 'CreatedAt', 'DefinitionId'
        ].forEach(function (field) {
                it('should be invalid if required field "' + field + '" not defined', function () {
                    var event = createEvent({
                        definitionId: 'defIf'
                    });
                    assert(event.isValid());

                    event['set' + field](null);
                    assert.equal(event.isValid(), false);
                });
            });

    });

    describe('Get/Set methods', function () {

        [
            {
                field: 'Id',
                value: 'asd'
            },
            {
                field: 'CreatedAt',
                value: +new Date()
            },
            {
                field: 'DefinitionId',
                value: 'my-event'
            }
        ].forEach(function (test) {
            it('should get/set ' + test.field, function () {
                var event = createEvent(),
                    field = test.field,
                    value = test.value,
                    getter = 'get' + field,
                    setter = 'set' + field;

                assert.notEqual(event[getter](), value);
                event[setter](value);
                assert.equal(event[getter](), value);
            });
        });

        it('should properly get data', function () {
            var event = createEvent();
            assert.deepEqual(event.getData(), {});
            event.setData({test: 1});
            assert.deepEqual(event.getData(), {test: 1});
        });

        it('should properly get data value', function () {
            var event = createEvent();
            assert.deepEqual(event.getDataValue('val'), null);
            event.setDataValue('val', 0);
            assert.equal(event.getDataValue('val'), 0);
            event.setDataValue('val', 'qwe');
            assert.equal(event.getDataValue('val'), 'qwe');
        });

        it('should merge data on set', function () {
            var event = createEvent({
                data: {
                    test: 1,
                    my: 'cat'
                }
            });

            event.setData({
                foo: 'bar',
                test: 2
            });

            assert.deepEqual(event.getData(), {
                my: 'cat',
                foo: 'bar',
                test: 2
            });

        });
    });

    describe('Serialization', function () {

        it('should serialize event', function () {
            var rawData = {
                    id: 'qwe',
                    definitionId: 'my-event',
                    data: {
                        my: 'cat'
                    },
                    createdAt: 123456789
                },
                event = createEvent(rawData);

            assert.deepEqual(event.serialize(), rawData);
        });

    });

    describe('Merging', function () {

        it('should throw error if event is not instance of Event', function () {
            var fakeEvent = {id: 1},
                event = createEvent();

            assert['throws'](function () {
                event.merge(fakeEvent);
            }, /Argument "event" should be a Event instance/);
        });

        it('should throw error if ids are different', function () {
            var event1 = createEvent({id: "1"}),
                event2 = createEvent({id: "2"});

            assert['throws'](function () {
                event1.merge(event2);
            }, /Event IDs should be similar/);
        });

        it('should properly merge data from event to other one', function () {
            var event1 = createEvent({id: "1", data: {test: 1, car: 'moto'}}),
                event2 = createEvent({id: "1", data: {test: 2, cat: 'dog'}});

            event1.merge(event2);

            assert.strictEqual(event1.getId(), "1");
            assert.deepEqual(event1.getData(), {
                test: 2,
                cat: 'dog',
                car: 'moto'
            });
        });

    });

    describe('Dirty flag', function () {

        it('should be marked as dirty after creation', function () {
            var event = createEvent();
            assert(event.hasChanges());
        });

        it('should be marked as not dirty', function () {
            var event = createEvent();
            event.resetDirty();
            assert.equal(event.hasChanges(), false);
        });

        [
            {
                field: 'Id',
                value: 'asd'
            },
            {
                field: 'CreatedAt',
                value: +new Date()
            },
            {
                field: 'DefinitionId',
                value: 'my-event'
            }
        ].forEach(function (test) {
            it('should be marked as dirty after set ' + test.field, function () {
                var event = createEvent(),
                    field = test.field,
                    value = test.value,
                    setter = 'set' + field;

                event.resetDirty();
                event[setter](value);
                assert(event.hasChanges());
            });
        });

        it('should be marked as dirty after change data', function () {
            var event = createEvent();

            event.resetDirty();
            event.setData({a:1});
            assert(event.hasChanges(), 'setData');

            event.resetDirty();
            event.setDataValue('b', 321);
            assert(event.hasChanges(), 'setDataValue');
        });

    });


});
