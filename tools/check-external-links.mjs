/**
 * Runbook § 2.2 ("0 broken external links"), made repeatable.
 *
 *   node tools/check-external-links.mjs              # sweep dist/
 *   node tools/check-external-links.mjs --all        # list reachable URLs too
 *   node tools/check-external-links.mjs --dist path  # sweep somewhere else
 *
 * Deliberately NOT part of `npm run build`. Every other check in this repo is
 * a pure function of the tree, so it means the same thing on every machine and
 * every CI run. This one asks the internet, and the internet answers differently
 * depending on who is asking, how fast, and from where. Wiring it into the build
 * would make the build go red because a Moroccan railway had a bad afternoon.
 * Run it before a release, read it, then decide.
 *
 * ── WHY IT SWEEPS TWICE, WHICH IS THE WHOLE POINT ──
 *
 * A parallel link checker does not tell you a link is dead. It tells you to go
 * and look. Measured here on 2026-08-31 against the real dist/: a 12-way sweep
 * of 281 URLs reported 46 failures, and 32 of them were the sweep's own doing —
 * every whc.unesco.org and travel.state.gov URL 403s under concurrency and
 * returns 200 on a single serial request. Worse, that noise cut both ways: three
 * genuinely dead links were sitting inside it, indistinguishable from the
 * rate-limiting, and the first pass reported five real breakages when there were
 * eight.
 *
 * Lowering the concurrency does not fix it. Re-running the same sweep at 4-way
 * produced *more* flags (71), because by then the repeated sweeps had rate
 * limited this IP across more hosts. So phase 1 goes wide and fast purely to
 * narrow the field, and phase 2 re-tests **only the flagged set**, one at a
 * time, with a pause between requests. Phase 2's verdict is the one that counts.
 *
 * ── AND WHY PHASE 2 SHELLS OUT TO CURL ──
 *
 * The two phases use different HTTP clients on purpose. Node's fetch (undici)
 * has a TLS fingerprint that Akamai and Cloudflare classify as a bot, and these
 * hosts answer it 403 no matter what headers it sends — measured: identical
 * 403s from undici with bare headers and with a full browser set including
 * Accept-Language and the Sec-Fetch-* family. curl, from the same machine and
 * IP, with the same user agent, gets 200 from the same URLs in the same minute.
 * So the 403 is a statement about the client, not about the link.
 *
 * That is not a trick to defeat bot protection; it is the difference between
 * asking "can undici fetch this?" (nobody cares) and "is this link alive?"
 * (the actual question). Phase 1 stays on fetch because it is fast, in-process
 * and only has to narrow the field. Phase 2 uses curl because its answer is the
 * one that gets reported.
 *
 * curl ships with Windows 10+, macOS and every mainstream Linux, so this is not
 * a new dependency. If it is genuinely missing, phase 2 falls back to fetch and
 * says so — the run is then much noisier and its 403s mean nothing.
 *
 * These pages cite governments, UNESCO and national parks by design — CLAUDE.md
 * requires a linked authoritative source for factual claims. Exactly those hosts
 * sit behind bot protection, so the citation style the content standards demand
 * is the style a naive checker mis-reports. That is not a flaw to tune away; it
 * is the shape of the problem.
 *
 * ── WHAT A FAILURE MEANS ──
 *
 *   BROKEN    404/410, no such domain, connection refused. High confidence.
 *             Exits non-zero. Go fix these.
 *   SUSPECT   403, 429, timeouts, TLS errors, redirect loops. Exits zero.
 *             A human has to look, and the answer is often "it is fine".
 *
 * SUSPECT exists because three separate flags in the 2026-08-31 audit were
 * false and each looked damning:
 *
 *   evisa.gov.kh      an infinite 302 loop to curl; a DDoS interstitial that a
 *                     real visitor clicks through in one second.
 *   sat.gob.mx        ERR_SSL_DH_KEY_TOO_SMALL from Node, which prefers a DHE
 *                     suite the server offers with a weak key. Browsers dropped
 *                     DHE years ago and negotiate the ECDHE suite it also
 *                     offers, so they connect fine.
 *   oncf-voyages.ma   an incomplete chain that fails a strict verifier, but the
 *                     certificate carries an AIA CA-Issuers URI and browsers
 *                     complete the chain themselves.
 *
 * The rule that fell out of it: when a flag survives phase 2, open it in a
 * browser before editing a page. `www.mia.org.qa` presented the same class of
 * symptom and was a genuine fault — its certificate covered the apex only — so
 * the symptom alone does not tell you which kind you have.
 */
import { readFile, readdir } from "node:fs/promises";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);

const args = process.argv.slice(2);
const SHOW_ALL = args.includes("--all");
const DIST = args.includes("--dist") ? args[args.indexOf("--dist") + 1] : "dist";

