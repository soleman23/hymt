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
| D5 | Author identity | **All journal posts are authored by Mark Sole** (29 when decided; 32 at 2026-08-18 — the decision covers every post, not a count). Photo + bio are publishable; Devin supplies the assets later. | P1-4 (mark-note photo), P2-3 `Person` + About headshot, journal bylines |
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

---

# Later decisions

Decisions taken after Phase 0. Same rule: canonical here, do not re-litigate
without updating this file in the same commit.

## D7 — Image generation runs on Higgsfield credits, not the Playwright runner

**Decided 2026-08-12 by Devin. Runner deleted 2026-08-24 (#92).**

`tools/image-pipeline/`'s Playwright runner drove the higgsfield.ai web app in a
logged-in browser to get Unlimited generation, on the reasoning that credits were
the scarce resource. It never generated an image: three selectors needed a
signed-in DOM dump, the pipeline hard-stops until Unlimited is confirmed, and
behind that sat a seven-step Google OAuth setup.

**The premise did not survive contact with the numbers.** The credit route has
done the work instead — 44.6 credits for 62 cards across 12 pages by 2026-08-13,
against a balance that was 1700 on 2026-08-24. Credits were never the constraint;
concept quality and reviewer time were.

Consequences, all deliberate:

- Generation goes through the **Higgsfield MCP connector**, `seedream_v5_lite`,
  16:9, one `generate_image_batch` of at most 12. The workflow, the house style
  and every failure mode found so far live in `docs/seo/HANDOFF-photo-rollout.md`.
- Concepts are written from each card's own copy and **approved before any
  credit is spent**. This is a standing instruction, not a nicety.
- The two pre-generation checks stay mandatory: both Drive MIME sweeps, and
  `public/assets/img/`. `npm run build` prints the unreferenced-image list at the
  end of every run for exactly this reason — read it before generating.
- `lib/model-router.mjs` and `lib/tracker.mjs` are kept. See that directory's
  README for what each one still earns its place with.
- Do **not** resurrect the runner, and do not ask for the Google setup again.

## D8 — 21 cost rows ship without a headline figure, permanently

**Decided 2026-08-24 (#108).**

Of the 28 rows in `tools/cost-ranges-data.mjs` that render no cost block, only a
minority are waiting on a number. The rest are held because a nightly two-adult
band is **the wrong unit** — a voyage priced per cabin and per departure, a row
spanning four islands or three countries, a government fee that is one line of a
day rate. No supplier confirmation unblocks those, and researching a figure for
them produces one that is precise and false.

So they are not a backlog. They ship a cost section with the includes, excludes,
drivers and source intact and **no headline band**, plus one honest sentence on
why a single band would mislead. `held` as a data state is retired; the
replacement field is `noBand`.
