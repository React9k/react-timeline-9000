mocha := node_modules/.bin/mocha

.PHONY: all clean install

all: install
	npm run build

run: install
	npm run start

test: install
	env NODE_PATH=$$NODE_PATH:$$PWD/src/ $(mocha) --require babel-core/register "./src/**/*.test.js"

install:
	yarn

clean:
	rm -rf dist
