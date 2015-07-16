'use strict';

var merge = require('merge');
var Event = require('./event');
var idGenerator = require('./id-generator');

// <Session> new Profile.Session({collectApp: web, section: sec, id: id, data: data, createdAt: timestamp})
var Session = function (config) {

    config = config || {};

    var now = (new Date()).getTime();

    this.id = config.id || idGenerator.generate(8);
    this.data = config.data || {};
    this.section = config.section;
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

    id: null,
    data: {},
    events: [],
    section: null,
    collectApp: null,
    createdAt: null,
    modifiedAt: null,

    // <Session> setId(<string> id)
    setId: function (id) {
        this.id = id;
        return this;
    },
    // <Session> setCollectApp(<string> collectApp)
    setCollectApp: function (collectApp) {
        this.collectApp = collectApp;
        return this;
    },
    // <Session> setSection(<string> section)
    setSection: function (section) {
        this.section = section;
        return this;
    },
    // <Session> setCreatedAt(<number|Date>)
    setCreatedAt: function (date) {
        this.createdAt = date;
        return this;
    },
    // <Session> setData(<object> data)
    setData: function (data) {
        this.data = merge(this.data, data);
        return this;
    },
    // <Session> setDataValue(<string> name, <mixed> value)
    setDataValue: function (name, value) {
        this.data[name] = value;
        return this;
    },
    // <string> getId()
    getId: function () {
        return this.id || null;
    },
    // <string> getCollectApp()
    getCollectApp: function () {
        return this.collectApp || null;
    },
    // <string> getSection()
    getSection: function () {
        return this.section || null;
    },
    // <number> getCreatedAt()
    getCreatedAt: function () {
        return this.createdAt || null;
    },
    // <number> getModifiedAt()
    getModifiedAt: function () {
        return this.modifiedAt || null;
    },
    // <object> getData()
    getData: function () {
        return this.data || {};
    },
    // <mixed> getDataValue(<string> name)
    getDataValue: function (name) {
        return this.data && this.data[name] || null;
    },
    // <event> addEvent(<object|Event> event)
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
    // <event> getEvent(<string> eventId)
    getEvent: function (eventId) {
        var events = this.getEvents();
        var result = events.filter(function (event) {
            return event.getId() === eventId;
        });

        return result.length ? result[0] : null;
    },
    // array.<Event> getEvents([<string> eventDefinitionId])
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
    // <boolean> isValid()
    isValid: function () {
        return !!this.getId() && !!this.getSection() && !!this.getCollectApp() && !!this.getCreatedAt();
    },
    // <object> serialie()
    serialie: function () {
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
