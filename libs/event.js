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
     * Flag that something was changed in event
     * @type {Boolean}
     * @private
     */
    dirty: false,

    /**
     * Set event property and mark it as dirty
     * @param {String} field Property to be set
     * @param {mixed} value Property value
     * @private
     */
    setField: function (field, value) {
        if (this[field] !== value) {
            this[field] = value;
            this.setDirty();
        }
        return this;
    },

    /**
     * Set event id
     * @param {String} id
     * @returns {Event}
     */
    setId: function (id) {
        return this.setField('id', id);
    },

    /**
     * Set date (in ms) when event was created
     * Number or Date can be used.
     *
     * @param {Number|Date} date
     * @returns {Event}
     */
    setCreatedAt: function (date) {
        return this.setField('createdAt', date);
    },

    /**
     * Set event definition id
     * @param {String} definitionId
     * @returns {Event}
     */
    setDefinitionId: function (definitionId) {
        return this.setField('definitionId', definitionId);
    },

    /**
     * Update event data with values
     * Data is an object with key=>value pair(s).
     *
     * @param {Object} data
     * @returns {Event}
     */
    setData: function (data) {
        return this.setField('data', merge({}, this.data, data || {}));
    },

    /**
     * Set single value of event data
     * @param {String} name
     * @param {*} value
     * @returns {Event}
     */
    setDataValue: function (name, value) {
        this.data[name] = value;
        this.setDirty();
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
    },

    /**
     * Mark event as "dirty"
     * @returns {Event}
     * @protected
     */
    setDirty: function () {
        this.dirty = true;
        return this;
    },

    /**
     * reset "dirty" flag
     * @returns {Event}
     */
    resetDirty: function () {
        this.dirty = false;
        return this;
    },

    /**
     * Check if event has any changes
     * @returns {Boolean}
     */
    hasChanges: function () {
        return !!this.dirty;
    }
};

module.exports = Event;