/* A real browser's UA. Not to be sneaky — several of these hosts serve a bare
   403 to anything that looks automated, and this checker exists to find dead
   links, not to measure how many governments dislike scripts. */
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/128.0 Safari/537.36";

const WIDE_CONCURRENCY = 12;
const TIMEOUT_MS = 25_000;
const SERIAL_PAUSE_MS = 750;

/* Hosts confirmed working IN A BROWSER on the stated date, which this checker
   cannot reach. Listed so a known-false flag does not cost the next person the
   hour it cost the first. Not a ratchet: unlike DEAD_HANDLER_DEBT, an entry
   that starts passing is reported as removable rather than failing the run,
   because a network result is allowed to differ between two honest days. */
const CONFIRMED_IN_BROWSER = new Map([
  [
    "https://www.evisa.gov.kh/",
    "DDoS interstitial, not a redirect loop — browser-confirmed 2026-08-31",
  ],
]);

/* `wwwmat.sat.gob.mx` was the second entry here and has been removed rather
   than kept: it failed only undici, which prefers a DHE suite the server offers
   with a weak key, and curl negotiates the ECDHE suite it also offers and gets
   200. Moving phase 2 to curl retired the exception instead of documenting it,
   which is the better outcome and the reason this list should stay short. */

async function walk(dir, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else if (p.endsWith(".html")) out.push(p);
  }
  return out;
}

/* Derived from what actually ships, never a list in this file — the same reason
   check-web3forms-hardening.mjs reads the key out of dist/. A hardcoded list is
   one more thing that silently stops matching the site. */
async function linksFromDist() {
  let pages;
  try {
    pages = await walk(DIST);
  } catch {
    console.error(`no ${DIST}/ to read — run \`npm run build\` first`);
    process.exit(2);
  }

  const byUrl = new Map(); // url -> Set of page paths that link to it
  for (const file of pages) {
    const html = await readFile(file, "utf8");
    for (const m of html.matchAll(/href="(https?:\/\/[^"]+)"/g)) {
      const url = m[1];
      /* Own hosts are covered by the internal-links check and by
         verify-deployment's --remote mode; this tool is about everyone else. */
      if (/hymtravel\.com|hostingersite\.com/.test(url)) continue;
      if (!byUrl.has(url)) byUrl.set(url, new Set());
      byUrl.get(url).add(path.relative(DIST, file).replace(/\\/g, "/"));
    }
  }
  return byUrl;
}

async function probe(url, method) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method,
      redirect: "follow",
      signal: ac.signal,
      headers: { "user-agent": UA, accept: "*/*" },
    });
    return { status: res.status };
  } finally {
    clearTimeout(timer);
  }
}

/* HEAD first because it is cheap, then GET, because plenty of hosts answer HEAD
   with 403 or 405 while serving GET perfectly well. A checker that trusted HEAD
   alone would invent a second category of false positive on top of the one this
   file already exists to handle. */
async function check(url) {
  try {
    const head = await probe(url, "HEAD");
    if (head.status >= 200 && head.status < 400) return { url, ...head };
  } catch {
    /* fall through to GET */
  }
  try {
    return { url, ...(await probe(url, "GET")) };
  } catch (err) {
    const code = String(err?.cause?.code ?? err?.cause?.message ?? err?.name ?? err);
    return { url, status: 0, error: code };
  }
}

const ok = (r) => r.status >= 200 && r.status < 400;

const NULL_DEVICE = process.platform === "win32" ? "NUL" : "/dev/null";

async function haveCurl() {
  try {
    await run("curl", ["--version"], { timeout: 10_000 });
    return true;
  } catch {
    return false;
  }
}

/* curl's exit codes are more specific than a thrown fetch error, so the ones
   that map cleanly onto "the host says this is gone" are kept as such. */
const CURL_EXIT = new Map([
  [6, "could not resolve host"],
  [7, "failed to connect"],
  [28, "timed out"],
  [35, "TLS handshake failed"],
  [47, "redirect count exceeded"],
  [60, "certificate not trusted"],
]);

async function curlCheck(url) {
  try {
    const { stdout } = await run(
      "curl",
      [
        "-s",
        "-o", NULL_DEVICE,
        "-w", "%{http_code}",
        "-L",
        "--max-time", String(Math.round(TIMEOUT_MS / 1000)),
        "-A", UA,
        url,
      ],
      { timeout: TIMEOUT_MS + 10_000 }
    );
    return { url, status: Number(String(stdout).trim()) || 0, via: "curl" };
  } catch (err) {
    const code = typeof err?.code === "number" ? err.code : null;
    return {
      url,
      status: 0,
      via: "curl",
      error: CURL_EXIT.get(code) ?? `curl exit ${code ?? "?"}`,
      curlExit: code,
    };
  }
}

