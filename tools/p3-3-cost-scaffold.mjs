/**
 * P3-3 + P3-5 (issue #29) — cost-range scaffolding and the figures worksheet.
 *
 * The site is priced entirely in adjectives. Nothing on it says what anything
 * costs, which is the norm in luxury travel and exactly why publishing honest
 * ranges is the strongest AI-citation asset available here: cost questions are
 * high-volume, poorly served, and almost never answered by operators.
 *
 * This is the SCAFFOLDING pass. Not one number is invented. Every page gets
 * the full block structure required by SEO-AIO-PLAN § P3-3 — per-person
 * per-day range, what is in and out, the two or three things that move it, a
 * dated "as of" line — with every figure as a NEEDS FIGURE marker, and the
 * whole <section> wrapped in an HTML comment so nothing renders until Mark's
 * verified numbers arrive. A costs section with no cost in it is worse than no
 * section, and this repo already uses exactly this pattern for the 53 removed
 * testimonial slots.
 *
 * The block cannot contain a nested "<!--", so the markers inside it are plain
 * NEEDS FIGURE text rather than comments of their own.
 *
 * Also writes docs/seo/figures-worksheet.md: one row per page for Mark, plus
 * the P3-5 citation table naming the authority each factual claim should be
 * linked to.
 *
 *   node tools/p3-3-cost-scaffold.mjs
 *
 * Idempotent: a page already carrying the block is skipped.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIR = path.join(ROOT, "src", "content-pages");
const WORKSHEET = path.join(ROOT, "docs", "seo", "figures-worksheet.md");

/* stem → [display name, pricing basis, authority for P3-5 citations] */
const PAGES = {
  // ── regional hubs ──
  "destinations__africa": ["Africa", "per person, per night, all-inclusive at camp", "Country park authorities; Botswana DWNP, Kenya Wildlife Service, TANAPA"],
  "destinations__asia": ["Asia", "per person, per day, land only", "National tourism boards (JNTO, TAT, Indonesia MoT)"],
  "destinations__caribbean-mexico": ["the Caribbean &amp; Mexico", "per person, per night", "National tourism boards; NOAA for hurricane season dates"],
  "destinations__europe": ["Europe", "per person, per day, land only", "National tourism boards; individual museum and site operators"],
  "destinations__middle-east": ["the Middle East", "per person, per day, land only", "National tourism boards; UK FCDO / US State Dept for entry rules"],
  "destinations__north-america": ["North America", "per person, per day, land only", "US National Park Service; Parks Canada"],
  "destinations__polar-regions": ["polar travel", "per person, per voyage", "IAATO (Antarctic operators); AECO (Arctic operators)"],
  "destinations__south-america": ["South America", "per person, per day, land only", "National park authorities; CONAF (Chile), SERNANP (Peru)"],
  "destinations__south-pacific": ["the South Pacific", "per person, per night", "National tourism boards; NZ Dept of Conservation"],

  // ── destinations ──
  "destinations__alaska": ["Alaska", "per person, per day, land only", "US National Park Service (Denali, Katmai)"],
  "destinations__antarctica": ["Antarctica", "per person, per voyage", "IAATO"],
  "destinations__bali": ["Bali", "per person, per night", "Indonesia Ministry of Tourism; Bali tourist levy"],
  "destinations__botswana": ["Botswana", "per person, per night, all-inclusive at camp", "Botswana Dept of Wildlife &amp; National Parks (park fees, concession rates)"],
  "destinations__canadian-rockies": ["the Canadian Rockies", "per person, per day, land only", "Parks Canada (park pass, Moraine Lake shuttle)"],
  "destinations__egypt": ["Egypt", "per person, per day, land only", "Egyptian Ministry of Tourism and Antiquities (site tickets)"],
  "destinations__fiji": ["Fiji", "per person, per night", "Tourism Fiji; Fiji Revenue &amp; Customs (departure tax)"],
  "destinations__france": ["France", "per person, per day, land only", "Atout France; individual museum operators (Louvre, Orsay)"],
  "destinations__french-polynesia": ["French Polynesia", "per person, per night", "Tahiti Tourisme"],
  "destinations__galapagos": ["the Galápagos", "per person, per voyage", "Galápagos National Park Directorate (entry fee, INGALA card)"],
  "destinations__greece": ["Greece", "per person, per day, land only", "Greek Ministry of Culture (Acropolis and site tickets)"],
  "destinations__hawaii": ["Hawaii", "per person, per day, land only", "US National Park Service (Haleakalā reservations, Hawaiʻi Volcanoes)"],
  "destinations__iceland": ["Iceland", "per person, per day, land only", "Vatnajökull National Park; Icelandic Met Office (aurora forecast)"],
  "destinations__italy": ["Italy", "per person, per day, land only", "Vatican Museums; Italian Ministry of Culture (site tickets)"],
  "destinations__japan": ["Japan", "per person, per day, land only", "JNTO; JR Group (rail pass pricing)"],
  "destinations__jordan": ["Jordan", "per person, per day, land only", "Petra Development &amp; Tourism Region Authority; Jordan Pass"],
  "destinations__kenya-tanzania": ["Kenya &amp; Tanzania", "per person, per night, all-inclusive at camp", "Kenya Wildlife Service; TANAPA (park and conservancy fees)"],
  "destinations__maldives": ["the Maldives", "per person, per night", "Maldives Inland Revenue Authority (green tax, TGST)"],
  "destinations__napa-sonoma": ["Napa &amp; Sonoma", "per person, per day, land only", "Individual winery tasting fees; Napa Valley Vintners"],
  "destinations__new-orleans": ["New Orleans", "per person, per day, land only", "New Orleans &amp; Company (festival dates)"],
  "destinations__new-york": ["New York", "per person, per day, land only", "NYC Tourism; individual museum operators"],
  "destinations__new-zealand": ["New Zealand", "per person, per day, land only", "NZ Dept of Conservation (Great Walks, Milford)"],
  "destinations__oman": ["Oman", "per person, per day, land only", "Oman Ministry of Heritage and Tourism (visa, permits)"],
  "destinations__patagonia": ["Patagonia", "per person, per day, land only", "CONAF (Torres del Paine); Argentina APN (Los Glaciares)"],
  "destinations__peru": ["Peru", "per person, per day, land only", "Peru Ministerio de Cultura (Machu Picchu tickets, Inca Trail permits)"],
  "destinations__portugal": ["Portugal", "per person, per day, land only", "Turismo de Portugal; individual quinta tasting fees"],
  "destinations__riviera-maya-los-cabos": ["Mexico's coasts", "per person, per night", "Mexico SECTUR; INAH (Mayan site tickets)"],
  "destinations__rwanda": ["Rwanda", "per person, per night, all-inclusive at lodge", "Rwanda Development Board (gorilla permit price and daily quota)"],
  "destinations__spain": ["Spain", "per person, per day, land only", "Turespaña; Patronato de la Alhambra (ticket release dates)"],
  "destinations__st-barths": ["St. Barth's", "per person, per night", "Comité Territorial de Tourisme de Saint-Barthélemy"],
  "destinations__thailand": ["Thailand", "per person, per day, land only", "Tourism Authority of Thailand; DNP (national park fees)"],
  "destinations__turks-caicos": ["Turks &amp; Caicos", "per person, per night", "Turks &amp; Caicos Tourist Board"],
  "destinations__uk-ireland": ["the UK &amp; Ireland", "per person, per day, land only", "VisitBritain; Fáilte Ireland; National Trust / OPW site fees"],

  // ── experiences ──
  "experiences__adventure-active-travel": ["an active trip", "per person, per day, land only", "Relevant park authorities per destination"],
  "experiences__all-inclusive-vacations": ["an all-inclusive trip", "per person, per night, all-inclusive", "Individual resort inclusion schedules"],
  "experiences__beach-island-escapes": ["a beach trip", "per person, per night", "National tourism boards per region"],
  "experiences__cruises": ["a cruise or expedition", "per person, per voyage", "IAATO / AECO for expedition; individual cruise lines"],
  "experiences__culture-immersive-travel": ["a culture-led trip", "per person, per day, land only", "Site and museum operators; national guide licensing bodies"],
  "experiences__family-travel": ["a family trip", "per person, per day, land only", "Camp and resort published minimum-age policies"],
  "experiences__food-wine-travel": ["a food and wine trip", "per person, per day, land only", "Individual winery and restaurant published rates"],
  "experiences__multigenerational-travel": ["a multigenerational trip", "per person, per day, land only", "Villa and property published group rates"],
  "experiences__romance-celebration-travel": ["a honeymoon or celebration trip", "per person, per night", "Individual property published rates"],
  "experiences__safari-wildlife-travel": ["a safari", "per person, per night, all-inclusive at camp", "Country park authorities; Botswana DWNP, KWS, TANAPA, RDB"],
  "experiences__sports-event-travel": ["an event trip", "per person, per trip", "Event operators (Masters, Churchill Downs, AELTC, F1)"],
  "experiences__wellness-retreat-travel": ["a wellness retreat", "per person, per night, programme inclusive", "Individual retreat published programme rates"],
};

