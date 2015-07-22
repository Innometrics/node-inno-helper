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

    this.setId(config.id || idGenerator.generate(8));
    this.setData(config.data);
    this.setDefinitionId(config.definitionId || null);
    this.setCreatedAt(config.createdAt || +new Date());

};

Event.prototype = {

    /**
     * @type {String}
     */
    id: null,

    /**
     *
     * @type {String}
     */
    definitionId: null,

    /**
     * @type {Object}
     */
    data: null,

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
        this.data = merge(this.data, data || {});
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
     * @returns {Object}
     */
    getData: function () {
        return this.data;
    },

    /**
     *
     * @param {String} name
     * @returns {Object|null}
     */
    getDataValue: function (name) {
        return this.data && this.data[name] !== undefined ? this.data[name] : null;
    },

    /**
     *
     * @returns {Boolean}
     */
    isValid: function () {
        return !!this.getId() && !!this.getDefinitionId() && !!this.getData() && !!this.getCreatedAt();
    },

    /**
     *
     * @private
     * @return {Object}
     */
    serialize: function () {
        return {
            id:             this.getId(),
            data:           this.getData(),
            definitionId:   this.getDefinitionId(),
            createdAt:      this.getCreatedAt()
        };
    },

    merge: function (event) {
        if (!(event instanceof Event)) {
            throw new Error('Argument "event" should be a Event instance');
        }

        if (this.getId() !== event.getId()) {
            throw new Error('Event IDs should be similar');
        }

        this.setData(event.getData());

        return this;
    }
};

module.exports = Event;
