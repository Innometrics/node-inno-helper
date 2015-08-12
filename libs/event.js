'use strict';

var merge = require('merge');
var IdGenerator = require('./id-generator');

/**
 *
 * @param {Object} config
 * config equals to {id: id, definitionId: definitionId, data: data, createdAt: timestamp}
 * @constructor
 */
var Event = function (config) {

    config = config || {};

    this.setId(config.id || (new IdGenerator(8)).getId());
    this.setData(config.data);
    this.setDefinitionId(config.definitionId || null);
    this.setCreatedAt(config.createdAt || +new Date());
};

Event.prototype = {

    /**
     * Event id
     * @type {String}
     */
    id: null,

    /**
     * Event definition id
     * @type {String}
     */
    definitionId: null,

    /**
     * Event data object
     * @type {Object}
     */
    data: null,

    /**
     * Date when event was created (timestamp in ms)
     * @type {Number}
     */
    createdAt: null,

    /**
     * Set event id
     * @param {String} id
     * @returns {Event}
     */
    setId: function (id) {
        this.id = id;
        return this;
    },

    /**
     * Set date (in ms) when event was created
     * Number or Date can be used.
     *
     * @param {Number|Date} date
     * @returns {Event}
     */
    setCreatedAt: function (date) {
        this.createdAt = +new Date(date);
        return this;
    },

    /**
     * Set event definition id
     * @param {String} definitionId
     * @returns {Event}
     */
    setDefinitionId: function (definitionId) {
        this.definitionId = definitionId;
        return this;
    },

    /**
     * Update event data with values
     * Data is an object with key=>value pair(s).
     *
     * @param {Object} data
     * @returns {Event}
     */
    setData: function (data) {
        this.data = merge(this.data, data || {});
        return this;
    },

    /**
     * Set single value of event data
     * @param {String} name
     * @param {*} value
     * @returns {Event}
     */
    setDataValue: function (name, value) {
        this.data[name] = value;
        return this;
    },

    /**
     * get event id
     * @returns {String}
     */
    getId: function () {
        return this.id;
    },

    /**
     * Get date (in ms) when event was created
     * @returns {Number}
     */
    getCreatedAt: function () {
        return this.createdAt;
    },

    /**
     * Get event definition id
     * @returns {String}
     */
    getDefinitionId: function () {
        return this.definitionId;
    },

    /**
     * Get event data object
     * @returns {Object}
     */
    getData: function () {
        return this.data;
    },

    /**
     * Get single value of event data object
     * @param {String} name
     * @returns {Object|null}
     */
    getDataValue: function (name) {
        return this.data && this.data[name] !== undefined ? this.data[name] : null;
    },

    /**
     * Check if event is valid (all required fields are present)
     * @returns {Boolean}
     */
    isValid: function () {
        return !!(this.getId() && this.getDefinitionId() && this.getData() && this.getCreatedAt());
    },

    /**
     * Convert event to JSON
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

    /**
     * Merge event with same id to current
     * @param {Event} event
     * @returns {Event}
     */
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
