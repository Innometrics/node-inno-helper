'use strict';

// <Session> new Profile.Session({collectApp: web, section: sec, id: id, data: data, createdAt: timestamp})
var Session = function (config) {

};

Session.prototype = {
    // <Session> setId(<string> id)
    setId: function(id) {

    },
    // <Session> setCollectApp(<string> collectApp)
    setCollectApp: function(collectApp) {

    },
    // <Session> setSection(<string> section)
    setSection: function(section) {

    },
    // <Session> setCreatedAt(<number|Date>)
    setCreatedAt: function(date) {

    },
    // <Session> setData(<object> data)
    setData: function(data) {

    },
    // <Session> setDataValue(<string> name, <mixed> value)
    setDataValue: function(name, value) {

    },
    // <string> getId()
    getId: function() {

    },
    // <string> getCollectApp()
    getCollectApp: function() {

    },
    // <string> getSection()
    getSection: function() {

    },
    // <number> getCreatedAt()
    getCreatedAt: function() {

    },
    // <number> getModifiedAt()
    getModifiedAt: function() {

    },
    // <object> getData()
    getData: function() {

    },
    // <mixed> getDataValue(<string> name)
    getDataValue: function(name) {

    },
    // <event> addEvent(<object|Event> event)
    addEvent: function(event) {

    },
    // <event> getEvent(<string> eventId)
    getEvent: function(eventId) {

    },
    // array.<Event> getEvents([<string> eventDefinitionId])
    getEvents: function(eventDefinitionId) {

    },
    // <boolean> isValid()
    isValid: function() {

    }
};

module.exports = Session;