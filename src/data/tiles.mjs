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
    { kind: "exp-card", name: "Patagonia", href: "/destinations/patagonia/", status: "live" },
    { kind: "exp-card", name: "Peru &amp; the Andes", href: "/destinations/peru/", status: "live" },
    { kind: "exp-card", name: "New Zealand", href: "/destinations/new-zealand/", status: "live" },
    { kind: "exp-card", name: "Iceland", href: "/destinations/iceland/", status: "live" },
    { kind: "exp-card", name: "Dolomites &amp; Alps", href: "/plan-your-trip/", status: "pending", final: "/destinations/dolomites/" },
    { kind: "exp-card", name: "Costa Rica", href: "/destinations/costa-rica/", status: "live" },
    { kind: "event-card", name: "The Patagonia W Trek", href: "/plan-your-trip/", more: "/destinations/patagonia/#itineraries", moreLabel: "Patagonia in detail" },
    { kind: "event-card", name: "Inca Trail to Machu Picchu", href: "/plan-your-trip/", more: "/destinations/peru/#itineraries", moreLabel: "Peru in detail" },
    { kind: "event-card", name: "Dolomites Hut-to-Hut", href: "/plan-your-trip/" },
    { kind: "event-card", name: "New Zealand South Island Multi-Sport", href: "/plan-your-trip/", more: "/destinations/new-zealand/#itineraries", moreLabel: "New Zealand in detail" },
  ],
  "all-inclusive-vacations": [
    { kind: "exp-card", name: "Mexico", href: "/destinations/riviera-maya-los-cabos/", status: "live" },
    { kind: "exp-card", name: "Jamaica", href: "/destinations/jamaica/", status: "live" },
    { kind: "exp-card", name: "Dominican Republic", href: "/destinations/dominican-republic/", status: "live" },
    { kind: "exp-card", name: "St. Lucia", href: "/destinations/barbados-eastern-caribbean/#places", status: "interim", final: "/destinations/st-lucia/" },
    { kind: "exp-card", name: "Greece", href: "/destinations/greece/", status: "live" },
    { kind: "exp-card", name: "Turks &amp; Caicos", href: "/destinations/turks-caicos/", status: "live" },
    { kind: "event-card", name: "Riviera Maya Adults-Only Resort Week", href: "/plan-your-trip/?type=beach", more: "/destinations/riviera-maya-los-cabos/#places", moreLabel: "The Riviera Maya in detail" },
    { kind: "event-card", name: "Cabo Family Resort Week", href: "/plan-your-trip/?type=beach", more: "/destinations/riviera-maya-los-cabos/#places", moreLabel: "Los Cabos in detail" },
    { kind: "event-card", name: "Jamaica Couples Week", href: "/plan-your-trip/?type=beach", more: "/destinations/jamaica/#places", moreLabel: "Jamaica in detail" },
    { kind: "event-card", name: "St. Lucia with the Pitons", href: "/plan-your-trip/?type=beach", more: "/destinations/barbados-eastern-caribbean/#places", moreLabel: "St. Lucia and the Pitons in detail" },
  ],
  "beach-island-escapes": [
    { kind: "exp-card", name: "Maldives", href: "/destinations/maldives/", status: "live" },
    { kind: "exp-card", name: "Turks &amp; Caicos", href: "/destinations/turks-caicos/", status: "live" },
    { kind: "exp-card", name: "Seychelles", href: "/destinations/seychelles/", status: "live" },
    { kind: "exp-card", name: "St. Barth's", href: "/destinations/st-barths/", status: "live" },
    { kind: "exp-card", name: "Bora Bora &amp; French Polynesia", href: "/destinations/french-polynesia/", status: "live" },
    { kind: "exp-card", name: "St. Lucia", href: "/destinations/barbados-eastern-caribbean/#places", status: "interim", final: "/destinations/st-lucia/" },
    { kind: "event-card", name: "The Maldives Overwater Classic", href: "/plan-your-trip/?type=beach", more: "/destinations/maldives/", moreLabel: "The Maldives in detail" },
    { kind: "event-card", name: "Turks &amp; Caicos Family Week", href: "/plan-your-trip/?type=beach", more: "/destinations/turks-caicos/#places", moreLabel: "Turks &amp; Caicos in detail" },
    { kind: "event-card", name: "Seychelles Island Hop", href: "/plan-your-trip/?type=beach" },
    { kind: "event-card", name: "St. Barth's Villa Stay", href: "/plan-your-trip/?type=beach", more: "/destinations/st-barths/#itineraries", moreLabel: "St. Barth&rsquo;s in detail" },
  ],
  "cruises": [
    { kind: "exp-card", name: "The Mediterranean", href: "/plan-your-trip/", status: "pending", final: "/experiences/cruises/mediterranean-small-ship/" },
    { kind: "exp-card", name: "Alaska", href: "/destinations/alaska/", status: "live" },
    { kind: "exp-card", name: "The Galápagos", href: "/destinations/galapagos/", status: "live" },
    { kind: "exp-card", name: "The European Rivers", href: "/plan-your-trip/", status: "pending", final: "/experiences/cruises/european-river-cruises/" },
    { kind: "exp-card", name: "Antarctica & the Arctic", href: "/destinations/polar-regions/", status: "live" },
    { kind: "exp-card", name: "Private Yacht Charters", href: "/plan-your-trip/", status: "pending", final: "/experiences/cruises/yacht-charters/" },
    { kind: "event-card", name: "The Dalmatian Coast by Small Ship", href: "/plan-your-trip/?type=cruise", more: "/travel-journal/mediterranean-october/", moreLabel: "Read: the Mediterranean in October" },
    { kind: "event-card", name: "Antarctica, Done Properly", href: "/plan-your-trip/?type=cruise", more: "/destinations/antarctica/#itineraries", moreLabel: "Antarctica in detail" },
    { kind: "event-card", name: "The Rhône for Wine People", href: "/plan-your-trip/?type=cruise" },
    { kind: "event-card", name: "A Gulet of Your Own", href: "/plan-your-trip/?type=cruise", more: "/travel-journal/mediterranean-october/", moreLabel: "Read: the Mediterranean in October" },
  ],
  "culture-immersive-travel": [
    { kind: "exp-card", name: "Japan", href: "/destinations/japan/", status: "live" },
    { kind: "exp-card", name: "Italy", href: "/destinations/italy/", status: "live" },
    { kind: "exp-card", name: "Morocco", href: "/destinations/morocco/", status: "live" },
    { kind: "exp-card", name: "Jordan", href: "/destinations/jordan/", status: "live" },
    { kind: "exp-card", name: "Greece &amp; the Aegean", href: "/destinations/greece/", status: "live" },
    { kind: "exp-card", name: "Yucat&aacute;n &amp; M&eacute;rida", href: "/destinations/riviera-maya-los-cabos/#places", status: "live" },
    { kind: "event-card", name: "Japan Cultural Immersion", href: "/plan-your-trip/", more: "/destinations/japan/#itineraries", moreLabel: "Japan in detail" },
    { kind: "event-card", name: "Morocco: Medina to Desert", href: "/plan-your-trip/", more: "/destinations/morocco/#itineraries", moreLabel: "Morocco in detail" },
    { kind: "event-card", name: "Jordan in Depth", href: "/plan-your-trip/", more: "/destinations/jordan/#itineraries", moreLabel: "Jordan in detail" },
    { kind: "event-card", name: "Italy Off the Highlights Route", href: "/plan-your-trip/", more: "/destinations/italy/#itineraries", moreLabel: "Italy in detail" },
  ],
  "family-travel": [
    { kind: "exp-card", name: "Mexico", href: "/destinations/riviera-maya-los-cabos/", status: "live" },
    { kind: "exp-card", name: "Costa Rica", href: "/destinations/costa-rica/", status: "live" },
    { kind: "exp-card", name: "Italy", href: "/destinations/italy/", status: "live" },
    { kind: "exp-card", name: "Hawaii", href: "/destinations/hawaii/", status: "live" },
    { kind: "exp-card", name: "Walt Disney World Resort", href: "/plan-your-trip/", status: "pending", final: "/destinations/orlando/" },
    { kind: "exp-card", name: "Universal Orlando Resort", href: "/plan-your-trip/", status: "pending", final: "/destinations/orlando/#disney-or-universal" },
    { kind: "exp-card", name: "Caribbean", href: "/destinations/caribbean-mexico/#places", status: "live" },
    { kind: "exp-card", name: "Family Safari", href: "/destinations/south-africa/", status: "live" },
    { kind: "event-card", name: "Riviera Maya Family Week", href: "/plan-your-trip/?type=family", more: "/destinations/riviera-maya-los-cabos/#itineraries", moreLabel: "The Riviera Maya in detail" },
    { kind: "event-card", name: "Costa Rica Family Adventure", href: "/plan-your-trip/?type=family" },
    { kind: "event-card", name: "Hawaii Two-Island Family Trip", href: "/plan-your-trip/?type=family", more: "/destinations/hawaii/#itineraries", moreLabel: "Hawaii in detail" },
    { kind: "event-card", name: "Multigenerational Italy", href: "/plan-your-trip/?type=family", more: "/destinations/italy/#itineraries", moreLabel: "Italy in detail" },
  ],
  "food-wine-travel": [
    { kind: "exp-card", name: "Italy", href: "/destinations/italy/", status: "live" },
    { kind: "exp-card", name: "Japan", href: "/destinations/japan/", status: "live" },
    { kind: "exp-card", name: "France", href: "/destinations/france/", status: "live" },
    { kind: "exp-card", name: "Spain", href: "/destinations/spain/", status: "live" },
    { kind: "exp-card", name: "California Wine Country", href: "/destinations/napa-sonoma/", status: "live" },
    { kind: "exp-card", name: "Willamette Valley, Oregon", href: "/travel-journal/willamette-valley-winery-route/", status: "live" },
    { kind: "exp-card", name: "Peru", href: "/destinations/peru/", status: "live" },
    { kind: "exp-card", name: "Argentina", href: "/destinations/argentina/", status: "live" },
    { kind: "exp-card", name: "Barossa &amp; South Australia", href: "/destinations/australia/#places", status: "live" },
    { kind: "event-card", name: "Emilia-Romagna Food Valley", href: "/plan-your-trip/", more: "/destinations/italy/#itineraries", moreLabel: "Italy in detail" },
    { kind: "event-card", name: "Burgundy Wine Deep Dive", href: "/plan-your-trip/", more: "/destinations/france/#itineraries", moreLabel: "France in detail" },
    { kind: "event-card", name: "Japan Food Immersion", href: "/plan-your-trip/", more: "/destinations/japan/#itineraries", moreLabel: "Japan in detail" },
    { kind: "event-card", name: "Basque Country &amp; Rioja", href: "/plan-your-trip/", more: "/destinations/spain/#itineraries", moreLabel: "Spain in detail" },
  ],
  "multigenerational-travel": [
    { kind: "exp-card", name: "Italy", href: "/destinations/italy/", status: "live" },
    { kind: "exp-card", name: "Hawaii", href: "/destinations/hawaii/", status: "live" },
    { kind: "exp-card", name: "Japan", href: "/destinations/japan/", status: "live" },
    { kind: "exp-card", name: "Portugal", href: "/destinations/portugal/", status: "live" },
    { kind: "exp-card", name: "Mexico &amp; Caribbean", href: "/destinations/caribbean-mexico/#itineraries", status: "live" },
    { kind: "exp-card", name: "Greece", href: "/destinations/greece/", status: "live" },
    { kind: "event-card", name: "The Tuscany Villa Week", href: "/plan-your-trip/?type=group", more: "/destinations/italy/#itineraries", moreLabel: "Italy in detail" },
    { kind: "event-card", name: "Japan Across Generations", href: "/plan-your-trip/?type=group", more: "/destinations/japan/#itineraries", moreLabel: "Japan in detail" },
    { kind: "event-card", name: "Portugal Three-Generation", href: "/plan-your-trip/?type=group", more: "/destinations/portugal/#itineraries", moreLabel: "Portugal in detail" },
    { kind: "event-card", name: "Hawaii Multigenerational Island Hop", href: "/plan-your-trip/?type=group", more: "/destinations/hawaii/#itineraries", moreLabel: "Hawaii in detail" },
  ],
  "romance-celebration-travel": [
    { kind: "exp-card", name: "The Maldives", href: "/destinations/maldives/", status: "live" },
    { kind: "exp-card", name: "Santorini & the Aegean", href: "/destinations/greece/", status: "live" },
    { kind: "exp-card", name: "The Amalfi Coast", href: "/destinations/italy/", status: "live" },
    { kind: "exp-card", name: "Bora Bora", href: "/destinations/french-polynesia/", status: "live" },
    { kind: "exp-card", name: "A Safari Honeymoon", href: "/destinations/africa/#safari-honeymoons", status: "live" },
    { kind: "exp-card", name: "Kyoto in Season", href: "/destinations/japan/", status: "live" },
    { kind: "event-card", name: "The Honeymoon, Full Stop", href: "/plan-your-trip/?type=honeymoon" },
    { kind: "event-card", name: "The Anniversary Return", href: "/plan-your-trip/" },
    { kind: "event-card", name: "The Proposal, Choreographed", href: "/plan-your-trip/" },
    { kind: "event-card", name: "The Birthday Worth the Flight", href: "/plan-your-trip/?type=group" },
  ],
  "safari-wildlife-travel": [
    { kind: "exp-card", name: "Botswana", href: "/destinations/botswana/", status: "live" },
    { kind: "exp-card", name: "Kenya", href: "/destinations/kenya-tanzania/", status: "live" },
    { kind: "exp-card", name: "Tanzania", href: "/destinations/kenya-tanzania/", status: "live" },
    { kind: "exp-card", name: "South Africa", href: "/destinations/south-africa/", status: "live" },
    { kind: "exp-card", name: "Rwanda", href: "/destinations/rwanda/", status: "live" },
    { kind: "exp-card", name: "Zambia &amp; Victoria Falls", href: "/destinations/zambia-victoria-falls/", status: "live" },
    { kind: "event-card", name: "The Okavango Classic", href: "/plan-your-trip/?type=safari", more: "/destinations/botswana/#itineraries", moreLabel: "Botswana in detail" },
    { kind: "event-card", name: "The Great Migration", href: "/plan-your-trip/?type=safari", more: "/destinations/kenya-tanzania/#itineraries", moreLabel: "Kenya &amp; Tanzania in detail" },
    { kind: "event-card", name: "Cape Town &amp; Sabi Sand", href: "/plan-your-trip/?type=safari", more: "/destinations/south-africa/#itineraries", moreLabel: "South Africa in detail" },
    { kind: "event-card", name: "Rwanda &amp; the Mountain Gorillas", href: "/plan-your-trip/?type=safari", more: "/destinations/rwanda/#itineraries", moreLabel: "Rwanda in detail" },
  ],
  "sports-event-travel": [
    { kind: "exp-card", name: "Tennis", href: "/plan-your-trip/", status: "pending", final: "/experiences/sports-event-travel/tennis/" },
    { kind: "exp-card", name: "Golf", href: "/plan-your-trip/", status: "pending", final: "/experiences/sports-event-travel/golf/" },
    { kind: "exp-card", name: "Formula 1", href: "/plan-your-trip/", status: "pending", final: "/experiences/sports-event-travel/formula-1/" },
    { kind: "exp-card", name: "Heli-Skiing", href: "/travel-journal/heli-ski-field-report/", status: "live" },
    { kind: "exp-card", name: "Horse Racing", href: "/travel-journal/kentucky-derby-field-report/", status: "live" },
    { kind: "event-card", name: "Wimbledon Championships", href: "/plan-your-trip/" },
    { kind: "event-card", name: "The Masters", href: "/plan-your-trip/", more: "/travel-journal/masters-field-report/", moreLabel: "Read the Masters field report" },
    { kind: "event-card", name: "Monaco Grand Prix", href: "/plan-your-trip/" },
    { kind: "event-card", name: "Heli-Ski Lodge Week", href: "/plan-your-trip/", more: "/travel-journal/heli-ski-field-report/", moreLabel: "Read the heli-ski field report" },
  ],
  "wellness-retreat-travel": [
    { kind: "exp-card", name: "Bali", href: "/destinations/bali/", status: "live" },
    { kind: "exp-card", name: "Sri Lanka", href: "/destinations/sri-lanka/", status: "live" },
    { kind: "exp-card", name: "Japan", href: "/destinations/japan/", status: "live" },
    { kind: "exp-card", name: "Mexico", href: "/destinations/riviera-maya-los-cabos/", status: "live" },
    { kind: "exp-card", name: "Maldives", href: "/destinations/maldives/", status: "live" },
    { kind: "exp-card", name: "Portugal", href: "/destinations/portugal/", status: "live" },
    { kind: "event-card", name: "Ubud Yoga &amp; Healing Retreat", href: "/plan-your-trip/", more: "/destinations/bali/#itineraries", moreLabel: "Bali in detail" },
    { kind: "event-card", name: "Sri Lanka Ayurvedic Immersion", href: "/plan-your-trip/", more: "/destinations/sri-lanka/#places", moreLabel: "Sri Lanka in detail" },
    { kind: "event-card", name: "Japan Onsen &amp; Ryokan Circuit", href: "/plan-your-trip/", more: "/destinations/japan/#places", moreLabel: "Japan&rsquo;s onsen towns in detail" },
    { kind: "event-card", name: "Tulum Jungle Digital Detox", href: "/plan-your-trip/", more: "/destinations/riviera-maya-los-cabos/#places", moreLabel: "Tulum in detail" },
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
