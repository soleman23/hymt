/**
 * Runbook § 2.2 ("0 broken external links"), made repeatable.
 *
 *   node tools/check-external-links.mjs              # sweep dist/
 *   node tools/check-external-links.mjs --all        # list reachable URLs too
 *   node tools/check-external-links.mjs --dist path  # sweep somewhere else
 *
 * Deliberately NOT part of `npm run build`. Every other check in this repo is a
 * pure function of the tree, so it means the same thing on every machine and
 * every CI run. This one asks the internet, which answers differently depending
 * on who is asking, how fast, and from where. Wiring it into the build would
 * make the build go red because a Moroccan railway had a bad afternoon. Run it
 * before a release, read it, then decide.
 *
 * The parts that are NOT network-dependent — extracting hrefs, decoding
 * entities, deciding first-party, classifying a result — are pure and exported,
 * and `tools/verify-checks.test.mjs` drives them red on fixtures the way it does
 * every other predicate here. A manual run cannot stop the classifier silently
 * regressing; those fixtures can.
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
 * Phase 1 uses a **ranged GET**, not HEAD. An origin that answers HEAD 200 while
 * GET 404s would otherwise never reach phase 2 and would be reported reachable,
 * which is the one failure mode this tool must not have. `Range: bytes=0-0`
 * exercises the GET path for one byte.
 *
 * ── WHAT A FAILURE MEANS ──
 *
 *   BROKEN    404/410, no such domain, connection refused. High confidence.
 *             Exits non-zero. Go fix these.
 *   SUSPECT   403, 429, timeouts, TLS errors, redirect loops, temporary DNS.
 *             Exits zero. A human has to look, and the answer is often "fine".
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
 * the symptom alone does not tell you which kind you have. And a host behind a
 * challenge can answer 200 with the challenge page itself, so a status code is
 * not evidence of content: `sanparks.org/parks/addo-elephant` had to be read in
 * a browser to confirm it was the right park.
 */
import { readFile, readdir } from "node:fs/promises";
import { execFile } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { lookup } from "node:dns/promises";
import { promisify } from "node:util";
import { configuredSite } from "./content-checks.mjs";

const run = promisify(execFile);
const ROOT = fileURLToPath(new URL("..", import.meta.url));

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
const CONFIRMATION_STALE_DAYS = 90;

/* Hosts confirmed working IN A BROWSER on the stated date, which this checker
   cannot reach. Listed so a known-false flag does not cost the next person the
   hour it cost the first.

   Not a ratchet: unlike DEAD_HANDLER_DEBT, an entry that starts passing is
   reported as removable rather than failing the run, because a network result
   is allowed to differ between two honest days. But a confirmation is evidence
   about one day, not a permanent exemption — a host that later develops a real
   fault would sit here forever — so each carries the date it was checked and
   goes stale after CONFIRMATION_STALE_DAYS. */
export const CONFIRMED_IN_BROWSER = new Map([
  [
    "https://www.evisa.gov.kh/",
    { on: "2026-08-31", why: "DDoS interstitial, not a redirect loop" },
  ],
]);

/* `wwwmat.sat.gob.mx` was the second entry here and has been removed rather
   than kept: it failed only undici, which prefers a DHE suite the server offers
   with a weak key, and curl negotiates the ECDHE suite it also offers and gets
   200. Moving phase 2 to curl retired the exception instead of documenting it,
   which is the better outcome and the reason this list should stay short. */

/* ── pure helpers, exported so verify-checks.test.mjs can drive them red ── */

const ENTITIES = new Map([
  ["amp", "&"], ["lt", "<"], ["gt", ">"], ["quot", '"'], ["apos", "'"], ["nbsp", " "],
]);

/**
 * Decode the character references an HTML serializer emits inside an attribute.
 *
 * `&` in a URL is written `&amp;` in the source. Probing the raw attribute sends
 * `amp;name=…` as a literal parameter, so the checker asks for a URL no visitor
 * ever requests and its answer — pass or fail — is about the wrong resource.
 * Two links in this site are affected (the Barbados levy PDF and the Georgian
 * museum), both with more than one query parameter.
 */
