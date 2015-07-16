/*globals afterEach, before, after */

var inno = require('../'),
    Profile = inno.Profile,
    assert = require('assert'),
    sinon  = require('sinon');
    
describe('Attributes', function () {
    
    it('Check getters', function () {
        
        var profile = new Profile();
        //console.log(profile.getId());

        var attributes = {
            n1: 'v1',
            n2: 'v2'
        };

        var attrs = profile.createAttributes('web', 'section', attributes);
        var attrs2 = profile.createAttributes('web', 'section1', attributes);
        var attrs3 = profile.createAttributes('android', 'asc0', attributes);

        attrs = attrs.concat(attrs2, attrs3);

        profile.setAttributes(attrs);

        console.log(profile.getAttributes().length === 6);
        console.log(profile.getAttributes('web').length === 4);
        console.log(profile.getAttributes('web', 'section').length === 2);
        console.log(profile.getAttributes(null, 'section').length === 2);
        console.log(profile.getAttribute('n1', 'web', 'section').hasOwnProperty('data'));

        var attr = new Profile.Attribute({
            collectApp: 'web',
            section: 'section',
            name: 'n1'
        });

        console.log(attr.isValid() === false);

        attr = new Profile.Attribute({
            collectApp: 'web',
            section: 'section',
            name: 'n1',
            value: 'v3'
        });

        console.log(attr.getCollectApp() === 'web');
        console.log(attr.getSection() === 'section');
        console.log(attr.getName() === 'n1');
        console.log(attr.getValue() === 'v3');
        console.log(attr.isValid());

        profile.setAttribute(attr);

        profile.setAttribute({
            collectApp: 'web',
            section: 'section',
            name: 'n3',
            value: 'v3'
        });

        console.log(profile.getAttribute('n1', 'web', 'section').getValue() === 'v3');
        console.log(profile.getAttribute('n3', 'web', 'section').getValue() === 'v3');


    });    
    
});