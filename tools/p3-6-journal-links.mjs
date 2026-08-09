/**
 * P3-6 (issue #27), leg 1 of 4 — journal posts become spokes, not terminal nodes.
 *
 * Finding F17: 18 of the 29 journal posts carried zero outbound links to
 * /destinations/ or /experiences/. CONTENT-STANDARDS § 7 requires at least two,
 * with descriptive anchor text. The other 11 posts (the nine destination guides
 * plus the two winery routes) already shipped a "Plan Your Trip" callout and are
 * deliberately untouched here.
 *
 * The copy below is authored per post, not templated — a generic block repeated
 * 18 times would fail the § 2 voice test on its own terms. The script only does
 * the mechanical insertion, immediately before the post's <hr class="post-divider">,
 * which is where the existing callouts already sit.
 *
 *   node tools/p3-6-journal-links.mjs
 *
 * Idempotent: a post already carrying data-p3-6 is skipped.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIR = path.join(ROOT, "src", "content-pages");

/** slug → { label, paras[] }. Anchors describe the destination, never "click here". */
const BLOCKS = {
  "african-safari-calendar": {
    label: "Where the Calendar Applies",
    paras: [
      `The month-by-month logic above resolves differently in each country. <a href="/destinations/botswana/">Botswana safari planning</a> runs on the Okavango flood, which peaks June–August — six months after the rain that caused it. <a href="/destinations/kenya-tanzania/">Kenya and Tanzania</a> run on the migration instead, which makes the river crossings a July–October question rather than a flood one. <a href="/destinations/rwanda/">Rwanda gorilla trekking</a> ignores both and runs on trail conditions.`,
      `The <a href="/experiences/safari-wildlife-travel/">safari and wildlife planning</a> page covers how camp selection interacts with all three calendars, which is the decision that outranks the month in every case.`,
    ],
  },
  "amanjiwo-field-report": {
    label: "Planning Around Borobudur",
    paras: [
      `Amanjiwo sits in Central Java, and most itineraries that reach it pair the temple half with the island next door. <a href="/destinations/bali/">Bali and Indonesia planning</a> covers how the two halves fit together and which order works better in practice.`,
      `If the draw is the temple rather than the pool, <a href="/experiences/culture-immersive-travel/">culture and history travel</a> covers how the guide side of a trip like this gets built.`,
    ],
  },
  "botswana-shoulder-season": {
    label: "Plan a Shoulder-Season Safari",
    paras: [
      `The May and June window described above is a <a href="/destinations/botswana/">Botswana safari planning</a> question first — camp positioning in Moremi and along the Khwai decides most of what the shoulder season actually delivers.`,
      `For how camp size, guide tenure and vehicle policy get evaluated before anything is booked, the <a href="/experiences/safari-wildlife-travel/">safari and wildlife travel</a> page carries the full checklist.`,
    ],
  },
  "european-grand-tour-mistake": {
    label: "The Alternative, Concretely",
    paras: [
      `Two weeks in one country instead of six cities is the entire argument. In practice that usually means <a href="/destinations/italy/">Italy</a> — Rome, Tuscany and one stretch of coast — or <a href="/destinations/france/">France</a>, Paris paired with a single region rather than four.`,
      `<a href="/destinations/spain/">Spain</a> rewards the same structure, and the <a href="/destinations/europe/">Europe destination hub</a> covers which regions pair without adding travel days to the middle of the trip.`,
    ],
  },
  "five-star-problem": {
    label: "Where the Categories Fail Hardest",
    paras: [
      `The rating problem is worst in markets where every property claims the same tier. In <a href="/destinations/maldives/">the Maldives</a> that is effectively the whole market, and the villa category tells you far more than the star count does.`,
      `<a href="/experiences/all-inclusive-vacations/">All-inclusive planning</a> carries the same issue in a different form: what the rate includes varies more between properties than the rating ever suggests.`,
    ],
  },
  "glacier-express-field-report": {
    label: "Fitting the Route Into a Trip",
    paras: [
      `Eight hours of train is a spine, not an itinerary. The route is usually hung off a longer <a href="/destinations/europe/">Europe trip</a>, and the Alpine section pairs cleanly with northern Italy at either end of it.`,
      `For the guiding and access side of a deliberately slow route, see <a href="/experiences/culture-immersive-travel/">culture and history travel</a>.`,
    ],
  },
  "heli-ski-field-report": {
    label: "Planning a Heli Week",
    paras: [
      `British Columbia is the reference standard for this, and the rest of the trip usually gets built out from <a href="/destinations/canadian-rockies/">the Canadian Rockies</a> — the drive-in and fly-in lodges run on completely different logistics and lead times.`,
      `The <a href="/experiences/adventure-active-travel/">adventure and active travel</a> page covers the fitness and skill honesty a heli week demands before anyone books one.`,
    ],
  },
  "how-hotel-upgrades-work": {
    label: "Where This Actually Moves the Needle",
    paras: [
      `Occasion-based requests work when the occasion is real and the property hears about it well ahead of arrival — <a href="/experiences/romance-celebration-travel/">romance and celebration travel</a> covers how those get set up rather than emailed in.`,
      `On <a href="/experiences/beach-island-escapes/">beach and island trips</a>, the room category is the upgrade worth pursuing, because the gap between two categories at the same property is most of the trip.`,
    ],
  },
  "in-defense-of-slow-travel": {
    label: "Destinations That Reward Staying Put",
    paras: [
      `<a href="/destinations/italy/">Tuscany and the rest of Italy</a> is the clearest case: two or three nights in one agriturismo beats six one-night stops, and it costs less to do.`,
      `<a href="/destinations/portugal/">Portugal</a> rewards the same approach at a smaller scale, and <a href="/experiences/culture-immersive-travel/">culture and history travel</a> covers the guide side of staying somewhere long enough to want one twice.`,
    ],
  },
  "kentucky-derby-field-report": {
    label: "Derby Access and the Rest of the Trip",
    paras: [
      `The tier question — which seats, which day, which paddock access — sits on the <a href="/experiences/sports-event-travel/">sports and event travel</a> page alongside the other events that run on the same access logic.`,
      `For what is worth building around Louisville once the race is run, see <a href="/destinations/north-america/">North America destinations</a>.`,
    ],
  },
  "masters-field-report": {
    label: "Building the Week Around Augusta",
    paras: [
      `Badge access, practice-round tickets and the hospitality tiers all sit on the <a href="/experiences/sports-event-travel/">sports and event travel</a> page, which covers the other events that work the same way.`,
      `Augusta is a short drive from several places worth adding nights to — <a href="/destinations/north-america/">North America destinations</a> covers what pairs with a tournament week.`,
    ],
  },
  "mediterranean-october": {
    label: "Where October Is Best Spent",
    paras: [
      `<a href="/destinations/italy/">Italy</a> in October is the harvest argument — olives in Puglia, Sangiovese in Chianti, and the Amalfi Coast finally quiet enough to walk.`,
      `<a href="/destinations/greece/">Greece</a> holds its sea temperature into the month, and <a href="/destinations/spain/">Spain</a> runs its own October harvest across Rioja and Andalusia.`,
    ],
  },
  "private-guide-advantage": {
    label: "Where the Guide Decides the Trip",
    paras: [
      `<a href="/destinations/italy/">Italy</a> is where the gap is widest. An art historian and a general guide standing in the same room in the Sistine Chapel deliver two different days.`,
      `<a href="/destinations/japan/">Japan</a> has the same dynamic for language and access reasons rather than art-historical ones, and <a href="/experiences/culture-immersive-travel/">culture and history travel</a> covers how a guide gets briefed before the day starts.`,
    ],
  },
  "safari-planning-12-questions": {
    label: "Asking These of a Real Itinerary",
    paras: [
      `The twelve questions land differently by country. <a href="/destinations/botswana/">Botswana</a> answers most of them through concession type; <a href="/destinations/kenya-tanzania/">Kenya and Tanzania</a> answer them through where a camp sits against the migration.`,
      `The <a href="/experiences/safari-wildlife-travel/">safari and wildlife travel</a> page is where those answers get turned into an actual camp list.`,
    ],
  },
  "singita-grumeti-field-report": {
    label: "Grumeti in a Wider Itinerary",
    paras: [
      `The Western Corridor is one chapter of a longer route. <a href="/destinations/kenya-tanzania/">Kenya and Tanzania safari planning</a> covers how the Serengeti sections connect across the July–October window.`,
      `For the camp-evaluation questions that separate a private concession from a public one, see <a href="/experiences/safari-wildlife-travel/">safari and wildlife travel</a>.`,
    ],
  },
  "the-case-for-shoulder-season": {
    label: "The Shoulder Windows That Matter Most",
    paras: [
      `<a href="/destinations/italy/">Italy</a> shifts to May–June and September–October, and <a href="/destinations/greece/">Greece</a> holds its sea warmth well into October.`,
      `<a href="/destinations/botswana/">Botswana</a> runs the argument in reverse: its shoulder is May and June, before the flood peaks and before the peak-season rates land.`,
    ],
  },
  "what-a-travel-advisor-actually-does": {
    label: "Where the Work Is Most Visible",
    paras: [
      `The trips where an advisor earns the fee outright are the ones with the most moving parts. <a href="/experiences/safari-wildlife-travel/">Safari planning</a> is the clearest example — camp, concession, charter and season all interact, and getting one wrong moves the others.`,
      `<a href="/experiences/multigenerational-travel/">Multigenerational trips</a> are the other one, for an unrelated reason: the itinerary has to satisfy three sets of expectations at once without being designed around the loudest.`,
    ],
  },
  "what-hotel-descriptions-actually-mean": {
    label: "Where the Wording Costs the Most",
    paras: [
      `Room-category language does the most damage where the categories genuinely differ. In <a href="/destinations/maldives/">the Maldives</a>, "overwater" covers villas at opposite ends of both the price range and the lagoon.`,
      `<a href="/experiences/beach-island-escapes/">Beach and island planning</a> covers the questions worth asking before a category is booked sight unseen.`,
    ],
  },
};

const ANCHOR = '<hr class="post-divider">';
let changed = 0;

for (const [slug, { label, paras }] of Object.entries(BLOCKS)) {
  const file = path.join(DIR, `travel-journal__${slug}.html`);
  let html = await readFile(file, "utf8");

  if (html.includes("data-p3-6")) {
    console.log(`  skip  ${slug} (already has the block)`);
    continue;
  }
  if (!html.includes(ANCHOR)) {
    throw new Error(`${slug}: no ${ANCHOR} to insert before`);
  }

  const block =
    `  <div class="post-callout" data-p3-6>\n` +
    `    <span class="post-callout__label">${label}</span>\n` +
    paras.map((p) => `    <p>${p}</p>\n`).join("") +
    `  </div>\n\n  `;

  html = html.replace(ANCHOR, block + ANCHOR);
  await writeFile(file, html, "utf8");
  changed++;
  console.log(`  ok    ${slug}`);
}

console.log(`\n${changed} journal posts given an outbound destination/experience block.`);
