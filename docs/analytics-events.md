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
  `keydown`), or **3 seconds after the window `load` event** for a visitor who
  never interacts. Never on page load itself: keep it off the critical path.
  The fallback was added 2026-09-02 after the GA4 review — until then a visitor
  who read above the fold and left sent nothing, so GA undercounted every page
  against its Search Console clicks. `load` fires after LCP has settled.
- These four events are the entire taxonomy. Adding an event means updating
  this file **and the privacy policy's Cookies & Analytics section** in the
  same commit. The policy also states the load rule above in one sentence, so
  a change to how the tag loads is a policy change too.

## Events

| Event | Fires when | Where wired |
| --- | --- | --- |
| `form_start` | First focus of any field inside the Plan Your Trip wizard or the Contact form, once per page view | `Analytics.astro` (focusin listener on `.plan-multistep` or `#contactForm`, whichever the page has) |
| `form_submit_success` | A form's branded success state is shown (`#successState` on Plan Your Trip, `#cfSuccess` on Contact) | `Analytics.astro` (MutationObserver on the success element) |
| `phone_click` | Any `tel:` link is clicked | `Analytics.astro` (delegated click listener), carries `link_location` |
| `email_click` | Any `mailto:` link is clicked | `Analytics.astro` (delegated click listener), carries `link_location` |

`form_start` listens on the form's own container rather than the document so
the newsletter's email field in the footer — present on Contact — cannot count
as a start. Contact got the event on 2026-09-02; before that only Plan Your Trip
had one, so Contact had no abandonment rate.

**Primary conversion:** `form_submit_success`. Marked as a key event in the
GA4 property on 2026-09-02.

## Parameters

Parameters say *where*, never *what*. Nothing typed into a field is ever sent.

| Parameter | On | Value |
| --- | --- | --- |
| `page_path` | every event | `location.pathname` |
| `link_location` | `phone_click`, `email_click` | `header`, `footer`, or `body` — where on the page the link sat. `footer` is anything inside `<footer>`; `header` is a `<header>` or `<nav>` outside `<main>`; everything else is `body` |

`link_location` replaced `link_url` on 2026-09-02. Every `tel:` link on the site
is the one number and every `mailto:` the one address, so the href could not
tell placements apart and the report showed one row per event. To read it in
GA4, register `link_location` as a custom dimension (event scope) under Admin →
Custom definitions; until then it appears only in Realtime and DebugView.

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
