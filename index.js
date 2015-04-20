/**
 * @class InnoHelper
 * @static
 * Class provide methods to work with **Cloud**.
 *
 *     @example
 *     var InnoHelper = require('./inno-helper');
 *
 *     var inno = new InnoHelper(
 *         var1: 'value1',
 *         var2: 'value2'
 *     });
 *
 *     inno.setVar('varName', process.env.VAR_NAME);
 *
 *     app.post('/', function (req, res) {
 *          inno.getDatas(req, function (error, data) {
 *              // do something
 *          });
 *     });
 *
 *     inno.getAppSettings({
 *          vars: inno.getVars()
 *     }, function (error, settings) {
 *          // do something
 *     });
 *
 *     inno.setProfileAttributes({
 *          vars: inno.getVars(),
 *          data: settings
 *     }, function (error) {
 *          // do something
 *     });
 *
 *     inno.getProfileAttributes({
 *          vars: inno.getVars(),
 *     }, function (error, settings) {
 *          // do something
 *     });
 *
 */

'use strict';

var util = require('util'),
    request = require('request'),
    cache = require('./libs/cache');


var InnoHelper = function(config) {
    this.vars = config;
};

InnoHelper.prototype = {
    /**
     * Object with environment vars
     * @private
     * @type {Object}
     */
    vars: {},

    /**
     * Merge objects
     * @private
     * @param {Object} main
     * @param {Object} overrides
     * @returns {Object}
     */
    mergeVars: function (main, overrides) {
        var keys = [].concat(Object.keys(main), Object.keys(overrides)),
            vars = {};

        keys.forEach(function (key) {
            if (!vars.hasOwnProperty(key)) {
                vars[key] = overrides.hasOwnProperty(key) ? overrides[key] : main[key];
            }
        });

        return vars;
    },

    /**
     * Get environment vars
     *
     *     @example
     *     {
     *          bucketName: 'testbucket',
     *          appKey: '8HJ3hnaxErdJJ62H',
     *          appName: 'testapp',
     *          groupId: '4',
     *          apiUrl: 'http://app.innomdc.com',
     *          collectApp: 'web',
     *          section: 'testsection',
     *          profileId: 'omrd9lsa70bqukicsctlcvcu97xwehgm'
     *      }
     *
     * @returns {Object}
     */
    getVars: function () {
        return this.vars || {};
    },

    /**
     * Set environment vars
     * @param {Object} objё
     * @returns {undefined}
     */
    setVars: function (obj) {
        this.vars = obj;
    },

    /**
     * Set environment var by name
     * @param {String} name
     * @param {Mixed} value
     * @returns {undefined}
     */
    setVar: function (name, value) {
        this.vars[name] = value;
    },

    /**
     *
     * @param {Mixed} rawData
     * @param {Function} callback
     * @return {Undefined}
     */
    getProfileStreamData: function (rawData, callback) {
        var error,
            data;

        try {
            data = this.parseProfileStreamData(rawData);
            this.setVar('profileId', data.id);
            this.setVar('collectApp', data.session.collectApp);
            this.setVar('section', data.session.section);
        } catch (e) {
            error = e;
        }
        return callback(error, data);
    },

    /**
     *
     * @param {Mixed} rawData
     * @return {Object}
     */
    parseProfileStreamData: function (rawData) {
        var data = rawData,
            profile,
            session;

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

        data = {
            profile:    profile,
            session:    session,
            event:      session.events[0],
            data:       session.events[0].data
        };

        return data;
    },


    /**
     * Update attributes of the profile
     * @param {Object} attributes
     * @param {Object} [params]
     * @param {Function} callback
     * @returns {undefined}
     */
    setProfileAttributes: function (attributes, params, callback) {
        var self = this,
            vars;

        if (arguments.length < 3) {
            callback = params;
            params = {};
        }

        vars = this.mergeVars(this.getVars(), params || {});

        var opts = {
            url: this.getProfileUrl(vars),
            body: {
                id: vars.profileId,
                attributes: [{
                    collectApp: vars.collectApp,
                    section:    vars.section,
                    data:       attributes
                }]
            },
            json: true
        };

        request.post(opts, function (error, response) {

            var profile;

            error = self.checkErrors(error, response);

            if (!error) {
                profile = response.body.profile || null;
                cache.expire('attributes' + vars.profileId);
            }

            callback(error, profile);
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
        var self = this,
            allowCache,
            cachedValue,
            vars;

        if (arguments.length < 2) {
            callback = params;
            params = {};
        }

        vars = this.mergeVars(this.getVars(), params || {});
        
        allowCache = !vars.noCache;
        if (allowCache) {
            cachedValue = cache.get('attributes' + vars.profileId);
        }

        if (typeof cachedValue !== 'undefined') {
           callback(null, cachedValue);
        } else {

            var opts = {
                url: this.getProfileUrl(vars),
                json: true
            };

            request.get(opts, function (error, response) {

                var profile    = null,
                    attributes = null;

                error = self.checkErrors(error, response);

                if (!error && !response.body.hasOwnProperty('profile')) {
                    error = new Error('Profile not found');
                }

                if (!error) {
                    profile = response.body.profile;
                    attributes = Array.isArray(profile.attributes) ? profile.attributes : [];

                    if (allowCache) {
                        cache.set('attributes' + vars.profileId, attributes);
                    }
                }

                callback(error, profile);
            });
        }
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
    getAppSettings: function (params, callback) {
        var self = this,
            cachedValue, 
            vars;

        if (arguments.length < 2) {
            callback = params;
            params = {};
        }

        vars = this.mergeVars(this.getVars(), params || {});

        if (!vars.noCache) {
            cachedValue = cache.get('settings' + vars.appName);
        }

        if (typeof cachedValue !== 'undefined') {
            callback(null, cachedValue);
        } else {

            var opts = {
                url: this.getAppSettingsUrl(vars),
                json: true
            };

            request.get(opts, function (error, response) {

                var settings = null;
                error = self.checkErrors(error, response);

                if (!error && !response.body.hasOwnProperty('custom')) {
                    error = new Error('Settings not found');
                }

                if (!error) {
                    settings = response.body.custom;
                }
                
                callback(error, settings);

            });
        }
    },

    /**
     * Set settings application
     * @param {Object} settings
     * @param {Object} [params]
     * @param {Function} callback
     * @returns {undefined}
     */
    setAppSettings: function (settings, params, callback) {
        var self = this,
            vars;

        if (arguments.length < 3) {
            callback = params;
            params = {};
        }

        vars = this.mergeVars(this.getVars(), params || {});

        var opts = {
            url: this.getAppSettingsUrl(vars),
            body: settings,
            json: true
        };

        request.put(opts, function (error, response) {

            var settings = null;
            error = self.checkErrors(error, response);

            if (!error && !response.body.hasOwnProperty('custom')) {
                error = new Error('Settings not found');
            }

            if (!error) {
                settings = response.body.custom;
                cache.expire('settings' + vars.appName);
            }
            
            callback(error, settings);

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
            // if (!response){
            //     return null;
            // }
            if (!response.body) {
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

    /**
     * Form URL to web profile
     *
     *     @example
     *     http://api.innomdc.com/v1/companies/4/buckets/testbucket/profiles/vze0bxh4qpso67t2dxfc7u81a5nxvefc
     *
     * @param {Object} params
     * @returns {String}
     */
    profileUrl: function (params) {
        return util.format('%s/v1/companies/%s/buckets/%s/profiles/%s', this.vars.apiUrl, params.groupId, params.bucketName, params.profileId);
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
    getProfileUrl: function (params) {
        return util.format('%s?app_key=%s', this.profileUrl(params), params.appKey);
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
    getAppSettingsUrl: function (params) {
        return util.format('%s/v1/companies/%s/buckets/%s/apps/%s/custom?app_key=%s', this.vars.apiUrl, params.groupId, params.bucketName, params.appName, params.appKey);
    }

};

module.exports = InnoHelper;