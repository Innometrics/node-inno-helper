'use strict';

var Segment = function (config) {
    this.data = config;
};

Segment.prototype = {
    data: null,
    
    // <string> getId()
    getId: function () {
        return this.data && this.data.id;
    },
    // <string> getIql()
    getIql: function () {
        return this.data && this.data.iql;
    }
};

module.exports = Segment;
