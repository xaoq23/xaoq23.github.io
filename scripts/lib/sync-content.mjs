/**
 * Mirrors the authored content tree into the English content directory.
 *
 * Articles are written ONCE, in `hugo/content/`. The English site renders the
 * very same files, so this script copies the tree to `hugo/content-en/` and
 * lets Hugo pair both copies through its default translation keys (same
 * relative path in both content directories). That keeps the language
 * switcher, hreflang alternates and sitemap alternates working without any
 * per-post front matter.
 *
 * `hugo/content-en/` is generated output: never edit it, never commit it.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..", "..");
const SOURCE = join(ROOT, "hugo", "content");
const TARGET = join(ROOT, "hugo", "content-en");

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

export function syncContent() {
  if (!existsSync(SOURCE)) return { copied: 0 };

  rmSync(TARGET, { recursive: true, force: true });
  mkdirSync(TARGET, { recursive: true });

  let copied = 0;
  for (const file of walk(SOURCE)) {
    const destination = join(TARGET, relative(SOURCE, file));
    mkdirSync(dirname(destination), { recursive: true });
    writeFileSync(destination, readFileSync(file));
    copied += 1;
  }
  return { copied };
}

if (process.argv[1] && process.argv[1].endsWith("sync-content.mjs")) {
  const { copied } = syncContent();
  console.log(`content mirror: ${copied} file(s) -> hugo/content-en/`);
}
