var inno = require('../'),
    Profile = inno.Profile,
    assert = require('assert');

describe('Event tests', function () {

    function createEvent (conf) {
        return new Profile.Event(conf);
    }

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
        var event = createEvent(),
            field = test.field,
            value = test.value,
            getter = 'get' + field,
            setter = 'set' + field;

        assert.notEqual(event[getter](), value);
        event[setter](value);
        assert.equal(event[getter](), value);
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

    it('should serialize event', function () {
        var event = createEvent({
            id: 'qwe',
            definitionId: 'my-event',
            data: {
                my: 'cat'
            },
            createdAt: 123456789
        });
        
        assert.deepEqual(event.serialize(), {
            id: 'qwe',
            definitionId: 'my-event',
            data: {
                my: 'cat'
            },
            createdAt: 123456789
        });
    });


});
