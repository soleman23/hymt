# M1 live trust and crawl audit — October 2, 2026

This records the public, reproducible checks for issues #207, #210, and #34. The URL-level GSC exception list and report values remain in the owner's private working folder.

## Deployment and business details

- Hostinger hPanel > `hymtravel.com` > Deployments identified the **Current** completed production deployment as `01a0fa30-ed00-71ce-8509-adb05c5dfb2f`, branch `main`, commit `5f547a7e` (full repository SHA `5f547a7ef0cdd8c307308b071aa98189e016abd1`). hPanel displayed “Deployed: 2026-10-01 18:22”; its timezone was not labeled in that view. The deployment logs show checkout of that commit, `npm run build`, successful publishing and application restart. This is the exact production revision as checked October 3, before the milestone branch is released.
- That source revision's contact page, footer, and Organization telephone schema use the owner-approved **(541) 241-6481**.
- The owner confirmed on October 3 that this number reaches the approved business line. A device-level tap-to-call check is still outstanding; this confirmation is about routing, not evidence that every live link was tapped on a phone.
- A live crawl of all 122 sitemap URLs found the old 408 number on **0** pages and found the 541 number plus a `tel:+15412416481` link on **all 122** pages. The live Organization telephone schema uses the 541 number.
- Live `/contact/`, `/destinations/maldives/`, and `/experiences/` HTML matched the current source build byte for byte. The independent Hostinger deployment record above identifies the served release commit.
- The profile copy in `off-site-profiles.md` uses 541 and its sports-access descriptions now call for an availability check. The owner directed us to use that repository list as the inventory. The current published state of the profiles below has not been verified. Do not add profile URLs to `sameAs` until each public profile is confirmed.
- An October 3 web-search result for the homepage still displayed the former Wix copy and 408 number from a crawl labeled about two months old. That is a stale search-result snapshot, not the current HTML; the live crawl above remains the source for the present phone. Recheck Google's rendered result after its next crawl without changing the approved live number.

### Controlled profile inventory from repository records

| Surface | Repository record | Public phone verified? | Next check |
| --- | --- | --- | --- |
| Instagram | `https://www.instagram.com/travelwithsoleman/`, already in site `sameAs` | No public phone shown in the October 3 browser view. The profile's website link targets `www.hymtravel.com` with tracking parameters. | Check any account-only contact button and phone field from the profile owner account. A September 11 sports post says access is not on sale to the public; review that claim against the approved cautious wording. |
| Google Business Profile | Candidate named in `off-site-profiles.md`; no exact published URL recorded | No | Find the managed profile URL and verify its phone and website fields. |
| LinkedIn | Draft profile copy in `off-site-profiles.md`; no exact published URL recorded | No | Find the owned page or advisor profile and compare its contact fields. |
| Travel Leaders Network | Agent Profiler draft; numeric advisor ID and public URL not recorded | No | Confirm whether a profile is online, then verify its public fields. |
| Bend Chamber | Draft listing; no published URL recorded | No | Confirm whether membership and listing are live before editing. |
| ASTA | Draft listing; no published URL recorded | No | Confirm whether membership and listing are live before editing. |

This is a source inventory, not a claim that six profiles have been published. Instagram is the only exact public profile URL verified here. Search results did not establish an exact owned listing URL for the other candidates on October 3; account-level review is needed before marking their rows verified.

## Crawl and redirect sample

The public sitemap listed 122 URLs. Each returned HTTP 200, a self-referencing canonical, one H1, and no noindex directive on October 2 Pacific. The repository's `npm run verify:prod` also passed all 122 remote pages and the live security-header check.

| Former or structural path | Live response | Destination |
| --- | --- | --- |
| `/terms-conditions` | 301 | `/terms-and-conditions/` |
| `/trips` | 301 | `/travel-journal/` |
| `/about` | 301 | `/about/` |
| `/privacy-policy` | 301 | `/privacy-policy/` |

The first two mappings are the confirmed legacy Wix URLs in the launch runbook. An unknown path should remain a 404 unless independent evidence shows a relevant predecessor. This audit confirms the two documented mappings and the two structural redirects; it is not a complete inventory of every historical Wix URL.

## Indexing exceptions

The six URLs in the September 20 private GSC snapshot all returned 200 with a self canonical, no noindex directive, a sitemap entry, and inbound links from page content. On October 2 Pacific, native GSC URL Inspection reported **“URL is on Google” / “Page is indexed” for all six**. One sampled inspection showed an October 1 smartphone crawl, successful fetch, indexing allowed, and Google-selected canonical equal to the inspected URL. The aggregate Page Indexing report still lists six “Discovered - currently not indexed” because its last update is September 20; it should be compared with the next report refresh. No recrawl request or content change is warranted for those six based on the current inspection results.

## Remaining verification

1. Open each controlled business profile and reconcile its published phone and call destination to 541; record any stale profile before editing it.
2. Perform a mobile tap check on the `tel:` link without placing a call.
3. Compare the next GSC Page Indexing refresh with the six current URL Inspection results and the submitted sitemap count. Public search snippets and aggregate reports can lag the live site.

## Post-merge release check — October 3 Pacific / October 4 UTC

PR #242 merged to `main` at `2026-10-04T03:54:43Z`. Hostinger hPanel showed the **Current** completed deployment as ID `01a1050d-163f-7129-9cd6-5f43d7f96d89`, branch `main`, commit `280a4cb3b413798faebffd1f6658c477b02c6322`, displayed “Deployed: 2026-10-03 20:57” (timezone unlabeled). Five live HTML pages (home, Maldives, sports-event travel, Glacier Express and Kentucky Derby) matched that commit's tracked `dist` files byte for byte; none matched the previous `73771682` release.

The live sitemap listed **131 URLs**. Every page returned HTTP 200, a self canonical, one H1, and no `noindex`; all 131 showed the approved visible **(541) 241-6481** and `tel:+15412416481`, with no old 408 number. Six sampled legacy/structural paths returned one-hop 301s, including the former Glacier Express and Kentucky Derby article URLs. `npm run verify:prod` from the committed release checkout passed all local content and sitemap checks, all 131 live page routes, and the live security-header checks. The sitewide crawl and representative page hashes are retained in the private owner-controlled evidence folder.

This release check verifies the website, not unpublished or account-only profile fields. The profile inventory and physical mobile dialer check remain owner tasks. The September GSC indexing snapshot remains a separate historical observation until its aggregate report refreshes.
