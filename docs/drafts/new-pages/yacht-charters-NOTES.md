# /experiences/cruises/yacht-charters/: owner checklist (DRAFT)

Drafted 2026-10-03 on branch `main-0puhp3`. **This is a draft. It is not built and not deployed.** Owner answers applied 2026-10-03 (section 2).
Nothing outside `docs/drafts/new-pages/` was touched: the parent cruises page,
`tools/cost-ranges-data.mjs`, `src/data/tiles.mjs`, the journal posts and the
destination pages are all unchanged. The edits they need at launch are listed
under "Launch-time edits" below.

| Draft file | Promotes to |
|---|---|
| `docs/drafts/new-pages/src/pages/experiences/cruises/yacht-charters/index.astro` | `src/pages/experiences/cruises/yacht-charters/index.astro` |
| `docs/drafts/new-pages/src/content-pages/experiences__cruises__yacht-charters.html` | `src/content-pages/experiences__cruises__yacht-charters.html` |

The wrapper's import paths (`../../../../layouts/…`, `../../../../content-pages/…?raw`)
are written for the promoted location. They do not resolve from `docs/drafts/`.

---

## Images applied (2026-10-03)

- Hero: `e-76-yacht-bay-golden-hour.jpg` (1600x900 landscape) replaces the
  portrait e-07, so `tools/make-og-crops.mjs` can cut a 1200x630 og:image at
  promotion. The "Hero aspect" and og:image gaps below are resolved by this.
- Catamaran card: `ev-e-74-cyclades-catamaran.jpg` (crop anchored left in
  `tools/make-event-crops.mjs`, because sharp's attention crop centred the
  village and lost the boat).
- Motor-yacht card: `ev-e-75-caribbean-motor-yacht.jpg`.
- Still open: the gulet card and #gulets section. A generated gulet image is
  ready to import; it still blocks launch until it is in.

## 1. Metadata

| Field | Value | Length |
|---|---|---|
| Title | `Private Crewed Yacht Charters — Hit Your Mark Travel` | **52** chars (rule: 30–65) |
| Meta description | `Crewed gulets, catamarans and motor yachts, chartered by the week in the Med or the Caribbean: how crew, contract and the APA work, and what moves the price.` | **157** chars (rule: 110–165) |
| H1 (hero headline, from the layout) | `Your Boat, Your Crew,<br>Your Anchorages` | single h1; the partial starts at h2 |
| Breadcrumb / BreadcrumbList | Home › Experiences › Cruises &amp; Yachts › Private Yacht Charters | built from the `parent` prop |
| Hero / preload | `/assets/img/e-07-yacht-cove.jpg` (exists, **1024×1405, portrait**) | passed as `hero.image`, which the layout also sends as `preloadImage` |

- The parent wrapper passes `name={"Cruises & Yachts"}`, and this draft passes
  `label: "Cruises &amp; Yachts"`. The layout renders crumbs with `set:html`
  and the schema through `plain()`, which decodes `&amp;`, so both render the
  same text. Spell it whichever way the house style prefers.
- Body word count is **about 2,735**, with comments and tags stripped (2,726 before the owner answers were applied). The brief's
  target was 1,800–2,400 and CONTENT-STANDARDS § 3.4 says 1,200–2,000 for an
  experience page. No verifier check applies an experience ceiling, but the
  page is over both targets. The cost-range block (about 190 words) and the
  8-question FAQ (about 600) are structural. If it needs to be shorter, cut in
  this order: the "What We Handle" section (about 180 words, and the parent's
  "Charter Brokerage" item covers some of it), then the St. Barth's and Lau
  cards.
- `tools/head-baseline.json` needs one entry for the new URL, made with
  `node tools/verify-deployment.mjs --update-baseline` in a commit of its own.

## 2. Owner answers applied (2026-10-03)

**The rule.** Mark has not chartered or inspected these boats, and HYMT claims
nothing first-hand. The page makes no claim of first-hand experience, names no
broker, says nothing about how HYMT is paid, gives no group or boat size that
HYMT books, states no booking lead time as HYMT practice, and carries no client
story or testimonial. Every detail stays informational and cited. All nine
`<!-- NEEDS MARK -->` comments are gone from the partial (`grep -c "NEEDS MARK"`
returns 0), and the header comment now records this rule.

