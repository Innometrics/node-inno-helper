'use strict';

/**
 *
 * @param {Object} config
 * config equals to {collectApp: web, section: sec, name: name, value: val}
 * @constructor
 */
var Attribute = function (config) {
    
    config = config || {};

    ['name', 'value', 'section', 'collectApp'].forEach(function (property) {
        if (property in config) {
            this[property] = config[property];
        }
    }, this);
};

Attribute.prototype = {

    /**
     * Attribute name
     * @type {String}
     */
    name: null,

    /**
     * Attribute application name
     * @type {String}
     */
    collectApp: null,

    /**
     * Attribute section name
     * @type {String}
     */
    section: null,

    /**
     * Attribute value
     * @type {*}
     */
    value: null,
    
    /**
     * Set attribute name
     * @param {String} name
     * @returns {Attribute}
     */
    setName: function (name) {
        this.name = name;
        return this;
    },

    /**
     * Set attribute application name
     * @param {String} collectApp
     * @returns {Attribute}
     */
    setCollectApp: function (collectApp) {
        this.collectApp = collectApp;
        return this;
    },


    /**
     * Set attribute section name
     * @param {String} section
     * @returns {Attribute}
     */
    setSection: function (section) {
        this.section = section;
        return this;
    },

    /**
     * Set attribute value
     * @param {*} value
     * @returns {Attribute}
     */
    setValue: function (value) {
        this.value = value;
        return this;
    },

    /**
     * Get attribute name
     * @returns {String}
     */
    getName: function () {
        return this.name;
    },

    /**
     * Get attribute application name
     * @returns {String}
     */
    getCollectApp: function () {
        return this.collectApp;
    },

    /**
     * Get attribute section name
     * @returns {String}
     */
    getSection: function () {
        return this.section;
    },

    /**
     * Get attribute value
     * @returns {*}
     */
    getValue: function () {
        return this.value;
    },

    /**
     * Check if attribute is valid (all required fields are present)
     * @returns {boolean}
     */
    isValid: function () {
        var value = this.getValue();
        return !!(this.getName() && this.getCollectApp() && this.getSection() && value !== null && value !== undefined);
    }
};

module.exports = Attribute;