export function decodeEntities(s) {
  return String(s ?? "").replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (whole, body) => {
    if (body[0] === "#") {
      const cp = body[1] === "x" || body[1] === "X"
        ? parseInt(body.slice(2), 16)
        : parseInt(body.slice(1), 10);
      return Number.isFinite(cp) && cp > 0 && cp <= 0x10ffff
        ? String.fromCodePoint(cp)
        : whole;
    }
    return ENTITIES.get(body.toLowerCase()) ?? whole;
  });
}

/**
 * The registrable hosts that are OURS, derived rather than typed.
 *
 * CLAUDE.md § Domain: the production domain is written once, in
 * astro.config.mjs → site, and never hardcoded anywhere else. A regex here
 * would be a second copy that goes stale the day the domain moves, and the
 * checker would then start probing our own pages as third-party links. The
 * preview host comes from its own existing source, the verify:remote script.
 */
export function firstPartyHosts({ astroConfig = "", packageJson = "" } = {}) {
  const hosts = new Set();
  const add = (value) => {
    try {
      const h = new URL(value).hostname.toLowerCase().replace(/^www\./, "");
      if (h) hosts.add(h);
    } catch {
      /* not a URL; nothing to add */
    }
  };
  add(configuredSite(astroConfig));

  /* ONLY verify:remote. Scanning every `--remote` target also swallowed
     verify:prod, whose URL is a second literal copy of the production domain
     in package.json — so the day astro.config.mjs moves to a new domain, the
     stale one would still be treated as ours and outbound links to it would go
     unaudited. Reading the one script by name keeps the staging host coming
     from its own source and nothing else. */
  try {
    const staging = JSON.parse(String(packageJson))?.scripts?.["verify:remote"];
    const m = String(staging ?? "").match(/--remote\s+(\S+)/);
    if (m) add(m[1]);
  } catch {
    /* unparseable package.json — the configured site alone still stands */
  }
  return hosts;
}

export function isFirstParty(url, hosts) {
  let hostname;
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    return false;
  }
  for (const h of hosts) {
    if (hostname === h || hostname.endsWith(`.${h}`)) return true;
  }
  return false;
}

/**
 * Every distinct third-party href in one document, decoded.
 */
export function externalHrefs(html, hosts) {
  const out = new Set();
  /* Both quote styles. Astro normalises to double quotes today, so nothing in
     dist/ is single-quoted — but content pages are rendered verbatim through
     `set:html`, so a single-quoted href in a source page would reach the output
     unnormalised and a double-quote-only scan would silently skip it. */
  for (const m of String(html ?? "").matchAll(/href=(?:"(https?:\/\/[^"]+)"|'(https?:\/\/[^']+)')/g)) {
    const url = decodeEntities(m[1] ?? m[2]);
    if (!isFirstParty(url, hosts)) out.add(url);
  }
  return out;
}

/* 404 and 410 are the server saying the page is gone, and a name that does not
   resolve or a port that refuses is the host saying the same thing louder.
   Those are actionable without a second opinion. Everything else — 403, 429,
   5xx, TLS, timeouts, redirect loops — is a maybe, and this tool's whole thesis
   is that maybes must not be reported as facts.

   EAI_AGAIN is deliberately NOT hard. It is a *temporary* resolver failure, not
   NXDOMAIN, and treating a flaky local DNS server as proof that a government
   domain no longer exists would produce exactly the confident-and-wrong report
   this file exists to avoid. curl 6 and 7 stay hard: both were genuine in the
   2026-08-31 audit (seychelles.govtas.gov.sc, seychellesferry.com). curl 28
   (timeout) is not — oncf.ma times out from this machine while serving real
   visitors. */
export function isHardFailure(r) {
  if (r.status === 404 || r.status === 410) return true;
  /* curl 3 is a syntactically unusable URL. No browser can open it, so there is
     nothing ambiguous about it — unlike every other non-2xx result here. */
  if (r.curlExit === 3) return true;
  /* curl 7: nothing listening. Genuine in the 2026-08-31 audit
     (seychellesferry.com). curl 28 (timeout) is deliberately absent — oncf.ma
     times out from this machine while serving real visitors. */
  if (r.curlExit === 7) return true;
  /* curl 6 is "could not resolve host" and says nothing about WHY: NXDOMAIN
     and a resolver having a bad minute are the same exit code. Demoting
     fetch's EAI_AGAIN while leaving curl 6 hard would have kept the same bug
     on the default path, so the caller re-resolves and records which it was. */
  if (r.curlExit === 6) return r.nxdomain === true;
  const e = String(r.error ?? "").toUpperCase();
  return e.includes("ENOTFOUND") || e.includes("ECONNREFUSED");
}

