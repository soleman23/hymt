/**
 * Predicates about the repo itself rather than about built pages.
 *
 * content-checks.mjs answers "is this page right?". This file answers "is the
 * toolchain that produced it right?" — the Node version the build is running
 * on, and whether an install has quietly degraded package-lock.json.
 *
 * Both are pure functions with no I/O so tools/verify-checks.test.mjs can
 * drive them red against a known-broken shape. The callers — tools/check-node.mjs
 * and tools/verify-deployment.mjs — import from here rather than carrying a
 * copy, so a fixture cannot pass while the real check drifts.
 */

/**
 * Parse a Node version string into a numeric [major, minor, patch].
 *
 * Accepts process.version's leading "v" and ignores any prerelease or build
 * suffix, so a nightly like "v23.0.0-nightly2024" compares as 23.0.0. That is
 * deliberate: this gate exists to catch someone on the wrong release line, not
 * to adjudicate prereleases.
 *
 * Returns null for anything that is not three dot-separated numbers.
 */
export function parseNodeVersion(version) {
  const m = /^v?(\d+)\.(\d+)\.(\d+)/.exec(String(version ?? "").trim());
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

/**
 * Does `version` satisfy `range`?
 *
 * Deliberately understands ONE range shape — a `>=X.Y.Z` floor, which is what
 * package.json engines.node carries and what every package in this tree
 * declares. Anything else returns **null**, meaning "not understood", and the
 * caller reports that rather than assuming a pass. A comparator that silently
 * returns true for a range it cannot read is how the wrong Node gets through.
 *
 * The previous engines value here was "22.x", which this returns null for on
 * purpose: it was wrong in both directions — it admitted 22.0–22.11, which
 * Astro 7 rejects, and excluded Node 24, the version the site actually builds
 * on. A range shape nobody verified is exactly the thing to refuse to guess at.
 *
 * @returns {boolean|null} true = satisfied, false = too old, null = unreadable
 */
export function satisfiesNodeRange(range, version) {
  const floor = rangeFloor(range);
  const current = parseNodeVersion(version);
  if (!floor || !current) return null;
  return compareFloors(current, floor) >= 0;
}

/* The one place the `>=X.Y.Z` grammar is written. satisfiesNodeRange and
   engineFloorDrift both need to read a floor out of a range, and two copies of
   this regex would be free to drift apart about what a range means. */
function rangeFloor(range) {
  const m = /^>=\s*v?(\d+)\.(\d+)\.(\d+)\s*$/.exec(String(range ?? "").trim());
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

/* Numeric order on [major, minor, patch] — negative, zero, positive, like any
   comparator. */
function compareFloors(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

/* Fields npm records so an install on one platform knows which optional
   dependencies belong on another. They describe Linux builds this machine
   never installs, which is exactly why nothing here notices when they go
   missing — and exactly why the deploy host would. */
const PLATFORM_FIELDS = ["libc", "os", "cpu"];

/**
 * Platform metadata a lockfile edit dropped.
 *
 * An `npm install` on Windows once deleted 102 lines from package-lock.json,
 * every one of them a `"libc": ["glibc"]` or `["musl"]` block on a
 * Linux-targeted optional dependency. Nothing on this machine can tell: those
 * packages are never installed here. It degrades the lockfile for the deploy
 * host and for anything Linux that later reads it, and it is invisible in a
 * diff that also carries a legitimate dependency change.
 *
 * Compares only entries that are still the SAME ARTIFACT on both sides: same
 * key, same `version`, same `integrity`. Two cases are therefore not losses,
 * because in each the metadata belongs to something else:
 *
 *   - the package was removed  -> a dependency change, and the diff shows it;
 *   - the package was upgraded -> the new version's platform support is
 *     whatever upstream published, and narrowing it is upstream's business.
 *
 * Identity is the content hash, NOT `resolved`. An install pointed at a mirror
 * or an alternate registry rewrites the download URL while fetching identical
 * bytes, so gating on the URL would skip every entry such an install touched —
 * reopening the exact hole this check exists to close, for precisely the kind
 * of unusual install that is most likely to mangle the lockfile. `integrity`
 * is compared only when both sides carry one; 292 of the 293 entries here do,
 * the exception being the root entry, which has no platform fields to lose.
 * When either side lacks it the entry is compared rather than skipped, because
 * the safe direction is to look.
 *
 * The first draft of this compared by key alone. That made a legitimate
 * upgrade — a package that genuinely drops `musl` in its next major —
 * unfixable: the check would fail, `npm run build` must pass before every
 * commit, and there was no override. Gating on the artifact removes the false
 * positive without weakening the real signal, because the install this exists
 * to catch deleted 102 `libc` blocks while touching no version at all.
 *
 * @returns {{pkg: string, field: string, missing: string[]}[]} empty when clean
 */
/* Same artifact on both sides: same version, and — when both carry one — the
   same content hash. Shared by the loss scan and the coverage count so the two
   cannot drift apart and disagree about what was compared. */
const isSameArtifact = (was, now) =>
  was.version === now.version &&
  !(was.integrity && now.integrity && was.integrity !== now.integrity);

export function lockfileMetadataLoss(before, after) {
  const losses = [];
  const a = before?.packages ?? {};
  const b = after?.packages ?? {};
  for (const [pkg, was] of Object.entries(a)) {
    const now = b[pkg];
    if (!now) continue;
    if (!isSameArtifact(was, now)) continue;
    for (const field of PLATFORM_FIELDS) {
      if (!Array.isArray(was[field])) continue;
      const kept = Array.isArray(now[field]) ? now[field] : [];
      const missing = was[field].filter((v) => !kept.includes(v));
      if (missing.length) losses.push({ pkg, field, missing });
    }
  }
  return losses;
}

/**
 * How much of the baseline the loss scan actually looked at.
 *
 * lockfileMetadataLoss reports what it FOUND, which says nothing about what it
 * COVERED. A working lockfile emptied to `{"packages":{}}`, or truncated to a
 * handful of unrelated entries, produces no losses at all — every baseline
 * entry is simply absent and skipped — and the check announced success. The
 * message it printed, "keeps its platform metadata on 0 entries", counted the
 * working file rather than the comparison, so a lockfile with nothing left in
 * it read as verified.
 *
 * `shared` is the honest denominator: baseline entries that still exist by key.
 * `compared` is those that also survived the artifact gate, and is expected to
 * fall during a real dependency upgrade — that is a wholesale version change,
 * not a truncated file, which is why the caller gates on `shared` and merely
 * reports `compared`.
 *
 * @returns {{baselineEntries: number, shared: number, compared: number}}
 */
export function lockfileCoverage(baseline, working) {
  const a = baseline?.packages ?? {};
  const b = working?.packages ?? {};
  let shared = 0;
  let compared = 0;
  for (const [pkg, was] of Object.entries(a)) {
    const now = b[pkg];
    if (!now) continue;
    shared++;
    if (isSameArtifact(was, now)) compared++;
  }
  return { baselineEntries: Object.keys(a).length, shared, compared };
}

/**
 * A lockfile npm would recognise: an object carrying a `packages` map.
 *
 * Guards against JSON that parses but is structurally wrong. `[]`, `{}` and
 * `{"packages": []}` all satisfy `typeof x === "object"`, and an earlier
 * version of the state check let all three through as comparable. The
 * comparison then found no losses in a map with no entries and reported that
 * metadata was retained "on 0 entries" — a corrupt working copy passing as
 * verified, which is the exact case the state check was added to fail.
 */
const isLockfileShape = (value) =>
  !!value && typeof value === "object" && !Array.isArray(value) &&
  !!value.packages && typeof value.packages === "object" && !Array.isArray(value.packages);

/**
 * What the tripwire can actually do with the two lockfiles it was handed.
 *
 * Split out so every branch is covered by a fixture rather than only by I/O.
 * The first version pushed a *note* whenever either side was unavailable — and
 * notes print with an `ok` prefix and exit 0, so a malformed lockfile read as
 * a pass while the comment directly above it claimed the opposite.
 *
 * Three states, and they are deliberately not treated alike:
 *
 *   - `unreadable-working`  -> FAIL. The lockfile in the tree being built is
 *     missing or corrupt. That is a defect wherever the build is running.
 *   - `no-git`              -> SKIP. There is genuinely no baseline to compare
 *     against, and this is a supported way to build.
 *   - `unreadable-baseline` -> FAIL. Git works but HEAD has no usable
 *     package-lock.json, which for this repo means it stopped being committed.
 *
 * The `no-git` case exists because the previous revision of this file claimed
 * there was no such case — that astro.config.mjs needs `git log` for sitemap
 * lastmod, so a git-less build dies earlier anyway. That was wrong.
 * tools/git-lastmod.mjs catches unavailable git and resolves every date to
 * undefined by design, so builds from `git archive` exports do work, and
 * failing here broke one that had otherwise passed every check.
 *
 * @returns {"comparable"|"unreadable-working"|"no-git"|"unreadable-baseline"}
 */
export function lockfileCheckState(baseline, working, gitAvailable = true) {
  if (!isLockfileShape(working)) return "unreadable-working";
  if (!gitAvailable) return "no-git";
  if (!isLockfileShape(baseline)) return "unreadable-baseline";
  return "comparable";
}

/**
 * The lockfile the real-file drift guards in verify-checks.test.mjs judge.
 *
 * Those guards assert that this repo's lockfile still carries platform
 * metadata for the loss scan to bite on, so a predicate that stopped matching
 * the shape npm actually writes fails against the real file too. Their subject
 * is the COMMITTED lockfile — the first one's name says so.
 *
 * They read the working tree instead, and that is wrong anywhere a build runs
 * an install of its own before `npm run build`. Hostinger's deploy does. On
 * 2026-09-01 its install left a package-lock.json with every platform field
 * stripped — it installed 290 packages and skipped none, where the committed
 * lockfile installs 192 on this machine and would install about as few on the
 * host — and this suite failed there with "expected true, got false". 123
 * pages had already built. The same commit was green in GitHub Actions, which
 * installs with `npm ci` and so never rewrites the file, and that difference
 * is how the cause was found.
 *
 * The working copy is not left unwatched by this: verify-deployment.mjs § 4c
 * compares it against HEAD and fails on any entry that lost a field. That is
 * the check with jurisdiction over the working tree. This one covers what is
 * committed, which is the only lockfile a deploy host cannot have rewritten.
 *
 * `null` means there is no committed baseline here to judge — no git, or a
 * HEAD with no usable lockfile. The first is a supported way to build this
 * repo and § 4c skips for it too; the second § 4c fails on, so returning
 * `null` rather than duplicating that failure keeps one owner per condition.
 *
 * HEAD is not the subject unconditionally, though, and the first draft of this
 * made it so. Codex review on #139, P2: during the build that must pass before
 * a dependency bump is committed, HEAD is still the OLD lockfile. § 4c is
 * deliberately blind to that window — its artifact gate skips every entry
 * whose version moved, so an upgrade that replaces the platform-specific
 * packages and drops their metadata reports zero losses — and judging HEAD
 * there tests a clean blob that nobody is about to commit. The guard would
 * only go red on the build AFTER the bad lockfile landed, which is one commit
 * too late and is the exact shape of the incident that started all of this.
 *
 * So: when the working lockfile carries a real dependency change, it is a
 * CANDIDATE and it is what gets judged. When it does not, the only differences
 * are the kind an installer makes, § 4c owns those, and the subject is what is
 * committed. `isSameArtifact` draws the line, the same helper § 4c gates on,
 * so the two cannot disagree about which window this is.
 *
 * @returns {{lock: object|null, source: "committed"|"candidate"|null}}
 */
export function lockfileDriftSubject(baseline, working, gitAvailable = true) {
  if (!gitAvailable) return { lock: null, source: null };
  if (!isLockfileShape(baseline)) return { lock: null, source: null };
  /* § 4c fails on an unreadable working copy. Judge what is committed rather
     than crashing on it or duplicating that failure. */
  if (!isLockfileShape(working)) return { lock: baseline, source: "committed" };

  for (const [pkg, was] of Object.entries(baseline.packages)) {
    const now = working.packages[pkg];
    if (now && !isSameArtifact(was, now)) return { lock: working, source: "candidate" };
  }
  return { lock: baseline, source: "committed" };
}

/**
 * Put back the platform fields an install dropped — and change nothing else.
 *
 * A build host whose own install rewrites package-lock.json before the build
 * runs hands the rest of the build a lockfile this repo never pinned.
 * Hostinger's does exactly that, and its build command cannot be edited on this
 * account, so `npm run build` has to cope with the file it is given.
 *
 * The first two attempts at this reverted the whole file to HEAD, and both were
 * wrong. Reverting is destructive, so each needed a rule for when it was safe,
 * and the rules kept being narrower than reality:
 *
 *   1. "refuse if a version moved" — Codex review on #140, P2: blind to an added
 *      or removed package, so `npm install some-pkg` that also stripped libc
 *      would have had its new dependency reverted straight back out.
 *   2. "refuse unless the dependency set is identical" — safe, and it refused
 *      the deploy it was written for. Hostinger's install does not merely strip
 *      fields; it re-resolves the tree, so the working lockfile differs from
 *      HEAD by an added or removed package as well. The build log read
 *      "lost 34 platform field(s) AND carries real changes ... Refusing" and
 *      the deploy died on a repair that was declining to run.
 *
 * The mistake in both was reverting at all. This restores the missing fields
 * onto the working lockfile in place, which is loss-free by construction rather
 * than by rule: it only ever ADDS platform values back, only onto an entry that
 * is the SAME ARTIFACT in both files — same key, same version, same integrity,
 * so HEAD's record of which platforms that exact package supports is
 * authoritative — and it unions rather than overwrites, so a value the working
 * copy has and HEAD does not survives too. An added package, a bumped version,
 * a changed range: all untouched, because none of them is an entry this writes.
 *
 * There is therefore no shape it has to refuse, and no way for it to discard
 * work. What it cannot help with — a lockfile that will not parse, an upgrade
 * that dropped metadata on versions HEAD never saw — it leaves alone for
 * verify-deployment.mjs § 4c and the drift guard to report, each of which
 * already owns that condition.
 *
 * @returns {{restored: {pkg: string, field: string, missing: string[]}[], lockfile: object|null}}
 *   `lockfile` is null when there was nothing to restore.
 */
export function lockfilePlatformPatch(baseline, working) {
  const restored = [];
  if (!isLockfileShape(baseline) || !isLockfileShape(working)) return { restored, lockfile: null };

  const patched = JSON.parse(JSON.stringify(working));
  for (const [pkg, was] of Object.entries(baseline.packages)) {
    const now = patched.packages[pkg];
    if (!now || !isSameArtifact(was, now)) continue;
    for (const field of PLATFORM_FIELDS) {
      if (!Array.isArray(was[field])) continue;
      const kept = Array.isArray(now[field]) ? now[field] : [];
      const missing = was[field].filter((v) => !kept.includes(v));
      if (!missing.length) continue;
      /* Union, in HEAD's order, with anything the working copy had that HEAD
         did not appended rather than dropped. Assigning HEAD's array outright
         would be a narrowing — small, but this function's whole claim is that
         it never removes a value. */
      now[field] = [...was[field], ...kept.filter((v) => !was[field].includes(v))];
      restored.push({ pkg, field, missing });
    }
  }
  return { restored, lockfile: restored.length ? patched : null };
}

/* Built output that is not text. Everything else under dist/ gets read as
   text and checked for CR bytes, so a file type that appears later and is not
   listed here fails loudly rather than going unchecked — the wrong way round
   would let the churn back in silently. Adding an extension is a one-line fix;
   a missed text type is another 82-file diff. */
const BINARY_DIST_EXTENSIONS = new Set([
  "jpg", "jpeg", "png", "webp", "avif", "gif", "ico", "svgz",
  "woff", "woff2", "ttf", "otf", "eot",
  "pdf", "mp4", "webm", "mov", "zip", "gz", "br",
]);

/**
 * Is this dist/ path one of the binary outputs?
 *
 * A file with no extension counts as text, deliberately: unknown means check
 * it. `dist/.htaccess` reads as extension "htaccess" and is checked, which is
 * the point — it is the file whose 11 LF lines failed the build.
 */
export function isBinaryDistFile(file) {
  const ext = /\.([A-Za-z0-9]+)$/.exec(file)?.[1]?.toLowerCase();
  return ext ? BINARY_DIST_EXTENSIONS.has(ext) : false;
}

/**
 * CR bytes in built output.
 *
 * dist/ is stored `-text`, so whatever the build writes is what Git keeps and
 * what the deploy uploads. Once source is pinned to LF the build has one
 * input, and any CR reappearing in the output means something upstream went
 * back to writing CRLF. Before this check, 123 of the 133 committed dist files
 * carried mixed endings and each rebuild flipped an arbitrary subset.
 *
 * Read as latin1 so the scan is byte-exact rather than codepoint-exact.
 *
 * @returns {{count: number, firstLine: number}|null} null when clean
 */
export function crDefect(content) {
  const s = typeof content === "string" ? content : content.toString("latin1");
  const first = s.indexOf("\r");
  if (first === -1) return null;
  let count = 0;
  for (let i = 0; i < s.length; i++) if (s.charCodeAt(i) === 13) count++;
  let firstLine = 1;
  for (let i = 0; i < first; i++) if (s.charCodeAt(i) === 10) firstLine++;
  return { count, firstLine };
}

/**
 * Has package.json's engines.node fallen below the strictest floor in the tree?
 *
 * `npm ci` reads engines.node off EVERY package it installs, and .npmrc sets
 * engine-strict=true, so the install dies on the first package whose floor the
 * host's Node is below. The real requirement for this repo is therefore the
 * MAXIMUM floor anywhere in the tree — not the root's, and not Astro's.
 *
 * That distinction is not theoretical. engines.node said `>=22.12.0`, which is
 * Astro 7's floor and was written down as "the strictest in the whole
 * dependency tree". Meanwhile astro -> unifont -> undici@8 required
 * `>=22.19.0`. Hostinger's `22.x` track resolved to v22.18.0 — one patch below
 * — and the 2026-08-29 deploy failed in `npm ci` with EBADENGINE on undici
 * before Astro ever ran. Nothing local noticed, because this machine builds on
 * 24.16.0, where both floors are satisfied and the gap is invisible.
 *
 * Reads the lockfile, not node_modules: package-lock.json is what `npm ci`
 * actually installs, it is committed, and it is present in a clean checkout
 * that has never installed anything.
 *
 * Only bare `>=X.Y.Z` ranges are compared. Real trees also carry shapes like
 * `^20.19.0 || >=22.12.0` (@astrojs/compiler-binding does), and rather than
 * grow a semver parser to adjudicate them this counts them as `unreadable` and
 * reports the number. The check is therefore conservative in one direction
 * only: it can miss a floor, never invent one. For a tripwire that gates
 * `npm run build`, a false red is far more expensive than a missed catch —
 * and the floor that actually bit here was a bare `>=`.
 *
 * @returns {{state: string, declared?: string, strictest?: object,
 *            considered?: number, unreadable?: number}}
 *   drift = a dependency demands more than engines.node promises
 */
export function engineFloorDrift(declared, lockfile) {
  const packages = lockfile?.packages;
  if (!packages || typeof packages !== "object") return { state: "unreadable-lockfile" };

  let strictest = null;
  let considered = 0;
  let unreadable = 0;
  for (const [pkg, entry] of Object.entries(packages)) {
    /* The root entry mirrors the very field under test, so counting it would
       let engines.node vouch for itself and the check could never go red. */
    if (pkg === "") continue;
    const range = entry?.engines?.node;
    if (range == null) continue;
    const floor = rangeFloor(range);
    if (!floor) { unreadable++; continue; }
    considered++;
    if (!strictest || compareFloors(floor, strictest.floor) > 0) {
      strictest = { pkg, range, floor };
    }
  }

  const counts = { considered, unreadable };
  if (declared == null) return { state: "undeclared", strictest, ...counts };

  const declaredFloor = rangeFloor(declared);
  if (!declaredFloor) return { state: "unreadable-declared", declared, strictest, ...counts };
  if (!strictest) return { state: "no-floors", declared, ...counts };

  return {
    state: compareFloors(strictest.floor, declaredFloor) > 0 ? "drift" : "ok",
    declared,
    strictest,
    ...counts,
  };
}
