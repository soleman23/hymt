# Place-card image pipeline — SHELVED 2026-08-12, runner removed 2026-08-24

**Do not rebuild this.** The Playwright runner that used to live here was
deleted in the commit that added this banner. What survives is the part that
was never about Playwright: two dependency-free modules and their tests.

## What this was, and why it is gone

The runner drove `higgsfield.ai` through a logged-in Playwright browser, because
Unlimited generation applies only in the web app — the MCP connector, the CLI
and the HTTP API all bill credits. It read the tracker sheet, generated each
queued tile, uploaded to Drive and wrote the row back.

It never generated a single image. Three selectors (`unlimitedToggle`,
`unlimitedActiveMarker`, `loggedInMarker`) could only be filled from a
signed-in DOM dump, and the pipeline refuses to generate until Unlimited is
confirmed, so those three were a hard prerequisite rather than a nicety. Behind
them sat a seven-step Google OAuth setup that had to be done by hand.

On 2026-08-12 that trade was rejected in favour of paying credits through the
**Higgsfield MCP connector**, and the credit route has since done the work:
**44.6 credits, 62 cards, 12 pages** by 2026-08-13, plus the sports-event
frames in August. The premise that made Playwright worth its complexity —
"credits are scarce, Unlimited is free" — stopped holding when the balance did
not turn out to be the constraint.

See `docs/seo/DECISIONS.md` → **D7** for the decision record, and
`docs/seo/HANDOFF-photo-rollout.md` for the workflow that replaced it.

## What is kept, and why

| File | Why it survived |
|---|---|
| `lib/model-router.mjs` | Pure model-choice logic. Encodes the **negation trap**: these prompts end in long exclusion lists, so only the *positive* half of a prompt may be scanned for content signals — scanning raw text routes every landscape to Soul on the strength of "no people". That rule is worth more than the runner was. |
| `lib/tracker.mjs` | The sheet-write safety rules: writes caged to `H{n}:I{n}` behind a header check, and row numbers taken from the API response so a re-sort cannot desync them. |
| `lib/google-auth.mjs` | `tracker.mjs`'s only import. |
| `test/` | 94 assertions over the two modules above. |

Nothing here has an npm dependency — `playwright` was the only one, and it left
with `run.mjs`. Run the tests directly:

```bash
node tools/image-pipeline/test/model-router.test.mjs
node tools/image-pipeline/test/tracker.test.mjs
```

## If you ever need the deleted runner

`git log --diff-filter=D -- tools/image-pipeline/run.mjs` finds the commit that
removed it; the file is intact in its parent. Read the decision record first —
the reason it was removed has not changed.
