'use strict';

var request = require('request');
var Profile = require('./profile');
var util = require('util');

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

    },
    // <InnoHelper> evaluateProfileBySegment(<string|Profile> profile, <Segment> segment, <function> callback(error, <boolean> result))
    evaluateProfileBySegment: function (profile, segment, callback) {

    },
    // <InnoHelper> evaluateProfileBySegmentId(<string|Profile> profile, <string> segmentId, <function> callback(error, <boolean> result))
    evaluateProfileBySegmentId: function (profile, segmentId, callback) {

    },
    // <InnoHelper> evaluateProfileByIql(<string|Profile> profile, <string> iql, <function> callback(error, <boolean> result))
    evaluateProfileByIql: function (profile, iql, callback) {

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