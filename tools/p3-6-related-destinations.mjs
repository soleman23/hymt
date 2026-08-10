/**
 * P3-6 (issue #27), legs 3 and 4 of 4 — related destinations, and the child→hub
 * link that the breadcrumb explicitly does not satisfy.
 *
 * SEO-AIO-PLAN § P3-6: "Related-destinations block on each destination page
 * (3–4 genuinely related, not random)." Exactly one page had one — /maldives/,
 * and all three of its cards pointed at /destinations/ rather than a
 * destination, and named two places (Seychelles, Bora Bora) that have no page.
 * That block is replaced here along with the other 32.
 *
 * "Related" is read as CONTENT-STANDARDS § 7 defines it: a reader choosing
 * between them would actually be choosing between them. That is frequently not
 * the same region — the Maldives competes with French Polynesia and Turks &
 * Caicos, not with Japan — so the mapping below crosses hubs where the real
 * decision does.
 *
 * Cards use each target's own hero photograph rather than another placeholder
 * plate. The nine regional hubs are skipped: they already link to every child.
 *
 *   node tools/p3-6-related-destinations.mjs
 *
 * Idempotent: a page already carrying a data-p3-6 related section is skipped.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIR = path.join(ROOT, "src", "content-pages");

/** slug → display name, region label, region hub slug, hero image. */
const DEST = {
  alaska: ["Alaska", "North America", "north-america", "/assets/img/na-alaska-brown-bear-salmon.jpg"],
  antarctica: ["Antarctica", "Polar Regions", "polar-regions", "/assets/img/dh-01-antarctica-ice-cliffs.jpg"],
  bali: ["Bali", "Asia", "asia", "/assets/img/e-09-jungle-yoga-pavilion.jpg"],
  botswana: ["Botswana", "Africa", "africa", "/assets/img/e-11-elephant-herd-aerial.jpg"],
  "canadian-rockies": ["Canadian Rockies", "North America", "north-america", "/assets/img/na-canadian-rockies-glacial-lake.jpg"],
  egypt: ["Egypt", "Middle East", "middle-east", "/assets/img/dh-03-egypt-nile-dusk.jpg"],
  fiji: ["Fiji", "South Pacific", "south-pacific", "/assets/img/dh-04-fiji-lagoon-aerial.jpg"],
  france: ["France", "Europe", "europe", "/assets/img/dh-05-france-provence-dusk.jpg"],
  "french-polynesia": ["French Polynesia", "South Pacific", "south-pacific", "/assets/img/h-02-bora-bora-dawn.jpg"],
  galapagos: ["Gal&aacute;pagos", "South America", "south-america", "/assets/img/dh-06-galapagos-volcanic-coast.jpg"],
  greece: ["Greece", "Europe", "europe", "/assets/img/dh-07-greece-caldera-dusk.jpg"],
  hawaii: ["Hawaii", "North America", "north-america", "/assets/img/dh-08-hawaii-napali-coast.jpg"],
  iceland: ["Iceland", "Polar Regions", "polar-regions", "/assets/img/dh-09-iceland-glacial-lagoon.jpg"],
  italy: ["Italy", "Europe", "europe", "/assets/img/h-04-amalfi-golden-hour.jpg"],
  japan: ["Japan", "Asia", "asia", "/assets/img/dh-10-japan-kyoto-dawn.jpg"],
  jordan: ["Jordan", "Middle East", "middle-east", "/assets/img/x-03-petra-treasury.jpg"],
  "kenya-tanzania": ["Kenya &amp; Tanzania", "Africa", "africa", "/assets/img/x-01-serengeti-elephants.jpg"],
  maldives: ["The Maldives", "Asia", "asia", "/assets/img/h-01-maldives-aerial.jpg"],
  "napa-sonoma": ["Napa &amp; Sonoma", "North America", "north-america", "/assets/img/na-napa-sonoma-cellar-tasting.jpg"],
  "new-orleans": ["New Orleans", "North America", "north-america", "/assets/img/dh-12-new-orleans-quarter-dusk.jpg"],
  "new-york": ["New York", "North America", "north-america", "/assets/img/dh-13-new-york-skyline-dusk.jpg"],
  "new-zealand": ["New Zealand", "South Pacific", "south-pacific", "/assets/img/dh-14-new-zealand-fiord-dawn.jpg"],
  oman: ["Oman", "Middle East", "middle-east", "/assets/img/dh-16-oman-wadi-fort.jpg"],
  patagonia: ["Patagonia", "South America", "south-america", "/assets/img/e-12-patagonia-trek.jpg"],
  peru: ["Peru", "South America", "south-america", "/assets/img/dh-17-peru-machu-picchu-dawn.jpg"],
  portugal: ["Portugal", "Europe", "europe", "/assets/img/dh-19-portugal-douro-valley.jpg"],
  "riviera-maya-los-cabos": ["Riviera Maya &amp; Los Cabos", "Caribbean &amp; Mexico", "caribbean-mexico", "/assets/img/dh-20-riviera-maya-coast.jpg"],
  rwanda: ["Rwanda", "Africa", "africa", "/assets/img/dh-21-rwanda-volcano-hills.jpg"],
  spain: ["Spain", "Europe", "europe", "/assets/img/dh-23-spain-andalusia-dusk.jpg"],
  "st-barths": ["St. Barth's", "Caribbean &amp; Mexico", "caribbean-mexico", "/assets/img/d-06-st-barts-harbour.jpg"],
  thailand: ["Thailand", "Asia", "asia", "/assets/img/dh-24-thailand-limestone-bay.jpg"],
  "turks-caicos": ["Turks &amp; Caicos", "Caribbean &amp; Mexico", "caribbean-mexico", "/assets/img/d-02-grace-bay.jpg"],
  "uk-ireland": ["UK &amp; Ireland", "Europe", "europe", "/assets/img/dh-25-uk-ireland-highland-loch.jpg"],
};

