/**
 * Portrait crops for the editorial intro panel (`.intro-image--photo`).
 *
 * `.intro-section` is a `1fr 1fr` grid, so the panel is exactly half the
 * section and its height is set by the copy column beside it. Measured across
 * the nine regional hubs at a 1280px viewport it lands at 633x1096-1153 —
 * a ratio of 0.55-0.59 every time, never landscape. That is why the one
 * hand-made asset for this slot, np-na-intro-napa-valley-california.jpg, is
 * 900x1520 (0.592): `object-fit:cover` handles the per-page wobble, but the
 * source has to be portrait or the panel eats two thirds of the frame.
 *
 * The library is 690 landscape files to 25 portrait ones, so every subject
 * here except the two Tuscany/sandbar-shaped `e-` frames arrives at 16:9 and
 * has to lose ~67% of its width. `position:"attention"` picks which 67%,
 * the same way dc-/rc-/og- do.
 *
 * Quality is 80, not the house 72 the card families share. Those all sit
 * under a linear-gradient scrim with text on top; this panel is a clean
 * photograph at 633 CSS px, four times a place card, and these subjects are
 * mostly sky, water and haze — exactly what mozjpeg at 72 bands.
 *
 * Writes the crop, its base64 twin in images-b64/, and the MANIFEST entry —
 * public/assets/img/ is gitignored, so an image that skips the base64 step
 * survives locally and vanishes for everyone else.
 *
 *   node tools/make-intro-crops.mjs
 *
 * Idempotent: a crop that already exists and is newer than its source is left
 * alone. Pass --force to rebuild every one.
 */
import { readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const IMG = path.join(ROOT, "public", "assets", "img");
const MASTERS = path.join(ROOT, "tools", "hero-masters");
const B64 = path.join(ROOT, "images-b64");
const MANIFEST = path.join(B64, "MANIFEST.json");
const FORCE = process.argv.includes("--force");

const WIDTH = 900;
const HEIGHT = 1520;
const QUALITY = 80;

/* One entry per page whose intro panel showed the placeholder plate. The
   page each row serves is in the trailing comment; the page->source pairing
   itself lives in the markup, not here.

   `master:true` reads tools/hero-masters/<name>.png instead of the 1600px
   delivery copy — worth it where it exists, because a 0.59 crop of a
   1600x900 keeps only 532px of width and this panel is 633 CSS px wide.
   Only 9 of the 77 subjects have a master; the rest are upscaled ~1.7x and
   are the soft ones. Portrait sources (the `e-` frames at 1024x1405 and the
   `na-itin-` frames at 941x1672) need almost no upscale and are the best of
   what the library holds. */
const SOURCES = [
  /* The nine regional hubs. */
  { src: "kenya-tanzania-masai-mara-conservancies.jpg" },                  // africa
  { src: "japan-kyoto.png", master: true },                                // asia
  { src: "e-62-providenciales-pool-edge.jpg" },                            // caribbean-mexico
  { src: "e-17-tuscan-wine-tasting.jpg" },                                 // europe
  { src: "jordan-petra.jpg" },                                             // middle-east
  { src: "antarctica-the-antarctic-peninsula.jpg" },                       // polar-regions
  { src: "patagonia-torres-del-paine.jpg" },                               // south-america
  { src: "french-polynesia-bora-bora.png", master: true },                 // south-pacific

  /* Sub-destinations and the experience pages. 25 of these reuse a frame
     that also appears as a place card further down the same page — never the
     hero. The library has no second frame of those subjects at all, and a
     385x220 tile beside a 633px portrait panel reads as two photographs of
     one place, which is what the caption promises anyway. */
  { src: "na-itin-katmai-kenai-alaska.jpg" },                             // alaska
  { src: "x-06-polar-iceberg-twilight.jpg" },                             // antarctica
  { src: "dh-18-polar-arctic-twilight.png", master: true },               // arctic-norway
  { src: "dh-22-south-america-andes-lake.png", master: true },            // argentina
  { src: "aspen-aspen-highlands.jpg" },                                   // aspen
  { src: "australia-uluru-and-the-red-centre.jpg" },                      // australia
  { src: "x-02-bali-rice-terraces.jpg" },                                 // bali
  { src: "e-44-pitons-from-the-water.jpg" },                              // barbados-eastern-caribbean
  { src: "antarctica-south-georgia-and-the-falklands.jpg" },              // falklands-south-georgia
  { src: "bhutan-paro-valley.jpg" },                                      // bhutan
  { src: "e-33-okavango-channel-golden.jpg" },                            // botswana
  { src: "brazil-rio-de-janeiro.jpg" },                                   // brazil
  { src: "na-itin-banff-jasper-canadian-rockies.jpg" },                   // canadian-rockies
  { src: "colombia-cartagena.jpg" },                                      // colombia
  { src: "cook-islands-aitutaki-lagoon.jpg" },                            // cook-islands
  { src: "e-56-pacuare-river-valley.jpg" },                               // costa-rica
  { src: "e-59-punta-cana-palm-colonnade.jpg" },                          // dominican-republic
  { src: "egypt-pyramids-of-giza-and-sphinx.jpg" },                       // egypt
  { src: "fiji-yasawa-islands.jpg" },                                     // fiji
  { src: "france-provence.png", master: true },                           // france
  { src: "e-43-bora-bora-palm-frame.jpg" },                               // french-polynesia
  { src: "south-america-galapagos-and-ecuador.jpg" },                     // galapagos
  { src: "georgia-armenia-kazbegi.jpg" },                                 // georgia-armenia
  { src: "e-61-crete-olive-terrace.jpg" },                                // greece
  { src: "greenland-ilulissat.jpg" },                                     // greenland
  { src: "hawaii-kauai.jpg" },                                            // hawaii
  { src: "e-54-vatnajokull-crevasse.jpg" },                               // iceland
  { src: "india-agra.jpg" },                                              // india
  { src: "israel-jerusalem.jpg" },                                        // israel
  { src: "europe-italy.jpg" },                                            // italy
  { src: "e-58-negril-beach-curve.jpg" },                                 // jamaica
  { src: "e-47-onsen-first-light.jpg" },                                  // japan
  { src: "jordan-wadi-rum.jpg" },                                         // jordan
  { src: "e-35-ngorongoro-crater-floor.jpg" },                            // kenya-tanzania
  { src: "jh-13-medina-alley-light.png", master: true },                  // morocco
  { src: "na-itin-harvest-season-napa-valley.jpg" },                      // food-wine-travel
  { src: "na-itin-french-quarter-new-orleans.jpg" },                      // new-orleans
  { src: "new-york-manhattan-neighborhoods.jpg" },                        // new-york
  { src: "e-53-fiordland-valley-falls.jpg" },                             // new-zealand
  { src: "dh-11-middle-east-dunes.png", master: true },                   // oman
  { src: "e-51-w-trek-trail.jpg" },                                       // patagonia
  { src: "e-52-inca-stairway-cloud.jpg" },                                // peru
  { src: "e-50-alentejo-cork-retreat.jpg" },                              // portugal
  { src: "e-48-cenote-light-shaft.jpg" },                                 // riviera-maya-los-cabos
  { src: "e-37-virunga-bamboo-light.jpg" },                               // rwanda
  { src: "e-41-la-digue-granite.jpg" },                                   // seychelles
  { src: "e-36-sabi-sand-leadwood.jpg" },                                 // south-africa
  { src: "spain-basque-country.jpg" },                                         // spain
  { src: "sri-lanka-sigiriya-and-dambulla.jpg" },                         // sri-lanka
  { src: "e-42-st-barths-bay-clifftop.jpg" },                             // st-barths
  { src: "svalbard-alkefjellet-and-hinlopen.jpg" },                       // svalbard
  { src: "thailand-bangkok.jpg" },                                        // thailand
  { src: "e-40-grace-bay-waterline.jpg" },                                // turks-caicos
  { src: "uae-gulf-abu-dhabi.jpg" },                                      // uae-gulf
  { src: "uk-ireland-the-highlands-and-skye.jpg" },                       // uk-ireland
  { src: "vanuatu-tanna.jpg" },                                           // vanuatu
  { src: "vietnam-southeast-asia-ha-long-and-lan-ha-bay.jpg" },           // vietnam-southeast-asia
  { src: "zambia-victoria-falls-victoria-falls-and-livingstone.jpg" },    // zambia-victoria-falls
  { src: "e-19-secret-sea-cave.jpg" },                                    // adventure-active-travel
  { src: "e-03-grand-resort-dusk.jpg" },                                  // all-inclusive-vacations
  { src: "e-01-private-sandbar.jpg" },                                    // beach-island-escapes
  { src: "e-07-yacht-cove.jpg" },                                         // cruises
  { src: "jh-09-hill-village-lane.png", master: true },                   // culture-immersive-travel
  { src: "e-15-children-shallow-water.jpg" },                             // family-travel
  { src: "x-04-napa-vineyard-dining.jpg" },                               // napa-sonoma
  { src: "sp-family-amalfi.jpg" },                                        // multigenerational-travel
  { src: "e-13-champagne-overwater-deck.jpg" },                           // romance-celebration-travel
  { src: "jh-03-moremi-delta-channel.png", master: true },                // safari-wildlife-travel
  { src: "e-09-jungle-yoga-pavilion.jpg" },                               // wellness-retreat-travel
  { src: "e-39-maldives-atoll-overhead.jpg" },                            // maldives (.dest-intro)
  { src: "e-25-pebble-beach-sunset.jpg" },                                // sports-event-travel
];

const cropName = (src) => "np-" + src.replace(/\.(jpe?g|png|webp)$/i, "") + ".jpg";

const manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
const byTarget = new Map(manifest.map((m) => [m.target, m]));

let built = 0, skipped = 0;

for (const { src, master } of SOURCES) {
  const srcPath = path.join(master ? MASTERS : IMG, src);
  const out = cropName(src);
  const outPath = path.join(IMG, out);

  const srcStat = await stat(srcPath);
  const fresh = await stat(outPath).then((s) => s.mtimeMs > srcStat.mtimeMs, () => false);
  if (fresh && !FORCE) { skipped++; continue; }

  const meta = await sharp(srcPath).metadata();
  await sharp(srcPath)
    .resize(WIDTH, HEIGHT, { fit: "cover", position: "attention" })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(outPath);

  const buf = await readFile(outPath);
  await writeFile(path.join(B64, `assets__img__${out}.b64`), buf.toString("base64"), "utf8");

  /* Same key order and the same `bytes` field the existing entries use. */
  const target = `public/assets/img/${out}`;
  const entry = byTarget.get(target);
  if (entry) {
    entry.bytes = buf.length;
  } else {
    const added = { b64: `images-b64/assets__img__${out}.b64`, target, bytes: buf.length };
    manifest.push(added);
    byTarget.set(target, added);
  }
  built++;
  const native = Math.round(meta.height * (WIDTH / HEIGHT));
  console.log(
    `  ${out}  ${(buf.length / 1024).toFixed(0)} KB` +
    `  (${meta.width}x${meta.height} -> ${native}px of width kept` +
    `${native < WIDTH ? `, upscaled ${(WIDTH / native).toFixed(2)}x` : ""})`
  );
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 1) + "\n", "utf8");

console.log(`\nbuilt ${built}, skipped ${skipped} (already fresh)`);
console.log(`MANIFEST.json now has ${manifest.length} entries`);
