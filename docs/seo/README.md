# HYMT SEO + AIO Program — Document Set

Everything in this folder is written to be executed by Claude Code against the
`soleman23/hymt` repository (Astro 5, static output, deployed to Hostinger).

**Production domain:** `https://www.hymtravel.com`
**Development domain:** `https://brown-goose-754147.hostingersite.com`
**Status at time of writing (2026-08-07):** dev site is built and deployed; the
DNS cutover to the production domain has not happened yet.

**This is a fresh launch.** Nothing that may previously have existed on the
production domain is in scope: no prior site, platform, redirect map, or search
property is referenced or migrated anywhere in these documents, and no future
work should reintroduce any such reference. Measurement starts from zero at
launch.

---

## The files

| File | What it is | Who reads it |
|---|---|---|
| `SEO-AIO-PLAN.md` | The master plan. Findings from the audit, then Phases 0–6 with numbered, checkable tasks. **This is the handoff document.** | Claude Code, Mark, Devin |
| `EXECUTION-PROMPTS.md` | Repo setup steps + the exact phase-by-phase prompts to paste into Claude Code to complete the plan. | Devin |
| `LAUNCH-RUNBOOK.md` | The fresh-launch DNS cutover, hour by hour, with rollback. | Whoever runs the cutover |
| `SCHEMA-LIBRARY.md` | Every JSON-LD block the site should emit, as copy-paste code, with the Astro component that generates it. | Claude Code |
| `CONTENT-STANDARDS.md` | The permanent rules for writing any new page, destination, experience, or journal post. Structure, headings, answer capsules, E-E-A-T, metadata. | Claude Code, any writer |
| `NEW-CONTENT-PROMPT.md` | Ready-to-paste prompts for creating a new destination / experience / journal post / landing page. | Devin, Mark |
| `KEYWORD-MAP.md` | Target query clusters mapped to existing and planned URLs, with priority. | Claude Code, Mark |

---

## How to use this with Claude Code

1. Copy this whole `docs/seo/` folder into the repo root of `soleman23/hymt`.
2. Append the block in `SEO-AIO-PLAN.md` § "Repo rules addendum" to the repo's
   `CLAUDE.md` **and** `AGENTS.md` (they are currently identical copies — keep
   them identical).
3. Open Claude Code in the repo and follow `EXECUTION-PROMPTS.md` — it has the
   exact prompt for each phase, in order, starting with Phase 0.

4. Work one phase at a time. Every phase ends with `npm run build` passing and
   `node tools/verify-deployment.mjs` clean.

## Non-negotiables carried over from the existing repo

These come from the repo's `README.md` (note: the current `CLAUDE.md` /
`AGENTS.md` are a GitNexus tooling stub and do **not** contain them — which is
exactly why step 2 above appends the rules addendum to both). None of the work
in this folder overrides them:

- `python3 tools/restore_images.py` runs **after every** `astro build`.
- No new CSS or JS framework. Astro-official integrations only, and only where
  this plan names one.
- Destination / experience / journal pages stay on their shared layout and
  shared stylesheet. No per-page `pageCss` in those three directories.
- `astro.config.mjs` `site` is the single place the production domain is
  written. Never hardcode a domain anywhere else.
- Web3Forms is the form provider and the access key does not change.
