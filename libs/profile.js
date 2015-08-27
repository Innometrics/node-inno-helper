'use strict';

var Attribute = require('./attribute');
var Event = require('./event');
var Session = require('./session');
var Segment = require('./segment');
var IdGenerator = require('./id-generator');

/**
 *
 * @param {Object} config
 * @constructor
 */
var Profile = function (config) {
    config = config || {};

    if (!(this instanceof Profile)) {
        return new Profile(config);
    }

    this.id = config.id || (new IdGenerator(32)).getId();
    this.initAttributes(config.attributes);
    this.initSessions(config.sessions);
};

Profile.Attribute = Attribute;
Profile.Event = Event;
Profile.Session = Session;
Profile.Segment = Segment;

Profile.prototype = {

    /**
     * Profile id
     * @type {String}
     */
    id: null,

    /**
     * Profile attributes
     * @type {Array}
     */
    attributes: null,

    /**
     * Profile sessions
     * @type {Array}
     */
    sessions: null,

    /**
     * Get profile id
     * @returns {String}
     */
    getId: function () {
        return this.id;
    },

    /**
     * Create attributes by application, section and data object
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
     * Create attribute
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
     * Get attributes. Can be filtered by application or section
     * @param {String} [collectApp]
     * @param {String} [section]
     * @returns {Array}
     */
    getAttributes: function (collectApp, section) {
        var attributes = this.attributes.slice(0),
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
     * Get attribute by name, application and section
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
     * Add attribute to profile or update existing
     * @param {Attribute|Object} attribute
     * @returns {Profile}
     */
    setAttribute: function (attribute) {
        this.setAttributes([attribute]);
        return this;
    },

    /**
     * Add attributes to profile or update existing
     * @param {Array.<Attribute>} newAttributes
     * @returns {Profile}
     */
    setAttributes: function (newAttributes) {
        var attributes;

        if (!Array.isArray(newAttributes)) {
            throw new Error('Argument "attributes" should be an array');
        }

        attributes = this.attributes;

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
     * Get sessions. Can be filtered by passed function
     * @param {Function} [filter]
     * @returns {Array}
     */
    getSessions: function (filter) {
        var sessions = this.sessions.slice(0);

        if (arguments.length) {
            if (typeof filter !== 'function') {
                throw new Error('filter should be a function');
            }
            sessions = sessions.filter(filter);
        }

        return sessions;
    },

    /**
     * Add session to profile or replace existing
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
            this.sessions.push(session);

        } else if (existSession !== session) {
            // replace existing with new one
            this.replaceSession(existSession, session);
        }

        return session;
    },

    /**
     * Get session by id
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
     * Get last session
     * @return {Session}
     */
    getLastSession: function () {
        var sessions = this.getSessions(),
            lastSession = null;

        if (sessions.length) {
            var sorted = sessions.sort(function (a, b) {
                return b.getModifiedAt() - a.getModifiedAt();
            });
            lastSession = sorted[0];
        }

        return lastSession;
    },

    /**
     * Serialize profile to JSON
     * @param {Boolean} [onlyChanges]
     * @returns {Object}
     */
    serialize: function (onlyChanges) {
        return {
            id:         this.getId(),
            attributes: this.serializeAttributes(onlyChanges),
            sessions:   this.serializeSessions(onlyChanges)
        };
    },

    /**
     * Serialize attributes to JSON
     * @param {Boolean} [onlyChanges]
     * @returns {Array}
     * @private
     */
    serializeAttributes: function (onlyChanges) {
        var attributesMap = {},
            attributes = [];

        this.attributes.forEach(function (attribute) {
            if (onlyChanges && !attribute.hasChanges()) {
                return;
            }

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
     * Serialize sessions to JSON
     * @param {Boolean} [onlyChanges]
     * @returns {Array}
     */
    serializeSessions: function (onlyChanges) {
        var sessions = [];

        this.sessions.forEach(function (session) {
            if (onlyChanges && !session.hasChanges()) {
                return;
            }
            sessions.push(session.serialize(onlyChanges));
        });

        return sessions;
    },

    /**
     * Sort sessions by modifiedAt property
     * @returns {Profile}
     * @protected
     */
    sortSessions: function () {
        this.sessions.sort(function (session1, session2) {
            return session1.getModifiedAt() - session2.getModifiedAt();
        });
        return this;
    },

    /**
     * Merge data from passed profile to current
     * @param profile
     * @returns {Profile}
     * @protected
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

        var sessionsMap = {};

        this.sessions.forEach(function (session) {
            sessionsMap[session.getId()] = session;
        });

        profile.getSessions().forEach(function (session) {
            var id = session.getId();
            if (!sessionsMap[id]) {
                sessionsMap[id] = session;
            } else {
                sessionsMap[id].merge(session);
            }
        });

        this.sessions = Object.keys(sessionsMap).map(function (id) {
            return sessionsMap[id];
        });

        this.sortSessions();
        return this;
    },

    /**
     * Create attributes by initial data
     * @param {Object} rawAttributesData
     * @returns {Profile}
     * @private
     */
    initAttributes: function (rawAttributesData) {
        var attributes;
        this.attributes = [];

        if (Array.isArray(rawAttributesData)) {
            attributes = [];
            rawAttributesData.forEach(function (attr) {
                if (Object.keys(attr.data).length) {
                    attributes = attributes.concat(this.createAttributes(
                        attr.collectApp,
                        attr.section,
                        attr.data
                    ));
                }
            }, this);
            this.attributes = attributes;
        }

        return this;
    },

    /**
     * Create session by initial data
     * @param {Object} rawSessionsData
     * @returns {Profile}
     * @private
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
     * Replace existing session with other one
     * @param {Session} oldSession
     * @param {Session} newSession
     * @returns {Profile}
     * @private
     */
    replaceSession: function (oldSession, newSession) {
        var sessions = this.sessions,
            index = sessions.indexOf(oldSession);

        if (index !== -1) {
            sessions[index] = newSession;
        }

        return this;
    },

    /**
     * Create session
     * @param {Object} rawSessionData
     * @returns {Session}
     * @protected
     */
    createSession: function (rawSessionData) {
        return new Session(rawSessionData);
    },

    /**
     * Mark all part of Profile as not changed
     * (only for internal usage)
     * @protected
     */
    resetDirty: function () {
        return [].concat(this.attributes, this.sessions).forEach(function (item) {
            return item.resetDirty();
        });
    },

    /**
     * Check if some of attribute or session has changes
     * @returns {boolean}
     */
    hasChanges: function () {
        return [].concat(this.attributes, this.sessions).some(function (item) {
            return item.hasChanges();
        });
    }

};

module.exports = Profile;
