#!/usr/bin/env python3
"""Build one daily AI digest post from a handful of RSS/Atom feeds.

Usage:
    python scripts/ai_daily.py                # today in Asia/Shanghai
    python scripts/ai_daily.py --date 2026-10-20 --force

Output: hugo/content/ai-daily/YYYY-MM-DD.md. Existing files are left alone
unless --force is passed, so re-running the scheduled job is idempotent.
"""

from __future__ import annotations

import argparse
import html
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

import feedparser

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "hugo" / "content" / "ai-daily"
TZ = ZoneInfo("Asia/Shanghai")

# (display name, feed URL, max entries). Add or remove sources freely: the
# section is regenerated from this list every day.
FEEDS: list[tuple[str, str, int]] = [
    ("OpenAI", "https://openai.com/news/rss.xml", 4),
    ("Hugging Face", "https://huggingface.co/blog/feed.xml", 4),
    ("Google AI", "https://blog.google/technology/ai/rss/", 4),
    ("MIT News · AI", "https://news.mit.edu/rss/topic/artificial-intelligence2", 4),
    ("arXiv cs.AI", "http://export.arxiv.org/rss/cs.AI", 4),
]
MAX_TOTAL = 18

TAG_RE = re.compile(r"<[^>]+>")


def clean(text: str) -> str:
    """Strip HTML/entities and collapse whitespace."""
    text = TAG_RE.sub(" ", text or "")
    text = html.unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def truncate(text: str, limit: int = 180) -> str:
    if len(text) <= limit:
        return text
    return text[:limit].rstrip() + "…"


def entry_datetime(entry) -> datetime | None:
    for key in ("published_parsed", "updated_parsed"):
        value = entry.get(key)
        if value:
            return datetime(*value[:6], tzinfo=timezone.utc).astimezone(TZ)
    return None


def recent_links(before: datetime, days: int = 3) -> set[str]:
    """Links already published in the last few digests, to avoid repeats."""
    links: set[str] = set()
    if not OUT_DIR.exists():
        return links

    cutoff = before.date()
    for path in sorted(OUT_DIR.glob("*.md"), reverse=True):
        try:
            day = datetime.strptime(path.stem, "%Y-%m-%d").date()
        except ValueError:
            continue
        if day >= cutoff:
            continue
        if len(links) and (cutoff - day).days > days:
            break
        links.update(re.findall(r"\((https?://[^)\s]+)\)", path.read_text(encoding="utf-8")))
    return links


def collect(skip_links: set[str]) -> tuple[dict[str, list[dict]], int, int]:
    groups: dict[str, list[dict]] = {}
    seen: set[str] = set()
    total = 0
    fetched = 0
    failed = 0

    for name, url, limit in FEEDS:
        try:
            parsed = feedparser.parse(url)
        except Exception as error:  # network or malformed feed
            print(f"warn: {name}: {error}", file=sys.stderr)
            failed += 1
            continue

        if not parsed.entries:
            print(f"warn: {name}: no entries", file=sys.stderr)
            failed += 1
            continue

        fetched += 1

        items: list[dict] = []
        for entry in parsed.entries:
            if len(items) >= limit or total + len(items) >= MAX_TOTAL:
                break

            link = (entry.get("link") or "").strip()
            title = clean(entry.get("title", ""))
            if not link or not title or link in skip_links:
                continue

            key = re.sub(r"\s+", " ", title).lower()
            if key in seen:
                continue
            seen.add(key)
            skip_links.add(link)

            summary = truncate(clean(entry.get("summary", "")), 200)
            # arXiv prefixes every abstract with its identifier and announce type.
            summary = re.sub(
                r"^arXiv:\S+\s+Announce Type:\s+\S+\s+Abstract:\s*",
                "",
                summary,
                flags=re.IGNORECASE,
            )
            if summary.lower() in {"tbd", "todo"}:
                summary = ""

            items.append(
                {
                    "title": title.replace("[", "(").replace("]", ")"),
                    "link": link,
                    "date": entry_datetime(entry),
                    "summary": summary,
                }
            )

        if items:
            items.sort(key=lambda item: item["date"] or datetime.min.replace(tzinfo=TZ), reverse=True)
            groups[name] = items
            total += len(items)

    return groups, fetched, failed


def render(day: datetime, groups: dict[str, list[dict]]) -> str:
    total = sum(len(items) for items in groups.values())
    lines = [
        "---",
        f'title: "AI 日报 · {day:%Y-%m-%d}"',
        f'date: {day.isoformat()}',
        f'lastmod: {day.isoformat()}',
        'tags: ["AI", "日报"]',
        'categories: ["AI 日报"]',
        f'summary: "自动汇总 {day:%Y-%m-%d} 的 AI 动态，共 {total} 条。"',
        "draft: false",
        "---",
        "",
        "> 本文由脚本自动抓取生成，按来源分组，标题链接到原文。",
        "",
    ]

    for name, items in groups.items():
        lines.append(f"## {name}")
        lines.append("")
        for item in items:
            date = f"（{item['date']:%Y-%m-%d}）" if item["date"] else ""
            lines.append(f"- **[{item['title']}]({item['link']})**{date}")
            if item["summary"]:
                lines.append(f"  {item['summary']}")
            lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate the daily AI digest post")
    parser.add_argument("--date", help="YYYY-MM-DD, defaults to today in Asia/Shanghai")
    parser.add_argument("--force", action="store_true", help="overwrite an existing post")
    args = parser.parse_args()

    if args.date:
        try:
            day = datetime.strptime(args.date, "%Y-%m-%d").replace(hour=8, tzinfo=TZ)
        except ValueError:
            print(f"error: invalid --date {args.date!r}, expected YYYY-MM-DD", file=sys.stderr)
            return 2
    else:
        now = datetime.now(TZ)
        day = now.replace(hour=8, minute=0, second=0, microsecond=0)

    target = OUT_DIR / f"{day:%Y-%m-%d}.md"
    if target.exists() and not args.force:
        print(f"skip: {target.relative_to(ROOT)} already exists (use --force to overwrite)")
        return 0

    groups, fetched, failed = collect(recent_links(day))
    total = sum(len(items) for items in groups.values())
    if total == 0:
        if fetched == 0:
            print("error: no feeds could be read", file=sys.stderr)
            return 1
        print("nothing new today; no file written")
        return 0

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    target.write_text(render(day, groups), encoding="utf-8")
    print(f"wrote {target.relative_to(ROOT)} ({total} entries from {len(groups)} feed(s))")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
