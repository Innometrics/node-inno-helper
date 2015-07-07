'use strict';

var Attribute = require('./attribute');
var Event = require('./event');
var Session = require('./session');
var Segment = require('./segment');

var Profile = function (profile) {
    this.profile = profile;
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
    profile: null,

    getId: function() {
        return this.profile && this.profile.id || null;
    },

    getData: function() {
        return this.profile || null;
    },

    // attributes
    // array.<Attribute> createAttributes(<string> collectApp, <string> section, <object> attributes)
    createAttributes: function(collectApp, section, attributes) {

    },
    // array.<Attribute> getAttributes([<string> collectApp], [<string> section])
    getAttributes: function(collectApp, section) {

    },
    // <Attribute> getAttribute(<string> name, <string> collectApp, <string> section)
    getAttribute: function(name, collectApp, section) {

    },
    // <Profile> setAttribute(<object|Attribute> attribute)
    setAttribute: function(attribute) {

    },
    // <Profile> setAttributes(array.<Attribute> attributes)
    setAttributes: function(attributes) {

    },

    //sessions
    // array.<Session> getSessions([<function> filter])
    getSessions: function(filter) {

    },
    // <Session> setSession([<object|Session> session])
    setSession: function(session) {

    },
    // <Session> getSession(<string> sessionId)
    getSession: function(sessionId) {

    },
    // <Session> getLastSession()
    getLastSession: function() {

    }
};

module.exports = Profile;