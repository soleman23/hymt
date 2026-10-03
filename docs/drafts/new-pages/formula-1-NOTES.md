# Formula 1 page: owner checklist (DRAFT, not built, not deployed)

Page: `/experiences/sports-event-travel/formula-1/`
Drafted: 2026-10-03, on branch `main-0puhp3`.

Draft files, and where each one goes when it is promoted:

| Draft | Promote to |
|---|---|
| `docs/drafts/new-pages/src/pages/experiences/sports-event-travel/formula-1/index.astro` | `src/pages/experiences/sports-event-travel/formula-1/index.astro` |
| `docs/drafts/new-pages/src/content-pages/experiences__sports-event-travel__formula-1.html` | `src/content-pages/experiences__sports-event-travel__formula-1.html` |

The import paths in the wrapper are already correct for the promoted location.
It uses the `parent` prop that `ExperienceLayout.astro` already has, so the
breadcrumb and BreadcrumbList read Home › Experiences › Sports & Event Travel ›
Formula 1. The layout sends the hero image as `preloadImage` by itself.

## 1. Title and description

- **Title:** `Formula 1 Grand Prix Hospitality — Hit Your Mark Travel`
  **55 characters** including the suffix. The limit is 30–65. It contains no
  `&`, so the encoded and decoded lengths are the same. No other page title
  contains "Formula 1".
- **Meta description:** `Formula 1 weekends at Monaco, Monza and Singapore: Paddock Club, grandstand, yacht and balcony tiers, the 6–18 month lead time, and what sets the price.`
  **152 characters.** The limit is 110–165.
- **H1 (hero headline):** "Trackside at Monaco, / Monza and Singapore". This is not the parent's
  "The Best Seat in the House".
- **Body:** **2,556 words** after the owner answers (2,574 before),
  measured with the site's own `bodyWords()` from
  `tools/content-checks.mjs`. That is above the brief's 1,800–2,400 and
  CONTENT-STANDARDS' 1,200–2,000 for an experience page. The verifier sets no
  ceiling for experience pages, so the build will not fail on length. About
  760 of the words are the nine FAQ answers. If you want it shorter, the first
  cuts are FAQ 9 (cancellation) and the "Who it suits" grid.
- I ran the repo's own checks on the partial: `faqFirstSentenceOver`,
  `photoGridDefects`, `nestedCardAnchors` and the placeholder-copy patterns
  all pass. The answer capsule is 60 words. Every FAQ first sentence is 25
  words or fewer, and every answer runs 74–89 words.

## 2. Owner answers applied (2026-10-03)

The owner answered every open question with one rule: **Mark has not been to
any of these races.** Nothing on the page may claim first-hand experience,
booking relationships, named hospitality operators or suppliers, hotels HYMT
uses, prices, client stories or testimonials. Every detail stays
informational: how each tier works, the calendar, the ticket rules, and where
visitors typically base themselves (areas, not named hotels), each cited as
before. All seven `NEEDS MARK` comments are gone from the partial (`grep -c`
returns 0). What changed:

1. **Mark's attendance.** The Mark's-note placeholder section is deleted
   outright. There is no first-person trackside copy anywhere on the page.
2. **Suppliers.** The yacht-operator comment is deleted; the yacht tier
   names no operator, broker or supplier and keeps its two citations. No
   other tier names a supplier.
3. **Balcony at the Fairmont Hairpin.** No confirmed access. The Balcony or
   Terrace tier is cut to one neutral line: "Monaco only: private terraces
   and balconies above the circuit are sold for the race weekend." The
   catering and sight-line sentences are gone. In the Monaco card, the
   uncited "including around the Hairpin" is removed; the Hairpin is still
   named once as part of the circuit route, which the 2026 timetable link
   supports. (The live parent's Monaco card has already been reworded; see
   § 5.)
4. **Prices.** No figures. The cost block stays "Priced by the seat, not by
   the night" with no band, and the trailing comment is deleted.
5. **Testimonial.** The testimonial placeholder section is deleted outright.
6. **Where to stay, Monaco.** The card now reads "Visitors base themselves in
   Monaco itself or along the coast in Beaulieu, Cap-Ferrat or Nice", with
   no hotel named. FAQ 6 is unchanged apart from "Many guests split it" →
   "A common split is", which drops the implied client base.
7. **Where to stay, Monza.** "Guests usually base in Milan or on the lakes"
   → "Visitors typically base themselves in Milan or on Lake Como". No hotel
   named.

Copy that implied an HYMT track record was also neutralised: the circuits
heading "The Circuits We Build Trips Around" → "Four Circuits, Race by
Race"; the Abu Dhabi card's "explains how we plan around it" → "covers the
season around it"; the final CTA's "come back with the seats, the rooms…" →
"come back with options for the seats, the rooms…". No factual claim or
citation was added or removed, and the FAQ markup is untouched.

