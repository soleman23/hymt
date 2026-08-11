/**
 * Fixture tests for the run log and --resume.
 *
 *   node test/runlog.test.mjs
 *
 * Why this file exists: resume decides, for every row, whether an image gets
 * generated again. Both ways of getting that wrong are expensive and quiet.
 * Treat a finished row as unfinished and a resumed run regenerates images that
 * were already in Drive, overwriting good work and spending an hour doing it.
 * Treat an unfinished row as finished and it is dropped from the run without
 * ever appearing in a failure list.
 *
 * The distinction the tests care about most is between a row that failed with
 * an image already uploaded (repair the sheet only, never regenerate) and one
 * that failed without (must regenerate). Those two share an outcome in the log
 * and are told apart solely by whether a Drive link was recorded.
 */
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  OUTCOME, promptHash, createRunLog, readRunLog, resumeState, formatSummary,
} from "../lib/runlog.mjs";

let pass = 0;
const failures = [];
const t = (name, actual, expected) => {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) { pass++; return; }
  failures.push(`${name}\n      expected ${e}, got ${a}`);
};

const dir = await mkdtemp(join(tmpdir(), "hymt-runlog-"));

/* ── prompt hashing: "is this the prompt the sheet has now?" ── */

t("hash: the same prompt hashes the same", promptHash("a quiet harbour"), promptHash("a quiet harbour"));
t("hash: an edited prompt hashes differently",
  promptHash("a quiet harbour") === promptHash("a quiet harbour at dawn"), false);
t("hash: whitespace is significant — an edit is an edit",
  promptHash("a quiet harbour") === promptHash("a quiet harbour "), false);
t("hash: the full prompt is not stored in the log", promptHash("x").length, 16);

/* ── reading a log back ── */

t("read: a log that does not exist yet is empty", await readRunLog(join(dir, "nope.jsonl")), []);

const tornPath = join(dir, "torn.jsonl");
await writeFile(
  tornPath,
  `{"sheetRow":3,"outcome":"complete","imageUrl":"https://drive.test/a"}\n` +
    `{"sheetRow":4,"outcome":"complete","imageUrl":"https://drive.test/b"}\n` +
    `{"sheetRow":5,"outcome":"comp`, // killed mid-write
  "utf8"
);
const torn = await readRunLog(tornPath);
t("read: a run killed mid-write still yields its complete lines", torn.length, 2);
t("read: the torn line is dropped, so that row is retried not trusted",
  torn.some((e) => e.sheetRow === 5), false);

const roundTripPath = join(dir, "roundtrip.jsonl");
const runLog = createRunLog(roundTripPath, { now: () => "2026-08-11T00:00:00.000Z" });
await runLog.append({ sheetRow: 9, outcome: OUTCOME.COMPLETE, imageUrl: "https://drive.test/c" });
await runLog.append({ sheetRow: 10, outcome: OUTCOME.GENERATION_FAILED, error: "timed out" });
const roundTrip = await readRunLog(roundTripPath);
t("read: entries round-trip", roundTrip.length, 2);
t("read: every entry is timestamped", roundTrip[0].timestamp, "2026-08-11T00:00:00.000Z");
t("read: the log is append-only, not rewritten", roundTrip[1].sheetRow, 10);

/* ── resume classification ── */

const state = resumeState([
  { sheetRow: 2, outcome: OUTCOME.COMPLETE, imageUrl: "https://drive.test/2" },
  { sheetRow: 3, outcome: OUTCOME.SHEET_WRITE_FAILED, imageUrl: "https://drive.test/3" },
  { sheetRow: 4, outcome: OUTCOME.SHEET_SKIPPED, imageUrl: "https://drive.test/4" },
  { sheetRow: 5, outcome: OUTCOME.GENERATION_FAILED, imageUrl: null },
  { sheetRow: 6, outcome: OUTCOME.SHEET_WRITE_FAILED, imageUrl: null },
  { sheetRow: 7, outcome: OUTCOME.UPLOAD_FAILED, imageUrl: null },
]);

t("resume: a completed row is done", state.done.has(2), true);
t("resume: a completed row is not queued for repair", state.repair.has(2), false);

