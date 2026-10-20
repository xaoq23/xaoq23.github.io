# Convenience wrapper. `pnpm` scripts are the source of truth; this file only
# exists because earlier project notes used `make check`. Windows users can
# (and should) call the pnpm scripts directly.
.PHONY: check build dev

check:
	pnpm check

build:
	pnpm build

dev:
	@echo "pnpm dev:hugo   # http://localhost:1313"
