var attribute = {
    id: 'attribute',
    type: 'object',
    properties: {
        collectApp: {type: 'string'},
        section: {type: 'string'},
        data: {type: 'object'}
    },
    required: ['collectApp', 'section', 'data']
};

var attributes = {
    id: 'attributes',
    type: 'array',
    items: {$ref: 'attribute'}
};

var session = {
    id: 'session',
    type: 'object',
    properties: {
        id: {type: 'string'},
        createdAt: {type: 'number'},
        collectApp: {type: 'string'},
        section: {type: 'string'},
        data: {
            type: 'object',
            properties: {
                countryCode: {type: 'number'},
                countryName: {type: 'string'},
                region: {type: 'string'},
                city: {type: 'string'},
                postalCode: {type: 'string'},
                latitude: {type: 'number'},
                longitude: {type: 'number'},
                dmaCode: {type: 'number'},
                areaCode: {type: 'number'},
                metroCode: {type: 'number'},
                organization: {type: 'string'},
                isp: {type: 'string'}
            }
        },
        events: {$ref: 'events'}
    },
    required: ['id', 'createdAt', 'collectApp', 'section', 'data', 'events']
};

var sessions = {
    id: 'sessions',
    type: 'array',
    items: {$ref: 'session'}
};

var event = {
    id: 'event',
    type: 'object',
    properties: {
        id: {type: 'string'},
        createdAt: {type: 'number'},
        definitionId: {type: 'string'},
        data: {type: 'object'}
    },
    required: ['id', 'createdAt', 'definitionId', 'data']
};

var events = {
    id: 'events',
    type: 'array',
    items: {$ref: 'event'}
};

var profile = {
    type: 'object',
    properties: {
        id: {type: 'string'},
        version: {type: 'string'},
        createdAt: {type: 'number'},
        sessions: {$ref: 'sessions'},
        attributes: {$ref: 'attributes'},
        mergedProfiles: {
            type: 'array',
            items: {type: 'string'}
        }
    },
    required: ['id', 'sessions', 'attributes']
};

module.exports = {
    attribute: attribute,
    attributes: attributes,
    session: session,
    sessions: sessions,
    event: event,
    events: events,
    profile: profile
};
