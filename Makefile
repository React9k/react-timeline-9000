mocha := node_modules/.bin/mocha

.PHONY: all clean install

all: install
	npm run build

run: install
	npm run start

test: install
	$(mocha) --compilers js:babel-core/register src

install:
	yarn

clean:
	rm -rf dist
