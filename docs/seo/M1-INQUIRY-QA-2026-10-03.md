# M1 inquiry and journal browser QA — October 3, 2026

Checked the built site in Chrome at a desktop viewport and at 375 × 812, plus the production inquiry page. These checks support #208 and #209. The owner-confirmed production test is documented below.

## Homepage and inquiry path

- Desktop and mobile homepage render the revised process promise: “Start with a short trip inquiry. Mark will read what you share, then continue the conversation personally as your plans take shape.” The primary hero and header CTA target `/plan-your-trip/`. The owner confirmed the one-business-day personal reply promise and that **(541) 241-6481** reaches the approved business line.
- The four-step trip wizard advanced from experience through contact on mobile without losing state or clipping its controls. The first three steps permit unanswered optional questions; final submission requires first name and a valid email. An empty final submission showed the visible and accessible error “Please enter your first name and your email address.” It focused the first-name field.
- The production page rendered the Cloudflare human-verification widget at the final step. The localhost widget could not connect, as expected for the local preview. With the owner's approval, one clearly labeled **PRODUCTION TEST** inquiry was submitted on October 3 through the live form using the published business email as the reply address. The widget showed “Success!” and the page then showed “Your inquiry is on its way.” GA4 Realtime for the HYMT Website property showed one active user on the Plan Your Trip page and one `form_submit_success` key event shortly afterward. **Mark confirmed receipt in the business inbox** on October 3. The test must be excluded from qualified leads. The local source's single-success-state observer has a `fired` guard.
- The production trust card still displayed “24h” beside the one-business-day promise. Source now uses “1 day” and “Business Day Reply”. The 101 other source pages that promised a 24-hour response now say one business day; the next deployment presents one consistent commitment.
- A device-level `tel:` tap was not performed from this desktop browser. The link target in the rendered footer is `tel:+15412416481`.

## Journal hub

- Desktop and 375px mobile layouts rendered the featured Kentucky Derby post without card or heading overlap. The article grid shows 31 other posts; two “Load more” actions exposed 24 then all 31, leaving the Derby feature once and its article URL intact.
- All observed hub dates read September 1, 2026, matching the documented first-publication date. The separate date audit records which earlier draft labels still need owner review.

## Remaining acceptance checks

1. Exclude the October 3 **PRODUCTION TEST / Website QA** message from qualified-lead counts. GA4 Realtime displayed one `form_submit_success` during the test; a later event report can confirm final processed count.
2. On a physical mobile device, tap the approved 541 link without placing a call, then confirm the dialer displays the intended number.
3. Confirm the 32 post date records and image/firsthand claims with the owner where the audit flags uncertainty.
