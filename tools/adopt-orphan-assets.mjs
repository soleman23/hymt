/**
 * Bring assets the site references but the pipeline never knew about into it.
 *
 *   node tools/adopt-orphan-assets.mjs
 *
 * public/assets is gitignored, so an image only survives a fresh clone if it
 * has a base64 twin in images-b64/ and an entry in MANIFEST.json. Eleven
 * images skipped that step: they are referenced from src/, they are absent
 * from public/ and from the MANIFEST, and they exist solely as leftovers in
 * this machine's dist/ from an older build.
 *
 * Nothing caught it because the verifier's missing-asset check reads dist/,
 * and dist/ still had them. On a fresh clone `npm run build` would have
 * produced a site with eleven broken images — the journal hub, four regional
 * guides and two journal posts among them.
 *
 * This copies each one back out of dist/ into public/, writes its base64
 * twin and its MANIFEST entry, so the build reproduces it from now on. The
 * source-asset-coverage check in verify-deployment.mjs is what stops another
 * one slipping through.
 *
 * Idempotent: an asset already in the MANIFEST is left alone.
 */
import { readFile, writeFile, copyFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PUB = path.join(ROOT, "public");
const DIST = path.join(ROOT, "dist");
const B64 = path.join(ROOT, "images-b64");
const MANIFEST = path.join(B64, "MANIFEST.json");

const exists = (p) => access(p, constants.R_OK).then(() => true, () => false);

/* Every /assets/... reference the source tree makes. */
const SRC_DIRS = ["src/content-pages", "src/pages", "src/components", "src/layouts"];
const refs = new Set();
const walk = async (dir) => {
  const { readdir } = await import("node:fs/promises");
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) await walk(f);
    else if (/\.(html|astro|ts|mjs)$/.test(f) && !f.endsWith(".bak")) {
      const text = await readFile(f, "utf8");
      for (const m of text.matchAll(/\/assets\/[A-Za-z0-9._\/-]+\.(?:jpe?g|png|webp|svg)/g)) refs.add(m[0]);
    }
  }
};
for (const d of SRC_DIRS) if (await exists(path.join(ROOT, d))) await walk(path.join(ROOT, d));

const manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
const known = new Set(manifest.map((m) => m.target));

let adopted = 0, fine = 0;
const unrecoverable = [];

for (const ref of [...refs].sort()) {
  const rel = ref.replace(/^\//, "");
  const target = `public/${rel}`;
  if (known.has(target) || (await exists(path.join(PUB, rel)))) { fine++; continue; }

  const fromDist = path.join(DIST, rel);
  if (!(await exists(fromDist))) { unrecoverable.push(ref); continue; }

  await copyFile(fromDist, path.join(PUB, rel));
  const buf = await readFile(fromDist);
  const b64Name = `assets__${rel.replace(/^assets\//, "").replace(/\//g, "__")}.b64`;
  await writeFile(path.join(B64, b64Name), buf.toString("base64"), "utf8");
  manifest.push({ b64: `images-b64/${b64Name}`, target, bytes: buf.length });
  console.log(`  adopted ${ref}  ${(buf.length / 1024).toFixed(0)} KB`);
  adopted++;
}

if (adopted) await writeFile(MANIFEST, JSON.stringify(manifest, null, 1) + "\n", "utf8");

console.log(`\nadopted ${adopted}, already in the pipeline ${fine}`);
if (unrecoverable.length) {
  console.error(`\n${unrecoverable.length} referenced asset(s) exist NOWHERE — not in public/, not in the`);
  console.error(`MANIFEST, not in dist/. These need the real file:`);
  for (const r of unrecoverable) console.error(`  ${r}`);
  process.exit(1);
}
console.log(`MANIFEST.json now has ${manifest.length} entries`);
