var cache = {

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
    cachedTime: 10,

    /**
     * Get data from cache by name if it's not expired
     * @private
     * @param {String} name
     * @returns {Mixed|undefined}
     */
    get: function (name) {
        var value;
        if (this.cachedTime) {
            if (this.cache.hasOwnProperty(name)) {
                if (this.cache[name].expired <= Date.now()) {
                    delete this.cache[name];
                } else {
                    value = this.cache[name].value;
                }
            }
        }
        return value;
    },

    /**
     * Set data to cache
     * @private
     * @param {String} name
     * @param {Mixed} value
     * @returns {undefined}
     */
    set: function (name, value) {
        if (this.cachedTime) {
            this.cache[name] = {
                expired: Date.now() + (this.cachedTime * 1000),
                value: value || true
            };
        }
    },

    /**
     * Expire record in cache by name
     * @private
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
     * @private
     * @returns {undefined}
     */
    clearCache: function () {
        this.cache = {};
    },

    /**
     * Change cache TTL
     * @private
     * @param {Number} time
     * @returns {undefined}
     */
    setCachedTime: function (time) {
        this.cachedTime = time;
    }

};


module.exports = cache;