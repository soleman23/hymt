# Executing the plan — repo setup and phase-by-phase prompts

How to get this folder into the `soleman23/hymt` repo, and the exact prompts to
paste into Claude Code to complete the whole program. Run the phases in order;
each prompt ends with a stop-and-report so you review before the next one.

---

## Step 1 — Add the folder to the repo

From a terminal in your local clone of `soleman23/hymt`:

```bash
# 1. Unzip the handoff next to the repo (or anywhere), then copy the folder in
cp -r /path/to/unzipped/docs/seo docs/seo

# 2. Commit it
git add docs/seo
git commit -m "Add SEO + AIO program docs (fresh launch)"
git push
```

Or skip the terminal entirely: unzip, drag the `docs/seo` folder into the repo
in your editor, and let Claude Code commit it with the first prompt below.

## Step 2 — Install the standing rules

Paste into Claude Code:

```
Read docs/seo/SEO-AIO-PLAN.md section 9 ("Repo rules addendum"). Append that
markdown block verbatim to the END of both CLAUDE.md and AGENTS.md. The two
files must remain byte-identical to each other afterward — verify with diff.
Do not modify any existing content in either file. Commit as
"Add SEO/AIO standing rules to agent instructions".
```

This is the step that makes the rules permanent: every future Claude Code
session in this repo reads `CLAUDE.md` automatically, including the fresh-launch
rule (never reference a prior website, platform, or migration for this domain)
and the per-page standards.

## Step 3 — Run the phases

One prompt per phase. Review the report between phases. Do not batch them.

### Phase 0 — critical fixes

```
Read docs/seo/SEO-AIO-PLAN.md in full, then execute Phase 0 (tasks P0-1
through P0-6) exactly as written. For P0-6, do not guess any [DECISION] —
collect all six decision questions into a single list and present them to me
at the end of your report. For P0-5, implement the Analytics component with a
placeholder GA4 measurement ID ("G-XXXXXXXXXX") and tell me where to paste the
real one once I create the GA4 property.

After the work: npm run build (self-contained: astro build, image restore,
verifier). All clean before you finish.

Verify specifically before reporting:
- /faq/ and /destinations/italy/ show every FAQ answer with JavaScript
  disabled, and the accordions toggle with it enabled
- the contact form posts to Web3Forms and shows the branded success state
- dist/assets/og-default.jpg exists after restore_images.py
- the staging X-Robots-Tag rule matches hostingersite.com hosts only

Stop and report when done. Do not start Phase 1.
```

Phase 0 will come back with the six `[DECISION]` questions (GA4 vs GTM,
consortium memberships, public address, Google Business Profile, author
identity, journal post dates) plus `NEEDS MARK` items for the About page.
Answer them, then:

```
Here are the Phase 0 decision answers: [paste answers]. Apply them wherever
the plan says [DECISION-1] through [DECISION-6], then re-run the build and
verifier. Stop and report.
```

### Phase 1 — technical foundation

```
Read docs/seo/SEO-AIO-PLAN.md and execute Phase 1 (P1-1 through P1-7) exactly
as written. Order within the phase: P1-6 (verifier extensions) LAST, so its
new checks run against the completed work of P1-1 through P1-5 and P1-7.

For P1-4, write the codemod in tools/ rather than hand-editing the 60 img
tags, and flag — do not silently accept — the 53 mark-note__photo instances
that use the logo as a stand-in for a photo of Mark.

For P1-5, use the journal post dates I provided in the Phase 0 decisions.

After: build, restore images, verifier — all clean. The verifier should now
be enforcing the full check table in P1-6. Run node tools/verify-deployment.mjs
--update-baseline only if a title/description change was intentional, and put
that in its own commit. Stop and report.
```

### Phase 2 — structured data

```
Read docs/seo/SEO-AIO-PLAN.md Phase 2 and docs/seo/SCHEMA-LIBRARY.md in full.
Execute P2-1 through P2-6 exactly as written: Schema.astro component,
src/lib/schema.ts builders, layout wiring, and the page-type mapping in
SCHEMA-LIBRARY.md section 4.

Use the extractFaq() implementation from SCHEMA-LIBRARY.md verbatim — it was
tested against the real content pages; do not rewrite it. Add the verifier
check that extractFaq() returns a non-zero count matching the pf-item count
for every page containing page-faq.

After: build + verifier clean, then print the full JSON-LD emitted on one page
of each type (homepage, /about/, a destination, an experience, a journal post,
a hub, /faq/) so I can spot-check before validation. Stop and report.
```