const NF = "NEEDS FIGURE";

function block(name, basis) {
  return `<!-- ══ WHAT IT COSTS (P3-3) — NOT YET LIVE ══════════════════════════════
     The structure below is final. Every number is a ${NF} placeholder.

     To ship it: fill this page's row in docs/seo/figures-worksheet.md, then
     replace each ${NF} with the verified number, set the datetime and the
     visible month on the time element to the date it was verified, add the
     P3-5 source link named in the worksheet, and delete these comment
     markers so the section renders.

     Do NOT uncomment this with placeholders still in it. A costs section
     with no cost in it is worse than no section, and the build's
     placeholder-copy check will not catch it — that check strips comments
     and only reads visible text, which is precisely why this is safe to
     ship commented and unsafe to ship half-filled.

<section class="cost-range">
  <div class="cost-range__header">
    <div class="cost-range__label">What It Costs</div>
    <h2 class="cost-range__title">What ${name} Actually Costs</h2>
  </div>

  <div class="cost-range__figure">${NF}: low end to high end, in USD</div>
  <div class="cost-range__basis">${basis}. Ranges, not quotes.</div>

  <div class="cost-range__grid">
    <div class="cost-range__col">
      <div class="cost-range__col-label">What that includes</div>
      <ul class="cost-range__list">
        <li>${NF}: accommodation tier the range assumes</li>
        <li>${NF}: meals and drinks included at that tier</li>
        <li>${NF}: guiding, transfers and activities included</li>
      </ul>
    </div>
    <div class="cost-range__col">
      <div class="cost-range__col-label">What it does not</div>
      <ul class="cost-range__list">
        <li>${NF}: international airfare position</li>
        <li>${NF}: internal flights, permits and park fees</li>
        <li>${NF}: anything else excluded, stated plainly</li>
      </ul>
    </div>
  </div>

  <div class="cost-range__drivers">
    <div class="cost-range__col-label">The two or three things that move it most</div>
    <ul class="cost-range__list">
      <li>${NF}: driver 1, with the size of its effect</li>
      <li>${NF}: driver 2, with the size of its effect</li>
      <li>${NF}: driver 3, if there is a third worth naming</li>
    </ul>
  </div>

  <p class="cost-range__note">
    Ranges verified <time datetime="${NF}-YYYY-MM-DD">${NF}: Month Year</time>.
    Rates, permit costs and park fees change; confirm before booking.
    Source: ${NF}: P3-5 authority link from the worksheet.
  </p>
</section>

     ══ end WHAT IT COSTS ══ -->

`;
}

