# Editorial review: Food and wine travel route sketches

Prepared with `EDITORIAL-REVIEW-TEMPLATE.md`, November 1, 2026, for #216.
**Decision: review required.** Nothing below is approved until the owner
records approval on the PR. An empty row or `review required` is not approval.

## Page decision

| Field | Entry |
| --- | --- |
| Page and source | `/experiences/food-wine-travel/`; `src/content-pages/experiences__food-wine-travel.html` |
| Editorial owner / expert reviewer | Mark Sole |
| Writer / researcher | Claude Code; independent research and existing-page refresh |
| Review date | Pending |
| Decision | Review required |
| Published-date evidence | Existing URL; no new page |
| Next review | Release +30/+90 days; refresh 2027 Alba and Hospices dates by August 2027 |
| Earlier trigger | Event date change, a winery or dairy visit policy change, correction request |

## Traveler decision and URL roles

The page answers: **which food and wine route fits my time, season and
group, and what do I book first?** Title, description and canonical are
unchanged.

| Page | Role | Boundary |
| --- | --- | --- |
| `/experiences/food-wine-travel/` | Choose a region and a 4–7-day route shape | No day-by-day winery list |
| `/travel-journal/napa-sonoma-winery-route/` | Day-by-day 2- and 3-day Napa/Sonoma route | Already links back to this page |
| `/travel-journal/willamette-valley-winery-route/` | Day-by-day Willamette route | Already links back to this page |
| France, Italy, Spain, Japan destination pages | Country detail and itineraries | Linked from each route card |

## What changed and why

- New answer capsule. The old one said seven regions spanned "3 different
  harvest calendars"; all seven are Northern Hemisphere.
- **"Trips We Plan Often" replaced by "Choose a Food & Wine Route"** (`#routes`):
  six route sketches (Napa & Sonoma, Willamette, Burgundy, Emilia-Romagna with
  a Piedmont option, Basque Country & Rioja, Tokyo & Kyoto), each with route,
  group and transport, what to book first, and tradeoff. Napa and Willamette
  now sit here as routes and link to their journal guides.
- Removed unverifiable specifics from the old itineraries and intro: the
  "aging cave at 5 a.m.", a négociant "twenty vintages", a sfoglina "on Tuesday
  mornings", an acetaia "for six generations", "a list that goes back to 1947",
  a ramen school chef "who trained under two of the country's best", a sushi
  chef's "eighteen years", vines "planted in 1902", a "fourteen euros" lunch, a
  tsukemen shop "in thirty-four years", the culinary-guide résumés, and the
  "trattoria that doesn't take bookings except for regulars".
- **Corrected:** "the best tsukiji tuna auction". The wholesale market and
  its auction moved to Toyosu in October 2018; Tsukiji's outer market remains.
- **Qualified:** the Hospices de Beaune auction "for clients who want to
  attend" — the sale is for accredited buyers; the surrounding weekend is open.
- **FAQ "Can you get reservations…"** no longer says French Laundry and
  allocation tastings are "routinely available". It now says what an advisor
  can and cannot guarantee.
- FAQ on bringing wine home now cites CBP and the state-of-arrival rule.
- Softened superlatives: "greatest density… on earth", "most food-serious
  culture on earth", "more Michelin stars than any city", "more Michelin stars
  per capita than any city", "the farm-to-table tradition was invented here",
  "the most exciting food culture in the world".
- Seasons strip: Burgundy and Bordeaux harvest timing made less precise.
- `src/data/tiles.mjs` event-card rows updated to the six new cards
  (`tile-links-apply --check` passes). Mediterranean October teaser matches #213.

## Material claim log

| Claim / section | Type and evidence | Scope / checked | Reviewer | Decision |
| --- | --- | --- | --- | --- |
| Hospices de Beaune auction 15 Nov 2026; sale for accredited buyers; weekend events open | Independent research: [France.fr](https://www.france.fr/en/event/wine-auction-at-hospices-de-beaune/), [Sotheby's Beaune](https://www.sothebys.com/en/about/locations/beaune?locale=en), [Beaune Tourism events](https://www.beaune-tourism.com/) | 2026 edition; 2026-11-01 | Mark | Review required |
| Alba white truffle fair, weekends 10 Oct – 6 Dec 2026 | Independent research; several listings agree, official fieradeltartufo.org not retrieved | Confirm on the official site before quoting | Mark | Review required |
| Parmigiano Reggiano is made every morning; dairy visits booked in advance | Official: [Consorzio visit booking](https://www.parmigianoreggiano.com/dairies-visit-tasting/); [Reggio Emilia Welcome](https://www.reggioemiliawelcome.it/en/food-and-wine/flavour-places/cheese-dairies) (process starts about 08:00) | 2026-11-01 | Mark | Review required |
| Many Napa wineries host by appointment only | Independent research: county use-permit conditions and winery policies (e.g. [Cakebread](https://www.cakebread.com/tasting-policy/)); varies by winery | Qualified "many" | Mark | Review required |
| Toyosu tuna auction since Oct 2018; observation deck by lottery; Tsukiji outer market remains | Independent research (travel guides); official Toyosu site not retrieved | 2026-11-01 | Mark | Review required |
| Txokos are private; a member must host | General knowledge of Basque gastronomic societies | Stated as a possibility, not a booking | Mark | Review required |
| US travelers 21+: 1 liter duty-free; state of first arrival sets limits | [CBP prohibited and restricted items](https://www.cbp.gov/travel/us-citizens/know-before-you-go/prohibited-and-restricted-items) (state rule); 1-liter exemption widely published | 2026-11-01 | Mark | Review required |
| Six route sketches: lengths, bases, group/transport and tradeoff advice | Editorial planning framework; Mark's practice | Starting points, not itineraries | Mark: approve fit, pace and wording | Review required |
| Willamette tasting rooms "generally smaller and more personal", "many prefer appointments" | Editorial, consistent with the existing Willamette route guide | Generic | Mark | Review required |
| FAQ reservations answer | Mark's practice | No guarantee language | Mark | Review required |

No new firsthand, client-outcome, exclusive-access or supplier-benefit claim
is added. The cost range ($750–$1,500, verified August 2026) is unchanged.

## Image provenance

Two existing pipeline images are newly used on this page:
`ni-napa-sonoma-crush-pad-harvest.jpg` (600×1000, also on the Napa & Sonoma
destination page) and `willamette-valley-dundee-hills-harvest.jpg` (1600×904,
already on this page in the Willamette card). The four existing event images
are kept; the Tokyo image's alt text no longer says "Tsukiji standing counter".
Provenance of all six is outside this review's scope.

## Release checks

- `npm run build` passes, 132 pages; tile-map parity passes; no metadata change.
- Local browser (CSP-enforcing server) at 375 px and 1440 px: one H1, six
  route cards, no horizontal overflow, no console errors; all 20 internal
  link targets and fragments resolve.
- After release: add the route-card journeys to the #222 link snapshot and
  schedule the private 30/90-day cohort check.
