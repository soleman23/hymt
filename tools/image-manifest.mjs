/**
 * The one read/write path for images-b64/MANIFEST.json.
 *
 * Every intake and crop tool calls this module so new entries are sorted by
 * target instead of appended at the shared end of the file. The pure rules
 * live in content-checks.mjs so the build verifier and fixture suite exercise
 * the same implementation.
 *
 *   node tools/image-manifest.mjs
 *   JSON_MANIFEST | node tools/image-manifest.mjs --stdin [manifest-path]
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  formatImageManifest,
  imageManifestDefects,
} from "./content-checks.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
export const IMAGE_MANIFEST = path.join(ROOT, "images-b64", "MANIFEST.json");

const parseManifest = (text, source) => {
  let entries;
  try {
    entries = JSON.parse(text);
  } catch (error) {
    throw new Error(`${source}: invalid JSON (${error.message})`);
  }
  const defects = imageManifestDefects(entries);
  if (defects.length) throw new Error(`${source}: ${defects.join("; ")}`);
  return entries;
};

export async function readImageManifest(file = IMAGE_MANIFEST) {
  return parseManifest(await readFile(file, "utf8"), file);
}

export async function writeImageManifest(file, entries) {
  const formatted = formatImageManifest(entries);
  await writeFile(file, formatted, "utf8");
  return JSON.parse(formatted);
}

const invokedDirectly = process.argv[1]
  && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (invokedDirectly) {
  const useStdin = process.argv.includes("--stdin");
  const positional = process.argv.slice(2).filter((arg) => arg !== "--stdin");
  if (positional.length > 1) {
    throw new Error("usage: node tools/image-manifest.mjs [--stdin] [manifest-path]");
  }
  const file = positional[0] ? path.resolve(positional[0]) : IMAGE_MANIFEST;
  let entries;
  if (useStdin) {
    let input = "";
    for await (const chunk of process.stdin) input += chunk;
    try {
      entries = JSON.parse(input);
    } catch (error) {
      throw new Error(`stdin: invalid JSON (${error.message})`);
    }
  } else {
    try {
      entries = JSON.parse(await readFile(file, "utf8"));
    } catch (error) {
      throw new Error(`${file}: invalid JSON (${error.message})`);
    }
  }
  const sorted = await writeImageManifest(file, entries);
  console.log(`  ok  ${path.relative(ROOT, file).replace(/\\/g, "/")} sorted (${sorted.length} entries)`);
}
