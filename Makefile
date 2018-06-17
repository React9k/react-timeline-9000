mocha := node_modules/.bin/mocha

.PHONY: all clean

all:
	npm run build

run:
	npm run start

test:
	$(mocha) --compilers js:babel-core/register src

clean:
	rm -rf dist
