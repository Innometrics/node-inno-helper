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

    config = config || {};

    this.id = config.id || idGenerator.generate(8);
    this.data = config.data || {};
    this.createdAt = config.createdAt || (new Date()).getTime();

};

Event.prototype = {

    /**
     * @type {String}
     */
    id: null,

    /**
     * @type {Object}
     */
    data: {},

    /**
     * @type {Number}
     */
    createdAt: null,

    /**
     *
     * @param {String} id
     * @returns {Event}
     */
    setId: function (id) {
        this.id = id;
        return this;
    },

    /**
     *
     * @param {Number|Date} date
     * @returns {Event}
     */
    setCreatedAt: function (date) {
        this.createdAt = (new Date(date)).getTime();
        return this;
    },

    /**
     *
     * @param {String} definitionId
     * @returns {Event}
     */
    setDefinitionId: function (definitionId) {
        this.definitionId = definitionId;
        return this;
    },

    /**
     *
     * @param {Object} data
     * @returns {Event}
     */
    setData: function (data) {
        this.data = merge(this.data, data);
        return this;
    },

    /**
     *
     * @param {String} name
     * @param {*} value
     * @returns {Event}
     */
    setDataValue: function (name, value) {
        this.data[name] = value;
        return this;
    },

    /**
     *
     * @returns {String|null}
     */
    getId: function () {
        return this.id || null;
    },

    /**
     *
     * @returns {Number|null}
     */
    getCreatedAt: function () {
        return this.createdAt || null;
    },

    /**
     *
     * @returns {String|null}
     */
    getDefinitionId: function () {
        return this.definitionId || null;
    },

    /**
     *
     * @returns {Object|null}
     */
    getData: function () {
        return this.data || {};
    },

    /**
     *
     * @param {String} name
     * @returns {Object|null}
     */
    getDataValue: function (name) {
        return this.data && this.data[name] || null;
    },

    /**
     *
     * @return {Session}
     */
    getSession: function () {
        // TODO?
    },

    /**
     *
     * @returns {Boolean}
     */
    isValid: function () {
        return !!this.getId() && !!this.getData() && !!this.getCreatedAt();
    },

    /**
     *
     * @private
     * @return {Object}
     */
    serialize: function () {
        return {
            id: this.getId(),
            data: this.getData(),
            createdAt: this.getCreatedAt()
        };
    }
};

module.exports = Event;
