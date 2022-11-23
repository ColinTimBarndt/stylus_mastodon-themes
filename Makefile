all: styles

init:
	cd gen; \
	npm install

servers.txt: init
	cd gen; \
	npm run gen-servers

styles: servers.txt
	cd gen; \
	npm run gen-styles