export function confirmationIsStale(entry, today = new Date()) {
  const then = Date.parse(`${entry?.on}T00:00:00Z`);
  if (!Number.isFinite(then)) return true;
  return (today.getTime() - then) / 86_400_000 > CONFIRMATION_STALE_DAYS;
}

/* ── network ── */

const NULL_DEVICE = process.platform === "win32" ? "NUL" : "/dev/null";

async function walk(dir, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else if (p.endsWith(".html")) out.push(p);
  }
  return out;
}

async function linksFromDist(hosts) {
  let pages;
  try {
    pages = await walk(DIST);
  } catch {
    console.error(`no ${DIST}/ to read — run \`npm run build\` first`);
    process.exitCode = 2;
    return null;
  }

  /* An empty tree is NOT a clean site. dist/ has been emptied here before by a
     build racing a process holding it open, and reporting "no broken links" for
     a directory with no pages in it would let a release audit pass without
     examining anything. */
  if (pages.length === 0) {
    console.error(`${DIST}/ contains no HTML pages — run \`npm run build\` first`);
    process.exitCode = 2;
    return null;
  }

  const byUrl = new Map(); // url -> Set of page paths that link to it
  for (const file of pages) {
    const html = await readFile(file, "utf8");
    for (const url of externalHrefs(html, hosts)) {
      if (!byUrl.has(url)) byUrl.set(url, new Set());
      byUrl.get(url).add(path.relative(DIST, file).replace(/\\/g, "/"));
    }
  }
  return { byUrl, pages: pages.length };
}

async function fetchProbe(url) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: ac.signal,
      /* One byte. HEAD is cheaper still, but an origin answering HEAD 200 and
         GET 404 would be reported reachable and never reach phase 2. */
      headers: { "user-agent": UA, accept: "*/*", range: "bytes=0-0" },
    });
    /* Nothing reads the body; releasing it keeps sockets from piling up. */
    try { await res.body?.cancel(); } catch { /* already consumed */ }
    return { url, status: res.status };
  } catch (err) {
    const code = String(err?.cause?.code ?? err?.cause?.message ?? err?.name ?? err);
    return { url, status: 0, error: code };
  } finally {
    clearTimeout(timer);
  }
}

async function haveCurl() {
  try {
    await run("curl", ["--version"], { timeout: 10_000 });
    return true;
  } catch {
    return false;
  }
}

const CURL_EXIT = new Map([
  [3, "malformed URL"],
  [6, "could not resolve host"],
  [7, "failed to connect"],
  [28, "timed out"],
  [35, "TLS handshake failed"],
  [47, "redirect count exceeded"],
  [60, "certificate not trusted"],
]);

/**
 * Did this name genuinely not exist, or did the resolver just fail?
 *
 * `dns.lookup` reports ENOTFOUND for NXDOMAIN and EAI_AGAIN for a temporary
 * failure. curl collapses both into exit 6, so this is the only way to tell a
 * retired government domain from a resolver hiccup — and calling the second one
 * "broken" is exactly the confident-and-wrong report this tool must not make.
 */
async function isNxdomain(url) {
  let hostname;
  try {
    hostname = new URL(url).hostname;
  } catch {
    return false;
  }
  try {
    await lookup(hostname);
    return false; // resolves now; curl's failure was transient
  } catch (err) {
    return err?.code === "ENOTFOUND";
  }
}

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
    return { url, status: Number(String(stdout).trim()) || 0 };
  } catch (err) {
    const code = typeof err?.code === "number" ? err.code : null;
    const out = {
      url,
      status: 0,
      error: CURL_EXIT.get(code) ?? `curl exit ${code ?? "?"}`,
      curlExit: code,
    };
    if (code === 6) {
      out.nxdomain = await isNxdomain(url);
      out.error = out.nxdomain
        ? "no such host (NXDOMAIN)"
        : "name resolution failed, temporarily";
    }
    return out;
  }
}

const ok = (r) => r.status >= 200 && r.status < 400;
const describe = (r) => r.error ?? `HTTP ${r.status}`;

