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

Open in [#156] until 2026-10-01, when it closed as host policy (see the
2026-10-01 resolution below). What was established this session, beyond
what the issue body already said:

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
superseded 2026-10-01, below: Meta-ExternalAgent did not recover within a
20-minute probe run.

### 2026-10-01 — Meta-ExternalAgent did not recover in 20 minutes

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

- **Meta-ExternalAgent did not recover within this run.** On 2026-09-04 it
  recovered about six minutes after a burst while being probed once a minute.
  Today it opened on 429 and stayed on 429 through 20 probes of the same
  once-a-minute kind. The checker reads a run like that as one of two things:
  the window is longer than 20 minutes, or each probe extends it. This run
  cannot tell them apart, because no probe-free cooldown was measured, and it
  does not show that the limit never clears. Opening on 429 after nearly four
  weeks without a request from us is not a clean idle either: Meta's real
  crawler may share the counter, as OpenAI's does for GPTBot (below). To
  separate the two readings, leave the agent unprobed for an hour, then send
  one request. The 09-04 recovery was the control the drafted Hostinger
  ticket leaned on. It no longer matters: see the resolution below.
- **GPTBot's first request from us in 21 days was 429.** That is not a clean
  idle, because the counter is shared with OpenAI's real crawler (2026-09-03
  above), and real GPTBot traffic could have kept it drained. What it does show
  is four weeks of refusal.
