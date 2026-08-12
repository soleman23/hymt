# Place-card image pipeline

Generates the missing place-card tile images: reads the **HYMTplacecardimagetracker**
sheet, generates each queued tile on higgsfield.ai under Unlimited, uploads the
result to Drive, and marks the row Complete with its link.

229 tiles are tracked. Rows become eligible when their Status reads
`Prompt written`; rows already `Complete` or `Image approved` are never touched.

## Run this on your own machine

Not on a server, and not in a cloud session. Unlimited generation only applies
to work done on higgsfield.ai **in a browser you are logged into** — the MCP
connector, the CLI and the HTTP API all bill credits instead. This pipeline
therefore drives the real web app in a real browser, and nothing in it ever
calls a Higgsfield endpoint.

The Unlimited check is a hard stop, not a warning. If the pipeline cannot
positively confirm Unlimited is active, it stops before generating anything.

## Setup

### 1. Install

```bash
cd tools/image-pipeline
npm install
npx playwright install chromium
```

Playwright lives in this directory's own `package.json`, deliberately. The site's
dependency tree is untouched and `npm run build` at the repo root is unaffected.

### 2. Google credentials

Needs a token that can write the sheet and upload to the folder. It acts as you,
so anything you can already open in a browser works.

Do all of this signed in as **the account that owns the tracker sheet**, and
only that account. The images in column I are not link-public and Drive
permissions are per-file, so a token minted by a neighbouring work account
authorises fine and then cannot see a single image. Sign the others out first.

1. In the [Google Cloud console](https://console.cloud.google.com/), create (or
   pick) a project and enable **Google Sheets API** and **Google Drive API**.
2. Under *APIs & Services → Credentials*, create an **OAuth client ID** of type
   **Web application**, and under *Authorized redirect URIs* add exactly:
   ```
   https://developers.google.com/oauthplayground
   ```
   Note the client ID and secret.

   Not **Desktop app**: the Playground route in step 3 needs its own redirect
   URI registered on the client, and Desktop clients only accept loopback
   redirects. Pairing the two returns `redirect_uri_mismatch`.
