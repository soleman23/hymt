/**
 * SEC-1 (#74): check whether the Web3Forms dashboard hardening is actually on.
 *
 *   node tools/check-web3forms-hardening.mjs            # dry run, sends nothing
 *   node tools/check-web3forms-hardening.mjs --send     # really submits
 *
 * The access key is public by design and sits in the HTML of every page, so
 * anyone can POST straight at api.web3forms.com and bypass the forms entirely.
 * The honeypot and the length caps in the markup do nothing about that — they
 * are markup, and this attack never loads the markup. The controls that do stop
 * it are dashboard-side: domain restriction, CAPTCHA, rate limiting.
 *
 * This script is the check the issue asks for, made repeatable. It reads the
 * key out of the built site rather than taking it as an argument, so it cannot
 * drift from what actually ships, and it never writes anything.
 *
 * WHAT A PASS LOOKS LIKE, and it is the opposite of the usual intuition:
 *
 *   REJECTED  -> hardening is working. This is the outcome you want.
 *   ACCEPTED  -> anyone on the internet can post to the inbox. Also: an email
 *                just arrived, because the submission was real.
 *
 * --send is required precisely because a passing run is indistinguishable from
 * an attack, and a failing run puts a message in a real person's inbox.
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const SEND = process.argv.includes("--send");
const ENDPOINT = "https://api.web3forms.com/submit";

async function walk(dir, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else if (p.endsWith(".html")) out.push(p);
  }
  return out;
}

/* Derived, never hardcoded. CLAUDE.md forbids changing the key, and a copy of
   it in this file would be one more place a rotation has to remember. */
async function keyFromDist() {
  let pages;
  try {
    pages = await walk("dist");
  } catch {
    throw new Error("no dist/ — run `npm run build` first");
  }
  const keys = new Set();
  for (const p of pages) {
    for (const m of (await readFile(p, "utf8")).matchAll(
      /name="access_key"[^>]*value="([^"]+)"|access_key["']?\s*[:,]\s*["']([^"']+)["']/g)) {
      keys.add(m[1] ?? m[2]);
    }
  }
  if (keys.size === 0) throw new Error("no Web3Forms access key found in dist/");
  if (keys.size > 1) throw new Error(`dist/ carries ${keys.size} different access keys: ${[...keys].join(", ")}`);
  return [...keys][0];
}

const key = await keyFromDist();
const masked = `${key.slice(0, 8)}…${key.slice(-4)}`;

console.log(`key in dist/: ${masked}`);
console.log(`endpoint:     ${ENDPOINT}`);
console.log("");

if (!SEND) {
  console.log("DRY RUN — nothing was sent.");
  console.log("");
  console.log("This probe posts a submission with no Origin header and no honeypot,");
  console.log("which is exactly what a scripted flood looks like. If the hardening is");
  console.log("NOT on, it will be accepted and a real email will arrive.");
  console.log("");
  console.log("Re-run with --send when you are ready for that.");
  process.exit(0);
}

/* No Origin and no Referer: the point is to look like something that never
   visited the site, because that is what the domain restriction is meant to
   reject. Do not "fix" this by adding headers — it would test nothing. */
const res = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  body: JSON.stringify({
    access_key: key,
    subject: "SEC-1 hardening probe (#74) — ignore",
    message:
      "Automated check from tools/check-web3forms-hardening.mjs. If you are " +
      "reading this in an inbox, the Web3Forms domain restriction is NOT " +
      "enabled and anyone can post to this form.",
  }),
});

/* Read the body ONCE. `res.json()` consumes it even when it throws, so the
   old `catch { raw: await res.text() }` could never run — it died with
   "Body is unusable" and took the verdict with it. A non-JSON response is
   exactly what a rejection can look like, so that was the case most worth
   seeing. */
const raw = await res.text();
let body;
try { body = JSON.parse(raw); } catch { body = { raw }; }

console.log(`HTTP ${res.status}`);
console.log(JSON.stringify(body, null, 2));
console.log("");

if (res.ok && body?.success) {
  console.log("RESULT: ACCEPTED — the hardening is NOT in place.");
  console.log("");
  console.log("An off-site POST with no Origin, no honeypot and no CAPTCHA was");
  console.log("accepted, so the inbox and the quota are open to anyone who reads");
  console.log("the key out of the page. A real email has just been delivered.");
  console.log("");
  console.log("Fix: docs/hostinger-deployment.md § 4a — restrict allowed domains");
  console.log("to www.hymtravel.com first; it is the highest-value setting.");
  process.exit(1);
}

console.log("RESULT: REJECTED — this is the outcome you want.");
console.log("");
console.log("Now confirm the other direction, which this script cannot do for you:");
console.log("submit Contact, Plan Your Trip and the newsletter through the real UI");
console.log("and confirm all three still deliver. A domain restriction that also");
console.log("blocks the staging host will make working forms look broken.");
