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
	yarn test

test-watch: install
	yarn test

install:
	yarn

clean:
	rm -rf dist
	rm -rf lib
