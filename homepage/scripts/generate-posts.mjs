import { readFileSync, readdirSync, writeFileSync, mkdirSync, copyFileSync, existsSync, statSync } from "fs";
import { join, dirname, relative } from "path";
import { fileURLToPath } from "url";
import grayMatter from "gray-matter";
import { marked } from "marked";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");
const postsDir = join(root, "_posts");
const outDir = join(root, "homepage", "src", "data");
const outFile = join(outDir, "posts.json");
const assetsSrc = join(root, "assets");
const assetsDest = join(root, "homepage", "public", "assets");

mkdirSync(outDir, { recursive: true });

function copyDir(src, dest) {
  if (!existsSync(src)) return;
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const s = join(src, entry);
    const d = join(dest, entry);
    if (statSync(s).isDirectory()) {
      copyDir(s, d);
    } else {
      copyFileSync(s, d);
    }
  }
}

if (existsSync(assetsSrc)) {
  copyDir(assetsSrc, assetsDest);
  console.log(`Copied assets -> ${assetsDest}`);
}

const files = readdirSync(postsDir).filter((f) => f.endsWith(".md") && f !== ".placeholder.md");

const posts = files.map((file) => {
  const raw = readFileSync(join(postsDir, file), "utf-8");
  const { data, content } = grayMatter(raw);

  const dateStr = typeof data.date === "string" ? data.date.slice(0, 10) : "";
  const match = file.match(/^(\d{4}-\d{1,2}-\d{1,2})-(.+)\.md$/);
  const slug = match ? match[2] : file.replace(/\.md$/, "");
  const date = dateStr || match?.[1] || "";

  const html = marked.parse(content, { breaks: true });

  const firstP = html.match(/<p>(.*?)<\/p>/);
  const excerpt = firstP ? firstP[1].replace(/<[^>]+>/g, "") : "";

  return {
    slug,
    title: data.title || slug,
    date,
    categories: data.categories || [],
    tags: data.tags || [],
    pin: data.pin || false,
    content: html,
    excerpt,
  };
});

posts.sort((a, b) => {
  if (a.pin !== b.pin) return a.pin ? -1 : 1;
  return b.date.localeCompare(a.date);
});

writeFileSync(outFile, JSON.stringify(posts, null, 2));
console.log(`Generated ${posts.length} posts -> ${outFile}`);
