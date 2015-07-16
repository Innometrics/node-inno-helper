var inno = require('../'),
    Profile = inno.Profile,
    assert = require('assert');
    
describe('Attribute tests', function () {
    
    it('Check getters', function () {
        
        var attr;
        
        attr = new Profile.Attribute({
            collectApp: 'web',
            section: 'section',
            name: 'n1',
            value: 'v1'
        });
        
        assert.equal(attr.getCollectApp(), 'web');
        assert.equal(attr.getSection(), 'section');
        assert.equal(attr.getName(), 'n1');
        assert.equal(attr.getValue(), 'v1');
        assert.equal(attr.isValid(), true);

    });    
    
    it('Should invalid if it ...', function () {
        
        var attr;
        
        attr = new Profile.Attribute({
            collectApp: 'web',
            section: 'section',
            name: 'n1'
        });
        
        assert.equal(attr.isValid(), false, 'has no value');
        
        attr = new Profile.Attribute({
            collectApp: 'web',
            name: 'n1',
            value: 'val'
        });
        
        assert.equal(attr.isValid(), false, 'has no value');
        
        attr = new Profile.Attribute();
        
        assert.equal(attr.isValid(), false, 'has no params at all');

        attr = new Profile.Attribute({
            collectApp: 'web',
            section: 'section',
            name: 'n1',
            value: 'v3'
        });

    });    
    
});