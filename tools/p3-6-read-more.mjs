/**
 * P3-6 (issue #27), leg 2 of 4 — the return half of the hub-and-spoke.
 *
 * CONTENT-STANDARDS § 7: "Every destination and experience page links to at
 * least two related journal posts, in a 'Read more' block after the FAQ."
 * Nothing on the site did this — the journal was a one-way street even after
 * leg 1 gave every post its outbound links.
 *
 * .page-faq is the last section on all 54 destination and experience content
 * pages (verified before this script was written), so the block appends. Three
 * posts per page, chosen for genuine relatedness rather than filled to the
 * grid: "related" means a reader on this page would actually want that post.
 *
 *   node tools/p3-6-read-more.mjs
 *
 * Idempotent: a page already carrying a .read-more section is skipped.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIR = path.join(ROOT, "src", "content-pages");

/* Card copy per journal post. Titles are shortened from the post headlines to
   fit a three-up card; descriptions are one sentence with the post's own
   specific in it, not a restatement of the title. */
const POSTS = {
  "africa-destination-guide": { cat: "Destination Guide", title: "The Africa Guide", desc: "Six African regions that do not overlap, and why camp selection outranks every other safari decision." },
  "african-safari-calendar": { cat: "Season", title: "The African Safari Calendar", desc: "Migration cycles, dry-season windows and the honest case for green season, region by region." },
  "amanjiwo-field-report": { cat: "Experience Report", title: "Amanjiwo, in Practice", desc: "Borobudur at dawn, and what a staff-to-guest ratio actually buys once you are on the ground." },
  "asia-destination-guide": { cat: "Destination Guide", title: "The Asia Guide", desc: "Six regions needing six different planning frameworks, from Japan through to the Maldives." },
  "botswana-shoulder-season": { cat: "Africa &amp; Safari", title: "Botswana Before the Crowd", desc: "Moremi in May and June, while the water is still rising and the camps are still quiet." },
  "caribbean-mexico-destination-guide": { cat: "Destination Guide", title: "The Caribbean &amp; Mexico Guide", desc: "Choosing the island is the decision that outranks every other one on the trip." },
  "europe-destination-guide": { cat: "Destination Guide", title: "The Europe Guide", desc: "Six European regions, their honest character, and the properties that earn their rates." },
  "european-grand-tour-mistake": { cat: "Opinion", title: "The Grand Tour Is Usually Wrong", desc: "Six cities in two weeks is the most common European itinerary and one of the least satisfying." },
  "five-star-problem": { cat: "Opinion", title: "The Five-Star Problem", desc: "The rating stopped meaning anything specific. What actually signals an exceptional hotel." },
  "glacier-express-field-report": { cat: "Experience Report", title: "The Glacier Express, End to End", desc: "291 bridges, 91 tunnels, eight hours — and why the direction you ride it in matters." },
  "heli-ski-field-report": { cat: "Experience Report", title: "A Week of Heli-Skiing", desc: "No lifts, no groomers, no other tracks. The runs, the lodge, and the skiing it requires." },
  "how-hotel-upgrades-work": { cat: "Insider Tips", title: "How Hotel Upgrades Actually Work", desc: "The anniversary email almost never works. What drives a complimentary upgrade instead." },
  "in-defense-of-slow-travel": { cat: "Opinion", title: "In Defense of Slow Travel", desc: "Staying longer and covering less ground produces the better trip, and costs less to do." },
  "kentucky-derby-field-report": { cat: "Experience Report", title: "The Kentucky Derby", desc: "A two-minute race that takes twelve hours to attend, and both of those facts are right." },
  "masters-field-report": { cat: "Experience Report", title: "The Masters", desc: "The badge waiting list closed in 1978. What Augusta is, and how access actually works." },
  "mediterranean-october": { cat: "Season", title: "The Mediterranean in October", desc: "The heat gone, the sea still warm, and harvest underway across Italy and Greece." },
  "middle-east-destination-guide": { cat: "Destination Guide", title: "The Middle East Guide", desc: "The most consistently underestimated luxury region, its seasonal logic and its properties." },
  "napa-sonoma-winery-route": { cat: "Food &amp; Wine", title: "The Napa &amp; Sonoma Route", desc: "A 2- and 3-day route: the appointments worth making, and the mistakes made before you arrive." },
  "north-america-destination-guide": { cat: "Destination Guide", title: "The North America Guide", desc: "Six regions worth booking with intention, from Alaskan lodges to Hawaii's quietest island." },
  "polar-destination-guide": { cat: "Destination Guide", title: "The Polar Regions Guide", desc: "Why polar travel runs on entirely different planning logic, and the vessels worth booking." },
  "private-guide-advantage": { cat: "Insider Tips", title: "The Private Guide Advantage", desc: "What separates an exceptional guide from a merely licensed one, and it is not credentials." },
  "safari-planning-12-questions": { cat: "Planning Advice", title: "Safari: 12 Questions Worth Asking", desc: "Camp size, guide tenure and vehicle policy are what decide safari quality. Price rarely does." },
  "singita-grumeti-field-report": { cat: "Experience Report", title: "Singita Grumeti in July", desc: "The migration crosses the Western Corridor in July. What that looks like from the camp." },
  "south-america-destination-guide": { cat: "Destination Guide", title: "The South America Guide", desc: "Six regions beyond the marquee images, and the seasons actually worth booking around." },
  "south-pacific-destination-guide": { cat: "Destination Guide", title: "The South Pacific Guide", desc: "Why the region rewards committing to the distance, and when the long flight is worth making." },
  "the-case-for-shoulder-season": { cat: "Season", title: "The Case for Shoulder Season", desc: "Peak season is the most crowded and most expensive version of any destination on the map." },
  "what-a-travel-advisor-actually-does": { cat: "Planning Advice", title: "What a Travel Advisor Actually Does", desc: "The honest answer, and why the right one pays for itself on a genuinely complicated trip." },
  "what-hotel-descriptions-actually-mean": { cat: "Insider Tips", title: "What Hotel Descriptions Mean", desc: "A translation guide: what the words signal, what they hide, and what to ask before booking." },
  "willamette-valley-winery-route": { cat: "Food &amp; Wine", title: "The Willamette Valley Route", desc: "Dundee Hills, Ribbon Ridge and Eola-Amity — the wineries that made Oregon Pinot worth the trip." },
};

