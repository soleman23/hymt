# Session handoff — remove "Mark has personally visited" claims

Paste the block below as the first message of the next session. Everything the
task needs is in it; nothing has been executed yet.

---

## THE PROMPT

Read `docs/seo/HANDOFF-remove-visit-claims.md` and execute the task described in
it. The working tree is clean at commit `c8c8194`; no part of this task has been
started. Follow the decisions already made, use the inventory rather than
re-deriving it, and respect the build constraints in § Constraints. Stop and
report when the build and verifier are clean.

---

## The task

Remove every claim that Mark (or HYMT) has **personally visited** a destination
or property, from all pages and references. Devin will supply Mark's real bio
later, which will carry the genuine visit history. Review all pages for similar
claims and remove them too.

The site's positioning currently rests on "every destination personally
visited". That claim cannot be substantiated right now, so it comes out
everywhere until Mark's bio provides the real version.

## Decisions Devin already made — do not re-ask

1. **Testimonials: remove all 53, keep only Brian S.** The Brian S. quote is
   real. Every other client testimonial on the site is sample copy and must go.
   Replace each removed block with an HTML comment marking the slot (see
   § Constraints for why a comment and not visible text).
2. **Ask Devin for real testimonials closer to launch.** He asked to be
   prompted; there is a tracking issue for it (see § Follow-ups).
3. Mark's bio arrives later and will restate visit history properly. Do not
   invent placeholder visit claims in the meantime.

## Open judgement calls

