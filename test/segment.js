var inno = require('../'),
    assert = require('assert');
var Profile = inno.Profile;

describe('Segment', function () {
    function createSegment (conf) {
        return new Profile.Segment(conf);
    }

    describe('Creation', function () {
        it('should throw error on empty config', function () {
            assert['throws'](function () {
                createSegment();
            }, /Config should be defined/);
        });

        it('should throw error if config is not an object', function () {
            assert['throws'](function () {
                createSegment(true);
            }, /Config should be an object/);
        });

        it('should throw error if config.id has wrong value', function () {
            assert['throws'](function () {
                createSegment({});
            },
            /Property "id" in config should be defined/,
            'config.id is not defined'
            );

            assert['throws'](function () {
                createSegment({id: 0});
            },
            /Property "id" in config should be a string/,
            'config.id is not defined'
            );

            assert['throws'](function () {
                createSegment({id: ' '});
            },
            /Property "id" in config can not be empty/,
            'config.id is empty'
            );
        });

        it('should throw error if config.id has wrong value', function () {
            assert['throws'](function () {
                createSegment({id: '1'});
            },
            /Property "iql" in config should be defined/,
            'config.iql is not defined'
            );

            assert['throws'](function () {
                createSegment({
                    id: '1',
                    iql: true
                });
            },
            /Property "iql" in config should be a string/,
            'config.iql is not defined'
            );

            assert['throws'](function () {
                createSegment({
                    id: '1',
                    iql: ' '
                });
            },
            /Property "iql" in config can not be empty/,
            'config.iql is empty'
            );
        });

        it('should not throw error if all required props present', function () {
            var segment;
            assert.doesNotThrow(function () {
                segment = createSegment({
                    id: '1',
                    iql: 'collectApp("web").section("9")'
                });
            }
            );
            assert(segment.isValid());
        });
    });

    describe('Get/Set methods', function () {
        var segment,
            id = '1',
            iql = 'some-iql';

        beforeEach(function () {
            segment = createSegment({
                id: id,
                iql: iql
            });
        });

        it('should get id', function () {
            assert.equal(segment.getId(), id);
        });

        it('should get iql', function () {
            assert.equal(segment.getIql(), iql);
        });
    });
});
