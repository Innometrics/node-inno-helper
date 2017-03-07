var IdGenerator = require('../libs/id-generator'),
    assert = require('assert');

describe('Id generator', function () {
    function createIdGenerator (length) {
        return new IdGenerator(length);
    }

    it('should has method "generate"', function () {
        assert.equal(typeof IdGenerator, 'function');
    });

    it('should generate id width default (32) length', function () {
        var id = (new IdGenerator()).getId();
        assert(id);
        assert.equal(typeof id, 'string');
        assert.equal(id.length, 32);
    });

    it('should throw error if passed length is not a number', function () {
        assert['throws'](function () {
            createIdGenerator('not number');
        }, /Length should be a number/);
    });

    it('should throw error if passed length less that zero', function () {
        assert['throws'](function () {
            createIdGenerator(-1);
        }, /Length should be positive/);
    });

    it('should throw error if passed not integer value', function () {
        assert['throws'](function () {
            createIdGenerator(9.5);
        }, /Length should be integer/);
    });

    it('should generate id with defined length', function () {
        var length = 100;
        var id = createIdGenerator(length).getId();
        assert(id);
        assert.equal(typeof id, 'string');
        assert.equal(id.length, length);
    });
});