t("resume: uploaded but the sheet write failed -> repair, do not regenerate", state.repair.has(3), true);
t("resume: that row is not treated as finished", state.done.has(3), false);
t("resume: repair carries the link forward", state.repair.get(3).imageUrl, "https://drive.test/3");

t("resume: uploaded but the sheet moved underneath -> repair", state.repair.has(4), true);

t("resume: a generation failure must be redone", state.done.has(5), false);
t("resume: and it is not a repair — there is no image yet", state.repair.has(5), false);

/* The pair that matters most: same outcome, told apart only by the link. */
t("resume: a sheet-write failure with NO link is not repairable", state.repair.has(6), false);
t("resume: so it is regenerated rather than silently skipped", state.done.has(6), false);

t("resume: an upload failure must be redone", state.done.has(7) || state.repair.has(7), false);

/* ── last entry per row wins ── */

const retried = resumeState([
  { sheetRow: 8, outcome: OUTCOME.GENERATION_FAILED, imageUrl: null },
  { sheetRow: 8, outcome: OUTCOME.COMPLETE, imageUrl: "https://drive.test/8" },
]);
t("resume: a row that failed and was later completed is done", retried.done.has(8), true);

const regressed = resumeState([
  { sheetRow: 9, outcome: OUTCOME.COMPLETE, imageUrl: "https://drive.test/9" },
  { sheetRow: 9, outcome: OUTCOME.GENERATION_FAILED, imageUrl: null },
]);
t("resume: a later failure supersedes an earlier success", regressed.done.has(9), false);

t("resume: entries with no row number are ignored",
  resumeState([{ outcome: OUTCOME.UNLIMITED_UNCONFIRMED }]).done.size, 0);

/* ── the report ── */

const runRows = [
  { sheetRow: 3, tileName: "South Africa", model: "Seedream 5.0 Pro", filename: "a.jpg", outcome: OUTCOME.COMPLETE, imageUrl: "https://drive.test/a", flags: ["6 exclusions"] },
  { sheetRow: 4, tileName: "Botswana", model: "Seedream 5.0 Pro", filename: "b.jpg", outcome: OUTCOME.GENERATION_FAILED, imageUrl: null, error: "timed out after 2 retries", flags: [] },
];
const report = formatSummary(runRows);
/** One section's body, stopping at the next heading — otherwise a check on
 *  "Needs review" also sees everything printed after it. */
const section = (text, heading) => (text.split(`### ${heading}`)[1] ?? "").split("###")[0];

t("report: a failed row is called out by name, not left in the table",
  report.includes("### Needs review") && section(report, "Needs review").includes("Botswana"), true);
t("report: its cause is stated", section(report, "Needs review").includes("timed out after 2 retries"), true);
t("report: the pass rate is quoted", report.includes("1 of 2 rows completed"), true);
t("report: a successful row is not in Needs review",
  section(report, "Needs review").includes("South Africa"), false);
t("report: an exclusion-heavy success is flagged for a look",
  section(report, "Worth an eyeball").includes("South Africa"), true);
t("report: a failed row with no flags is not in Worth an eyeball",
  section(report, "Worth an eyeball").includes("Botswana"), false);

const dry = formatSummary(
  [{ sheetRow: 3, tileName: "South Africa", model: "Seedream 5.0 Pro", filename: "a.jpg", reason: "hero tile", flags: [] }],
  { dryRun: true }
);
t("report: a dry run does not claim anything failed", dry.includes("Needs review"), false);
t("report: a dry run does not quote a pass rate", dry.includes("rows completed"), false);
t("report: a dry run says why each model was picked", dry.includes("hero tile"), true);
t("report: a dry run says nothing was written",
  dry.includes("nothing generated, uploaded or written"), true);

t("report: an empty queue reads as nothing to do, not as a failure",
  formatSummary([]).includes("No qualifying rows"), true);

await rm(dir, { recursive: true, force: true });

/* ── report ── */

if (failures.length) {
  process.stderr.write(`\nrunlog: ${pass} passed, ${failures.length} FAILED\n\n`);
  for (const f of failures) process.stderr.write(`  ✗ ${f}\n\n`);
  process.exit(1);
}
process.stdout.write(`runlog: ${pass} checks passed\n`);
