/**
 * @class InnoHelper
 * @static
 * Class provide methods to work with **Cloud**.
 */

'use strict';

var util = require('util'),
    request = require('request'),
    cache = require('./libs/cache');


var InnoHelper = function(config) {

    var error = this.validateObject(config, ['bucketName','appKey','apiUrl','appName','groupId']);

    if (error) {
        throw error;
    }

    this.config = config;

};

InnoHelper.prototype = {

    /**
     * Config with environment vars
     * @private
     * @type {Object}
     */
    config: {},

    /**
     *
     * @param {Mixed} rawData
     * @return {Object}
     */
    getProfile: function (data, callback) {

        var result = null,
            profile,
            session,
            error = null;

        try {

            try {
                if (typeof data !== 'object') {
                    data = JSON.parse(data);
                }
            } catch (e) {
                throw new Error('Wrong stream data');
            }

            profile = data.profile;

            if (!profile) {
                throw new Error('Profile not found');
            }

            if (!profile.id) {
                throw new Error('Profile id not found');
            }

            if (!(profile.sessions && profile.sessions.length)) {
                throw new Error('Session not found');
            }

            session = profile.sessions[0];

            if (!session.collectApp) {
                throw new Error('CollectApp not found');
            }

            if (!session.section) {
                throw new Error('Section not found');
            }

            if (!(session.events && session.events.length && session.events[0].data)) {
                throw new Error('Data not set');
            }

            result = {
                profile:    profile,
                session:    session,
                event:      session.events[0],
                data:       session.events[0].data
            };

        } catch (e) {
            error = e;
        }

        callback(error, result);
    },


    /**
     * Update attributes of the profile
     * @param {Object} attributes
     * @param {Object} [params]
     * @param {Function} callback
     * @returns {undefined}
     */
    setProfileAttributes: function (params, callback) {
        var self  = this,
            error = null;

        if (arguments.length < 2) {
            callback = params;
            params = {};
        }
        
        error = this.validateObject(params, ['profileId', 'section', 'attributes']);
        if (error) {
            callback(error, null);
            return;
        }

        var opts = {
            url: this.getProfileUrl(params.profileId),
            body: {
                id: params.profileId,
                attributes: [{
                    section:    params.section,
                    data:       params.attributes
                }]
            },
            json: true
        };

        request.post(opts, function (error, response) {

            var profile    = null, 
                attributes = null;

            error = self.checkErrors(error, response);

            if (!error) {
                profile = response.body.profile || null;
                attributes = Array.isArray(profile.attributes) ? profile.attributes : [];
                cache.expire('attributes' + params.profileId);
            }

            if (typeof callback === 'function'){
                callback(error, attributes);
            }
        });
    },

    /**
     * Get attributes of the profile
     *
     *     Example of returning **attributes** object:
     *
     *     @example
     *     {
     *          collectApp: 'aaa',
     *          section: 'wqwq',
     *          data: {
     *              option1: 'abc',
     *              option2: 123
     *              option3: ['abc', 123]
     *          },
     *          modifiedAt: 1422271791719
     *     }
     *
     * @param {Object} [params]
     * @param {Function} callback
     * @returns {undefined}
     */
    getProfileAttributes: function (params, callback) {
        var self  = this,
            error = null,
            allowCache,
            cachedValue;

        var filterAttributes = function(attributes) {
            return attributes.filter(function(attr) {
                if (params.collectApp && params.collectApp !== attr.collectApp) { return false; }
                if (params.section    && params.section    !== attr.section)    { return false; }
                if (params.attribute  && !attr.data[params.attribute])          { return false; }
                return true;
            });
        };

        if (arguments.length < 2) {
            callback = params;
            params = {};
        }

        error = this.validateObject(params, ['profileId']);
        if (error) {
            callback(error, null);
            return;
        }
        
        allowCache = !this.config.noCache;
        if (allowCache) {
            cachedValue = cache.get('attributes' + params.profileId);
            if (typeof cachedValue !== 'undefined') {
               callback(null, filterAttributes(cachedValue));
               return;
            }
        }

        var opts = {
            url: this.getProfileUrl(params.profileId),
            json: true
        };

        request.get(opts, function (error, response) {

            var profile    = null,
                attributes = null;

            error = self.checkErrors(error, response);

            if (!error) {
                error = self.validateObject(response.body, ['profile']);
            }

            if (!error) {
                profile = response.body.profile;
                attributes = Array.isArray(profile.attributes) ? profile.attributes : [];

                if (allowCache) {
                    cache.set('attributes' + params.profileId, attributes);
                }
            }

            if (typeof callback === 'function'){
                callback(error, filterAttributes(attributes));
            }
        });
    },

    /**
     * Set settings application
     * @param {Object} settings
     * @param {Object} [params]
     * @param {Function} callback
     * @returns {undefined}
     */
    setAppSettings: function (settings, callback) {
        var self  = this,
            error = null;

        if (!settings) {
            error = new Error('Settings not found');
            callback(error, null);
            return;
        }

        var opts = {
            url: this.getAppSettingsUrl(),
            body: settings,
            json: true
        };

        request.put(opts, function (error, response) {

            var settings = null;
            error = self.checkErrors(error, response);

            if (!error) {
                error = self.validateObject(response.body, 'custom');
            }

            if (!error) {
                settings = response.body.custom;
                cache.expire('settings' + self.config.appName);
            }
            
            if (typeof callback === 'function'){
                callback(error, settings);
            }

        });
    },

    /**
     * Get settings application
     *
     *     Example of returning **app settings** object:
     *
     *     @example
     *     {
     *          option1: 'abc',
     *          option2: 123
     *          option3: ['abc', 123]
     *     }
     *
     * @param {Object} [params]
     * @param {Function} callback
     * @returns {undefined}
     */
    getAppSettings: function (callback) {
        var self = this,
            cachedValue,
            allowCache;


        allowCache = !this.config.noCache;

        if (!allowCache) {
            cachedValue = cache.get('settings' + this.config.appName);
            if (typeof cachedValue !== 'undefined') {
                callback(null, cachedValue);
                return;
            }
        }

        var opts = {
            url: this.getAppSettingsUrl(),
            json: true
        };

        request.get(opts, function (error, response) {

            var settings = null;
            error = self.checkErrors(error, response);

            if (!error) {
                error = self.validateObject(response.body, 'custom');
            }

            if (!error) {
                settings = response.body.custom;
                if (allowCache) {
                    cache.set('settings' + this.config.appName, settings);
                }
            }
            
            if (typeof callback === 'function'){
                callback(error, settings);
            }

        });

    },

    /**
     * Checks server response for common errors
     * @private
     * @param  {[Object]} error    Server error argumnt
     * @param  {[Object]} response Server response
     * @return {[Object]}          Error object or null
     */
    checkErrors: function(error, response) {

        if (error) {
            return error;
        } else {
            if (!response || !response.body) {
                return new Error('Response does not contain data');
            }
            if (response.statusCode !== 200) {
                error = new Error(response.body.message);
                error.name = 'Server failed with status code ' + response.statusCode;
                return error;
            } 
        }
        return null;
    },

    validateObject: function(obj, fields) {
        var error = null;
        if (!obj){
            error = new Error('Object is not defined');
        } else {
            try {
                fields = Array.isArray(fields) ? fields : [fields];
                fields.forEach(function(key) {
                    if (!obj[key]) {
                        throw new Error(key.toUpperCase() + ' not found');
                    }
                });
            } catch (e) {
                error = e;
            }
        }

        return error;
    },

    /**
     * Form URL to web profiles using App key
     *
     *     @example
     *     http://api.innomdc.com/v1/companies/4/buckets/testbucket/profiles/vze0bxh4qpso67t2dxfc7u81a5nxvefc?app_key=8HJ3hnaxErdJJ62H
     *
     * @param {Object} params
     * @returns {String}
     */
    getProfileUrl: function (profileId) {
        return util.format('%s/v1/companies/%s/buckets/%s/profiles/%s?app_key=%s', 
            this.config.apiUrl, 
            this.config.groupId, 
            this.config.bucketName, 
            profileId, 
            this.config.appKey);
    },

    /**
     * Form URL to app settings
     *
     *     @example
     *     http://api.innomdc.com/v1/companies/4/buckets/testbucket/apps/testapp/custom?app_key=8HJ3hnaxErdJJ62H
     *
     * @param {Object} params
     * @returns {String}
     */
    getAppSettingsUrl: function () {
        return util.format('%s/v1/companies/%s/buckets/%s/apps/%s/custom?app_key=%s',
            this.config.apiUrl,
            this.config.groupId,
            this.config.bucketName,
            this.config.appName,
            this.config.appKey);
    }

};

module.exports = InnoHelper;