/** slug → the three destinations a reader on this page is genuinely deciding between. */
const RELATED = {
  alaska: ["canadian-rockies", "patagonia", "iceland"],
  antarctica: ["iceland", "patagonia", "galapagos"],
  bali: ["thailand", "maldives", "japan"],
  botswana: ["kenya-tanzania", "rwanda", "galapagos"],
  "canadian-rockies": ["alaska", "patagonia", "new-zealand"],
  egypt: ["jordan", "oman", "peru"],
  fiji: ["french-polynesia", "maldives", "turks-caicos"],
  france: ["italy", "spain", "portugal"],
  "french-polynesia": ["maldives", "fiji", "turks-caicos"],
  galapagos: ["peru", "patagonia", "antarctica"],
  greece: ["italy", "spain", "portugal"],
  hawaii: ["french-polynesia", "fiji", "riviera-maya-los-cabos"],
  iceland: ["antarctica", "alaska", "new-zealand"],
  italy: ["greece", "france", "spain"],
  japan: ["thailand", "bali", "italy"],
  jordan: ["egypt", "oman", "peru"],
  "kenya-tanzania": ["botswana", "rwanda", "galapagos"],
  maldives: ["french-polynesia", "fiji", "turks-caicos"],
  "napa-sonoma": ["new-orleans", "portugal", "france"],
  "new-orleans": ["new-york", "napa-sonoma", "hawaii"],
  "new-york": ["new-orleans", "uk-ireland", "france"],
  "new-zealand": ["patagonia", "iceland", "canadian-rockies"],
  oman: ["jordan", "egypt", "maldives"],
  patagonia: ["new-zealand", "alaska", "antarctica"],
  peru: ["galapagos", "patagonia", "egypt"],
  portugal: ["spain", "greece", "italy"],
  "riviera-maya-los-cabos": ["turks-caicos", "st-barths", "hawaii"],
  rwanda: ["botswana", "kenya-tanzania", "galapagos"],
  spain: ["portugal", "france", "italy"],
  "st-barths": ["turks-caicos", "riviera-maya-los-cabos", "french-polynesia"],
  thailand: ["bali", "maldives", "japan"],
  "turks-caicos": ["st-barths", "riviera-maya-los-cabos", "maldives"],
  "uk-ireland": ["france", "iceland", "new-york"],
};

