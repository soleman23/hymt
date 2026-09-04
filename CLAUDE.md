<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **hymt** (5416 symbols, 11356 relationships, 38 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

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
- Analyze is not near-free, and most of its wall clock is not indexing. Measured
  over seven runs here: the analyzer reports **13–29s** of graph build, while
  wall clock ran **~70s** for an already-up-to-date no-op and **~145–190s** for a
  real incremental pass on an otherwise idle machine, rising to **~410s** for the
  same work with parallel sessions and a subagent fleet on the box. So budget
  from what else is running, not from the number the analyzer prints, and run it
  when the index is actually stale rather than reflexively after every commit.
  One run here took **12 hours** of wall clock for 29s of indexing. That is
  deliberately left out of the range above: it was not a slow index but a run
  blocked on a stale lock, and filing it as the high end of normal would teach
  the opposite of the right response. Treat anything far past the loaded figure
  as a run that never started — see the lock bullet below.
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
- Never carry Wix code, pages, hosting, or runtime dependencies into this site.
  This is a same-domain platform migration from Wix to Hostinger: preserve
  confirmed legacy URL equity with explicit Hostinger-side redirects, but do
  not submit Search Console Change of Address because the domain is unchanged.
  Unknown, unconfirmed paths still 404 by design.
- Never add `AggregateRating` to HYMT-controlled reviews.
- Never add `WebSite`+`SearchAction` sitelinks-searchbox markup (deprecated).
- Never chase `FAQPage` or `HowTo` rich results — they no longer render.
- Never introduce a CSS or JS framework. Astro-official integrations only.
- Never add per-page `pageCss` under `destinations/`, `experiences/` or
  `travel-journal/`.
- Never fire analytics on the staging host.
- Never change the Web3Forms access key.

### Node and npm

- The build needs **Node >=22.19.0**, and the package that sets that floor is
  **undici**, reached through `astro` → `unifont`. Astro's own floor is lower
  (`>=22.12.0`) — do not read it and assume it governs. `npm ci` enforces
  `engines.node` for every package it installs, so what governs is the
  strictest floor **anywhere in the tree**.
- This is written from a failure, not from theory. `engines.node` said
  `>=22.12.0` and this file called it "the strictest in the whole dependency
  tree"; undici had since moved to `>=22.19.0`. hPanel's floating `22.x` track
  resolved to **v22.18.0** — clearing the declared floor and missing the real
  one by a single patch — and the 2026-08-29 deploy died in `npm ci` with
  `EBADENGINE` before Astro ever ran. Nothing local noticed, because this
  machine builds on 24.16.0, where both floors are satisfied.
- `tools/verify-deployment.mjs` § 4d now compares `engines.node` against every
  floor in `package-lock.json` and fails on drift, so the next dependency bump
  that raises the real floor goes red here instead of on the deploy host.
- `package.json` → `engines.node` is the number npm actually enforces for this
  package, and `tools/check-node.mjs` reads it and runs as the first stage of
  `npm run build`, so the wrong Node fails in milliseconds with a recipe
  instead of part-way through `astro build` with
  `Node.js v20.19.0 is not supported by Astro!`.
- `package-lock.json`'s root entry carries a **second copy** of `engines.node`,
  and npm does not update it when you edit `package.json` — the 2026-08-28
  correction changed `package.json` alone and left `22.x` in the lockfile for a
  further day. Verified on npm 11.13.0: `npm ci` enforces the `package.json`
  copy and ignores this one, so a stale value here is cosmetic rather than
  load-bearing. Change both anyway — the next person to read the lockfile for
  the floor should not find a different answer than the one being enforced.
- `.npmrc` sets `engine-strict=true`, so `npm ci` / `npm install` on the wrong
  Node is a hard `EBADENGINE` error. Without it npm prints a warning and
  installs anyway, leaving a `node_modules` that resolves and then cannot
  build.
- The machine default is **20.19.0**; **24.16.0** is installed beside it and is
  what the site is actually built on. Put the one you want first on PATH for
  the single command (`nvm root` prints where these live):

  ```bash
  export PATH="/c/Users/reach/AppData/Local/nvm/v24.16.0:$PATH"
  npm run build
  ```

- **Never run `nvm use`.** nvm4w switches a symlink at `C:\nvm4w\nodejs` that
  every shell and session on this machine shares. It moved twice, unannounced
  and in both directions, during a single session on 2026-08-28 — once between
  two consecutive tool calls. Prepending to PATH affects only your own command.
- An `engines` range this repo's preflight cannot parse is reported, not
  guessed at: it understands a `>=X.Y.Z` floor and says so for anything else.
  The value before 2026-08-28 was `22.x`, which was wrong in both directions —
  it admitted 22.0–22.11, which Astro rejects, and excluded Node 24, the
  version that builds the site.
- Default to **`npm ci`**. It installs exactly what `package-lock.json` says
  and never rewrites it. Reach for `npm install` only when you mean to change a
  dependency, and look at what it did to the lockfile before staging.
- `npm install` here once deleted 102 lines from `package-lock.json` — every
  `libc` block on the Linux-targeted optional dependencies. Invisible on this
  machine, because those packages are never installed on Windows; degrading for
  the deploy host, which does install them. `tools/verify-deployment.mjs` now
  compares the lockfile against HEAD and fails on any entry that lost `libc`,
  `os` or `cpu`. That failure was **not** reproducible on demand — two npm
  versions and two install shapes all kept the field — so treat the check as a
  tripwire, not as an explanation of the cause.

### Line endings

- Source is **LF everywhere** — `.gitattributes` sets `* text=auto eol=lf`.
  `dist/**` stays `-text` below it, so built output is stored and deployed
  byte-for-byte. `tools/verify-deployment.mjs` fails on any CR byte in a
  `dist/` text file, which keeps the two halves honest.
- **Attributes only apply on checkout.** A working tree that predates this —
  any branch not yet merged with `main` — still holds CRLF source on disk, and
  building from it puts CRLF straight back into `dist/`. Git will not fix it
  for you: `git checkout-index --force` skips files it thinks are up to date.
  On a clean tree, renormalize first and then build:

  ```bash
  git rm --cached -r . && git reset --hard
  ```

- A build is now deterministic: rebuilding an unchanged tree leaves `dist/`
  byte-identical. If a rebuild you did not expect shows up as a diff, that is
  a real change or a stale working tree, not noise — read it rather than
  reverting it.

### Before every commit
- `npm run build` must pass. It is self-contained: the Node preflight
  (`tools/check-node.mjs`), the lockfile restore (`tools/restore-lockfile.mjs`),
  astro build, then the image restore (`node tools/restore-images.mjs`), then
  the check fixtures (`tools/verify-checks.test.mjs`), then
  `tools/verify-deployment.mjs`.
- The lockfile restore is the one stage that WRITES to a source file, and it
  exists because hPanel's build command cannot be changed on this account: the
  host installs before it builds, its install drops the `libc` blocks out of
  `package-lock.json`, and the guards below then fail a deploy over a file the
  repo never produced.
- It **patches, it does not revert.** It adds missing platform values back onto
  entries that are the same artifact in both files — same key, version and
  integrity, so HEAD's record of that exact package's platforms is
  authoritative — and unions rather than overwrites. An added package, a bumped
  version, a changed range are all untouched. Two earlier versions reverted the
  whole file and each needed a rule for when that was safe; both rules were
  wrong, in opposite directions, and the second one refused the deploy it was
  written for. Do not reintroduce a revert. It prints what it changed, so a
  repair is never invisible.
- A new verifier check must come with fixtures in `tools/verify-checks.test.mjs`
  proving it fails on the broken shape, not only that the build stays green — a
  check that cannot go red is worse than no check, and two shipped that way.
- Intentional `<title>`/description/canonical changes:
  `node tools/verify-deployment.mjs --update-baseline`, in their own commit.

### After merging to main

- **A merge to `main` deploys production.** There is no staging host and no
  approval step: hPanel's auto-deployment clones the new commit and runs the
  build, and `www.hymtravel.com` serves the result. Treat every merge as a
  release.
- **Budget ~10 minutes before calling a deploy broken, not 1–2.** Measured
  2026-09-04 on a `public/.htaccess` change (#166): the new header first
  appeared on the wire **405 s** after polling began, and polling started a
  minute or two after the merge — so roughly **7–9 minutes** end to end. An
  earlier deploy took about **11 minutes**. The "~1–2 minutes" figure that has
  been repeated around this repo came from an images-only deploy and does not
  generalise: the host runs a full `npm ci` + `astro build`, so a change is not
  live the moment the merge lands.
- Consequently, a header or page that has not changed 2 minutes after a merge
  is almost always **still building**, not a failed deploy. Poll for the change
  itself rather than re-pushing or re-deploying on top of a run in flight.
- **Verify the deployed site, do not assume it.** `npm run verify:prod` runs
  the full suite against `https://www.hymtravel.com`, including the live
  security headers (#167) — the only check that proves the host actually
  applies `public/.htaccess` rather than that the file is correct locally.
  Expect it to FAIL between the merge and the end of the host's build; that is
  the drift being reported honestly, not a flaky check.
