# Phase 0 decision record — the six [DECISION] answers

Answered by Devin, 2026-08-07 (P0-6). These are the canonical answers; every
task that the plan marks `[DECISION-n]` reads from here. Do not re-litigate
without updating this file in the same commit.

| # | Decision | Answer | Consumed by |
|---|---|---|---|
| D1 | GA4 direct vs GTM | **GA4 direct via gtag.js, no GTM.** Implemented in `src/components/Analytics.astro`; real measurement ID still owed (placeholder `G-XXXXXXXXXX`). | P0-5 (done) |
| D2 | Consortium / affiliations | **HYMT is part of the Travel Leaders Network.** No other consortium or association memberships to publish. | About page (visible), P2-2 `Organization.memberOf` + `sameAs`, P2-3 Person affiliations |
| D3 | Public address | **(a) City/region only: Bend, Oregon.** No street address anywhere on the site or in schema. | P2-2 `address` (locality + region only), Google Business Profile |
| D4 | Google Business Profile | **Yes — Devin creates it** as a service-area business with the address hidden. The profile URL joins `sameAs` once it exists. | P2-2 `sameAs`, off-site entity building (#38) |
| D5 | Author identity | **All 29 journal posts are authored by Mark Sole.** Photo + bio are publishable; Devin supplies the assets later. | P1-4 (mark-note photo), P2-3 `Person` + About headshot, journal bylines |
| D6 | Journal publication dates | **Go-live policy: each post is dated the day it goes live at cutover. Never backdate.** The hero display strings (e.g. "May 2026") are replaced at P1-5 with the real go-live date — they are not publication dates. | P1-5 `publishDate`/`dateModified`, launch runbook §4 |

## Practical notes

- **D6 means P1-5 cannot hardcode dates now.** Implement `publishDate` so the
  actual value is set (or finalized) during the launch window — e.g. filled in
  the final pre-cutover build — and `dateModified` starts equal to it.
- **D2 wording on the site:** say "part of the Travel Leaders Network" and no
  more until Mark confirms the exact membership level and profile URL.
- **D4 sequencing:** GBP is the only legitimate route to review stars
  (self-controlled reviews are ineligible per Google policy) — create it before
  the launch-week press/directory pushes in #38.
- **P1-4 logo decision (Mark, 2026-08-07):** the 53 `mark-note__photo` slots
  keep the site logo for launch — a conscious decision closing #15, not an
  oversight. The images carry `alt="Hit Your Mark Travel"` (accurate: it is
  the logo) plus full intrinsic attributes, enforced by the verifier's
  `img-attrs` check. If a real photo of Mark arrives later it enters through
  the image pipeline and replaces the logo in one pass; D5's
  photo-is-publishable answer still stands for the About page and the P2-3
  `Person` schema.
