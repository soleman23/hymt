# Hostinger support ticket — GPTBot gets HTTP 429 from the origin (#156)

Drafted 2026-09-10; revised 2026-10-01, when Meta's crawler stopped recovering
from its 429 too and could no longer serve as the "working limiter" control.
Ready to paste into hPanel → Help → Contact us, or
`https://hpanel.hostinger.com/help`. Nothing needs attaching: every number
below is reproducible from the recipe at the end, and the issue thread at
[#156](https://github.com/soleman23/hymt/issues/156) holds the raw
measurements.

Paste the **Subject** and the whole **Ticket body** section. The section after
that is for us, not for Hostinger.

---

## Subject

GPTBot and meta-externalagent user-agents receive HTTP 429 with no Retry-After
on www.hymtravel.com and never recover, while every other crawler passes

## Ticket body

**Account.** Business hosting, order 1009711516, username u530147977, website
hymtravel.com (Node.js deployment; the built output is static files served by
LiteSpeed). Origin IP 195.179.237.168. Responses carry `Server: LiteSpeed`,
`platform: hostinger`, `panel: hpanel`.

**Problem.** Any request whose User-Agent contains the substring `gptbot/1`
(case-insensitive, anywhere in the string) receives `HTTP 429 Too Many
Requests` from the origin, with an empty body and **no `Retry-After` header**.
It applies to every path, including `/robots.txt`, so OpenAI's crawler cannot
even read the file that explicitly allows it. Other crawlers and ordinary
browsers, from the same client IP in the same second, get 200.

Meta's crawler (`meta-externalagent/1.1`) now behaves the same way. In early
September its 429 cleared within minutes. Since at least 2026-10-01 it does not.

We want both crawlers to crawl this site. Our `robots.txt` allows it on purpose, and
we control crawl rate there. This limit is not a protection we configured or
asked for, and we cannot find any control for it in hPanel.

**What we measured.**

1. 2026-09-10 20:25:17 UTC, same second, same client IP:
   `GET /robots.txt` with `Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)`
   → 429, `Content-Length: 0`, no `Retry-After`.
   `GET /robots.txt` with `Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)`
   → 200, 1689 bytes.

2. 2026-09-03, 12 back-to-back GPTBot requests to `/` from a rested state:
   `200 200 200 200 200 200 200 429 429 429 429 429`. In the same minute,
   Googlebot, bingbot, ClaudeBot, PerplexityBot, meta-externalagent and a
   Chrome desktop UA each took 12 back-to-back requests and got 200 throughout.

3. 2026-09-03 21:54 to 22:34 UTC: one GPTBot request per minute for 40
   minutes, 429 every time. A client that had just been allowed seven
   back-to-back requests cannot be exceeding a rate limit at one request per
   minute.

4. 22:34 to 00:14 UTC: we sent nothing for 100 minutes. The first GPTBot
   request after that gap was 429. So the limit does not reset across 100
   minutes of zero traffic; either its window is longer than that or it is not
   a time window.

5. 2026-09-04 00:18 to 00:22 UTC: `meta-externalagent/1.1` was also on a 429
   on the same origin, and it recovered to 200 about six minutes after its
   burst, while still being probed once a minute. On that date the origin ran
   a limiter that refilled for Meta's crawler and one that never refilled for
   GPTBot.

6. 2026-10-01, that difference is gone. 21:06 UTC: the first
   `meta-externalagent/1.1` request we had sent in nearly four weeks got 429,
   and so did eleven more back-to-back. 21:09 to 21:28 UTC: one request per
   minute for 20 minutes, 429 every time. The same procedure that saw it
   recover in six minutes on 2026-09-04 now sees no recovery at all. In the
   same run, GPTBot's first request from us in 21 days was also 429, while
   Googlebot, Bingbot, Applebot, ClaudeBot, PerplexityBot, Amazonbot,
   OAI-SearchBot and a Chrome desktop UA each got 12 × 200.

7. For GPTBot, the match is a substring, and the counter is shared. `GPTBot/1.0`,
   `gptbot/1.0`, `xGPTBot/1.0` and `foo GPTBot/1.0 bar` all get 429; `GPTBot`,
   `GPTBot/9.9`, `GPTBotx/1.0` and `GPT-Bot/1.0` all get 200. Strings that had
   never been sent to this origin were 429 on their very first request, so
   everything matching `gptbot/1` is counted together, which also means our
   tests and OpenAI's real crawler draw on one budget. On 2026-09-10 the first
   GPTBot request from a client that had sent nothing that day was already
   429.

**What we have ruled out on our side.**

- Our `.htaccess` (21,153 bytes and 345 lines in both the repository and the
  host's document root on 2026-10-01; 17,083 bytes and byte-identical on
  2026-09-03) has no user-agent rule, no rate limit and nothing that returns
  429.
  The 429 response carries every header our `.htaccess` sets
  (Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options,
  Referrer-Policy, Permissions-Policy), so it is generated inside the vhost
  after `.htaccess` is processed, not at an edge in front of it.
- `robots.txt` contains `User-agent: GPTBot` and `User-agent: Meta-ExternalAgent`,
  each followed by `Allow: /`.
- hPanel → CDN → AI Audit lists GPTBot as not blocked ("Blocked crawlers: 0")
  and shows 0 requests over 24 hours and 0 × 429 over 7 days while we
  generated dozens. Responses carry no CDN headers and come straight from
  195.179.237.168, so the CDN is not the layer serving this traffic.
- Nothing runs per request on our side. The site is static output; no
  application code can emit a 429.

**Questions.**

1. Which layer applies a per-user-agent limit to `gptbot/1` and
   `meta-externalagent` on this account (LiteSpeed per-vhost throttling, a WAF
   or bot rule, a platform-wide list), and what are its parameters?
2. Why does the 429 omit `Retry-After`, and why does neither limit reset? GPTBot
   stays on 429 across 100 minutes with no requests, and Meta's crawler across
   20 minutes of one request per minute.
3. What changed between 2026-09-04, when the `meta-externalagent/1.1` limit
   reset in about six minutes, and 2026-10-01, when it did not?
4. Please exempt both user-agents on hymtravel.com. If a limit must stay,
   please have the 429 carry a `Retry-After` so a well-behaved crawler knows
   how long to wait.

**How we will confirm the fix.** Twelve back-to-back requests per user-agent
against `/` and against `/destinations/africa/`. Twelve 200s is a pass; any 429
must carry `Retry-After`.

```
for ua in "Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)" \
          "meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)"; do
  for i in $(seq 1 12); do
    curl -s -o /dev/null -w '%{http_code} ' -A "$ua" https://www.hymtravel.com/
  done; echo
done
```

A burst that opens on 429 means the limit was already tripped and measures
nothing, so please tell us when a change has been made and we will test from
a rested state.

---

## For us, after filing (not part of the ticket)

- Put the ticket number and the date filed on #156.
- Do not re-probe GPTBot or Meta-ExternalAgent while waiting. Every request
  matching `gptbot/1` draws on the shared budget, and a tripped bucket answers
  429 for at least 100 minutes of silence. A "still broken" reading taken by
  hand is the mis-measurement #156 was filed with twice.
- When Hostinger replies that a change has been made, wait at least two hours
  with no GPTBot or Meta traffic from us, then run `npm run check:crawlers`. Read the
  whole sequence; the tool reports a burst that opens on 429 as `NO RESULT`,
  not as a verdict.
- Log the outcome in `docs/seo/ai-visibility-log.md` § 1 under the date, and
  re-run the full table at the next #37 cycle even if this closes, because the
  Meta limiter's state changes on its own and GPTBot's may too.
- Acceptance on #156: 12 × 200 on `/` and `/destinations/africa/` for both
  user-agents (Meta added 2026-10-01), `Retry-After` on any 429 that remains,
  `robots.txt` untouched.
