var schema = require('./schema');
var ZSchema = require('z-schema');
var validator = new ZSchema();

function profileIsValid (profile) {
    var allSchemasValid = validator.validateSchema([
        schema.event,
        schema.events,
        schema.session,
        schema.sessions,
        schema.attribute,
        schema.attributes,
        schema.profile
    ]);
    return allSchemasValid && validator.validate(profile, schema.profile);
}

function sessionIsValid (session) {
    var schemasValid = validator.validateSchema([schema.session]);
    return schemasValid && validator.validate(session, schema.session);
}

function eventIsValid (event) {
    var schemasValid = validator.validateSchema([schema.event]);
    return schemasValid && validator.validate(event, schema.event);
}

function attributeIsValid (attribute) {
    var schemasValid = validator.validateSchema([schema.attribute]);
    return schemasValid && validator.validate(attribute, schema.attribute);
}

function getErrors () {
    return validator.getLastErrors();
}

module.exports = {
    profileIsValid: profileIsValid,
    sessionIsValid: sessionIsValid,
    eventIsValid: eventIsValid,
    attributeIsValid: attributeIsValid,
    getErrors: getErrors
};
