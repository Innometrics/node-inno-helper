'use strict';

var request = require('request');
var Profile = require('./profile');
var Segment = require('./segment');
var util = require('util');
var querystring = require('querystring');

// <InnoHelper> InnoHelper(<json> config)
var InnoHelper = function (config) {
    this.config = config;
};

InnoHelper.prototype = {
    config: null,

    getProfileUrl: function (profileId) {
        return util.format('%s/v1/companies/%s/buckets/%s/profiles/%s?app_key=%s',
            this.getApiHost(),
            this.getCompany(),
            this.getBucket(),
            profileId,
            this.getAppKey());
    },

    getAppSettingsUrl: function () {
        return util.format('%s/v1/companies/%s/buckets/%s/apps/%s/custom?app_key=%s',
            this.getApiHost(),
            this.getCompany(),
            this.getBucket(),
            this.getCollectApp(),
            this.getAppKey());
    },

    getSegmentsUrl: function () {
        return util.format('%s/v1/companies/%s/buckets/%s/segments?app_key=%s',
            this.getApiHost(),
            this.getCompany(),
            this.getBucket(),
            this.getAppKey());
    },

    getSegmentEvaluationUrl: function (params) {
        return util.format('%s/v1/companies/%s/buckets/%s/segment-evaluation?app_key=%s&%s',
            this.getApiHost(),
            this.getCompany(),
            this.getBucket(),
            this.getAppKey(),
            querystring.stringify(params));
    },

    validateObject: function (obj, fields) {
        var error = null;
        if (!obj) {
            error = new Error('Object is not defined');
        } else {
            try {
                fields = Array.isArray(fields) ? fields : [fields];
                fields.forEach(function (key) {
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
    checkErrors: function (error, response) {
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

    getCollectApp: function () {
        return this.config && this.config.appName;
    },
    getBucket: function () {
        return this.config && this.config.bucketName;
    },
    getCompany: function () {
        return this.config && this.config.groupId;
    },
    getAppKey: function () {
        return this.config && this.config.appKey;
    },
    getApiHost: function () {
        return this.config && this.config.apiUrl;
    },

    // app settings
    // <InnoHelper> setAppSettings(<object> settings, <function> callback(error))
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
    // <InnoHelper> getAppSettings(<function> callback(error, <object> settings))
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

    // segments
    // <InnoHelper> getSegments(<function> callback(error, array.<Segment> segments))
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
    // <InnoHelper> evaluateProfileBySegment(<string|Profile> profile, <Segment> segment, <function> callback(error, <boolean> result))
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
    // <InnoHelper> evaluateProfileBySegmentId(<string|Profile> profile, <string> segmentId, <function> callback(error, <boolean> result))
    evaluateProfileBySegmentId: function (profile, segmentId, callback) {
        this._evaluateProfileByParams(profile, {
            segment_id: segmentId
        }, callback);
    },
    // <InnoHelper> evaluateProfileByIql(<string|Profile> profile, <string> iql, <function> callback(error, <boolean> result))
    evaluateProfileByIql: function (profile, iql, callback) {
        this._evaluateProfileByParams(profile, {
            iql: iql
        }, callback);
    },
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
    // <InnoHelper> loadProfile(<string> profileId, <function> callback(error, <Profile> profile))
    loadProfile: function (profileId, callback) {

    },
    // <InnoHelper> deleteProfile(<string> profileId, <function> callback(error))
    deleteProfile: function (profileId, callback) {

    },
    // <InnoHelper> saveProfile(<Profile> profile, <function> callback(error, <Profile> profile))
    saveProfile: function (profile, callback) {

    },
    // <InnoHelper> mergeProfiles(<string|Profile> profile1, <string|Profile> profile2, <function> callback(error, profile1))
    mergeProfiles: function (profile1, profile2, callback) {

    },
    // <InnoHelper> refreshLocalProfile(<Profile> profile, <function> callback(error, <Profile> profile))
    refreshLocalProfile: function (profile, callback) {

    },

    // <Profile> getProfileFromRequest(<string> requestBody)
    getProfileFromRequest: function (requestBody) {
        try {
            if (typeof data !== 'object') {
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
    // <object> getMetaFromRequest(<string> requestBody)
    getMetaFromRequest: function (requestBody) {
        try {
            if (typeof data !== 'object') {
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
    // <Profile> createProfile([<string> profileId])
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