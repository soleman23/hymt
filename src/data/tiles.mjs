/**
 * The tile map: where every tile on the 12 experience pages leads.
 *
 * Each /experiences/<slug>/ page carries two kinds of tile. The sub-experience
 * grid's `a.exp-card` IS a link, under an "Explore →" arrow that promises a
 * page about its subject. The "Trips We Plan Often" `div.event-card` is an
 * itinerary teaser: its `a.event-cta` button stays on the planning form (with a
 * ?type= prefill where the form supports one) and it may carry one
 * `a.event-more` text link to the page that covers the trip.
 *
 * This file is the single record of those targets. Before it existed they
 * were 126 literal hrefs, all of them /plan-your-trip/, and nothing knew why
 * any tile went where it did — or which destination pages each experience
 * featured, so the reverse links had to be hand-written and 65 of 68
 * destination pages had none.
 *
 *   - tools/tile-links-apply.mjs writes these hrefs into the partials
 *     (--check reports drift without writing).
 *   - DestinationLayout renders a "Featured in" strip from featuredIn(), so a
 *     destination page links back to every experience that features it.
 *   - tools/verify-deployment.mjs checks the built pages against this map
 *     (tile-map-parity), that no card links the form unless it is pending
 *     (exp-card-targets), that every #fragment exists (card-fragment-resolves)
 *     and that every target renders its back-links (featured-in-parity).
 *
 * Plain ESM, not TypeScript, so both Astro and the node tools import it.
 *
 * Rows are per experience slug, in document order: exp-cards, then
 * event-cards. `name` is the card's name exactly as the partial spells it,
 * entities included; the apply tool refuses to write when they differ, so a
 * card renamed in the partial must be renamed here in the same change.
 *
 * exp-card status:
 *   live     href is the subject's canonical page.
 *   interim  href is the best existing page until `final` ships.
 *   pending  href stays on the form until `final` ships; the only state in
 *            which an exp-card may link /plan-your-trip/.
 * event-card: `href` is the CTA's target; `more`/`moreLabel` the optional
 * secondary link.
 *
 * Decisions and reasons: docs/plans/tile-detail-pages/ on branch
 * plan/tile-detail-pages (the tile-to-page matrix and routing rules).
 */

/** The experience pages' own names, as their wrappers pass `name`. */
export const EXPERIENCES = {
  "adventure-active-travel": "Adventure &amp; Active Travel",
  "all-inclusive-vacations": "All-Inclusive Vacations",
  "beach-island-escapes": "Beach &amp; Island Escapes",
  "cruises": "Cruises &amp; Yachts",
  "culture-immersive-travel": "Culture &amp; Immersive Travel",
  "family-travel": "Family Travel",
  "food-wine-travel": "Food &amp; Wine Travel",
  "multigenerational-travel": "Multigenerational Travel",
  "romance-celebration-travel": "Romance &amp; Celebration",
  "safari-wildlife-travel": "Safari &amp; Wildlife",
  "sports-event-travel": "Sports &amp; Event Travel",
  "wellness-retreat-travel": "Wellness &amp; Retreat Travel",
};