## 3. Image gaps

What the draft uses, all checked to exist in `public/assets/img/`:

- **Hero:** `e-32-monaco-harbour-dusk.jpg` (1600×893). I searched the whole
  repo. Nothing in `src/` or `dist/` uses the full-size file; only its
  `ev-e-32` crop is used, on the parent. `tools/make-event-crops.mjs` and
  `images-b64/MANIFEST.json` mention it only as a source file.
- **#monaco card:** `ev-e-32-monaco-harbour-dusk.jpg` (600×700). The brief
  allows this reuse, but it is the same photograph as the hero. **Replace it
  with a different Monaco crop before launch.**
- **#monza card:** `e-63-circuit-kerb-apex.jpg` (1600×899). This is a generic
  circuit shot, also used on the parent's F1 card, and the alt text does not
  claim it is Monza. Replace it with a Monza `ev-` tile when one exists.
- **#singapore card:** **no photograph.** It shows the plain `event-image`
  panel with the caption "Marina Bay · Night Race". **This blocks launch.**
  CLAUDE.md says never ship a placeholder image, so make
  `ev-…-singapore-marina-bay-night.jpg` (3:4, 600×700) first, then switch the
  card to `event-image--photo` with an `<img>`.
- **#abu-dhabi card:** done (2026-10-03). `ev-e-71-yas-marina-blue-hour.jpg`, a centre
  crop of the generated `e-71-yas-marina-blue-hour.jpg` (the hotel canopy over
  the circuit at blue hour). It replaces the Louvre Abu Dhabi stand-in.
- **"Build the Week" cards:** a plain grid with no images, because no Milan
  or Lake Como photograph exists. I left the swatch out too, so nothing
  placeholder-like ships. If France, Italy and UAE photos all exist one day,
  switch the grid to `exp-cards--photo`. `france-french-riviera.jpg` and
  `uae-gulf-abu-dhabi.jpg` would cover two of them.
- **Intro image:** left out, because there is no portrait `np-` F1 image. To
  add one, make `np-e-32-monaco-harbour-dusk.jpg` (900×1520) and add an
  `intro-image intro-image--photo` block.
- **OG image:** make `og-e-32-monaco-harbour-dusk.jpg` (1200×630) and add an
  entry to `src/lib/og-crops.ts`. Until then the page uses the default
  crest plate.
- Every new file goes through `tools/image-manifest.mjs`. Generated images
  must not show identifiable drivers, team liveries or F1 logos.

## 4. Proposed `tools/cost-ranges-data.mjs` row (not added)

```js
  "experiences__sports-event-travel__formula-1.html": {
    unit: "Priced by the seat, not by the night",
    noBand: "The seat sets the number: Paddock Club, grandstand, yacht and balcony are priced per race, per day and per guest, and the four tiers sit too far apart for one nightly figure to mean anything.",
    includes: [
      "Race access at the tier booked — grandstand, Paddock Club, yacht or terrace",
      "A hotel within walking distance or a short private transfer of the circuit",
      "Transfers on race days, and the catering the hospitality itself carries",
    ],
    excludes: [
      "International flights, and the nights either side of race week",
      "Anything outside the hospitality's own catering window",
      "Cancel-for-any-reason cover, which event trips need more than most",
    ],
    drivers: [
      "Which tier — a grandstand seat, the Paddock Club, a yacht berth and a private balcony are four different products, not four grades of one",
      "Party composition — Monaco prices ages six to fifteen at half the adult ticket for Friday, Saturday or Sunday (ACM terms, checked October 2026)",
      "Duration — a two- or three-day Monaco package takes 10% off the adult tickets; a single Sunday does not, and the discount excludes children's tickets",
    ],
    source: { text: "Automobile Club de Monaco ticket terms", href: "https://acm.mc/en/epreuves/formula-1-grand-prix-de-monaco/useful-infos/information-about-ticket-or-package-purchase/" },
    verified: { datetime: "2026-10-03", label: "October 2026" },
  },
```

- The rendered block in the partial is hand-written in exactly the shape
  `renderNoBandSection()` produces. That renderer prints no `<time>`, so the
  check date is written into the driver text instead.
- **Correction to the parent's terms:** the parent says Monaco children are
  "free on Thursday". The current ACM ticket page lists the half-price rate
  for Friday, Saturday or Sunday and says nothing about Thursday. The
  free-Thursday rule appears on an ACM "New program, new rates!" post about
  the 2022 format change. I could not confirm it still holds, so I left it
  out here, and the parent should drop it too.
- The current ACM terms also say the reduced rates do not apply to GOLD
  tickets, the BELVEDERE and LOGES VIP packages, or standing areas, and the
  package discount does not stack on children's tickets. The draft says this
  in plain terms.

