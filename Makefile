# add node_modules/ & bower_components to your .gitignore

SRC = src
DIST = dist

.PHONY: setup clean css js all build


all: css js

setup:
	npm install uglify-js browserify less bower less-plugin-clean-css
	./node_modules/.bin/bower install

clean:
	rm -rf $(DIST)/*.css $(DIST)/*.js

css:
	./node_modules/.bin/lessc "${SRC}/less/app.less" > "${DIST}/app.min.css"

js:
	./node_modules/.bin/browserify "${SRC}/js/app.js" > "${DIST}/app.min.js"

minifycss: css
	mv "${DIST}/app.min.css" "${DIST}/app.css"
	./node_modules/.bin/lessc --clean-css="--compatibility=ie8 --advanced" "${SRC}/less/app.less" > "${DIST}/app.min.css"

minifyjs: js
	mv "${DIST}/app.js" "${DIST}/app.min.js"
	uglifyjs "${DIST}/app.js" > "${DIST}/app.min.js"

build: clean minifycss minifyjs
