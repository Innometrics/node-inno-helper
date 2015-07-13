'use strict';

var merge = require('merge');
var EventDefinition = require('./event');
var idGenerator = require('./id-generator');

// <Session> new Profile.Session({collectApp: web, section: sec, id: id, data: data, createdAt: timestamp})
var Session = function (session) {
    var now = (new Date()).getTime();
    this.session  = merge({
        id: idGenerator.generate(8),
        collectApp: "web",
        data: {},
        events: [],
        createdAt: now,
        modifiedAt: now
    }, session);
};

Session.prototype = {
    session: null,
    // <Session> setId(<string> id)
    setId: function (id) {
        this.session.id = id;
        return this;
    },
    // <Session> setCollectApp(<string> collectApp)
    setCollectApp: function (collectApp) {
        this.session.collectApp = collectApp;
        return this;
    },
    // <Session> setSection(<string> section)
    setSection: function (section) {
        this.session.section = section;
        return this;
    },
    // <Session> setCreatedAt(<number|Date>)
    setCreatedAt: function (date) {
        this.session.createdAt = date;
        return this;
    },
    // <Session> setData(<object> data)
    setData: function (data) {
        this.session.data = merge(this.session.data, data);
        return this;
    },
    // <Session> setDataValue(<string> name, <mixed> value)
    setDataValue: function (name, value) {
        this.session.data[name] = value;
        return this;
    },
    // <string> getId()
    getId: function () {
        return this.session && this.session.id || null;
    },
    // <string> getCollectApp()
    getCollectApp: function () {
        return this.session && this.session.collectApp || null;
    },
    // <string> getSection()
    getSection: function () {
        return this.session && this.session.section || null;
    },
    // <number> getCreatedAt()
    getCreatedAt: function () {
        return this.session && this.session.createdAt || null;
    },
    // <number> getModifiedAt()
    getModifiedAt: function () {
        return this.session && this.session.modifiedAt || null;
    },
    // <object> getData()
    getData: function () {
        return this.session && this.session.data || null;
    },
    // <mixed> getDataValue(<string> name)
    getDataValue: function (name) {
        return this.session && this.session.data && this.session.data[name] || null;
    },
    // <event> addEvent(<object|Event> event)
    addEvent: function (event) {
        if (!(event instanceof EventDefinition)) {
            event = new EventDefinition(event);
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
        var result = events.filter(function (event)     {
            return event.id === eventId;
        });

        return result.length ? result[0] : null;
    },
    // array.<Event> getEvents([<string> eventDefinitionId])
    getEvents: function (eventDefinitionId) {
        if (!this.session.events) {
            this.session.events = [];
            return this.session.events;
        }

        if (eventDefinitionId) {
            return this.session.events.filter(function (event)     {
                return event.getDefinitionId() === eventDefinitionId;
            });
        } else {
            return this.session.events;
        }

    },
    // <boolean> isValid()
    isValid: function () {
        return !!this.getId() && !!this.getSection() && !!this.getCollectApp() && !!this.getCreatedAt();
    }
};

module.exports = Session;