Then validate externally (this part is manual — the Rich Results Test has no
API worth scripting):

```
Give me a checklist of the exact URLs (staging host) to paste into Google's
Rich Results Test and validator.schema.org, one per page type, and what result
to expect for each. Create docs/seo/validation-log.md with a table for me to
fill in.
```

### Phase 3 — on-page and content

This is the largest phase. Split it:

```
Read docs/seo/SEO-AIO-PLAN.md Phase 3 and docs/seo/CONTENT-STANDARDS.md.
Execute P3-1 (title/description audit) only. Produce the full before/after
table for every page for my review BEFORE applying anything. Stop and show
me the table.
```

```
Approved [with these changes: ...]. Apply the title/description changes, run
--update-baseline in its own commit, then execute P3-6 (internal linking) and
P3-7 (testimonial markup rules). Stop and report.
```

```
Execute P3-2 (answer capsules) and P3-4 (first-person framing) across all
destination and experience pages, working in batches of 10 pages per report.
Where a capsule needs a fact you cannot verify, insert <!-- NEEDS FIGURE -->;
where it needs Mark's experience, insert <!-- NEEDS MARK --> — never invent
either. After each batch: build + verifier clean. Start with the first batch
of 10 and stop for review.
```

```
Execute P3-3 (publish real cost ranges) as a scaffolding pass: add the range
block structure to every destination and experience page with every number as
<!-- NEEDS FIGURE: ... -->, then give me a single consolidated worksheet
(markdown table) of every figure Mark needs to supply: page, what the number
is, and the authoritative source to check it against. P3-5 (citations) the
same way. Stop and report with the worksheet.
```

Mark fills in the worksheet, then:

```
Here is the completed figures worksheet: [paste]. Insert every figure with its
"verified as of" date, resolve the NEEDS FIGURE comments, add the source
links per P3-5, bump dateModified on changed pages, build + verifier clean.
Stop and report anything still unresolved.
```

### Phase 4 — launch

The cutover is human work (DNS, hPanel, GSC) — Claude Code prepares and
verifies:

```
Read docs/seo/LAUNCH-RUNBOOK.md in full. Work through every checklist item in
sections 2.1, 2.2, 2.3 and 2.5 that can be verified from the repo or by
fetching the staging site, and report each as PASS / FAIL / NEEDS HUMAN with
evidence. For section 2.4, fetch the three PageSpeed test pages and report
what you can measure. Produce the final go/no-go list: everything that must be
done by a human, in order, before DNS is switched. Do not attempt any DNS,
hosting-panel, or Search Console action yourself.
```

After you flip DNS (runbook § 4):

```
The DNS cutover to www.hymtravel.com is done. Run the launch-runbook section
4.3 and 4.4 verification: propagation, single-hop redirects, robots.txt,
sitemap, X-Robots-Tag absence, 404 behaviour, and npm run verify:prod. Report
PASS/FAIL per item with the actual curl output for anything that fails.
```

### Post-launch (repeat monthly)

```
Run the post-launch check from docs/seo/LAUNCH-RUNBOOK.md section 6 for the
current period. Also run the quarterly content refresh prompt from
docs/seo/NEW-CONTENT-PROMPT.md section 5 if a quarter has elapsed. Report
what needs my attention and what Mark needs to supply.
```

### New content, forever after

Every new destination, experience, or journal post uses the matching prompt in
`docs/seo/NEW-CONTENT-PROMPT.md` — fill the `{{...}}` slots and paste. The
monthly targets live in `docs/seo/KEYWORD-MAP.md` § 3.

---

## The rules that survive all of this

Once Step 2 is done, `CLAUDE.md`/`AGENTS.md` carry the standing rules into
every future session automatically. The three that matter most:

1. **Fresh launch, permanently.** No prior website, platform, or migration is
   ever referenced for this domain. Unknown paths 404 by design.
2. **The verifier is the law.** Every machine-checkable standard lives in
   `tools/verify-deployment.mjs` and fails the build. If a rule matters and
   is not in the verifier, adding it there is the fix.
3. **Never invent Mark's experience or a figure.** `<!-- NEEDS MARK -->` and
   `<!-- NEEDS FIGURE -->` are the only honest placeholders, and the build
   fails on shipped placeholder text.
