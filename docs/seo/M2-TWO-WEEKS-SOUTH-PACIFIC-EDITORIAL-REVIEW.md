# Editorial review: Two Weeks in the South Pacific (new guide)

Prepared with `EDITORIAL-REVIEW-TEMPLATE.md`, November 1, 2026, for #218.
**Decision: review required.** This is a new URL. The #217 brief makes
publication conditional on distinct intent, current legs and advisor review;
nothing below is approved until the owner records approval on the PR.

## Page decision

| Field | Entry |
| --- | --- |
| Page and source | `/travel-journal/two-weeks-in-the-south-pacific/`; `src/content-pages/travel-journal__two-weeks-in-the-south-pacific.html` |
| Editorial owner / expert reviewer | Mark Sole |
| Writer / researcher | Claude Code; independent research |
| Review date | Pending |
| Decision | Review required |
| Published-date evidence | `publishDate` 2026-11-01 in the wrapper and index card. **Per DECISIONS.md D6, change both to the actual release date at merge.** |
| Next review | Release +30/+90 days; recheck every transport leg before each dry season |
| Earlier trigger | New Nadi–Papeete service, a domestic schedule or baggage change, correction request |

## Distinct intent (the #217 brief's gate)

The page answers: **how many stops fit a two-week South Pacific trip, and
what does a feasible 12–15-night route look like?**

| Existing or planned page | Its question | Why this is different |
| --- | --- | --- |
| `/destinations/south-pacific/` (#217) | Which country and route shape fit me? | No day count, travel-day budget or night-by-night route |
| `/travel-journal/south-pacific-destination-guide/` | What is each region like? | Regional character, not route sizing |
| #219 (planned) | Fiji or French Polynesia for a defined traveler? | This guide keeps to one country per trip and does not compare the two |
| #220 (planned) | How do connections, baggage and disruption work? | Covered here only as warnings; #220 should go deeper or merge into this page |

Live search for "two week South Pacific itinerary" on 2026-11-01 returned
tour-operator itinerary listings, a Vanuatu tourism itinerary and generic
"7 vs 10 vs 14 days" articles. None combined a travel-day budget, stop count
and buffers. This is a search-result observation, not search-volume
evidence; no private query data is used.

## Material claim log

| Claim / section | Type and evidence | Scope / checked | Reviewer | Decision |
| --- | --- | --- | --- | --- |
| Bora Bora flight about 50 minutes, up to 1½ hours with a stop; airport on a motu; luxury hotels meet flights by boat | Official: [Tahiti Tourisme, getting to Bora Bora](https://www.tahititourisme.com/islands/bora-bora/getting-to-bora-bora/) | From Tahiti; 2026-11-01 | Mark | Review required |
| Moorea by ferry from the Papeete terminal; Air Tahiti and Air Moana domestic flights | Official: [Tahiti Tourisme, Tahiti transport](https://www.tahititourisme.com/islands/tahiti/getting-there-and-getting-around/) | No crossing time stated | Mark | Review required |
| Moorea–Bora Bora may route via Papeete | Independent research; Air Tahiti pass guidance | Qualified "may" | Mark: confirm current routing | Review required |
| Air Tahiti checked allowance depends on fare and can be lower on small aircraft | Supplier: [Air Tahiti checked baggage](https://airtahiti.com/checked-baggage) (page blocks automated fetch; wording from search-indexed text and third-party summaries: 23 kg standard, lower on some fares/routes) | No kg figure published on the page | Mark | Review required |
| Daily resort ferries from Port Denarau to the Mamanuca and Yasawa islands; water taxis; Fiji Link and Northern Air domestic flights | Official: [Tourism Fiji, by sea](https://www.fiji.travel/things-to-know/getting-around/water), [by air](https://www.fiji.travel/things-to-know/getting-around/air) | 2026-11-01 | Mark | Review required |
| Rarotonga–Aitutaki under an hour | Independent research: schedule aggregators (about 50 minutes, several daily flights, July–August 2026); [Cook Islands Tourism](https://cookislands.travel/how-to-book/flights) linked | Official page blocks automated fetch | Mark | Review required |
| No scheduled nonstop Nadi–Papeete in November 2026; connections commonly via Auckland | Independent research: Skyscanner route page (May 2026), travel-planning sources; an Aircalin weekly route announced for Dec 2023 not confirmed as operating | Recheck on release day | Mark: confirm with an airline or GDS | Review required |
| Fiji is across the International Date Line from the Americas; flights from the US arrive two calendar dates later | Geographic fact (Fiji UTC+12) | General | Mark | Review required |
| Fiji and French Polynesia generally drier May–October | Official, already approved on the hub (#217): Tourism Fiji, Tahiti Tourisme | Typical pattern | Approved 2026-10-04 (#217) | Approved |
| Travel-day budget: about 10–11 full days on the ground in 14 nights | Editorial arithmetic; Mark's planning practice | US West Coast origin | Mark | Review required |
| Two bases with four or more nights each; three only under stated conditions; ten-day and three-week scaling | Mark's planning recommendation | Generic | Mark | Review required |
| Three 12–13-night route shapes (French Polynesia, Fiji, Cook Islands) | Editorial planning shapes, unpriced | Not validated itineraries | Mark: approve feasibility and pace | Review required |

`<!-- NEEDS MARK -->` in the recommendation asks for an optional sentence
about a real two-week trip Mark has planned (no client details), or
confirmation that the recommendation stands without one. The build strips
internal comments, so it never reaches the page.

No price, supplier benefit, client outcome or first-person visit claim is made.

## Image provenance

| File / placement | Classification | Action |
| --- | --- | --- |
| `dh-04-fiji-lagoon-aerial.jpg`, hero; existing `og-` crop | Unknown (same asset as the hub's Fiji card, recorded in the #217 review) | Owner confirms provenance and rights; not visit evidence |
| `jc-dh-04-fiji-lagoon-aerial.jpg`, journal index card | New 780×410 crop of the hero (quality 72, house value), written to `images-b64/` and MANIFEST via `tools/image-manifest.mjs` | Inherits the hero's provenance |

## Internal links

- In: journal index card; the South Pacific hub (contextual sentence in the route
  comparison note, plus a Read More card); Fiji, French Polynesia and Cook
  Islands destination Read More cards. These replaced a Five-Star Problem card
  (hub, Fiji, Cook Islands) and a What Hotel Descriptions Mean card (French
  Polynesia); those posts keep 15 and 16 inbound pages.
- Out: the hub `#choose-your-route`, the three country pages, beach/island,
  romance and family experiences, and `/plan-your-trip/`.
- `public/llms.txt` journal count 32 → 33.

## Release checks

- `npm run build` passes, 133 pages; head baseline accepts the new URL in its
  own commit.
- Local browser (CSP-enforcing server) at 375 px and 1440 px: one H1; Article,
  BreadcrumbList and WebPage schema; canonical and OG image correct; 36
  internal links resolve; no horizontal overflow or console errors; the
  NEEDS MARK comment does not appear in the built HTML.
- After release: request indexing, add the page to the #222 link snapshot, and
  schedule the 30/90-day cohort checks in the private scorecard.
