/**
 * Write the tile map's targets into the experience partials.
 *
 *   node tools/tile-links-apply.mjs           rewrite hrefs to match the map
 *   node tools/tile-links-apply.mjs --check   report drift, write nothing
 *
 * src/data/tiles.mjs is the record of where every tile leads; this makes the
 * partials agree with it. It touches only three things per card: the
 * `a.exp-card` href, the `a.event-cta` href, and the optional `a.event-more`
 * secondary link straight after the CTA (added, changed or removed). Card copy,
 * names and images are hand-written and stay that way.
 *
 * It refuses to write a page whose cards do not line up with the map — a
 * different count, or a name the map spells differently — because pairing by
 * position after a card was added or renamed would quietly move every later
 * card's link onto its neighbour. That is the failure exp-card-intake.mjs
 * guards against for images, and the same rule holds here.
 *
 * Idempotent: a second run changes nothing. The verifier's tile-map-parity
 * check reads the built pages against the same map, so drift fails the build
 * even if this is never run.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TILES } from "../src/data/tiles.mjs";
import { readTileCards, tileParityDefects } from "./content-checks.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const CHECK = process.argv.includes("--check");

/** The partial with every card's links set from `rows`. Exported shape is pure for testing. */
export function applyTileLinks(html, rows) {
  const exp = rows.filter((r) => r.kind === "exp-card");
  const ev = rows.filter((r) => r.kind === "event-card");
  let i = 0;
  let j = 0;
  return html
    .replace(/<a class="exp-card" href="[^"]*">/g, (m) => (i < exp.length ? `<a class="exp-card" href="${exp[i++].href}">` : m))
    .replace(
      /( *)<a class="event-cta" href="[^"]*">([\s\S]*?)<\/a>(?:\s*<a class="event-more" href="[^"]*">[\s\S]*?<\/a>)?/g,
      (m, indent, label) => {
        if (j >= ev.length) return m;
        const r = ev[j++];
        const more = r.more ? `\n${indent}<a class="event-more" href="${r.more}">${r.moreLabel}</a>` : "";
        return `${indent}<a class="event-cta" href="${r.href}">${label}</a>${more}`;
      },
    );
}

/** Count or name mismatches that make positional pairing unsafe. */
export function alignmentDefects(html, rows) {
  const out = [];
  const cards = readTileCards(html);
  for (const kind of ["exp-card", "event-card"]) {
    const c = cards.filter((x) => x.kind === kind);
    const r = rows.filter((x) => x.kind === kind);
    if (c.length !== r.length) out.push(`${c.length} ${kind}s on the page, ${r.length} in the map`);
    else c.forEach((card, k) => {
      if (card.name !== r[k].name) out.push(`${kind} ${k + 1} is "${card.name}" on the page and "${r[k].name}" in the map`);
    });
  }
  return out;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let refused = 0;
  let drift = 0;
  let written = 0;
  for (const [slug, rows] of Object.entries(TILES)) {
    const file = path.join(ROOT, "src", "content-pages", `experiences__${slug}.html`);
    const html = await readFile(file, "utf8");
    const misaligned = alignmentDefects(html, rows);
    if (misaligned.length) {
      refused++;
      for (const d of misaligned) console.error(`  ✗ ${slug}: ${d}`);
      continue;
    }
    const defects = tileParityDefects(html, rows);
    if (!defects.length) continue;
    drift++;
    for (const d of defects) console.log(`  ${CHECK ? "✗" : "→"} ${slug}: ${d}`);
    if (!CHECK) {
      const next = applyTileLinks(html, rows);
      const left = tileParityDefects(next, rows);
      if (left.length) throw new Error(`${slug}: still drifting after rewrite: ${left.join("; ")}`);
      await writeFile(file, next, "utf8");
      written++;
    }
  }
  if (refused) {
    console.error(`\n${refused} page${refused === 1 ? "" : "s"} refused: the cards and src/data/tiles.mjs disagree on count or name. Fix the map, then re-run.`);
    process.exit(1);
  }
  if (CHECK && drift) {
    console.error(`\n${drift} page${drift === 1 ? "" : "s"} drift from src/data/tiles.mjs — run node tools/tile-links-apply.mjs`);
    process.exit(1);
  }
  console.log(CHECK ? "  ok  every tile matches src/data/tiles.mjs" : `  ok  ${written} page${written === 1 ? "" : "s"} rewritten, the rest already matched`);
}
