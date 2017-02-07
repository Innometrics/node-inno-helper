var inno = require('../'),
    assert = require('assert');
var Cache = inno.Cache;

describe('Cache', function () {
    describe('Creation', function () {
        it('should use default config if needed', function () {
            var cache = new Cache();
            assert.equal(cache.cachedTime, 60);
        });

        it('should throw error on incorrect config', function () {
            assert.throws(function () {
                return new Cache(true);
            }, /Config should be an object/);
        });

        it('should set correct config', function () {
            var cache = new Cache({cachedTime: 120});
            assert.equal(cache.cachedTime, 120);
        });
    });

    describe('Get/Set methods', function () {
        it('should set cached time', function () {
            var cache = new Cache();
            assert.equal(cache.cachedTime, 60);
            cache.setCachedTime(100);
            assert.equal(cache.cachedTime, 100);
        });

        it('should get value after set', function () {
            var cache = new Cache();
            cache.set('a', 123);
            cache.set('b', true);
            cache.set('c', {a: 123});

            assert.strictEqual(cache.get('a'), 123);
            assert.strictEqual(cache.get('b'), true);
            assert.deepEqual(cache.get('c'), {a: 123});

            cache.expire('a');
            assert.strictEqual(cache.get('a'), undefined);

            cache.cache.b.expired = +new Date() - 1;
            assert.strictEqual(cache.get('b'), undefined);

            cache.clearCache();
            assert.strictEqual(cache.get('a'), undefined);
            assert.strictEqual(cache.get('b'), undefined);
            assert.strictEqual(cache.get('c'), undefined);
        });
    });
});
