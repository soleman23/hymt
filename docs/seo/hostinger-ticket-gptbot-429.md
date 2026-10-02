# Hostinger and the GPTBot / Meta-ExternalAgent 429 (#156): answered, not filed

**Do not file this again.** Hostinger answered on 2026-09-10, and the answer is
a published policy that cannot be changed per site.
[#156](https://github.com/soleman23/hymt/issues/156) was closed on that basis
on 2026-10-01.

## What Hostinger said

The case went to Hostinger support through hPanel's Agent chat on 2026-09-10.
Hostinger has no ticket form; the AI agent hands off to a human on request. The
first two human replies blamed a Cloudflare plus Hostinger CDN conflict and then
browser cache, and both were rebutted in the chat. At 21:10 a support agent
(Linas) wrote:

> The 429 GPTBot receives is coming from Hostinger's server-level
> infrastructure. Rate limits are applied to specific automated network
> ranges — GPTBot's range is affected, Googlebot's is not. … these rate limits
> cannot be disabled or adjusted for individual websites or hosting plans.

The chat closed for inactivity at 21:50. Nobody wrote the answer down, so on
2026-10-01 a full revised ticket was drafted before the conversation turned up
in hPanel → Agent → menu → **History**. Check that history before raising
anything with Hostinger again.

The policy is [Hostinger server-level rate limits for automated
traffic](https://www.hostinger.com/support/429-errors-on-automated-integrations-and-link-previews/).
It says the limits target "specific network ranges, such as Meta, AWS, and
Microsoft", apply "at the server level to all customers", and "cannot be
disabled for individual websites or hosting plans".

## What it does and does not explain

- **It explains Meta-ExternalAgent.** Meta is a named range. That fits it
  joining GPTBot on a persistent 429 by 2026-10-01
  (`ai-visibility-log.md` § 1).
- **It does not fully explain our measurements.** Every probe in #156 came from
  a residential IP, not from OpenAI's or Meta's networks, and was still refused
  on user-agent alone. The `gptbot/1` substring match is in the 2026-09-03
  entry of the log. So the rule keys on user-agent as well as, or instead of,
  network range. That would be the one question worth asking if the chat is
  ever reopened. It is unlikely to change the answer about what can be
  disabled.

## Impact, and what would change the decision

- **Citations: limited.** OAI-SearchBot and ChatGPT-User (ChatGPT search and
  browsing), ClaudeBot and the Claude agents, PerplexityBot, Googlebot,
  Bingbot and Applebot all get 200. GPTBot is OpenAI's training crawler.
- **Link previews: unverified.** The policy names Facebook, Instagram and
  WhatsApp link previews as a casualty. From our IP, `facebookexternalhit/1.1`
  gets 200 (2026-10-01), but the limit keys on Meta's network. Only Facebook's
  [Sharing Debugger](https://developers.facebook.com/tools/debug/) tests that
  path, and it needs a Facebook login.
- **Reopen the question if** a citation-relevant agent joins the 429 list in a
  monthly `npm run check:crawlers` run (#37), or link previews are confirmed
  broken. The lever then is a caching CDN in front of the origin, so crawlers
  are served from cache, and that is tied to the DNS work in #160.

The full ticket draft, with every measurement, is in git history: the
2026-09-10 version on `main` and the 2026-10-01 revision in #201's first commit.