3. Mint a refresh token with both scopes. The quickest route is the
   [OAuth Playground](https://developers.google.com/oauthplayground/):
   - gear icon → tick *Use your own OAuth credentials*, paste the ID and secret
   - in step 1 enter both scopes, space separated:
     ```
     https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file
     ```
   - authorise as the account that owns the tracker, then *Exchange authorization
     code for tokens* and copy the **refresh token**

   Check the consent screen's publishing status before you rely on the token.
   While it reads **Testing**, Google expires refresh tokens after **7 days** —
   long enough to get through a pilot and fail somewhere in the middle of the
   229-tile batch, which reads like a pipeline bug and is not one. Set it to
   **In production**, or plan to re-mint.
4. Put all three somewhere the pipeline can read them — either environment
   variables:
   ```bash
   export GOOGLE_CLIENT_ID=...
   export GOOGLE_CLIENT_SECRET=...
   export GOOGLE_REFRESH_TOKEN=...
   ```
   (PowerShell has no inline export; it is `$env:GOOGLE_CLIENT_ID = "..."`, and
   the values last only for that window.)

   or `tools/image-pipeline/.secrets.json`, which is shell-agnostic and
   survives a reboot — the better choice on any machine you will come back to:
   ```json
   { "client_id": "...", "client_secret": "...", "refresh_token": "..." }
   ```

`.secrets.json` is gitignored. **This repository is public — never commit any of
these three values.** The pipeline checks the granted scopes on its first token
refresh and stops with a clear message if one is missing, rather than failing on
the first write after the images have been generated.

Environment variables win over the file when both are set. A *malformed*
`.secrets.json` is an error rather than a fallback — silently treating it as
absent would send you hunting through OAuth config for a stray comma.

### 2a. Make the Drive folder reachable

`drive.file` is deliberately the narrow scope: it grants access to files this
client creates, not the whole Drive. The destination folder is therefore **not**
visible by default. Confirm the authorising account can open
`config.driveFolderId` in a browser and holds **Editor** on it.

`assertFolderWritable()` checks this before a run generates anything, so a wrong
folder id or a read-only share costs a round trip rather than a batch of images:

| Message | Cause |
| --- | --- |
| `not visible to this token` | wrong account, or a folder id the account has never opened |
| `can see "…" but cannot add files to it` | needs Editor, currently Viewer or Commenter |

### 3. Higgsfield session

```bash
node run.mjs --login
```

Opens a browser. Sign in by hand; the session is kept in `.browser-profile/`
(gitignored — that cookie is a credential) and reused by every later run. Nothing
types your password for you and no Higgsfield credential is stored in config.

### 4. Fix the selectors — expect to need this once

`selectors.json` was written **without access to higgsfield.ai**: the machine it
was authored on blocks the host at the network layer, so every selector in it is
an educated guess with several fallback spellings.

```bash
node run.mjs --probe
```

Opens the generation panel, writes `probe/page.html` and `probe/page.png`, and
prints one line per control:

```
  ok    promptInput      <- textarea[placeholder*='prompt' i]
  MISS  unlimitedToggle
```

For anything marked `MISS`, find the real element in `probe/page.html` and add a
matching selector to that entry in `selectors.json`. Logic never needs editing.
Re-run `--probe` until everything reads `ok`.

## Running

```bash
node run.mjs --dry-run            # offline: fixture in, work queue out. No network.
node run.mjs --dry-run --live     # real sheet read. Still writes nothing.
node run.mjs --limit 3            # the pilot
node run.mjs --resume             # everything else, skipping finished rows
```

Recommended order for the first run: `--dry-run`, then `--dry-run --live`, then
`--probe`, then `--limit 3`, then check Drive and the sheet, then `--resume`.

| Flag | Effect |
| --- | --- |
| `--login` | Interactive sign-in; saves the session |
| `--probe` | Dump the live DOM and report which selectors resolve |
| `--dry-run` | Show the plan. Add `--live` to read the real sheet |
| `--limit N` | Only the first N queued rows |
| `--rows 14,15` | Only these **sheet** row numbers (not tile numbers) |
| `--resume` | Skip rows the run log finished; repair rows that uploaded but did not write back |
| `--model "..."` | Force a model for every row in this run |
| `--retry-with-nano` | Re-run rows on Nano Banana Pro |
| `--headless` | No visible window. Headed by default — bot checks stop headless browsers |

Exit codes: `0` all rows completed, `1` something needs review, `2` the run
stopped because Unlimited could not be confirmed.

## Model routing

| Model | When |
| --- | --- |
| Seedream 5.0 Lite | Default for standard landscape/travel photography |
| Seedream 5.0 Pro | Hero tiles — first queued tile of a destination, or a signature landmark |
| Soul 2.0 | Fashion-aware, editorial, human-centric or stylised prompts |
| Nano Banana Pro | Never automatic. `--model` or `--retry-with-nano` only |

Everything runs 16:9 at 2K, the Unlimited ceiling. If 4K becomes
Unlimited-eligible, set `unlimitedResolutionByModel` in `config.json`.

**Nano Banana Pro is never auto-selected.** Judging whether an image obeyed its
`no X, no Y` list means looking at the image, and a heuristic pretending to do
that would be a fabricated verdict. Instead, prompts carrying four or more
exclusions are flagged in the summary under *Worth an eyeball*; if one came back
wrong, re-run just that row:

```bash
node run.mjs --rows 14 --retry-with-nano
```

### The negation trap

Nearly every prompt in the tracker ends `..., no people, no vehicles, no text`.
A plain keyword scan for human-centric words matches "people" in the clause
saying people must *not* appear, and routes the entire sheet to Soul 2.0 — a bug
that looks like a working pipeline. So prompts are split into positive and
negative halves and only the positive half is scanned. `test/model-router.test.mjs`
holds a landscape carrying three negated human words that must come out Seedream.

## What it will not do

- Call the Higgsfield MCP connector, CLI or API — that spends credits
- Generate anything without confirming Unlimited first
- Write a Status or link without a verified Drive upload behind it
- Build a Drive URL from an id; the link written is the one Drive returns
- Touch a row marked `Complete` or `Image approved`
- Write outside columns H and I

## Safety

Three structural guards, all fixture-tested in both directions:

- **Header check.** Writes are addressed by column letter. If a column is
  inserted or `Status`/`Image URL` is renamed, the run stops rather than writing
  into the wrong column.
- **Absolute row numbers.** A row's position comes from the API response, never
  from column A's tile number. Row 1 has filters on; one sort and the two
  disagree.
- **Bounded ranges.** The only range the pipeline can build is `H{n}:I{n}`, and
  it is re-checked before sending. Columns A–G and J–K are unreachable.

Before every write, the row's current Status is re-read. If someone marked it
Complete while the run was generating, the row is skipped and reported.

## Recovering from a failed run

`run-log.jsonl` records every row as it resolves, so a run killed at row 40
loses nothing. `--resume` reads it and:

- skips rows already `complete`
- **repairs** rows that uploaded but failed to write back, using the logged Drive
  link — no image is regenerated for these
- retries everything else

Prompts are logged as a truncated SHA-256, not in full, so the log answers "was
this generated from the prompt the sheet has now?" without carrying the client's
prompts next to a public repository.

## Tests

```bash
npm test
```

129 checks across routing, sheet addressing and resume. No network, no
credentials, no browser. They assert both directions — that each guard passes
what it should *and* rejects what it should — because a guard that cannot go red
reads like protection without being any.

## Files

| Path | |
| --- | --- |
| `run.mjs` | CLI, orchestration, per-row error isolation |
| `lib/google-auth.mjs` | Token refresh, scope check, authorised fetch |
| `lib/tracker.mjs` | Sheet read, row filtering, bounded write-back |
| `lib/model-router.mjs` | Model choice. Pure — no I/O |
| `lib/drive.mjs` | Upload, link read-back, folder pre-flight |
| `lib/higgsfield.mjs` | Browser driver, Unlimited guard, download |
| `lib/runlog.mjs` | JSONL log, resume, summary |
| `selectors.json` | Site selectors — the only file `--probe` asks you to edit |
| `config.example.json` | Copy to `config.json` to override anything |
