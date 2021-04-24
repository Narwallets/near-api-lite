TSC = npx tsc
TYPEDOC = npx typedoc

# The default target:

.PHONY: all
all: lib/index.js

# Rules for development:

lib/%.js: src/%.ts tsconfig.json package.json package-lock.json
	$(TSC)

lib/%.d.ts: lib/%.js

docs:
	$(TYPEDOC) --out $@


.PHONY: clean distclean mostlyclean maintainer-clean
clean:
	@rm -Rf docs lib/*.js lib/*.d.ts *~
distclean: clean
mostlyclean: clean
maintainer-clean: clean

.SECONDARY:
.SUFFIXES: