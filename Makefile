mocha := node_modules/.bin/mocha

.PHONY: all clean install demo docs

all: clean install
	yarn build &&\
	yarn build_lib

demo: clean install docs
	yarn build_demo && \
	mv docs/ dist/

docs:
	yarn docs

run: install
	yarn start

test: install
	env NODE_PATH=$$NODE_PATH:$$PWD/src/ $(mocha) --require @babel/register --require ignore-styles "./src/**/*.test.js"

test-watch: install
	env NODE_PATH=$$NODE_PATH:$$PWD/src/ $(mocha) -w --require @babel/register --require ignore-styles "./src/**/*.test.js"

install:
	yarn

clean:
	rm -rf dist
	rm -rf lib
