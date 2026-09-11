/** Derive responsive WebP/AVIF build output from restored source images. */
import { readFile, writeFile, mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIST = path.join(ROOT, "dist");
const ELIGIBLE = new Map([
  ["dest-hero__img", { kind: "hero", sizes: "100vw" }],
  ["exp-hero__img", { kind: "hero", sizes: "100vw" }],
  ["post-hero__img", { kind: "hero", sizes: "100vw" }],
  ["place-card__img", { kind: "card", sizes: "(max-width: 760px) calc(100vw - 40px), (max-width: 1100px) calc(50vw - 40px), 385px" }],
  ["exp-card__img", { kind: "card", sizes: "(max-width: 760px) calc(100vw - 40px), (max-width: 1100px) calc(50vw - 40px), 385px" }],
  ["cat-card__img", { kind: "card", sizes: "(max-width: 760px) calc(100vw - 40px), (max-width: 900px) calc(50vw - 30px), 25vw" }],
  ["featured__img", { kind: "card", sizes: "(max-width: 900px) 100vw, 50vw" }],
]);

const htmlFiles = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (entry.name.endsWith(".html")) htmlFiles.push(file);
  }
}
function attrs(tag) {
  return Object.fromEntries([...tag.matchAll(/([:\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
}
function responsiveUrl(src, width, format) {
  const parsed = path.posix.parse(src);
  return `/assets/responsive${parsed.dir.replace(/^\/assets/, "")}/${parsed.name}-${width}.${format}`;
}
function setAttr(tag, name, value) {
  const escaped = value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  const re = new RegExp(`\\s${name}="[^"]*"`);
  return re.test(tag) ? tag.replace(re, ` ${name}="${escaped}"`) : tag.replace(/\s*\/>$|>$/, ` ${name}="${escaped}">`);
}

await walk(DIST);
const jobs = new Map();
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  for (const tag of html.match(/<img\b[^>]*>/gi) ?? []) {
    const a = attrs(tag);
    const match = (a.class ?? "").split(/\s+/).find((name) => ELIGIBLE.has(name));
    if (!match || !a.src?.startsWith("/assets/") || !/\.(?:jpe?g|png)$/i.test(a.src)) continue;
    const job = jobs.get(a.src) ?? { src: a.src, kinds: new Set() };
    job.kinds.add(ELIGIBLE.get(match).kind);
    jobs.set(a.src, job);
  }
}

const built = new Map();
let sourceBytes = 0;
let avifLargestBytes = 0;
async function buildJob(job) {
  const input = path.join(DIST, job.src.replace(/^\//, ""));
  const meta = await sharp(input, { failOn: "error" }).metadata();
  if (!meta.width || !meta.height) throw new Error(`responsive-images: no dimensions for ${job.src}`);
  const requested = [
    ...(job.kinds.has("hero") ? [768, Math.min(1600, meta.width)] : []),
    ...(job.kinds.has("card") ? [Math.min(800, meta.width)] : []),
  ];
  const widths = [...new Set(requested.filter((width) => width > 0 && width <= meta.width))].sort((a, b) => a - b);
  const variants = { avif: [], webp: [] };
  sourceBytes += (await stat(input)).size;
  for (const width of widths) {
    for (const format of ["avif", "webp"]) {
      const url = responsiveUrl(job.src, width, format);
      const output = path.join(DIST, url.replace(/^\//, ""));
      await mkdir(path.dirname(output), { recursive: true });
      const pipeline = sharp(input).resize({ width, withoutEnlargement: true });
      if (format === "avif") await pipeline.avif({ quality: 55, effort: 2 }).toFile(output);
      else await pipeline.webp({ quality: 82, effort: 4 }).toFile(output);
      const bytes = (await stat(output)).size;
      variants[format].push({ width, url, bytes });
    }
  }
  avifLargestBytes += variants.avif.at(-1)?.bytes ?? 0;
  built.set(job.src, { ...job, width: meta.width, height: meta.height, variants });
}

const queue = [...jobs.values()];
console.log(`responsive-images: deriving variants for ${queue.length} source images`);
async function worker() {
  while (queue.length) await buildJob(queue.shift());
}
await Promise.all(Array.from({ length: Math.min(4, queue.length) }, worker));

for (const file of htmlFiles) {
  let html = await readFile(file, "utf8");
  html = html.replace(/<img\b[^>]*>/gi, (tag) => {
    const a = attrs(tag);
    const match = (a.class ?? "").split(/\s+/).find((name) => ELIGIBLE.has(name));
    const item = match && built.get(a.src);
    if (!item || (a.srcset && a.sizes)) return tag;
    const sizes = ELIGIBLE.get(match).sizes;
    let fallback = setAttr(tag, "width", String(item.width));
    fallback = setAttr(fallback, "height", String(item.height));
    fallback = setAttr(fallback, "srcset", `${item.src} ${item.width}w`);
    fallback = setAttr(fallback, "sizes", sizes);
    const sources = ["avif", "webp"].map((format) => {
      const srcset = item.variants[format].map((v) => `${v.url} ${v.width}w`).join(", ");
      return `<source type="image/${format}" srcset="${srcset}" sizes="${sizes}">`;
    }).join("");
    return `<picture class="responsive-picture">${sources}${fallback}</picture>`;
  });
  html = html.replace(/<link rel="preload" as="image" href="([^"]+)" fetchpriority="high"\s*\/?>/g, (tag, src) => {
    const item = built.get(src);
    if (!item || !item.kinds.has("hero")) return tag;
    const variants = item.variants.avif;
    const srcset = variants.map((v) => `${v.url} ${v.width}w`).join(", ");
    return `<link rel="preload" as="image" type="image/avif" href="${variants.at(-1).url}" imagesrcset="${srcset}" imagesizes="100vw" fetchpriority="high">`;
  });
  await writeFile(file, html, "utf8");
}

const saving = sourceBytes ? Math.round((1 - avifLargestBytes / sourceBytes) * 100) : 0;
console.log(`responsive-images: ${jobs.size} source images, largest AVIF candidates ${saving}% smaller than originals`);
