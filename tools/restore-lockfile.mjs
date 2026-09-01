/**
 * Put HEAD's package-lock.json back when an install has degraded it.
 *
 *   node tools/restore-lockfile.mjs
 *
 * The first stage of `npm run build:host`, which exists for one situation: a
 * deploy host that runs its own install BEFORE it runs the build command, and
 * whose install is not `npm ci`. Hostinger's is not. On 2026-09-01 it reported
 * `added 290 packages` with none skipped and 105 funding entries, where the
 * committed lockfile installs 193 with 70 — nothing is skipped only when
 * nothing says which platform a package is for, and that install had stripped
 * every libc/os/cpu field out of package-lock.json in the build directory.
 * Everything downstream then builds from a tree this repo never pinned.
 *
 * Restoring is destructive, so the decision is NOT made here. lockfileRestoreAction
 * in ./repo-checks.mjs makes it, has fixtures for all four answers, and refuses
 * on the one shape that matters: a lockfile carrying a real dependency change,
 * which is someone's uncommitted work rather than an installer's damage.
 *
 * Nothing in `npm run build` calls this. A build must not repair its own
 * inputs — that is how a local mistake gets papered over instead of reported.
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
  /* The guard that makes this script safe to run anywhere. An installer strips
     fields off packages it did not change; it does not move versions. A moved
     version means a dependency bump someone has not committed yet, and
     `git checkout` would throw it away. */
  console.error(
    `\nERROR: ${LOCKFILE} carries a dependency change — a version or integrity that moved.\n` +
    `       That is uncommitted work, not the damage this script repairs, and restoring\n` +
    `       HEAD over it would discard it. Refusing.\n\n` +
    `       If the change is wanted, commit it and build with \`npm run build\`.\n` +
    `       If it is not, discard it yourself: git checkout HEAD -- ${LOCKFILE}\n`);
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
