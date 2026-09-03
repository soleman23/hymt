# AI visibility log

The AIO half of the monthly cycle in [#37]. Two things get logged here, and they
answer different questions:

1. **Crawler access** — can the AI answer engines we allow actually *fetch* the
   site? Machine-measurable, so it is measured rather than assumed.
2. **Citations** — do those assistants actually cite `hymtravel.com` for the
   queries in `KEYWORD-MAP.md`? Not machine-measurable and not rankable; asking
   the assistants is the only honest measurement that exists.

Access is a precondition for citations, not a substitute. A month of clean
access with no citations means the content is not winning. A month of citations
despite broken access means the assistant is working from a stale index, and it
will decay.

---

## 1. Crawler access

Run it, do not eyeball it:

```bash
npm run check:crawlers
```

**A single status code is not a measurement here.** Read
`tools/check-ai-crawlers.mjs`'s header before trusting any result you get by
hand — #156 was mis-measured twice, in opposite directions, and both times the
method was what failed. One probe against a rested bucket returns 200 and reads
as "fixed"; repeating a probe against a drained one keeps it drained and reads
as "blocked". The tool bursts and prints the whole sequence, refuses to call a
burst that opens on 429 a result at all, and brackets the run with controls.

### 2026-09-03 — GPTBot 429, everything else clean

Measured against `https://www.hymtravel.com/`, origin `195.179.237.168`.

| Agent | Result |
|---|---|
| GPTBot | **429** |
| OAI-SearchBot, ChatGPT-User | 200 |
| ClaudeBot, PerplexityBot | 200 |
| Meta-ExternalAgent | 200 (was 429 when [#156] was filed; changed host-side, no action here) |
| Googlebot, Bingbot | 200 |
| control: Chrome 128, unknown UA | 200 × 12 each |

Open in [#156]. What was established this session, beyond what the issue body
already said:

- **The matcher is the case-insensitive substring `gptbot/1`.** `GPTBot/1.0`,
  `gptbot/1.0`, `xGPTBot/1.0` and `foo GPTBot/1.0 bar` are all 429; `GPTBot`,
  `GPTBot/`, `GPTBot/9.9`, `GPTBotx/1.0` and `GPT-Bot/1.0` are all 200.
- **The counter is shared across everything that matches it, and is not keyed to
  the UA string.** `xGPTBot/1.0` — a string never sent before — came back 429 on
  its first ever request. A per-string token bucket cannot do that.
- **It is not IP-based.** Chrome and an invented crawler UA both took 12
  back-to-back requests from the same machine, in the same minute, while GPTBot
  sat on a 429.
- **It is path-agnostic.** GPTBot gets 429 on `/`, on `/destinations/africa/`,
  on `/sitemap-index.xml` and on `/robots.txt` — so the crawler cannot read the
  file that grants it permission.
- **It is generated inside the vhost, not at an edge.** The 429 carries every
  header `public/.htaccess` sets, including the CSP with our script hashes and
  HSTS. Compare Hostinger's platform Force-HTTPS hop, which carries none of them
  (see § 3 below). Different layers.
- **The Hostinger CDN is not the cause and its AI-crawler control is inert.**
  hPanel → CDN → AI Audit lists GPTBot with "Blocked crawlers: 0", and reports
  **0 requests over 24h** while this session generated dozens. The CDN's own
  analytics show 0 requests and **0 × 429 over 7 days**. It is switched on in
  the panel but serving no traffic. Blocking or unblocking anything there would
  have changed nothing — worth knowing before someone spends an afternoon on it.
- **It does not clear, on any timescale a crawler would wait.** One probe per
  minute for **40 consecutive minutes** (21:54–22:34 UTC) returned 429 every
  single time. An agent that had just taken seven back-to-back requests cannot
  be exhausted by 1 req/min, so either the window is longer than 40 minutes or
  every request extends it — and with no `Retry-After` a crawler has no way to
  tell which. Whichever it is, the site's 122 sitemap URLs cannot be crawled.

  This is the number that should go in the support ticket. "Rate-limited" is
  technically accurate and understates it: a limiter that never refills across
  40 minutes of minimal traffic is a block with extra steps, and describing it
  as throttling invites the reply that the crawler should simply slow down.

Nothing in this repo can produce it: `public/.htaccess` is byte-identical
(17,083 bytes) in repo, `dist/` and on the host, and contains no user-agent rule,
no rate limit and no 429. `robots.txt` explicitly `Allow`s GPTBot.

---

## 2. Citations

**Not yet run.** The first cycle is due with [#37]. Do not backfill this table
from memory or inference — an unrun month is honest, an invented one poisons
every trend drawn through it.

Method: ask each assistant the query verbatim, in a fresh session with no
personalisation, and record whether `hymtravel.com` appears as a cited source
(not merely whether the answer is correct). Pull queries from
`KEYWORD-MAP.md` § 2 — start with the `P1` clusters, which is where the
content actually is.

| Date | Assistant | Query | Cited? | Notes |
|---|---|---|---|---|
| — | — | — | — | awaiting first run |

Two things to hold steady so the log stays comparable month to month: the same
query wording, and the same set of assistants. Changing either is fine, but note
it in the row rather than silently rebasing the series.

[#37]: https://github.com/soleman23/hymt/issues/37
[#156]: https://github.com/soleman23/hymt/issues/156
