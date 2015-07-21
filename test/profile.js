var inno = require('../'),
    Profile = inno.Profile,
    assert = require('assert')/*,
    sinon  = require('sinon')*/;

describe('Profile', function () {

    function createProfile (conf) {
        return new Profile(conf);
    }

    it('should not throw error on empty config', function () {
        assert.doesNotThrow(function () {
            createProfile();
        });

        assert.doesNotThrow(function () {
            createProfile({});
        });
    });

    it('should be inited with default data', function () {
        var profile = createProfile(),
            sessions = profile.getSessions(),
            attributes = profile.getAttributes();

        assert(profile.getId());
        assert(Array.isArray(sessions));
        assert.strictEqual(sessions.length, 0);
        assert(Array.isArray(attributes));
        assert.strictEqual(attributes.length, 0);
    });

    it('should use id from config', function () {
        var id = 'pid',
            profile = createProfile({id: id});

        assert.strictEqual(profile.getId(), id);
    });

    it('should create attributes from config', function () {
        var profile = createProfile({
                id: 'pid',
                attributes: [{
                    collectApp: 'app',
                    section: 'sec',
                    data: {
                        test: 1,
                        foo: 'bar'
                    }
                }]
            }),
            attributes = profile.getAttributes(),
            attribute;

        assert.strictEqual(attributes.length, 2);
        attribute = attributes[0];
        assert.equal(attribute.getCollectApp(), 'app');
        assert.equal(attribute.getSection(), 'sec');
        assert.equal(attribute.getName(), 'test');
        assert.equal(attribute.getValue(), 1);
    });

});


describe('Attributes', function () {
    
    it('Check getters', function () {
        
        var profile = new Profile();
        // console.log(profile.getId());

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
