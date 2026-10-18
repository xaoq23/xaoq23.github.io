# Convenience wrapper. `pnpm` scripts are the source of truth; this file only
# exists because earlier project notes used `make check`. Windows users can
# (and should) call the pnpm scripts directly.
.PHONY: check build typecheck dev

check:
	pnpm check

build:
	pnpm build

typecheck:
	pnpm typecheck

dev:
	@echo "Run these in two terminals:"
	@echo "  pnpm dev:hugo     # http://localhost:1313"
	@echo "  pnpm dev:islands  # rebuilds islands on change"
