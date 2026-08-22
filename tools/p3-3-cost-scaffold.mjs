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

/* stem → [display name, pricing basis, authority for P3-5 citations, plural?]
   plural is optional and defaults to falsy; set it true where the display name
   takes "Actually Cost" rather than "Actually Costs". */
const PAGES = {
  // ── regional hubs ──
  "destinations__africa": ["Africa", "per person, per night, all-inclusive at camp", "Country park authorities; Botswana DWNP, Kenya Wildlife Service, TANAPA"],
  "destinations__asia": ["Asia", "per person, per day, land only", "National tourism boards (JNTO, TAT, Indonesia MoT)"],
  "destinations__caribbean-mexico": ["the Caribbean &amp; Mexico", "per person, per night", "National tourism boards; NOAA for hurricane season dates", true],
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
  "destinations__canadian-rockies": ["the Canadian Rockies", "per person, per day, land only", "Parks Canada (park pass, Moraine Lake shuttle)", true],
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
  "destinations__kenya-tanzania": ["Kenya &amp; Tanzania", "per person, per night, all-inclusive at camp", "Kenya Wildlife Service; TANAPA (park and conservancy fees)", true],
  "destinations__maldives": ["the Maldives", "per person, per night", "Maldives Inland Revenue Authority (green tax, TGST)"],
  "destinations__napa-sonoma": ["Napa &amp; Sonoma", "per person, per day, land only", "Individual winery tasting fees; Napa Valley Vintners", true],
  "destinations__new-orleans": ["New Orleans", "per person, per day, land only", "New Orleans &amp; Company (festival dates)"],
  "destinations__new-york": ["New York", "per person, per day, land only", "NYC Tourism; individual museum operators"],
  "destinations__new-zealand": ["New Zealand", "per person, per day, land only", "NZ Dept of Conservation (Great Walks, Milford)"],
  "destinations__oman": ["Oman", "per person, per day, land only", "Oman Ministry of Heritage and Tourism (visa, permits)"],
  "destinations__patagonia": ["Patagonia", "per person, per day, land only", "CONAF (Torres del Paine); Argentina APN (Los Glaciares)"],
  "destinations__peru": ["Peru", "per person, per day, land only", "Peru Ministerio de Cultura (Machu Picchu tickets, Inca Trail permits)"],
  "destinations__portugal": ["Portugal", "per person, per day, land only", "Turismo de Portugal; individual quinta tasting fees"],
  "destinations__riviera-maya-los-cabos": ["Mexico's coasts", "per person, per night", "Mexico SECTUR; INAH (Mayan site tickets)", true],
  "destinations__rwanda": ["Rwanda", "per person, per night, all-inclusive at lodge", "Rwanda Development Board (gorilla permit price and daily quota)"],
  "destinations__spain": ["Spain", "per person, per day, land only", "Turespaña; Patronato de la Alhambra (ticket release dates)"],
  "destinations__st-barths": ["St. Barth's", "per person, per night", "Comité Territorial de Tourisme de Saint-Barthélemy"],
  "destinations__thailand": ["Thailand", "per person, per day, land only", "Tourism Authority of Thailand; DNP (national park fees)"],
  "destinations__turks-caicos": ["Turks &amp; Caicos", "per person, per night", "Turks &amp; Caicos Tourist Board"],
  "destinations__uk-ireland": ["the UK &amp; Ireland", "per person, per day, land only", "VisitBritain; Fáilte Ireland; National Trust / OPW site fees", true],


  /* ── destinations · the M7 set (#40-#65), added 2026-08-20 ──
     These 26 pages were built after this table was written and never went
     through it. docs/seo/NEW-CONTENT-PROMPT.md hardcodes "a cost-range block:
     per-person per-day range" and states the shape "is not negotiable", so all
     26 inherited "per person, per day, land only" regardless of what they sell;
     only falklands-south-georgia was overridden by hand. Eight of the units
     below therefore differ from what those pages currently declare, and the
     pages still need editing to match — this table records the decision, it
     does not apply it. Tracked on #108. */
  "destinations__arctic-norway": ["Arctic Norway", "per person, per day, land only", "Norwegian Public Roads Administration (national road ferry tariffs, toll charges); Norwegian Meteorological Institute (yr.no cloud and aurora forecast)"],
  "destinations__argentina": ["Argentina", "per person, per day, land only", "Argentina APN (Iguazú and Nahuel Huapi national park entry fees)"],
  "destinations__aspen": ["Aspen", "per person, per night", "US Forest Service, White River National Forest (Maroon Bells timed-entry reservation and shuttle fee); City of Aspen (lodging tax)"],
  "destinations__australia": ["Australia", "per person, per day, land only", "Parks Australia (Uluru-Kata Tjuta park entry fee); Great Barrier Reef Marine Park Authority (Environmental Management Charge)"],
  "destinations__barbados-eastern-caribbean": ["Barbados &amp; the Eastern Caribbean", "per person, per night", "Barbados Revenue Authority (room rate levy, product development levy); Saint Lucia Tourism Authority; Antigua and Barbuda Tourism Authority", true],
  "destinations__bhutan": ["Bhutan", "per person, per day, land only", "Bhutan Department of Tourism (Sustainable Development Fee, visa fee)"],
  "destinations__brazil": ["Brazil", "per person, per day, land only", "ICMBio (Iguaçu National Park entry); Brazilian Ministry of Foreign Affairs (e-visa fee)"],
  "destinations__colombia": ["Colombia", "per person, per day, land only", "Parques Nacionales Naturales de Colombia (Tayrona and Corales del Rosario entry fees)"],
  "destinations__cook-islands": ["the Cook Islands", "per person, per night", "Cook Islands Revenue Management Division (VAT, departure tax)", true],
  "destinations__costa-rica": ["Costa Rica", "per person, per day, land only", "SINAC (national park entry fees, daily-capacity reservations and the Corcovado certified-guide requirement)"],
  "destinations__dominican-republic": ["the Dominican Republic", "per person, per night", "Dirección General de Impuestos Internos (18% ITBIS on hotel rates); Ministerio de Medio Ambiente (Samaná whale-watching permits)"],
  "destinations__falklands-south-georgia": ["the Falklands &amp; South Georgia", "per person, per voyage", "Government of South Georgia &amp; the South Sandwich Islands (visitor entry permit, harbour dues); Falkland Islands Government (departure tax)", true],
  "destinations__georgia-armenia": ["Georgia &amp; Armenia", "per person, per day, land only", "Georgian Ministry of Foreign Affairs consular service; Armenian Ministry of Foreign Affairs (visa fees and entry rules)", true],
  "destinations__greenland": ["Greenland", "per person, per day, land only", "Government of Greenland, Naalakkersuisut (national park and expedition permits); Danish Immigration Service (Greenland visa endorsement)"],
  "destinations__india": ["India", "per person, per day, land only", "Archaeological Survey of India (monument entry tickets); Indian Bureau of Immigration (e-Visa fee)"],
  "destinations__israel": ["Israel", "per person, per day, land only", "Israel Nature and Parks Authority (Masada, Ein Gedi and Caesarea site entry fees); Population and Immigration Authority (ETA-IL fee)"],
  "destinations__jamaica": ["Jamaica", "per person, per night", "Tax Administration Jamaica (GCT on tourism accommodation, nightly room tax)"],
  "destinations__morocco": ["Morocco", "per person, per day, land only", "Morocco Ministry of Youth, Culture and Communication (monument and heritage site tickets)"],
  "destinations__seychelles": ["Seychelles", "per person, per night", "Seychelles Revenue Commission (Environmental Sustainability Levy, VAT)"],
  "destinations__south-africa": ["South Africa", "per person, per day, land only", "South African National Parks (Kruger and Addo daily conservation fee)"],
  "destinations__sri-lanka": ["Sri Lanka", "per person, per day, land only", "Sri Lanka Dept of Wildlife Conservation (national park entry fees); Central Cultural Fund (Cultural Triangle site tickets)"],
  "destinations__svalbard": ["Svalbard", "per person, per voyage", "Governor of Svalbard (Svalbard environmental fee, protected-area landing rules and passenger caps)"],
  "destinations__uae-gulf": ["the UAE &amp; the Gulf", "per person, per day, land only", "UAE Federal Tax Authority (VAT); Dubai Department of Economy and Tourism (Tourism Dirham hotel fee)", true],
  "destinations__vanuatu": ["Vanuatu &amp; Beyond", "per person, per day, land only", "Vanuatu Department of Customs and Inland Revenue (VAT, departure tax)", true],
  "destinations__vietnam-southeast-asia": ["Vietnam &amp; Southeast Asia", "per person, per day, land only", "Vietnam Immigration Department (e-visa fee); Angkor Enterprise, Cambodia (Angkor pass price)", true],
  "destinations__zambia-victoria-falls": ["Zambia &amp; Victoria Falls", "per person, per night, all-inclusive at camp", "Zambia Dept of National Parks &amp; Wildlife (park entry and concession fees)", true],

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

/* `plural` picks the verb. The heading is generated, and with "Costs" hardcoded
   this generator is where "What Mexico's coasts Actually Costs" came from: it
   shipped commented, nothing validated it, and it published itself the moment
   the block went live (fixed by hand in bec5164). A compound subject or a
   plural place needs "Cost". */
function block(name, basis, plural) {
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
    <h2 class="cost-range__title">What ${name} Actually ${plural ? "Cost" : "Costs"}</h2>
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

for (const [stem, [name, basis, , plural]] of Object.entries(PAGES)) {
  const file = path.join(DIR, `${stem}.html`);
  let html = await readFile(file, "utf8");

  /* Skip a page that already has a cost block in EITHER state. This used to
     test only for "WHAT IT COSTS (P3-3)" and missed both:

       - the 26 M7 destination pages carry hand-written scaffolds headed
         "<!-- ══ WHAT IT COSTS ══" with no "(P3-3)" in them;
       - a page turned live by p3-8-cost-insert.mjs has no comment marker at
         all, because the whole commented block was replaced by the rendered
         <section class="cost-range">.

     So running this tool against the repo as it stands today re-inserted a
     scaffold into all 52 live pages. Both the old and the new block are
     commented and the placeholder check strips comments before reading visible
     text, so nothing went red — the duplicate would simply have shipped, and
     surfaced later as two cost sections on one page. The second clause is the
     same test p3-8-cost-insert.mjs already uses to decide a page is done. */
  if (html.includes("WHAT IT COSTS") || html.includes('class="cost-range"')) {
    console.log(`  skip  ${stem}`);
    continue;
  }
  if (!html.includes(FAQ_OPEN)) throw new Error(`${stem}: no page-faq to insert before`);

  html = html.replace(FAQ_OPEN, block(name, basis, plural) + FAQ_OPEN);
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
