/**
 * Read and write the HYMT place-card image tracker (Google Sheets).
 *
 * Everything that decides WHICH rows get touched, and WHERE a write lands, is a
 * pure function here so it can be fixture-tested without a network. That split
 * is the whole point of this file: the pipeline writes into a sheet a human is
 * also editing, holding 229 rows of hand-written prompts that exist nowhere
 * else. A write to the wrong row is unrecoverable, so the addressing logic is
 * the part that gets tested hardest.
 *
 * Three guards, each earning its place:
 *
 *   1. HEADER CHECK. Every write is addressed by column letter, so the code
 *      assumes H is Status and I is Image URL. Insert one column in the sheet
 *      and that assumption silently starts overwriting prompts. assertHeader()
 *      makes the run stop instead.
 *
 *   2. ABSOLUTE ROW NUMBERS. The row a value lives on comes from its index in
 *      the API response, never from column A's tile number. Row 1 of the Tiles
 *      tab has filters on; one sort by any column and tile #7 is no longer on
 *      sheet row 8. The two are unrelated and are never converted between.
 *
 *   3. BOUNDED RANGES. writeRangeFor() can only ever produce `H{n}:I{n}`, and
 *      assertSafeWriteRange() re-checks that on the way out. The brief says
 *      columns A-G and J-K must not be altered; this makes it structural rather
 *      than a thing to remember.
 */
import { googleFetch } from "./google-auth.mjs";

const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";

/* Zero-based column indices for the Tiles tab. */
export const COL = {
  NUMBER: 0, // A  #
  DESTINATION: 1, // B  Destination Page
  TILE_NAME: 2, // C  Tile Name
  REGION: 3, // D  Region / Subtitle
  ART_DIRECTION: 4, // E  Placeholder Art Direction
  FILENAME: 5, // F  Suggested Filename
  PROMPT: 6, // G  Image Prompt
  STATUS: 7, // H  Status
  IMAGE_URL: 8, // I  Image URL
  NOTES: 9, // J  Notes
  PAGE_URL: 10, // K  Page URL
};

/* Only the columns the pipeline reads or writes are asserted. The others may be
   renamed freely by whoever owns the sheet without breaking the run. */
const EXPECTED_HEADER = {
  [COL.DESTINATION]: "Destination Page",
  [COL.TILE_NAME]: "Tile Name",
  [COL.FILENAME]: "Suggested Filename",
  [COL.PROMPT]: "Image Prompt",
  [COL.STATUS]: "Status",
  [COL.IMAGE_URL]: "Image URL",
};

export const ROW_STATE = {
  QUALIFYING: "qualifying",
  PROTECTED: "protected",
  UNUSABLE: "unusable",
  OTHER: "other",
};

const norm = (v) => String(v ?? "").trim();
const lower = (v) => norm(v).toLowerCase();

/** A1 notation needs single quotes around a tab name containing spaces, and
 *  doubles any literal quote inside it. "Tiles" needs neither, but the pipeline
 *  is configurable and a tab named "Tiles (v2)" would otherwise build a range
 *  the API rejects with a parse error that names no cause. */
export function quoteSheetName(tab) {
  return /^[A-Za-z0-9_]+$/.test(tab) ? tab : `'${String(tab).replace(/'/g, "''")}'`;
}

/**
 * Verify the sheet still has the column layout the pipeline addresses by
 * letter. Returns nothing; throws with the specific mismatch.
 */
export function assertHeader(headerRow) {
  const cells = headerRow ?? [];
  const problems = [];
  for (const [idx, expected] of Object.entries(EXPECTED_HEADER)) {
    const actual = norm(cells[Number(idx)]);
    if (lower(actual) !== lower(expected)) {
      const letter = String.fromCharCode(65 + Number(idx));
      problems.push(`  column ${letter}: expected "${expected}", found "${actual || "(empty)"}"`);
    }
  }
  if (problems.length) {
    throw new Error(
      "The tracker's column layout has changed, so writing by column letter is no " +
        "longer safe. Refusing to touch the sheet.\n\n" +
        problems.join("\n") +
        "\n\nIf a column was deliberately added or renamed, update COL and " +
        "EXPECTED_HEADER in lib/tracker.mjs to match before re-running."
    );
  }
}

/**
 * Turn the raw values array into row records carrying their absolute sheet row.
 * `values[0]` is the header on sheet row 1, so data starts at index 1 / row 2.
 * Trailing empty cells are omitted by the API, so every row is padded.
 */
export function parseRows(values) {
  const rows = [];
  for (let i = 1; i < (values?.length ?? 0); i += 1) {
    const cells = values[i] ?? [];
    /* An entirely blank line inside the data block is spacing, not a tile. */
    if (cells.every((c) => norm(c) === "")) continue;
    rows.push({
      sheetRow: i + 1,
      tileNumber: norm(cells[COL.NUMBER]),
      destination: norm(cells[COL.DESTINATION]),
      tileName: norm(cells[COL.TILE_NAME]),
      region: norm(cells[COL.REGION]),
      artDirection: norm(cells[COL.ART_DIRECTION]),
      filename: norm(cells[COL.FILENAME]),
      /* The prompt is the one field never normalised beyond trimming the outer
         whitespace: it goes to the generator verbatim, bracketed notes and all. */
      prompt: String(cells[COL.PROMPT] ?? "").trim(),
      status: norm(cells[COL.STATUS]),
      imageUrl: norm(cells[COL.IMAGE_URL]),
    });
  }
  return rows;
}

/**
 * Decide what the pipeline may do with a row.
 *
 * PROTECTED wins over every other test, including the unusable check — a
 * Complete row with a blank prompt is finished, not broken, and must not be
 * reported as something needing attention.
 */
