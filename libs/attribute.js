'use strict';
var validator = require('./validator/index');

/**
 *
 * @param {Object} config
 * config equals to {collectApp: web, section: sec, name: name, value: val}
 * @constructor
 */
var Attribute = function (config) {
    config = config || {};

    this.setName(config.name);
    this.setValue(config.value);
    this.setCollectApp(config.collectApp);
    this.setSection(config.section);
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
     * Flag that something was changed in attribute
     * @type {Boolean}
     * @private
     */
    changed: false,

    /**
     * Set attribute name
     * @param {String} name
     * @returns {Attribute}
     */
    setName: function (name) {
        this.name = name;
        this.setChanged(true);
        return this;
    },

    /**
     * Set attribute application name
     * @param {String} collectApp
     * @returns {Attribute}
     */
    setCollectApp: function (collectApp) {
        this.collectApp = collectApp;
        this.setChanged(true);
        return this;
    },


    /**
     * Set attribute section name
     * @param {String} section
     * @returns {Attribute}
     */
    setSection: function (section) {
        this.section = section;
        this.setChanged(true);
        return this;
    },

    /**
     * Set attribute value
     * @param {*} value
     * @returns {Attribute}
     */
    setValue: function (value) {
        this.value = value;
        this.setChanged(true);
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
        return this.validateName() &&
            this.validateValue() &&
            validator.attributeIsValid(this.serialize());
    },

    /**
     * Convert attribute to JSON
     * @return {Object}
     */
    serialize: function () {
        var attribute = {
            collectApp: this.getCollectApp(),
            section:    this.getSection(),
            data:       {}
        };
        attribute.data[this.getName()] = this.getValue();
        return attribute;
    },

    /**
     * Checks name, throws exception if invalid
     * @protected
     */
    validateName: function () {
        return !!this.getName();
    },

    /**
     * Checks name, throws exception if invalid
     * @protected
     */
    validateValue: function () {
        var value = this.getValue();
        return !(value === null || value === undefined);
    },

    /**
     * Set "changed" status
     * @param {Boolean} changed
     * @returns {Attribute}
     * @protected
     */
    setChanged: function (changed) {
        this.changed = changed;
        return this;
    },

    /**
     *
     * @returns {Attribute}
     */
    resetChanged: function () {
        this.changed = false;
        return this;
    },

    /**
     * Check if attribute has any changes
     * @returns {Boolean}
     */
    hasChanges: function () {
        return !!this.changed;
    }

};

module.exports = Attribute;
