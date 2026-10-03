# Draft: routing rules, data model, template, linking, roadmap, QA

## 5. Routing and reuse decision rules

Apply in order; the first rule that fits decides. Every rule names the single canonical URL a tile links to. No tile may link to `/plan-your-trip/`, to a query-string variant of any page, or to a page that exists only to receive the tile.

R1. Exact destination match. The tile names a place that has its own `/destinations/<slug>/` page and the tile's copy (region, description, tags) is served by that page's intro, places grid, itineraries or FAQ at fit ≥2 → REUSE, unchanged. Example: Maldives → `/destinations/maldives/`.

R2. Destination under several experiences. One canonical URL for the subject, regardless of how many experience pages feature it. The experience side carries the intent in the tile copy and anchor text; the destination side carries one "Featured in" strip listing every experience that links to it (derived from the tile map, never referrer-dependent), and, where the audit found a specific gap, one targeted enhancement (a FAQ item or a rewritten place-card), never a per-experience section. Breadcrumbs stay Home › Destinations › Region › Name. Example: Maldives from Beach & Island Escapes and from Romance & Celebration → the same `/destinations/maldives/`.

R3. Combined destination tiles ("A & B").
  a. The pair is one established product and one page covers both (Bora Bora & French Polynesia) → REUSE that page; keep the label.
  b. One half is the subject and the other is a modifier or region ("Peru & the Andes", "Jordan & the Levant", "Italy & Europe", "Portugal & Southern Europe", "Mexico & Caribbean") → REUSE the subject's page and RENAME the tile to the page's subject if the modifier promises something the page does not deliver; otherwise keep the label.
  c. Both halves are real, separately booked places and only one has coverage ("St. Lucia & Anguilla") → link to the page that covers the stronger half (here the Eastern Caribbean page's St. Lucia material) and add the missing half as a place-card on that page (REUSE + ENHANCE), or SPLIT the tile when the grid can take a seventh card without breaking the 3-column layout (it cannot on a six-card grid without adding two more cards or reflowing). Create a COMBINATION page only when the pairing itself is sold and researched as one itinerary and no existing page covers either half.

R4. Regional tile with an existing hub. If the tile's intent is "pick somewhere in this region for this trip type" and the hub's places grid already lists the relevant children → REUSE the hub (Caribbean → `/destinations/caribbean-mexico/`; Antarctica & the Arctic → `/destinations/polar-regions/`). If the tile's intent is a format rather than a region (river cruising, Mediterranean small-ship cruising) the hub is the wrong answer: see R5.

R5. Thematic tile (a sport, a cruise format, a charter format). Prefer an existing page that already answers the intent commercially: a destination page where the theme is that destination's core (Galápagos, Alaska for cruises), or an existing experience page. A journal post is a supporting link, not a tile target: posts are informational, dated, and carry no planning CTA pattern. When nothing commercial exists and the subject has distinct search demand → CREATE EXPERIENCE DETAIL PAGE under the parent experience: `/experiences/<parent>/<slug>/` on ExperienceLayout with a parent crumb (§ 11). Group sports into one page per sport, not one per event.

R6. Destination + travel style ("Family Safari", "A Safari Honeymoon", "Kyoto in Season", "Wellness: Japan"). The destination or the sibling experience page is canonical; the style is carried by the tile copy and by one targeted enhancement on the target (a "who it's for" paragraph or a FAQ answer). Never create a `/destinations/<place>-<style>/` page: it duplicates the destination page's subject and competes with the experience page's style.

R7. Major attraction or resort tiles (Walt Disney World, Disneyland, Universal Orlando). These are places with their own search demand and no page. One page serving all three under Family Travel, with stable anchors per resort, beats three thin pages; a `/destinations/orlando/` page is the alternative if the owner wants Orlando to sit in the North America hub. Owner decision (§ 18).

R8. Tile broader or narrower than the existing page. Link to the page whose subject matches the tile's primary noun and whose body serves the intent, then rename the tile to match the page's scope if the label would otherwise over-promise ("Italy & Europe" → Italy). A tile narrower than the page (Santorini & the Aegean → Greece; The Amalfi Coast → Italy) links to the page and uses a deep link only when a stable, meaningful section exists (`#places` on every destination page is the one safe anchor today).

R9. Deep links. Use `#places` (destination grid) or a new stable id only when the landing section answers the tile on its own. Never invent ids for one tile; an id added for this project must also be used by the "Featured in" strip or a hub so it has two consumers.

R10. Competing pages. Before any CREATE, grep `src/content-pages/` for the subject; if an existing page scores fit ≥2, enhance it instead. Two proposed new pages may not share a primary subject. A new experience-detail page may not restate its parent page's intro; it goes one level more specific (events, venues, formats, calendars, costs).

## 6–7 (shapes only; lists come from the matrix)

## 11. Recommended template and data architecture

### Template
- Existing destination pages: DestinationLayout, unchanged for routing; one additive, optional module (below).
- New thematic pages: ExperienceLayout with one new optional prop, `parent?: { label: string; href: string }`, mirroring DestinationLayout's `region`. With the prop, the trail becomes Home › Experiences › Sports & Event Travel › Formula 1 and the BreadcrumbList follows automatically because both render from the same `trail` array. Without the prop the output is byte-identical to today (verify by building and diffing `dist/`). The verifier's TEMPLATED rule already requires ExperienceLayout for every page under `src/pages/experiences/`, so nested routes satisfy it without a verifier change. `schema-required` keys on the `/experiences/` prefix, so Service + WebPage + BreadcrumbList + FAQPage are emitted and required. `sectionCount` is depth-1, so llms.txt's "12 trip types" stays true and the `/experiences/` ItemList stays at 12.
- Rejected: a new ExperienceDetailLayout (duplicates ~120 lines and a stylesheet for a breadcrumb difference, and would need its own TEMPLATED entry); DestinationLayout for thematic pages (wrong schema type, wrong hub, requires the stat rail); JournalLayout (Article schema and dated byline for an evergreen commercial page); flat `/experiences/formula-1-travel/` (joins the 12-item hub ItemList, breaks the llms.txt count, loses the parent crumb).
- Section mix for a thematic detail page, reusing existing classes only: intro-section with answer capsule → exp-cards-section (the events or venues, each card linking to a destination page or an authority) → events-section ("Trips We Plan Often") → inclusions-section → seasons-strip (the calendar) → exp-cta → cost-range (data row in cost-ranges-data.mjs) → page-faq → read-more (≥2 journal links). No new CSS classes; `experience.css` already styles every one.

### Data model (recommended: option D, "map now, component later")
- `src/data/tile-map.json`: the single source of truth for tile → target. One record per tile:
  `{ "id": "beach-island-escapes/1", "page": "beach-island-escapes", "kind": "exp-card", "index": 1, "label": "Maldives", "subject": "maldives", "target": "/destinations/maldives/", "anchor": "", "targetType": "destination", "status": "existing", "relatedExperiences": ["romance-celebration-travel"], "cta": "Explore", "intent": "overwater villas, house reef, Nov–Apr", "region": "Indian Ocean", "image": "/assets/img/e-39-maldives-atoll-overhead.jpg", "alt": "…", "implementation": "planned" }`
  Event-cards get records too (`kind: "event-card"`, `target: "/plan-your-trip/?type=beach"` or a destination URL) so the exception is explicit and checkable.
- `src/lib/tiles.ts`: typed accessors — `tilesFor(page)`, `featuredIn(destinationSlug)` (reverse index: every experience page whose map records target that destination), `targetsOf(subject)`.
- `tools/apply-tile-links.mjs`: idempotent, like `p3-8-cost-insert.mjs`. Reads the map, finds each `.exp-card` / `.event-cta` by page + index, rewrites `href` (and `anchor`), prints a diff summary, exits non-zero on any card the map does not describe. The hand-written card HTML stays in the partials; only the attribute is generated.
- `src/components/FeaturedIn.astro`: rendered by DestinationLayout from `featuredIn(slug)`; emits nothing when the list is empty, so the 68 pages render byte-identical until a map record names them. Placement: DestinationLayout splits `bodyHtml` at a marker `<!-- featured-in -->` placed in each targeted partial directly above `<section class="related-section"`, and renders `<FeaturedIn>` between the halves; with no marker the component is appended before `read-more`. Copy budget ≤40 words so the 62-word-headroom pages stay under the ceiling. Markup: a `.featured-in` strip with the label "Featured in" and one `<a>` chip per experience ("Beach & Island Escapes", "Romance & Celebration Travel"), styled in `section-shared.css` from the `.related-more` tokens. Reverse links are therefore derived, not hand-maintained, and cannot rot.
- Verifier: `tile-links` check in `tools/verify-deployment.mjs` with fixtures in `tools/verify-checks.test.mjs` proving each goes red: (1) an `.exp-card` href of `/plan-your-trip/` fails unless its map record carries `"exception": true` with a reason; (2) every tile href resolves in `dist/` (`linkResolves`, anchor stripped) and, when an anchor is given, the id exists in the target page; (3) the built href equals the map's target (map ↔ partial parity); (4) every destination targeted by a map record renders a `.featured-in` link back to that experience page; (5) the map has no two records for one page+index and no record for a page+index that does not exist.
- Why not a component that renders the cards now (option C): 78 cards of hand-tuned copy and the `--photo` gate live in the partials; moving them into data touches all 12 pages' HTML, the intake tool and the photo-grid check at once for no visitor-visible gain. Phase it after the map has settled.
- Why not leave hrefs hardcoded (option A): the reverse relationship then has to be hand-written on ~40 destination pages and has no check; that is the current state, where 3 of 68 pages link to an experience.

## 13. Internal-linking and breadcrumb strategy
- Forward: tile → canonical page (map). Intro, seasons and FAQ copy that names a tile subject links it with descriptive anchor text ("overwater villas in the Maldives"), never "Explore →".
- Reverse: FeaturedIn strip on every targeted destination page; new detail pages link up to their parent experience page in the breadcrumb AND in body copy, and sideways to the 2–4 destination pages they lean on.
- Journal: unchanged floor (≥2 journal links per destination/experience page; ≥2 destination/experience links per post). New detail pages pick their read-more posts from the registry (masters-field-report, kentucky-derby-field-report, heli-ski-field-report, maldives-overwater-vs-beach-villa, kyoto-april-vs-november, mediterranean-october, etc.).
- Breadcrumbs never vary by referrer. A visitor from Romance landing on Maldives sees Home › Destinations › Asia › The Maldives, and the FeaturedIn strip gives the way back to Romance.
- Hubs: `/experiences/` card tags should name the subjects the page's tiles actually carry (audit found drift, e.g. the Wellness card names Switzerland and Thailand, which are not tiles). Footer unchanged.

## 16. Phased roadmap (shape; file lists in § 15)
A Inventory and approvals → B Architecture (map, accessors, FeaturedIn, apply tool, verifier + fixtures, ExperienceLayout parent prop) → C Reuse (run apply tool; enhance targeted destination pages; hub tag fixes) → D Create (approved new pages) → E Content and media → F QA and launch. Each phase is its own PR; A and B can run in parallel; C ships before D so the site is never half-linked; D pages ship one PR each with their images.

## 17. QA and acceptance (checkable)
- `node tools/verify-deployment.mjs` green with the new `tile-links` check; `tools/verify-checks.test.mjs` has a red fixture per sub-check.
- `grep -c 'class="exp-card" href="/plan-your-trip/"' src/content-pages/experiences__*.html` → 0 on every file.
- `node tools/apply-tile-links.mjs --check` reports zero drift between map and partials.
- Every map target resolves in dist (`linkResolves`), every anchor id exists.
- `git diff --stat dist/` after the ExperienceLayout and DestinationLayout changes with no page opted in: empty.
- New pages: in `dist/sitemap-0.xml`, in `tools/head-baseline.json`, with an og-crop, hero preload, ≥2 journal links, FAQ 6–10, answer capsule 40–70 words with a number, title 30–65, description 110–165, Service schema, parent crumb rendered and in BreadcrumbList.
- Responsive: 375, 768, 1280 px screenshots of one changed experience page, one FeaturedIn destination page, one new detail page; keyboard tab order through the tiles and the FeaturedIn chips; FAQ visible with JS off.
- `npm run verify:prod` green ~10 minutes after each merge.
