/**
 * @class InnoHelper
 * @static
 * Class provide methods to work with **Cloud**.
 *
 *     @example
 *     var inno = require('./inno-helper');
 *
 *     inno.setVars({
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
 *     inno.getSettings({
 *          vars: inno.getVars()
 *     }, function (error, settings) {
 *          // do something
 *     });
 *
 *     inno.setAttributes({
 *          vars: inno.getVars(),
 *          data: settings
 *     }, function (error) {
 *          // do something
 *     });
 *
 *     inno.getAttributes({
 *          vars: inno.getVars(),
 *     }, function (error, settings) {
 *          // do something
 *     });
 *
 */

'use strict';

var util = require('util'),
    request = require('request');

var innoHelper = {
    /**
     * Object with environment vars
     * @private
     * @type {Object}
     */
    vars: {},

    /**
     * Cache storage
     * @private
     * @type {Object}
     */
    cache: {},

    /**
     * Cache TTL
     * @private
     * @type {Number}
     */
    cachedTime: 10,

    /**
     * Form URL to web profile
     *
     *     @example
     *     http://api.innomdc.com/v1/companies/4/buckets/testbucket/profiles/vze0bxh4qpso67t2dxfc7u81a5nxvefc
     *
     * @param {Object} params
     * @returns {String}
     *
     */
    webProfileAppUrl: function (params) {
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
    profileAppUrl: function (params) {
        return util.format('%s?app_key=%s', this.webProfileAppUrl(params), params.appKey);
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
    settingsAppUrl: function (params) {
        return util.format('%s/v1/companies/%s/buckets/%s/apps/%s/custom?app_key=%s', this.vars.apiUrl, params.groupId, params.bucketName, params.appName, params.appKey);
    },

    /**
     * Get data from cache by name if it's not expired
     * @private
     * @param {String} name
     * @returns {Mixed|undefined}
     */
    getCache: function (name) {
        var value;
        if (this.cachedTime) {
            if (this.cache.hasOwnProperty(name)) {
                if (this.cache[name].expired <= Date.now()) {
                    delete this.cache[name];
                } else {
                    value = this.cache[name].value;
                }
            }
        }
        return value;
    },

    /**
     * Set data to cache
     * @private
     * @param {String} name
     * @param {Mixed} value
     * @returns {undefined}
     */
    setCache: function (name, value) {
        if (this.cachedTime) {
            this.cache[name] = {
                expired: Date.now() + (this.cachedTime * 1000),
                value: value || true
            };
        }
    },

    /**
     * Expire record in cache by name
     * @private
     * @param {String} name
     * @returns {undefined}
     */
    expireCache: function (name) {
        if (this.cache.hasOwnProperty(name)) {
            this.cache[name].expired = 0;
        }
    },

    /**
     * Clear all cache records
     * @private
     * @returns {undefined}
     */
    clearCache: function () {
        this.cache = {};
    },

    /**
     * Change cache TTL
     * @private
     * @param {Number} time
     * @returns {undefined}
     */
    setCachedTime: function (time) {
        this.cachedTime = time;
    },

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
        return this.vars;
    },

    /**
     * Set environment vars
     * @param {Object} obj
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
     * Parse start session data
     *
     *     @example
     *     {
     *          profile: { 
     *              id: 'omrd9lsa70bqukicsctlcvcu97xwehgm',
     *              version: '1.0',
     *              sessions: [ [Object] ],
     *              attributes: [],
     *              mergedProfiles: []
     *          },
     *          session: {
     *              id: 'tfd6i7rhrc',
     *              collectApp: 'web',
     *              section: 'wqwq',
     *              data: {
     *                  countryCode: 0,
     *                  countryName: 'Russian Federation',
     *                  region: '61',
     *                  city: 'Rostov-on-don',
     *                  postalCode: null,
     *                  latitude: 47.231293,
     *                  longitude: 39.723297,
     *                  dmaCode: 0,
     *                  areaCode: 0,
     *                  metroCode: 0
     *              },
     *              events: [ [Object] ]
     *          },
     *          event: {
     *              id: 'eacz6dfn1',
     *              createdAt: 1419328309439,
     *              definitionId: 'qwqw',
     *              data: { 
     *                  'page-url': 'http://thejackalofjavascript.com/getting-started-with-node-webkit-apps/' 
     *              }
     *          },
     *          data: {
     *              'page-url': 'http://thejackalofjavascript.com/getting-started-with-node-webkit-apps/'
     *          }
     *      }
     *
     * @param {Object} req
     * @param {Function} callback
     * @returns {Mixed}
     */
    getDatas: function (req, callback) {
        var error,
            datas;

        try {
            datas = this.parseStreamData(req.body);
            this.setVar('profileId', datas.profile.id);
            this.setVar('collectApp', datas.session.collectApp);
            this.setVar('section', datas.session.section);
        } catch (e) {
            error = e;
        }

        return callback(error, datas);
    },

    /**
     *
     * @param {Mixed} rawData
     * @return {Object}
     */
    parseStreamData: function (rawData) {
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
    getSettings: function (params, callback) {
        var self = this,
            allowCache,
            cachedValue,
            url,
            vars;

        if (arguments.length < 2) {
            callback = params;
            params = {};
        }
        vars = this.mergeVars(this.getVars(), params || {});
        allowCache = !vars.noCache;

        if (allowCache) {
            cachedValue = this.getCache('settings' + vars.appName);
        }

        if (typeof cachedValue !== 'undefined') {
            callback(null, cachedValue);
        } else {
            url = this.settingsAppUrl({
                groupId:    vars.groupId,
                bucketName: vars.bucketName,
                appName:    vars.appName,
                appKey:     vars.appKey
            });

            request.get(url, function (error, response) {
                var body,
                    settings;

                if (!error) {
                    try {
                        body = JSON.parse(response.body);
                    } catch (e) {
                        error = new Error('Parse JSON settings (' + url + ')');
                    }
                }

                if (!error && (!body || !body.hasOwnProperty('custom'))) {
                    error = new Error('Custom not found');
                }

                if (!error) {
                    settings = body.custom;
                    if (allowCache) {
                        self.setCache('settings' + vars.appName, settings);
                    }
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
    setSettings: function (settings, params, callback) {
        var self = this,
            url,
            vars;

        if (arguments.length < 3) {
            callback = params;
            params = {};
        }

        vars = this.mergeVars(this.getVars(), params || {});

        url = this.settingsAppUrl({
            groupId:    vars.groupId,
            bucketName: vars.bucketName,
            appName:    vars.appName,
            appKey:     vars.appKey
        });

        request.put({
            url: url,
            body: settings,
            json: true
        }, function (error) {
            if (!error) {
                self.expireCache('settings' + vars.appName);
            }
            callback(error);
        });
    },

    /**
     * Update attributes of the profile
     * @param {Object} attributes
     * @param {Object} [params]
     * @param {Function} callback
     * @returns {undefined}
     */
    setAttributes: function (attributes, params, callback) {
        var self = this,
            url,
            vars;

        if (arguments.length < 3) {
            callback = params;
            params = {};
        }

        vars = this.mergeVars(this.getVars(), params || {});

        url = this.profileAppUrl({
            groupId:    vars.groupId,
            bucketName: vars.bucketName,
            profileId:  vars.profileId,
            appKey:     vars.appKey
        });

        request.post({
            url: url,
            body: {
                id: vars.profileId,
                attributes: [{
                    collectApp: vars.collectApp,
                    section:    vars.section,
                    data:       attributes
                }]
            },
            json: true
        }, function (error) {
            if (!error) {
                self.expireCache('attributes' + vars.profileId);
            }
            callback(error);
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
    getAttributes: function (params, callback) {
        var self = this,
            allowCache,
            cachedValue,
            url,
            vars;

        if (arguments.length < 2) {
            callback = params;
            params = {};
        }
        vars = this.mergeVars(this.getVars(), params || {});
        allowCache = !vars.noCache;

        if (allowCache) {
            cachedValue = this.getCache('attributes' + vars.profileId);
        }

        if (typeof cachedValue !== 'undefined') {
           callback(null, cachedValue);
        } else {
            url = this.profileAppUrl({
                groupId:    vars.groupId,
                bucketName: vars.bucketName,
                profileId:  vars.profileId,
                appKey:     vars.appKey
            });

            request.get(url, function (error, response) {
                var body,
                    profile,
                    attributes;

                if (!error) {
                    try {
                        body = JSON.parse(response.body);
                    } catch (e) {
                        error = new Error('Parse JSON profile (' + url + ')');
                    }
                }

                if (!error) {
                    profile = body.profile;
                    if (!profile) {
                        error = new Error('Profile not found');
                    }
                }

                if (!error) {
                    attributes = [];
                    if (profile.attributes &&
                        profile.attributes.length) {
                        attributes = profile.attributes;
                    }
                    if (allowCache) {
                        self.setCache('attributes' + vars.profileId, attributes);
                    }
                }

                callback(error, attributes);
            });
        }
    }

};

module.exports = innoHelper;