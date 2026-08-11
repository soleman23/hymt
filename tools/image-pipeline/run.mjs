#!/usr/bin/env node
/**
 * HYMT place-card image pipeline — CLI entry point.
 *
 * Reads the tracker, generates each queued tile's image on higgsfield.ai under
 * Unlimited, uploads it to Drive, and marks the row Complete with its link.
 *
 *   node run.mjs --login                  sign in once; the profile keeps the session
 *   node run.mjs --probe                  dump the live DOM and check selectors.json
 *   node run.mjs --dry-run                offline: fixture in, work queue out
 *   node run.mjs --dry-run --live         real sheet read, still writes nothing
 *   node run.mjs --limit 3                the pilot
 *   node run.mjs --resume                 skip rows the run log already finished
 *   node run.mjs --rows 14,15,16          specific sheet rows
 *   node run.mjs --rows 14 --retry-with-nano   re-do one row on Nano Banana Pro
 *
 * Ordering is deliberate: generate, then upload, then write the sheet. Each step
 * only runs on the verified output of the one before, so the sheet can never
 * claim an image exists that does not. The reverse failure — an image in Drive
 * whose row was not updated — is recoverable, and --resume repairs it from the
 * run log without regenerating anything.
 *
 * Every row is isolated: one failure is logged and the run moves on. The single
 * exception is Unlimited going unconfirmed, which stops everything, because
 * continuing would spend credits on every remaining row.
 */
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { loadCredentials, createTokenProvider } from "./lib/google-auth.mjs";
import { readTracker, parseRows, selectRows, writeRowResult } from "./lib/tracker.mjs";
import { planQueue } from "./lib/model-router.mjs";
import { uploadImage, assertFolderWritable } from "./lib/drive.mjs";
import {
  createRunLog,
  readRunLog,
  resumeState,
  formatSummary,
  promptHash,
  OUTCOME,
} from "./lib/runlog.mjs";
import {
  loadSelectors,
  openBrowser,
  isLoggedIn,
  runLogin,
  runProbe,
  confirmUnlimited,
  generateImage,
  UnlimitedNotConfirmedError,
} from "./lib/higgsfield.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const log = (msg = "") => process.stdout.write(`${msg}\n`);

function parseArgs(argv) {
  const args = {
    login: false, probe: false, dryRun: false, live: false, resume: false,
    headless: false, retryWithNano: false, limit: null, rows: null, model: null,
    fixture: null,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => argv[++i];
    switch (arg) {
      case "--login": args.login = true; break;
      case "--probe": args.probe = true; break;
      case "--dry-run": args.dryRun = true; break;
      case "--live": args.live = true; break;
      case "--resume": args.resume = true; break;
      case "--headless": args.headless = true; break;
      case "--retry-with-nano": args.retryWithNano = true; break;
      case "--limit": args.limit = Number(next()); break;
      case "--model": args.model = next(); break;
      case "--fixture": args.fixture = next(); break;
      case "--rows":
        args.rows = new Set(String(next()).split(",").map((n) => Number(n.trim())).filter(Boolean));
        break;
      case "--help": case "-h": args.help = true; break;
      default:
        throw new Error(`Unknown argument "${arg}". Run with --help.`);
    }
  }
  if (args.limit !== null && !Number.isInteger(args.limit)) {
    throw new Error("--limit needs a whole number, e.g. --limit 3");
  }
  return args;
}

async function loadConfig() {
  let config;
  try {
    config = JSON.parse(await readFile(join(HERE, "config.json"), "utf8"));
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
    /* Running straight from the example is fine — the ids in it are the live
       ones. Only the secrets genuinely have to be supplied. */
    config = JSON.parse(await readFile(join(HERE, "config.example.json"), "utf8"));
    log("No config.json; using config.example.json.\n");
  }
  return {
    ...config,
    profileDir: join(HERE, ".browser-profile"),
    downloadsDir: join(HERE, "downloads"),
    runLogPath: join(HERE, "run-log.jsonl"),
  };
}

