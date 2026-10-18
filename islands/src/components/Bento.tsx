import styles from "./bento.module.css";
import type { BentoItem } from "../lib/items";

export interface BentoProps {
  items: BentoItem[];
  linkLabel?: string;
}

/**
 * Homepage "currently" grid.
 *
 * The markup intentionally mirrors the Hugo fallback rendered by
 * `layouts/partials/bento.html`; only the styling mechanism differs (CSS
 * Modules instead of the global stylesheet).
 */
export function Bento({ items, linkLabel = "Read more" }: BentoProps) {
  return (
    <>
      {items.map((item) => (
        <li key={item.title} className={styles.card}>
          <span className={styles.kicker}>{item.kicker}</span>
          <h3 className={styles.title}>{item.title}</h3>
          <p className={styles.text}>{item.text}</p>
          {item.href ? (
            <a className={styles.link} href={item.href}>
              {linkLabel} <span aria-hidden="true">&rarr;</span>
            </a>
          ) : null}
        </li>
      ))}
    </>
  );
}
