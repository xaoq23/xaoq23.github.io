import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const fromHere = (path: string): string => fileURLToPath(new URL(path, import.meta.url));

/**
 * Islands are standalone ES modules. Vite writes them straight into
 * `hugo/static/islands/` together with a manifest that a Hugo partial reads to
 * emit the correct hashed `<script>` tag.
 */
export default defineConfig({
  plugins: [react()],
  base: "/islands/",
  resolve: {
    alias: {
      // Islands consume the same design tokens as the Hugo templates.
      "@tokens": fromHere("../hugo/assets/css"),
    },
  },
  build: {
    outDir: fromHere("../hugo/static/islands"),
    emptyOutDir: true,
    manifest: "manifest.json",
    sourcemap: false,
    rollupOptions: {
      input: {
        bento: fromHere("src/entries/bento.tsx"),
      },
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
});
