var schema = require('./schema');
var ZSchema = require('z-schema');
var validator = new ZSchema();

function Validator () {
    this.preloadSchema(schema);
}

function preloadSchema () {
    var allSchemasValid = validator.validateSchema([
        schema.event,
        schema.events,
        schema.session,
        schema.sessions,
        schema.attribute,
        schema.attributes,
        schema.profile
    ]);

    this.schemaIsValid = allSchemasValid;
}

function isValid () {
    return this.schemaIsValid;
}

function profileIsValid (profile) {
    return this.isValid() && validator.validate(profile, schema.profile);
}

function sessionIsValid (session) {
    var schemasValid = this.isValid() && validator.validateSchema([schema.session]);
    return schemasValid && validator.validate(session, schema.session);
}

function eventIsValid (event) {
    var schemasValid = this.isValid() && validator.validateSchema([schema.event]);
    return schemasValid && validator.validate(event, schema.event);
}

function attributeIsValid (attribute) {
    var schemasValid = this.isValid() && validator.validateSchema([schema.attribute]);
    return schemasValid && validator.validate(attribute, schema.attribute);
}

function getErrors () {
    return validator.getLastErrors();
}

Validator.prototype = {
    preloadSchema: preloadSchema,
    profileIsValid: profileIsValid,
    sessionIsValid: sessionIsValid,
    eventIsValid: eventIsValid,
    attributeIsValid: attributeIsValid,
    getErrors: getErrors,
    isValid: isValid
};

module.exports = new Validator();
