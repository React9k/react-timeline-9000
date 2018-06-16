SRC = $(wildcard src/*.js)

.PHONY: all clean

# Build process:
#  1. copy all .js from src to lib and add .flow ext
#  2. use bable to transpile files to .js

babel := node_modules/.bin/babel
mocha := node_modules/.bin/mocha

src_files := $(shell find src/ -name '*.js')
transpiled_files := $(patsubst src/%,lib/%,$(src_files))
orig_files := $(patsubst %.js,%.js.orig,$(transpiled_files))

all: node_modules $(orig_files) $(transpiled_files)

test: 
	$(mocha) --compilers js:babel-core/register src

lib/%: src/%
	mkdir -p $(dir $@)
	$(babel) $< --out-file $@ --source-maps

lib/%.js.orig: src/%.js
	mkdir -p $(dir $@)
	cp $< $@

clean:
	rm -rf lib

node_modules: package.json yarn.lock
	yarn install