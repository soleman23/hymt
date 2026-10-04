# HYMT SEO + AIO Program — Document Set

This folder contains the live site's standards, earlier migration plans, and
dated verification records for the `soleman23/hymt` repository (Astro 7, static
output, deployed to Hostinger).

**Production domain:** `https://www.hymtravel.com`
**Development domain:** `https://brown-goose-754147.hostingersite.com`
**Current state (checked 2026-10-02):** the Astro site serves the production
domain. The cutover occurred on September 1 Pacific; see
`HANDOFF-cutover-2026-09-02.md`. Hostinger's current completed deployment was
checked October 3 as commit `5f547a7e`; its deployment ID, displayed time,
phone, redirect, canonical, and indexability checks are in
`M1-LIVE-AUDIT-2026-10-02.md`.

**The same-domain platform migration is complete.** Hostinger now serves the
Astro site. No Wix page, code, hosting, or runtime dependency carries forward.
Confirmed legacy URLs redirect on Hostinger. Search Console Change of Address
does not apply because the domain did not change. The older plans below remain
historical records where they describe pre-cutover steps.

---

## The files

| File | What it is | Who reads it |
|---|---|---|
| `SEO-AIO-PLAN.md` | The master plan. Findings from the audit, then Phases 0–6 with numbered, checkable tasks. **This is the handoff document.** | Claude Code, Mark, Devin |
| `EXECUTION-PROMPTS.md` | Repo setup steps + the exact phase-by-phase prompts to paste into Claude Code to complete the plan. | Devin |
| `LAUNCH-RUNBOOK.md` | The Wix-to-Hostinger website, DNS and registrar migration, with staged rollback. | Whoever runs the cutover |
| `SCHEMA-LIBRARY.md` | Every JSON-LD block the site should emit, as copy-paste code, with the Astro component that generates it. | Claude Code |
| `CONTENT-STANDARDS.md` | The permanent rules for writing any new page, destination, experience, or journal post. Structure, headings, answer capsules, E-E-A-T, metadata. | Claude Code, any writer |
| `NEW-CONTENT-PROMPT.md` | Ready-to-paste prompts for creating a new destination / experience / journal post / landing page. | Devin, Mark |
| `KEYWORD-MAP.md` | Target query clusters mapped to existing and planned URLs, with priority. | Claude Code, Mark |

---

## How to use this with Claude Code

Steps 1 and 2 below are **done** and describe a repo state that no longer
exists: this folder lives at `docs/seo/` in `soleman23/hymt`, and the "Repo
rules addendum" is in `CLAUDE.md` and `AGENTS.md` as § "SEO & AIO rules"
(the two files are identical copies — keep them identical). Kept for the
record; start at step 3.

1. ~~Copy this whole `docs/seo/` folder into the repo root of `soleman23/hymt`.~~
2. ~~Append the block in `SEO-AIO-PLAN.md` § "Repo rules addendum" to the repo's
   `CLAUDE.md` **and** `AGENTS.md`.~~
3. Open Claude Code in the repo and follow `EXECUTION-PROMPTS.md` — it has the
   exact prompt for each phase, in order. Phases 0–3 are complete; the live
   work is the launch chain in `HANDOFF-launch-blockers.md`.
4. Work one phase at a time. Every phase ends with `npm run build` passing —
   it is self-contained and runs the check fixtures and the verifier itself.

## Non-negotiables carried over from the existing repo

These come from the repo's `README.md` and are now also in `CLAUDE.md` /
`AGENTS.md` § "SEO & AIO rules" (they were a GitNexus tooling stub when this
was written, which is why step 2 existed). None of the work in this folder
overrides them:

- `npm run build` is self-contained: astro build, image restore
  (`tools/restore-images.mjs`, which autodetects `python3`/`python`),
  responsive image derivation (`tools/build-responsive-images.mjs`), verifier.
  `npm run restore` runs those two image stages alone.
- No new CSS or JS framework. Astro-official integrations only, and only where
  this plan names one.
- Destination / experience / journal pages stay on their shared layout and
  shared stylesheet. No per-page `pageCss` in those three directories.
- `astro.config.mjs` `site` is the single place the production domain is
  written. Never hardcode a domain anywhere else.
- Web3Forms is the form provider and the access key does not change.
