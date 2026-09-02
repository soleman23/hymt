# Analytics events — the complete list

GA4 direct via `gtag.js` (`src/components/Analytics.astro`, rendered from
`Base.astro`). No Tag Manager — decided in P0-5/DECISION-1: a 94-page static
site with one conversion does not need a management surface, and GTM costs
~90 KB plus a second round trip.

**Measurement ID:** `G-J6VZEBPCBC`, live since 2026-09-01. It lives in the
`GA4_ID` constant at the top of `src/components/Analytics.astro` — that is the
only place it lives. Replacing the property means editing that constant and
this line, and nothing else.

## Hard rules

- **Never fires on staging.** The script exits unless
  `location.hostname === 'www.hymtravel.com'`. Do not weaken this gate.
- `gtag.js` loads on first user interaction (`scroll` / `pointerdown` /
  `keydown`), never on page load. Keep it off the critical path.
- These four events are the entire taxonomy. Adding an event means updating
  this file in the same commit.

## Events

| Event | Fires when | Where wired |
| --- | --- | --- |
| `form_start` | First focus of any field on the Plan Your Trip form, once per page view | `Analytics.astro` (focusin listener, `/plan-your-trip/` only) |
| `form_submit_success` | A form's branded success state is shown (`#successState` on Plan Your Trip, `#cfSuccess` on Contact) | `Analytics.astro` (MutationObserver on the success element) |
| `phone_click` | Any `tel:` link is clicked | `Analytics.astro` (delegated click listener) |
| `email_click` | Any `mailto:` link is clicked | `Analytics.astro` (delegated click listener) |

**Primary conversion:** `form_submit_success`. Mark it as a key event in the
GA4 property once created (Admin → Events → toggle "Mark as key event").

### The newsletter is deliberately not counted here

SEC-10 (#83) moved the newsletter off a native form POST and onto `fetch` with
an in-page success state, so it now has a branded success node exactly like the
other two forms. It is still **not** wired to `form_submit_success`, and that is
a decision rather than an oversight.

`form_submit_success` is the primary conversion and means *someone asked Mark to
plan a trip*. A newsletter signup is a far cheaper action; folding both into one
number would inflate the conversion rate and make it useless for judging whether
the site is working.

The mechanism that keeps them apart is the element ID. `Analytics.astro` observes
`#successState` (Plan Your Trip) or `#cfSuccess` (Contact); the newsletter's node
is `#nlSuccess`, which nothing observes. **If newsletter signups ever should be
counted, add a separate event — do not rename that node into the observed pair.**

## Setup still owed by a human (P0-5)

- Create the GA4 property; paste the measurement ID as above.
- Verify Google Search Console as a **Domain property on `hymtravel.com`** —
  the bare domain, via DNS TXT; a Domain property covers `www` and the apex
  together, so "on www" is the wrong shape (runbook § 1.2) — before DNS
  cutover, so history starts on day one.
- Verify Bing Webmaster Tools by importing from GSC.
- Never verify or submit the staging domain anywhere.
