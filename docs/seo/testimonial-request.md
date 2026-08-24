# Client testimonials — the ask, ready to send

Prepared 2026-08-24 for #67. Everything below is ready for Devin to send;
nothing here is an agent task.

## Where this stands, counted today

| | |
|---|---|
| Real quotes live on the site | **3** — Brian S., Robert R., Sarah M., all on the homepage |
| Empty slots waiting | **79** — 67 destination pages, 12 experience pages |
| Quotes carrying a trip line | **1 of 3** (Brian S., "Oregon Wine Country") |

**The issue body says 53 slots. It is 53 no longer** — M7 added 25 destination
pages after it was written, and each shipped with its own empty slot. Derive it
rather than quoting the issue:

```bash
grep -rl "NEEDS MARK: a real client testimonial" src/content-pages/ | wc -l
```

Each empty slot is an HTML comment where a `<section class="testimonial-section">`
used to be, so the markup drops straight back in when a real quote arrives. A
page with no quote simply renders without the section, which is the current
state and passes the build.

## Two things worth knowing before asking

**Two of the three live quotes have no trip attached.** Robert R. and Sarah M.
carry a name but no destination or date. If either client can be asked for the
trip and the month, that is the cheapest improvement available — it costs one
email and it makes two existing quotes materially more credible.

**A client willing to be quoted is usually willing to leave a Travel Leaders
Network review.** Agent Profiler has a built-in review request under
**My Profile → My Reviews**, and the agency approves each before it displays.
That review lands on a property HYMT does not control, which is exactly why it
counts for more than a quote on our own site — and it is the only legitimate
route to public star ratings, since self-controlled reviews are ineligible.
**Ask for both in the same email.** See `off-site-profiles.md` § 1.

## What is needed per quote

| Field | Example |
|---|---|
| The quote, in the client's own words | *"Mark's bookings were completely accurate…"* |
| Named attribution — first name, last initial | `Brian S.` |
| The trip — destination and month/year | `Okavango Delta, August 2024` |
| Explicit confirmation they are happy to be quoted publicly | — |

The build **fails** if any testimonial renders without a named attribution, so
a quote without a name cannot be shipped even by accident. The trip line is not
enforced, but a quote without one reads as unverifiable — see the two above.

## The email, ready to send

> Subject: A quick favour — would you let me quote you?
>
> Hi [name],
>
> I'm putting the finishing touches on a new website for Hit Your Mark Travel,
> and I'd like to ask you something.
>
> Would you be willing to let me quote you on it? A couple of sentences about
> the [destination] trip is plenty — in your own words, whatever actually
> stands out to you about how it went. It doesn't need to be polished, and I'd
> rather have something honest than something flattering.
>
> If you're happy to, I'd put it on the page for [destination] as:
>
> [first name] [last initial]. · [Destination], [Month Year]
>
> First name and last initial only — no full name, no company, nothing that
> identifies you beyond that. And if you'd rather not, please just say so;
> it genuinely won't be awkward.
>
> One more, only if you're willing: Travel Leaders Network keeps a public
> advisor profile for me, and a review there carries more weight than anything
> on my own site because I can't edit it. If you'd be up for leaving one, I'll
> send the link — it takes about two minutes.
>
> Either way, thank you. It was a pleasure planning that one.
>
> Mark

### For the two existing quotes missing a trip line

> Subject: One small addition to your quote
>
> Hi [name],
>
> You very kindly let me quote you a while back, and it's going on the new
> site. One small thing would make it land better: could I add which trip it
> was and roughly when? Something like "Amalfi Coast, June 2025" underneath
> your name.
>
> If you'd rather I left it as is, that's completely fine.
>
> Thanks again,
> Mark

## Which pages to prioritise

79 slots will not fill. Aim for coverage where a quote does the most work
rather than for completeness:

1. **Pages Mark has genuinely sold** — a real quote on a page the practice
   actually books beats a spread of one-liners across pages it does not.
2. **The four sports-practice pages** — `experiences__sports-event-travel`
   and the motorsport and golf destinations. That is the differentiated half
   of the business and the half with no social proof on it at all.
3. **The strongest destination pages**, whichever those turn out to be at the
   §4.5 "request indexing" step in the launch runbook — the same shortlist.

Even a handful beats none. There is no threshold to hit.

## Rules that do not bend

- **Never ship an invented testimonial.** Not as a placeholder, not as
  "representative copy", not temporarily.
- **Never add `AggregateRating`** to HYMT-controlled reviews — CLAUDE.md, and
  it is in the verifier's forbidden `@type` list.
- Restoring a section means restoring the whole `<section class="testimonial-section">`
  block: `.testimonial-mark`, `.testimonial-quote`, `.testimonial-attr`. The
  CSS is untouched and still in the shared stylesheet.
- Transcription cleanup is fine. Rewriting is not — the three live quotes are
  the client's words with nothing but punctuation touched, and that is the bar.

## Finding the slots

```bash
grep -rn "NEEDS MARK: a real client testimonial" src/content-pages/
```
