/**
 * Remove internal-note comments from built HTML.
 *
 *   node tools/strip-internal-comments.mjs
 *
 * Runs after `astro build`. The notes themselves are wanted — they live in
 * `src/` and are the record of what each page is still missing — but an HTML
 * comment is published, not private. On 2026-09-01 the staging site was serving
 * 108 of them across 81 of 123 pages, 79 reading "NEEDS MARK: a real client
 * testimonial for this page", which is what a reader of a luxury travel
 * advisory's page source would have found.
 *
 * Nothing caught it: `placeholder-copy` tests visibleText(), which strips
 * comments before it looks, and that is correct for the job it does. This is a
 * different job, so it is a different stage, and `internal-comments` in
 * verify-deployment.mjs fails the build if any survive — a stripper with no
 * check behind it is one silent regression away from shipping them again.
 *
 * Deliberately surgical. Structural comments — `<!-- ══ FOOTER ══ -->` and its
 * 400-odd siblings — are left alone: they cost nothing, removing them would be
 * a far larger diff, and a stage that rewrites every comment in every file is
 * harder to trust than one that removes a listed marker.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stripInternalComments } from "./content-checks.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIST = path.join(ROOT, "dist");

async function htmlFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await htmlFiles(full)));
    else if (full.endsWith(".html")) out.push(full);
  }
  return out;
}

const files = await htmlFiles(DIST);
let changedFiles = 0;
let removed = 0;

for (const file of files) {
  const before = await readFile(file, "utf8");
  const result = stripInternalComments(before);
  if (!result.removed) continue;
  /* Written back only when something actually changed, so a rebuild of clean
     output leaves every mtime alone and `dist/` stays byte-identical. */
  await writeFile(file, result.html);
  changedFiles++;
  removed += result.removed;
}

console.log(removed
  ? `  ok  stripped ${removed} internal-note comment(s) from ${changedFiles} of ${files.length} built pages`
  : `  ok  no internal-note comments in ${files.length} built pages`);
