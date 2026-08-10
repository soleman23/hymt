/**
 * P3-2 + P3-4 (issue #28) — answer capsules and the first-hand-detail slot.
 *
 * P3-2: a 40–70 word paragraph directly under the first <h2> of every
 * destination and experience page that answers the page's core question
 * factually, with at least one number in it. Not a hook — the answer. This is
 * the highest-leverage paragraph on the page: it is what a scanning reader
 * decides on and what an answer engine quotes verbatim.
 *
 * EVERY FIGURE BELOW IS TAKEN FROM THE PAGE IT SITS ON — its seasons strip,
 * its itinerary durations, or its own FAQ answers. Nothing here is new
 * research and nothing is estimated. Where a capsule wanted a number the page
 * did not already carry, the sentence was rewritten to drop the claim rather
 * than to guess it. The word-count and digit checks at the bottom fail the
 * run rather than shipping an out-of-spec capsule.
 *
 * P3-4: CONTENT-STANDARDS § 6 wants at least one genuine first-hand sentence
 * per page — "I was last in the Serengeti in June 2025". No page has one. The
 * 54 pages carry practice-voice first person ("I recommend", "I have sent")
 * which is not the same thing and does not carry the E-E-A-T signal. That
 * detail is Mark's and cannot be drafted, so each page gets a NEEDS MARK
 * marker in the slot where the sentence belongs, per § 6's explicit
 * instruction and the acceptance criteria on #28.
 *
 *   node tools/p3-2-answer-capsules.mjs
 *
 * Idempotent: a page already carrying .answer-capsule is skipped.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIR = path.join(ROOT, "src", "content-pages");

const CAPSULES = {
  // ── destination hubs ──
  "destinations__africa": `The Great Migration peaks July–October, but Africa runs on six separate calendars rather than one. Botswana's dry season concentrates game June–October; Rwanda's gorilla trekking works year-round and depends on trail conditions instead. Most first safaris run 10–12 days across two or three camps. Camp selection matters more than country — it decides the guiding, the vehicle, and how many other vehicles share a sighting.`,
  "destinations__asia": `Asia is not one season. Japan works late March to May and October to November, Southeast Asia's dry season runs November to April, and India and South Asia run October to March. A first trip needs 10–14 days across one or two countries rather than four. Japan and Thailand are the two most common first choices, for opposite reasons.`,
  "destinations__caribbean-mexico": `Peak season runs December through April, when the weather is most reliable and rates are highest; hurricane season runs July to October. Most trips run 5–8 days. The island decides more than the resort does: St. Barth's is small, expensive and Parisian with no chain hotels, Turks and Caicos is about water clarity, and the Riviera Maya adds cenotes and Mayan sites.`,
  "destinations__europe": `The best months for most of Europe are May–June and September–October. July and August are peak crowds and peak heat simultaneously. Shoulder season delivers the same continent with lower rates, harvest underway in the wine regions, and noticeably fewer people at the major sites. Most itineraries run 7–12 days, and two weeks covers one country properly rather than six cities badly.`,
  "destinations__middle-east": `The Middle East runs October through April; May to September is too hot for anything outdoors. Most itineraries run 8–12 days, and the region combines well — Jordan with Oman, or the UAE as a stopover on either end. Ramadan shifts roughly eleven days earlier each year and changes restaurant and site hours throughout, so confirm the dates before fixing travel.`,
  "destinations__north-america": `North America is a fall destination first: September through November delivers the best weather and the thinnest crowds across most of the continent. Summer, June to August, is national-park season and the busiest. Trips run 4–10 days depending on region. Yellowstone with Grand Teton is the strongest single natural pairing; Utah's Zion and Bryce are the desert equivalent.`,
  "destinations__polar-regions": `Antarctica runs November through March, the Arctic summer runs June through August, and the northern lights season runs September through March. Antarctic expeditions take 11–15 days, or 18–22 with South Georgia added. The physical demand is lower than most people expect: Zodiac landings mean stepping in and out of an inflatable onto rock or ice, and walking on uneven ground.`,
  "destinations__south-america": `South America splits by region rather than by season. Patagonia runs October to April, the Andes and Peru run May to October, and Buenos Aires, Colombia and the Galápagos work year-round. Most itineraries run 9–12 days for one region. Combining Peru and Patagonia in under two weeks is the most common planning error — the continent is larger than it photographs.`,
  "destinations__south-pacific": `The South Pacific's dry season runs May through October. Most itineraries run 8–14 days. The four destinations are not interchangeable: Australia and New Zealand are active, wide-ranging trips across cities and landscape, while Fiji and French Polynesia are resort-and-lagoon destinations. The flight is long enough that pairing two of them usually returns more than committing to one.`,

  // ── destinations ──
  "destinations__alaska": `Alaska's season is June through August, with May and September genuine shoulders rather than compromises. Most itineraries run 10–14 days. The format decision outranks the month: a large cruise ship covers the Inside Passage at the lowest cost per night and at a distance, a small expedition ship trades that reach for landings, and a wilderness lodge trades coverage for depth.`,
  "destinations__antarctica": `Antarctica's season runs November to March, and the month decides what you see — penguin colonies at their peak in December and January, whales in February and March. Expeditions run 10–12 days, or 18–22 with South Georgia and the Falklands added. Book twelve to eighteen months ahead: the ships worth taking sell their best cabins that far out.`,
  "destinations__bali": `Bali's dry season runs May through October, with July and August the busiest and most expensive months in it. Most itineraries run 9–12 days. The wet season, November to April, is not a washout — rain arrives in afternoon bursts rather than all day, and rates fall accordingly. Ubud and south Bali are two different trips, not interchangeable bases.`,
  "destinations__botswana": `Botswana's dry season peaks June through October, when the Okavango flood is at its height and game concentrates on the water. Most safaris run 9–12 days across two or three camps. Botswana costs more than its neighbours by design: the government set a high minimum daily rate to cap visitor numbers, so the premium buys fewer vehicles at a sighting.`,
  "destinations__canadian-rockies": `Summer runs mid-June to early September, and larch season is a short window from mid-September to early October. Most trips need 7–9 days, or 5–6 for larch alone. Moraine Lake is now shuttle-or-licensed-tour only — private cars are no longer permitted, and the dawn slots book out weeks ahead. Winter, December to March, is a different destination entirely.`,
  "destinations__egypt": `Egypt's window is October through April, with November to February the most comfortable months for walking Luxor and the Valley of the Kings. May through September is too hot for a first visit. Itineraries run 10–16 days depending on how much Nile you include. The guide decides the trip: an Egyptologist reads the walls, a tour guide reads a script.`,
  "destinations__fiji": `Fiji's dry season runs May through October. Most trips run 8–12 days. The chain decision comes before the resort: the Mamanucas sit 10–45 minutes from Nadi with more variety and easier family logistics, while the Yasawas are further out, smaller and quieter, with the manta ray season as their draw. December to March is warm and green rather than washed out.`,
  "destinations__france": `France's best windows are May–June and September–October. Paris needs four nights minimum on a first visit — enough for the major museums, three or four neighbourhood walks with a guide, and time that is not spent queuing. Most itineraries run 8–12 days. Bordeaux and Burgundy are September–October trips, and Provence needs a car rather than a train.`,
  "destinations__french-polynesia": `French Polynesia's dry season is May through October, with whales present August to October. Most itineraries run 10–14 days across two or three islands. Bora Bora delivers the archetype — the lagoon, Mount Otemanu, the top-end overwater villas. Moorea has the more dramatic silhouette, a more Polynesian daily life, and costs considerably less. Two islands works better than three.`,
  "destinations__galapagos": `There is no bad season in the Galápagos. The cool dry season runs June to November with rougher seas and more seabird activity; December to May is warmer, calmer and better for snorkelling. Trips run 8–14 days. The real decision is liveaboard versus land-based — only a liveaboard reaches the western islands and the northern outliers, where the endemic wildlife genuinely differs.`,
  "destinations__greece": `September is the best month in Greece, decisively. The weather matches July and August while crowds at the islands and the major archaeological sites drop by roughly 50%, and rates fall with them. May and early June are the spring equivalent. Most itineraries run 8–14 days. Athens deserves two full days before the ferries, not one.`,
  "destinations__hawaii": `Hawaii's best windows are April–June and September–October, sitting between the winter and summer crowd peaks. Whales are present January through March. Most trips run 10–12 days across two islands. The island decides the trip: the Big Island and Oahu are the strongest family choices, Maui and Kauai the stronger couples ones. Two islands in ten days works; three does not.`,
  "destinations__iceland": `Iceland is two destinations. Summer, June to August, gives near-endless daylight and full Highland access over 7–9 days. Aurora season runs late September through March, needs 5–7 days, and is a weather lottery — allow at least three or four nights in the right area, because more nights is the only way to improve the odds.`,
  "destinations__italy": `The best months for Italy are May–June and September–October. July and August are simultaneously peak tourist season and peak heat, and the Amalfi Coast in particular becomes difficult. Shoulder season delivers the same country with 30–40% fewer visitors, lower rates, and either wildflowers or the grape and truffle harvest depending which end you pick. Most itineraries run 10–14 days.`,
  "destinations__japan": `Japan has two peak seasons with genuine justification: cherry blossom in late March and early April, and autumn foliage from mid-October through November. Cherry blossom demands the most advance planning of any window in the country. Most itineraries run 12–14 days. The language barrier is smaller than expected in the cities and a real consideration in the countryside.`,
  "destinations__jordan": `Jordan's window is October through April, with March and April the spring peak. May through September is too hot for walking Petra or Wadi Rum comfortably. Most itineraries run 7–14 days. Petra needs two days rather than one: the second is when you walk the back route to the Monastery and see the site without the day-trip crowds.`,
  "destinations__kenya-tanzania": `The Great Migration river crossings run July through October, which is peak season in both countries. Green season, January to March, is calving season in the southern Serengeti and costs considerably less. Most safaris run 10–14 days. Kenya's private conservancies around the Masai Mara permit night drives, walking and no vehicle limits; Tanzania's parks are larger and more restrictive.`,
  "destinations__maldives": `The Maldives' dry season runs November through April. Most trips run 7–10 nights. The atoll and the villa category decide the holiday far more than the star rating does: a house reef forty steps from the deck is a different trip from a lagoon that has been grazed bare. Ask which way the villa faces and what the lagoon depth is at low tide.`,
  "destinations__napa-sonoma": `Harvest runs September through October and is both the best and busiest time to visit. Most trips run 3–5 days. Napa and Sonoma are thirty minutes apart and temperamentally opposite — Napa for the cabernet estates and polish, Sonoma for fog-cooled pinot and farm culture. Three wineries a day is the ceiling, and a driver is not optional.`,
  "destinations__new-orleans": `New Orleans works October through April; June to September is hot and humid enough to reshape the day around it. Most trips run 4–5 days, and 3 or 4 covers the city properly — the Quarter, Frenchmen Street, the Garden District, a bayou half-day, and four nights of music. Festival season runs February to early May and anchors the trip rather than fitting around it.`,
  "destinations__new-york": `September is New York's best month, firmly. The summer humidity is gone, the outdoor terraces are still open, the markets are at peak, and the city is walkable for a full day. May and June are the spring equivalent, and December is its own case. Most trips run 6–10 days. The neighbourhood you base in changes the trip more than the hotel.`,
  "destinations__new-zealand": `New Zealand's season runs November through April. For a first trip with 10–12 days available, the South Island alone is the right answer — Queenstown, Fiordland, Wanaka, Mount Cook and Marlborough. Adding the North Island properly needs 14–16 days. Self-drive is the correct format rather than a concession: the distances are moderate and the road is much of the point.`,
  "destinations__oman": `Oman's window is October through March, with the Jebel Akhdar rose harvest in March and April. May to September is too hot for the interior. Most itineraries run 8–16 days. A 4WD is genuinely required for the wadis and the Wahiba Sands rather than a rental upsell. Oman rates among the safest countries in the region for solo female travellers.`,
  "destinations__patagonia": `Patagonia's season is November through March. Most itineraries run 10–16 days. The W-Trek is five days of hiking at 12–18 km a day with 500–1,100 m of elevation gain on the longer sections — moderate to challenging, and the lodge-supported version removes the camping rather than the walking. Non-hikers have a real Patagonia trip available; it is a different one.`,
  "destinations__peru": `Peru's dry season runs May through October, with June to August the busiest months in it. Most itineraries run 10–16 days. Altitude is what ruins Peru trips: the correct sequence is Lima at sea level, then the Sacred Valley at 9,000 feet for two nights, then Cusco at 11,000. Flying Lima to Cusco directly is the most common mistake made.`,
  "destinations__portugal": `Portugal's best windows are May–June and September–October. 8–10 days covers the Lisbon–Porto–Douro triangle, 5 or 6 covers Lisbon plus one region, and 14 adds the Alentejo and Algarve properly. The Douro harvest runs September into October. Portugal is compact enough to rush, which is the most common way to get it wrong.`,
  "destinations__riviera-maya-los-cabos": `November through April is the window for both coasts. Most trips run 5–9 days. The Riviera Maya has warm swimmable Caribbean water, cenotes and Mayan sites; Los Cabos has desert landscape, golf, whales and the better restaurant scene. Sargassum can be significant on parts of the Riviera Maya between roughly April and October, and absent a few miles away.`,
  "destinations__rwanda": `Rwanda's dry seasons run June to September and December to February, but gorilla trekking works year-round and turns on trail conditions rather than the month. Most itineraries run 7–12 days. The trek itself varies from thirty minutes to five hours of steep volcanic terrain. Permits bind the whole trip: eight trekkers per gorilla family, roughly one hundred issued daily.`,
  "destinations__spain": `Spain's best windows are April–June and September–October. Most itineraries run 7–10 days. The region decides the trip: north for food, the Basque Country and Rioja; south for Andalusian architecture and history; Barcelona and the coast for variety in one place. Alhambra tickets and the best restaurant tables both need booking well before arrival rather than on it.`,
  "destinations__st-barths": `St. Barth's sweet spot is January through April — the same island, restaurants and beaches as the late-December fortnight, at a fraction of the intensity and a considerably more sensible price. Most trips run 5–7 days. Low season runs June to November, when much of the island closes. There are no chain hotels, and villa-versus-hotel sets the budget.`,
  "destinations__thailand": `November through April is the right answer for most of Thailand — cool dry season nationwide, clear skies on the Andaman coast, and manageable heat in Bangkok and the north. Most itineraries run 10–14 days. Bangkok needs two or three nights before heading north or south, not one. The monsoon, May to October, is regional rather than nationwide.`,
  "destinations__turks-caicos": `High season runs December through April and hurricane season July through October. Most trips run 7–8 days. For groups of six or more and families with children, a Grace Bay villa usually beats a resort — private pool, provisioned kitchen, chef available, beachfront without shared amenities. The top villas need booking 9–12 months out for the holiday weeks.`,
  "destinations__uk-ireland": `May through September is the window, with October and November a genuine autumn alternative rather than a fallback. Most itineraries run 9–12 days. Combining England, Scotland and Ireland in under ten days does not work. In the Highlands and rural Ireland, hire the driver — the single-track roads demand the attention you should be spending on the landscape.`,

  // ── experiences ──
  "experiences__adventure-active-travel": `Fitness requirements vary more here than any other planning input. A safari asks almost nothing physically; trekking to Machu Picchu or Everest Base Camp asks for months of cardiovascular preparation. Southern-hemisphere seasons run October to April and northern ones June to September, so there is good trekking somewhere in all 12 months. Current fitness sets the itinerary, not the reverse.`,
  "experiences__all-inclusive-vacations": `All-inclusive covers 4 things at minimum: accommodation, meals across multiple restaurants, non-premium drinks and most resort amenities. Better properties extend that to room service, premium spirits, non-motorised water sports and some excursions. Peak season runs December through April. What varies between properties is far wider than the rating suggests, so the inclusion list is the document worth reading.`,
  "experiences__beach-island-escapes": `The three regions run on opposite calendars — the Caribbean peaks December to April, the Indian Ocean November to April, and the South Pacific May to October — so there is a good beach somewhere in all 12 months. The Maldives is unmatched for overwater villas and marine life but is a resort experience; the Caribbean adds culture and a much shorter flight.`,
  "experiences__cruises": `Ship size decides the experience more than the itinerary does. A 200-guest expedition ship means no queuing and a destination focus; a large ship means more amenities and more people between you and the place. Mediterranean shoulder seasons run May–June and September–October, Alaska June to August, and Antarctica November to March. Expedition cabins book twelve to eighteen months out.`,
  "experiences__culture-immersive-travel": `A culture-first itinerary trades coverage for depth: time with local historians, site access before the crowds arrive, and meals at family-run places rather than tourist-facing ones. Europe's shoulder seasons run April–June and September–October, Japan runs March–May and October–November, and the Middle East and North Africa run October to April. 2 cities covered properly beats 5 covered superficially.`,
  "experiences__family-travel": `Most luxury safari camps in Botswana and Tanzania set a minimum age of 12, and that single constraint reshapes more family itineraries than any other. South Africa, Kenya and certain family-designated camps take younger children. The school-holiday windows — December–January and summer — carry the highest rates and the earliest sell-outs of the year, so they set the booking clock.`,
  "experiences__food-wine-travel": `Harvest and truffle season runs September through November and is the strongest window for food-led travel; spring markets run April to June. The regions planned most often are Napa and Sonoma, Willamette, Burgundy, Champagne, Tuscany, Piedmont and Rioja — 7 regions across 3 different harvest calendars. You do not need to know wine to get the value from any of them.`,
  "experiences__multigenerational-travel": `The planning problem is 3 sets of expectations at once, not a destination shortlist. What works is a property with enough variety that each generation gets something real, plus 1 or 2 shared anchors a day rather than a fully joint itinerary. European shoulder seasons, May–June and September–October, suit these groups best; school-holiday windows cost the most.`,
  "experiences__romance-celebration-travel": `6–9 months is the right lead time for a honeymoon — the best room categories at the best properties go early, particularly in the Maldives, Bora Bora and safari camps in season. The Indian Ocean runs November to April, the Mediterranean May–June and September–October, and the South Pacific May to October. Shorter timelines are workable and less optimal.`,
  "experiences__safari-wildlife-travel": `Peak timing is by country, not by continent, and the 4 planned most often diverge. Kenya and Tanzania are best July through October for the Great Migration; Botswana peaks May to October, when the dry season concentrates game on water; green season, December to March, costs less and delivers calving and birdlife. Camp choice — its size, its concession, its guides — outranks the month every time.`,
  "experiences__sports-event-travel": `Marquee events run on 6–18 month lead times for the access worth having: Formula 1, Wimbledon, the Masters, World Cup matches. Some inventory releases later when earlier packages fall through, but the good seats are rarely in it. The event fixes the dates, so the rest of the trip is built around a fixed point rather than the other way round.`,
  "experiences__wellness-retreat-travel": `A spa resort stay delivers value in 3–5 nights. A structured programme — Ayurvedic treatment, a supervised protocol, a dedicated sleep retreat — typically needs 7–14 days to complete its arc, and shorter versions produce proportionally reduced results. Asia's dry season runs November to April, and Mexico and the Americas run November to May.`,
};

/* The first-hand slot. Page-specific so Mark knows what is being asked for
   rather than receiving 54 identical prompts. */