What was applied, removed or neutralised:

1. **Gulet season.** June – September is the core season and October is a
   shoulder month, stated neutrally, consistent with the Middle East guide's
   island-fact (line 255, "June – September"). Applied in the #gulets "The
   Season" item, the seasons strip and FAQ 4; the gulet event-card already read
   June – September. The reconciliation note is removed. The live parent
   Cruises event-card was already changed to "June – September" on branch
   `main-0puhp3`, so it is no longer a launch-time edit here.
2. **First-hand experience.** None added. The intro stays in third person.
3. **Brokers and payment.** "The Broker and the Shortlist" is now "Charter
   Brokers" and says only that crewed charters are typically contracted
   through a charter broker on a standard agreement (MYBA in the Mediterranean,
   CYBA in the Caribbean, both already cited). The "shortlist comes back as
   specific boats" line, which implied HYMT's own broker practice, is removed.
   No fee or commission claim was added. The CTA note line ("No booking fees ·
   Response within 24 hours · Fully bespoke") is left exactly as on every
   other page.
4. **Group and boat sizes.** None stated beyond the cited Red Ensign Group
   12-passenger rule.
5. **Booking lead time.** No lead-time FAQ; the placeholder comment is removed.
   The FAQ stays at 8 questions.
6. **St. Barth's and Lau Group cards.** Kept as informational cruising
   grounds. The St. Barth's line "works best as two or three nights at anchor
   inside a wider week" (an unsourced practice recommendation) became "can be
   one stop within a wider week". Neither card claims HYMT charters there.
7. **Gratuity.** Only MYBA's published 5–15% range, unchanged.
8. **Season "Best Window".** No season item is marked `season-item--best`.
9. **Testimonial / Mark's note.** No such section exists; the placeholder
   comment is removed.
10. **FAQ 4, "After October, winter weather closes the route".** Kept: the
    post it links, `travel-journal__mediterranean-october.html` line 89, says
    October is "the last good month for a gulet charter before the winter
    weather closes the route".

Also neutralised: the FAQ sub-heading "Questions we hear most when planning a
crewed charter", which implied a client history, now reads "Common questions
about a crewed charter: the APA, the fee, guest limits, the gulet season,
tipping and VAT."

Left as written, for the reviewer to judge: the "What We Handle on a Charter"
items describe HYMT's planning service ("We ask about both", "we walk through
the terms with you") rather than first-hand experience of boats, and the exp-cta
body ("I'll come back with specific boats and crews") and the generated
cost-range note follow the site-wide CTA pattern. None of them names a broker,
a fee, a size or a client.

## 3. Image gaps

| Gap | Where | Status |
|---|---|---|
| **No Turkey or gulet photo exists anywhere in `public/assets/img/`.** | `#gulets` section and the "A Gulet of Your Own" event-card | **Blocks launch.** Brief: `ev-…-gulet-turquoise-coast.jpg`, 600×700, a wooden gulet at anchor in a Göcek/Fethiye cove, no identifiable faces. The parent cruises event-card 4 currently uses `ev-france-french-riviera.jpg` (wrong country) and should switch to this image too. |
| Greek crewed-catamaran event image (ev-, 600×700) | event-card 2 | Blocks launch |
| Caribbean motor-yacht event image (ev-, 600×700) | event-card 3 | Blocks launch. `ev-e-32-monaco-harbour-dusk.jpg` was checked and rejected: it shows a Monaco GP racetrack and a champagne pour, and it is already the Sports page image. |
| og:image | whole page | `og-e-07-yacht-cove.jpg` does not exist, and `src/lib/og-crops.ts` has no entry for e-07 because the source is portrait and 1024 px wide. The page falls back to `/assets/og-default.jpg`. A 1200×630 card needs a new landscape source or a generated crop, passed as `ogImage` or added through `tools/make-og-crops.mjs`. |
| Hero aspect | hero | The brief called e-07 "16:9". It is **1024×1405 portrait**. Check how the full-bleed hero crops it at desktop width before launch. |

- In this draft the three event-cards use the non-photo `event-image`
  placeholder frame with a text caption. No live page does this, and
  CONTENT-STANDARDS forbids shipping placeholders. Each one must become
  `event-image event-image--photo` with a real `<img … width="600"
  height="700" loading="lazy" decoding="async">` before promotion. New images
  go into `images-b64/MANIFEST.json` through `tools/image-manifest.mjs`.
- All six exp-cards have real photos, so the grid uses `exp-cards--photo`. Their
  dimensions were read from the files: dh-07 1600×893, italy-amalfi-coast
  1600×900, france-french-riviera 1600×900,
  barbados-eastern-caribbean-english-harbour 1600×899, d-06-st-barts-harbour
  1536×936, fiji-lau-group 1600×900.
- The intro image is `ni-barbados-eastern-caribbean-english-harbour-masts.jpg`
  (600×1000). It is reused from the Barbados page, which the brief allows. The
  parent's `np-e-07` was avoided on purpose so the same shot does not appear
  twice between parent and child. `d-06-st-barts-harbour.jpg` is still shared
  with the parent's "Private Yacht Charters" tile.

## 4. Proposed `tools/cost-ranges-data.mjs` row (not applied)

The partial already contains this row, rendered byte-for-byte the way
`renderNoBandSection` would render it, so `p3-8-cost-insert.mjs` sees the page
as live and skips it. That renderer emits `cost-range__figure--unit`. It is the
**only class in the partial that the parent partial does not use**, and it is
defined in `section-shared.css` and used on every no-band page. `includes` and
`excludes` stay in the data but, by design, are not rendered for no-band rows.

```js
  "experiences__cruises__yacht-charters.html": {
    unit: "Priced per boat per week, not per person",
    noBand: "A crewed charter is quoted for the whole boat and crew by the week, and the APA and the gratuity are then worked out as shares of that fee, so a per-person band would move with every guest added to the same boat and describe none of them.",
    includes: [
      "The boat and its full crew for the charter period",
      "Crew wages and the crew's own food",
      "The standard water toys and tender listed in the boat's specification",
    ],
    excludes: [
      "The APA: fuel, food, drink, berths and port fees, drawn down and reconciled against receipts",
      "VAT where the charter is taxed, and any delivery or re-delivery fee",
      "Crew gratuity, flights and hotel nights either side",
    ],
    drivers: [
      "Boat type, length and season, with the guest limit on the certificate: 12 for a commercial yacht of 24 metres and over under the Red Ensign Group Yacht Code",
      "The APA, a percentage of the fee set in each contract and reconciled against receipts before disembarkation",
      "Where the boat is put at your disposal: in the EU a hire of 90 days or less is taxed there, so the VAT differs between Greece, Italy and Croatia",
      "Crew gratuity, which MYBA guidance puts at 5–15% of the gross charter fee, at the charterer's discretion",
    ],
    source: { text: "MYBA guidelines for charter yacht captains & crew", href: "https://www.myba-association.com/files/index.cfm?id=481&crypt=418013" },
  },
```

- Two `includes` lines, "crew wages and the crew's own food" and "standard
  water toys", are normal practice but were not verified against the MYBA
  text, because the proxy blocked it. They are not rendered. Confirm them or
  cut them before relying on them.
- Before adding the row, check that `p3-8-cost-insert.mjs` and the
  `cost-figure-shape` check accept a nested key
  (`experiences__cruises__yacht-charters.html`), and add a fixture if the key
  pattern is new. Also update the derived row counts in the file header.

## 5. Launch-time edits elsewhere (listed only, none made)

1. **`src/data/tiles.mjs` → `cruises`:** change the "Private Yacht Charters"
   exp-card from `status: "pending"` to `status: "live"` with
   `href: "/experiences/cruises/yacht-charters/"`, then run
   `tools/tile-links-apply.mjs`.
2. **`src/data/tiles.mjs` → `cruises`, "A Gulet of Your Own" event-card:** keep
   `href: "/plan-your-trip/?type=cruise"`. Change
   `more: "/travel-journal/mediterranean-october/"` to
   `more: "/experiences/cruises/yacht-charters/#gulets"` with
   `moreLabel: "How a gulet charter works"`. The fragment target is
   `<section class="inclusions-section" id="gulets">` in this page, which
   `card-fragment-resolves` will check.
3. **Parent `src/content-pages/experiences__cruises.html`:**
   - event-card 4: replace the `ev-france-french-riviera.jpg` image with the
     new gulet image (its `event-when` is already "June – September" on
     `main-0puhp3`);
   - FAQ 4 (`pf-cruises-4`, "Is a private yacht charter complicated to
     arrange?"): add a short closing link-down, e.g. "…come back as one
     proposal. More on <a href="/experiences/cruises/yacht-charters/">how a
     private yacht charter is priced and contracted</a>." Leave the answer
     itself unchanged;
   - optional: in the intro-body, link "private yachts"; in the "Charter
     Brokerage" inclusion, link "how a crewed charter is contracted and
     crewed"; in FAQ 6, link "Charters".
4. **Journal reverse links:**
   - `travel-journal__mediterranean-october.html` line 89: link "gulet
     charter" → `/experiences/cruises/yacht-charters/#gulets`;
   - `travel-journal__middle-east-destination-guide.html` line 250: link
     "best explored by gulet" → `#gulets`. The island-fact on line 255 already
     says June – September and needs no change;
   - optional: `travel-journal__caribbean-mexico-destination-guide.html` line
     124, "The right charter operator" → the new page.
5. **Other reverse links from the brief. Each adds 0 words, which matters
   because Greece is at 3,115 and Barbados at 3,316 of 3,500:**
   romance-celebration-travel line 123 "on the deck of a gulet at anchor" →
   `#gulets` (inside a div event-card, so the link is allowed);
   multigenerational-travel FAQ (line ~309) "chartered yacht" → new page, and
   **not** inside the exp-card at line 98, which is itself an `<a>`; greece
   line 11 "boat charter"; barbados-eastern-caribbean line 159 "a crewed
   yacht"; fiji line 169 "Private yacht charter"; europe line 203 "yacht
   charters".
6. **Sibling page:** `/experiences/cruises/mediterranean-small-ship/` does not
   exist yet, so this draft does not link it. The "wrong format for a couple"
   paragraph links `/experiences/cruises/` for now. When the sibling ships,
   point that link at it with anchor text like "a cabin on a small Mediterranean
   ship", and have the sibling link back here once.
7. No change to the `/experiences/` hub, the footer, the nav or
   `public/llms.txt`. The sitemap picks up the URL automatically.
8. Before promoting, merge `origin/main`, run `npm run build`, and confirm that
   the verifier's experience-path rules (schema-required, journal-link floor,
   `--photo` grid gate, FAQ first-sentence ≤25 words) resolve a depth-2
   `/experiences/cruises/yacht-charters/` route.

## 6. Sources, and how they were verified

**The egress proxy blocked every WebFetch** to the official domains:
myba-association.com, nhc.noaa.gov, emy.gr, gov.uk, goturkiye.com, cyba.net
and taxation-customs.ec.europa.eu. Each claim below was confirmed instead
through WebSearch results limited to the official domain, which return the
page title, URL and quoted text. None of these pages was opened directly.
Re-open each one once before launch.

| Claim on the page | Source (official domain) |
|---|---|
| Atlantic hurricane season 1 June – 30 November | NOAA NHC climatology, https://www.nhc.noaa.gov/climo/ |
| MYBA Charter Agreement: APA paid with the fee; the captain reports the balance; top-ups; a statement with receipts before disembarkation, overpayment repaid; fee, delivery/re-delivery fee, security deposit and APA as separate charges | MYBA Charter Agreement, https://www.myba-association.com/files/index.cfm?id=59&crypt=890242 |
| The captain answers directly to the charterer for APA spending; gratuity 5–15% of the gross charter fee, for excellent service, at the charterer's discretion, never solicited | MYBA guidelines for charter yacht captains & crew, https://www.myba-association.com/files/index.cfm?id=481&crypt=418013. Also echoed in MYBA's Guidelines for Retail Charter Brokers, id=1127 |
| MYBA as the association | https://www.myba-association.com/en/what-is-myba.cfm |
| CYBA E-Contract written for inclusive charters on fully crewed yachts, adaptable to plus-expenses terms | https://www.cyba.net/e-contract/ |
| 12-passenger limit for commercial yachts ≥24 m; more than 12 passengers falls under Part B | MSN 1895 (M), REG Yacht Code Part A, gov.uk (URL in the partial) |
| EU VAT: short-term hire of a vessel (≤90 days) taxed where it is put at the customer's disposal (Art. 56) | European Commission, https://taxation-customs.ec.europa.eu/taxation/vat/vat-directive/place-taxation_en |
| Etesians: seasonal north winds blowing mainly in the Aegean in the warm season | HNMS, https://www.emy.gr/en/the-climate-of-greece. **The HNMS text found gives no month range, so the page says "high summer" and names no meltemi months.** |
| Gulets: traditionally built on Türkiye's coast and evolved into motor-sailers; average 70–80 ft, broad beam, two masts, 4–6 cabins; popular in Bodrum, Marmaris and Fethiye; Bodrum's distinct shape; whole boat or cabin for a week | GoTürkiye, https://bluevoyage.goturkiye.com/turkish-gulets |
| Göcek as the start of many Blue Cruises; the bays and islands named | GoTürkiye, https://fethiye.goturkiye.com/gocek |
| Antigua Sailing Week in late April | https://www.sailingweek.com/ (already cited on the Barbados page) |

Internal facts reused, with a link and without restating them: English
Harbour and Falmouth Harbour, ten minutes apart, holding much of the charter
fleet (Barbados page line 159); the Lau Group reached mainly by chartered
yacht, a 7–10 day private charter from Savusavu, and the May–October dry
season (Fiji page lines 80, 169, 216); October as the last gulet month
(October post line 89).

**Left out because they could not be verified:**
- an APA percentage. MYBA, CYBA and IYBA publish none that could be found;
  the 25–40% figures online come from broker blogs. The page says "a
  percentage set in the contract";
- country VAT rates for Greece, Italy and Croatia;
- the Greek cruising tax;
- meltemi month ranges;
- a "Saturday to Saturday" norm;
- any booking lead time;
- any BVI permit detail.

## 7. Choices to review

- **`#gulets` is a section, not an event-card.** The review asked for "a
  section with id="gulets"", so it is an `inclusions-section` with four items:
  The Boat, The Routes, The Season, and Whole Boat or Cabin. The hero
  secondary CTA "A Gulet of Your Own ↓" points there. The gulet event-card
  links to it with `event-more`. Only one element carries the id.
- **The events h2 is "Charter Weeks to Start From"**, not the parent's "Trips
  We Plan Often". That heading would claim a booking frequency, which the
  owner rule excludes.
- **Three event-cards, not four.** The optional Lau Group card was dropped
  because the Fiji exp-card and the Fiji page already cover it, and it would
  have been a fourth image gap.
- **Event CTAs use `/plan-your-trip/?type=cruise`**, matching the parent's
  event-cards. The hero and exp-cta use `/plan-your-trip/`.
- **The page does not cover shared small-ship or cabin cruising.** It says once,
  in the intro, that a couple on their own is better off in a small-ship cabin,
  and links the parent.
- **One "FAQ" candidate was dropped:** "Gulet, catamaran or motor yacht?",
  because the boats section answers it. Another, "How far ahead to book?", is
  not included: the owner rule excludes lead times as HYMT practice. That leaves 8 FAQs, ids
  `pf-yacht-charters-1…8`. Every opening sentence is 25 words or fewer
  (longest: 25), and every answer runs 64–75 words.
- Time-sensitive facts are dated by a visible
  `<time datetime="2026-10-03">October 2026</time>` note at the foot of the
  seasons strip.