## 5. Changes needed elsewhere at launch (listed only, none made)

Already done, so dropped from this list: the live Sports page's Monaco event
card (date now "June", copy informational) and its FAQ 2 were reworded to
informational copy on branch `main-0puhp3`.

1. **Tile map (`tile-map.json` + `tools/apply-tile-links.mjs`):**
   - Record `sports-event-travel` exp-card 3 (Formula 1): change it from
     `/plan-your-trip/` to `/experiences/sports-event-travel/formula-1/`.
   - Record `sports-event-travel` event-card 3 (Monaco Grand Prix): point it
     at `/experiences/sports-event-travel/formula-1/#monaco`. Either retarget
     the `event-cta` with a label like "The Monaco Weekend", or add an
     `event-more` link, "Monaco Grand Prix hospitality tiers". The `#monaco`
     id exists in the draft, so the tile-links check will pass.
2. **Parent cost block** (both `tools/cost-ranges-data.mjs` →
   `"experiences__sports-event-travel.html"` and the rendered block,
   ~lines 211–233):
   - Remove the two Monaco drivers (children's price, 10% package) and the
     ACM source; they now live on this page.
   - Replace them with drivers that fit any sport, e.g. "Which event and
     which tier", "Party size and ages", "One day versus the full event".
   - Cite a new source of the parent's own, e.g. Wimbledon debenture or
     hospitality terms (wimbledon.com) or Royal Ascot enclosure ticketing
     (ascot.com). Verify that source before using it.
   - Leave the parent's capsule and its 6–18 month figure exactly as they are.
3. **Parent FAQ 4:** cut the Monaco example to one clause, e.g. "a
   <a href="/experiences/sports-event-travel/formula-1/#monaco">Formula 1
   weekend in Monaco</a> pairs with the Côte d'Azur".
4. **Parent FAQ 1 or 3 (optional):** link "Formula 1 races" (FAQ 1) or
   "Formula 1 hospitality packages" (FAQ 3) to the new page.
5. **`/destinations/uae-gulf/`** (line 204, the Abu Dhabi Grand Prix
   rate-driver sentence): add a second link, "Formula 1 hospitality", to the
   new page, and keep the existing formula1.com link. Check the body stays
   under 3,500 words.
6. **`/travel-journal/europe-destination-guide/`** (line 141, the French
   Riviera paragraph): the brief's anchor, "the Monaco Grand Prix weekend",
   does not exist in this paragraph, which never mentions Monaco. A short
   clause has to be added first, e.g. "…before the July–August peak, and
   just after <a href="/experiences/sports-event-travel/formula-1/#monaco">the
   Monaco Grand Prix weekend</a>…".
7. **Other journal links back (optional):** `masters-field-report` and
   `middle-east-destination-guide` are linked from this page's read-more
   block. Each could link back from a relevant sentence.
8. **`/destinations/france/` (optional):** the brief suggests "Monaco Grand
   Prix week" on the Côte d'Azur seasonal line (~line 228). Note that France
   has **no Riviera or Côte d'Azur place card** (its six are Paris, Provence,
   Bordeaux, Loire, Alsace, Normandy). The draft therefore links France with
   the anchors "a longer stay in France" and "a longer trip through France",
   not "Côte d'Azur".
9. **`/destinations/italy/`:** it has **no Milan, Lake Como or Lombardy
    coverage**; its places are Rome, Tuscany, Amalfi, Venice, Sicily and
    Puglia. The draft's Italy anchors are "a longer trip through Italy" and
    "the rest of Italy", and the Italy card is framed as Venice and Tuscany
    after Monza, not "Milan and the lakes".
10. **Singapore:** `destinations__vietnam-southeast-asia.html` does not
    mention Singapore anywhere, so the #singapore card has no destination
    link, as the review required.
11. **`tools/head-baseline.json`:** add the new page's entry, in its own
    commit (`node tools/verify-deployment.mjs --update-baseline`).
12. **`/experiences/` hub, footer, llms.txt counts:** no change. Optionally
    add one line to `public/llms.txt` under Sports & Event Travel.

## 6. Sources and how they were checked

**The egress proxy blocked direct fetches** of formula1.com and acm.mc
(`EGRESS_BLOCKED`). I confirmed every fact below from search results limited
to the official domain. Re-open each link once before launch.

