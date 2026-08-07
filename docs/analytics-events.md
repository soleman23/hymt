# Analytics events — the complete list

GA4 direct via `gtag.js` (`src/components/Analytics.astro`, rendered from
`Base.astro`). No Tag Manager — decided in P0-5/DECISION-1: a 94-page static
site with one conversion does not need a management surface, and GTM costs
~90 KB plus a second round trip.

**Measurement ID:** placeholder `G-XXXXXXXXXX` until the GA4 property exists.
Paste the real ID into the `GA4_ID` constant at the top of
`src/components/Analytics.astro` — that is the only place it lives.

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

## Setup still owed by a human (P0-5)

- Create the GA4 property; paste the measurement ID as above.
- Verify Google Search Console on `www.hymtravel.com` as a **Domain property**
  (DNS TXT record) — before DNS cutover, so history starts on day one.
- Verify Bing Webmaster Tools by importing from GSC.
- Never verify or submit the staging domain anywhere.
