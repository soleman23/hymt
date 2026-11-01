# Editorial review: How hotel upgrades work

Prepared with `EDITORIAL-REVIEW-TEMPLATE.md`, November 1, 2026, for #212.
**Decision: review required.** Nothing below is approved until the owner
records approval on the PR. An empty row or `review required` is not approval.

## Page decision

| Field | Entry |
| --- | --- |
| Page and source | `/travel-journal/how-hotel-upgrades-work/`; `src/content-pages/travel-journal__how-hotel-upgrades-work.html` |
| Editorial owner / expert reviewer | Mark Sole |
| Writer / researcher | Claude Code; independent research and existing-page refresh |
| Review date | Pending |
| Decision | Review required |
| Published-date evidence | Existing URL, `publishDate` 2026-09-01; no new article |
| Substantive update evidence | `modifiedDate` 2026-11-01; change to the actual release date if the merge lands later |
| Next review | Release +30/+90 days; earlier on a program-rule change |
| Earlier trigger | Marriott Program Rules or Internova SELECT benefit change; correction request |

## Traveler decision and URL role

The page answers one question: **should I count on a free upgrade, or book
the room I want?** It keeps its URL, title and canonical. No second upgrades
URL is created. `/travel-journal/what-hotel-descriptions-actually-mean/`
remains the room-wording guide; this page links to it rather than repeating it.

## What changed and why

- A 62-word answer capsule under the first `<h2>` and a six-row
  request-or-book decision table.
- **Removed: the claim that HYMT books through Virtuoso or Signature Travel
  Network.** DECISIONS.md D2 records Travel Leaders Network as the only
  consortium membership. The page now names Travel Leaders Network and its
  parent's SELECT program, with that program's published benefits dated.
- Removed unsourced specifics: the 24–48-hour pre-arrival meeting, "4–6pm"
  arrival advice, "the single most reliable driver" of upgrades, and the
  "consistent upgrade consideration … measurable" callout.
- Reversed the length-of-stay claim. The old copy said longer stays upgrade
  more easily; Marriott's rule applies the upgrade "for the entire length of
  stay", so a longer stay needs the better room free for more nights.
- Reconciled the occasion advice with the romance-travel callout: note the
  occasion on the reservation, expect a gesture, not a category change.
- Author bio no longer claims "two decades of conversations with front office
  managers, GMs, and revenue directors"; it matches the About page.
- Description, hero headline and deck rewritten to match; title unchanged.

## Material claim log

| Claim / section | Type and evidence | Scope / checked | Reviewer | Decision |
| --- | --- | --- | --- | --- |
| Marriott Platinum Elite and above: complimentary upgrade "subject to availability upon arrival", "for the entire length of stay", includes suites; brand exclusions | Independent research: [Marriott Bonvoy Program Rules](https://www.marriott.com/loyalty/terms/default.mi) §4.3.c.ii | Rules effective 1 January 2024 as served 2026-11-01 | Mark | Review required |
| Platinum Elite threshold is 50 qualifying nights | Same source, elite qualification table ("50 to 74 Qualifying Nights") | 2026-11-01 | Mark | Review required |
| Nightly Upgrade Awards must be applied to every night | Same source | 2026-11-01 | Mark | Review required |
| HYMT is part of Travel Leaders Network; Internova runs SELECT Hotels & Resorts | DECISIONS.md D2; [Internova release, 2023-03-02](https://internova.com/?p=2409) | Release names Travel Leaders Network among eligible networks | Mark: confirm HYMT can book SELECT rates today | Review required |
| SELECT benefits: upgrade "based on availability", breakfast for two, amenity up to $100, early/late when available | Supplier: same Internova release | Published March 2023; may have changed; per-property | Mark: confirm current benefit list | Review required |
| "When I quote a hotel, I tell you which program applies … before you pay" | Mark's practice (first person) | Generic process, no client outcome | Mark must confirm or rewrite | Review required |
| Third-party discount rates may not qualify for loyalty benefits | Editorial; qualified "may not" | Generic | Mark | Review required |
| Later arrival "sometimes" leaves more options | Editorial; stated as a tendency, not a rule | Generic | Mark: keep or cut | Review required |
| Mentioning reviews/followers tends to work against you | Retained from the existing page; Mark's opinion | Generic | Mark | Review required |

No supplier quote, client outcome, exclusive-access or guaranteed-benefit
claim is added. Hilton and Hyatt terms pages refused automated fetches on
2026-11-01, so their programs are not described.

## Image provenance

No image added or changed. The existing hero
`jh-08-suite-interior-golden-hour.jpg` and author portrait are retained;
their provenance is outside this review's scope.

## Out-of-scope finding

Five other pages say HYMT is a **Virtuoso** member (`destinations__asia`,
`destinations__caribbean-mexico`, `destinations__europe`,
`destinations__north-america`, `experiences__all-inclusive-vacations`),
contradicting D2. Tracked separately, not changed in this PR.

## Release checks

- `npm run build` passes, 132 pages; head baseline updated in its own commit.
- Local browser at 375 px and desktop: one H1, no horizontal overflow, no
  console errors; the decision table stacks with inline "Do/Why" labels.
- Do not mark #212 acceptance items for live links or cohorts complete until
  after release.
