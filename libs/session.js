'use strict';

var merge = require('merge');
var idGenerator = require('./id-generator');

// <Session> new Profile.Session({collectApp: web, section: sec, id: id, data: data, createdAt: timestamp})
var Session = function (session) {
    this.session  = merge({
        id: idGenerator.generate(8),
        collectApp: "web",
        data: {},
        events: [],
        createdAt: (new Date()).getTime()
    }, session);
};

Session.prototype = {
    session: null,
    // <Session> setId(<string> id)
    setId: function (id) {
        if (this.session) {
            this.session.id = id;
        }
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
        if (!this.session.events) {
            this.session.events = [];
        }

        this.session.events.push(event);
    },
    // <event> getEvent(<string> eventId)
    getEvent: function (eventId) {
        if (!this.session || !this.session.events) {
            return null;
        }

        var result = this.session.events.filter(function (event)     {
            return event.id === eventId;
        });

        return result.length ? result[0] : null;
    },
    // array.<Event> getEvents([<string> eventDefinitionId])
    getEvents: function (eventDefinitionId) {
        if (!this.session || !this.session.events) {
            return null;
        }

        return this.session.events.filter(function (event)     {
            return event.definitionId === eventDefinitionId;
        });
    },
    // <boolean> isValid()
    isValid: function () {
        return !!this.getId() && !!this.getSection() && !!this.getCollectApp() && !!this.getCreatedAt();
    }
};

module.exports = Session;
