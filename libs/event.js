'use strict';

var merge = require('merge');
var idGenerator = require('./id-generator');

// <Event> new Profile.Event({id: id, definitionId: definitionId, data: data, createdAt: timestamp})
var Event = function (config) {
    this.event = merge({
        id: idGenerator.generate(8),
        createdAt: (new Date()).getTime(),
        data: {}
    }, config);
};

Event.prototype = {
    event: null,
    // <Event> setId(<string> id)
    setId: function (id) {
        this.event.id = id;
        return this;
    },
    // <Event> setCreatedAt(<number|Date>)
    setCreatedAt: function (date) {
        this.event.createdAt = date;
        return this;
    },
    // <Event> setDefinitionId(<string> definitionId)
    setDefinitionId: function (definitionId) {
        this.event.definitionId = definitionId;
        return this;
    },
    // <Event> setData(<object> data)
    setData: function (data) {
        this.event.data = merge(this.event.data, data);
        return this;
    },
    // <Event> setDataValue(<string> name, <mixed> value)
    setDataValue: function (name, value) {
        this.event.data[name] = value;
        return this;
    },
    // <string> getId
    getId: function () {
        return this.event && this.event.id || null;
    },
    // <number> getCreatedAt
    getCreatedAt: function () {
        return this.event && this.event.createdAt || null;
    },
    // <number> getCreatedAt
    getDefinitionId: function () {
        return this.event && this.event.definitionId || null;
    },
    // <object> getData()
    getData: function () {
        return this.event && this.event.data || null;
    },
    // <mixed> getDataValue(<string> name)
    getDataValue: function (name) {
        return this.event && this.event.data && this.event.data[name] || null;
    },
    // <session> getSession()
    getSession: function () {

    },
    // <boolean> isValid()
    isValid: function () {
        return !!this.getId() && !!this.getData() && !!this.createdAt();
    }
};

module.exports = Event;
