<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **hymt** (810 symbols, 970 relationships, 2 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> Index stale? Run `node .gitnexus/run.cjs analyze` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? `npx gitnexus analyze` (npm 11 crash → `npm i -g gitnexus`; #1939).

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows. For regression review, compare against the default branch: `detect_changes({scope: "compare", base_ref: "main"})`.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `query({search_query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `context({name: "symbolName"})`.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).

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
  restore (`node tools/restore-images.mjs`), then `tools/verify-deployment.mjs`.
- Intentional `<title>`/description/canonical changes:
  `node tools/verify-deployment.mjs --update-baseline`, in their own commit.
