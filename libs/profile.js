'use strict';

var Attribute = require('./attribute');
var Event = require('./event');
var Session = require('./session');
var Segment = require('./segment');
var deepmerge = require('deepmerge');
var idGenerator = require('./id-generator');
// var merge = require('merge');

/**
 *
 * @param {Object} config
 * @constructor
 */
var Profile = function (config) {
    
    config = config || {};

    this.id = config.id || idGenerator.generate(32);
    this.attributes = [];
    this.sessions   = [];

    // TODO make initAttributes(*) method
    var attributes = [];
    if (config.hasOwnProperty('attributes') && Array.isArray(config.attributes)) {
        config.attributes.forEach(function (attr) {
            var name;
            for (name in attr.data) {
                if (attr.data.hasOwnProperty(name)) {
                    attributes.push(new Attribute({
                        collectApp: attr.collectApp,
                        section: attr.section,
                        name: name,
                        value: attr.data[name]
                    }));
                }
            }
        });
        
        this.attributes = attributes;
    }

    // TODO make initSessions(*) method
    if (config.hasOwnProperty('sessions') && Array.isArray(config.sessions)) {
        this.sessions = config.sessions.map(function (session) {
            return new Session(session);
        });
    }
    
};

Profile.Attribute = Attribute;
Profile.Event = Event;
Profile.Session = Session;
Profile.Segment = Segment;