const FAQ_OPEN = '<section class="page-faq">';
let changed = 0;

for (const [stem, [name, basis]] of Object.entries(PAGES)) {
  const file = path.join(DIR, `${stem}.html`);
  let html = await readFile(file, "utf8");

  if (html.includes("WHAT IT COSTS (P3-3)")) {
    console.log(`  skip  ${stem}`);
    continue;
  }
  if (!html.includes(FAQ_OPEN)) throw new Error(`${stem}: no page-faq to insert before`);

  html = html.replace(FAQ_OPEN, block(name, basis) + FAQ_OPEN);
  await writeFile(file, html, "utf8");
  changed++;
  console.log(`  ok    ${stem}`);
}

/* ── the worksheet ── */
const rows = Object.entries(PAGES).map(([stem, [name, basis, authority]]) => ({
  stem, name: name.replace(/&amp;/g, "&"), basis, authority: authority.replace(/&amp;/g, "&"),
  url: "/" + stem.split("__")[0] + "/" + stem.split("__")[1] + "/",
}));

const doc = `# Figures worksheet — for Mark

Generated by \`tools/p3-3-cost-scaffold.mjs\`. This is the P3-3 / P3-5 hand-off
for issue #29, and the input to the Phase 3 gate (#30).

**Nothing on the site shows a price today.** All 54 destination and experience
pages carry the cost-range block as an HTML comment, structure complete, every
number a \`${NF}\` marker. Filling this worksheet is what turns them on.

## Why this is worth the hour it takes

Cost questions are the highest-volume, worst-served queries in luxury travel.
Almost no operator answers them. Publishing honest *ranges* — not quotes,
caveated, dated — is the single strongest AI-citation asset available to this
site (SEO-AIO-PLAN § P3-3).

## Ground rules

- **Ranges, not quotes.** A low end and a high end for the way you actually
  plan the trip. If the honest answer is "it depends", the range is wide and
  the drivers column explains why.
- **No number you have not verified.** A blank cell is fine and expected. Any
  row left blank stays commented out and ships nothing.
- **Say what is in and what is out.** The exclusions matter more than the
  number — that is what makes it quotable rather than misleading.
- **Date it.** Every filled row gets a verification date, which becomes the
  visible \`<time>\` element on the page.

## 1. Cost ranges — one row per page

Fill the four middle columns. Leave any row blank that you cannot verify.

| Page | Basis | Range (USD, low–high) | Includes | Excludes | Top 2–3 drivers | Verified (YYYY-MM-DD) |
|---|---|---|---|---|---|---|
${rows.map((r) => `| [${r.name}](${r.url}) | ${r.basis} | | | | | |`).join("\n")}

## 2. P3-5 — the source each page should cite

Inline citation of an authoritative source was the strongest single lever in
the GEO study (+30–40%, up to +115% for lower-ranked pages). Where a page makes
a factual claim about the outside world — permit costs, park fees, entry rules,
event dates — it should link the body that sets them.

Confirm the authority below is the right one, and paste the exact URL you want
linked. Where a page's claim is already correct and only needs a source, that
is a one-line change.

| Page | Authority to cite | URL to link |
|---|---|---|
${rows.map((r) => `| [${r.name}](${r.url}) | ${r.authority} | |`).join("\n")}

## 3. What happens when you send this back

Per issue #30, the returned worksheet is inserted in one pass: every figure
with its verified-as-of date, the source links added, \`dateModified\` bumped on
every changed page, build and verifier clean, and anything still unresolved
reported rather than guessed.

Partial is fine. A row you fill ships; a row you do not stays commented.
`;

await writeFile(WORKSHEET, doc, "utf8");

console.log(`\n${changed} pages given the commented cost-range block.`);
console.log(`worksheet written: docs/seo/figures-worksheet.md (${rows.length} pages × 2 tables)`);
