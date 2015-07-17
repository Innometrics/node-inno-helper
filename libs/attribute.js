'use strict';

/**
 *
 * @param {Object} config
 * config equals to {collectApp: web, section: sec, name: name, value: val}
 * @constructor
 */
var Attribute = function (config) {
    
    config = config || {};

    this.name = config.name || null;
    this.value = config.value;
    this.section = config.section || null;
    this.collectApp = config.collectApp || 'web';

};

Attribute.prototype = {

    /**
     *
     * @type {String}
     */
    name: null,

    /**
     *
     * @type {String}
     */
    collectApp: null,

    /**
     *
     * @type {String}
     */
    section: null,

    /**
     *
     * @type {mixed}
     */
    value: null,
    
    /**
     *
     * @param {String} name
     * @returns {Attribute}
     */
    setName: function (name) {
        this.name = name;
        return this;
    },

    /**
     *
     * @param {String} collectApp
     * @returns {Attribute}
     */
    setCollectApp: function (collectApp) {
        this.collectApp = collectApp;
        return this;
    },


    /**
     *
     * @param {String} section
     * @returns {Attribute}
     */
    setSection: function (section) {
        this.section = section;
        return this;
    },

    /**
     *
     * @param {*} value
     * @returns {Attribute}
     */
    setValue: function (value) {
        this.value = value;
        return this;
    },

    /**
     *
     * @returns {String|null}
     */
    getName: function () {
        return this.name || null;
    },

    /**
     *
     * @returns {String|null}
     */
    getCollectApp: function () {
        return this.collectApp || null;
    },

    /**
     *
     * @returns {String|null}
     */
    getSection: function () {
        return this.section || null;
    },

    /**
     *
     * @returns {mixed|null}
     */
    getValue: function () {
        return this.value;
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
