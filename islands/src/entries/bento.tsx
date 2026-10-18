import { createRoot } from "react-dom/client";
import { Bento } from "../components/Bento";
import type { BentoItem } from "../lib/items";

// Tokens are imported from the Hugo asset directory through the `@tokens`
// Vite alias: one palette, no duplicated colour values.
import "@tokens/tokens.css";

function readItems(el: HTMLElement): BentoItem[] | null {
  try {
    const parsed: unknown = JSON.parse(el.dataset.items ?? "[]");
    if (!Array.isArray(parsed)) return null;
    return parsed as BentoItem[];
  } catch {
    // Malformed data: keep the Hugo-rendered fallback rather than crashing.
    return null;
  }
}

for (const el of document.querySelectorAll<HTMLElement>('[data-island="bento"]')) {
  const items = readItems(el);
  if (!items) continue;
  createRoot(el).render(<Bento items={items} linkLabel={el.dataset.linkLabel ?? "Read more"} />);
}
