'use strict';

var merge = require('merge');
var Event = require('./event');
var idGenerator = require('./id-generator');

/**
 *
 * @param {Object} config
 * config equals to {id: id, section: sectionId, collectApp: collectApp, data: data, events: events, createdAt: timestamp, modifiedAt: modifiedAt }
 * @constructor
 */
var Session = function (config) {

    config = config || {};

    var now = (new Date()).getTime();

    this.id = config.id || idGenerator.generate(8);
    this.data = config.data || {};
    this.section = config.section;
    this.events = [];
    this.collectApp = config.collectApp || "web";
    this.createdAt  = config.createdAt  || now;
    this.modifiedAt = config.modifiedAt || now;

    if (config.hasOwnProperty('events') && Array.isArray(config.events)) {
        this.events = config.events.map(function (event) {
            return new Event(event);
        });
    }
};

Session.prototype = {

    /**
     *
     * @type {String}
     */
    id: null,

    /**
     *
     * @type {Object}
     */
    data: {},

    /**
     *
     * @type {Array}
     */
    events: [],

    /**
     *
     * @type {String}
     */
    section: null,

    /**
     *
     * @type {String}
     */
    collectApp: null,

    /**
     *
     * @type {Number}
     */
    createdAt: null,

    /**
     *
     * @type {Number}
     */
    modifiedAt: null,

    /**
     *
     * @param {String} id
     * @return {Session}
     */
    setId: function (id) {
        this.id = id;
        return this;
    },
    
    /**
     *
     * @param {String} collectApp
     * @return {Session}
     */
    setCollectApp: function (collectApp) {
        this.collectApp = collectApp;
        return this;
    },
    
    /**
     *
     * @param {String} section
     * @return {Session}
     */
    setSection: function (section) {
        this.section = section;
        return this;
    },
    
    /**
     *
     * @param {Date|Number} date
     * @return {Session}
     */
    setCreatedAt: function (date) {
        this.createdAt = (new Date(date)).getTime();
        return this;
    },
    
    /**
     *
     * @param {Object} data
     * @return {Session}
     */
    setData: function (data) {
        this.data = merge(this.data, data);
        return this;
    },
    
    /**
     *
     * @param {String} name
     * @param {String} value
     * @return {Session}
     */
    setDataValue: function (name, value) {
        this.data[name] = value;
        return this;
    },
    
    /**
     *
     * @return {String|null}
     */
    getId: function () {
        return this.id || null;
    },
    
    /**
     *
     * @return {String|null}
     */
    getCollectApp: function () {
        return this.collectApp || null;
    },
    
    /**
     *
     * @return {String|null}
     */
    getSection: function () {
        return this.section || null;
    },
    
    /**
     *
     * @return {Number|null}
     */
    getCreatedAt: function () {
        return this.createdAt || null;
    },
    
    /**
     *
     * @return {Number|null}
     */
    getModifiedAt: function () {
        return this.modifiedAt || null;
    },
    
    /**
     *
     * @return {Object}
     */
    getData: function () {
        return this.data || {};
    },
    
    /**
     *
     * @return {String}
     */
    getDataValue: function (name) {
        return this.data && this.data[name] || null;
    },
    
    /**
     *
     * @param {Event|Object} event
     * @return {Event}
     */
    addEvent: function (event) {
        if (!(event instanceof Event)) {
            event = new Event(event);
        }

        if (!event.isValid()) {
            throw new Error('Event is not valid');
        }

        var existEvent = this.getEvent(event.getId());

        if (existEvent) {
            existEvent = event;
            return existEvent;
        } else {
            var events = this.getEvents();
            events.push(event);
            return events[events.length - 1];
        }
    },
    
    /**
     *
     * @param  {String} eventId
     * @return {Event|null}
     */
    getEvent: function (eventId) {
        var events = this.getEvents();
        var result = events.filter(function (event) {
            return event.getId() === eventId;
        });

        return result.length ? result[0] : null;
    },

    /**
     *
     * @param  {String} eventDefinitionId
     * @return {Array}
     */
    getEvents: function (eventDefinitionId) {
        if (!this.events) {
            this.events = [];
            return this.events;
        }

        if (eventDefinitionId) {
            return this.events.filter(function (event) {
                return event.getDefinitionId() === eventDefinitionId;
            });
        } else {
            return this.events;
        }

    },
    
    /**
     *
     * @return {Boolean}
     */
    isValid: function () {
        return !!this.getId() && !!this.getSection() && !!this.getCollectApp() && !!this.getCreatedAt();
    },
    
    /**
     *
     * @private
     * @return {Object}
     */
    serialize: function () {
        return {
            id: this.getId(),
            section: this.getSection(),
            collectApp: this.getCollectApp(),
            data: this.getData(),
            events: this.getEvents(),
            createdAt: this.getCreatedAt(),
            modifiedAt: this.getModifiedAt()
        };
    }
};

module.exports = Session;
