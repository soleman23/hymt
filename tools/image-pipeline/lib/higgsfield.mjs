/**
 * Drive higgsfield.ai in a real browser (brief, step 3).
 *
 * WHY A BROWSER AND NOT THE API. Unlimited generation only applies to work done
 * on higgsfield.ai in the browser. The MCP connector, the CLI and the HTTP API
 * all bill credits instead. So this pipeline drives the web app, and nothing in
 * this repository ever calls a Higgsfield endpoint directly.
 *
 * WHY THE SELECTORS LIVE IN JSON. This file was written without being able to
 * load higgsfield.ai — the network policy on the machine it was authored on
 * blocks the host outright. Every selector is therefore a guess, and guesses
 * belong in data, not in logic. selectors.json holds an ordered candidate list
 * per control; `--probe` dumps the live DOM and reports which lists matched
 * nothing, so a wrong guess is a named failure you fix in one file rather than
 * a timeout somewhere in here. Expect to need that once.
 *
 * WHY A PERSISTENT PROFILE. Automating a login form invites both a captcha and
 * a credential in a config file. Instead you log in once by hand under --login
 * and the profile directory keeps the session. The pipeline never sees a
 * password, and .browser-profile/ is gitignored because that cookie is itself
 * a credential.
 *
 * WHY HEADED BY DEFAULT. A headless Chromium is the most common thing a bot
 * check stops, and a stopped run here means a session that has to be re-established
 * by hand. Headless is available with --headless for when you have proven it works.
 */
import { readFile, writeFile, mkdir, rename, unlink, stat } from "node:fs/promises";
import { dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SELECTORS_PATH = join(HERE, "..", "selectors.json");

/** Thrown when Unlimited cannot be positively confirmed. Aborts the whole run,
 *  never just a row: the brief is explicit that the alternative to confirmation
 *  is pausing and alerting, not proceeding and hoping. */
export class UnlimitedNotConfirmedError extends Error {
  constructor(message) {
    super(message);
    this.name = "UnlimitedNotConfirmedError";
  }
}

/** Thrown when a control cannot be found. Carries the key so --probe's output
 *  and the failure message name the same thing. */
export class SelectorNotFoundError extends Error {
  constructor(key, candidates) {
    super(
      `No element matched selectors.json → "${key}".\n` +
        `Tried:\n${candidates.map((c) => `  ${c}`).join("\n")}\n\n` +
        `Run \`node run.mjs --probe\` to dump the live DOM, then correct that entry.`
    );
    this.name = "SelectorNotFoundError";
    this.key = key;
  }
}

export async function loadSelectors(path = SELECTORS_PATH) {
  const raw = JSON.parse(await readFile(path, "utf8"));
  /* Strip the _comment block so it is never mistaken for a selector group. */
  const { _comment, ...selectors } = raw;
  return selectors;
}

const interpolate = (candidate, vars) =>
  candidate.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");

/**
 * First visible element matching any candidate, or null. Each candidate gets a
 * short timeout: the list is a set of guesses and most will miss, so waiting
 * the default 30s on each would make one lookup take minutes.
 */
async function firstVisible(page, selectors, key, { vars = {}, timeout = 2000 } = {}) {
  const candidates = (selectors[key] ?? []).map((c) => interpolate(c, vars));
  for (const candidate of candidates) {
    try {
      const locator = page.locator(candidate).first();
      await locator.waitFor({ state: "visible", timeout });
      return locator;
    } catch {
      /* Next candidate. A miss here is expected and not worth logging. */
    }
  }
  return null;
}

async function requireVisible(page, selectors, key, opts = {}) {
  const found = await firstVisible(page, selectors, key, opts);
  if (!found) throw new SelectorNotFoundError(key, (selectors[key] ?? []).map((c) => interpolate(c, opts.vars ?? {})));
  return found;
}

/* ------------------------------------------------------------------ session */

/**
 * Open the persistent browser context. Playwright must be resolved lazily so
 * the pure modules — and therefore the fixture tests and --dry-run — work
 * without it installed.
 */
export async function openBrowser(config, { headless = false } = {}) {
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    throw new Error(
      "Playwright is not installed. From tools/image-pipeline/ run:\n\n" +
        "  npm install\n  npx playwright install chromium\n"
    );
  }

  await mkdir(config.profileDir, { recursive: true });
  await mkdir(config.downloadsDir, { recursive: true });

  return chromium.launchPersistentContext(config.profileDir, {
    headless,
    acceptDownloads: true,
    downloadsPath: config.downloadsDir,
    viewport: { width: 1600, height: 1000 },
    ...(config.chromiumExecutablePath ? { executablePath: config.chromiumExecutablePath } : {}),
  });
}

