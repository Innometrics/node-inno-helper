MOCHA = ./node_modules/.bin/mocha
_MOCHA = ./node_modules/.bin/_mocha
ISTANBUL = ./node_modules/.bin/istanbul

test:
	@NODE_ENV=test $(MOCHA) -R spec --recursive

test-cov:
	@NODE_ENV=test $(ISTANBUL) cover $(_MOCHA) -- -R spec --recursive

.PHONY: test