/* file stem → [heading, ...three post slugs] */
const PAGES = {
  // ── destinations: regional hubs ──
  "destinations__africa": ["Read More on Planning Africa", ["africa-destination-guide", "african-safari-calendar", "safari-planning-12-questions"]],
  "destinations__asia": ["Read More on Planning Asia", ["asia-destination-guide", "amanjiwo-field-report", "private-guide-advantage"]],
  "destinations__caribbean-mexico": ["Read More on the Caribbean &amp; Mexico", ["caribbean-mexico-destination-guide", "five-star-problem", "what-hotel-descriptions-actually-mean"]],
  "destinations__europe": ["Read More on Planning Europe", ["europe-destination-guide", "european-grand-tour-mistake", "mediterranean-october"]],
  "destinations__middle-east": ["Read More on the Middle East", ["middle-east-destination-guide", "private-guide-advantage", "the-case-for-shoulder-season"]],
  "destinations__north-america": ["Read More on North America", ["north-america-destination-guide", "masters-field-report", "napa-sonoma-winery-route"]],
  "destinations__polar-regions": ["Read More on Polar Travel", ["polar-destination-guide", "the-case-for-shoulder-season", "what-a-travel-advisor-actually-does"]],
  "destinations__south-america": ["Read More on South America", ["south-america-destination-guide", "private-guide-advantage", "what-a-travel-advisor-actually-does"]],
  "destinations__south-pacific": ["Read More on the South Pacific", ["south-pacific-destination-guide", "five-star-problem", "in-defense-of-slow-travel"]],

  // ── destinations: individual places ──
  "destinations__alaska": ["Read More on Planning Alaska", ["north-america-destination-guide", "in-defense-of-slow-travel", "what-a-travel-advisor-actually-does"]],
  "destinations__antarctica": ["Read More on Antarctica", ["polar-destination-guide", "what-a-travel-advisor-actually-does", "the-case-for-shoulder-season"]],
  "destinations__bali": ["Read More on Planning Bali", ["asia-destination-guide", "amanjiwo-field-report", "in-defense-of-slow-travel"]],
  "destinations__botswana": ["Read More on Planning Botswana", ["botswana-shoulder-season", "african-safari-calendar", "safari-planning-12-questions"]],
  "destinations__canadian-rockies": ["Read More on the Canadian Rockies", ["heli-ski-field-report", "north-america-destination-guide", "the-case-for-shoulder-season"]],
  "destinations__egypt": ["Read More on Planning Egypt", ["middle-east-destination-guide", "private-guide-advantage", "what-a-travel-advisor-actually-does"]],
  "destinations__fiji": ["Read More on Planning Fiji", ["south-pacific-destination-guide", "five-star-problem", "in-defense-of-slow-travel"]],
  "destinations__france": ["Read More on Planning France", ["europe-destination-guide", "european-grand-tour-mistake", "mediterranean-october"]],
  "destinations__french-polynesia": ["Read More on French Polynesia", ["south-pacific-destination-guide", "what-hotel-descriptions-actually-mean", "how-hotel-upgrades-work"]],
  "destinations__galapagos": ["Read More on the Gal&aacute;pagos", ["south-america-destination-guide", "private-guide-advantage", "what-a-travel-advisor-actually-does"]],
  "destinations__greece": ["Read More on Planning Greece", ["mediterranean-october", "europe-destination-guide", "the-case-for-shoulder-season"]],
  "destinations__hawaii": ["Read More on Planning Hawaii", ["north-america-destination-guide", "in-defense-of-slow-travel", "five-star-problem"]],
  "destinations__iceland": ["Read More on Planning Iceland", ["polar-destination-guide", "the-case-for-shoulder-season", "what-a-travel-advisor-actually-does"]],
  "destinations__italy": ["Read More on Planning Italy", ["mediterranean-october", "in-defense-of-slow-travel", "private-guide-advantage"]],
  "destinations__japan": ["Read More on Planning Japan", ["asia-destination-guide", "private-guide-advantage", "in-defense-of-slow-travel"]],
  "destinations__jordan": ["Read More on Planning Jordan", ["middle-east-destination-guide", "private-guide-advantage", "the-case-for-shoulder-season"]],
  "destinations__kenya-tanzania": ["Read More on Kenya &amp; Tanzania", ["singita-grumeti-field-report", "african-safari-calendar", "safari-planning-12-questions"]],
  "destinations__maldives": ["Read More on the Maldives", ["what-hotel-descriptions-actually-mean", "five-star-problem", "asia-destination-guide"]],
  "destinations__napa-sonoma": ["Read More on Napa &amp; Sonoma", ["napa-sonoma-winery-route", "willamette-valley-winery-route", "north-america-destination-guide"]],
  "destinations__new-orleans": ["Read More on New Orleans", ["north-america-destination-guide", "what-a-travel-advisor-actually-does", "private-guide-advantage"]],
  "destinations__new-york": ["Read More on Planning New York", ["north-america-destination-guide", "how-hotel-upgrades-work", "five-star-problem"]],
  "destinations__new-zealand": ["Read More on New Zealand", ["south-pacific-destination-guide", "in-defense-of-slow-travel", "the-case-for-shoulder-season"]],
  "destinations__oman": ["Read More on Planning Oman", ["middle-east-destination-guide", "the-case-for-shoulder-season", "private-guide-advantage"]],
  "destinations__patagonia": ["Read More on Patagonia", ["south-america-destination-guide", "the-case-for-shoulder-season", "what-a-travel-advisor-actually-does"]],
  "destinations__peru": ["Read More on Planning Peru", ["south-america-destination-guide", "private-guide-advantage", "in-defense-of-slow-travel"]],
  "destinations__portugal": ["Read More on Planning Portugal", ["europe-destination-guide", "in-defense-of-slow-travel", "mediterranean-october"]],
  "destinations__riviera-maya-los-cabos": ["Read More on Mexico's Coasts", ["caribbean-mexico-destination-guide", "what-hotel-descriptions-actually-mean", "five-star-problem"]],
  "destinations__rwanda": ["Read More on Planning Rwanda", ["africa-destination-guide", "safari-planning-12-questions", "african-safari-calendar"]],
  "destinations__spain": ["Read More on Planning Spain", ["european-grand-tour-mistake", "mediterranean-october", "europe-destination-guide"]],
  "destinations__st-barths": ["Read More on St. Barth's", ["caribbean-mexico-destination-guide", "five-star-problem", "how-hotel-upgrades-work"]],
  "destinations__thailand": ["Read More on Planning Thailand", ["asia-destination-guide", "in-defense-of-slow-travel", "what-hotel-descriptions-actually-mean"]],
  "destinations__turks-caicos": ["Read More on Turks &amp; Caicos", ["caribbean-mexico-destination-guide", "what-hotel-descriptions-actually-mean", "the-case-for-shoulder-season"]],
  "destinations__uk-ireland": ["Read More on the UK &amp; Ireland", ["europe-destination-guide", "european-grand-tour-mistake", "in-defense-of-slow-travel"]],

  // ── experiences ──
  "experiences__adventure-active-travel": ["Read More on Active Travel", ["heli-ski-field-report", "polar-destination-guide", "south-america-destination-guide"]],
  "experiences__all-inclusive-vacations": ["Read More on All-Inclusive Travel", ["five-star-problem", "what-hotel-descriptions-actually-mean", "caribbean-mexico-destination-guide"]],
  "experiences__beach-island-escapes": ["Read More on Island Travel", ["what-hotel-descriptions-actually-mean", "five-star-problem", "south-pacific-destination-guide"]],
  "experiences__cruises": ["Read More on Travel by Water and Rail", ["polar-destination-guide", "glacier-express-field-report", "what-a-travel-advisor-actually-does"]],
  "experiences__culture-immersive-travel": ["Read More on Travelling with Guides", ["private-guide-advantage", "amanjiwo-field-report", "in-defense-of-slow-travel"]],
  "experiences__family-travel": ["Read More on Family Travel", ["north-america-destination-guide", "in-defense-of-slow-travel", "what-a-travel-advisor-actually-does"]],
  "experiences__food-wine-travel": ["Read More on Food &amp; Wine Travel", ["napa-sonoma-winery-route", "willamette-valley-winery-route", "mediterranean-october"]],
  "experiences__multigenerational-travel": ["Read More on Group Travel", ["what-a-travel-advisor-actually-does", "in-defense-of-slow-travel", "north-america-destination-guide"]],
  "experiences__romance-celebration-travel": ["Read More on Celebration Travel", ["how-hotel-upgrades-work", "five-star-problem", "south-pacific-destination-guide"]],
  "experiences__safari-wildlife-travel": ["Read More on Safari Planning", ["safari-planning-12-questions", "african-safari-calendar", "singita-grumeti-field-report"]],
  "experiences__sports-event-travel": ["Read More on Event Travel", ["masters-field-report", "kentucky-derby-field-report", "north-america-destination-guide"]],
  "experiences__wellness-retreat-travel": ["Read More on Wellness Travel", ["amanjiwo-field-report", "in-defense-of-slow-travel", "asia-destination-guide"]],
};

