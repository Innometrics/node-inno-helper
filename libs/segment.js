'use strict';

/**
 *
 * @param {Object} config
 * @constructor
 */
var Segment = function (config) {
    this.validateConfig(config);
    this.id = config.id;
    this.iql = config.iql;
};

Segment.prototype = {

    /**
     *
     */
    id: null,

    /**
     *
     */
    iql: null,

    validateConfig: function (config) {
        if (!config) {
            throw new Error('Config should be defined');
        }

        if (typeof config !== 'object') {
            throw new Error('Config should be an object');
        }

        ['id', 'iql'].forEach(function (field) {
            if (!(field in config)) {
                throw new Error('Property "' + field + '" in config should be defined');
            }
            if (typeof config[field] !== 'string') {
                throw new Error('Property "' + field + '" in config should be a string');
            }
            if (!config[field].trim()) {
                throw new Error('Property "' + field + '" in config can not be empty');
            }
        });
    },

    /**
     *
     * @returns {String}
     */
    getId: function () {
        return this.id;
    },

    /**
     *
     * @returns {String}
     */
    getIql: function () {
        return this.iql;
    },

    /**
     *
     * @returns {boolean}
     */
    isValid: function () {
        return !!(this.id && this.iql);
    }
};

module.exports = Segment;
