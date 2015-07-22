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
    this.initAttributes(config.attributes);
    this.initSessions(config.sessions);
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
    attributes: null,

    /**
     *
     * @type {Array}
     */
    sessions: null,

    /**
     *
     * @returns {String}
     */
    getId: function () {
        return this.id;
    },

    /**
     *
     * @param {Object} rawAttributesData
     * @returns {Profile}
     */
    initAttributes: function (rawAttributesData) {
        var attributes;
        this.attributes = [];

        if (Array.isArray(rawAttributesData)) {
            attributes = [];
            rawAttributesData.forEach(function (attr) {
                attributes = attributes.concat(this.createAttributes(
                    attr.collectApp,
                    attr.section,
                    attr.data
                ));
            }, this);
            this.attributes = attributes;
        }

        return this;
    },

    /**
     *
     * @param {String} collectApp
     * @param {String} section
     * @param {Object} attributesData
     * @returns {Array}
     */
    createAttributes: function (collectApp, section, attributesData) {
        var names;

        if (!collectApp || !section) {
            throw new Error('collectApp and section should be filled to create attribute correctly');
        }
        
        if (!attributesData || typeof attributesData !== 'object') {
            throw new Error('attributes should be an object');
        }

        names = Object.keys(attributesData);

        if (!names.length) {
            throw new Error('attributes are empty');
        }

        return names.map(function (name) {
            return this.createAttribute(
                collectApp,
                section,
                name,
                attributesData[name]
            );
        }, this);
    },

    /**
     *
     * @param {String} collectApp
     * @param {String} section
     * @param {String} name
     * @param {*} value
     * @returns {Attribute}
     */
    createAttribute: function (collectApp, section, name, value) {
        return new Attribute({
            collectApp: collectApp,
            section:    section,
            name:       name,
            value:      value
        });
    },

    /**
     *
     * @param {String} [collectApp]
     * @param {String} [section]
     * @returns {Array}
     */
    getAttributes: function (collectApp, section) {
        var attributes = this.attributes,
            filters = [];

        if (collectApp) {
            filters.push(function (attribute) {
                return attribute.getCollectApp() === collectApp;
            });
        }

        if (section) {
            filters.push(function (attribute) {
                return attribute.getSection() === section;
            });
        }

        if (filters.length) {
            attributes = attributes.filter(function (attribute) {
                return filters.every(function (filter) {
                    return filter(attribute);
                });
            });
        }

        return attributes;
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
        attributes = attributes.filter(function (attr) {
            return attr.getName() === name;
        });
        
        return attributes[0] || null;
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
     * @param {Array.<Attribute>} newAttributes
     * @returns {Profile}
     */
    setAttributes: function (newAttributes) {
        var attributes;

        if (!Array.isArray(newAttributes)) {
            throw new Error('attributes should be an array');
        }

        attributes = this.getAttributes();

        newAttributes.forEach(function (attr) {
            if (!(attr instanceof Attribute)) {
                attr = this.createAttribute(
                    attr.collectApp,
                    attr.section,
                    attr.name,
                    attr.value
                );
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
                attributes.push(attr);
            }
        }, this);
        
        return this;
    },


    /**
     *
     * @param {Object} rawSessionsData
     * @returns {Profile}
     */
    initSessions: function (rawSessionsData) {
        this.sessions = [];

        if (Array.isArray(rawSessionsData)) {
            this.sessions = rawSessionsData.map(function (rawSessionData) {
                return this.createSession(rawSessionData);
            }, this);
        }

        return this;
    },

    /**
     *
     * @param {Function} [filter]
     * @returns {*}
     */
    getSessions: function (filter) {
        var sessions = this.sessions;

        if (arguments.length) {
            if (typeof filter !== 'function') {
                throw new Error('filter should be a function');
            }
            sessions = sessions.filter(filter);
        }

        return sessions;
    },

    /**
     *
     * @param {Session|Object} session
     * @returns {Session}
     */
    setSession: function (session) {
        if (!(session instanceof Session)) {
            session = this.createSession(session);
        }

        if (!session.isValid()) {
            throw new Error('Session is not valid');
        }

        var existSession = this.getSession(session.getId());

        if (!existSession) {
            // add as new session
            this.getSessions().push(session);

        } else if (existSession !== session) {
            // replace existing with new one
            this.replaceSession(existSession, session);
        }

        return session;
    },

    /**
     *
     * @param {Session} oldSession
     * @param {Session} newSession
     * @returns {Profile}
     */
    replaceSession: function (oldSession, newSession) {
        var sessions = this.getSessions(),
            index = sessions.indexOf(oldSession);

        if (index !== -1) {
            sessions[index] = newSession;
        }

        return this;
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
        return sessions[0] || null;
    },

    /**
     *
     * @param {Object} rawSessionData
     * @returns {Session}
     */
    createSession: function (rawSessionData) {
        return new Session(rawSessionData);
    },

    /**
     *
     * @return {Session}
     */
    getLastSession: function () {
        var sessions = this.getSessions(),
            lastSession = null;

        if (sessions.length) {
            var sorted = sessions.concat().sort(function (a, b) {
                return b.getModifiedAt() - a.getModifiedAt();
            });
            lastSession = sorted[0];
        }

        return lastSession;
    },

    /**
     *
     * @private
     * @return {Object}
     */
    serialize: function () {
        return {
            id:         this.getId(),
            attributes: this.serializeAttributes(),
            sessions:   this.serializeSessions()
        };
    },

    /**
     * @private
     * @returns {Array}
     */
    serializeAttributes: function () {
        var attributesMap = {},
            attributes = [];

        this.getAttributes().forEach(function (attribute) {
            var collectApp = attribute.getCollectApp(),
                section = attribute.getSection(),
                key = collectApp + '/' + section;

            if (!attributesMap[key]) {
                attributesMap[key] = {
                    collectApp: collectApp,
                    section: section,
                    data: {}
                };
                attributes.push(attributesMap[key]);
            }

            attributesMap[key].data[attribute.getName()] = attribute.getValue();
        });

        return attributes;
    },

    /**
     * @private
     * @returns {Array}
     */
    serializeSessions: function () {
        return this.getSessions().map(function (session) {
            return session.serialize();
        });
    },

    /**
     * @private
     * @returns {Profile}
     */
    sortSessions: function () {
        this.getSessions().sort(function (session1, session2) {
            return session1.getModifiedAt() - session2.getModifiedAt();
        });
        return this;
    },

    /**
     * TODO make code review
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

        // merge attributes
        this.setAttributes(profile.getAttributes());

        // merge sessions
        // TODO how to do it?


        var localSessions = deepmerge([], this.getSessions());
        var newSessions = deepmerge([], profile.getSessions());
        
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