| Claim on the page | Source |
|---|---|
| 2027 dates: Monaco 4–6 Jun, Monza 3–5 Sep, Singapore 8–10 Oct, Abu Dhabi 10–12 Dec; 24 Grands Prix; 10 Sprints including Monaco (first), Monza, Abu Dhabi (first); Singapore not a Sprint in 2027 | https://www.formula1.com/en/latest/article/formula-1-reveals-calendar-for-2027-season-with-10-sprint-events.5J8ePLyjRuMyWEIDNUKgY4 and https://www.formula1.com/en/racing/2027 |
| Monza 2027 Sprint, 3–5 Sep | https://www.monzanet.it/en/2027-f1-calendar-revealed-monza-from-september-3-to-5-with-the-sprint-race/ |
| Monaco 2026 on 5–7 Jun; 78 laps; 3.337 km | https://www.formula1.com/en/latest/article/formula-1-louis-vuitton-grand-prix-de-monaco-2026.5eqj7xSRWW6dylGmncfs6T |
| Weekend structure (practice, qualifying, race) | https://www.formula1.com/en/latest/article/the-beginners-guide-to-the-formula-1-weekend.5RFZzGXNhEi9AEuMXwo987 |
| ACM: ages 6–15 pay 50% Fri/Sat/Sun; 10% off 2- or 3-day package; no package discount on child tickets; under-15s accompanied, with ID; excludes GOLD, BELVEDERE, LOGES VIP, standing | https://acm.mc/en/epreuves/formula-1-grand-prix-de-monaco/useful-infos/information-about-ticket-or-package-purchase/ |
| Port Hercule about 760 berths | https://www.ports-monaco.com/en/the-ports-of-monaco/port-hercule/ |
| 2025 Grand Prix berth rates applied from the Monday before to the Monday after | https://www.ports-monaco.com/wp-content/uploads/2024/12/GP-2025-Monaco-Rates.pdf |
| Berths and access during the race run by ACM, SEPM and the Maritime Police | https://bateaux.acm.mc/en/conditions-dacces-au-port-hercule-pendant-les-epreuves/ |
| Paddock Club: suites above the team garages, pit lane walk, all-day dining, terraces | https://tickets.formula1.com/en/pc-paddock-club |
| Monza opened 3 Sep 1922; third permanent circuit after Brooklands and Indianapolis; in the Parco di Monza | https://www.monzanet.it/en/history/ |
| Monza track invasion beneath the podium | https://www.formula1.com/en/latest/article/engines-espresso-and-tifosi-passion-the-ultimate-fan-guide-to-monza.1rkB3TtIgupczEs1naB0C8 |
| Singapore: first F1 night race, 28 Sep 2008 | https://www.formula1.com/en/latest/article/do-you-remember-f1s-first-ever-night-race.40aylFbXcPZSJRGiQv5Dgh |
| Singapore 2026: 62 laps, 4.927 km, race 20:00 local | https://www.formula1.com/en/latest/article/formula-1-singapore-airlines-singapore-grand-prix-2026.1OXwlTH5jrpTiZX2Dvg7qE |
| Singapore tickets sold by zone; walkabout vs grandstand | https://singaporegp.sg/en/tickets/general-tickets/walkabouts/premier-walkabout/ |
| 2023 Emilia Romagna GP called off for flooding | https://www.formula1.com/en/latest/article/breaking-update-on-the-emilia-romagna-grand-prix-at-imola.14xk8GLh2Lr8wBGdJqhxnO |

**Left out because I could not verify them:**
- ACM's "children free on Thursday" (see § 4).
- The "10 minutes by train from Milan to Monza" figure.
- Monza as the "fastest lap of the year". The copy says only that it is
  built for speed.
- The 2027 Singapore session times. The page gives 2026's 20:00 start,
  labelled as 2026.

**Partly verified:** the Monaco card says the race "moved from late May to
the first weekend of June in 2026". The 2026 June date is confirmed. The
earlier May timing comes from the parent page and the brief, not from a
source I checked. Confirm it, or cut the clause.

**Check again close to launch:** the 2027 calendar is only provisional, and
the ACM rewrites its ticket terms every year. The page shows "checked
3 October 2026" next to the dates and the ACM terms.

## 7. Structure notes for review

- Section order: intro (capsule) → who it suits / who it does not → circuits
  (`#monaco`, `#monza`, `#singapore`, `#abu-dhabi`) → four ways to watch →
  2027 calendar and lead time (`seasons-strip`) → build the week (plain
  `exp-cards`) → `exp-cta` (the testimonial and Mark's-note placeholders
  were removed on 2026-10-03) → `cost-range` → `page-faq` (9 FAQs, `pf-formula-1-1` to `-9`)
  → `read-more` (3 journal posts).
- Headings: only h2 and h3. The layout supplies the one h1.
- No new CSS and no `pageCss`. Every class comes from `experience.css` or
  `section-shared.css`. Inline heading styles are copied from the parent.
- Lead-time wording uses only HYMT's own "6–18 months", with no per-tier
  months, plus "the earlier end for a yacht or balcony".
- FAQ 9 links to the parent's insurance answer
  (`/experiences/sports-event-travel/#pf-sports-event-travel-8`) instead of
  repeating the cancel-for-any-reason advice.