Devin was asked about these and chose not to answer, which means: **use
judgement, apply the sweeping instruction ("review all pages for similar claims
then remove them"), and only stop if genuinely blocked.** Recommendations:

| Bucket | Recommendation |
|---|---|
| Mark's advisory record — "clients I've sent to Botswana", "I've planned dozens of Oman trips", "I've never had a client come back disappointed" | **Keep.** These claim an advisory track record, not presence. A different and defensible claim. |
| Mark's visit-implying lines — "I've been to enough of these places to know…", "I've tried to describe gorilla trekking… I've never found the right words" | **Remove or reword.** These do imply he was there. |
| Firm first-hand claims — "We have firsthand knowledge of which camps are worth their rate", "We know the rooms, the food, the staff turnover" | **Reword** to sourced knowledge — operator relationships and client outcomes, not presence. |
| The two headline stats (below) | **Replace with neutral scale**: hero label → `60+ Destinations Across 9 Regions`; CTA stat desc → `Destinations across nine regions`. |

## Inventory — verified 2026-08-07, do not re-derive

### Bucket 1 — explicit claims (14 instances, 9 files)

```
4  src/content-pages/destinations.html
2  src/content-pages/experiences__safari-wildlife-travel.html
1  src/content-pages/contact.html
1  src/content-pages/travel-journal__caribbean-mexico-destination-guide.html
1  src/content-pages/travel-journal__north-america-destination-guide.html
1  src/content-pages/travel-journal__what-a-travel-advisor-actually-does.html
1  src/content-pages/travel-journal__what-hotel-descriptions-actually-mean.html
1  src/pages/destinations/index.astro          <- META DESCRIPTION
1  src/pages/destinations/maldives/index.astro <- META DESCRIPTION
```

Find them all with:
`grep -rn -i "personally visited\|visited in person\|seen ourselves\|visited personally" src/content-pages/ src/pages/`

### Bucket 2 — testimonials (53 files, exactly one block each)

Each is a `<section class="testimonial-section"> … </section>` containing
`.testimonial-mark`, `.testimonial-quote`, `.testimonial-attr`. Remove the whole
section, leave a `<!-- NEEDS MARK: … -->` comment in its place.

**Brian S. is NOT in this set** — he lives in `about.html` as `.pull-quote` and
`home.html` as `.testimonial-card`, different markup. A `testimonial-section`
removal leaves him untouched. Verify he survives.

`home.html` already shows the pattern to copy: its fake cards were removed
earlier and replaced with a `<!-- NEEDS MARK: two more real client testimonials
… -->` comment while keeping the Brian S. card.

### Bucket 3 — the two headline stats

- `src/content-pages/destinations.html:7` — `<div class="label">60+ Destinations Personally Visited</div>`
- `src/content-pages/destinations.html:1142` — `<div class="final-cta__aside-desc">Destinations personally visited and vetted</div>`

### Bucket 4 — firm first-hand knowledge (3 known)

`destinations__botswana.html:204`, `destinations__fiji.html:199`,
`destinations__italy.html:209` — search `firsthand|first-hand knowledge`.

### Bucket 5 — Mark's notes (53 `.mark-note__quote` blocks)

Search within them for visit-implying phrasing. Most are advisory-record claims
that stay; only a handful imply presence.

## Constraints — these will break the build if ignored

1. **Never ship visible placeholder text.** `tools/verify-deployment.mjs` has a
   hard `placeholder-copy` check that fails the build on "Placeholder", "TBD",
   "Coming soon", "TODO", "XXX" (case-insensitive) in **visible** text. It
   strips `<!-- comments -->`, `<script>` and `<style>` first — so
   `<!-- NEEDS MARK: … -->` is safe and is the established site convention.

2. **Two of the edits are meta descriptions**, which are baseline-locked AND
   now hard length-checked (110–165 chars, enforced since P3-1):
   - `src/pages/destinations/index.astro`
   - `src/pages/destinations/maldives/index.astro`

   Rewrites must land in range. Then run
   `node tools/verify-deployment.mjs --update-baseline` **in its own commit**,
   per the standing repo rule.

3. `npm run build` must pass. It runs astro build → `tools/restore-images.mjs`
   → `tools/verify-deployment.mjs`. All checks are hard now; there is no
   warnings block left.

4. Removing a `<section>` changes page structure — re-check `single-h1` and
   `heading-order` still pass (the verifier does this automatically).

## Definition of done

- Zero matches for `personally visited|visited in person|seen ourselves|visited personally` in `src/`
- 52 testimonial sections removed, each replaced by a `NEEDS MARK` comment
- Brian S. still present in `about.html` and `home.html`
- Both headline stats reworded, both meta descriptions rewritten in range
- `npm run build` clean; `--update-baseline` isolated in its own commit
- Changes pushed to `main`

## Follow-ups to open (if not already open)

- **Ask Devin for real client testimonials before launch** — 52 slots now hold
  `NEEDS MARK` comments. Milestone M4, label `needs-mark`. Devin explicitly
  asked to be prompted for these closer to launch.
- Mark's bio, when it arrives, restores genuine visit history — that is the
  moment to reconsider the positioning copy removed here.

## Project conventions the next session needs

- After every commit, refresh the code index: `node .gitnexus/run.cjs analyze`
- Run `mcp__gitnexus__detect_changes` before committing
- Pushing to `main` auto-deploys to the dev site
  (`https://brown-goose-754147.hostingersite.com/`) in roughly 4 minutes.
  Production (`www.hymtravel.com`) is a **different site entirely** and is not
  connected to this repo — do not expect changes there.
- Commit messages end with:
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`
- PowerShell here-strings break on embedded double quotes — write long commit
  messages to a file and use `git commit -F <file>`.

## Where the wider program stands

Phases 0–2 complete (M0–M3 closed). **M4 Phase 3 in progress**: P3-1
title/description audit is applied and closed (#26). Remaining in M4: #27
internal linking + testimonial markup rules, #28 answer capsules, #29 cost
ranges, #30 gate, #66 missing hero photo. M7 holds 26 destination-page issues
blocked on photography Devin is sourcing (`docs/seo/photography-needed.md`).

**Note the collision:** issue #27 covers "P3-7 testimonial markup rules". This
task removes 52 testimonials, so #27's testimonial half should be re-scoped or
deferred until real quotes exist. Flag it rather than writing markup rules for
content that is no longer there.
