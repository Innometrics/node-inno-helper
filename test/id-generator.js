var idGenerator = require('../libs/id-generator'),
    assert = require('assert');

describe('Id generator', function () {

    it('should has method "generate"', function () {
        assert.equal(typeof idGenerator.generate, 'function');
    });

    it('should generate id width default (32) length', function () {
        var id = idGenerator.generate();
        assert(id);
        assert.equal(typeof id, 'string');
        assert.equal(id.length, 32);
    });

    it('should throw error if passed length is not a number', function () {
        assert['throws'](function () {
            idGenerator.generate('not number');
        }, /Length should be a number/);
    });

    it('should throw error if passed length less that zero', function () {
        assert['throws'](function () {
            idGenerator.generate(-1);
        }, /Length should be positive/);
    });

    it('should throw error if passed not integer value', function () {
        assert['throws'](function () {
            idGenerator.generate(9.5);
        }, /Length should be integer/);
    });

    it('should generate id with defined length', function () {
        var length = 100,
            id = idGenerator.generate(length);

        assert(id);
        assert.equal(typeof id, 'string');
        assert.equal(id.length, length);
    });

});
