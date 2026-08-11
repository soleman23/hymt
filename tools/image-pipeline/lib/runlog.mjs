/**
 * Append-only run log and the end-of-run report (brief, step 6).
 *
 * JSONL rather than a single JSON document, because the failure this is
 * designed around is the run dying halfway: a browser crash, an expired
 * session, a laptop lid closing at row 40. Every row is flushed the moment it
 * resolves, so a killed run leaves a complete record of everything up to that
 * point and --resume can pick up from it. A JSON array would have to be
 * rewritten whole on each row and would be truncated garbage after a hard kill.
 *
 * The log is the reason a re-run is cheap. It records the Drive link for every
 * uploaded image, so a row that generated and uploaded but failed to write back
 * to the sheet is repaired on the next run without regenerating anything.
 *
 * Prompts are logged by SHA-256 rather than in full: the log sits next to a
 * public repository and the prompts are the client's, and a 66-row log with a
 * kilobyte of prompt per line is unreadable anyway. The hash still answers the
 * question the log exists to answer — "was this row generated from the prompt
 * that is in the sheet now, or has the prompt been edited since?"
 */
import { appendFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

export const OUTCOME = {
  COMPLETE: "complete",
  GENERATION_FAILED: "generation-failed",
  UPLOAD_FAILED: "upload-failed",
  SHEET_WRITE_FAILED: "sheet-write-failed",
  SHEET_SKIPPED: "sheet-skipped",
  UNLIMITED_UNCONFIRMED: "unlimited-unconfirmed",
  SKIPPED_UNUSABLE: "skipped-unusable",
};

/* Outcomes that mean the row is finished and a resumed run must not redo it. */
const TERMINAL = new Set([OUTCOME.COMPLETE]);

/* Outcomes where the image exists in Drive and only the sheet write is
   outstanding. A resumed run repairs these without touching the generator. */
const REPAIRABLE = new Set([OUTCOME.SHEET_WRITE_FAILED, OUTCOME.SHEET_SKIPPED]);

export const promptHash = (prompt) =>
  createHash("sha256").update(String(prompt ?? ""), "utf8").digest("hex").slice(0, 16);

export function createRunLog(path, { now = () => new Date().toISOString() } = {}) {
  return {
    path,
    async append(entry) {
      const line = JSON.stringify({ timestamp: now(), ...entry });
      await appendFile(path, `${line}\n`, "utf8");
      return line;
    },
  };
}

/** Read a log back, tolerating a torn final line from a hard kill. */
export async function readRunLog(path) {
  let text;
  try {
    text = await readFile(path, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
  const entries = [];
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    try {
      entries.push(JSON.parse(line));
    } catch {
      /* Only ever the last line, and only after an abrupt kill. Dropping it is
         correct: that row never reached a resolved outcome, so a resumed run
         should treat it as unprocessed and do it again. */
    }
  }
  return entries;
}

/**
 * Fold a log into resume state, last entry per row winning — a row retried in a
 * later run must not be judged on its earlier failure.
 *
 * Returns:
 *   done      sheetRow -> entry, for rows that need nothing further
 *   repair    sheetRow -> entry, uploaded but not written back to the sheet
 */
export function resumeState(entries) {
  const latest = new Map();
  for (const entry of entries) {
    if (typeof entry.sheetRow === "number") latest.set(entry.sheetRow, entry);
  }

  const done = new Map();
  const repair = new Map();
  for (const [row, entry] of latest) {
    if (TERMINAL.has(entry.outcome)) done.set(row, entry);
    else if (REPAIRABLE.has(entry.outcome) && entry.imageUrl) repair.set(row, entry);
  }
  return { done, repair };
}

const cell = (v) => String(v ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");

/**
 * The step 6 report: one table of everything attempted, then an explicit
 * needs-review section. Rows that failed after their retries, rows where
 * Unlimited could not be confirmed, and rows skipped because the sheet moved
 * underneath are all called out by name — the brief asks for them to be
 * flagged, and a summary that buries them in a 66-row table has not done that.
 *
 * A dry run is a genuinely different report and not just this one with the
 * links missing. Nothing has been attempted, so there is no pass rate to quote
 * and nothing has failed; presenting an unrun queue as "0 of 9 completed" with
 * every row under Needs review would be alarming and wrong. The dry run shows
 * the plan and why each row was routed the way it was.
 */
export function formatSummary(results, { dryRun = false } = {}) {
  const lines = [];
  lines.push(`## ${dryRun ? "Planned — nothing generated, uploaded or written" : "Run summary"}`, "");

  if (results.length === 0) {
    lines.push("No qualifying rows. Every row with a written prompt is already Complete or Image approved.");
    return lines.join("\n");
  }

  if (dryRun) {
    lines.push("| Row | Tile | Model | Filename | Why this model |");
    lines.push("| --- | --- | --- | --- | --- |");
    for (const r of results) {
      lines.push(
        `| ${cell(r.sheetRow)} | ${cell(r.tileName)} | ${cell(r.model)} | ` +
          `${cell(r.filename)} | ${cell(r.reason)} |`
      );
    }
    lines.push("", `${results.length} row(s) would be generated.`);
  } else {
    lines.push("| Row | Tile | Model | Filename | Drive link | Status |");
    lines.push("| --- | --- | --- | --- | --- | --- |");
    for (const r of results) {
      lines.push(
        `| ${cell(r.sheetRow)} | ${cell(r.tileName)} | ${cell(r.model)} | ` +
          `${cell(r.filename)} | ${r.imageUrl ? `[link](${r.imageUrl})` : "—"} | ${cell(r.outcome)} |`
      );
    }

    const ok = results.filter((r) => r.outcome === OUTCOME.COMPLETE).length;
    lines.push("", `${ok} of ${results.length} rows completed.`);

    const needsReview = results.filter((r) => r.outcome !== OUTCOME.COMPLETE);
    if (needsReview.length) {
      lines.push("", "### Needs review", "");
      for (const r of needsReview) {
        lines.push(
          `- **Row ${cell(r.sheetRow)} — ${cell(r.tileName)}** (${cell(r.outcome)}): ` +
            `${cell(r.error || r.reason || "see run log")}`
        );
      }
    }
  }

  /* Flagged rows are worth surfacing in both modes: before a run they say which
     prompts to watch, after one they say which images to look at. */
  const flagged = results.filter(
    (r) => (r.flags ?? []).length && (dryRun || r.outcome === OUTCOME.COMPLETE)
  );
  if (flagged.length) {
    lines.push("", "### Worth an eyeball", "");
    for (const r of flagged) {
      lines.push(`- **Row ${cell(r.sheetRow)} — ${cell(r.tileName)}**: ${cell(r.flags.join("; "))}`);
    }
  }

  return lines.join("\n");
}
