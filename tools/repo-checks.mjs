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
 * Compares only packages present in BOTH lockfiles, so removing a dependency
 * outright is a dependency change rather than metadata loss, and reports a
 * value that was there and no longer is. A genuine upstream change — a package
 * that really did drop `libc` in a new version — reads the same way and has to
 * be confirmed by hand against the registry; that is rare and worth the stop.
 *
 * @returns {{pkg: string, field: string, missing: string[]}[]} empty when clean
 */
export function lockfileMetadataLoss(before, after) {
  const losses = [];
  const a = before?.packages ?? {};
  const b = after?.packages ?? {};
  for (const [pkg, was] of Object.entries(a)) {
    const now = b[pkg];
    if (!now) continue;
    for (const field of PLATFORM_FIELDS) {
      if (!Array.isArray(was[field])) continue;
      const kept = Array.isArray(now[field]) ? now[field] : [];
      const missing = was[field].filter((v) => !kept.includes(v));
      if (missing.length) losses.push({ pkg, field, missing });
    }
  }
  return losses;
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
