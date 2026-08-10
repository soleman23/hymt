/**
 * P3-2, the hand-rewrite half (follow-up to #28) — the 36 FAQ answers whose
 * first sentence buried the answer past word 25 and could NOT be split
 * mechanically. The em-dash splitter (p3-2-faq-first-sentence.mjs) handled 50
 * answers without touching a word; these are the ones where the opening
 * sentence had to be rewritten by a person.
 *
 * Rules the rewrites follow, and the script enforces where it can:
 *   - The new opening sentence is a complete answer in ≤25 words
 *     (CONTENT-STANDARDS § 3.3, "non-negotiable"). Validated below; the run
 *     refuses to write if any lead is over.
 *   - No fact is dropped and none is invented. Facts squeezed out of the
 *     opening sentence move into a carry sentence directly after it; the rest
 *     of the original answer is untouched.
 *   - Verdict first, qualifiers second. "Chile, if forced to choose" — not a
 *     33-word tour of the considerations before the answer appears.
 *
 * Each entry: content-page stem, a substring that uniquely identifies the
 * question, and the replacement for the ORIGINAL FIRST SENTENCE only. The
 * script locates the answer by its question, cuts the raw first sentence at
 * its terminator (decimal points like "2.5 hours" are safe — the boundary
 * requires whitespace after the mark), and splices. Idempotent by
 * construction: after a successful run the question's first sentence is ≤25
 * words, so the entry no longer matches the over-25 precondition and is
 * reported as already done.
 *
 *   node tools/p3-2-faq-rewrites.mjs           # preview
 *   node tools/p3-2-faq-rewrites.mjs --apply
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIR = path.join(ROOT, "src", "content-pages");
const APPLY = process.argv.includes("--apply");

/** [stem, question substring, replacement for the original first sentence] */
const REWRITES = [
  ["destinations__africa", "first-time safari traveler",
    `South Africa is the most accessible first safari. Strong infrastructure, no malaria in the Kruger private reserves, year-round big five viewing, and excellent luxury camps at a higher quality-to-cost ratio.`],

  ["destinations__alaska", "Cruise ship vs small ship",
    `Big ship for coverage and cost, small ship for engagement, wilderness lodge for depth — the format decides the trip. Cruise ship: the most convenient and most comprehensive coverage of the Inside Passage at the lowest per-night cost, with the trade-off of large crowds, fixed schedules, and Alaska experienced from a distance.`],

  ["destinations__canadian-rockies", "When do the lakes thaw",
    `Moraine Lake and the high lakes typically thaw in early to mid-June. The famous turquoise color peaks as glacial melt feeds them through July and August.`],

  ["destinations__europe", "know most deeply",
    `Italy, France, Spain, Portugal, Greece, and the UK and Ireland are the six I know best. Within them: Rome, Florence, Tuscany, the Amalfi Coast and the Dolomites; Paris, Provence, Burgundy and the Riviera; Barcelona, Andalucía and the Basque Country; Lisbon and the Douro Valley; Athens, Santorini and the Peloponnese.`],

  ["destinations__fiji", "compare to French Polynesia",
    `Fiji wins on culture, diving, resort variety and price; French Polynesia wins on the iconic lagoon and the top-end overwater villas. The Fijian village culture is more accessible to visitors than its French Polynesian equivalent, the soft coral of the Bligh Waters is genuinely a different category of diving, and Fiji carries more private-island resort variety at notably lower price points across most categories.`],

  ["destinations__france", "worst time to visit Paris",
    `August, for a paradoxical reason: it is the month Paris itself goes on vacation. Many of the city's best restaurants, bakeries, and small shops close for two to four weeks.`],

  ["destinations__french-polynesia", "flight to French Polynesia",
    `Direct flights to Papeete (PPT) operate from Los Angeles, Honolulu, Paris, Tokyo, Auckland, and a handful of other gateways. Los Angeles is 8 hours (daily), Honolulu 5.5, Tokyo 10, Auckland 5, and Paris 22 via West Africa.`],

  ["destinations__french-polynesia", "compare to the Maldives",
    `French Polynesia is the dramatic one, the Maldives the pristine one — topography and culture against water clarity and intimacy. French Polynesia has the volcanic peaks of Mount Otemanu and Mou'aroa visible from the lagoons, generally larger and more architecturally varied resorts, the Polynesian cultural overlay, and the option to add Tuamotu diving or a Marquesas cruise for a multi-region trip.`],

  ["destinations__galapagos", "Liveaboard versus land-based",
    `Liveaboard, if wildlife is the primary motivation — it is the only way to reach the islands where the endemic species genuinely differ. That means the western islands (Fernandina, Isabela's pristine northern coast) and the remote northern outliers like Genovesa.`],

  ["destinations__italy", "Rome versus Florence",
    `Neither wins: give Rome three nights, Tuscany three, Florence two, and the remaining time to the coast or south. Within the Tuscany block, spend one or two of those nights in a Val d'Orcia agriturismo.`],

  ["destinations__italy", "solo travelers",
    `Excellent, with one important planning note about restaurants. Italy's restaurant culture is designed for groups and families, and solo diners occasionally encounter staffing that allocates them to the worst table in the room with minimal service attention.`],

  ["destinations__japan", "What is a ryokan",
    `A ryokan is a traditional Japanese inn: tatami rooms, futon bedding, yukata robes, multi-course kaiseki dinners, and onsen (hot spring) bathing. The baths may be shared or private.`],

  ["destinations__japan", "Tokyo come first or last",
    `Tokyo first is the more common routing, and the practical one. It has the direct Narita Express connection and acclimatizes you before the more culturally demanding Kyoto experience.`],

  ["destinations__japan", "How many cities",
    `Three cities in twelve days is the sweet spot. Tokyo four nights, Kyoto four, Osaka two, with a Hiroshima day trip added from Osaka or Kyoto.`],

  ["destinations__japan", "cherry blossom season",
    `Twelve months ahead for the best ryokan. Nine months for quality hotels in Tokyo and Kyoto; six months is the absolute minimum for anything that doesn't involve two-star business hotels.`],

  ["destinations__jordan", "dress code",
    `There is no formal dress code, but modest dress — shoulders and knees covered — is appropriate throughout. Jordan is one of the more relaxed countries in the region for dress expectations.`],

  ["destinations__jordan", "overnight in Wadi Rum",
    `Stay the night — the day trip is fine, but the overnight is the point. A day trip from Petra produces a 4WD tour of the valley floor and a late return, which is a fine experience.`],

  ["destinations__jordan", "best time for Petra",
    `March and April — the spring wildflower season — produce the finest conditions at Petra. Comfortable temperatures, green hillsides above the Treasury, and the afternoon light on the rose-red sandstone at its most photogenic.`],

  ["destinations__maldives", "choose between Maldives resorts",
    `Five variables decide it: transfer, reef quality, food, villa configuration, and service culture. Location relative to Male international airport matters because some resorts are 30 minutes by speedboat while others need a 40-minute seaplane; reef quality decides the snorkeling and diving.`],

  ["destinations__new-york", "day trips from New York",
    `Hudson Valley by Metro-North is the most accessible and most rewarding single day out. Cold Spring is 90 minutes: Storm King Art Center in the afternoon, lunch on the main street, the Hudson River view from the waterfront.`],

  ["destinations__north-america", "Pacific Coast",
    `Drive the Pacific Coast Highway — it is one of the world's great road journeys. The classic run goes from San Francisco south through Big Sur, Carmel-by-the-Sea, and Santa Barbara to Los Angeles.`],

  ["destinations__oman", "Musandam trip from Dubai",
    `By road it is approximately 2.5 hours from Dubai to Khasab, via the UAE-Oman border crossing at Tibat. The catch is paperwork: that route requires the correct visa configuration for re-entering Oman from the UAE.`],

  ["destinations__patagonia", "Chilean versus Argentine",
    `Chile, if forced to choose one — Torres del Paine is the most iconic Patagonia landscape and what most travelers fly south for.`],

  ["destinations__peru", "Inca Trail vs train",
    `The Inca Trail earns Machu Picchu; the train simply reaches it — which is better is a fitness and time question. The trail is a four-day hiking route through cloud forest and mountain passes, arriving through the Sun Gate at dawn on day four: the most dramatically earned entrance to the site.`],

  ["destinations__polar-regions", "physically demanding",
    `Moderate: if you can climb in and out of a small boat and walk on uneven ground, you can do it. The main expedition activity — Zodiac landing operations — means stepping in and out of small inflatable boats onto rocky beaches or ice, sometimes in rough water.`],

  ["destinations__polar-regions", "choose an expedition cruise ship",
    `Four variables decide it: ship size, expedition team quality, Zodiac-to-passenger ratio, and onboard facilities. Under 150 passengers allows landings at more sites and a more intimate experience, and the team is the guides, ornithologists, geologists and lecturers aboard.`],

  ["destinations__south-america", "Machu Picchu without crowds",
    `Arrive on the first bus, which means sleeping in Aguas Calientes the night before rather than day-tripping from Cusco. That puts you inside the site before the main crowds.`],

  ["experiences__adventure-active-travel", "structure of an adventure day",
    `One major activity per day, with evenings reserved for rest, meals, and the next day's briefing. A full-day trek, a guided dive, a long-distance cycle — well-structured itineraries build around a single anchor rather than stacking them.`],

  ["experiences__all-inclusive-vacations", "Who should consider",
    `Couples who want a trip free of constant billing decisions, families who want simplified budgeting, and travelers planning to stay mostly on-property.`],

  ["experiences__all-inclusive-vacations", "club-level and standard",
    `Club level adds a dedicated concierge, private dining areas, premium room categories, and reserved beach or pool sections. The tier goes by names like Butler Service or Diamond Club depending on the brand.`],

  ["experiences__beach-island-escapes", "look for in a luxury beach resort",
    `Service culture, food quality, real beach crowding, and whether the property delivers what its marketing promises. Those are the variables that separate good resorts from great ones once the obvious — beach quality, water clarity, room category — checks out.`],

  ["experiences__beach-island-escapes", "house reef",
    `A house reef puts marine life within swimming distance of your room, no boat required. It is a coral reef directly accessible by swimming or snorkeling from the beach, and one of the most valuable features for guests who want marine-life access.`],

  ["experiences__culture-immersive-travel", "private guide worth",
    `Pace, depth, access and expertise — a private guide adjusts all four to you. They move at your pace, adjust depth to your interests, access areas closed to group tours, and bring decades of specialist knowledge to every site.`],

  ["experiences__family-travel", "pack that most people forget",
    `Medications, reef-safe sunscreen, digital passport copies, and knowledge of the local hospital — the four things families most often forget. That means a basic first-aid kit and portable medications, sunscreen for beach destinations, digital copies of each child's passport and medical information, and an understanding of the hospital situation where you are going.`],

  ["experiences__food-wine-travel", "wine regions do you specialize",
    `Napa and Sonoma, Willamette, Burgundy and Champagne, Tuscany and Piedmont, and Rioja — the regions I plan most frequently. That is California, Oregon, France, Italy and Spain respectively.`],

  ["experiences__multigenerational-travel", "generations have very different interests",
    `Pick a property with enough variety that each generation gets something real, then anchor each day with one or two shared experiences.`],
];

