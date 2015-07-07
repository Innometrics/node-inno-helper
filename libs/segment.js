'use strict';

var Segment = function (config) {
    this.config = config;
};

Segment.prototype = {
    config: null,
    
    // <string> getId()
    getId: function() {
        return this.config && this.config.id;
    },
    // <string> getIql()
    getIql: function() {
        return this.config && this.config.iql;
    }
};

module.exports = Segment;