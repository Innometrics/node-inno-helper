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

    var now = +new Date();

    this.setId(config.id || idGenerator.generate(8));
    this.setData(config.data);
    this.setCollectApp(config.collectApp);
    this.setSection(config.section);
    this.setCreatedAt(config.createdAt  || now);
    this.modifiedAt = config.modifiedAt || now;
    this.initEvents(config.events);
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
    data: null,

    /**
     *
     * @type {Array}
     */
    events: null,

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
        this.createdAt = +new Date(date);
        return this;
    },
    
    /**
     *
     * @param {Object} data
     * @return {Session}
     */
    setData: function (data) {
        this.data = merge(this.data, data || {});
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
     * @return {String}
     */
    getId: function () {
        return this.id;
    },
    
    /**
     *
     * @return {String}
     */
    getCollectApp: function () {
        return this.collectApp;
    },
    
    /**
     *
     * @return {String}
     */
    getSection: function () {
        return this.section;
    },
    
    /**
     *
     * @return {Number}
     */
    getCreatedAt: function () {
        return this.createdAt;
    },
    
    /**
     *
     * @return {Number}
     */
    getModifiedAt: function () {
        return this.modifiedAt;
    },
    
    /**
     *
     * @return {Object}
     */
    getData: function () {
        return this.data;
    },
    
    /**
     *
     * @return {String}
     */
    getDataValue: function (name) {
        return this.data && this.data[name] !== undefined ? this.data[name] : null;
    },

    /**
     *
     * @param {Array} rawEventsData
     * @returns {Session}
     */
    initEvents: function (rawEventsData) {
        this.events = [];

        if (Array.isArray(rawEventsData)) {
            this.events = rawEventsData.map(function (rawEventData) {
                return this.createEvent(rawEventData);
            }, this);
        }

        return this;
    },
    
    /**
     *
     * @param {Event|Object} event
     * @return {Event}
     */
    addEvent: function (event) {
        if (!(event instanceof Event)) {
            event = this.createEvent(event);
        }

        if (!event.isValid()) {
            throw new Error('Event is not valid');
        }

        var existEvent = this.getEvent(event.getId());

        if (existEvent) {
            throw new Error('Event with id "' + event.getId() + '" already exists');
        }

        this.getEvents().push(event);

        return event;
    },

    /**
     *
     * @param {Object} rawEventData
     * @returns {Event}
     */
    createEvent: function (rawEventData) {
        return new Event(rawEventData);
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
     * @param  {String} [eventDefinitionId]
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
            id:         this.getId(),
            section:    this.getSection(),
            collectApp: this.getCollectApp(),
            data:       this.getData(),
            events:     this.serializeEvents(),
            createdAt:  this.getCreatedAt(),
            modifiedAt: this.getModifiedAt()
        };
    },

    /**
     * @private
     * @returns {Array}
     */
    serializeEvents: function () {
        return this.getEvents().map(function (event) {
            return event.serialize();
        });
    },

    /**
     * @private
     * @returns {Session}
     */
    sortEvents: function () {
        this.getEvents().sort(function (event1, event2) {
            return event1.getCreatedAt() - event2.getCreatedAt();
        });
        return this;
    },

    /**
     *
     * @param {Session} session
     * @returns {Session}
     */
    merge: function (session) {
        var eventsMap;

        if (!(session instanceof Session)) {
            throw new Error('Argument "session" should be a Session instance');
        }

        if (this.getId() !== session.getId()) {
            throw new Error('Session IDs should be similar');
        }

        // update last modified date
        if (session.modifiedAt > this.modifiedAt) {
            this.modifiedAt = session.modifiedAt;
        }

        // merge data
        this.setData(session.getData());

        // merge events
        eventsMap = {};

        this.getEvents().forEach(function (event) {
            eventsMap[event.getId()] = event;
        });

        session.getEvents().forEach(function (event) {
            var id = event.getId();
            if (!eventsMap[id]) {
                eventsMap[id] = event;
            } else {
                eventsMap[id].merge(event);
            }
        });

        this.events = Object.keys(eventsMap).map(function (id) {
            return eventsMap[id];
        });

        this.sortEvents();
        return this;
    }
};

module.exports = Session;