const wc = (s) => s.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
const firstSentence = (t) => {
  const guard = t.replace(/\b(St|Mt|Dr|Mr|Ms|No|vs|approx)\./gi, (m) => m.replace(".", " "));
  const m = guard.match(/^[\s\S]*?[.!?](?=\s|<|$)/);
  return (m ? m[0] : guard).replace(/ /g, ".");
};

/* ── validate every lead before touching anything ── */
const problems = [];
for (const [stem, key, repl] of REWRITES) {
  const lead = firstSentence(repl);
  const n = wc(lead);
  if (n > 25) problems.push(`${stem} · "${key}": lead is ${n} words — ${lead}`);
}
if (problems.length) {
  console.error("Leads out of spec — nothing written:\n  " + problems.join("\n  "));
  process.exit(1);
}

let applied = 0, already = 0;
const failures = [];

for (const [stem, key, repl] of REWRITES) {
  const file = path.join(DIR, `${stem}.html`);
  let html = await readFile(file, "utf8");

  // Locate the question, then its answer block.
  const qRe = new RegExp(`class="pf-q__text">[^<]*${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^<]*<[\\s\\S]*?class="pf-a"[^>]*>`, "g");
  const matches = [...html.matchAll(qRe)];
  if (matches.length !== 1) {
    failures.push(`${stem} · "${key}": ${matches.length} matches`);
    continue;
  }
  const start = matches[0].index + matches[0][0].length;
  const rest = html.slice(start);
  const lead = rest.match(/^\s*/)[0];
  const raw = rest.slice(lead.length);
  const sent = firstSentence(raw);

  if (wc(sent) <= 25) { already++; continue; }

  if (APPLY) {
    html = html.slice(0, start) + lead + repl + raw.slice(sent.length);
    await writeFile(file, html, "utf8");
  }
  applied++;
  console.log(`  ${APPLY ? "ok    " : "would "}${stem} · ${key}`);
}

console.log(`\n${APPLY ? "rewrote" : "would rewrite"} ${applied} · already in spec ${already} · failed to locate ${failures.length}`);
for (const f of failures) console.log(`  ! ${f}`);
if (!APPLY) console.log("Preview only — re-run with --apply.");
if (failures.length) process.exit(1);
