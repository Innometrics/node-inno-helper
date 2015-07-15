'use strict';

var Attribute = require('./attribute');
var Event = require('./event');
var Session = require('./session');
var Segment = require('./segment');
var merge = require('merge');
var deepmerge = require('deepmerge');
var idGenerator = require('./id-generator');    

var Profile = function (config) {
    
    config = config || {};
    
    var now = (new Date()).getTime();
    var attributes = [];
    
    this.data = merge({
        id: idGenerator.generate(32),
        attributes: [],
        sessions: [],
        createdAt: now
    }, config);
    
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
        
        this.data.attributes = attributes;
    }    
    
    if (config.hasOwnProperty('sessions') && Array.isArray(config.sessions)) {
        this.data.sessions = config.sessions.map(function (session) {
            return new Session(session);
        });
    }    
    
};

Profile.Attribute = Attribute;
Profile.Event = Event;
Profile.Session = Session;
Profile.Segment = Segment;

Profile.prototype = {
    data: null,

    getId: function () {
        return this.data && this.data.id || null;
    },

    getData: function () {
        return this.data || null;
    },

    // attributes
    // array.<Attribute> createAttributes(<string> collectApp, <string> section, <object> attributes)
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
    // array.<Attribute> getAttributes([<string> collectApp], [<string> section])
    getAttributes: function (collectApp, section) {
        var result = [];
        var data = this.getData();
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
        
        if (data.hasOwnProperty('attributes') && Array.isArray(data.attributes)) {
            if (!collectApp && !section) {
                result = data.attributes;
            } else {
                result = data.attributes.filter(function (attr) {
                    return checkCond(attr);
                });
            }
        }
        
        return result;
    },
    // <Attribute> getAttribute(<string> name, <string> collectApp, <string> section)
    getAttribute: function (name, collectApp, section) {
        if (!name || !collectApp || !section) {
            throw new Error('Name, collectApp and section should be filled to get attribute');
        }
        
        var result = null;
        var attributes = this.getAttributes(collectApp, section);
        var result = attributes.filter(function (attr) {
            return attr.getName() === name;
        });
        
        return result.length ? result[0] : null;        
    },
    // <Profile> setAttribute(<object|Attribute> attribute)
    setAttribute: function (attribute) {
        this.setAttributes([attribute]);
        return this;
    },
    // <Profile> setAttributes(array.<Attribute> attributes)
    setAttributes: function (attributes) {
        var data = this.getData();
        var attrs = data.attributes || [];
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
        
        data.attributes = attrs;
        return this;
    },

    // Sessions
    // array.<Session> getSessions([<function> filter])
    getSessions: function (filter) {

        var data = this.getData();

        if (!(typeof filter).match('undefined|function')) {
            throw new Error('Argument is not a function');
        }

        if (data.hasOwnProperty('sessions') && Array.isArray(data.sessions)) {
            return filter === undefined ? data.sessions : data.sessions.filter(filter);
        } else {
            data.sessions = [];
            return data.sessions;
        }
    },
    // <Session> setSession([<object|Session> session])
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
    // <Session> getSession(<string> sessionId)
    getSession: function (sessionId) {
        var sessions = this.getSessions(function (session) {
            return session.getId() === sessionId;
        });
        return sessions.length ? sessions[0] : null;
    },
    // <Session> getLastSession()
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
    serialize: function () {
        var profileData = merge({}, this.getData());
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
            var sessionObj = session.session;
            sessionObj.events = sessionObj.events.map(function (event) {
                return event.event;
            });
            return sessionObj;
        });

        return profileData;
    },
    merge: function (profile) {
        if (!(profile instanceof Profile)) {
            throw new Error('Argument "profile" should be a Profile instance');
        }
        
        var localAttrs = deepmerge([], this.getAttributes());
        var newAttrs = deepmerge([], profile.getAttributes());
        
        var localSessions = deepmerge([], this.getSessions());
        var newSessions = deepmerge([], profile.getSessions());
        
        var data = this.getData();
        
        // merge full profile
        // note: "merge" util instead of "deepmerge" - backref should be saved
        data = merge(data, profile.getData());
        
        // merge attributes
        this.setAttributes(newAttrs);
        this.setAttributes(localAttrs);
        
        // merge sessions
        data.sessions = newSessions;
        
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
