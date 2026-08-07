/**
 * Cross-platform runner for tools/restore_images.py.
 *
 * `npm run build` calls this between `astro build` and the verifier, because
 * astro build wipes dist/assets/ on every run and forgetting the restore step
 * has shipped broken images before. The interpreter is `python3` on mac/linux
 * and `python` on Windows (where the bare `python3` name is a Microsoft Store
 * alias that prints an install nag and exits non-zero) — this probes for a
 * real interpreter instead of hardcoding either name.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT = path.join(fileURLToPath(new URL("..", import.meta.url)), "tools", "restore_images.py");

function isRealPython(cmd) {
  try {
    const probe = spawnSync(cmd, ["--version"], { encoding: "utf8", windowsHide: true });
    return probe.status === 0 && /^Python \d/.test((probe.stdout || "") + (probe.stderr || ""));
  } catch {
    return false;
  }
}

const python = ["python3", "python", "py"].find(isRealPython);
if (!python) {
  console.error("restore-images: no working Python interpreter found (tried python3, python, py).");
  process.exit(1);
}

const run = spawnSync(python, [SCRIPT], { stdio: "inherit", windowsHide: true });
process.exit(run.status ?? 1);
