/**
 * Per-page sitemap lastmod, derived from git (#70).
 *
 * The sitemap used to stamp every URL with the moment of the build, which
 * made lastmod pure noise: all 97 dates moved in lockstep on every build, so
 * crawlers learn to ignore the field (Google has said publicly it ignores
 * lastmod where it is demonstrably unreliable — this was the textbook case),
 * and every content commit carried a spurious two-file sitemap diff because
 * dist/ is committed.
 *
 * A page's date is now the last commit that touched its SOURCES:
 *
 *   /destinations/italy/  ->  src/pages/destinations/italy/index.astro
 *                             src/content-pages/destinations__italy.html
 *   /                     ->  src/pages/index.astro
 *                             src/content-pages/home.html
 *
 * That convention (path segments joined by "__"; root is home.html) holds for
 * all 97 routes today. Deliberately content-scoped: a layout or stylesheet
 * commit re-renders every page but does not change what any page SAYS, and
 * lastmod is a statement about content. DECISIONS.md D6 journal dating is
 * untouched — this reads commit history, not the publishDate props the launch
 * runbook stamps.
 *
 * Collection hubs are an exception: /destinations/ and /experiences/ build
 * their CollectionPage ItemList from a glob of each child index.astro, so
 * adding or removing a child route changes the hub's deployed JSON-LD without
 * touching the hub's own two source files. Those hubs therefore also include
 * every live child index.astro in their source set.
 *
 * One `git log` walks the whole history once (newest first; the first time a
 * file appears is its last modification). Files with uncommitted changes get
 * their filesystem mtime — stable across two consecutive builds, which is the
 * property that matters. If git is unavailable entirely, every page gets no
 * lastmod at all: a sitemap without the field beats one that lies. A shallow
 * clone — the shape the deploy host builds from — has no history to walk
 * either; there the dates are read back from the sitemap HEAD already
 * commits (see sitemapLastmods) rather than recomputed from a log that
 * would date every page at HEAD.
 */
import { execFileSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { lastmodPairs } from "./content-checks.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

/** Hubs whose ItemList is discovered via a child-page glob. */
const CHILD_GLOB_HUBS = new Set(["destinations", "experiences"]);

/** file (repo-relative, /-separated) -> YYYY-MM-DD of its last commit. */
let committed = null;
/** files with uncommitted modifications (or untracked), same key shape. */
let dirty = null;
/**
 * pathname -> YYYY-MM-DD read back from HEAD's committed sitemap. Set only on
 * a shallow checkout, where there is no history to derive dates from; null
 * whenever the log walk in load() is trustworthy.
 */
let recorded = null;

/**
 * pathname -> YYYY-MM-DD for every <url> in a sitemap that declares a lastmod.
 *
 * The read-back path for a checkout with no usable history. Hostinger builds
 * from a one-commit-deep clone, so `git log` there reports every source file
 * as first appearing at HEAD and every page inherits HEAD's commit day: on
 * 2026-09-02 staging served 122 of 122 URLs dated 2026-09-01 — the lockstep
 * noise #70 removed, reintroduced by the host. dist/ is committed and CI
 * fails any commit whose dist/ differs from a full-history build, so HEAD's
 * own dist/sitemap-0.xml is the record of what those dates are. Pairing rule
 * is lastmodPairs's: a URL without a lastmod records nothing rather than
 * borrowing the next entry's date.
 */
export function sitemapLastmods(xml) {
  const out = new Map();
  for (const [loc, date] of lastmodPairs(xml)) {
    try { out.set(new URL(loc).pathname, date); } catch { /* not a URL */ }
  }
  return out;
}

/** True when git reports a shallow clone — history cut off at some depth. */
function isShallow() {
  return execFileSync("git", ["rev-parse", "--is-shallow-repository"],
    { cwd: ROOT, encoding: "utf8" }).trim() === "true";
}

function load() {
  if (committed) return;
  committed = new Map();
  dirty = new Set();
  try {
    if (isShallow()) {
      // No history to walk. Read the dates HEAD already carries; if HEAD has
      // no committed sitemap either, this throws and every page gets no
      // lastmod at all — the same answer as "git unavailable" below.
      recorded = sitemapLastmods(execFileSync("git", ["show", "HEAD:dist/sitemap-0.xml"],
        { cwd: ROOT, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 }));
      return;
    }
    // %x00 date sentinel, then the commit's file list. Newest-first, so only
    // the first sighting of each path is recorded.
    const log = execFileSync(
      "git",
      ["log", "--format=%x00%cI", "--name-only", "--", "src/pages", "src/content-pages"],
      { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }
    );
    let date = "";
    for (const line of log.split("\n")) {
      if (line.startsWith("\x00")) date = line.slice(1, 11); // YYYY-MM-DD
      else if (line.trim() && !committed.has(line.trim())) committed.set(line.trim(), date);
    }
    const status = execFileSync("git", ["status", "--porcelain", "--", "src/pages", "src/content-pages"],
      { cwd: ROOT, encoding: "utf8" });
    for (const line of status.split("\n")) {
      const f = line.slice(3).trim();
      if (f) dirty.add(f.replace(/\\/g, "/"));
    }
  } catch {
    committed = new Map(); // git unavailable -> everything resolves undefined
    dirty = new Set();
  }
}

/** Child index.astro files a Collection hub glob will pick up this build. */
function childHubSources(hub) {
  try {
    return readdirSync(path.join(ROOT, "src/pages", hub), { withFileTypes: true })
      .filter((ent) => ent.isDirectory())
      .map((ent) => `src/pages/${hub}/${ent.name}/index.astro`);
  } catch {
    return [];
  }
}

/** Candidate source files for a route pathname, repo-relative. */
function sourcesOf(pathname) {
  const segs = pathname.replace(/^\/|\/$/g, "").split("/").filter(Boolean);
  if (segs.length === 0) return ["src/pages/index.astro", "src/content-pages/home.html"];
  const own = [
    `src/pages/${segs.join("/")}/index.astro`,
    `src/content-pages/${segs.join("__")}.html`,
  ];
  if (segs.length === 1 && CHILD_GLOB_HUBS.has(segs[0])) {
    return [...own, ...childHubSources(segs[0])];
  }
  return own;
}

/**
 * The LOCAL calendar day of a Date, as YYYY-MM-DD.
 *
 * `toISOString()` is UTC, and that gap is the whole reason this exists. The
 * committed branch below reads `%cI` — the commit date carrying its own local
 * offset — so slicing it yields a LOCAL day. The dirty branch used to slice
 * `mtime.toISOString()`, which yields a UTC day. The two disagree whenever the
 * local clock is within the zone's UTC offset of midnight — the last 7 hours of
 * a PDT day, 8 of a PST one — and the dirty branch is the one that runs for a
 * page whose source is still uncommitted.
 *
 * Concretely: `/` and `/about/` shipped `<lastmod>2026-08-25</lastmod>` because
 * the build that produced that sitemap ran at 17:47 Pacific on the 24th while
 * both sources were uncommitted, and 17:47 -0700 is 00:47 UTC on the 25th. The
 * date only corrected when a later rebuild happened to run after the sources
 * were committed, so it shipped a day-ahead lastmod in the meantime.
 *
 * Exported so verify-deployment.mjs derives "today" the same way instead of
 * keeping a second copy of the convention that could drift from this one.
 *
 * `offsetMinutes` defaults to the host's own offset, which is the only path
 * production takes — both callers pass just a Date. It is injectable so the
 * fixtures can pin real offsets deterministically, including the 45-minute
 * ones. Without that they depend on the suite's ambient timezone, where the
 * pre-fix and post-fix code agree often enough for the guard to be inert: at
 * UTC the shift is by zero and the two are definitionally identical, and at
 * Europe/London neither an August evening (+01:00) nor a January morning
 * (+00:00) crosses midnight UTC either. CI runners default to UTC.
 */
export const localDay = (d, offsetMinutes = d.getTimezoneOffset()) =>
  new Date(d.getTime() - offsetMinutes * 60000).toISOString().slice(0, 10);

/**
 * YYYY-MM-DD the page's content last changed, or undefined when unknowable.
 * @param {string} pathname  e.g. "/destinations/italy/"
 */
export function pageLastmod(pathname) {
  load();
  if (recorded) return recorded.get(pathname);
  let latest;
  for (const f of sourcesOf(pathname)) {
    let d;
    if (dirty.has(f)) {
      try {
        /* Clamped to the build day. A future mtime — clock skew, or an archive
           or FTP restore that preserved timestamps — would otherwise write a
           lastmod for a day that has not happened, and the verifier can only
           catch that after dist is already on disk. For a dirty file the claim
           is "changed recently" anyway, so today is the honest ceiling. */
        const seen = localDay(statSync(path.join(ROOT, f)).mtime);
        const today = localDay(new Date());
        d = seen > today ? today : seen;
      } catch { /* gone */ }
    } else {
      d = committed.get(f);
    }
    if (d && (!latest || d > latest)) latest = d;
  }
  return latest;
}
