'use strict';

var Attribute = require('./attribute');
var Event = require('./event');
var Session = require('./session');
var Segment = require('./segment');

var Profile = function () {

};

Profile.Attribute = Attribute;
Profile.Event = Event;
Profile.Session = Session;
Profile.Segment = Segment;

Profile.prototype = {
    getId: function() {

    },

    // attributes
    // array.<Attribute> createAttributes(<string> collectApp, <string> section, <object> attributes)
    createAttributes: function(collectApp, section, attributes) {

    },
    // array.<Attribute> getAttributes([<string> collectApp], [<string> section])
    getAttributes: function(collectApp, section) {

    },
    // <Attribute> getAttribute(<string> name, <string> collectApp, <string> section)
    getAttribute: function(name, collectApp, section) {

    },
    // <Profile> setAttribute(<object|Attribute> attribute)
    setAttribute: function(attribute) {

    },
    // <Profile> setAttributes(array.<Attribute> attributes)
    setAttributes: function(attributes) {

    },

    //sessions
    // array.<Session> getSessions([<function> filter])
    getSessions: function(filter) {

    },
    // <Session> setSession([<object|Session> session])
    setSession: function(session) {

    },
    // <Session> getSession(<string> sessionId)
    getSession: function(sessionId) {

    },
    // <Session> getLastSession()
    getLastSession: function() {

    }
};

module.exports = Profile;