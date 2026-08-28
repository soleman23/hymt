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
  const m = /^>=\s*v?(\d+)\.(\d+)\.(\d+)\s*$/.exec(String(range ?? "").trim());
  const current = parseNodeVersion(version);
  if (!m || !current) return null;
  const floor = [Number(m[1]), Number(m[2]), Number(m[3])];
  for (let i = 0; i < 3; i++) {
    if (current[i] !== floor[i]) return current[i] > floor[i];
  }
  return true;
}
