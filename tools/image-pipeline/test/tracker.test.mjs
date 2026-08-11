/**
 * Fixture tests for the tracker's addressing and filtering.
 *
 *   node test/tracker.test.mjs
 *
 * Why this file exists: everything it covers is a way to quietly corrupt a
 * sheet holding 229 hand-written prompts that exist nowhere else. A green run
 * of the real pipeline would prove none of it — the dangerous cases are a
 * column being inserted, a row being sorted, and a status the filter did not
 * anticipate, and none of those show up on a normal day.
 *
 * So every check asserts BOTH directions: that the safe shape is allowed AND
 * that each specific unsafe shape is refused. A guard that cannot go red is
 * worse than no guard, because it reads like protection.
 *
 * The predicates are imported from ../lib/tracker.mjs, the same module run.mjs
 * uses. Nothing is re-implemented here — a copy would let these stay green
 * while the pipeline drifted, which is the exact failure they exist to prevent.
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import {
  COL, ROW_STATE, assertHeader, parseRows, classifyRow, selectRows,
  writeRangeFor, assertSafeWriteRange, quoteSheetName,
} from "../lib/tracker.mjs";

let pass = 0;
const failures = [];
const t = (name, actual, expected) => {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) { pass++; return; }
  failures.push(`${name}\n      expected ${e}, got ${a}`);
};
/** Assert a call throws. `throws` is the both-directions partner of every `t`. */
const throws = (name, fn) => {
  try { fn(); } catch { pass++; return; }
  failures.push(`${name}\n      expected it to throw, it returned normally`);
};
const noThrow = (name, fn) => {
  try { fn(); pass++; } catch (err) {
    failures.push(`${name}\n      expected no throw, got: ${err.message.split("\n")[0]}`);
  }
};

const FIXTURE = JSON.parse(
  await readFile(fileURLToPath(new URL("./fixture-tracker.json", import.meta.url)), "utf8")
);
const HEADER = FIXTURE.values[0];
const rows = parseRows(FIXTURE.values);

/* ── header check: the guard that stops writes landing in the wrong column ── */

noThrow("header: the real layout is accepted", () => assertHeader(HEADER));

throws("header: a column inserted before Status is refused", () => {
  const shifted = [...HEADER];
  shifted.splice(COL.STATUS, 0, "Reviewer");
  assertHeader(shifted);
});

throws("header: Status renamed is refused", () => {
  const renamed = [...HEADER];
  renamed[COL.STATUS] = "State";
  assertHeader(renamed);
});

throws("header: Image URL and Notes swapped is refused", () => {
  const swapped = [...HEADER];
  [swapped[COL.IMAGE_URL], swapped[COL.NOTES]] = [swapped[COL.NOTES], swapped[COL.IMAGE_URL]];
  assertHeader(swapped);
});

noThrow("header: a column the pipeline never touches may be renamed freely", () => {
  const renamed = [...HEADER];
  renamed[COL.ART_DIRECTION] = "Art notes";
  renamed[COL.PAGE_URL] = "Live URL";
  assertHeader(renamed);
});

noThrow("header: case and padding differences are tolerated", () => {
  assertHeader(HEADER.map((h) => `  ${String(h).toUpperCase()}  `));
});

/* ── row numbering: absolute sheet rows, never tile numbers ── */

t("parse: the header is not a data row", rows.some((r) => r.sheetRow === 1), false);
t("parse: the first data row is sheet row 2", rows[0].sheetRow, 2);
t("parse: sheet row 2 is tile #1 — the two are not the same number",
  [rows[0].sheetRow, rows[0].tileNumber], [2, "1"]);
t("parse: a blank spacer line is not a tile", rows.some((r) => r.sheetRow === 6), false);
t("parse: rows after the spacer keep their true sheet row",
  rows.find((r) => r.tileName === "Santorini").sheetRow, 7);
t("parse: a row with trailing cells omitted still parses",
  (() => { const r = rows.find((x) => x.tileName === "Hakone"); return [r.status, r.imageUrl]; })(),
  ["Prompt written", ""]);
t("parse: the prompt keeps its bracketed and punctuated text intact",
  rows.find((r) => r.tileName === "Mount Fuji").prompt.includes("Mount Fuji seen across Lake Kawaguchi"),
  true);

/* ── classification ── */

const row = (name) => rows.find((r) => r.tileName === name);
const OPTS = { qualifyingStatus: "prompt written", protectedStatuses: ["complete", "image approved"] };

t("classify: 'Prompt written' qualifies", classifyRow(row("South Africa"), OPTS), ROW_STATE.QUALIFYING);
t("classify: 'PROMPT WRITTEN' qualifies too — the match is case-insensitive",
  classifyRow(row("Tuscany"), OPTS), ROW_STATE.QUALIFYING);
