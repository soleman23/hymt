/**
 * Stamp publishDate onto every journal post — the DECISIONS.md D6 launch step.
 *
 *   node tools/set-journal-dates.mjs --date 2026-09-01
 *
 * D6: each post is dated the day it goes live at cutover, never earlier.
 * Until this runs, no journal page sets publishDate, the heroes show the
 * legacy display strings, and Article schema omits dates — all deliberate.
 * The launch runbook (§4.1) runs this once, immediately before the final
 * pre-cutover build. Idempotent: re-running updates the value in place but
 * never touches a post that already carries a DIFFERENT date (a post dated
 * at launch stays dated at launch — never backdate, never re-date).
 */
import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIR = path.join(ROOT, "src", "pages", "travel-journal");

const i = process.argv.indexOf("--date");
const DATE = i === -1 ? null : process.argv[i + 1];
if (!DATE || !/^\d{4}-\d{2}-\d{2}$/.test(DATE)) {
  console.error("Usage: node tools/set-journal-dates.mjs --date YYYY-MM-DD");
  process.exit(1);
}

let stamped = 0, kept = 0;
for (const entry of await readdir(DIR, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const file = path.join(DIR, entry.name, "index.astro");
  let src = await readFile(file, "utf8").catch(() => null);
  if (!src || !src.includes("JournalLayout")) continue;

  const existing = src.match(/publishDate="(\d{4}-\d{2}-\d{2})"/);
  if (existing) {
    kept++;
    continue; // already dated — never re-date a live post
  }
  // Preserve the file's own newline style (the repo checks out CRLF on Windows).
  const nl = src.includes("\r\n") ? "\r\n" : "\n";
  src = src.replace(/<JournalLayout\r?\n/, `<JournalLayout${nl}  publishDate="${DATE}"${nl}`);
  if (!src.includes(`publishDate="${DATE}"`)) {
    console.error(`could not stamp ${entry.name} — <JournalLayout not in expected form`);
    process.exit(1);
  }
  await writeFile(file, src, "utf8");
  stamped++;
  console.log(`  ${entry.name}: ${DATE}`);
}
console.log(`stamped ${stamped} posts, left ${kept} already-dated posts untouched`);
