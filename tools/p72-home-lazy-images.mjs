/**
 * #72: move the homepage off eager CSS background-images.
 *
 *   node tools/p72-home-lazy-images.mjs
 *
 * Two transformations, both behaviour-preserving:
 *
 *  1. Card grids (12 cat-cards, the featured panel, 6 Instagram tiles) swap
 *     their inline background-image for a real lazy <img> pointing at the
 *     card-sized crop from tools/make-home-card-crops.mjs. A CSS
 *     background-image cannot carry loading="lazy"; an <img> can, and the
 *     crops cut the bytes behind each one by roughly 4x on top of that.
 *
 *  2. Hero slides 2-4 move their URL to data-bg. Slide 1 keeps its inline
 *     background-image because it is the LCP element and Base.astro preloads
 *     it. Slides 2-4 are invisible at load and only ever appear via the
 *     rotation script, which now hydrates them — so with JS off, slide 1 is
 *     all that was ever visible anyway and nothing is lost.
 *
 * The width/height attributes come from the same PROFILES table the crops
 * were generated from, so the intrinsic dimensions cannot drift from the
 * files on disk. Idempotent: re-running finds nothing left to convert.
 */
import { readFile, writeFile } from "node:fs/promises";
import { PROFILES, SOURCES, cropName } from "./make-home-card-crops.mjs";

const FILE = "src/content-pages/home.html";
const BG = String.raw`background-image:url\('/assets/img/([a-z0-9.-]+\.jpg)'\);background-size:cover;background-position:center`;

const profileOf = new Map();
for (const [src, prefix] of SOURCES) {
  /* e-17 appears twice under different profiles; the card context decides
     which, so key by "context:source" for the ambiguous one. */
  profileOf.set(`${prefix}:${src}`, prefix);
}

const imgTag = (cls, src, prefix) => {
  const [w, h] = PROFILES[prefix];
  return `<img class="${cls}" src="/assets/img/${cropName(src, prefix)}" alt="" aria-hidden="true" ` +
    `width="${w}" height="${h}" loading="lazy" decoding="async">`;
};

let html = await readFile(FILE, "utf8");
const counts = { catCard: 0, featured: 0, ig: 0, hero: 0 };

/* 1a. cat-cards — the profile depends on the variant class on the parent <a>. */
html = html.replace(
  new RegExp(String.raw`(<a class="cat-card([^"]*)"[^>]*>\s*)<div class="cat-card__ph" style="${BG}"></div>`, "g"),
  (_m, open, variant, src) => {
    const prefix = /--large/.test(variant) ? "hl" : /--wide/.test(variant) ? "hw" : "hc";
    if (!profileOf.has(`${prefix}:${src}`)) {
      throw new Error(`${src} resolved to profile ${prefix}, which is not in the crop table`);
    }
    counts.catCard++;
    return open + imgTag("cat-card__img", src, prefix);
  }
);

/* 1b. featured panel — a bare div becomes a wrapper holding the image. */
html = html.replace(
  new RegExp(String.raw`<div class="featured__image" style="${BG}"></div>`, "g"),
  (_m, src) => {
    counts.featured++;
    return `<div class="featured__image">${imgTag("featured__img", src, "hf")}</div>`;
  }
);

/* 1c. Instagram tiles — keep the hover overlay as the img's sibling. */
html = html.replace(
  new RegExp(String.raw`<div class="ig-post" style="${BG}">`, "g"),
  (_m, src) => {
    counts.ig++;
    return `<div class="ig-post">${imgTag("ig-post__img", src, "hi")}`;
  }
);

/* 2. Hero slides 2-4 only. The is-active slide is slide 1 and stays eager. */
html = html.replace(
  new RegExp(String.raw`(<div class="hero__bg hero__slide" style=")${BG}(")`, "g"),
  (_m, open, src, close) => {
    counts.hero++;
    return `${open}background-size:cover;background-position:center" data-bg="/assets/img/${src}${close}`;
  }
);

await writeFile(FILE, html, "utf8");

const leftover = (html.match(/background-image:url\('\/assets\/img\//g) ?? []).length;
console.log(`cat-cards: ${counts.catCard} (expect 12)`);
console.log(`featured:  ${counts.featured} (expect 1)`);
console.log(`ig tiles:  ${counts.ig} (expect 6)`);
console.log(`hero 2-4:  ${counts.hero} (expect 3)`);
console.log(`inline background-image left: ${leftover} (expect 1 — the LCP hero slide)`);
