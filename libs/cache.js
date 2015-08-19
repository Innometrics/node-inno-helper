/**
 * @constructor
 */
var Cache =  function () {

};

Cache.prototype = {
    /**
     * Cache storage
     * @private
     * @type {Object}
     */
    cache: {},

    /**
     * Cache TTL
     * @private
     * @type {Number}
     */
    cachedTime: 60,

    /**
     * Get data from cache by name if it's not expired
     * @param {String} name
     * @returns {*|undefined}
     */
    get: function (name) {
        var value;
        if (this.cachedTime && this.cache.hasOwnProperty(name)) {
            if (this.cache[name].expired <= Date.now()) {
                delete this.cache[name];
            } else {
                value = this.cache[name].value;
            }
        }
        return value;
    },

    /**
     * Set data to cache
     * @param {String} name
     * @param {*} value
     * @returns {undefined}
     */
    set: function (name, value) {
        if (this.cachedTime) {
            this.cache[name] = {
                expired: Date.now() + (this.cachedTime * 1000),
                value: value
            };
        }
    },

    /**
     * Expire record in cache by name
     * @param {String} name
     * @returns {undefined}
     */
    expire: function (name) {
        if (this.cache.hasOwnProperty(name)) {
            this.cache[name].expired = 0;
        }
    },

    /**
     * Clear all cache records
     * @returns {undefined}
     */
    clearCache: function () {
        this.cache = {};
    },

    /**
     * Change cache TTL
     * @param {Number} time
     * @returns {undefined}
     */
    setCachedTime: function (time) {
        this.cachedTime = time;
    }
};

module.exports = Cache;
