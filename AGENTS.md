<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **hymt** (3902 symbols, 7444 relationships, 19 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> Index stale? Run `node .gitnexus/run.cjs analyze` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? `npx gitnexus analyze` (npm 11 crash → `npm i -g gitnexus`; #1939).

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user. For unified PDG impact, add `mode: "pdg"` with optional `line: <N>` — it returns statement-level `affectedStatements` over CDG + REACHING_DEF and inter-procedural symbols in `interproceduralByDepth`/`byDepth`; no-layer/degraded PDG results are UNKNOWN-risk notes (`--pdg` layer).
- **MUST run `detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows. For regression review, compare against the default branch: `detect_changes({scope: "compare", base_ref: "main"})`.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `query({search_query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `context({name: "symbolName"})`.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).
- For control/data dependence, `pdg_query({mode: "controls", target: "fileOrSymbol"})` answers "under what condition does X run?" (CDG, incl. guard clauses) and `pdg_query({mode: "flows", target, variable})` traces "where does variable Y flow?" (REACHING_DEF). `--pdg` layer.

## Never Do

- NEVER edit a function, class, or method without first running `impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit changes without running `detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
| --- | --- |
| `gitnexus://repo/hymt/context` | Codebase overview, check index freshness |
| `gitnexus://repo/hymt/clusters` | All functional areas |
| `gitnexus://repo/hymt/processes` | All execution flows |
| `gitnexus://repo/hymt/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
| --- | --- |
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->

## GitNexus index — how to run analyze here

- `.gitnexusrc` pins `analyze.pdg = true`, so a bare
  `node .gitnexus/run.cjs analyze` keeps the CFG/PDG layer that `explain` and
  `pdg_query` read. Passing `--pdg` is now redundant. CLI flags still win over
  the file, so never pass one that turns the layer off.
- **The pin only exists on `main`.** Every session shares this one working
  tree, and `.gitnexusrc` is read from the repo root — not from `.gitnexus/`,
  which is index storage and gitignored. On a branch that has not merged `main`
  since 2026-08-24 the file is simply absent, so a bare `analyze` rebuilds the
  shared index in non-PDG mode: 3854/7327 drops to 1798/2970 and `explain` and
  `pdg_query` go quiet without erroring. Merge `main` into your branch before
  you analyze.
- Analyze is no longer near-free. Measured on this repo: ~70s wall clock for an
  already-up-to-date no-op, ~190s for a real incremental pass. The `13.3s` the
  analyzer prints is graph-build time, not process time. Run it when the index
  is actually stale, not reflexively after every commit.
- The counts in the block above are generated. Never hand-edit between the
  `gitnexus:start` / `gitnexus:end` markers. If your analyze rewrites them
  downward, you indexed in the wrong mode — fix the branch and re-run, do not
  commit the revert.
- The staleness hook fires whenever HEAD moves past the indexed commit, even for
  a commit that touched no code. It is a notice, not a failure; the next analyze
  clears it.
- **If analyze looks hung, do not kill it.** A killed run leaves a lock file in
  `.gitnexus/.hook-locks/` holding its PID, and nothing cleans that up when the
  process dies. The next analyze then waits on the dead holder in complete
  silence: one waited 12 hours before the lock aged out, then indexed in 29
  seconds. `cat` the lock for its PID, check whether that process is alive, and
  delete the lock only if it is dead and no live `index.js analyze` is running.
- Tell waiting from working by CPU, not by output — analyze prints nothing while
  blocked. Sample the process twice a few seconds apart; a waiter accrues none.
  The indexing worker (`--max-old-space-size=9544 … index.js analyze`) is spawned
  as a **child** of the analyze CLI, so a second gitnexus process is normal, not
  a competing run. Check parentage before killing anything.
- Do not run analyze alongside a large subagent workflow. Starved of CPU by 23
  agents it ran past a 10-minute timeout, and killing it there is what left the
  stale lock in the first place.

## SEO & AIO rules — apply to every page, always

Full standards: `docs/seo/CONTENT-STANDARDS.md`. Schema: `docs/seo/SCHEMA-LIBRARY.md`.

### Domain
- The production domain is written once, in `astro.config.mjs` → `site`.
  Never hardcode `hymtravel.com` or the Hostinger preview host anywhere else.
  Canonicals, `og:url` and JSON-LD all derive from `Astro.site`.

### Every new page must have
- Unique `<title>`, 30–65 chars including the `— Hit Your Mark Travel` suffix.
- Unique meta description, 110–165 chars, with a specific in it.
- Exactly one `<h1>`; heading levels never skip.
- Canonical, `og:*`, `twitter:*` — inherited from `Base.astro`, do not override.
- A per-page `og:image`, 1200×630, or the default if none exists.
- `BreadcrumbList` schema matching the visible breadcrumb exactly.
- The page-type schema listed in `SCHEMA-LIBRARY.md` § "Page type → schema".
- At least two outbound internal links with descriptive anchor text.
- A 40–70 word answer capsule under the first `<h2>` that answers the page's
  core question directly and contains at least one specific number.

### Images
- Every `<img>`: `alt`, intrinsic `width`, intrinsic `height`, `decoding="async"`.
- `loading="lazy"` on everything below the fold; never on the LCP image.
- Decorative images: `alt=""` plus `aria-hidden="true"`.
- Hero images are passed to `Base` as `preloadImage`.

### Accordions and FAQ blocks
- Questions are `<button>` inside a heading, with `aria-expanded` and
  `aria-controls`. Answers have a matching `id` and `role="region"`.
- Answers must be visible when JavaScript has not run. The hide rule is scoped
  to `.js-accordion`, which `Accordion.astro` sets on `<html>`. Never move the
  hide rule outside that scope.
- The first sentence of every answer is a complete answer in ≤25 words.

### Writing
- Specifics over adjectives. A number beats a superlative every time.
- Attribute factual claims to a linked authoritative source.
- Write in Mark's first person where the experience is genuinely his.
- Date anything time-sensitive and show the date on the page.
- Never ship "Lorem ipsum", "TBD", "Coming soon", or a placeholder image.

### Never do
- Never reference a prior website, platform, or migration for this domain.
  This was launched as a fresh site: no redirect maps for legacy paths, no
  Change-of-Address submissions, no "old site" assumptions — in code, docs,
  prompts, or commit messages. Unknown paths 404 by design.
- Never add `AggregateRating` to HYMT-controlled reviews.
- Never add `WebSite`+`SearchAction` sitelinks-searchbox markup (deprecated).
- Never chase `FAQPage` or `HowTo` rich results — they no longer render.
- Never introduce a CSS or JS framework. Astro-official integrations only.
- Never add per-page `pageCss` under `destinations/`, `experiences/` or
  `travel-journal/`.
- Never fire analytics on the staging host.
- Never change the Web3Forms access key.

### Before every commit
- `npm run build` must pass. It is self-contained: astro build, then the image
  restore (`node tools/restore-images.mjs`), then the check fixtures
  (`tools/verify-checks.test.mjs`), then `tools/verify-deployment.mjs`.
- A new verifier check must come with fixtures in `tools/verify-checks.test.mjs`
  proving it fails on the broken shape, not only that the build stays green — a
  check that cannot go red is worse than no check, and two shipped that way.
- Intentional `<title>`/description/canonical changes:
  `node tools/verify-deployment.mjs --update-baseline`, in their own commit.
