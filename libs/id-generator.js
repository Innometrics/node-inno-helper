
var DEFAULT_ID_LENGTH = 32;

function generate (length) {
    var randPart,
        hashPart,
        id;

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
    hashPart = getHashPart(getEnvStr(getEnvObj()));
    randPart = getRandPart(length - hashPart.length);

    // depending on the length of the hash, which is variable, we place it at the beginning or the end of the ID
    if (hashPart.length % 2) {
        id = hashPart + randPart;
    } else {
        id = randPart + hashPart;
    }

    return id;
}


exports.generate = generate;


//
// Some helpers
//

/**
 *
 * @returns {number}
 */
function rnd () {
    return Math.floor(Math.random() * 10);
}

/**
 * Create an object from environment values
 * @return {Object} Contains values as string from environment values or random number if absent
 */
function getEnvObj () {
    return {
        vr: process.version + rnd(),
        ah: process.arch + rnd(),
        pl: process.platform + rnd()
    };
}

/**
 * Get an object containing only values and return a String
 * @param  {Object} envObj Object containing string representing browser environment values
 * @return {String}        String to be hashed
 */
function getEnvStr (envObj) {
    var envStr = "";

    Object.keys(envObj).forEach(function (key) {
        envStr += envObj[key];
    });

    return envStr;
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
 * generate the random part of the hash thanks to hash already created and idLgt
 * @param  {String} hashPart hash of environment variables
 * @return {String}          Random string composed of [0-9a-z]
 */
/**
 *
 * @param {Number} length
 * @returns {string}
 */
function getRandPart (length) {
    var randPart = "",
        i;

    for (i = 0; i < length; i++) {
        randPart += Math.floor(Math.random() * 36).toString(36);
    }

    return randPart;
}
