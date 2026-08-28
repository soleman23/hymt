/**
 * Build preflight: refuse to start on a Node the dependency tree rejects.
 *
 *   node tools/check-node.mjs
 *
 * Runs as the first stage of `npm run build`, before astro touches dist/.
 *
 * Why this exists: after the Astro 7 upgrade the build needs Node >=22.12.0,
 * and the default Node on the build machine is 20.19.0. A bare `npm run build`
 * died several seconds in with "Node.js v20.19.0 is not supported by Astro!",
 * which says what is wrong but not what to do about it — and on this machine
 * what to do about it is specifically NOT `nvm use`. This stage fails in
 * milliseconds and prints the recipe instead.
 *
 * package.json engines is the single source of the floor; nothing here repeats
 * the number. Bumping the dependency tree therefore moves this check with it,
 * as long as engines is kept honest.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { satisfiesNodeRange } from "./repo-checks.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const pkg = JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8"));
const range = pkg.engines?.node;

if (!range) {
  console.error(`
package.json declares no engines.node.

  The build needs a floor to check against. Astro's own package.json carries
  the real requirement — read it and mirror it here:

      node -e "console.log(require('./node_modules/astro/package.json').engines.node)"
`);
  process.exit(1);
}

const ok = satisfiesNodeRange(range, process.version);

if (ok === null) {
  /* Not a failure: an unreadable range means this check cannot judge, and
     saying so is better than either blocking a good build or waving through a
     bad one. Astro still enforces its own floor a few seconds later. */
  console.log(`  --  engines.node is "${range}", which check-node.mjs cannot evaluate.`);
  console.log(`      It understands a ">=X.Y.Z" floor. Astro's check still applies.`);
  process.exit(0);
}

if (!ok) {
  console.error(`
This build needs Node ${range}. It is running on ${process.version}.

  Astro refuses to start below the floor, so the build would fail a few
  seconds from now with a less specific message.

  Put a supported Node first on PATH for this one command:

      export PATH="<your-nvm-root>/v24.16.0:$PATH"
      npm run build

  Do NOT run \`nvm use\`. nvm4w switches a machine-wide symlink, which changes
  the Node version under every other shell and session on this machine at the
  same time — it has already moved mid-session here. CLAUDE.md § Node has the
  full recipe.
`);
  process.exit(1);
}

console.log(`  ok  node ${process.version} satisfies engines.node ${range}`);