- **What ChatGPT search reads is unaffected.** OAI-SearchBot and ChatGPT-User
  took 12 × 200. [OpenAI's crawler documentation][openai-bots] separates GPTBot
  (model training) from OAI-SearchBot (surfacing sites in ChatGPT search). So
  the 429 does not by itself explain the zero ChatGPT citations in § 2.

**Resolution: host policy, cannot be changed per site. [#156] closed
2026-10-01.** Hostinger had already answered on 2026-09-10. The answer sat in
hPanel → Agent → History and was never written down here. A human agent wrote
that the 429 "is coming from Hostinger's server-level infrastructure. Rate
limits are applied to specific automated network ranges … these rate limits
cannot be disabled or adjusted for individual websites or hosting plans". The
policy is published as [Hostinger server-level rate limits for automated
traffic][hostinger-429], which names Meta among the ranges, and that covers
Meta-ExternalAgent too. Our probes came from a residential IP and were still
refused by user-agent, so the rule matches on user-agent as well as range. The
outcome does not change either way. `docs/seo/hostinger-ticket-gptbot-429.md`
now records this in place of the draft.

Keep running `npm run check:crawlers` each cycle. The point is no longer to
build a case. It is to notice if the agents that matter for citations
(OAI-SearchBot, ChatGPT-User, the Claude agents, PerplexityBot, Googlebot,
Bingbot) ever join GPTBot and Meta-ExternalAgent on 429. That would be a
reason to put a caching CDN in front of the origin.

### 2026-10-30 — run from a datacenter IP, so not comparable to 10-01

`npm run check:crawlers`, 12-request bursts, about 02:50 UTC, exit 1. **This
run came from a cloud container, not the residential IP the 09-04 and 10-01
runs used.** Hostinger's published policy rate-limits "specific automated
network ranges", so a change below may be the vantage point rather than the
site. Read it as a prompt to re-run from residential, not as a regression.

| Agent | Result | vs 10-01 |
|---|---|---|
| GPTBot, Meta-ExternalAgent | 429 × 12, `NO RESULT` | same |
| **ClaudeBot** | 429 × 12, `NO RESULT` | was 200 × 12 |
| **Claude-User** | 200 × 8, then 429 × 4, `THROTTLED` | was 200 × 12 |
| **Bingbot, Applebot** | 403 × 12, `ERROR` (LiteSpeed 403 page) | were 200 × 12 |
| OAI-SearchBot, ChatGPT-User, Claude-SearchBot | 200 × 12 | same |
| PerplexityBot, Perplexity-User, Amazonbot, Googlebot | 200 × 12 | same |
| controls: Chrome, unknown UA, Chrome again | 200 × 12 each | same |

- **Bingbot and Applebot 403 is the one to settle first.** `robots.txt` and
  `.htaccess` have not changed since #238, so if real it is host-side. The
  likeliest reading is the host refusing a request that claims to be Bingbot
  from a non-Microsoft address, which a residential run would also not
  exercise, so the check that decides it is first-party: Bing Webmaster Tools
  crawl data (and URL inspection). Bing feeds ChatGPT search.
- The citation agents that matter (OAI-SearchBot, ChatGPT-User,
  Claude-SearchBot, PerplexityBot, Googlebot) were all clean.

**Follow-up, same day, from residential (03:30 UTC, a US home ISP).** Both
changes reproduce, so neither was the datacenter vantage point. And Googlebot
has now joined them:

| Agent | Residential, 2026-10-30 |
|---|---|
| GPTBot, Meta-ExternalAgent, **ClaudeBot** | 429 × 12, `NO RESULT` |
| **Claude-User** | 200 × 8, then 429 × 4, `THROTTLED` |
| **Googlebot, Bingbot, Applebot** | 403 × 12, `ERROR` |
| OAI-SearchBot, ChatGPT-User, Claude-SearchBot | 200 × 12 |
| PerplexityBot, Perplexity-User, Amazonbot | 200 × 12 |
| controls: Chrome, unknown UA, Chrome again | 200 × 12 each |

- **The 403s are the host refusing spoofed search-engine user agents, not a
  block on the real crawlers.** The first-party data says so for Google.
  Search Console → Settings → Crawl stats (updated 10/27) shows 920 real
  Googlebot requests since launch: 93% 200, 5% 404, 3% 301 and **no 403s**,
  with both hosts at "No problems". The 404s are superseded content-hashed CSS
  files and `apple-app-site-association` probes. A 403 for a Googlebot UA
  from a home IP that is not Google's is what bot verification by reverse DNS
  looks like. The datacenter run got 200 for Googlebot, so the rule was
  probably switched on host-side after it, or it treats ranges differently.
  This tool cannot measure these three agents from here any more. Read Google
  from Crawl stats.
- **Bing is still unverified first-party.** Bing Webmaster Tools was set up as
  mark@hymtravel.com (HANDOFF-cutover-2026-09-02), and this session had no
  access to it. Bing feeds ChatGPT search, so this is the open question. Mark,
  or a user Mark adds to the property, should check Bing Webmaster Tools → URL
  Inspection for `/` and the crawl errors.
- **ClaudeBot 429 from two networks is a real change from 10-01.** It does not
  touch citations, because Claude-SearchBot (search) is clean. Claude-User
  (fetches on a user's request) throttling after 8 is ordinary limiting.

---

## 2. Citations

Method: ask each assistant the query verbatim, in a fresh session with no
personalisation, and record whether `hymtravel.com` appears as a cited source
(not merely whether the answer is correct). Fields follow `KEYWORD-MAP.md` § 4.

Count a citation only after expanding the full source list ("Show all" in
Google AI Mode, "Sources" in ChatGPT), then search the page's HTML for
`hymtravel` or "Hit Your Mark". The inline chips collapse sources into "+2", so
reading the chips alone undercounts.

For every cited source, record the **URL** the source link opens, with
tracking parameters such as `utm_source` removed. Add the display name beside
it if you like, but never record the name alone. A name like "Reddit",
"Four Seasons" or "Tripadvisor" cannot identify the page once the answer
changes, and the answer cannot be replayed.

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
| 8 | How do Masters badges work, and can you buy them? | C | `/travel-journal/the-masters/` |
| 9 | How many days do you need in the Galápagos? | C | `/destinations/galapagos/` |
| 10 | Is the Glacier Express worth the money? | D | `/travel-journal/glacier-express/` |

Targets 8 and 10 were `/travel-journal/masters-field-report/` and
`/travel-journal/glacier-express-field-report/` until the journal slugs were
renamed on 2026-10-03. The old paths 301 to the ones above, so a citation of
either counts for its row. The query wording is unchanged, so the series
continues.

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
- **Sources recorded by name, not URL.** The AI Mode rows carry each source
  card's display name and the ChatGPT rows its domain. The URLs were not
  captured, and the answers cannot be replayed. So this run compares by
  source, not by page, and page-level comparison starts with the next run
  (method above). Re-asking the queries now would record a later answer under
  this date.

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
- **One target cannot win anywhere yet, and one cannot win in AI Mode.**
  Query 1's page does not exist (it is the month-1 post in `KEYWORD-MAP.md`
  § 3), so neither engine can cite it. Query 10's page was not in Google's
  index on 2026-10-01 ("Discovered – currently not indexed"), which rules it
  out of AI Mode. It does not rule it out of ChatGPT, whose search fetches
  pages with its own crawler, OAI-SearchBot (12 × 200 in § 1), so Google's
  verdict does not decide it there. Work on query 10 can still move the
  ChatGPT result now.

### 2026-10-30 — second run: cited in 0 of 20, first run with URLs

Run 03:30–03:52 UTC from a browser with no signed-in accounts, on a
residential connection. Same 10 queries, verbatim.

- **Engines:** Google AI Mode (`google.com/search?udm=50`, signed out) and
  ChatGPT (`chatgpt.com`, signed out, **Web search chosen from the composer's +
  menu**). Perplexity and Claude were not run, for the 10-01 reasons.
- **ChatGPT needs Web search selected by hand now.** With `?hints=search`
  alone, the first answer cited nothing. Signed-out answers also no longer
  carry clickable links: sources sit in popover chips whose rows open by
  script. So the URLs were read from the answer's own citation metadata
  (`searchSources` entries and `ref_id …search…` references in the stream
  `chatgpt.com` receives), with `utm_source=chatgpt.com` removed. That list is
  what the Sources panel shows, so ChatGPT counts run higher than 10-01's.
- **AI Mode source cards link through `google.com/goto`.** Each was resolved
  to its destination by following the redirect. Reddit, YouTube, Facebook and
  TikTok are recorded like any other source.
- **AI Mode showed no source list for queries 5 and 9**, only two sponsored
  results. Both were asked twice, a few minutes apart, with the same result.
  That is "no sources shown", not "not cited": nothing was citable.
- **Every URL is in [`ai-citations-2026-10-30.md`](ai-citations-2026-10-30.md).**
  The table keeps the first five as listed, plus the total.
- **Quality not scored.** There is still no agreed rubric, so the column
  stays "—".

| Date | Engine | # | Cited? | Sources | First five as listed |
|---|---|---|---|---|---|
| 2026-10-30 | AI Mode | 1 | N | 10 | safaribookings.com/how-much-does-an-african-safari-cost · africansafarihome.com/safari-pricing · adventureoutloud.com/blog/how-much-does-a-safari-cost/ · africansafarimag.com/african-safari-cost · africansafarigroup.com/africa-safari-cost-what-does-a-real-safari-actually-cost-in-2026/ |
| 2026-10-30 | AI Mode | 2 | N | 10 | reddit.com/r/TravelHacks/comments/yvwvzr/… · nerdwallet.com/travel/learn/do-travel-agents-really-save-you-money-actually-yeah · foratravel.com/join/resources/travel-agent-service-fees · travelweekly.com/Travel-News/Travel-Agent-Issues/More-than-half-of-US-advisors-now-charge-fees · ottotheagent.com/blog/travel-agent-costs |
| 2026-10-30 | AI Mode | 3 | N | 13 | silverbackgorillatours.com/gorilla/the-cost-of-gorilla-trekking-safaris-and-tours · reddit.com/r/solotravel/comments/juf5ll/… · ongeriexpeditions.com/blog-gorilla-trekking-cost · watatutravel.com/en/blog/gorilla-trekking-rwanda-uganda-permits-logistics-2026 · gokenyasafari.com/where-to-see-gorillas-in-africa-rwanda-vs-uganda/ |
| 2026-10-30 | AI Mode | 4 | N | 14 | facebook.com/groups/boraboratravel/posts/1509563710809901/ · tiktok.com/@pointsandmiles/video/7565196521289960759 · reddit.com/r/travelblog/comments/1twk7x4/… · facebook.com/groups/boraboras/posts/1421801395719652/ · bemytravelmuse.com/how-much-for-a-trip-to-bora-bora/ |
| 2026-10-30 | AI Mode | 5 | — | 0 | no source list shown (2 sponsored results), twice |
| 2026-10-30 | AI Mode | 6 | N | 7 | atzaro-okavango.com/blog/best-time-to-visit-the-okavango-delta-2025-month-by-month-guide/ · okavango.com/okavango-delta-flood-cycle.php · botswana.co.za/Botswana_FAQ-travel/okavango-delta-botswana-seasons.html · okavangodeltagamereserve.com/best-time-to-visit-the-okavango-delta-flood-seasons-explained/ · facebook.com/hillsofafrica/posts/… |
| 2026-10-30 | AI Mode | 7 | N | 21 | reddit.com/r/Cruise/comments/1lce4of/… · cruisecritic.com/articles/best-months-to-cruise-the-mediterranean-a-year-round-guide · cruisebound.com/articles/mediterranean-cruise-ports-in-october · youtube.com/watch?v=NbmgPUQUBrg · travel.yahoo.com/guides/articles/why-fall-secretly-best-time-131000108.html |
| 2026-10-30 | AI Mode | 8 | N | 12 | reddit.com/r/masters/comments/1m8m5oc/… · golf.com/news/masters-series-badges-coveted-item-sports-cost/ · youtube.com/watch?v=U3YMt8EJCrE · theblendgroup.com/insight/masters-badges-what-they-are-how-to-get-access/ · facebook.com/fb-answers/masters-tournament-badges/ |
| 2026-10-30 | AI Mode | 9 | — | 0 | no source list shown (2 sponsored results), twice |
| 2026-10-30 | AI Mode | 10 | N | 24 | reddit.com/r/askswitzerland/comments/1knidqp/… · community.ricksteves.com/travel-forum/switzerland/is-the-glacier-express-worthwhile · findingalexx.com/glacier-express-worth-it/ · reddit.com/r/askswitzerland/comments/1i5zvjx/… · findingalexx.com/bernina-express-vs-glacier-express/ |
| 2026-10-30 | ChatGPT | 1 | N | 6 | zoma.travel/blog/luxury-safari-cost-2026 · privatetourscapetown.com/blog/how-much-does-luxury-african-safari-cost · privatetourscapetown.com/blog/private-african-safari-tours-guide · uncompromised.travel/expeditions/what-a-safari-costs-by-budget-2026 · thesafarijournal.com/luxury-safari-cost/ |
| 2026-10-30 | ChatGPT | 2 | N | 6 | aarp.org/money/personal-finance/is-a-travel-adviser-worth-it/ · aaa.com/tripcanvas/article/travel-advisor-vs-travel-agent-what-do-they-do-CM1651 · asta.org/…/2025-astapresskit.pdf · journeyswithjb.com/travel-advisor-cost · tripdash.net/advisor-resources/travel-agent-service-fees |
| 2026-10-30 | ChatGPT | 3 | N | 9 | visitrwandabookings.rdb.rw/rdbportal/mountain-gorilla-tracking · uggovagent.ug/tourism · eastafricasafaris.com/gorilla-trekking-permit-cost/ · sailadventuresafarisdmc.com/journal/gorilla-permit-prices-2026-27 · visitrwandabookings.rdb.rw/rdbportal/hiking-on-a-chain |
| 2026-10-30 | ChatGPT | 4 | N | 8 | polynesiancompass.com/stay/overwater/cost · overwaterguide.com/destinations/moorea · only5star.com/destinations/bora-bora-overwater-villa-cost-2026 · polynesiancompass.com/stay/best-moorea-resorts · polynesiancompass.com/stay/hotels/hilton-moorea |
| 2026-10-30 | ChatGPT | 5 | N | 17 | tanzaniatourism.com/about/when-to-travel · tanzaniaparks.go.tz/serengeti · tanzaniatourism.com/destination/selous-game-reserve · kws.go.ke/faq-items/what-is-the-weather-pattern-in-kenya-… · masaimara.or.ke/masai-mara-visitor-guide-how-to-plan-a-safari-properly/ |
| 2026-10-30 | ChatGPT | 6 | N | 18 | expertafrica.com/botswana/info/okavango-delta-flood · agris.fao.org/search/fr/records/67bdb401e27dfa12518a75a1 · conservation.org/…/rap27_okavango_delta_botswana_jun-2000.pdf · okacom.org/sites/default/files/documents/TDA_Final-English.pdf · travel.africageographic.com/destinations/botswana/okavango-delta/when-to-visit-okavango-delta |
| 2026-10-30 | ChatGPT | 7 | N | 12 | weather2travel.com/mediterranean/october/ · time-to-travel.org/guides/autumn-holiday-destinations-europe/ · themediterraneanliving.com/where-to-go-mediterranean-october/ · europeandestinations.co.uk/seasons/autumn-holidays/islands-in-autumn/ · europeantourism.org/europe-in-autumn/ |
| 2026-10-30 | ChatGPT | 8 | N | 17 | sportsbusinessjournal.com/Articles/2026/06/01/masters-lottery-ticket-prices-to-remain-flat-in-2027/ · sports.yahoo.com/articles/2026-masters-badge-prices-slowly-212633961.html · frontofficesports.com/article/seatgeek-is-first-reseller-to-drop-masters-tickets-after-crackdown/ · golf.com/news/how-much-cost-masters-2026/ · goodseats.com/performers/masters-golf-tournament/ |
| 2026-10-30 | ChatGPT | 9 | N | 14 | galapagos.org/travel/planning-a-trip/ · lonelyplanet.com/articles/first-timers-guide-galapagos-islands · expeditions.com/travel-guide/galapagos-travel-guide/how-many-days-in-galapagos · visitgalapagos.travel/info/tips/travel-galapagos-information.html · visitgalapagos.travel/blog/best-way-to-travel-galapagos.html |
| 2026-10-30 | ChatGPT | 10 | N | 14 | glacierexpress.ch/en/price · glacierexpress.ch/en/price?anchor=luggage-information · glacierexpress.ch/en/faq · seat61.com/trains-and-routes/glacier-express.htm · glacierexpress.ch/de/price |

Hosts and paths are shortened in the table. The full `https://` URLs are in
the companion file.

What the second run adds:

- **Still 0 of 20, and the target pages are now indexed.** Queries 8 and 10's
  targets, and the six 10-01 "Discovered" pages, all earn Google impressions
  now (§ 3 and the #37 cycle comment). Being indexed has not been enough to
  earn a citation in either engine.
- **The 10-01 pattern holds at page level.** ChatGPT leans on the body that
  sets the fact: Visit Rwanda's booking portal, Tanzania and Kenya park and
  tourism authorities, the Glacier Express operator, FAO and Ramsar papers
  for the Okavango. AI Mode leans on forums and social posts (Reddit in 6 of
  8 source lists, YouTube in 6, Facebook in 5, TikTok in 2) next to operator
  price guides. ChatGPT cited Reddit in none.
- **Query 1 still has no page,** and its first-five lists are entirely dated
  operator price guides ("2026", "2027" in the slugs). This is the clearest
  gap in the set.

---

## 3. Google's generative AI features report

Search Console → Performance → **Generative AI features** (beta, first seen
here on 2026-10-01) counts impressions where a `hymtravel.com` page was shown in
Google's generative AI features. Its dimensions are page, country, device and
date. **It has no query dimension**, so it tells you which pages surface, not
for what.

### 2026-10-01

"3 months" setting, which covers 2026-08-31 to 2026-09-28, i.e. everything
since launch: **41 impressions for the site, across 23 pages.**

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
| `/destinations/greenland/` | 1 |
| `/destinations/peru/` | 1 |
| `/destinations/south-pacific/` | 1 |
| `/destinations/spain/` | 1 |
| `/destinations/turks-caicos/` | 1 |
| `/experiences/sports-event-travel/` | 1 |
| `/experiences/wellness-retreat-travel/` | 1 |
| `/plan-your-trip/` | 1 |
| `/privacy-policy/` | 1 |
| `/travel-journal/botswana-shoulder-season/` | 1 |
| `/travel-journal/mediterranean-october/` | 1 |
| `/travel-journal/napa-sonoma-winery-route/` | 1 |
| `/travel-journal/willamette-valley-winery-route/` | 1 |

**The rows add up to 44, not 41, and both are right.** The headline counts
impressions for the property, so one AI answer that showed two of our pages
is one impression. The page table counts the same answer once per page. The
Countries (14 rows), Devices (3) and Dates (29) tabs are also counted per
property, and each totals exactly 41. Google documents the difference under
[Search Console's generative AI report metrics][gsc-ai-metrics]. Do not
"correct" the headline to the row sum in later entries. The first version of
this entry read only the first ten rows and called the other 13 "not read";
they were read on 2026-10-01 after review of #201 flagged the arithmetic.

For scale, all of Search over 28 days: 967 impressions, 12 clicks, average
position 27.4. One of the 23 pages is a § 2 target:
`/travel-journal/mediterranean-october/` (query 7), with 1 impression. The
other 22 are not. The site is surfacing in Google's AI features, but mostly
for questions other than the ones § 2 samples. That is the case for keeping
both measurements.

### 2026-10-30

Read 03:55 UTC; data through 2026-10-27.

- **"3 months" (31 Aug – 27 Oct, everything since launch): 196 impressions
  across 58 pages.** That is up from 41 across 23 at 10-01, so about 155 of the
  196 arrived in the four weeks since.
- **"28 days" (30 Sep – 27 Oct): 153 impressions across 50 pages.** The 50 rows
  sum to 160. Both are right: the headline counts per property and the rows
  count per page (see 10-01 above). The headline is the number to quote.

Top of the 28-day page table:

| Page | Impressions |
|---|---|
| `/travel-journal/amanjiwo/` | 15 |
| `/destinations/south-pacific/` | 13 |
| `/experiences/sports-event-travel/tennis/` | 11 |
| `/travel-journal/glacier-express-field-report/` (301 → `/travel-journal/glacier-express/`) | 11 |
| `/` | 9 |
| `/destinations/asia/` | 8 |
| `/destinations/georgia-armenia/` | 8 |
| `/experiences/culture-immersive-travel/` | 7 |
| `/destinations/europe/` | 5 |
| `/about/`, `/destinations/greenland/`, `/experiences/multigenerational-travel/`, `/travel-journal/willamette-valley-winery-route/` | 4 each |
| 6 pages | 3 each |
| 8 pages | 2 each |
| 23 pages | 1 each |

For scale, all of Search over the same 28 days: 1.48K impressions, 16 clicks,
1.1% CTR, average position 30.4.

- **§ 2 targets now show up here.** Four of the nine targets that exist
  appear: the Glacier Express post (query 10) with 11, under its pre-rename
  URL; `/faq/` (query 2) with 2; `/destinations/botswana/` (query 6) and
  `/travel-journal/the-masters/` (query 8) with 1 each. On 10-01 only one
  did. Google's AI features show these pages, but neither engine sampled in
  § 2 cites them for the § 2 wording.
- **Two of the top four changed since 10-01.** `/destinations/south-pacific/`
  was rebuilt as the M2 route-selection hub (#246, merged 2026-10-04) . It
  had 1 impression since launch at the 10-01 read and has 13 in the last 28
  days. It also leads all of Search with 287
  impressions in 28 days. The Glacier Express post was "Discovered – not
  indexed" on 10-01.

[#37]: https://github.com/soleman23/hymt/issues/37
[#156]: https://github.com/soleman23/hymt/issues/156
[openai-bots]: https://platform.openai.com/docs/bots
[hostinger-429]: https://www.hostinger.com/support/429-errors-on-automated-integrations-and-link-previews/
[gsc-ai-metrics]: https://support.google.com/webmasters/answer/16984139#metrics