export async function isLoggedIn(page, selectors) {
  if (await firstVisible(page, selectors, "loggedInMarker", { timeout: 4000 })) return true;
  /* Absence of the account control is weak evidence on a site whose header may
     simply have changed. A visible login link is the positive signal. */
  return !(await firstVisible(page, selectors, "loginMarker", { timeout: 2000 }));
}

/**
 * Interactive login. Opens the site and waits for the account control to
 * appear while you sign in by hand. Nothing is typed for you.
 */
export async function runLogin(config, { timeoutMs = 300_000 } = {}) {
  const selectors = await loadSelectors();
  const context = await openBrowser(config, { headless: false });
  const page = context.pages()[0] ?? (await context.newPage());

  try {
    await page.goto(config.higgsfieldUrl, { waitUntil: "domcontentloaded" });
    process.stdout.write(
      "\nA browser window is open. Log into higgsfield.ai, then leave it open.\n" +
        "Waiting for the session to appear (up to 5 minutes)...\n\n"
    );

    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (await firstVisible(page, selectors, "loggedInMarker", { timeout: 3000 })) {
        process.stdout.write("Signed in. The session is saved in the profile directory.\n");
        return true;
      }
    }
    process.stdout.write(
      "Timed out without seeing the account control.\n" +
        "If you ARE signed in, the loggedInMarker selectors are wrong — run --probe.\n"
    );
    return false;
  } finally {
    await context.close();
  }
}

/* ------------------------------------------------------------------- probe */

/**
 * Dump the live generation panel and report which selector groups resolve.
 * The point is to turn "it timed out somewhere" into "these four entries in
 * selectors.json matched nothing".
 */
export async function runProbe(config) {
  const selectors = await loadSelectors();
  const outDir = join(HERE, "..", "probe");
  await mkdir(outDir, { recursive: true });

  const context = await openBrowser(config, { headless: false });
  const page = context.pages()[0] ?? (await context.newPage());

  try {
    await page.goto(config.higgsfieldUrl, { waitUntil: "domcontentloaded" });
    /* The panel is client-rendered; give it a moment before snapshotting. */
    await page.waitForTimeout(5000);

    await writeFile(join(outDir, "page.html"), await page.content(), "utf8");
    await page.screenshot({ path: join(outDir, "page.png"), fullPage: true });

    const report = [];
    /* Templated groups need a plausible value substituted before they can match. */
    const vars = {
      model: "Seedream",
      ratio: config.aspectRatio ?? "16:9",
      resolution: config.resolution ?? "2K",
    };

    for (const key of Object.keys(selectors)) {
      const hit = await firstVisible(page, selectors, key, { vars, timeout: 1500 });
      let matched = null;
      if (hit) {
        for (const candidate of selectors[key].map((c) => interpolate(c, vars))) {
          if ((await page.locator(candidate).count()) > 0) {
            matched = candidate;
            break;
          }
        }
      }
      report.push({ key, found: Boolean(hit), matched });
    }

    await writeFile(join(outDir, "selector-report.json"), JSON.stringify(report, null, 2), "utf8");

    process.stdout.write(`\nProbe written to ${outDir}/\n\n`);
    for (const { key, found, matched } of report) {
      process.stdout.write(`  ${found ? "ok  " : "MISS"}  ${key}${matched ? `  <- ${matched}` : ""}\n`);
    }
    const misses = report.filter((r) => !r.found);
    process.stdout.write(
      misses.length
        ? `\n${misses.length} group(s) matched nothing. Fix these in selectors.json using probe/page.html:\n` +
            misses.map((m) => `  ${m.key}`).join("\n") +
            "\n"
        : "\nEvery selector group resolved.\n"
    );
    return report;
  } finally {
    await context.close();
  }
}

/* --------------------------------------------------------- unlimited guard */

/**
 * Positively confirm Unlimited is active. Enables it if the toggle is found in
 * the off position, then re-confirms.
 *
 * Only a positive confirmation lets a run proceed. "Could not find the toggle"
 * is treated exactly like "the toggle is off" — an unidentifiable control is no
 * basis for believing generations are free.
 */
