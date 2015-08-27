'use strict';

var merge = require('merge');
var Event = require('./event');
var IdGenerator = require('./id-generator');

/**
 *
 * @param {Object} config
 * config equals to {id: id, section: sectionId, collectApp: collectApp, data: data, events: events, createdAt: timestamp, modifiedAt: modifiedAt }
 * @constructor
 */
var Session = function (config) {

    config = config || {};

    var now = +new Date();

    this.setId(config.id || (new IdGenerator(8)).getId());
    this.setData(config.data);
    this.setCollectApp(config.collectApp);
    this.setSection(config.section);
    this.setCreatedAt(config.createdAt  || now);
    this.modifiedAt = config.modifiedAt || now;
    this.initEvents(config.events);
};

Session.prototype = {

    /**
     * Session id
     * @type {String}
     */
    id: null,

    /**
     * Session section name
     * @type {String}
     */
    section: null,

    /**
     * Session application name
     * @type {String}
     */
    collectApp: null,

    /**
     * Timestamp in ms when session was created
     * @type {Number}
     */
    createdAt: null,

    /**
     * Timestamp in ms when session was changed
     * @type {Number}
     */
    modifiedAt: null,

    /**
     * Session data object
     * @type {Object}
     */
    data: null,

    /**
     * Session events
     * @type {Array}
     */
    events: null,

    /**
     * Flag that some property was changed in session (not related to events)
     * @type {Boolean}
     * @private
     */
    dirty: false,

    /**
     * Flag that data property was changed in session
     * @type {Boolean}
     * @private
     */
    dataDirty: false,

    /**
     * Set session property and mark it as dirty
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
     * Set session id
     * @param {String} id
     * @return {Session}
     */
    setId: function (id) {
        return this.setField('id', id);
    },

    /**
     * Set session application name
     * @param {String} collectApp
     * @return {Session}
     */
    setCollectApp: function (collectApp) {
        return this.setField('collectApp', collectApp);
    },

    /**
     * Set session section name
     * @param {String} section
     * @return {Session}
     */
    setSection: function (section) {
        return this.setField('section', section);
    },

    /**
     * Set timestamp when session was created
     * Passed argument should be a number or Date instance
     * @param {Date|Number} date
     * @return {Session}
     */
    setCreatedAt: function (date) {
        return this.setField('createdAt', date);
    },

    /**
     * Update session data with values
     * Data is an object with key=>value pair(s).
     * @param {Object} data
     * @return {Session}
     */
    setData: function (data) {
        this.data = merge(this.data, data || {});
        this.setDataDirty();
        return this;
    },

    /**
     * Set single value of session data
     * @param {String} name
     * @param {*} value
     * @return {Session}
     */
    setDataValue: function (name, value) {
        this.data[name] = value;
        this.setDataDirty();
        return this;
    },

    /**
     * Get session id
     * @return {String}
     */
    getId: function () {
        return this.id;
    },

    /**
     * Get session application name
     * @return {String}
     */
    getCollectApp: function () {
        return this.collectApp;
    },

    /**
     * Get session section name
     * @return {String}
     */
    getSection: function () {
        return this.section;
    },

    /**
     * Get timestamp in ms when session was created
     * @return {Number}
     */
    getCreatedAt: function () {
        return this.createdAt;
    },

    /**
     * Get timestamp in ms when session was changed
     * @return {Number}
     */
    getModifiedAt: function () {
        return this.modifiedAt;
    },

    /**
     * Get session data object
     * @return {Object}
     */
    getData: function () {
        return this.data;
    },

    /**
     * Get single value from session data object
     * @return {String}
     */
    getDataValue: function (name) {
        return this.data && this.data[name] !== undefined ? this.data[name] : null;
    },

    /**
     * Add event to session
     * If event with same id already exist in session then Error will be thrown
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

        this.events.push(event);

        this.setDirty();

        return event;
    },

    /**
     * Get event by id
     * @param  {String} eventId
     * @return {Event|null}
     */
    getEvent: function (eventId) {
        var events = this.events;
        var result = events.filter(function (event) {
            return event.getId() === eventId;
        });

        return result.length ? result[0] : null;
    },

    /**
     * Get last event in session
     * @returns {Event|null}
     */
    getLastEvent: function () {
        var events = this.events;
        return events[events.length - 1] || null;
    },

    /**
     * Get events. Can be filtered by definition id
     * @param  {String} [eventDefinitionId]
     * @return {Array}
     */
    getEvents: function (eventDefinitionId) {
        var events = this.events.slice(0);

        if (eventDefinitionId) {
            events = events.filter(function (event) {
                return event.getDefinitionId() === eventDefinitionId;
            });
        }

        return events;
    },

    /**
     *
     * @return {Boolean}
     */
    isValid: function () {
        return !!this.getId() && !!this.getSection() && !!this.getCollectApp() && !!this.getCreatedAt();
    },

    /**
     * Serialize session to JSON
     * @param {Boolean} [onlyChanges]
     * @return {Object}
     * @protected
     */
    serialize: function (onlyChanges) {
        var data = {},
            events = this.serializeEvents(onlyChanges);

        if (!onlyChanges || this.hasDataChanges()) {
            data = this.getData();
        }

        return {
            id:         this.getId(),
            section:    this.getSection(),
            collectApp: this.getCollectApp(),
            createdAt:  this.getCreatedAt(),
            modifiedAt: this.getModifiedAt(),
            data:       data,
            events:     events
        };
    },

    /**
     * Sort events
     * @protected
     * @returns {Session}
     */
    sortEvents: function () {
        this.events.sort(function (event1, event2) {
            return event1.getCreatedAt() - event2.getCreatedAt();
        });
        return this;
    },

    /**
     * Merge data from passed session to current
     * @param {Session} session
     * @returns {Session}
     * @protected
     */
    merge: function (session) {
        var eventsMap;

        if (!(session instanceof Session)) {
            throw new Error('Argument "session" should be a Session instance');
        }

        if (this.getId() !== session.getId()) {
            throw new Error('Session IDs should be similar');
        }

        // update last changed date
        if (session.modifiedAt > this.modifiedAt) {
            this.modifiedAt = session.modifiedAt;
        }

        // merge data
        this.setData(session.getData());

        // merge events
        eventsMap = {};

        this.events.forEach(function (event) {
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
        this.setDirty();
        return this;
    },

    /**
     * Create session events by initial data
     * @param {Array} rawEventsData
     * @returns {Session}
     * @private
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
     * Create event
     * @param {Object} rawEventData
     * @returns {Event}
     * @private
     */
    createEvent: function (rawEventData) {
        return new Event(rawEventData);
    },

    /**
     * Serialize events to JSON
     * @param {Boolean} onlyChanges
     * @returns {Array}
     * @private
     */
    serializeEvents: function (onlyChanges) {
        var events = [];
        this.events.forEach(function (event) {
            if (onlyChanges && !event.hasChanges()) {
                return;
            }
            events.push(event.serialize());
        });

        return events;
    },

    /**
     * Mark session as "dirty"
     * @returns {Session}
     * @protected
     */
    setDirty: function () {
        this.dirty = true;
        return this;
    },

    /**
     * reset "dirty" flag
     * @returns {Session}
     */
    resetDirty: function () {
        this.dirty = false;
        this.dataDirty = false;
        this.getEvents().forEach(function (event) {
            event.resetDirty();
        });
        return this;
    },

    /**
     * Mark session data as "dirty"
     * @returns {Session}
     * @protected
     */
    setDataDirty: function () {
        this.dataDirty = true;
        return this;
    },

    /**
     * Check if session has any changes
     * @returns {Boolean}
     */
    hasChanges: function () {
        return this.dirty || this.hasDataChanges() || this.hasEventsChanges();
    },

    /**
     * Check if session has changes in data property
     * @returns {Boolean}
     */
    hasDataChanges: function () {
        return !!this.dataDirty;
    },

    /**
     * Check if some of events has changes
     * @returns {Boolean}
     * @private
     */
    hasEventsChanges: function () {
        return this.events.some(function (event) {
            return event.hasChanges();
        });
    }

};

module.exports = Session;
