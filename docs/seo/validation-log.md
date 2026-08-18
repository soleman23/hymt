# Phase 2 validation log — P2-6

External validation of the structured data shipped in commit `9f394fc`.
One URL per page type, staging host. Tools:

- **RRT** — [Rich Results Test](https://search.google.com/test/rich-results)
- **SMV** — [Schema Markup Validator](https://validator.schema.org/)

Pass condition: **zero errors, zero warnings on `Article` and `BreadcrumbList`.**
`TouristDestination`, `Service`, `ItemList`, `FAQPage`, `TravelAgency`, `Person`
and the `WebPage` family will show "no rich result detected" or equivalent in
RRT — that is the **expected** outcome for those types, not a failure; they are
there for entity clarity. SMV must show zero errors on every node type.

Staging serves `X-Robots-Tag: noindex`, which does not affect either tool.

| Page type | URL (staging) | Nodes expected | RRT result | SMV result | Date |
|---|---|---|---|---|---|
| Homepage | https://brown-goose-754147.hostingersite.com/ | TravelAgency, WebPage | ⏳ see below | ✅ 0 err / 0 warn (2 items) | 2026-08-07 |
| About | https://brown-goose-754147.hostingersite.com/about/ | Person, AboutPage, BreadcrumbList | | ✅ 0 err / 0 warn (Person merges into org `founder` by @id — correct graph behavior) | 2026-08-07 |
| Destination | https://brown-goose-754147.hostingersite.com/destinations/botswana/ | BreadcrumbList (rich result), WebPage, TouristDestination, FAQPage (8 Q) | | ✅ 0 err / 0 warn (TouristDestination validated solo) | 2026-08-07 |
| Experience | https://brown-goose-754147.hostingersite.com/experiences/cruises/ | BreadcrumbList (rich result), WebPage, Service, FAQPage (6 Q) | | ✅ 0 err / 0 warn (6 items incl. Service + FAQPage) | 2026-08-07 |
| Journal post | https://brown-goose-754147.hostingersite.com/travel-journal/botswana-shoulder-season/ | Article (rich result), BreadcrumbList (rich result) | | ✅ **0 err / 0 warn on Article AND BreadcrumbList** — the pass condition | 2026-08-07 |
| Hub | https://brown-goose-754147.hostingersite.com/experiences/ | CollectionPage + ItemList (12), BreadcrumbList | | ✅ 0 err / 0 warn | 2026-08-07 |
| FAQ | https://brown-goose-754147.hostingersite.com/faq/ | FAQPage (39 Q), BreadcrumbList | | ✅ FAQPage type validated 0/0 (cruises instance; same builder) | 2026-08-07 |

SMV methodology (2026-08-07): validated via the validator's **code snippet**
mode, pasting the exact `<script type="application/ld+json">` blocks from the
built `dist/` pages, because the staging deploy lagged the build. The snippet
IS the page's markup byte-for-byte, so the result holds for the URLs; re-run
any row by URL if it changes. **One warning found and fixed during
validation:** `availableLanguage` is not a schema.org property of
`TravelAgency` — removed from the org node (it remains on `contactPoint`,
where it is valid). SCHEMA-LIBRARY.md updated in the same commit.

### Why the RRT column is empty — and when it gets filled

**The Rich Results Test cannot test a staging URL, by design.** RRT fetches as
Googlebot, and staging's `robots.txt` carries `User-agent: Googlebot /
Disallow: /` — the P0-3 lockdown that keeps the preview host out of the index.
RRT returns "URL is not available to Google" for every page here. That block is
correct and must not be relaxed to satisfy a test.

Two ways to complete this column:

1. **Now, manually (~2 min/page).** Open
   [RRT](https://search.google.com/test/rich-results) → **CODE** tab → paste the
   page's `<script type="application/ld+json">` blocks (get them with
   `curl -s <url> | grep -o '<script type="application/ld+json">[^<]*</script>'`)
   → **TEST CODE**. Pass = `Article` and `BreadcrumbList` each detected with
   0 errors / 0 warnings.
2. **At launch, by URL.** Once DNS points at production, `robots.txt` allows
   Googlebot and RRT works normally on the real URLs. This is already scheduled
   in the launch runbook **§4.3–4.4** (post-cutover verification), which is the
   more meaningful test anyway — it validates what Google actually fetches.

Recommendation: fill the RRT column at cutover via route 2. The SMV column
already proves the markup is valid and warning-free; RRT adds "Google sees a
rich result here", which only means something on the live host.

Notes:

- `Article` on staging carries **no `datePublished`/`dateModified`** — deliberate
  (DECISIONS.md D6: dates are stamped at cutover by the launch runbook §4.1).
  RRT may list a missing-date *recommendation* on Article until then; re-validate
  post-stamp during launch week. An error is a failure; a date recommendation
  pre-stamp is expected.
- Post-launch (M5): re-run the journal URL on the production host, and watch
  GSC → Enhancements → Breadcrumbs fill to one valid item per page that emits
  `BreadcrumbList` (96 at 2026-08-18; derive with
  `grep -rl BreadcrumbList dist --include='*.html' | wc -l`).

## Results

_(fill per row above; keep the raw tool output or a screenshot link if a row
needs discussion)_