const H2 = `font-family:var(--font-d);font-size:clamp(20px,2.5vw,28px);font-weight:700;letter-spacing:-.02em;color:var(--text-primary)`;
const FAQ_OPEN = '<section class="page-faq">';

/* Cards use the rc-* crops, not the full heroes. DEST above stays the single
   source of truth for which hero belongs to which destination; the crop name
   derives from it, so the two cannot drift. Dimensions match
   tools/make-related-card-crops.mjs and are emitted as intrinsic width/height
   because the verifier's img-attrs check requires them. */
const CROP_W = 760;
const CROP_H = 435;
const cardCrop = (heroPath) =>
  heroPath.replace(/([^/]+)\.(jpe?g|png|webp)$/i, "rc-$1.jpg");

/* Photographs here are decorative: the card's accessible name already comes
   from .related-card__region and .related-card__name, so descriptive alt text
   would only repeat the destination — which CONTENT-STANDARDS § 8 rules out
   directly. § 8 says decorative images take alt="" plus aria-hidden="true". */

let changed = 0;

for (const [slug, siblings] of Object.entries(RELATED)) {
  const file = path.join(DIR, `destinations__${slug}.html`);
  let html = await readFile(file, "utf8");

  const [, hubLabel, hubSlug] = DEST[slug];

  const cards = siblings.map((s) => {
    const [name, region, , img] = DEST[s];
    return (
      `    <a href="/destinations/${s}/" class="related-card">\n` +
      `      <img class="related-card__img" src="${cardCrop(img)}" alt="" aria-hidden="true"\n` +
      `           width="${CROP_W}" height="${CROP_H}" loading="lazy" decoding="async">\n` +
      `      <div class="related-card__overlay"></div>\n` +
      `      <div class="related-card__body">\n` +
      `        <div class="related-card__region">${region}</div>\n` +
      `        <div class="related-card__name">${name}</div>\n` +
      `      </div>\n` +
      `    </a>\n`
    );
  }).join("");

  const block =
    `<!-- ══ RELATED DESTINATIONS (P3-6) ══ -->\n` +
    `<section class="related-section" data-p3-6>\n` +
    `  <div style="margin-bottom:36px">\n` +
    `    <div class="label" style="margin-bottom:10px">You Might Also Consider</div>\n` +
    `    <h2 style="${H2}">Destinations Worth Comparing</h2>\n` +
    `  </div>\n` +
    `  <div class="related-grid">\n${cards}  </div>\n` +
    `  <div class="related-more">\n` +
    `    <span class="related-more__label">Every destination in the region:</span>\n` +
    `    <a href="/destinations/${hubSlug}/" class="related-more__link">All ${hubLabel} Destinations</a>\n` +
    `  </div>\n` +
    `</section>\n\n`;

  /* Rewrite in place if a block is already there, rather than skipping.
     Two cases both land here: the original hand-written /maldives/ block
     (whose three cards pointed at /destinations/ and named two places with no
     page), and any earlier run of this script. Regenerating has to be able to
     change what it already wrote — the switch from CSS background-images to
     lazy <img> crops was exactly that, and a skip-if-present guard would have
     silently no-opped the whole fix. */
  const existing = html.match(
    /<!-- ══ RELATED DESTINATIONS[^>]*══ -->\s*<section class="related-section"[^>]*>[\s\S]*?<\/section>\s*/
  );
  if (existing) {
    html = html.replace(existing[0], block);
  } else {
    if (!html.includes(FAQ_OPEN)) throw new Error(`${slug}: no page-faq to insert before`);
    html = html.replace(FAQ_OPEN, block + FAQ_OPEN);
  }

  await writeFile(file, html, "utf8");
  changed++;
  console.log(`  ok    ${slug}${existing ? " (rewrote in place)" : ""}`);
}

console.log(`\n${changed} destination pages given a related-destinations block and a hub link.`);