async function main() {
  const [astroConfig, packageJson] = await Promise.all([
    readFile(path.join(ROOT, "astro.config.mjs"), "utf8").catch(() => ""),
    readFile(path.join(ROOT, "package.json"), "utf8").catch(() => ""),
  ]);
  const hosts = firstPartyHosts({ astroConfig, packageJson });
  if (hosts.size === 0) {
    console.error("could not derive the first-party hosts from astro.config.mjs");
    return 2;
  }

  const found = await linksFromDist(hosts);
  if (!found) return 2;
  const { byUrl, pages } = found;
  const urls = [...byUrl.keys()].sort();
  console.log(
    `${urls.length} distinct external URLs across ${pages} pages in ${DIST}/ ` +
      `(ours: ${[...hosts].sort().join(", ")})\n`
  );

  // ── Phase 1: wide and fast, to narrow the field. Not evidence of anything.
  const wide = [];
  let cursor = 0;
  await Promise.all(
    Array.from({ length: WIDE_CONCURRENCY }, async () => {
      while (cursor < urls.length) wide.push(await fetchProbe(urls[cursor++]));
    })
  );

  const flagged = wide.filter((r) => !ok(r)).map((r) => r.url).sort();
  console.log(
    `phase 1  ${WIDE_CONCURRENCY}-way sweep: ${wide.length - flagged.length} reachable, ` +
      `${flagged.length} to re-test`
  );

  const reachable = wide.filter(ok).map((r) => r.url);

  if (flagged.length === 0) {
    if (SHOW_ALL) for (const u of reachable.sort()) console.log(`  ok  ${u}`);
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
    verdicts.push(curl ? await curlCheck(url) : await fetchProbe(url));
    await new Promise((r) => setTimeout(r, SERIAL_PAUSE_MS));
  }

  const cleared = verdicts.filter(ok);
  const failed = verdicts.filter((r) => !ok(r));
  const broken = failed.filter(isHardFailure);
  const soft = failed.filter((r) => !isHardFailure(r));
  const known = soft.filter((r) => CONFIRMED_IN_BROWSER.has(r.url));
  const suspect = soft.filter((r) => !CONFIRMED_IN_BROWSER.has(r.url));

  if (cleared.length) {
    console.log(
      `  ${cleared.length} of the ${flagged.length} answered fine serially — ` +
        `phase 1 was rate limiting, not breakage`
    );
  }

  const where = (r) => [...(byUrl.get(r.url) ?? [])].sort();

  for (const r of broken) {
    console.log(`\nBROKEN   ${r.url}`);
    console.log(`         ${describe(r)}`);
    for (const p of where(r)) console.log(`         on ${p}`);
  }

  for (const r of suspect) {
    console.log(`\nSUSPECT  ${r.url}`);
    console.log(`         ${describe(r)} — open it in a browser before editing a page`);
    for (const p of where(r)) console.log(`         on ${p}`);
  }

  for (const r of known) {
    const entry = CONFIRMED_IN_BROWSER.get(r.url);
    const stale = confirmationIsStale(entry);
    console.log(`\n${stale ? "RECHECK " : "known   "} ${r.url}`);
    console.log(
      `         ${describe(r)} — ${entry.why}, browser-confirmed ${entry.on}` +
        (stale
          ? `\n         that confirmation is over ${CONFIRMATION_STALE_DAYS} days old; open it again`
          : "")
    );
  }

  for (const r of cleared) {
    if (CONFIRMED_IN_BROWSER.has(r.url)) {
      console.log(
        `\nnote     ${r.url} now passes unaided — drop its CONFIRMED_IN_BROWSER entry`
      );
    }
  }

  if (SHOW_ALL) {
    /* Phase 2's clears are reachable too — and they are precisely the
       rate-limited ones this design exists to rescue, so omitting them would
       drop dozens of live URLs from a list that promises every reachable one. */
    console.log("\nreachable:");
    for (const u of [...reachable, ...cleared.map((r) => r.url)].sort()) {
      console.log(`  ok  ${u}`);
    }
  }

  console.log(
    `\n${broken.length} broken, ${suspect.length} suspect, ${known.length} known-false`
  );
  return broken.length > 0 ? 1 : 0;
}

/* Only run when invoked directly — verify-checks.test.mjs imports the pure
   predicates above and must not trigger a network sweep to do it. */
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  /* process.exitCode, not process.exit(): the latter can tear the process down
     with stdout writes still queued, truncating exactly the URL diagnostics an
     operator needs when the output is piped to a file. */
  process.exitCode = await main();
}
