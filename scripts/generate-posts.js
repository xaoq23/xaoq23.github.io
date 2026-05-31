import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import grayMatter from "gray-matter";
import { marked } from "marked";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const postsDir = join(root, "_posts");
const outDir = join(root, "homepage", "src", "data");
const outFile = join(outDir, "posts.json");

mkdirSync(outDir, { recursive: true });

const files = readdirSync(postsDir).filter((f) => f.endsWith(".md") && f !== ".placeholder.md");

const posts = files.map((file) => {
  const raw = readFileSync(join(postsDir, file), "utf-8");
  const { data, content } = grayMatter(raw);

  const match = file.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
  const slug = match ? match[2] : file.replace(/\.md$/, "");
  const date = data.date ? new Date(data.date).toISOString().split("T")[0] : match?.[1] || "";

  const html = marked.parse(content, { breaks: true });

  const firstP = html.match(/<p>(.*?)<\/p>/);
  const excerpt = firstP ? firstP[1].replace(/<[^>]+>/, "") : "";

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
console.log(`Generated ${posts.length} posts → ${outFile}`);
