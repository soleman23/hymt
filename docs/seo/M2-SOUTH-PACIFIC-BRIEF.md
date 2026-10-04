# M2 first release: South Pacific route selection

Prepared October 4, 2026. Draft for #217 in milestone 11; not a release or
expert approval. This follows the owner-approved M1 handoff: South Pacific
first, sports/events second, then limited hotel/safari/family pilots. Private
analytics and the ranking worksheet remain in the restricted evidence folder.

## Traveler decision and URL roles

The hub answers: **which destination and route shape fit my time, party,
interests and tolerance for transfers?** Keep its existing URL. It compares
one island base, two islands in one country, an active country route and a
country route plus an island stay. The 10–14-day example is an editorial
planning window, not a validated itinerary or a universal minimum stay.

| Existing page | Role | Boundary |
| --- | --- | --- |
| `/destinations/south-pacific/` | Choose destination and route shape; start an inquiry | No detailed day-by-day itinerary, specific supplier recommendation or regional nightly price |
| `/travel-journal/south-pacific-destination-guide/` | Deeper regional overview | Return the undecided reader to the hub comparison; do not create another regional guide |
| Fiji, French Polynesia, Cook Islands, Vanuatu, Australia, New Zealand destination pages | Local trip detail | Country-specific seasons, access and accommodation require their own evidence checks |
| `/destinations/maldives/` and the Maldives villa comparison | Alternative Indian Ocean holiday and room choice | Never imply the Maldives is a South Pacific stop |

The existing hub and guide substantially overlap in introductory destination
copy. The hub draft replaces that duplication with decisions and constraints.
The broader guide's legacy claims are not validated by this hub refresh.

## Research and content changes

Live searches on October 4 used the official tourism domains to verify
seasons, island transfers, trip duration examples and route scope. This is
source verification, **not** proof of search volume or a distinct comparison
SERP. The closed #211/#234 handoff supplies the existing-URL intent hypothesis;
no private query counts are reproduced here.

- Replace the single region-wide May–October season with Fiji/French Polynesia,
  New Zealand and Australian regional distinctions.
- Remove invented guest counts, guide tenure, wildlife guarantees, named
  operating rhythms, client outcomes and a default recommendation to combine
  countries. No firsthand trip claim is added.
- Keep all six country destinations and link the traveler to a next decision.
- Remove the unsupported $600–$1,900 nightly figure. The linked general Fiji
  tourism homepage did not substantiate an all-region luxury budget.
- Add identical-assumption and itemized-cost checklists. **Numeric budget
  bands remain an open #217 acceptance item:** Mark must supply comparable
  dated quotes, currency, party, season, room category, taxes and inclusions
  before any such bands are drafted or approved.
- Keep the current title, description and canonical. Hero copy and visible
  comparison labels now describe the route-selection task. A later snippet
  experiment can change metadata in its own baseline-approved commit.

## Conditional guide briefs and order

These briefs authorize research only. Do not create their candidate URLs,
add links to unbuilt guides or mark their issues complete from this draft.

| Issue | Distinct decision to test | Persona / scope to establish | Gate before publication |
| --- | --- | --- | --- |
| #219, after hub | Fiji versus French Polynesia for one defined traveler | Mark supplies a real recurring question, party, origin and travel window | Live comparison SERP, current logistics, conditional recommendation, comparable quote assumptions and Mark's review |
| #218, conditional | How many stops fit a two-week holiday? | 12–15 days including travel; at least two feasible options and a simpler alternative | Distinct intent from hub/guide/#219, current airline/boat legs, buffers and advisor review |
| #220, conditional | How do island connections, baggage and disruption change a route? | A small set of named island pairs and real operator restrictions | Logistics SERP, current timetables and baggage sources; combine with #218 if too little distinct advice remains |
| #221, deferred | Maldives versus Bora Bora versus Fiji on cost and fit | Same origin, dates, party, lodging category and inclusions | Test #219 first; no new URL until comparable quotes and distinct demand support it |

Independent M2 work remains open: #212 hotel-upgrades guide, #213 October
Mediterranean guide, #214 Europe hub, #215 culture and #216 food/wine. #35
needs current field/lab performance evidence. This PR does not resolve those
issues or assert that mobile Core Web Vitals improved.

## Contextual journey snapshot

Initial source map for #222, to be crawled again after release:

| From | Contextual next step | Purpose |
| --- | --- | --- |
| South Pacific hub | All six country pages | Country detail after route selection |
| Hub | Beach/island, adventure, family, romance experiences | Define activity and party requirements |
| Hub | Existing regional guide and Maldives villa guide | Deeper region reading or a distinct room-choice comparison |
| Existing regional guide | Hub `#choose-your-route` | Return an undecided reader to the route comparison |
| Fiji / French Polynesia pages | Hub `#choose-your-route` | Compare the holiday shape before requesting a plan |
| Hub | `/plan-your-trip/` or `/contact/` | Full trip brief or one planning question |

No upcoming guide has a public incoming link yet because no new guide is
published. Existing child-to-region links are retained. Local QA must verify
targets, anchors, mobile scanning and the inquiry navigation. Real inquiry
delivery remains the separate M1 gate; a local link click is not delivery proof.

## Release and measurement gate

1. Complete the companion editorial record: Mark reviews fit and route advice,
   current budget evidence and existing image rights. Research is not approval.
2. Run the repository build, link/anchor checks and 375/768px visual review.
3. Obtain release authorization. A merge to main auto-deploys production.
4. Record the actual live timestamp and verify the production page and inquiry
   route. The source-check date is not a release or journal modification date.
5. In the private scorecard, compare the unchanged-URL cohort at 28 and 60 days
   (milestone checks), then 30/90/180 days (#217). Inspect clicks, impressions,
   CTR and position alongside organic landing activity and delivered qualified
   inquiries. Log sample size and seasonality; do not infer a win from rank alone.

These dates are relative to the actual release. Calendar reminders and GSC
indexing requests have **not** been scheduled or submitted while the PR is a
draft. Add them when the reviewed update is live.

## Local validation — October 4, 2026

- `npm run build`: 132 pages verified, 1,113 check fixtures passed, unchanged
  head baseline, current enforcing CSP hashes and all referenced assets present.
- Chromium at 375, 768 and 1440px: no horizontal overflow, one H1, four route
  choices, no nested links or broken loaded images, no console/page errors.
  Cards stack at 375/768px and form two columns at 1440px.
- The answer capsule is 59 words. All eight FAQ answers are visible without
  JavaScript; the first accordion opens correctly with JavaScript enabled.
- The mobile CTA navigates to the existing four-step inquiry container.
  No submission, inbox-delivery check or analytics success event is claimed.
- Hub: 64 local links/fragments checked; Fiji: 59; French Polynesia: 60;
  existing regional guide: 46. All 229 targets resolved in the built site.
- Screenshots and JSON checks are local in `output/playwright/`; they contain
  the draft site only and are excluded from this PR's explicitly staged files.

These results verify this draft's rendering and navigation, not expert
approval, production deployment, field performance or organic-search impact.