/** Build the work queue: qualifying rows, routed, then narrowed by the flags. */
function buildQueue(rows, config, args, resume) {
  const selected = selectRows(rows, config);
  let planned = planQueue(selected.queue, {
    override: args.model,
    retryWithNano: args.retryWithNano,
    config,
  });

  if (args.rows) planned = planned.filter((r) => args.rows.has(r.sheetRow));
  if (args.resume) planned = planned.filter((r) => !resume.done.has(r.sheetRow));
  if (args.limit !== null) planned = planned.slice(0, args.limit);

  return { planned, selected };
}

function reportSelection(selected, planned, config) {
  log(`Tracker: ${selected.queue.length + selected.protected.length + selected.other.length + selected.unusable.length} data rows`);
  log(`  ${selected.queue.length} qualifying (Status = "${config.qualifyingStatus}")`);
  log(`  ${selected.protected.length} protected (Complete / Image approved) — never touched`);
  log(`  ${selected.other.length} other statuses — skipped`);
  if (selected.unusable.length) {
    log(`  ${selected.unusable.length} qualifying but unusable:`);
    for (const row of selected.unusable) {
      const missing = [!row.filename && "filename (F)", !row.prompt && "prompt (G)"].filter(Boolean);
      log(`      row ${row.sheetRow} "${row.tileName}" — missing ${missing.join(" and ")}`);
    }
  }
  log(`\n${planned.length} row(s) queued for this run.\n`);
}