/* 404 and 410 are the server saying the page is gone, and a name that does not
   resolve or a port that refuses is the host saying the same thing louder. Those
   are actionable without a second opinion. Everything else — 403, 429, 5xx,
   TLS, timeouts, redirect loops — is a maybe, and this tool's whole thesis is
   that maybes must not be reported as facts. */
function isHardFailure(r) {
  if (r.status === 404 || r.status === 410) return true;
  /* curl 6 = name does not resolve, 7 = nothing listening. Both were genuine
     in the 2026-08-31 audit (seychelles.govtas.gov.sc, seychellesferry.com).
     28 (timeout) is deliberately NOT here: oncf.ma timed out from this machine
     while serving real visitors. */
  if (r.curlExit === 6 || r.curlExit === 7) return true;
  const e = (r.error ?? "").toUpperCase();
  return (
    e.includes("ENOTFOUND") ||
    e.includes("EAI_AGAIN") ||
    e.includes("ECONNREFUSED")
  );
}

function describe(r) {
  if (r.error) return r.error;
  return `HTTP ${r.status}`;
}

async function main() {
  const byUrl = await linksFromDist();
  const urls = [...byUrl.keys()].sort();
  console.log(`${urls.length} distinct external URLs in ${DIST}/\n`);

  // ── Phase 1: wide and fast, to narrow the field. Not evidence of anything.
  const wide = [];
  let cursor = 0;
  await Promise.all(
    Array.from({ length: WIDE_CONCURRENCY }, async () => {
      while (cursor < urls.length) wide.push(await check(urls[cursor++]));
    })
  );

  const flagged = wide.filter((r) => !ok(r)).map((r) => r.url).sort();
  console.log(
    `phase 1  ${WIDE_CONCURRENCY}-way sweep: ${wide.length - flagged.length} reachable, ` +
      `${flagged.length} to re-test`
  );

  if (flagged.length === 0) {
    console.log("\nno broken external links");
    return 0;
  }

  // ── Phase 2: one at a time, through curl. This is the verdict.
  const curl = await haveCurl();
  console.log(
    `phase 2  re-testing those ${flagged.length} serially via ` +
      (curl ? "curl" : "fetch (curl NOT FOUND — 403s below are meaningless)") +
      "\n"
  );
  const verdicts = [];
  for (const url of flagged) {
    verdicts.push(curl ? await curlCheck(url) : await check(url));
    await new Promise((r) => setTimeout(r, SERIAL_PAUSE_MS));
  }

  const cleared = verdicts.filter(ok);
  const broken = verdicts.filter((r) => !ok(r) && isHardFailure(r));
  const suspect = verdicts.filter(
    (r) => !ok(r) && !isHardFailure(r) && !CONFIRMED_IN_BROWSER.has(r.url)
  );
  const known = verdicts.filter(
    (r) => !ok(r) && !isHardFailure(r) && CONFIRMED_IN_BROWSER.has(r.url)
  );

  if (cleared.length) {
    console.log(
      `  ${cleared.length} of the ${flagged.length} answered fine serially — ` +
        `phase 1 was rate limiting, not breakage`
    );
  }

  for (const r of broken) {
    console.log(`\nBROKEN   ${r.url}`);
    console.log(`         ${describe(r)}`);
    for (const page of [...byUrl.get(r.url)].sort()) console.log(`         on ${page}`);
  }

  for (const r of suspect) {
    console.log(`\nSUSPECT  ${r.url}`);
    console.log(`         ${describe(r)} — open it in a browser before editing a page`);
    for (const page of [...byUrl.get(r.url)].sort()) console.log(`         on ${page}`);
  }

  for (const r of known) {
    console.log(`\nknown    ${r.url}`);
    console.log(`         ${describe(r)} — ${CONFIRMED_IN_BROWSER.get(r.url)}`);
  }

  /* An allowlist entry that has started passing is stale documentation about a
     host that changed. Say so, but do not fail on it: a network check that
     demands its own exceptions stay broken would be its own kind of wrong. */
  for (const r of cleared) {
    if (CONFIRMED_IN_BROWSER.has(r.url)) {
      console.log(
        `\nnote     ${r.url} now passes unaided — ` +
          `drop its CONFIRMED_IN_BROWSER entry`
      );
    }
  }

  if (SHOW_ALL) {
    console.log("\nreachable:");
    for (const r of [...wide.filter(ok)].sort((a, b) => a.url.localeCompare(b.url))) {
      console.log(`  ${r.status} ${r.url}`);
    }
  }

  console.log(
    `\n${broken.length} broken, ${suspect.length} suspect, ${known.length} known-false`
  );
  return broken.length > 0 ? 1 : 0;
}

process.exit(await main());
