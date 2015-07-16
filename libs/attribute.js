'use strict';

/**
 *
 * @param {Object} config
 * config equals to {collectApp: web, section: sec, name: name, value: val}
 * @constructor
 */
var Attribute = function (config) {
    this.data = config;
};

Attribute.prototype = {
    data: null,
    
    /**
     *
     * @param {String} name
     * @returns {Attribute}
     */
    setName: function (name) {
        this.data.name = name;
        return this;
    },

    /**
     *
     * @param {String} collectApp
     * @returns {Attribute}
     */
    setCollectApp: function (collectApp) {
        this.data.collectApp = collectApp;
        return this;
    },


    /**
     *
     * @param {String} section
     * @returns {Attribute}
     */
    setSection: function (section) {
        this.data.section = section;
        return this;
    },

    /**
     *
     * @param {*} value
     * @returns {Attribute}
     */
    setValue: function (value) {
        this.data.value = value;
        return this;
    },

    /**
     *
     * @returns {String}
     */
    getName: function () {
        return this.data && this.data.name;
    },

    /**
     *
     * @returns {String}
     */
    getCollectApp: function () {
        return this.data && this.data.collectApp;
    },

    /**
     *
     * @returns {String}
     */
    getSection: function () {
        return this.data && this.data.section;
    },

    /**
     *
     * @returns {*}
     */
    getValue: function () {
        return this.data && this.data.value;
    },

    /**
     *
     * @returns {boolean}
     */
    isValid: function () {
        var value = this.getValue();
        return !!this.getName() && !!this.getCollectApp() && !!this.getSection() && value !== null && value !== undefined;
    }
};

module.exports = Attribute;
