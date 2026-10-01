# AI visibility log

The AIO half of the monthly cycle in [#37]. Three things get logged here, and
they answer different questions:

1. **Crawler access** — can the AI answer engines we allow actually *fetch* the
   site? Machine-measurable, so it is measured rather than assumed.
2. **Citations** — do those assistants actually cite `hymtravel.com` for the
   queries in `KEYWORD-MAP.md`? Not machine-measurable and not rankable; asking
   the assistants is the only honest measurement for most of them.
3. **Google's own count** — Search Console now reports how often our pages
   appear in Google's generative AI features. First-party and measured, but
   Google-only and without queries, so it complements § 2 rather than
   replacing it.

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

Four things it will not do, each because an earlier version did: call a burst
"throttled" when a 200 arrives after the 429 (that is not an exhaustion point,
so no budget number is quoted); pass a run in which any agent came back
unreadable; blame the origin when it was the browser control or the network
that failed; or count a 200 as access without checking the body is the page
rather than a challenge stub. A non-zero exit means read the output, not
re-run until it is green.

### 2026-09-03 — GPTBot 429, everything else clean

Measured against `https://www.hymtravel.com/`, origin `195.179.237.168`.

| Agent | Result |
|---|---|
| GPTBot | **429** |
| OAI-SearchBot, ChatGPT-User | 200 |
| ClaudeBot, PerplexityBot | 200 |
| Meta-ExternalAgent | 200 (was 429 when [#156] was filed) — but see 2026-09-04 below before reading this as fixed |
| Googlebot, Bingbot, Applebot | 200 |
| control: Chrome 128, unknown UA | 200 × 12 each |
| Google-Extended, Applebot-Extended | not measurable — see below |

`Google-Extended` and `Applebot-Extended` are robots.txt policy tokens, not
request user agents: neither is ever sent as an HTTP `User-Agent`, and the
fetching for both is done by `Googlebot` and `Applebot` respectively. Their rows
are read off those two agents. An earlier version of the tool sent invented
`Google-Extended/1.0` and `Applebot-Extended/1.0` strings and reported the 200s
as coverage, which measured nothing about either company — a 200 for a string no
Google system sends is the unknown-UA control under a borrowed name.

Open in [#156]. What was established this session, beyond what the issue body
already said:

- **The matcher is the case-insensitive substring `gptbot/1`.** `GPTBot/1.0`,
  `gptbot/1.0`, `xGPTBot/1.0` and `foo GPTBot/1.0 bar` are all 429; `GPTBot`,
  `GPTBot/`, `GPTBot/9.9`, `GPTBotx/1.0` and `GPT-Bot/1.0` are all 200.
- **The counter is shared across everything that matches it, and is not keyed to
  the UA string.** `xGPTBot/1.0` — a string never sent before — came back 429 on
  its first ever request. A per-string token bucket cannot do that.
- **It selects on the user agent — but whether the source IP is also part of the
  key is untested.** Chrome and an invented crawler UA both took 12 back-to-back
  requests from the same machine, in the same minute, while GPTBot sat on a 429.
  That rules out a limiter keyed on IP *alone*. It does not rule out one keyed on
  `(source IP, gptbot/1)`, which produces every observation above identically.
  Settling it needs a matching GPTBot request from a second source IP, which has
  not been done. Do not tell the host "it is not IP-based" — say the matching is
  user-agent-selective and let them look at the key.
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

### 2026-09-04 — the same origin runs a working limiter and a broken one

`npm run check:crawlers`, 12-request bursts, 00:14–00:17 UTC. Exit 1.

| Agent | Result |
|---|---|
| GPTBot | **429 × 12** — `NO RESULT`, the burst opened on a 429 |
| Meta-ExternalAgent | **429 × 12** — `NO RESULT`, the burst opened on a 429; recovered ~6 min later |
| OAI-SearchBot, ChatGPT-User | 200 × 12 |
| Claude-SearchBot, Claude-User, ClaudeBot | 200 × 12 |
| PerplexityBot, Perplexity-User, Amazonbot | 200 × 12 |
| Googlebot, Bingbot, Applebot | 200 × 12 |
| control: Chrome 128, unknown UA, Chrome again | 200 × 12 each |

Neither 429 row is a measurement. Both opened on a 429, so they classify as
`NO RESULT` and this run establishes only that both agents were already on one
when it started. Do not quote "429 × 12" as evidence of a limit — that is the
error this log exists to stop, and the run of twelve is the drained bucket
answering, not twelve trials.

Bodies were compared against the browser control on every 200, so the clean rows
are clean access and not a 200-with-a-challenge-page.

What this run establishes:

- **GPTBot did not refill across 100 minutes of zero traffic.** The last request
  it received was the cooldown probe at 22:34 UTC on 2026-09-03; this burst
  opened at 00:14 UTC and got 429 on the first request. That closes the hole in
  the 40-minute result above, where every probe could have been extending its
  own window: this gap contained no probes at all. So the window is longer than
  100 minutes, or it is not a time window. **Use this in the ticket rather than
  the 40-minute figure** — "does not refill across 100 minutes of no traffic"
  cannot be answered with "your crawler should slow down".

- **Meta-ExternalAgent is rate-limited, and its limiter works.** It was already
  on a 429 when the run started, so the burst measured nothing. Timing the
  cooldown immediately afterwards did measure it:

  ```
  00:18:43  probe  1  429
  00:19:43  probe  2  429
  00:20:44  probe  3  429
  00:21:44  probe  4  429
  00:22:45  probe  5  200
  ```

  Recovered about six minutes after the burst ended, **while still being probed
  once a minute** — so requests during the drained state do not extend it. That
  is an ordinary token bucket doing its job.

- **Which makes the two agents qualitatively different, not differently severe.**
  Both of Meta-ExternalAgent's readings fit one mechanism — a bucket holding at
  least 12 that refills in minutes; on 2026-09-03 it was rested, on 2026-09-04
  it was not. GPTBot fits no such mechanism: a bucket that does not refill
  across 100 idle minutes is not a bucket.

  This is the most useful thing in the ticket, because it is a control the host
  cannot dismiss. The same LiteSpeed origin, in the same minute, runs a working
  rate limiter for `meta-externalagent/1.1` and something that never releases
  for `gptbot/1`. Whatever is happening to GPTBot is therefore not "our rate
  limiting working as intended".

The 2026-09-03 note calling Meta-ExternalAgent "resolved host-side" was wrong
about the cause and right about the outcome. Nothing established a host-side
change; what was measured was a rested bucket. But it can crawl the site, which
is what the entry was trying to say. **Only GPTBot needs the ticket.** —
superseded 2026-10-01, below: Meta-ExternalAgent stopped recovering.

### 2026-10-01 — Meta-ExternalAgent no longer recovers

`npm run check:crawlers`, 12-request bursts, 21:06–21:08 UTC. Exit 1. The first
full run since 2026-09-04; GPTBot was last probed on 2026-09-10 in [#156].

| Agent | Result |
|---|---|
| GPTBot | **429 × 12** — `NO RESULT`, the burst opened on a 429 |
| Meta-ExternalAgent | **429 × 12** — `NO RESULT`, the burst opened on a 429 |
| OAI-SearchBot, ChatGPT-User | 200 × 12 |
| Claude-SearchBot, Claude-User, ClaudeBot | 200 × 12 |
| PerplexityBot, Perplexity-User, Amazonbot | 200 × 12 |
| Googlebot, Bingbot, Applebot | 200 × 12 |
| control: Chrome 128, unknown UA, Chrome again | 200 × 12 each |

Then `node tools/check-ai-crawlers.mjs --recover Meta-ExternalAgent --minutes 20`,
21:09–21:28 UTC: **429 on all 20 minute-spaced probes.**

- **Meta-ExternalAgent stopped behaving like a token bucket.** On 2026-09-04 it
  recovered about six minutes after a burst while being probed once a minute.
  Today it opened on 429, after nearly four weeks without a request from us,
  and stayed on 429 through 20 minutes of the same once-a-minute probing.
  Whatever limits it changed between those dates, and it now looks like the
  GPTBot limit. That 09-04 recovery was the control the Hostinger ticket leaned
  on. The ticket has been revised to report both agents, and is still unfiled
  as of this entry.
- **GPTBot's first request from us in 21 days was 429.** That is not a clean
  idle, because the counter is shared with OpenAI's real crawler (2026-09-03
  above), and real GPTBot traffic could have kept it drained. What it does show
  is four weeks of refusal.
- **What ChatGPT search reads is unaffected.** OAI-SearchBot and ChatGPT-User
  took 12 × 200. [OpenAI's crawler documentation][openai-bots] separates GPTBot
  (model training) from OAI-SearchBot (surfacing sites in ChatGPT search). So
  the 429 does not by itself explain the zero ChatGPT citations in § 2.

---

## 2. Citations

Method: ask each assistant the query verbatim, in a fresh session with no
personalisation, and record whether `hymtravel.com` appears as a cited source
(not merely whether the answer is correct). Fields follow `KEYWORD-MAP.md` § 4.

Count a citation only after expanding the full source list ("Show all" in
Google AI Mode, "Sources" in ChatGPT), then search the page's HTML for
`hymtravel` or "Hit Your Mark". The inline chips collapse sources into "+2", so
reading the chips alone undercounts.

### The query set — hold it steady

Fixed on 2026-10-01 from the `P1` clusters in `KEYWORD-MAP.md` § 2. Change the
wording only with a note in the run, because a reworded query starts a new
series.

| # | Query (verbatim) | Cluster | Our target page |
|---|---|---|---|
| 1 | How much does a luxury African safari cost per person? | A | none yet — planned `/travel-journal/what-a-safari-actually-costs/` |
| 2 | Do travel advisors charge fees, and how much? | A | `/faq/` |
| 3 | How much does a gorilla trekking permit cost in Rwanda vs Uganda? | A | `/destinations/rwanda/` |
| 4 | How much does an overwater villa in French Polynesia cost per night? | A | `/destinations/french-polynesia/` |
| 5 | When is the best time to go on safari in Tanzania vs Kenya? | B | `/destinations/kenya-tanzania/` |
| 6 | When does the Okavango Delta flood peak in Botswana? | B | `/destinations/botswana/` |
| 7 | Is the Mediterranean worth visiting in October? | B | `/travel-journal/mediterranean-october/` |
| 8 | How do Masters badges work, and can you buy them? | C | `/travel-journal/masters-field-report/` |
| 9 | How many days do you need in the Galápagos? | C | `/destinations/galapagos/` |
| 10 | Is the Glacier Express worth the money? | D | `/travel-journal/glacier-express-field-report/` |

### 2026-10-01 — first run: cited in 0 of 20

Run 21:10–21:30 UTC from a browser with no signed-in accounts.

- **Run:** Google AI Mode (`google.com/search?udm=50`, signed out) and ChatGPT
  (`chatgpt.com` with search, signed out).
- **Not run:** Perplexity — signed out, it now stops at "Sign up and repeat
  your request". Claude — needs a signed-in account. Both need a person with an
  account. Note the account in the row when they run, because a personalised
  session departs from the method.
- **Answer quality not scored.** `KEYWORD-MAP.md` § 4's 1–5 field has no rubric
  yet, and a score invented after the fact would poison the series the same way
  a backfilled citation would. Define the rubric before the next run.

| Date | Engine | # | Cited? | If not, who was (first five as listed) | Quality |
|---|---|---|---|---|---|
| 2026-10-01 | AI Mode | 1 | N | African Safari Home, Go2Africa, Safari Ventures, SafariBookings.com, African Safari Mag | — |
| 2026-10-01 | AI Mode | 2 | N | r/travelagents, AAA, NerdWallet, Fora Travel, PTN Travel | — |
| 2026-10-01 | AI Mode | 3 | N | touringinsights.com, SafariBookings.com, Follow Alice, jackaladventuresafrica.com, Sail Adventure Safaris | — |
| 2026-10-01 | AI Mode | 4 | N | Venture Tahiti, Nicole Lazo Travel, Four Seasons, Dream Overwater Bungalows, Sand In My Suitcase | — |
| 2026-10-01 | AI Mode | 5 | N | Art Of Safari, Go2Africa, The Luxury Africa DMC, Timbuktu Travel, responsiblevacation.com | — |
| 2026-10-01 | AI Mode | 6 | N | Atzaró Okavango, Okavango.com, Cedarberg Africa Travel, Far and Wild Travel, okavangodeltabotswanatours.com | — |
| 2026-10-01 | AI Mode | 7 | N | Viking, Reddit, Silvia's Trips, Celebrity Cruises, Cruise Critic | — |
| 2026-10-01 | AI Mode | 8 | N | r/masters, GOLF.com, Yahoo Sports, Masters (masters.com), TickPick | — |
| 2026-10-01 | AI Mode | 9 | N | Peru For Less, Happy Gringo Travel, Galápagos Conservancy, Metropolitan Touring, kimkim | — |
| 2026-10-01 | AI Mode | 10 | N | r/askswitzerland, Happy to Wander, MySwissAlps.com, Tripadvisor, swissscenictrains.com | — |
| 2026-10-01 | ChatGPT | 1 | N | zoma.travel, luxurysafarisafrica.co.za, africansafarigroup.com, africansafarimag.com, theluxuryafrica.com | — |
| 2026-10-01 | ChatGPT | 2 | N | asta.org | — |
| 2026-10-01 | ChatGPT | 3 | N | ugandawildlife.org, visitrwanda.com | — |
| 2026-10-01 | ChatGPT | 4 | N | hotelmaitai.com, guide.michelin.com | — |
| 2026-10-01 | ChatGPT | 5 | N | tanzaniaparks.go.tz, kws.go.ke, visittanzania.africa, prototypes.chemuagencies.com, masaimara.or.ke | — |
| 2026-10-01 | ChatGPT | 6 | N | okavango.com, ais.unwater.org | — |
| 2026-10-01 | ChatGPT | 7 | N | weather2travel.com, greecedays.com, junipertours.com | — |
| 2026-10-01 | ChatGPT | 8 | N | golf.com, pga.com, green-time.com, en.wikipedia.org | — |
| 2026-10-01 | ChatGPT | 9 | N | ecuador.travel | — |
| 2026-10-01 | ChatGPT | 10 | N | glacierexpress.ch, europerailtrip.com | — |

What the first run says, for what one month is worth:

- **The two engines cite different kinds of source.** ChatGPT cited one to five
  sources per answer and leaned on the body that sets the fact: park
  authorities, ASTA, the Uganda Wildlife Authority, Visit Rwanda, the Glacier
  Express operator. AI Mode listed anywhere from five to about fifteen source
  cards and mixed operators, blogs, Reddit and YouTube. Specialist operators with dated price guides (Go2Africa, The Luxury
  Africa DMC, Art of Safari) are what AI Mode quotes. A dated, attributed
  figure on our page competes with them. Restating the authority's figure does
  not displace the authority in ChatGPT.
- **Two of the ten targets cannot win yet.** Query 1's page does not exist (it
  is the month-1 post in `KEYWORD-MAP.md` § 3), and query 10's page was not in
  Google's index on 2026-10-01 ("Discovered – currently not indexed").

---

## 3. Google's generative AI features report

Search Console → Performance → **Generative AI features** (beta, first seen
here on 2026-10-01) counts impressions where a `hymtravel.com` page was shown in
Google's generative AI features. Its dimensions are page, country, device and
date. **It has no query dimension**, so it tells you which pages surface, not
for what.

### 2026-10-01

"3 months" setting, which covers 2026-08-31 to 2026-09-28, i.e. everything
since launch: **41 impressions across 23 pages.**

| Page | Impressions |
|---|---|
| `/` | 10 |
| `/destinations/asia/` | 4 |
| `/travel-journal/how-hotel-upgrades-work/` | 4 |
| `/destinations/caribbean-mexico/` | 3 |
| `/travel-journal/kyoto-april-vs-november/` | 3 |
| `/about/` | 2 |
| `/destinations/barbados-eastern-caribbean/` | 2 |
| `https://hymtravel.com/` (apex) | 1 |
| `/destinations/dominican-republic/` | 1 |
| `/destinations/europe/` | 1 |
| 13 more pages | — (not read) |

For scale, all of Search over 28 days: 967 impressions, 12 clicks, average
position 27.4. None of the ten pages above is a § 2 target. The site is
surfacing in Google's AI features, but for questions other than the ones § 2
samples. That is the case for keeping both measurements.

[#37]: https://github.com/soleman23/hymt/issues/37
[#156]: https://github.com/soleman23/hymt/issues/156
[openai-bots]: https://platform.openai.com/docs/bots
