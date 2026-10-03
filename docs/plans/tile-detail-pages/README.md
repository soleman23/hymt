# Tile detail pages: planning work in progress

This branch, `plan/tile-detail-pages`, carries the unfinished planning work for
giving every sub-experience tile on the 12 experience pages a real detail-page
destination. It is planning data only. **Never merge it.** A merge to `main`
deploys production, and nothing here belongs on the site. Delete the branch
once the plan is approved.

The task is planning only: no edits to `src/`, `dist/`, images, links or
config, and no commits other than this folder, until the owner approves the
finished plan.

## Where it stands (2026-10-03)

| Step | State |
| --- | --- |
| Discovery: docs, layouts, verifier, sitemap, production comparison | Done. Findings in `drafts/current-state-architecture.md`. |
| Per-page tile audits | 11 of 12 done (116 of 126 tiles). `wellness-retreat-travel` was cut off by a usage limit. |
| Independent architecture read | Done: `architecture-read.json`. |
| Routing rules, data model, template choice, QA checklist | Drafted: `drafts/rules-data-template-qa.md`. Revisit after consolidation. |
| Wellness audit, consolidation, adversarial verification, new-page briefs | Done 2026-10-03: `remaining-results.json` (56 subjects, 34 reviewed by two lenses, 0 refuted, 13 briefs). |
| Final plan in the 18-section order the owner specified | Done: `final/tile-plan.html`, published as a private artifact for owner review. Rebuild with `node final/matrix.mjs && node final/build.mjs` (paths inside point at the session scratchpad; adjust before reuse). |

Tile counts: 78 `.exp-card` sub-experience tiles and 48 `.event-card`
"Trips We Plan Often" cards. Every one links to `/plan-your-trip/` in source,
in `dist/` and on production (all 12 pages fetched 2026-10-02).

## Files

| File | What it is |
| --- | --- |
| `audit-results.json` | The 11 finished page audits in full, keyed by experience slug. One row per tile with intent, candidates and fit scores, action, target, gaps, link, breadcrumb and schema notes, risk, images, priority, effort and dependencies. |
| `compact-rows.jsonl` | The same 116 rows trimmed to one line each (under 2,000 characters) for agents to read in chunks. |
| `page-notes.json` | Page-level notes and hub-card mismatches from each audit. |
| `architecture-read.json` | Page assembly, blast radius, link-change mechanics, template options, data-model options, verifier checks to add, new-page checklist, risks, production vs source. |
| `drafts/` | Audit-independent plan sections written before the audit finished. |
| `inputs/` | The registries every agent reads: `tiles-by-page.json`, `dest-registry.json`, `journal-registry.json`, `image-files.txt` (the gitignored `public/assets/img/` listing), and the two extraction scripts that produced them. |
| `workflow-remaining.js` | Workflow script for the remaining phases. Paths are relative to the repo root. |

## How to finish

1. Check out this branch and stay at the repo root.
2. Run `workflow-remaining.js` with the Workflow tool (`scriptPath`). It audits
   Wellness, consolidates all 126 rows into one canonical target per subject,
   puts every decision except high-confidence unchanged reuse through two
   adversarial lenses, and briefs each surviving new page.
3. Assemble the plan in the owner's order: executive recommendation;
   current-state architecture; key findings and risks; the complete
   tile-to-page matrix (one row per tile, all 22 columns the owner listed,
   controlled action labels); routing rules; pages to reuse unchanged; pages
   to enhance; new destination pages; new experience-detail pages; combination,
   ambiguous and rename decisions; template and data architecture; SEO/AIO and
   duplicate-content strategy; internal-linking and breadcrumb strategy;
   content and image requirements; file-level implementation plan; phased
   roadmap A to F; QA and acceptance checklist; open owner decisions.
4. Separate verified findings from recommendations, label uncertainty, and
   keep open questions to genuine owner decisions.
5. Deliver it as a private artifact or page the owner can review. Do not
   implement anything before approval.

## Disagreements the consolidation must settle

These came out of the 11 audits and are listed in the consolidation prompt:

- **St. Lucia** is proposed both as a new `/destinations/st-lucia/` page and
  as a link to the Eastern Caribbean page's `#places` grid.
- **Walt Disney World, Disneyland and Universal Orlando** produced two new
  URLs, `/destinations/orlando/` and `/destinations/disneyland/`.
- **Golf and Horse Racing** went to journal field reports while Tennis and
  Formula 1 got new detail pages. **Skiing & Heli-Skiing** went to a journal
  post although Aspen and Canadian Rockies pages exist.
- **Willamette Valley** went to a journal post while the other wine tiles go to
  destination pages.
- **Mexico** appears under five experiences with three targets, including a
  proposed `/destinations/oaxaca-mexico-city/`.
- **Greece and Italy** each collected several enhancement specs that must
  collapse into one.
- Two tiles are owner decisions as audited: **Namibia** (create a page, or swap
  the tile to Zambia & Victoria Falls) and **Football & Rugby** (keep it as a
  line of business or retire it).

## Known constraints

- Country destination pages fail the build above 3,500 body words; 27 have
  under 200 words of headroom. `inputs/dest-registry.json` has each count.
- The GitNexus MCP server was down for the local session and its index was
  four commits stale. Run `impact()` before editing any symbol and
  `detect_changes()` before any implementation commit.
- `public/assets/img/` is gitignored. Use `inputs/image-files.txt` or run
  `npm run restore` before checking images on disk.
