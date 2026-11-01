# Editorial review: Europe hub as a trip-choice gateway

Prepared with `EDITORIAL-REVIEW-TEMPLATE.md`, November 1, 2026, for #214.
**Decision: review required.** Nothing below is approved until the owner
records approval on the PR. An empty row or `review required` is not approval.

## Page decision

| Field | Entry |
| --- | --- |
| Page and source | `/destinations/europe/`; `src/content-pages/destinations__europe.html` |
| Editorial owner / expert reviewer | Mark Sole |
| Writer / researcher | Claude Code; independent research and existing-page refresh |
| Review date | Pending |
| Decision | Review required |
| Published-date evidence | Existing URL; no new page |
| Next review | Release +30/+90 days; ETIAS line on any EU start-date announcement |
| Earlier trigger | ETIAS start date, UK ETA fee change, correction request |

## Traveler decision and URL role

The hub answers one question: **which kind of Europe trip fits me, and which
country page do I read next?** Title, description, canonical and URL are
unchanged. Country detail (regions, costs, sample itineraries) stays on the
six country pages; the hub sends the reader there instead of repeating it,
following the #217 South Pacific pattern and reusing its `route-choice`
component (no new CSS).

## What changed and why

- New 57-word answer capsule and intro under "Start With the Trip, Not the Map".
- New "Choose Your Europe Trip" section (`#choose-your-trip`), placed before the
  destination cards: first trip, food and wine, art/history/culture, rail,
  family/multigenerational, season-led. Each card gives child destinations,
  pace and length, best fit, tradeoff, and a journal or experience link to
  read next. The hero's secondary CTA now points to it.
- **Removed "Trips We Plan Often"** — four itineraries described as "refined
  over many clients" with unverifiable specifics: a Chianti villa stay with a
  "sixth-generation Parmigiano producer" (Parmigiano is made in
  Emilia-Romagna, not Chianti), "vines planted in 1902", "a 1947 wine list",
  "a village lunch that fourteen euros gets you", a twenty-vintage tasting with
  a named-role négociant, and a hotel "concierge who has been calling the same
  fisherman for twenty years".
- Intro and destination cards: removed "ten resorts within a half-mile… one is
  worth booking", "the Alentejo, forty-five minutes south" (most of the region
  is farther than that from Lisbon), "rivals Burgundy", the prix-fixe "not
  changed in thirty years", "the original bakery", the txoko "accessible only
  through the right connection", "classical sites with no crowds".
- Why section: guide card no longer names a "winemaker… for forty years";
  "more luxury properties per square mile than any other region" softened.
- Seasons: "Paris in November is the best-kept secret… every restaurant has
  availability" and "when mainland Europe closes for the season" softened.
- Visa FAQ rewritten with current, dated rules (below).
- Mediterranean October teaser matches the #213 refresh.

## Material claim log

| Claim / section | Type and evidence | Scope / checked | Reviewer | Decision |
| --- | --- | --- | --- | --- |
| EES records fingerprints and photo instead of stamping, fully since 2026-04-10 | Official: [European Commission EES](https://home-affairs.ec.europa.eu/policies/schengen/smart-borders/entry-exit-system_en) (dates confirmed via Commission and member-state notices; the page itself is script-rendered) | Non-EU short-stay visitors; 2026-11-01 | Mark | Review required |
| ETIAS has no announced start date as of 2026-11-01; EU gives several months' notice | Official link: [travel-europe.europa.eu/etias](https://travel-europe.europa.eu/etias_en); status from Oct 2026 reporting that the Q4 2026 target was removed | Recheck before release; page is script-rendered | Mark | Review required |
| UK ETA required for US and Canadian visitors, £20 | Official: [gov.uk/eta](https://www.gov.uk/eta) ("An ETA costs £20") | 2026-11-01 | Mark | Review required |
| Schengen 90 days in any 180 for US/Canadian passports | Retained from existing FAQ | Long-standing rule | Mark | Review required |
| London–Paris about 2h15 by Eurostar | Independent research: [Seat 61](https://www.seat61.com/london-to-paris-by-train.htm) ("Fastest journey time 2h15 non-stop") | 2026-11-01 | Mark | Review required |
| Six trip types, their pace (7–14 days), bases and tradeoffs | Editorial planning framework; Mark's practice | Starting points, not itineraries | Mark: approve fit, pace and child-page choices | Review required |
| "Food and wine trips are strongest in September and October" | Editorial; consistent with the existing seasons strip | Generic | Mark | Review required |
| Specialist-guide examples (art historian in Florence, food guide in Lyon, wine educator in Burgundy) | Mark's practice; no named people or tenures | Generic roles | Mark: confirm these are guides HYMT books | Review required |
| SELECT program benefits | Covered by DECISIONS.md D2 extension (#251) | Unchanged in this PR | Approved 2026-11-01 | Approved (#251) |
| Cost range $700–$1,500 per person per day | Unchanged; verified August 2026 | Out of scope | — | Unchanged |

No new firsthand, client-outcome, exclusive-access or supplier-benefit claim
is added.

## Image provenance

No image added. The four itinerary-card images left with the itineraries.
`ni-europe-burgundy-wine-cellar.jpg` and `ni-europe-lisbon-alfama-tram.jpg` are
still used elsewhere; `ni-europe-amalfi-coast-terrace.jpg` and
`ni-europe-san-sebastian-pintxos.jpg` are now unreferenced and stay tracked in the
pipeline (the verifier lists them as free to reuse). Nothing is deleted.

## Release checks

- `npm run build` passes, 132 pages; title/description unchanged, so no
  baseline update.
- Local browser (CSP-enforcing server) at 375, 768 and 1440 px: one H1, no
  horizontal overflow, no console errors; all 22 internal link targets return
  200; six trip cards render, stacked on mobile and two-up on desktop.
- After release: run `npm run verify:prod`, add the hub's new journeys to the
  #222 link snapshot, and schedule the private 30/90-day cohort check.
