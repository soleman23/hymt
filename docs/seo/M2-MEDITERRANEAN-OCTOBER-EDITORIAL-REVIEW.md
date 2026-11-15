# Editorial review: The Mediterranean in October

Prepared with `EDITORIAL-REVIEW-TEMPLATE.md`, November 1, 2026, for #213.
**Decision: review required.** Nothing below is approved until the owner
records approval on the PR. An empty row or `review required` is not approval.

## Page decision

| Field | Entry |
| --- | --- |
| Page and source | `/travel-journal/mediterranean-october/`; `src/content-pages/travel-journal__mediterranean-october.html` |
| Editorial owner / expert reviewer | Mark Sole |
| Writer / researcher | Claude Code; independent research and existing-page refresh |
| Review date | Pending |
| Decision | Review required |
| Published-date evidence | Existing URL, `publishDate` 2026-09-01; no new article |
| Substantive update evidence | `modifiedDate` 2026-11-01; change to the actual release date if the merge lands later |
| Next review | Release +30/+90 days; before next October (refresh 2027 ferry and fair dates by August 2027) |
| Earlier trigger | Operator season change, fair date change, correction request |

## Traveler decision and URL role

The page answers: **where in the Mediterranean, and in which half of
October, does the trip still work?** It keeps its URL, title and canonical.
Country detail stays on the Italy, Greece and Spain destination pages; the
page links to them instead of repeating it.

## What changed and why

- 61-word answer capsule; east/west climate comparison from three national
  met services; an early/late-October table by region; tradeoffs (ferries,
  closures, rain, trip length, lead time); two sample routes; October CTA.
- **Corrected:** "White truffle season in San Miniato begins in October." The
  main San Miniato market is in November (14–29 Nov 2026); October has
  village fairs.
- **Removed, unsourced:** "the sea is still 24°C" (hero deck and four teaser
  cards on other pages), 22–26°C highs "across most of the region", 22–24°C
  sea "through mid-October", "German school holidays are over" (many German
  states have autumn holidays in October), September rates "within a few
  percentage points of August", "Rome… best months on record", Hvar opening
  claims, Turkish sea "at or above 22°C", the Morocco section (Sahara and
  Atlas are not Mediterranean-coast decisions and its figures were unsourced),
  the photographers' light paragraph.
- Callout and author bio no longer claim client feedback or "same or lower
  cost" outcomes.

## Material claim log

| Claim / section | Type and evidence | Scope / checked | Reviewer | Decision |
| --- | --- | --- | --- | --- |
| Antalya October avg high 26.6°C, ~5.4 rain days | Independent research: [MGM Antalya](https://www.mgm.gov.tr/veridegerlendirme/il-ve-ilceler-istatistik.aspx?k=A&m=ANTALYA) | Station averages 1930–2025; 2026-11-01 | Mark | Review required |
| Palma October avg high 23.9°C, 6.1 rain days ≥1 mm | Independent research: [AEMET Palma Airport](https://www.aemet.es/en/serviciosclimaticos/datosclimatologicos/valoresclimatologicos?l=B278&k=bal) | Standard values 1981–2010; 2026-11-01 | Mark | Review required |
| Dubrovnik October mean 18.0°C, 125.2 mm rain vs 96.2 mm Sep; sunshine 201.6 h vs 254.7 h | Independent research: [DHMZ Dubrovnik](https://meteo.hr/klima_e.php?section=klima_podaci&param=k1&Grad=dubrovnik) | 1961–2024; 2026-11-01 | Mark | Review required |
| L'Estartit sea 21.7°C on 2025-10-08, +1.8°C vs 1998–2022 | Independent research: [Catalan News reporting Meteocat](https://www.catalannews.com/society-science/item/mediterranean-sea-18c-warmer-than-average-in-early-october) | Single station, single day; illustrative only | Mark | Review required |
| Piraeus–Folegandros 6–7 days/week Oct, 3–5 Nov | Supplier/aggregator: [Discover Cyclades](https://discovercyclades.gr/en/ferry-routes/direct/athens-piraeus-to-folegandros) | Indicative, not an operator timetable | Mark: confirm with operator before quoting | Review required |
| Amalfi ferries April–October; some NLG Positano routes to 3 Nov 2026; Alicost Naples weekends to 31 Oct | Supplier/aggregator: [Positano.com schedules](https://www.positano.com/en/ferry-schedule) | 2026 season; subject to change | Mark | Review required |
| San Miniato area fairs: Balconevisi 17–18 Oct, La Serra 30 Oct–1 Nov, main market 14–29 Nov 2026 | Official tourism: [Terre di Pisa](https://www.terredipisa.it/en/events/national-white-truffle-fair-san-miniato/) | 2026 calendar; check organiser | Mark | Review required |
| Puglia olive harvest usually begins late October, peaks November | Independent research; several regional sources agree, none official | Typical timing, varies by variety and year | Mark: confirm or soften | Review required |
| "October is the month I suggest most often"; ten nights in two or three bases; "start planning in spring" | Mark's practice and recommendation (first person) | Generic | Mark must confirm or rewrite | Review required |
| Two sample routes (Italy first half; Athens + one island or Turkish coast) | Editorial planning shapes, unpriced | Not a validated itinerary | Mark: approve fit and pace | Review required |

No price, supplier benefit, client outcome or first-person visit claim is added.

## Other pages touched

The excerpt for this article on `travel-journal.html`, `european-grand-tour-mistake`,
`glacier-express` and `the-case-for-shoulder-season` repeated "The sea is still
24°C". Each now uses the new deck wording.

## Image provenance

No image added or changed. The existing hero
`jh-12-mediterranean-october-coast.jpg` is retained; provenance outside scope.

## Release checks

- `npm run build` passes, 132 pages; head baseline updated in its own commit.
- Local browser (CSP-enforcing server) at 375 px and desktop: one H1, seven
  body H2s, no horizontal overflow, no console errors, all seven internal link
  targets return 200; the table stacks with inline "Early/Late" labels.
- The private GSC page cohort check at 30/90 days remains to schedule after release.