export function classifyRow(row, opts = {}) {
  const qualifying = lower(opts.qualifyingStatus ?? "prompt written");
  const protectedSet = new Set(
    (opts.protectedStatuses ?? ["complete", "image approved"]).map(lower)
  );

  const status = lower(row.status);
  if (protectedSet.has(status)) return ROW_STATE.PROTECTED;
  if (status !== qualifying) return ROW_STATE.OTHER;
  /* Qualifying by status but missing what generation needs. Reported, never
     silently dropped — a blank prompt cell is usually a paste that went astray. */
  if (!row.filename || !row.prompt) return ROW_STATE.UNUSABLE;
  return ROW_STATE.QUALIFYING;
}

/**
 * Partition every row by what the pipeline may do with it. The queue keeps
 * sheet order, which is also destination order, so "first tile of a
 * destination" is meaningful downstream for hero routing.
 */
export function selectRows(rows, opts = {}) {
  const out = { queue: [], protected: [], unusable: [], other: [] };
  const bucket = {
    [ROW_STATE.QUALIFYING]: out.queue,
    [ROW_STATE.PROTECTED]: out.protected,
    [ROW_STATE.UNUSABLE]: out.unusable,
    [ROW_STATE.OTHER]: out.other,
  };
  for (const row of rows) bucket[classifyRow(row, opts)].push(row);
  return out;
}

/**
 * The only range this pipeline is ever allowed to write: Status and Image URL
 * on one row. Columns A-G and J-K are unreachable from here by construction.
 */
export function writeRangeFor(sheetTab, sheetRow) {
  if (!Number.isInteger(sheetRow) || sheetRow < 2) {
    /* Row 1 is the header. A non-integer means an index leaked in where a row
       number belongs, which would otherwise write to "H undefined". */
    throw new Error(`Refusing to build a write range for sheet row ${sheetRow}`);
  }
  return `${quoteSheetName(sheetTab)}!H${sheetRow}:I${sheetRow}`;
}

/**
 * Re-check a range immediately before it is sent. writeRangeFor() is the only
 * producer today, so this is belt-and-braces against a future call site that
 * builds a range by hand.
 */
export function assertSafeWriteRange(range) {
  const cells = String(range).split("!").pop();
  if (!/^H(\d+):I\1$/.test(cells)) {
    throw new Error(
      `Unsafe write range "${range}". The pipeline may only write H{row}:I{row} ` +
        `— columns A-G (row data and prompts) and J-K (Notes, Page URL) are off limits.`
    );
  }
}

/* ------------------------------------------------------------------ network */

/** Read the tracker and return { header, rows }. */
export async function readTracker(getAccessToken, config) {
  const range = `${quoteSheetName(config.sheetTab)}!${config.readRange}`;
  const url =
    `${SHEETS_API}/${config.spreadsheetId}/values/${encodeURIComponent(range)}` +
    `?valueRenderOption=UNFORMATTED_VALUE&majorDimension=ROWS`;

  const res = await googleFetch(getAccessToken, url);
  const { values } = await res.json();
  if (!values || values.length === 0) {
    throw new Error(`No data returned for ${range}. Check sheetTab and readRange in config.json.`);
  }

  assertHeader(values[0]);
  return { header: values[0], rows: parseRows(values) };
}

/**
 * Read one row's current Status. Used immediately before a write so a row a
 * human marked Complete while the run was generating is never overwritten.
 */
export async function readStatusAt(getAccessToken, config, sheetRow) {
  const range = `${quoteSheetName(config.sheetTab)}!H${sheetRow}`;
  const url = `${SHEETS_API}/${config.spreadsheetId}/values/${encodeURIComponent(range)}`;
  const res = await googleFetch(getAccessToken, url);
  const { values } = await res.json();
  return norm(values?.[0]?.[0]);
}

/**
 * Write Status and Image URL for one row, but only if it is still qualifying.
 *
 * Returns { written: true } or { written: false, reason, currentStatus } — a
 * refusal is a normal outcome to report, not an exception, because the run
 * should carry on and the summary should say which rows were left alone.
 *
 * RAW, not USER_ENTERED: nothing written here should ever be parsed as a
 * formula or reformatted by the sheet.
 */
export async function writeRowResult(getAccessToken, config, sheetRow, { status, imageUrl }) {
  if (!imageUrl) {
    /* The brief is explicit: never write a Status update without a real link.
       Reaching here means an upload path returned success with no URL. */
    throw new Error(`Refusing to mark row ${sheetRow} "${status}" with no image URL.`);
  }

  const current = await readStatusAt(getAccessToken, config, sheetRow);
  if (lower(current) !== lower(config.qualifyingStatus)) {
    return {
      written: false,
      reason: `status changed to "${current || "(empty)"}" while the run was in progress`,
      currentStatus: current,
    };
  }

  const range = writeRangeFor(config.sheetTab, sheetRow);
  assertSafeWriteRange(range);

  const url =
    `${SHEETS_API}/${config.spreadsheetId}/values/${encodeURIComponent(range)}` +
    `?valueInputOption=RAW&includeValuesInResponse=true`;

  const res = await googleFetch(getAccessToken, url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ range, majorDimension: "ROWS", values: [[status, imageUrl]] }),
  });

  /* Trust the sheet's echo rather than the 200. If what came back is not what
     was sent, the row is reported unwritten so a human looks at it. */
  const body = await res.json();
  const echoed = body.updatedData?.values?.[0] ?? [];
  if (norm(echoed[0]) !== norm(status) || norm(echoed[1]) !== norm(imageUrl)) {
    return {
      written: false,
      reason: `sheet echoed back ${JSON.stringify(echoed)} instead of the values sent`,
      currentStatus: norm(echoed[0]),
    };
  }
  return { written: true };
}