const NEEDS_MARK = (subject) =>
  `<!-- NEEDS MARK: first-hand detail. CONTENT-STANDARDS § 6 wants one genuine\n` +
  `     first-hand sentence here — a month and year, a named property, or a\n` +
  `     specific observation from ${subject}. The model of the sentence is\n` +
  `     "I was last in the Serengeti in June 2025." The page currently has\n` +
  `     practice-voice first person ("I recommend", "I have sent") which does\n` +
  `     not carry the same signal. If Mark has not been, § 6 says say so\n` +
  `     plainly and name the on-the-ground partner instead — that is stronger\n` +
  `     than leaving the gap. Never invent this. -->`;

const SUBJECT = (stem) =>
  stem.startsWith("destinations__")
    ? "this destination"
    : "planning trips of this kind";

const words = (s) => s.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length;
const hasDigit = (s) => /\d/.test(s);

/* ── validate before writing anything ── */
const problems = [];
for (const [stem, text] of Object.entries(CAPSULES)) {
  const n = words(text);
  if (n < 40 || n > 70) problems.push(`${stem}: ${n} words (need 40–70)`);
  if (!hasDigit(text)) problems.push(`${stem}: no number in the capsule`);
}
if (problems.length) {
  console.error("Capsules out of spec — nothing written:\n  " + problems.join("\n  "));
  process.exit(1);
}

let changed = 0;
for (const [stem, text] of Object.entries(CAPSULES)) {
  const file = path.join(DIR, `${stem}.html`);
  let html = await readFile(file, "utf8");

  if (html.includes("answer-capsule")) {
    console.log(`  skip  ${stem}`);
    continue;
  }

  /* 53 pages use .intro-title, /maldives/ uses .dest-intro__title. */
  const m = html.match(/<h2 class="(intro-title|dest-intro__title)">[\s\S]*?<\/h2>\n/);
  if (!m) throw new Error(`${stem}: could not find the first <h2>`);

  const indent = "    ";
  const block =
    m[0] +
    `${indent}<p class="answer-capsule">${text}</p>\n` +
    `${indent}${NEEDS_MARK(SUBJECT(stem)).replace(/\n/g, `\n${indent}`)}\n`;

  html = html.replace(m[0], block);
  await writeFile(file, html, "utf8");
  changed++;
  console.log(`  ok    ${stem} (${words(text)} words)`);
}

console.log(`\n${changed} pages given an answer capsule and a first-hand-detail marker.`);
