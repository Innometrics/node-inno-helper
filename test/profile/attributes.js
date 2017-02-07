var inno = require('../../'),
    assert = require('assert'),
    sinon = require('sinon');
var Profile = inno.Profile;

describe('Profile/Attributes', function () {
    var profile;

    function createProfile (conf) {
        return new Profile(conf);
    }

    beforeEach(function () {
        profile = createProfile();
    });

    describe('Initialization', function () {
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

            attribute = attributes[1];
            assert.equal(attribute.getCollectApp(), 'app');
            assert.equal(attribute.getSection(), 'sec');
            assert.equal(attribute.getName(), 'foo');
            assert.equal(attribute.getValue(), 'bar');
        });

        it('should not create attribute from config if its data is empty object', function () {
            var profile = createProfile({
                    id: 'pid',
                    attributes: [{
                        collectApp: 'app',
                        section: 'sec',
                        data: {}
                    }]
                }),
                attributes = profile.getAttributes();

            assert.strictEqual(attributes.length, 0);
        });
    });

    describe('Creation', function () {
        it('should throw error if collectApp or section is empty', function () {
            assert.throws(function () {
                profile.createAttributes(null, 'section', {});
            }, /collectApp and section should be filled to create attribute correctly/);

            assert.throws(function () {
                profile.createAttributes('app', null, {});
            }, /collectApp and section should be filled to create attribute correctly/);
        });

        it('should throw error if data is not an object or empty', function () {
            assert.throws(function () {
                profile.createAttributes('app', 'section', null);
            }, /attributes should be an object/);

            assert.throws(function () {
                profile.createAttributes('app', 'section', true);
            }, /attributes should be an object/);

            assert.throws(function () {
                profile.createAttributes('app', 'section', {});
            }, /attributes are empty/);
        });

        it('should create attributes', function () {
            var attributes = profile.createAttributes('app', 'section', {
                test: 1,
                foo: 'bar'
            });
            assert.equal(attributes.length, 2);
        });
    });

    describe('Set methods', function () {
        it('should throw error if non array passed', function () {
            assert.throws(function () {
                profile.setAttributes();
            }, /Argument "attributes" should be an array/);

            assert.throws(function () {
                profile.setAttributes(true);
            }, /Argument "attributes" should be an array/);

            assert.throws(function () {
                profile.setAttributes({});
            }, /Argument "attributes" should be an array/);
        });

        it('should throw error if try to set invalid attributes', function () {
            assert.throws(function () {
                profile.setAttributes([{
                    collectApp: 'app',
                    section: 'sec',
                    no: 'name!',
                    value: 'hi'
                }]);
            }, /Attribute is not valid/);
        });

        it('should set attributes', function () {
            var profile = createProfile(),
                attribute1 = {
                    collectApp: 'app',
                    section: 'sec',
                    name: 'test',
                    value: 'hi'
                },
                attribute2 = new Profile.Attribute({
                    collectApp: 'app',
                    section: 'sec',
                    name: 'foo',
                    value: 'bar'
                }),
                attribute;

            profile.setAttributes([attribute1, attribute2]);
            assert.equal(profile.getAttributes().length, 2);

            attribute = profile.getAttribute(attribute1.name, attribute1.collectApp, attribute1.section);
            assert.strictEqual(attribute.getValue(), attribute1.value);

            attribute = profile.getAttribute(attribute2.getName(), attribute2.getCollectApp(), attribute2.getSection());
            assert.strictEqual(attribute.getValue(), attribute2.getValue());
        });

        it('should set attribute and rewrite existing value', function () {
            var profile = createProfile(),
                attribute1 = {
                    collectApp: 'app',
                    section: 'sec',
                    name: 'test',
                    value: 'hi'
                },
                attribute2 = {
                    collectApp: 'app',
                    section: 'sec',
                    name: 'test',
                    value: 'bazzzzzzz'
                },
                attribute;

            profile.setAttributes([attribute1, attribute2]);
            assert.equal(profile.getAttributes().length, 1);
            attribute = profile.getAttribute(attribute1.name, attribute1.collectApp, attribute1.section);
            assert.strictEqual(attribute.getValue(), attribute2.value);
        });

        it('should delegate setAttribute to setAttributes', function () {
            var profile = createProfile(),
                attribute1 = {
                    collectApp: 'app',
                    section: 'sec',
                    name: 'test',
                    value: 'hi'
                };

            sinon.spy(profile, 'setAttributes');
            profile.setAttribute(attribute1);

            assert(profile.setAttributes.calledWith([attribute1]));
            profile.setAttributes.restore();
        });
    });

    describe('Get methods', function () {
        it('should throw error if no name, collectApp or section specified', function () {
            assert.throws(function () {
                profile.getAttribute(null, 'app', 'section');
            }, /Name, collectApp and section should be filled to get attribute/);

            assert.throws(function () {
                profile.getAttribute('name', null, 'section');
            }, /Name, collectApp and section should be filled to get attribute/);

            assert.throws(function () {
                profile.getAttribute('name', 'app', null);
            }, /Name, collectApp and section should be filled to get attribute/);
        });

        it('should return null if attribute does not exist', function () {
            assert.strictEqual(profile.getAttribute('name', 'app', 'section'), null);
        });

        it('should return attribute', function () {
            var profile = createProfile(),
                attribute1 = {
                    collectApp: 'app',
                    section: 'sec',
                    name: 'test',
                    value: 'hi'
                },
                attribute;

            profile.setAttribute(attribute1);

            attribute = profile.getAttribute(attribute1.name, attribute1.collectApp, attribute1.section);
            assert(attribute);
            assert.strictEqual(attribute.getValue(), attribute1.value);
        });
    });
});