t("classify: 'Complete' is protected", classifyRow(row("Kenya & Tanzania"), OPTS), ROW_STATE.PROTECTED);
t("classify: 'Image approved' is protected", classifyRow(row("Venice"), OPTS), ROW_STATE.PROTECTED);
t("classify: an unrecognised status is left alone", classifyRow(row("Reykjavik"), OPTS), ROW_STATE.OTHER);
t("classify: qualifying with no prompt is unusable, not silently dropped",
  classifyRow(row("Crete"), OPTS), ROW_STATE.UNUSABLE);
t("classify: qualifying with no filename is unusable",
  classifyRow(row("Amalfi Coast"), OPTS), ROW_STATE.UNUSABLE);
t("classify: a Complete row with a blank prompt is finished, not broken",
  classifyRow(row("Kenya & Tanzania"), OPTS), ROW_STATE.PROTECTED);
t("classify: surrounding whitespace does not stop a row qualifying",
  classifyRow({ ...row("South Africa"), status: "  Prompt written  " }, OPTS), ROW_STATE.QUALIFYING);
t("classify: a status that merely contains the phrase does not qualify",
  classifyRow({ ...row("South Africa"), status: "Prompt written?" }, OPTS), ROW_STATE.OTHER);

/* ── selection ── */

const selected = selectRows(rows, OPTS);

t("select: the queue holds exactly the generatable rows",
  selected.queue.map((r) => r.tileName),
  ["South Africa", "Botswana", "Namibia", "Santorini", "Mykonos", "Tuscany", "Kyoto", "Mount Fuji", "Hakone"]);
t("select: protected rows are never queued",
  selected.queue.some((r) => ["Kenya & Tanzania", "Venice"].includes(r.tileName)), false);
t("select: unusable rows are surfaced by name",
  selected.unusable.map((r) => r.tileName), ["Crete", "Amalfi Coast"]);
t("select: unusable rows are not queued for generation",
  selected.queue.some((r) => ["Crete", "Amalfi Coast"].includes(r.tileName)), false);
t("select: every row lands in exactly one bucket",
  selected.queue.length + selected.protected.length + selected.unusable.length + selected.other.length,
  rows.length);
t("select: the queue keeps sheet order, which hero routing depends on",
  selected.queue.map((r) => r.sheetRow),
  [...selected.queue.map((r) => r.sheetRow)].sort((a, b) => a - b));

/* ── write ranges: columns A-G and J-K must be unreachable ── */

t("range: a write targets Status and Image URL on one row", writeRangeFor("Tiles", 7), "Tiles!H7:I7");
t("range: a tab name needing quotes is quoted", writeRangeFor("Tiles v2", 7), "'Tiles v2'!H7:I7");
t("range: an apostrophe in a tab name is doubled", quoteSheetName("Mark's Tiles"), "'Mark''s Tiles'");

throws("range: the header row is refused", () => writeRangeFor("Tiles", 1));
throws("range: row 0 is refused", () => writeRangeFor("Tiles", 0));
throws("range: a negative row is refused", () => writeRangeFor("Tiles", -3));
throws("range: a non-integer row is refused", () => writeRangeFor("Tiles", 7.5));
throws("range: an undefined row is refused rather than becoming 'Hundefined'",
  () => writeRangeFor("Tiles", undefined));

noThrow("safe-range: what writeRangeFor produces is accepted",
  () => assertSafeWriteRange(writeRangeFor("Tiles", 42)));
noThrow("safe-range: a quoted tab name is still accepted",
  () => assertSafeWriteRange("'Tiles v2'!H42:I42"));

throws("safe-range: a range starting at A is refused", () => assertSafeWriteRange("Tiles!A7:I7"));
throws("safe-range: a range covering the prompt column is refused", () => assertSafeWriteRange("Tiles!G7:I7"));
throws("safe-range: a range reaching Notes is refused", () => assertSafeWriteRange("Tiles!H7:J7"));
throws("safe-range: a range reaching Page URL is refused", () => assertSafeWriteRange("Tiles!H7:K7"));
throws("safe-range: Status alone is refused — both cells are written together",
  () => assertSafeWriteRange("Tiles!H7"));
throws("safe-range: a multi-row range is refused", () => assertSafeWriteRange("Tiles!H7:I9"));
throws("safe-range: a whole-column range is refused", () => assertSafeWriteRange("Tiles!H:I"));
throws("safe-range: the whole sheet is refused", () => assertSafeWriteRange("Tiles!A1:K1000"));

/* Row numbers must match on both sides. "H7:I70" is a 64-row range that a
   looser pattern would wave through. */
throws("safe-range: mismatched row numbers are refused", () => assertSafeWriteRange("Tiles!H7:I70"));

/* ── report ── */

if (failures.length) {
  process.stderr.write(`\ntracker: ${pass} passed, ${failures.length} FAILED\n\n`);
  for (const f of failures) process.stderr.write(`  ✗ ${f}\n\n`);
  process.exit(1);
}
process.stdout.write(`tracker: ${pass} checks passed\n`);
