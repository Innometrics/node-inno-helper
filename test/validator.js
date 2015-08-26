var validator = require('../libs/validator/index'),
    assert = require('assert');

describe.only('Schema validator', function () {
    var event = {
        id: 'eid',
        createdAt: 1234567890,
        definitionId: 'event-123',
        data: {}
    };

    var session = {
        id: 'sid',
        createdAt: 1234567890,
        collectApp: 'app-123',
        section: 'section-123',
        data: {},
        events: [event],
        modifiedAt: 1234567890
    };

    var attribute = {
        collectApp: 'app-123',
        section: 'section-123',
        data: {},
        modifiedAt: 1234567890
    };

    var profile = {
        id: 'pid',
        version: '1.0',
        createdAt: 1234567890,
        sessions: [session],
        attributes: [attribute],
        mergedProfiles: []
    };

    it('should be valid profile', function () {
        assert.ok(validator.profileIsValid(profile));
    });

    it('should be valid attribute', function () {
        assert.ok(validator.attributeIsValid(attribute));
    });

    it('should be valid event', function () {
        assert.ok(validator.eventIsValid(event));
    });

    it('should be valid session', function () {
        assert.ok(validator.sessionIsValid(session));
    });

});
