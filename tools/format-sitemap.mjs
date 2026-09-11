/**
 * Put every sitemap entry on its own line.
 *
 *   node tools/format-sitemap.mjs
 *
 * Runs after `astro build`. @astrojs/sitemap writes sitemap-0.xml and
 * sitemap-index.xml as a single line each, and dist/ is committed, so any two
 * content branches that each moved one page's <lastmod> collided on that one
 * line and the second PR needed a hand merge every time — #189 and #190 on
 * 2026-09-10 were the latest pair. Whitespace between sitemap elements is
 * insignificant to every consumer (the protocol is XML; Google's own examples
 * are pretty-printed), so one <url> per line costs nothing and lets git's
 * three-way merge combine unrelated pages by itself. Two branches that moved
 * the SAME page's date still conflict, which is correct.
 *
 * Deterministic and idempotent: an already-formatted file is left untouched,
 * mtime and all, so a rebuild of unchanged sources keeps dist/ byte-identical
 * and the CI "dist matches rebuild" step still holds. `formatSitemap` refuses
 * to produce output that differs from its input by anything other than
 * whitespace between tags, so a change in what @astrojs/sitemap emits can
 * only fail the build, never quietly drop an entry.
 *
 * The verifier's `sitemap-line-format` check is the tripwire for this stage
 * being dropped from `npm run build`; `post-build-parity` is the tripwire for
 * it being dropped from `build` while `build:post` still lists it.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { formatSitemap } from "./content-checks.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");

/* Enumerated rather than hardcoded: @astrojs/sitemap chunks at entryLimit
   (45,000) into sitemap-1.xml and beyond, and a fixed list would quietly stop
   covering the file that grew. Same rule the verifier uses. */
const files = (await readdir(DIST)).filter((n) => /^sitemap.*\.xml$/i.test(n)).sort();

let rewritten = 0;
let entries = 0;
for (const name of files) {
  const file = path.join(DIST, name);
  const before = await readFile(file, "utf8");
  const after = formatSitemap(before);
  entries += (after.match(/^\s*<(url|sitemap)>/gm) || []).length;
  if (after === before) continue;
  await writeFile(file, after);
  rewritten++;
}

if (!files.length) {
  console.error("  !!  no sitemap*.xml in dist/ — the @astrojs/sitemap integration did not run");
  process.exit(1);
}
console.log(rewritten
  ? `  ok  reflowed ${rewritten} of ${files.length} sitemap files to one entry per line (${entries} entries)`
  : `  ok  ${files.length} sitemap files already one entry per line (${entries} entries)`);
