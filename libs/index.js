'use strict';

// <InnoHelper> InnoHelper(<json> config)
var InnoHelper = function (config) {
    this.config = config;
};

InnoHelper.prototype = {
    config: {},

    getCollectApp: function() {
        return 'sdfsdf';
    },
    getBucket: function() {

    },
    getCompany: function() {

    },
    getAppKey: function() {

    },
    getApiHost: function() {

    },

    // app settings
    // <InnoHelper> setAppSettings(<object> settings, <function> callback(error))
    setAppSettings: function(settings, callback) {

    },
    // <InnoHelper> getAppSettings(<function> callback(error, <object> settings))
    getAppSettings: function(callback) {

    },

    // segments
    // <InnoHelper> getSegments(<function> callback(error, array.<Segment> segments))
    getSegments: function(callback) {

    },
    // <InnoHelper> evaluateProfileBySegment(<string|Profile> profile, <Segment> segment, <function> callback(error, <boolean> result))
    evaluateProfileBySegment: function(profile, segment, callback) {

    },
    // <InnoHelper> evaluateProfileBySegmentId(<string|Profile> profile, <string> segmentId, <function> callback(error, <boolean> result))
    evaluateProfileBySegmentId: function(profile, segmentId, callback) {

    },
    // <InnoHelper> evaluateProfileByIql(<string|Profile> profile, <string> iql, <function> callback(error, <boolean> result))
    evaluateProfileByIql: function(profile, iql, callback) {

    },

    // profile Cloud API
    // <InnoHelper> loadProfile(<string> profileId, <function> callback(error, <Profile> profile))
    loadProfile: function(profileId, callback) {

    },
    // <InnoHelper> deleteProfile(<string> profileId, <function> callback(error))
    deleteProfile: function(profileId, callback) {

    },
    // <InnoHelper> saveProfile(<Profile> profile, <function> callback(error, <Profile> profile))
    saveProfile: function(profile, callback) {

    },
    // <InnoHelper> mergeProfiles(<string|Profile> profile1, <string|Profile> profile2, <function> callback(error, profile1))
    mergeProfiles: function(profile1, profile2, callback) {

    },
    // <InnoHelper> refreshLocalProfile(<Profile> profile, <function> callback(error, <Profile> profile))
    refreshLocalProfile: function(profile, callback) {

    },

    // <Profile> getProfileFromRequest(<string> requestBody)
    getProfileFromRequest: function(requestBody) {

    },
    // <object> getMetaFromRequest(<string> requestBody)
    getMetaFromRequest: function(requestBody) {

    },
    // <Profile> createProfile([<string> profileId])
    createProfile: function(profileId) {

    }
};

module.exports = InnoHelper;