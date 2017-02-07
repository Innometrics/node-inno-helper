/**
 *
 * @param {number} length
 * @constructor
 */
var IdGenerator = function (length) {
    var DEFAULT_ID_LENGTH = 32;

    var randPart;
    var hashPart;
    var id;

    if (arguments.length > 0) {
        if (typeof length !== 'number') {
            throw new Error('Length should be a number');
        }
        if (length < 0) {
            throw new Error('Length should be positive');
        }
        if (parseInt(length, 10) !== length) {
            throw new Error('Length should be integer');
        }
    } else {
        length = DEFAULT_ID_LENGTH;
    }

    id = '';
    hashPart = this.getHashPart(this.getEnvStr(this.getEnvObj()));
    randPart = this.getRandPart(length - hashPart.length);

    // depending on the length of the hash, which is variable, we place it at the beginning or the end of the ID
    if (hashPart.length % 2) {
        id = hashPart + randPart;
    } else {
        id = randPart + hashPart;
    }

    this.id = id;
};

IdGenerator.prototype = {
    /**
     * Id
     * @private
     * @type {String}
     */
    id: null,

    /**
     * Get generated id
     * @returns {String}
     */
    getId: function () {
        return this.id;
    },

    /**
     * Generate the random number between 0-9
     * @private
     * @returns {number}
     */
    rnd: function () {
        return Math.floor(Math.random() * 10);
    },

    /**
     * Create an object from environment values
     * @private
     * @return {Object} Contains values as string from environment values or random number if absent
     */
    getEnvObj: function () {
        return {
            vr: process.version + this.rnd(),
            ah: process.arch + this.rnd(),
            pl: process.platform + this.rnd()
        };
    },

    /**
     * Get an object containing only values and return a String
     * @private
     * @param  {Object} envObj Object containing string representing browser environment values
     * @return {String}        String to be hashed
     */
    getEnvStr: function (envObj) {
        var envStr = '';

        Object.keys(envObj).forEach(function (key) {
            envStr += envObj[key];
        });

        return envStr;
    },

    /**
     * Create a 32 bit hash from a String
     * @private
     * @param  {String} envStr String composed from environment variables
     * @return {String}        String composed of [0-9a-z]
     */
    getHashPart: function (envStr) {
        var hash = 0,
            envLgt = envStr.length,
            i;

        for (i = 0; i < envLgt; i += 1) {
            hash = hash * 31 + envStr.charCodeAt(i);
            // Convert to 32 bit integer
            hash &= hash;
        }
        return '' + Math.abs(hash).toString(36);
    },

    /**
     * Generate the random part of the hash thanks to hash already created and idLgt
     * @private
     * @param  {String} hashPart hash of environment variables
     * @return {String}          Random string composed of [0-9a-z]
     */
    getRandPart: function (length) {
        var randPart = '',
            i;

        for (i = 0; i < length; i++) {
            randPart += Math.floor(Math.random() * 36).toString(36);
        }

        return randPart;
    }
};

module.exports = IdGenerator;