let changed = 0;

for (const [stem, [heading, slugs]] of Object.entries(PAGES)) {
  const file = path.join(DIR, `${stem}.html`);
  let html = await readFile(file, "utf8");

  /* Class matched as a token, not as the whole attribute — an exact match
     would stop recognising the block the moment it gained a modifier class,
     and this script would then append a duplicate on its next run. */
  if (/class="[^"]*\bread-more\b/.test(html)) {
    console.log(`  skip  ${stem}`);
    continue;
  }

  const cards = slugs.map((slug) => {
    const p = POSTS[slug];
    if (!p) throw new Error(`${stem}: unknown journal slug "${slug}"`);
    return (
      `    <a class="read-more__card" href="/travel-journal/${slug}/">\n` +
      `      <span class="read-more__cat">${p.cat}</span>\n` +
      `      <span class="read-more__name">${p.title}</span>\n` +
      `      <span class="read-more__desc">${p.desc}</span>\n` +
      `      <span class="read-more__cue">Read the post</span>\n` +
      `    </a>\n`
    );
  }).join("");

  const block =
    `\n\n<!-- ══ READ MORE FROM THE JOURNAL (P3-6) ══ -->\n` +
    `<section class="read-more">\n` +
    `  <div class="read-more__header">\n` +
    `    <div class="read-more__label">From the Journal</div>\n` +
    `    <h2 class="read-more__title">${heading}</h2>\n` +
    `  </div>\n` +
    `  <div class="read-more__grid">\n${cards}  </div>\n` +
    `</section>\n`;

  await writeFile(file, html.replace(/\s*$/, "") + block, "utf8");
  changed++;
  console.log(`  ok    ${stem}`);
}

console.log(`\n${changed} destination/experience pages given a Read More block.`);
