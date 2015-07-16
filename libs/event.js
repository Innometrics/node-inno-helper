'use strict';

var merge = require('merge');
var idGenerator = require('./id-generator');

// <Event> new Profile.Event({id: id, definitionId: definitionId, data: data, createdAt: timestamp})
var Event = function (config) {

    config = config || {};

    this.id = config.id || idGenerator.generate(8);
    this.data = config.data || {};
    this.createdAt = config.createdAt || (new Date()).getTime();

};

Event.prototype = {

    id: null,
    data: {},
    createdAt: null,

    // <Event> setId(<string> id)
    setId: function (id) {
        this.id = id;
        return this;
    },
    // <Event> setCreatedAt(<number|Date>)
    setCreatedAt: function (date) {
        this.createdAt = date;
        return this;
    },
    // <Event> setDefinitionId(<string> definitionId)
    setDefinitionId: function (definitionId) {
        this.definitionId = definitionId;
        return this;
    },
    // <Event> setData(<object> data)
    setData: function (data) {
        this.data = merge(this.data, data);
        return this;
    },
    // <Event> setDataValue(<string> name, <mixed> value)
    setDataValue: function (name, value) {
        this.data[name] = value;
        return this;
    },
    // <string> getId()
    getId: function () {
        return this.id || null;
    },
    // <number> getCreatedAt()
    getCreatedAt: function () {
        return this.createdAt || null;
    },
    // <string> getDefinitionId()
    getDefinitionId: function () {
        return this.definitionId || null;
    },
    // <object> getData()
    getData: function () {
        return this.data || {};
    },
    // <mixed> getDataValue(<string> name)
    getDataValue: function (name) {
        return this.data && this.data[name] || null;
    },
    // <session> getSession()
    getSession: function () {

    },
    // <boolean> isValid()
    isValid: function () {
        return !!this.getId() && !!this.getData() && !!this.getCreatedAt();
    },
    // <object> serialize()
    serialize: function () {
        return {
            id: this.getId(),
            data: this.getData(),
            createdAt: this.getCreatedAt()
        };
    }
};

module.exports = Event;
