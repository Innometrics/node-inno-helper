'use strict';

// <Attribute> new Profile.Attribute({collectApp: web, section: sec, name: name, value: val})
var Attribute = function (config) {
    this.data = config;
};

Attribute.prototype = {
    data: null,
    
    // <Attribute> setName(<string> name)
    setName: function(name) {
        this.data.name = name;
        return this;
    },
    // <Attribute> setCollectApp(<string> collectApp)
    setCollectApp: function(collectApp) {
        this.data.collectApp = collectApp;
        return this;
    },
    // <Attribute> setSection(<string> section)
    setSection: function(section) {
        this.data.section = section;
        return this;
    },
    // <Attribute> setValue(<mixed> value)
    setValue: function(value) {
        this.data.value = value;
        return this;
    },
    // <string> getName()
    getName: function() {
        return this.data && this.data.name;
    },
    // <string> getCollectApp()
    getCollectApp: function() {
        return this.data && this.data.collectApp;
    },
    // <string> getSection()
    getSection: function() {
        return this.data && this.data.section;
    },
    // <mixed> getValue()
    getValue: function() {
        return this.data && this.data.value;
    },
    // <boolean> isValid()
    isValid: function() {
        return !!this.getName() && !!this.getCollectApp() && !!this.getSection() && !!this.getValue();
    }
};

module.exports = Attribute;