export async function confirmUnlimited(page, selectors, { autoEnable = true } = {}) {
  if (await firstVisible(page, selectors, "unlimitedActiveMarker", { timeout: 4000 })) return true;

  if (autoEnable) {
    const toggle = await firstVisible(page, selectors, "unlimitedToggle", { timeout: 4000 });
    if (toggle) {
      const state = await toggle.evaluate((el) => ({
        ariaChecked: el.getAttribute("aria-checked"),
        dataState: el.getAttribute("data-state"),
        checked: el.checked ?? null,
      }));
      const alreadyOn =
        state.ariaChecked === "true" || state.dataState === "checked" || state.checked === true;

      if (!alreadyOn) {
        await toggle.click({ timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(1200);
      }
      if (await firstVisible(page, selectors, "unlimitedActiveMarker", { timeout: 4000 })) return true;
    }
  }

  throw new UnlimitedNotConfirmedError(
    "Unlimited mode could not be confirmed active on higgsfield.ai.\n\n" +
      "The run has been stopped rather than generating anything, because without " +
      "Unlimited every generation spends paid credits.\n\n" +
      "Either the toggle is genuinely off — turn it on in the browser — or the " +
      '"unlimitedToggle" / "unlimitedActiveMarker" entries in selectors.json do not ' +
      "match this build of the site. Run `node run.mjs --probe` to check which."
  );
}

/* -------------------------------------------------------------- generation */

/** Choose an option from a dropdown-style control, opening it first. */
async function selectOption(page, selectors, triggerKey, optionKey, vars) {
  const trigger = await firstVisible(page, selectors, triggerKey, { vars, timeout: 4000 });
  if (trigger) {
    await trigger.click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(600);
  }
  const option = await firstVisible(page, selectors, optionKey, { vars, timeout: 4000 });
  if (!option) {
    throw new SelectorNotFoundError(
      optionKey,
      (selectors[optionKey] ?? []).map((c) => interpolate(c, vars))
    );
  }
  await option.click({ timeout: 5000 });
  await page.waitForTimeout(600);
}

/**
 * Put the prompt in the field verbatim and prove it landed.
 *
 * fill() sets the value in one operation rather than simulating keystrokes,
 * which on a 1,200-character prompt is both far faster and immune to a
 * debounced editor dropping characters. The read-back is the part that matters:
 * these prompts are long, precise and hand-written, and generating from a
 * silently truncated one wastes the generation and produces a plausible image
 * that is subtly wrong.
 */
export async function fillPromptVerbatim(page, selectors, prompt) {
  const field = await requireVisible(page, selectors, "promptInput", { timeout: 8000 });

  await field.click({ timeout: 5000 }).catch(() => {});
  const isContentEditable = await field.evaluate((el) => el.isContentEditable === true);

  if (isContentEditable) {
    await field.evaluate((el, value) => {
      el.focus();
      el.textContent = value;
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }, prompt);
  } else {
    await field.fill("");
    await field.fill(prompt);
  }
  await page.waitForTimeout(300);

  const actual = await field.evaluate((el) =>
    el.isContentEditable ? el.textContent : el.value
  );
  if (String(actual ?? "").trim() !== prompt.trim()) {
    throw new Error(
      `The prompt field does not contain the prompt verbatim.\n` +
        `  expected ${prompt.length} chars, field holds ${String(actual ?? "").length}\n` +
        `  The row was not generated, so nothing was wasted. This usually means the ` +
        `editor reformats or truncates input, or "promptInput" matched the wrong element.`
    );
  }
  return true;
}

/** Collect current result-image srcs so a new one can be told from a stale one. */
async function currentResultSrcs(page, selectors) {
  const srcs = new Set();
  for (const candidate of selectors.resultImage ?? []) {
    const found = await page
      .locator(candidate)
      .evaluateAll((els) => els.map((el) => el.src || el.getAttribute("src")).filter(Boolean))
      .catch(() => []);
    for (const src of found) srcs.add(src);
  }
  return srcs;
}

/**
 * Wait for a result image that was not on the page before submission.
 * Comparing against a "before" set is what stops the previous row's image being
 * downloaded again and filed under this row's filename.
 */
async function waitForNewResult(page, selectors, before, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const error = await firstVisible(page, selectors, "errorMarker", { timeout: 500 });
    if (error) {
      const text = (await error.textContent().catch(() => "")) || "unknown error";
      throw new Error(`higgsfield.ai reported: ${text.trim().slice(0, 200)}`);
    }

    for (const src of await currentResultSrcs(page, selectors)) {
      if (!before.has(src)) return src;
    }
    await page.waitForTimeout(2000);
  }
  throw new Error(`No new image appeared within ${Math.round(timeoutMs / 1000)}s.`);
}

/**
 * Get the bytes. Prefers the site's own download control so whatever it serves
 * (full resolution, correct format) is what lands; falls back to fetching the
 * image src through the browser context, which carries the session cookies a
 * bare fetch would not.
 */
async function downloadResult(page, context, selectors, srcHint) {
  const button = await firstVisible(page, selectors, "downloadButton", { timeout: 4000 });
  if (button) {
    try {
      const [download] = await Promise.all([
        page.waitForEvent("download", { timeout: 60_000 }),
        button.click({ timeout: 5000 }),
      ]);
      const path = await download.path();
      if (path) {
        return { buffer: await readFile(path), suggestedName: download.suggestedFilename() };
      }
    } catch {
      /* Fall through to fetching the src. */
    }
  }

  if (!srcHint) throw new Error("No download control and no result image src to fall back to.");
  const res = await context.request.get(srcHint);
  if (!res.ok()) throw new Error(`Fetching the result image failed with HTTP ${res.status()}.`);
  return { buffer: Buffer.from(await res.body()), suggestedName: srcHint.split("/").pop() ?? "result" };
}

/**
 * Re-encode to JPEG using the browser already running, via a canvas.
 *
 * The platform may hand back a PNG whatever the requested extension, and the
 * tracker's filenames all end .jpg — a .jpg that is really a PNG is a small lie
 * that surfaces much later, in whatever consumes the Drive folder. tools/gen_images.py
 * normalises the same way for the same reason, with PIL. Doing it in Chromium
 * keeps a native image dependency out of this package for one conversion.
 */
export async function transcodeToJpeg(context, buffer, quality = 0.92) {
  const page = await context.newPage();
  try {
    const dataUrl = `data:image/png;base64,${buffer.toString("base64")}`;
    const jpegBase64 = await page.evaluate(
      async ({ src, q }) => {
        const img = new Image();
        img.src = src;
        await img.decode();
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        /* JPEG has no alpha; without this, transparency composites to black. */
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        return canvas.toDataURL("image/jpeg", q).split(",")[1];
      },
      { src: dataUrl, q: quality }
    );
    return Buffer.from(jpegBase64, "base64");
  } finally {
    await page.close();
  }
}

const JPEG_MAGIC = [0xff, 0xd8, 0xff];
const isJpeg = (buf) => JPEG_MAGIC.every((byte, i) => buf[i] === byte);

/**
 * Generate one image and write it to disk under the tracker's filename.
 *
 * Assumes Unlimited has already been confirmed for the session; confirmUnlimited()
 * is called again here because the toggle can reset on navigation, and a
 * re-check costs a second against a run that must never spend credits.
 *
 * @returns { localPath, model, resolution, sourceUrl }
 */
export async function generateImage(page, context, selectors, config, { prompt, filename, plan }) {
  await confirmUnlimited(page, selectors, { autoEnable: config.autoEnableUnlimited !== false });

  await selectOption(page, selectors, "modelSelector", "modelOption", { model: plan.model });
  await selectOption(page, selectors, "aspectRatioSelector", "aspectRatioOption", {
    ratio: plan.aspectRatio,
  });
  await selectOption(page, selectors, "resolutionSelector", "resolutionOption", {
    resolution: plan.resolution,
  });

  await fillPromptVerbatim(page, selectors, prompt);

  /* Re-confirm after the panel has been reconfigured: switching model is the
     most likely moment for an Unlimited toggle to reset. */
  await confirmUnlimited(page, selectors, { autoEnable: config.autoEnableUnlimited !== false });

  const before = await currentResultSrcs(page, selectors);
  const generate = await requireVisible(page, selectors, "generateButton", { timeout: 8000 });
  await generate.click({ timeout: 10_000 });

  const srcHint = await waitForNewResult(page, selectors, before, config.generationTimeoutMs ?? 300_000);
  const { buffer } = await downloadResult(page, context, selectors, srcHint);

  if (buffer.length === 0) throw new Error("The downloaded image was empty.");

  const wantsJpeg = extname(filename).toLowerCase() === ".jpg" || extname(filename).toLowerCase() === ".jpeg";
  const finalBuffer = wantsJpeg && !isJpeg(buffer) ? await transcodeToJpeg(context, buffer) : buffer;

  /* Written to a temp name and renamed, so a crash mid-write can never leave a
     truncated file sitting under the tracker's filename looking finished. */
  const localPath = join(config.downloadsDir, filename);
  const tempPath = `${localPath}.partial`;
  await writeFile(tempPath, finalBuffer);
  await rename(tempPath, localPath);

  const written = await stat(localPath);
  if (written.size === 0) {
    await unlink(localPath).catch(() => {});
    throw new Error(`${filename} was written as a zero-byte file.`);
  }

  return { localPath, model: plan.model, resolution: plan.resolution, sourceUrl: srcHint };
}