export const TILES = {
  "adventure-active-travel": [
    { kind: "exp-card", name: "Patagonia", href: "/plan-your-trip/", status: "pending", final: "/destinations/patagonia/" },
    { kind: "exp-card", name: "Peru &amp; the Andes", href: "/plan-your-trip/", status: "pending", final: "/destinations/peru/" },
    { kind: "exp-card", name: "New Zealand", href: "/plan-your-trip/", status: "pending", final: "/destinations/new-zealand/" },
    { kind: "exp-card", name: "Iceland", href: "/plan-your-trip/", status: "pending", final: "/destinations/iceland/" },
    { kind: "exp-card", name: "Dolomites &amp; Alps", href: "/plan-your-trip/", status: "pending", final: "/destinations/dolomites/" },
    { kind: "exp-card", name: "Costa Rica", href: "/plan-your-trip/", status: "pending", final: "/destinations/costa-rica/" },
    { kind: "event-card", name: "The Patagonia W Trek", href: "/plan-your-trip/" },
    { kind: "event-card", name: "Inca Trail to Machu Picchu", href: "/plan-your-trip/" },
    { kind: "event-card", name: "Dolomites Hut-to-Hut", href: "/plan-your-trip/" },
    { kind: "event-card", name: "New Zealand South Island Multi-Sport", href: "/plan-your-trip/" },
  ],
  "all-inclusive-vacations": [
    { kind: "exp-card", name: "Mexico", href: "/plan-your-trip/", status: "pending", final: "/destinations/riviera-maya-los-cabos/" },
    { kind: "exp-card", name: "Jamaica", href: "/plan-your-trip/", status: "pending", final: "/destinations/jamaica/" },
    { kind: "exp-card", name: "Dominican Republic", href: "/plan-your-trip/", status: "pending", final: "/destinations/dominican-republic/" },
    { kind: "exp-card", name: "St. Lucia", href: "/plan-your-trip/", status: "pending", final: "/destinations/st-lucia/" },
    { kind: "exp-card", name: "Greece &amp; Mediterranean", href: "/plan-your-trip/", status: "pending", final: "/destinations/greece/" },
    { kind: "exp-card", name: "Turks &amp; Caicos", href: "/plan-your-trip/", status: "pending", final: "/destinations/turks-caicos/" },
    { kind: "event-card", name: "Riviera Maya Adults Escape", href: "/plan-your-trip/" },
    { kind: "event-card", name: "Cabo Family Resort Week", href: "/plan-your-trip/" },
    { kind: "event-card", name: "Jamaica Couples Week", href: "/plan-your-trip/" },
    { kind: "event-card", name: "St. Lucia with the Pitons", href: "/plan-your-trip/" },
  ],
  "beach-island-escapes": [
    { kind: "exp-card", name: "Maldives", href: "/plan-your-trip/", status: "pending", final: "/destinations/maldives/" },
    { kind: "exp-card", name: "Turks &amp; Caicos", href: "/plan-your-trip/", status: "pending", final: "/destinations/turks-caicos/" },
    { kind: "exp-card", name: "Seychelles", href: "/plan-your-trip/", status: "pending", final: "/destinations/seychelles/" },
    { kind: "exp-card", name: "St. Barth's", href: "/plan-your-trip/", status: "pending", final: "/destinations/st-barths/" },
    { kind: "exp-card", name: "Bora Bora &amp; French Polynesia", href: "/plan-your-trip/", status: "pending", final: "/destinations/french-polynesia/" },
    { kind: "exp-card", name: "St. Lucia &amp; Anguilla", href: "/plan-your-trip/", status: "pending", final: "/destinations/st-lucia/" },
    { kind: "event-card", name: "The Maldives Overwater Classic", href: "/plan-your-trip/" },
    { kind: "event-card", name: "Turks &amp; Caicos Family Week", href: "/plan-your-trip/" },
    { kind: "event-card", name: "Seychelles Island Hop", href: "/plan-your-trip/" },
    { kind: "event-card", name: "St. Barth's Villa Stay", href: "/plan-your-trip/" },
  ],
  "cruises": [
    { kind: "exp-card", name: "The Mediterranean", href: "/plan-your-trip/", status: "pending", final: "/experiences/cruises/mediterranean-small-ship/" },
    { kind: "exp-card", name: "Alaska", href: "/plan-your-trip/", status: "pending", final: "/destinations/alaska/" },
    { kind: "exp-card", name: "The Galápagos", href: "/plan-your-trip/", status: "pending", final: "/destinations/galapagos/" },
    { kind: "exp-card", name: "The European Rivers", href: "/plan-your-trip/", status: "pending", final: "/experiences/cruises/european-river-cruises/" },
    { kind: "exp-card", name: "Antarctica & the Arctic", href: "/plan-your-trip/", status: "pending", final: "/destinations/polar-regions/" },
    { kind: "exp-card", name: "Private Yacht Charters", href: "/plan-your-trip/", status: "pending", final: "/experiences/cruises/yacht-charters/" },
    { kind: "event-card", name: "The Dalmatian Coast by Small Ship", href: "/plan-your-trip/" },
    { kind: "event-card", name: "Antarctica, Done Properly", href: "/plan-your-trip/" },
    { kind: "event-card", name: "The Rhône for Wine People", href: "/plan-your-trip/" },
    { kind: "event-card", name: "A Gulet of Your Own", href: "/plan-your-trip/" },
  ],
  "culture-immersive-travel": [
    { kind: "exp-card", name: "Japan", href: "/plan-your-trip/", status: "pending", final: "/destinations/japan/" },
    { kind: "exp-card", name: "Italy", href: "/plan-your-trip/", status: "pending", final: "/destinations/italy/" },
    { kind: "exp-card", name: "Morocco", href: "/plan-your-trip/", status: "pending", final: "/destinations/morocco/" },
    { kind: "exp-card", name: "Jordan &amp; the Levant", href: "/plan-your-trip/", status: "pending", final: "/destinations/jordan/" },
    { kind: "exp-card", name: "Greece &amp; the Aegean", href: "/plan-your-trip/", status: "pending", final: "/destinations/greece/" },
    { kind: "exp-card", name: "Mexico", href: "/plan-your-trip/", status: "pending", final: "/destinations/riviera-maya-los-cabos/#places" },
    { kind: "event-card", name: "Japan Cultural Immersion", href: "/plan-your-trip/" },
    { kind: "event-card", name: "Morocco: Medina to Desert", href: "/plan-your-trip/" },
    { kind: "event-card", name: "Jordan in Depth", href: "/plan-your-trip/" },
    { kind: "event-card", name: "Italy Off the Highlights Route", href: "/plan-your-trip/" },
  ],
  "family-travel": [
    { kind: "exp-card", name: "Mexico", href: "/plan-your-trip/", status: "pending", final: "/destinations/riviera-maya-los-cabos/" },
    { kind: "exp-card", name: "Costa Rica", href: "/plan-your-trip/", status: "pending", final: "/destinations/costa-rica/" },
    { kind: "exp-card", name: "Italy &amp; Europe", href: "/plan-your-trip/", status: "pending", final: "/destinations/italy/" },
    { kind: "exp-card", name: "Hawaii", href: "/plan-your-trip/", status: "pending", final: "/destinations/hawaii/" },
    { kind: "exp-card", name: "Walt Disney World Resort", href: "/plan-your-trip/", status: "pending", final: "/destinations/orlando/" },
    { kind: "exp-card", name: "Disneyland Resort", href: "/plan-your-trip/", status: "pending", final: "/experiences/family-travel/" },
    { kind: "exp-card", name: "Universal Orlando Resort", href: "/plan-your-trip/", status: "pending", final: "/destinations/orlando/#disney-or-universal" },
    { kind: "exp-card", name: "Caribbean", href: "/plan-your-trip/", status: "pending", final: "/destinations/caribbean-mexico/" },
    { kind: "exp-card", name: "Family Safari", href: "/plan-your-trip/", status: "pending", final: "/destinations/south-africa/" },
    { kind: "event-card", name: "Riviera Maya Family Week", href: "/plan-your-trip/" },
    { kind: "event-card", name: "Costa Rica Family Adventure", href: "/plan-your-trip/" },
    { kind: "event-card", name: "Hawaii Two-Island Family Trip", href: "/plan-your-trip/" },
    { kind: "event-card", name: "Multigenerational Italy", href: "/plan-your-trip/" },
  ],
  "food-wine-travel": [
    { kind: "exp-card", name: "Italy", href: "/plan-your-trip/", status: "pending", final: "/destinations/italy/" },
    { kind: "exp-card", name: "Japan", href: "/plan-your-trip/", status: "pending", final: "/destinations/japan/" },
    { kind: "exp-card", name: "France", href: "/plan-your-trip/", status: "pending", final: "/destinations/france/" },
    { kind: "exp-card", name: "Spain", href: "/plan-your-trip/", status: "pending", final: "/destinations/spain/" },
    { kind: "exp-card", name: "California Wine Country", href: "/plan-your-trip/", status: "pending", final: "/destinations/napa-sonoma/" },
    { kind: "exp-card", name: "Willamette Valley, Oregon", href: "/plan-your-trip/", status: "pending", final: "/travel-journal/willamette-valley-winery-route/" },
    { kind: "exp-card", name: "Peru", href: "/plan-your-trip/", status: "pending", final: "/destinations/peru/" },
    { kind: "exp-card", name: "Argentina", href: "/plan-your-trip/", status: "pending", final: "/destinations/argentina/" },
    { kind: "exp-card", name: "Australia", href: "/plan-your-trip/", status: "pending", final: "/destinations/australia/" },
    { kind: "event-card", name: "Emilia-Romagna Food Valley", href: "/plan-your-trip/" },
    { kind: "event-card", name: "Burgundy Wine Deep Dive", href: "/plan-your-trip/" },
    { kind: "event-card", name: "Japan Food Immersion", href: "/plan-your-trip/" },
    { kind: "event-card", name: "Basque Country &amp; Rioja", href: "/plan-your-trip/" },
  ],
  "multigenerational-travel": [
    { kind: "exp-card", name: "Italy", href: "/plan-your-trip/", status: "pending", final: "/destinations/italy/" },
    { kind: "exp-card", name: "Hawaii", href: "/plan-your-trip/", status: "pending", final: "/destinations/hawaii/" },
    { kind: "exp-card", name: "Japan", href: "/plan-your-trip/", status: "pending", final: "/destinations/japan/" },
    { kind: "exp-card", name: "Portugal", href: "/plan-your-trip/", status: "pending", final: "/destinations/portugal/" },
    { kind: "exp-card", name: "Mexico &amp; Caribbean", href: "/plan-your-trip/", status: "pending", final: "/destinations/caribbean-mexico/#itineraries" },
    { kind: "exp-card", name: "Greece", href: "/plan-your-trip/", status: "pending", final: "/destinations/greece/" },
    { kind: "event-card", name: "The Tuscany Villa Week", href: "/plan-your-trip/" },
    { kind: "event-card", name: "Japan Across Generations", href: "/plan-your-trip/" },
    { kind: "event-card", name: "Portugal Three-Generation", href: "/plan-your-trip/" },
    { kind: "event-card", name: "Hawaii Multigenerational Island Hop", href: "/plan-your-trip/" },
  ],
  "romance-celebration-travel": [
    { kind: "exp-card", name: "The Maldives", href: "/plan-your-trip/", status: "pending", final: "/destinations/maldives/" },
    { kind: "exp-card", name: "Santorini & the Aegean", href: "/plan-your-trip/", status: "pending", final: "/destinations/greece/" },
    { kind: "exp-card", name: "The Amalfi Coast", href: "/plan-your-trip/", status: "pending", final: "/destinations/italy/" },
    { kind: "exp-card", name: "Bora Bora", href: "/plan-your-trip/", status: "pending", final: "/destinations/french-polynesia/" },
    { kind: "exp-card", name: "A Safari Honeymoon", href: "/plan-your-trip/", status: "pending", final: "/destinations/africa/" },
    { kind: "exp-card", name: "Kyoto in Season", href: "/plan-your-trip/", status: "pending", final: "/destinations/japan/" },
    { kind: "event-card", name: "The Honeymoon, Full Stop", href: "/plan-your-trip/" },
    { kind: "event-card", name: "The Anniversary Return", href: "/plan-your-trip/" },
    { kind: "event-card", name: "The Proposal, Choreographed", href: "/plan-your-trip/" },
    { kind: "event-card", name: "The Birthday Worth the Flight", href: "/plan-your-trip/" },
  ],
  "safari-wildlife-travel": [
    { kind: "exp-card", name: "Botswana", href: "/plan-your-trip/", status: "pending", final: "/destinations/botswana/" },
    { kind: "exp-card", name: "Kenya", href: "/plan-your-trip/", status: "pending", final: "/destinations/kenya-tanzania/" },
    { kind: "exp-card", name: "Tanzania", href: "/plan-your-trip/", status: "pending", final: "/destinations/kenya-tanzania/" },
    { kind: "exp-card", name: "South Africa", href: "/plan-your-trip/", status: "pending", final: "/destinations/south-africa/" },
    { kind: "exp-card", name: "Rwanda", href: "/plan-your-trip/", status: "pending", final: "/destinations/rwanda/" },
    { kind: "exp-card", name: "Namibia", href: "/plan-your-trip/", status: "pending", final: "/destinations/zambia-victoria-falls/" },
    { kind: "event-card", name: "The Okavango Classic", href: "/plan-your-trip/" },
    { kind: "event-card", name: "The Great Migration", href: "/plan-your-trip/" },
    { kind: "event-card", name: "Cape Town &amp; Sabi Sand", href: "/plan-your-trip/" },
    { kind: "event-card", name: "Rwanda &amp; the Mountain Gorillas", href: "/plan-your-trip/" },
  ],
  "sports-event-travel": [
    { kind: "exp-card", name: "Tennis", href: "/plan-your-trip/", status: "pending", final: "/experiences/sports-event-travel/tennis/" },
    { kind: "exp-card", name: "Golf", href: "/plan-your-trip/", status: "pending", final: "/experiences/sports-event-travel/golf/" },
    { kind: "exp-card", name: "Formula 1", href: "/plan-your-trip/", status: "pending", final: "/experiences/sports-event-travel/formula-1/" },
    { kind: "exp-card", name: "Skiing &amp; Heli-Skiing", href: "/plan-your-trip/", status: "pending", final: "/travel-journal/heli-ski-field-report/" },
    { kind: "exp-card", name: "Football &amp; Rugby", href: "/plan-your-trip/", status: "pending", final: "/experiences/sports-event-travel/" },
    { kind: "exp-card", name: "Horse Racing", href: "/plan-your-trip/", status: "pending", final: "/travel-journal/kentucky-derby-field-report/" },
    { kind: "event-card", name: "Wimbledon Championships", href: "/plan-your-trip/" },
    { kind: "event-card", name: "The Masters", href: "/plan-your-trip/" },
    { kind: "event-card", name: "Monaco Grand Prix", href: "/plan-your-trip/" },
    { kind: "event-card", name: "Alpine Ski Season", href: "/plan-your-trip/" },
  ],
  "wellness-retreat-travel": [
    { kind: "exp-card", name: "Bali", href: "/plan-your-trip/", status: "pending", final: "/destinations/bali/" },
    { kind: "exp-card", name: "Sri Lanka", href: "/plan-your-trip/", status: "pending", final: "/destinations/sri-lanka/" },
    { kind: "exp-card", name: "Japan", href: "/plan-your-trip/", status: "pending", final: "/destinations/japan/" },
    { kind: "exp-card", name: "Mexico", href: "/plan-your-trip/", status: "pending", final: "/destinations/riviera-maya-los-cabos/" },
    { kind: "exp-card", name: "Arizona &amp; Southwest", href: "/plan-your-trip/", status: "pending", final: "/destinations/maldives/" },
    { kind: "exp-card", name: "Portugal &amp; Southern Europe", href: "/plan-your-trip/", status: "pending", final: "/destinations/portugal/" },
    { kind: "event-card", name: "Ubud Yoga &amp; Healing Retreat", href: "/plan-your-trip/" },
    { kind: "event-card", name: "Sri Lanka Ayurvedic Immersion", href: "/plan-your-trip/" },
    { kind: "event-card", name: "Japan Onsen &amp; Ryokan Circuit", href: "/plan-your-trip/" },
    { kind: "event-card", name: "Tulum Jungle Digital Detox", href: "/plan-your-trip/" },
  ],
};

