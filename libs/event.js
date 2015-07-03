'use strict';

// <Event> new Profile.Event({id: id, definitionId: definitionId, data: data, createdAt: timestamp})
var Event = function (config) {

};

Event.prototype = {
    // <Event> setId(<string> id)
    setId: function(id) {

    },
    // <Event> setCreatedAt(<number|Date>)
    setCreatedAt: function(date) {

    },
    // <Event> setDefinitionId(<string> definitionId)
    setDefinitionId: function(definitionId) {

    },
    // <Event> setData(<object> data)
    setData: function(data) {

    },
    // <Event> setDataValue(<string> name, <mixed> value)
    setDataValue: function(name, value) {

    },
    // <object> getData()
    getData: function() {

    },
    // <mixed> getDataValue(<string> name)
    getDataValue: function(name) {

    },
    // <session> getSession()
    getSession: function() {

    },
    // <boolean> isValid()
    isValid: function() {

    }
};

module.exports = Event;