'use strict';

var Attribute = require('./attribute');
var Event = require('./event');
var Session = require('./session');
var Segment = require('./segment');

var Profile = function (profile) {
    this.data = profile;
};

Profile.Attribute = Attribute;
Profile.Event = Event;
Profile.Session = Session;
Profile.Segment = Segment;
Profile.generateId = function () {
    var randPart = "",
        hashPart = "",
    // Exact length of the id
        idLgt = 32,
    // ID string
        idStr = "";

    /**
     * generate the random part of the hash thanks to hash already created and idLgt
     * @param  {String} hashPart hash of environment variables
     * @return {String}          Random string composed of [0-9a-z]
     */
    function getRandPart (hashPart) {
        var nbRandGen = idLgt - hashPart.length,
            randPart = "",
            i;

        for (i = 0; i < nbRandGen; i += 1) {
            randPart += Math.floor(Math.random() * 36).toString(36);
        }

        return randPart;
    }

    /**
     * create a 32 bit hash from a String
     * @param  {String} envStr String composed from environment variables
     * @return {String}        String composed of [0-9a-z]
     */
    function getHashPart (envStr) {
        var hash = 0,
            envLgt = envStr.length,
            i;

        for (i = 0; i < envLgt; i += 1) {
            hash = hash * 31 + envStr.charCodeAt(i);
            hash = hash & hash; // Convert to 32 bit integer
        }
        return ("" + Math.abs(hash).toString(36));
    }

    /**
     * Get an object containing only values and return a String
     * @param  {Object} envObj Object containing string representing browser environment values
     * @return {String}        String to be hashed
     */
    function getEnvStr (envObj) {
        var str = "",
            envStr = "";

        for (str in envObj) {
            if (envObj.hasOwnProperty(str)) {
                envStr += envObj[str];
            }
        }
        return envStr;
    }

    /**
     * Create an object from browser environment values
     * @return {Object} Contains values as string from environment values or random number if absent
     */
    function getEnvObj () {
        var envObj = {};

        function rnd () {
            return Math.floor(Math.random() * 10);
        }

        envObj.vr = process.version + rnd();
        envObj.ah = process.arch + rnd();
        envObj.pl = process.platform + rnd();

        return envObj;
    }

    hashPart = getHashPart(getEnvStr(getEnvObj()));
    randPart = getRandPart(hashPart);

    // depending on the length of the hash, which is variable, we place it at the beginning or the end of the ID
    if (hashPart.length % 2) {
        idStr = hashPart + randPart;
    } else {
        idStr = randPart + hashPart;
    }

    return idStr;
};

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
        
        if (Object.keys(attributes).length) {
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
        var attrs = [];
        var profile = this.getData();
        var checkCond = function (app, sec) {
            var res = true;
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
        
        if (profile.hasOwnProperty('attributes') && Array.isArray(profile.attributes)) {
            profile.attributes.forEach(function (attrsData) {
                if (checkCond(attrsData.collectApp, attrsData.section)) {
                    attrs = attrs.concat(this.createAttributes(
                        attrsData.collectApp,
                        attrsData.section,
                        attrsData.data
                    ));
                }
            }, this);
        }
        
        return attrs;
    },
    // <Attribute> getAttribute(<string> name, <string> collectApp, <string> section)
    getAttribute: function (name, collectApp, section) {
        if (!name || !collectApp || !section) {
            throw new Error('Name, collectApp and section should be filled to get attribute');
        }
        
        var attribute = null;
        var attrs = this.getAttributes(collectApp, section);
        attrs.forEach(function (attr) {
            if (attr.getName() === name) {
                attribute = attr;
            }
        });
        
        return attribute;
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
            if (!(attr instanceof Attribute) || !attr.isValid()) {
                return;
            }
            
            var app = attr.getCollectApp();
            var sec = attr.getSection();
            var currentAttrData = null;
            
            attrs.forEach(function (attrData) {
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
                attrs.push(currentAttrData);
            }
            
            currentAttrData.data[attr.getName()] = attr.getValue();
            
        }, this);
        
        data.attributes = attrs;
        return this;
    },

    // Sessions
    // array.<Session> getSessions([<function> filter])
    getSessions: function (filter) {

        var profile = this.getData();

        if (!(typeof filter).match('undefined|function')) {
            throw new Error('Argument is not a function');
        }

        if (profile.hasOwnProperty('sessions') && Array.isArray(profile.sessions)) {
            return filter === undefined ? profile.sessions : profile.sessions.filter(filter);
        } else {
            profile.sessions = [];
            return profile.sessions;
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
    }
};

module.exports = Profile;
