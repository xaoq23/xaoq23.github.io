#!/usr/bin/env node
/**
 * Dev server with content mirroring.
 *
 * - mirrors `hugo/content/` into the generated English content directory,
 * - starts `hugo server`,
 * - keeps mirroring on every Markdown change so both language sites follow
 *   the edit while Hugo rebuilds.
 */
import { spawn } from "node:child_process";
import { watch } from "node:fs";
import { join, resolve } from "node:path";
import { syncContent } from "./lib/sync-content.mjs";

const root = resolve(import.meta.dirname, "..");
const contentDir = join(root, "hugo", "content");

syncContent();

const child = spawn(process.execPath, [join(root, "scripts", "hugo.mjs"), "server", "-D", "--source", "hugo"], {
  stdio: "inherit",
  cwd: root,
});

let timer;
watch(contentDir, { recursive: true }, (_event, filename) => {
  if (filename && !String(filename).endsWith(".md")) return;
  clearTimeout(timer);
  timer = setTimeout(() => {
    try {
      syncContent();
    } catch (error) {
      console.error("content mirror failed:", error.message);
    }
  }, 150);
});

const stop = () => {
  child.kill();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
