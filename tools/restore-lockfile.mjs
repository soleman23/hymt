/**
 * Put back the platform fields an install dropped from package-lock.json.
 *
 *   node tools/restore-lockfile.mjs
 *
 * Runs early in `npm run build`, for one situation: a build host that runs its
 * own install BEFORE the build command, and whose install is not `npm ci`.
 * Hostinger's is not. It reported `added 290 packages` with none skipped and
 * 105 funding entries where this lockfile installs 193 with 70 — nothing is
 * skipped only when nothing says which platform a package is for — and the
 * lockfile it left behind had lost all 34 `libc` blocks. The guards that notice
 * then failed the deploy over a file the repo never produced.
 *
 * It repairs rather than reports because hPanel's build command cannot be
 * edited on this account: `npm run build` is what the host runs, so
 * `npm run build` is what has to cope.
 *
 * It does NOT revert the file. Two earlier versions did, and both were wrong —
 * see lockfilePlatformPatch in ./repo-checks.mjs, which carries the history and
 * does the work. It only adds platform values back onto entries that are the
 * same artifact in both files, so there is no shape it must refuse and no way
 * for it to discard anyone's work.
 *
 * What it changed is always printed. A repair nobody can see in the build log
 * would be the thing that hides a local mistake.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { lockfilePlatformPatch, lockfileMetadataLoss } from "./repo-checks.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const LOCKFILE = "package-lock.json";
const LOCK_PATH = path.join(ROOT, LOCKFILE);

/* Same probe as verify-deployment.mjs § 4c and verify-checks.test.mjs: "no git
   here" is a supported way to build this repo, not a failure. */
const gitAvailable = (() => {
  try {
    execFileSync("git", ["rev-parse", "--git-dir"], { cwd: ROOT, stdio: "ignore" });
    return true;
  } catch { return false; }
})();

const parse = (read) => {
  try { return JSON.parse(read()); } catch { return null; }
};

const head = gitAvailable
  ? parse(() => execFileSync("git", ["show", `HEAD:${LOCKFILE}`],
      { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 28 }))
  : null;
const working = parse(() => readFileSync(LOCK_PATH, "utf8"));

if (!head) {
  console.log(`  --  ${LOCKFILE} left alone — no committed copy to compare against (no git here, or HEAD carries none)`);
  process.exit(0);
}
if (!working) {
  /* § 4c fails on this with a message about it, and failing here first would
     pre-empt that with a worse one. A lockfile that will not parse can also be
     a merge conflict, which is content, so it is emphatically not something to
     overwrite. */
  console.log(`  --  ${LOCKFILE} is missing or will not parse — left alone for verify-deployment § 4c to report`);
  process.exit(0);
}

const { restored, lockfile } = lockfilePlatformPatch(head, working);

if (!restored.length) {
  console.log(`  ok  ${LOCKFILE} keeps the platform metadata HEAD recorded — nothing to restore`);
  process.exit(0);
}

const entries = new Set(restored.map((r) => r.pkg));
console.log(`  --  ${LOCKFILE} had lost ${restored.length} platform field(s) across ${entries.size} entries — restoring them in place`);

/* 2-space indent and a trailing newline is what npm writes, so on a tree where
   nothing was actually missing this rewrite would be byte-identical. */
writeFileSync(LOCK_PATH, `${JSON.stringify(lockfile, null, 2)}\n`);

/* Verify rather than assume. A patch that reported success and left a field
   missing would otherwise hand the same lockfile to the guards below under a
   line claiming it was fixed. */
const after = parse(() => readFileSync(LOCK_PATH, "utf8"));
const remaining = after ? lockfileMetadataLoss(head, after) : null;
if (!after || remaining === null || remaining.length) {
  console.error(
    `\nERROR: ${LOCKFILE} still lacks ${remaining?.length ?? "?"} platform field(s) after the repair — not proceeding.\n`);
  process.exit(1);
}
console.log(`  ok  ${LOCKFILE} platform metadata restored — ${Object.keys(after.packages).length} entries, nothing else changed`);
