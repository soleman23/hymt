/**
 * Put HEAD's package-lock.json back when an install has degraded it.
 *
 *   node tools/restore-lockfile.mjs
 *
 * Runs early in `npm run build`, for one situation: a build host that runs its
 * own install BEFORE the build command, and whose install is not `npm ci`.
 * Hostinger's is not. On 2026-09-01 it reported `added 290 packages` with none
 * skipped and 105 funding entries, where this lockfile installs 193 with 70 —
 * nothing is skipped only when nothing says which platform a package is for,
 * and that install had stripped every libc/os/cpu field out of
 * package-lock.json in the build directory. Everything downstream then builds
 * from a tree this repo never pinned, and the guards that notice fail the
 * deploy.
 *
 * It repairs rather than reports because hPanel's build command cannot be
 * changed on this account — `npm run build` is what the host runs, so `npm run
 * build` is what has to cope. That is only defensible because the repair is
 * provably lossless: lockfileRestoreAction in ./repo-checks.mjs restores ONLY
 * when the sole difference from HEAD is the missing platform fields — same
 * package set, same versions and integrity, same root dependency ranges — so
 * HEAD holds everything the working copy holds and reverting discards nothing.
 * Every other shape is refused and left to a human, loudly.
 *
 * What it does is printed either way. A repair nobody can see in the build log
 * would be the thing that hides a local mistake.
 */
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { lockfileRestoreAction, lockfileMetadataLoss } from "./repo-checks.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const LOCKFILE = "package-lock.json";

const git = (args, opts = {}) =>
  execFileSync("git", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 28, ...opts });

/* Same probe as verify-deployment.mjs § 4c and verify-checks.test.mjs: "no git
   here" is a supported way to build this repo, not a failure. */
const gitAvailable = (() => {
  try {
    git(["rev-parse", "--git-dir"], { stdio: "ignore", encoding: undefined });
    return true;
  } catch { return false; }
})();

const parse = (read) => {
  try { return JSON.parse(read()); } catch { return null; }
};

const head = gitAvailable ? parse(() => git(["show", `HEAD:${LOCKFILE}`])) : null;
const working = parse(() => readFileSync(path.join(ROOT, LOCKFILE), "utf8"));

const action = lockfileRestoreAction(head, working, gitAvailable);

if (action === "no-baseline") {
  console.log(`  --  ${LOCKFILE} left alone — no committed copy to restore from (no git here, or HEAD carries none)`);
  process.exit(0);
}

if (action === "keep") {
  console.log(`  ok  ${LOCKFILE} still matches HEAD's platform metadata — nothing to restore`);
  process.exit(0);
}

if (action === "refuse") {
  /* The guard that makes an automatic repair safe. The working copy has lost
     platform metadata AND carries real changes — an added or removed package, a
     moved version, a changed range — so HEAD does not hold everything it holds
     and a checkout would destroy the difference. That combination is the
     2026-08 incident itself: an install that carried real work and dropped 102
     libc blocks with it. It needs a person, not a script. */
  const losses = lockfileMetadataLoss(head, working);
  console.error(
    `\nERROR: ${LOCKFILE} has lost ${losses.length} platform field(s) AND carries real changes\n` +
    `       (a package added or removed, a version moved, or a changed dependency range).\n` +
    `       HEAD does not hold those changes, so restoring it would destroy them. Refusing.\n\n` +
    `       Repair the metadata without losing the change:\n` +
    `         1. note what you meant to change in ${LOCKFILE}\n` +
    `         2. git checkout HEAD -- ${LOCKFILE}\n` +
    `         3. redo the dependency change with \`npm install\`, then check the diff\n` +
    `            keeps every "libc" / "os" / "cpu" block it started with\n`);
  process.exit(1);
}

/* action === "restore". Report what was actually wrong before changing it, so
   the build log carries the evidence rather than just the repair. */
const losses = head && working ? lockfileMetadataLoss(head, working) : [];
const entries = new Set(losses.map((l) => l.pkg));
console.log(losses.length
  ? `  --  ${LOCKFILE} lost ${losses.length} platform field(s) across ${entries.size} entries since HEAD — restoring`
  : `  --  ${LOCKFILE} is missing or unparseable — restoring HEAD's copy`);

git(["checkout", "HEAD", "--", LOCKFILE]);

/* Verify the repair rather than assuming it. A `git checkout` that reported
   success and left the file unchanged would otherwise hand the same broken
   lockfile to `npm ci` with a line above it claiming it was fixed. */
const after = parse(() => readFileSync(path.join(ROOT, LOCKFILE), "utf8"));
const remaining = head && after ? lockfileMetadataLoss(head, after) : null;
if (!after || remaining === null || remaining.length) {
  console.error(`\nERROR: ${LOCKFILE} still differs from HEAD after the restore — not proceeding.\n`);
  process.exit(1);
}
console.log(`  ok  ${LOCKFILE} restored from HEAD — ${Object.keys(after.packages).length} entries`);