Profile.prototype = {

    /**
     *
     * @type {String}
     */
    id: null,

    /**
     *
     * @type {Array}
     */
    attributes: [],

    /**
     *
     * @type {Array}
     */
    sessions: [],

    /**
     *
     * @returns {String|null}
     */
    getId: function () {
        return this.id || null;
    },

    // attributes
    /**
     *
     * @param {String} collectApp
     * @param {String} section
     * @param {Object} attributes
     * @returns {Array}
     */
    createAttributes: function (collectApp, section, attributes) {
        if (!collectApp || !section) {
            throw new Error('collectApp and section should be filled to create attribute correctly');
        }
        
        if (typeof attributes !== 'object' || !Object.keys(attributes).length) {
            throw new Error('attributes should be an object');
        }
        
        var instances = [];
        var key;
        for (key in attributes) {
            if (attributes.hasOwnProperty(key)) {
                instances.push(new Profile.Attribute({
                    collectApp: collectApp,
                    section: section,
                    name: key,
                    value: attributes[key]
                }));
            }
        }
        
        return instances;
    },

    /**
     *
     * @param {String} [collectApp]
     * @param {String} [section]
     * @returns {Array}
     */
    getAttributes: function (collectApp, section) {
        
        if (!this.attributes || !Array.isArray(this.attributes)) {
            this.attributes = [];
            return this.attributes;
        }

        var checkCond = function (attr) {
            var res = true;
            var app = attr.getCollectApp();
            var sec = attr.getSection();
            if (collectApp && section) {
                if (collectApp !== app || section !== sec) {
                    res = false;
                }
            } else if (collectApp) {
                if (collectApp !== app) {
                    res = false;
                }
            } else if (section) {
                if (section !== sec) {
                    res = false;
                }
            }
            return res;
        };

        
        if (!collectApp && !section) {
            return this.attributes;
        } else {
            return this.attributes.filter(function (attr) {
                return checkCond(attr);
            });
        }

    },

    /**
     *
     * @param {String} name
     * @param {String} collectApp
     * @param {String} section
     * @returns {Attribute|null}
     */
    getAttribute: function (name, collectApp, section) {
        if (!name || !collectApp || !section) {
            throw new Error('Name, collectApp and section should be filled to get attribute');
        }
        
        var attributes = this.getAttributes(collectApp, section);
        var result = attributes.filter(function (attr) {
            return attr.getName() === name;
        });
        
        return result.length ? result[0] : null;
    },

    /**
     *
     * @param {Attribute|Object} attribute
     * @returns {Profile}
     */
    setAttribute: function (attribute) {
        this.setAttributes([attribute]);
        return this;
    },

    /**
     *
     * @param {Array.<Attribute>} attributes
     * @returns {Profile}
     */
    setAttributes: function (attributes) {
        var attrs = this.attributes || [];
        attributes.forEach(function (attr) {
            if (!(attr instanceof Attribute)) {
                attr = new Attribute(attr);
            }

            if (!attr.isValid()) {
                throw new Error('Attribute is not valid');
            }
            
            var foundAttr = this.getAttribute(
                attr.getName(),
                attr.getCollectApp(),
                attr.getSection()
            );
            
            if (foundAttr) {
                foundAttr.setValue(attr.getValue());
            } else {
                attrs.push(attr);
            }
        }, this);
        
        this.attributes = attrs;
        return this;
    },

    // Sessions
    /**
     *
     * @param {Function} [filter]
     * @returns {*}
     */
    getSessions: function (filter) {

        if (!(typeof filter).match('undefined|function')) {
            throw new Error('Argument is not a function');
        }

        if (this.sessions && Array.isArray(this.sessions)) {
            return filter === undefined ? this.sessions : this.sessions.filter(filter);
        } else {
            this.sessions = [];
            return this.sessions;
        }
    },

    /**
     *
     * @param {Session|Object} session
     * @returns {Session}
     */
    setSession: function (session) {
        if (!(session instanceof Session)) {
            session = new Session(session);
        }

        if (!session.isValid()) {
            throw new Error('Session is not valid');
        }

        var existSession = this.getSession(session.getId());

        if (existSession) {
            existSession = session;
            return existSession;
        } else {
            var sessions = this.getSessions();
            sessions.push(session);
            return sessions[sessions.length - 1];
        }
    },

    /**
     *
     * @param  {String} sessionId
     * @return {Session}
     */
    getSession: function (sessionId) {
        var sessions = this.getSessions(function (session) {
            return session.getId() === sessionId;
        });
        return sessions.length ? sessions[0] : null;
    },

    /**
     *
     * @return {Session}
     */
    getLastSession: function () {
        var sessions = this.getSessions();

        if (sessions.length) {
            var sorted = sessions.concat().sort(function (a, b) {
                return b.getModifiedAt() - a.getModifiedAt();
            });
            return this.getSession(sorted[0].getId());
        } else {
            return null;
        }
    },

    /**
     *
     * @private
     * @return {Object}
     */
    serialize: function () {

        var profileData = {
            id: this.id,
            attributes: this.attributes,
            sessions: this.sessions
        };

        var attributes = [];
        profileData.attributes.forEach(function (attr) {
            if (!(attr instanceof Attribute) || !attr.isValid()) {
                return;
            }

            var app = attr.getCollectApp();
            var sec = attr.getSection();
            var currentAttrData = null;

            attributes.forEach(function (attrData) {
                if (attrData.collectApp === app && attrData.section === sec) {
                    currentAttrData = attrData;
                }
            });

            if (!currentAttrData) {
                currentAttrData = {
                    collectApp: app,
                    section: sec,
                    data: {}
                };
                attributes.push(currentAttrData);
            }

            currentAttrData.data[attr.getName()] = attr.getValue();
        }, this);

        profileData.attributes = attributes;


        profileData.sessions = profileData.sessions.map(function (session) {
            var sessionObj = session.serialize();
            sessionObj.events = sessionObj.events.map(function (event) {
                return event.serialize();
            });
            return sessionObj;
        });

        return profileData;
    },

    /**
     *
     * @private
     * @return {Profile}
     */
    merge: function (profile) {
        if (!(profile instanceof Profile)) {
            throw new Error('Argument "profile" should be a Profile instance');
        }

        if (this.getId() !== profile.getId()) {
            throw new Error('Profile IDs should be similar');
        }
        
        var localAttrs = deepmerge([], this.getAttributes());
        var newAttrs = deepmerge([], profile.getAttributes());
        
        var localSessions = deepmerge([], this.getSessions());
        var newSessions = deepmerge([], profile.getSessions());
        
        // merge full profile
        // note: "merge" util instead of "deepmerge" - backref should be saved
        // var data = this.getData();
        // data = merge(data, profile.getData());
        
        // merge attributes
        this.setAttributes(newAttrs);
        this.setAttributes(localAttrs);
        
        // merge sessions
        this.sessions = newSessions;
        
        localSessions.forEach(function (localSession) {
            var newSession = this.getSession(localSession.getId());
            
            if (newSession) {
                // session data
                newSession.setData(localSession.getData());
        
                // events
                var localEvents = localSession.getEvents();
                
                localEvents.forEach(function (localEvent) {
                    var newEvent = newSession.getEvent(localEvent.getId());

                    if (newEvent) {
                        // event data
                        newEvent.setData(localEvent.getData());
                    } else {
                        newSession.addEvent(localEvent);
                    }
                });
            } else {
                this.setSession(localSession);
            }
        }, this);
        
        return this;
    }
};

module.exports = Profile;
