var inno = require('../'),
    Profile = inno.Profile,
    assert = require('assert');

describe('Attribute', function () {

    function createAttribute (conf) {
        return new Profile.Attribute(conf);
    }

    describe('Creation', function () {

        it('should not throw error when create with empty data', function () {
            assert.doesNotThrow(function () {
                createAttribute();
            });
        });

    });


    describe('Validation', function () {

        it('should be valid if all required fields exist', function () {
            var attr = createAttribute({
                collectApp: 'web',
                section: 'section',
                name: 'n1',
                value: 'v1'
            });
            assert(attr.isValid());
        });

        [
            'Name', 'Value', 'CollectApp', 'Section'
        ].forEach(function (field) {
                it('should be invalid if required field "' + field + '" not defined', function () {
                    var attr = createAttribute({
                        name: 'name1',
                        value: 'value1',
                        section: 'section1',
                        collectApp: 'app'
                    });
                    assert(attr.isValid());

                    attr['set' + field](null);
                    assert.equal(attr.isValid(), false);
                });
            });

    });

    describe('Get/Set methods', function () {

        [
            {
                field: 'Name',
                value: 'n1'
            },
            {
                field: 'Value',
                value: 'v1'
            },
            {
                field: 'CollectApp',
                value: 'rest'
            },
            {
                field: 'Section',
                value: 's1'
            }
        ].forEach(function (test) {
                it('should properly set/get "' + test.field + '"', function () {
                    var attr = createAttribute(),
                        getter = 'get' + test.field,
                        setter = 'set' + test.field;

                    assert.notEqual(attr[getter](), test.value);
                    attr[setter](test.value);
                    assert.equal(attr[getter](), test.value);
                });
            });

    });

    describe('Dirty flag', function () {

        it('should be marked as dirty after creation', function () {
            var attribute = createAttribute();
            assert(attribute.hasChanges());
        });

        it('should be marked as not dirty', function () {
            var attribute = createAttribute();
            attribute.resetDirty();
            assert.equal(attribute.hasChanges(), false);
        });

        [
            {
                field: 'Name',
                value: 'n1'
            },
            {
                field: 'Value',
                value: 'v1'
            },
            {
                field: 'CollectApp',
                value: 'rest'
            },
            {
                field: 'Section',
                value: 's1'
            }
        ].forEach(function (test) {
                it('should be marked as dirty after set "' + test.field + '"', function () {
                    var attribute = createAttribute(),
                        setter = 'set' + test.field;

                    attribute.resetDirty();
                    attribute[setter](test.value);

                    assert(attribute.hasChanges());
                });
            });



    });

});
