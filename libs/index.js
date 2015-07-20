'use strict';

var request = require('request');
var Profile = require('./profile');
var Segment = require('./segment');
var util = require('util');
var querystring = require('querystring');

/**
 *
 * @param {Object} config
 * @constructor
 */
var InnoHelper = function (config) {
    this.validateConfig(config);
    this.groupId = config.groupId;
    this.apiUrl = config.apiUrl;
    this.bucketName = config.bucketName;
    this.appName = config.appName;
    this.appKey = config.appKey;
};

InnoHelper.prototype = {

    /**
     * @type {String}
     */
    bucketName: null,

    /**
     * @type {String}
     */
    appName: null,

    /**
     * @type {Number|String}
     */
    groupId: null,

    /**
     * @type {String}
     */
    appKey: null,

    /**
     * @type: {String}
     */
    apiUrl: null,

    /**
     * Checks if config is valid
     * @param {Object} config
     */
    validateConfig: function (config) {
        if (!config) {
            throw new Error('Config should be defined');
        }

        if (typeof config !== 'object') {
            throw new Error('Config should be an object');
        }

        ['bucketName', 'appName', 'appKey', 'apiUrl'].forEach(function (field) {
            if (!(field in config)) {
                throw new Error('Property "' + field + '" in config should be defined');
            }
            if (typeof config[field] !== 'string') {
                throw new Error('Property "' + field + '" in config should be a string');
            }
            if (!config[field].trim()) {
                throw new Error('Property "' + field + '" in config can not be empty');
            }
        });

        if (!('groupId' in config)) {
            throw new Error('Property "groupId" in config should be defined');
        }
        if (['string', 'number'].indexOf(typeof config.groupId) === -1) {
            throw new Error('Property "groupId" in config should be a string or a number');
        }
        if (!String(config.groupId).trim()) {
            throw new Error('Property "groupId" in config can not be empty');
        }
    },

    /**
     *
     * @param {String} profileId
     * @returns {String}
     */
    getProfileUrl: function (profileId) {
        return util.format('%s/v1/companies/%s/buckets/%s/profiles/%s?app_key=%s',
            this.getApiHost(),
            this.getCompany(),
            this.getBucket(),
            profileId,
            this.getAppKey());
    },

    /**
     * @returns {String}
     */
    getAppSettingsUrl: function () {
        return util.format('%s/v1/companies/%s/buckets/%s/apps/%s/custom?app_key=%s',
            this.getApiHost(),
            this.getCompany(),
            this.getBucket(),
            this.getCollectApp(),
            this.getAppKey());
    },

    /**
     * @returns {String}
     */
    getSegmentsUrl: function () {
        return util.format('%s/v1/companies/%s/buckets/%s/segments?app_key=%s',
            this.getApiHost(),
            this.getCompany(),
            this.getBucket(),
            this.getAppKey());
    },

    /**
     *
     * @param {Object} params
     * @returns {String}
     */
    getSegmentEvaluationUrl: function (params) {
        return util.format('%s/v1/companies/%s/buckets/%s/segment-evaluation?app_key=%s&%s',
            this.getApiHost(),
            this.getCompany(),
            this.getBucket(),
            this.getAppKey(),
            querystring.stringify(params));
    },

    /**
     *
     * @param obj
     * @param fields
     * @returns {*}
     */
    validateObject: function (obj, fields) {
        var error = null;
        if (typeof obj !== 'object') {
            error = new Error('Object is not defined');
        } else {
            try {
                fields = Array.isArray(fields) ? fields : [fields];
                fields.forEach(function (key) {
                    if (!(key in obj)) {
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
     *
     * @param {Error}error
     * @param {Object} response
     * @param {Number} successCode
     * @returns {Error|null}
     */
    checkErrors: function (error, response, successCode) {
        successCode = successCode || 200;
        
        if (error) {
            return error;
        }

        if (!response || !response.body) {
            return new Error('Response does not contain data');
        }

        if (response.statusCode !== successCode) {
            error = new Error(response.body.message);
            error.name = 'Server failed with status code ' + response.statusCode;
            return error;
        }

        return null;
    },

    /**
     *
     * @returns {String}
     */
    getCollectApp: function () {
        return this.appName;
    },

    /**
     *
     * @returns {String}
     */
    getBucket: function () {
        return this.bucketName;
    },

    /**
     *
     * @returns {Number|String}
     */
    getCompany: function () {
        return this.groupId;
    },

    /**
     *
     * @returns {String}
     */
    getAppKey: function () {
        return this.appKey;
    },

    /**
     *
     * @returns {String}
     */
    getApiHost: function () {
        return this.apiUrl;
    },

    /**
     *
     * @param {Object} settings
     * @param {Function} callback
     */
    setAppSettings: function (settings, callback) {
        var self = this,
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
            }

            if (typeof callback === 'function') {
                callback(error, settings);
            }

        });
    },

    /**
     *
     * @param {Function} callback
     */
    getAppSettings: function (callback) {
        var self = this;
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
            }

            if (typeof callback === 'function') {
                callback(error, settings);
            }

        });
    },

    /**
     *
     * @param {Function} callback
     */
    getSegments: function (callback) {
        var self = this;
        var opts = {
            url: this.getSegmentsUrl(),
            json: true
        };

        request.get(opts, function (error, response) {

            var data = null;
            var segments = [];
            
            error = self.checkErrors(error, response);

            if (!error) {
                data = response.body;
                data = util.isArray(data) ? data : [];
                data.forEach(function (sgmData) {
                    var sgmInstance = null;
                    if (sgmData.hasOwnProperty('segment') && typeof sgmData.segment === 'object') {
                        sgmInstance = new Segment(sgmData.segment);
                        segments.push(sgmInstance);
                    }
                });
            }

            if (typeof callback === 'function') {
                callback(error, segments);
            }

        });
    },

    /**
     *
     * @param {Profile} profile
     * @param {Segment} segment
     * @param {Function} callback
     */
    evaluateProfileBySegment: function (profile, segment, callback) {
        var error = null;
        var result = null;
        if (!(segment instanceof Segment)) {
            error = new Error('Argument "segment" should be a Segment instance');
            if (typeof callback === 'function') {
                callback(error, result);
            }
            return;
        }
        
        this.evaluateProfileBySegmentId(profile, segment.getId(), callback);
    },

    /**
     *
     * @param {Profile} profile
     * @param {String} segmentId
     * @param {Function} callback
     */
    evaluateProfileBySegmentId: function (profile, segmentId, callback) {
        this._evaluateProfileByParams(profile, {
            segment_id: segmentId
        }, callback);
    },

    /**
     *
     * @param {Profile} profile
     * @param {String} iql
     * @param {Function} callback
     */
    evaluateProfileByIql: function (profile, iql, callback) {
        this._evaluateProfileByParams(profile, {
            iql: iql
        }, callback);
    },

    /**
     *
     * @param {Profile} profile
     * @param {Object} params
     * @param {Function} callback
     * @private
     */
    _evaluateProfileByParams: function (profile, params, callback) {
        var self = this;
        var error = null;
        var result = null;
        
        if (!(profile instanceof Profile)) {
            error = new Error('Argument "profile" should be a Profile instance');
            if (typeof callback === 'function') {
                callback(error, result);
            }
            return;
        }
        
        var defParams = {
            profile_id: profile.getId()
        };
        
        params = util._extend(params, defParams);
        
        var opts = {
            url: this.getSegmentEvaluationUrl(params),
            json: true
        };

        request.get(opts, function (error, response) {

            var data = null;
            
            error = self.checkErrors(error, response);

            if (!error) {
                data = response.body;
                if (data.hasOwnProperty('segmentEvaluation') && data.segmentEvaluation.hasOwnProperty('result')) {
                    result = data.segmentEvaluation.result;
                }
            }

            if (typeof callback === 'function') {
                callback(error, result);
            }

        });
    },

    // profile Cloud API

    /**
     *
     * @param {String} profileId
     * @param {Function} callback
     */
    loadProfile: function (profileId, callback) {
        var self = this;
        var opts = {
            url: this.getProfileUrl(profileId),
            json: true
        };

        request.get(opts, function (error, response) {

            var data = null;
            var profile = null;
            
            error = self.checkErrors(error, response);

            if (!error) {
                data = response.body;
                if (data.hasOwnProperty('profile') && typeof data.profile === 'object') {
                    profile = new Profile(data.profile);
                }
            }

            if (typeof callback === 'function') {
                callback(error, profile);
            }

        });
    },

    /**
     *
     * @param {String} profileId
     * @param {Function} callback
     */
    deleteProfile: function (profileId, callback) {
        var opts = {
            url: this.getProfileUrl(profileId),
            json: true
        };

        request.del(opts, function (error, response) {
            if (!error) {
                if (response.statusCode !== 204) {
                    error = new Error(response.body ? response.body.message : '');
                    error.name = 'Server failed with status code ' + response.statusCode;
                }
            }
            
            if (typeof callback === 'function') {
                callback(error);
            }

        });
    },

    /**
     *
     * @param {Profile} profile
     * @param {Function} callback
     */
    saveProfile: function (profile, callback) {
        var error = null;
        var result = null;
        
        if (!(profile instanceof Profile)) {
            error = new Error('Argument "profile" should be a Profile instance');
            if (typeof callback === 'function') {
                callback(error, result);
            }
            return;
        }
        
        var profileId = profile.getId();
        var opts = {
            url: this.getProfileUrl(profileId),
            json: true
        };

        request.get(opts, function (error, response) {
            var data = response.body || {};
            if (error) {
                if (typeof callback === 'function') {
                    callback(error, profile);
                }
                return;
            }
            
            var profileNotFound = response.statusCode === 404;
            var successCode = profileNotFound ? 201 : 200;
            var wrongResponse = response.statusCode !== 200;
            
            if (wrongResponse && !profileNotFound) {
                error = new Error(data ? data.message : '');
                error.name = 'Server failed with status code ' + response.statusCode;

                if (typeof callback === 'function') {
                    callback(error, profile);
                }
                return;
            }
            
            // transform profile data object
            opts.body = profile.serialize();

            request.post(opts, function (error, response) {

                var data = response.body || {};
                if (!error) {
                    if (response.statusCode !== successCode) {
                        error = new Error(data ? data.message : '');
                        error.name = 'Server failed with status code ' + response.statusCode;
                    }
                }

                if (typeof callback === 'function') {
                    if (data.hasOwnProperty('profile') && typeof data.profile === 'object') {
                        profile = new Profile(data.profile);
                    }
                    callback(error, profile);
                }

            });
        });
    },

    /**
     *
     * @param {Profile} profile1
     * @param {Profile} profile2
     * @param {Function} callback
     */
    mergeProfiles: function (profile1, profile2, callback) {
        var error = null;
        var result = null;
        
        if (!(profile1 instanceof Profile)) {
            error = new Error('Argument "profile1" should be a Profile instance');
        }
        
        if (!(profile2 instanceof Profile)) {
            error = new Error('Argument "profile2" should be a Profile instance');
        }
        
        if (error) {
            if (typeof callback === 'function') {
                callback(error, result);
            }
            return;
        }
        
        var profileId = profile1.getId();
        var opts = {
            url: this.getProfileUrl(profileId),
            body: {
                id: profileId,
                mergedProfiles: [
                    profile2.getId()
                ]
            },
            json: true
        };
        
        request.post(opts, function (error, response) {

            var data = response.body || {};
            var code = response.statusCode;
            var profile = null;
            
            if (!error) {
                if (!(code === 200 || code === 201)) {
                    error = new Error(data ? data.message : '');
                    error.name = 'Server failed with status code ' + response.statusCode;
                }
            }

            if (typeof callback === 'function') {
                if (data.hasOwnProperty('profile') && typeof data.profile === 'object') {
                    profile = new Profile(data.profile);
                }
                callback(error, profile);
            }

        });
    },

    // <InnoHelper> refreshLocalProfile(<Profile> profile, <function> callback(error, <Profile> profile))
    /**
     *
     * @param {Profile} profile
     * @param {Function} callback
     */
    refreshLocalProfile: function (profile, callback) {
        var error = null;
        var result = null;
        
        if (!(profile instanceof Profile)) {
            error = new Error('Argument "profile" should be a Profile instance');
            if (typeof callback === 'function') {
                callback(error, result);
            }
            return;
        }
        
        var profileId = profile.getId();

        this.loadProfile(profileId, function (error, loadedProfile) {
            if (!error) {
                profile.merge(loadedProfile);
            }
            
            if (typeof callback === 'function') {
                callback(error, profile);
            }
        });
    },

    /**
     *
     * @param {String} requestBody
     * @returns {Profile}
     */
    getProfileFromRequest: function (requestBody) {
        try {
            if (typeof requestBody !== 'object') {
                requestBody = JSON.parse(requestBody);
            }
        } catch (e) {
            throw new Error('Wrong stream data');
        }
        var profile = requestBody.profile;
        if (!profile) {
            throw new Error('Profile not found');
        }
        return new Profile(profile);
    },

    /**
     *
     * @param {String} requestBody
     * @returns {Object}
     */
    getMetaFromRequest: function (requestBody) {
        try {
            if (typeof requestBody !== 'object') {
                requestBody = JSON.parse(requestBody);
            }
        } catch (e) {
            throw new Error('Wrong stream data');
        }
        var meta = requestBody.meta;
        if (!meta) {
            throw new Error('Meta not found');
        }
        return meta;
    },

    /**
     *
     * @param {String} profileId
     * @returns {Profile}
     */
    createProfile: function (profileId) {
        return new Profile({
            id: profileId,
            version: '1.0',
            sessions: [],
            attributes: [],
            mergedProfiles: []
        });
    }
};

module.exports = InnoHelper;