/* ----------------------------------------------------------------- the run */

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    log(await readFile(new URL(import.meta.url)).then((b) =>
      b.toString().split("\n").slice(2, 22).map((l) => l.replace(/^ \* ?/, "")).join("\n")
    ));
    return 0;
  }

  const config = await loadConfig();
  if (args.login) return (await runLogin(config)) ? 0 : 1;
  if (args.probe) {
    const report = await runProbe(config);
    return report.every((r) => r.found) ? 0 : 1;
  }

  /* --- step 1: the tracker ------------------------------------------- */
  const offline = args.dryRun && !args.live;
  let rows;
  let getAccessToken = null;

  if (offline) {
    const fixturePath = args.fixture ?? join(HERE, "test", "fixture-tracker.json");
    log(`Offline dry run against ${fixturePath}\n`);
    rows = parseRows(JSON.parse(await readFile(fixturePath, "utf8")).values);
  } else {
    getAccessToken = createTokenProvider(await loadCredentials());
    log("Reading the tracker...");
    ({ rows } = await readTracker(getAccessToken, config));
  }

  const resume = resumeState(args.resume ? await readRunLog(config.runLogPath) : []);
  const { planned, selected } = buildQueue(rows, config, args, resume);
  reportSelection(selected, planned, config);

  if (args.dryRun) {
    const preview = planned.map((row) => ({
      sheetRow: row.sheetRow,
      tileName: `${row.tileName}${row.region ? ` (${row.region})` : ""}`,
      model: `${row.plan.model} @ ${row.plan.resolution} ${row.plan.aspectRatio}`,
      filename: row.filename,
      reason: row.plan.reason,
      flags: row.plan.flags,
    }));
    log(formatSummary(preview, { dryRun: true }));
    return 0;
  }

  if (planned.length === 0) {
    log("Nothing to do.");
    return 0;
  }

  /* --- pre-flight ------------------------------------------------------ */
  log("Checking the Drive folder is writable...");
  const folder = await assertFolderWritable(getAccessToken, config);
  log(`  "${folder.name}" ok\n`);

  const selectors = await loadSelectors();
  const runLog = createRunLog(config.runLogPath);
  const context = await openBrowser(config, { headless: args.headless });
  const page = context.pages()[0] ?? (await context.newPage());
  const results = [];

  try {
    await page.goto(config.higgsfieldUrl, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(4000);

    if (!(await isLoggedIn(page, selectors))) {
      throw new Error("Not signed in to higgsfield.ai. Run `node run.mjs --login` first.");
    }
    /* Confirm Unlimited before the first row, so a misconfigured session costs
       nothing rather than one generation. */
    await confirmUnlimited(page, selectors, { autoEnable: config.autoEnableUnlimited !== false });
    log("Unlimited confirmed active.\n");

    const maxAttempts = config.maxAttemptsPerRow ?? 3;

    for (const [index, row] of planned.entries()) {
      const label = `[${index + 1}/${planned.length}] row ${row.sheetRow} — ${row.tileName}`;
      const base = {
        sheetRow: row.sheetRow,
        tileNumber: row.tileNumber,
        tileName: row.tileName,
        destination: row.destination,
        region: row.region,
        filename: row.filename,
        model: row.plan.model,
        resolution: row.plan.resolution,
        promptSha256: promptHash(row.prompt),
        flags: row.plan.flags,
      };

      try {
        /* Repair path: the image is already in Drive from an earlier run and
           only the sheet write is outstanding. Never regenerate for this. */
        const repairable = resume.repair.get(row.sheetRow);
        let imageUrl = repairable?.imageUrl ?? null;

        if (imageUrl) {
          log(`${label} — already uploaded, repairing the sheet write only`);
        } else {
          log(`${label}\n    ${row.plan.model} @ ${row.plan.resolution} — ${row.plan.reason}`);

          let generated = null;
          let lastError = null;
          for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
            try {
              generated = await generateImage(page, context, selectors, config, {
                prompt: row.prompt,
                filename: row.filename,
                plan: row.plan,
              });
              break;
            } catch (err) {
              if (err instanceof UnlimitedNotConfirmedError) throw err;
              lastError = err;
              log(`    attempt ${attempt}/${maxAttempts} failed: ${err.message.split("\n")[0]}`);
              if (attempt < maxAttempts) {
                await page.reload({ waitUntil: "domcontentloaded" }).catch(() => {});
                await page.waitForTimeout(4000);
              }
            }
          }
          if (!generated) throw lastError ?? new Error("Generation failed for an unknown reason.");

          log(`    generated, uploading ${row.filename}`);
          const uploaded = await uploadImage(
            getAccessToken, config, generated.localPath, row.filename
          );
          imageUrl = uploaded.webViewLink;
          /* Logged before the sheet write, so a crash between the two still
             leaves the link recorded and --resume can finish the job. */
          await runLog.append({ ...base, outcome: OUTCOME.SHEET_WRITE_FAILED, imageUrl, note: "uploaded, sheet write pending" });
        }

        const write = await writeRowResult(getAccessToken, config, row.sheetRow, {
          status: config.completedStatus ?? "Complete",
          imageUrl,
        });

        if (write.written) {
          log(`    row marked ${config.completedStatus ?? "Complete"}\n`);
          const entry = { ...base, outcome: OUTCOME.COMPLETE, imageUrl };
          await runLog.append(entry);
          results.push(entry);
        } else {
          log(`    sheet not updated: ${write.reason}\n`);
          const entry = { ...base, outcome: OUTCOME.SHEET_SKIPPED, imageUrl, reason: write.reason };
          await runLog.append(entry);
          results.push(entry);
        }
      } catch (err) {
        if (err instanceof UnlimitedNotConfirmedError) throw err;
        log(`    FAILED: ${err.message.split("\n")[0]}\n`);
        const entry = { ...base, outcome: OUTCOME.GENERATION_FAILED, imageUrl: null, error: err.message };
        await runLog.append(entry);
        results.push(entry);
      }

      if (index < planned.length - 1) await page.waitForTimeout(config.pauseBetweenRowsMs ?? 4000);
    }
  } catch (err) {
    if (err instanceof UnlimitedNotConfirmedError) {
      await runLog.append({ outcome: OUTCOME.UNLIMITED_UNCONFIRMED, error: err.message });
      log(`\n${"=".repeat(72)}\nRUN STOPPED — ${err.message}\n${"=".repeat(72)}\n`);
      log(formatSummary(results));
      return 2;
    }
    throw err;
  } finally {
    await context.close().catch(() => {});
  }

  log(formatSummary(results));
  log(`\nRun log: ${config.runLogPath}`);
  return results.every((r) => r.outcome === OUTCOME.COMPLETE) ? 0 : 1;
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    process.stderr.write(`\n${err.message}\n`);
    process.exit(1);
  });
