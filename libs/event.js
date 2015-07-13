'use strict';

var merge = require('merge');
var idGenerator = require('./id-generator');

// <Event> new Profile.Event({id: id, definitionId: definitionId, data: data, createdAt: timestamp})
var EventDefinition = function (config) {
    this.object = merge({
        id: idGenerator.generate(8),
        createdAt: (new Date()).getTime(),
        data: {}
    }, config);
};

EventDefinition.prototype = {
    object: null,
    // <Event> setId(<string> id)
    setId: function (id) {
        this.object.id = id;
        return this;
    },
    // <Event> setCreatedAt(<number|Date>)
    setCreatedAt: function (date) {
        this.object.createdAt = date;
        return this;
    },
    // <Event> setDefinitionId(<string> definitionId)
    setDefinitionId: function (definitionId) {
        this.object.definitionId = definitionId;
        return this;
    },
    // <Event> setData(<object> data)
    setData: function (data) {
        this.object.data = merge(this.object.data, data);
        return this;
    },
    // <Event> setDataValue(<string> name, <mixed> value)
    setDataValue: function (name, value) {
        this.object.data[name] = value;
        return this;
    },
    // <number> getCreatedAt
    getCreatedAt: function () {
        return this.object && this.object.createdAt || null;
    },
    // <number> getCreatedAt
    getDefinitionId: function () {
        return this.object && this.object.definitionId || null;
    },
    // <object> getData()
    getData: function () {
        return this.object && this.object.data || null;
    },
    // <mixed> getDataValue(<string> name)
    getDataValue: function (name) {
        return this.object && this.object.data && this.object.data[name] || null;
    },
    // <session> getSession()
    getSession: function () {

    },
    // <boolean> isValid()
    isValid: function () {
        return !!this.getId() && !!this.getData() && !!this.createdAt();
    }
};

module.exports = EventDefinition;
