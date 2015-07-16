'use strict';

/**
 *
 * @param {Object} config
 * @constructor
 */
var Segment = function (config) {
    this.data = config;
};

Segment.prototype = {

    data: null,
    
    /**
     *
     * @returns {String}
     */
    getId: function () {
        return this.data && this.data.id;
    },

    /**
     *
     * @returns {String}
     */
    getIql: function () {
        return this.data && this.data.iql;
    }
};

module.exports = Segment;
