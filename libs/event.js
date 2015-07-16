'use strict';

var merge = require('merge');
var idGenerator = require('./id-generator');

/**
 *
 * @param {Object} config
 * config equals to {id: id, definitionId: definitionId, data: data, createdAt: timestamp}
 * @constructor
 */
var Event = function (config) {
    this.event = merge({
        id: idGenerator.generate(8),
        createdAt: (new Date()).getTime(),
        data: {}
    }, config);
};

Event.prototype = {

    /**
     * @type {Object}
     */
    event: null,

    /**
     *
     * @param {String} id
     * @returns {Event}
     */
    setId: function (id) {
        this.event.id = id;
        return this;
    },

    /**
     *
     * @param {Number|Date} date
     * @returns {Event}
     */
    setCreatedAt: function (date) {
        this.event.createdAt = +date;
        return this;
    },

    /**
     *
     * @param {String} definitionId
     * @returns {Event}
     */
    setDefinitionId: function (definitionId) {
        this.event.definitionId = definitionId;
        return this;
    },

    /**
     *
     * @param {Object} data
     * @returns {Event}
     */
    setData: function (data) {
        this.event.data = merge(this.event.data, data);
        return this;
    },

    /**
     *
     * @param {String} name
     * @param {*} value
     * @returns {Event}
     */
    setDataValue: function (name, value) {
        this.event.data[name] = value;
        return this;
    },

    /**
     *
     * @returns {String}
     */
    getId: function () {
        return this.event && this.event.id || null;
    },

    /**
     *
     * @returns {Number|null}
     */
    getCreatedAt: function () {
        return this.event && this.event.createdAt || null;
    },

    /**
     *
     * @returns {String|null}
     */
    getDefinitionId: function () {
        return this.event && this.event.definitionId || null;
    },

    /**
     *
     * @returns {Object|null}
     */
    getData: function () {
        return this.event && this.event.data || null;
    },

    /**
     *
     * @param {String} name
     * @returns {Object|null}
     */
    getDataValue: function (name) {
        return this.event && this.event.data && this.event.data[name] || null;
    },

    // <session> getSession()
    getSession: function () {
        // TODO?
    },

    /**
     *
     * @returns {boolean}
     */
    isValid: function () {
        return !!this.getId() && !!this.getData() && !!this.getCreatedAt();
    }
};

module.exports = Event;