/** A same-site href reduced to the page it lands on: no query, no fragment. */
export const pagePath = (href) => String(href).split("#")[0].split("?")[0];

/**
 * The experience pages whose sub-experience tiles land on `pathname`, in the
 * order of EXPERIENCES. Live and interim tiles count; pending ones do not,
 * because they still link the form. Event-card secondary links are not
 * counted: the strip says which trip types feature this place, and an
 * itinerary teaser is not one.
 */
export function featuredIn(pathname) {
  const want = pagePath(pathname);
  return Object.keys(EXPERIENCES).filter((slug) =>
    (TILES[slug] ?? []).some((t) => t.kind === "exp-card" && t.status !== "pending" && pagePath(t.href) === want));
}

/**
 * The "Featured in" strip as HTML, or "" when no tile lands on the page — so a
 * page nothing features renders exactly as it did before this existed.
 * Styled by .featured-in in destination.css, reusing the .related-more link
 * treatment. bodyWords() in tools/content-checks.mjs strips the section, so it
 * never counts against a country page's 3,500-word ceiling.
 */
export function featuredInHtml(pathname) {
  const slugs = featuredIn(pathname);
  if (!slugs.length) return "";
  const links = slugs
    .map((s) => `<a class="related-more__link" href="/experiences/${s}/">${EXPERIENCES[s]}</a>`)
    .join("\n    ");
  return `<section class="featured-in">
  <div class="related-more">
    <span class="related-more__label">Featured in our trip types:</span>
    ${links}
  </div>
</section>
`;
}
