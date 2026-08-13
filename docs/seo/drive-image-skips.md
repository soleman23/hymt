# Drive images skipped because a slot was already live

Recorded 2026-08-12, while importing approved place-card images from the Drive
folder into the North America pages. The rule applied was: **Drive is the source
of truth, but never overwrite an image already live on the site.** Empty slots
were filled; occupied ones were left alone and listed here.

Nothing below is a defect. These are all cases where the site already shows a
photograph and Drive holds a different one for the same slot. They are worth a
pass **after launch**, when there is time to compare them side by side.

## A · Drive holds a purpose-made image; the slot has a generic library frame

The strongest candidates for replacement. When the six regional hubs were
converted (PR #102), 18 of the 37 slots were filled by carrying over an existing
library photograph — a destination hero or an experience frame — because no
purpose-made image was known to exist. Several of those **do** exist in Drive.

| Page | Card | Was | Now | Done |
|---|---|---|---|---|
| south-america | Patagonia | `e-12-patagonia-trek.jpg` | `south-america-patagonia.jpg` | 2026-08-13 |
| south-america | Peru | `dh-17-peru-machu-picchu-dawn.jpg` | `south-america-peru.jpg` | 2026-08-13 |
| south-america | Galápagos & Ecuador | `dh-06-galapagos-volcanic-coast.jpg` | `south-america-galapagos-and-ecuador.jpg` | 2026-08-13 |
| caribbean-mexico | Turks & Caicos | `d-02-grace-bay.jpg` | `caribbean-mexico-turks-and-caicos.jpg` | 2026-08-13 |
| caribbean-mexico | St. Barth's | `d-06-st-barts-harbour.jpg` | `caribbean-mexico-st-barth-s.jpg` | 2026-08-13 |
| caribbean-mexico | Riviera Maya & Los Cabos | `dh-20-riviera-maya-coast.jpg` | `caribbean-mexico-riviera-maya-and-los-cabos.jpg` | 2026-08-13 |

> **Section A is closed.** All six europe hub cards were swapped onto their
> purpose-made frames on 2026-08-12 — `europe-italy`, `europe-france`,
> `europe-spain`, `europe-portugal`, `europe-greece-and-the-aegean`,
> `europe-uk-and-ireland`. The six rows above followed on 2026-08-13. In both
> passes the heroes that had been borrowed stay in place and still serve their
> own destination pages, so nothing was orphaned — each of the six is still
> referenced by 6 to 13 other source files.

**St. Barth's was not on the original list.** The five rows this document
first recorded came from prefix samples, and `caribbean-mexico-st-barth-s.jpg`
was missed because the slug is not the one a reader would guess: the card name
`St. Barth's` runs through the slug rule as `st-barth-s`, with the apostrophe
becoming a separator rather than being dropped. A full folder listing found it.
Any future coverage check should enumerate the folder rather than guess slugs.

The three south-america files were PNGs at 1672×941 — including
`south-america-galapagos-and-ecuador.jpg`, which carries a `.jpg` name but PNG
bytes. Those were re-encoded to 1600×900 JPEG at q85 progressive. The three
caribbean-mexico files were already 1600×900 JPEGs and their approved bytes
were kept untouched.

## B · Same slug live and in Drive — two versions of the same subject

These were generated on 2026-08-12 during the hub rollout and shipped, without
checking Drive first. Drive already held images for the same slugs, some dated
2026-08-08/09 — i.e. **before** the ones now live. The live version is mine; the
Drive version is older and may be the approved one.

- `asia-india` · `asia-sri-lanka` · `asia-vietnam-and-southeast-asia`
- `south-america-brazil` · `south-america-colombia`
- `caribbean-mexico-jamaica` · `caribbean-mexico-barbados-and-eastern-caribbean`
  · `caribbean-mexico-dominican-republic`

Also generated on 2026-08-12 for the duplicate-image fix, and worth the same
check: `france-provence`, `greece-santorini`, `italy-amalfi-coast`,
`japan-kyoto`, `french-polynesia-bora-bora`.

`kenya-tanzania-serengeti` was on that list and is now **resolved**: the
2026-08-13 sweep found no `kenya-tanzania` files in Drive at all, so there
is no rival version. The generated frame was adopted as the Serengeti place
card at zero cost — it had been sitting unused at full size, referenced only
through its `dc-` index crop.

**Why this happened:** the hub rollout generated images without checking the
Drive folder first. The lesson is in [[hymt-drive-image-tracker]]: check Drive
before generating anything.

## C · Not skipped — simply not reached yet

**Empty as of 2026-08-13.** This section listed bali, botswana, egypt, fiji,
france, french-polynesia, galapagos, greece, iceland, italy, japan, thailand
and turks-caicos as an import backlog. All of them have now been imported —
the first twelve on 2026-08-12, fiji on 2026-08-13.

The list was also incomplete: it omitted **antarctica**, whose four frames
had been in Drive since 2026-08-08. That page was imported on 2026-08-13 too.
The omission had the same cause as the St. Barth's row in § A — a survey
built from prefix searches over a folder that cannot be reliably paged. The
fix is a per-MIME-type sweep; see the handoff's "Finding what exists".

The 6 pages still on placeholder plates have no Drive coverage under that
exhaustive check — a complete enumeration on 2026-08-13 of 150 files, by
MIME type, with `image/jpeg` partitioned into three `createdTime` windows so
that no query needed a continuation token. The free-import phase is
finished; they need generated photography. Spain, portugal, st-barths,
riviera-maya-los-cabos, kenya-tanzania and rwanda were done on 2026-08-13.

Two files in the folder are named `ChatGPT Image Aug 9, 2026, ...` and match
no token search. Both are 941×1672 **portrait** New Orleans French Quarter
frames — intro/itinerary panel format, not place cards, for a page already
photographed. Noted here so the next survey does not have to re-identify
them.

## Completeness

Section A was re-derived on 2026-08-13 against both MIME sweeps
(`image/jpeg` and `image/png`) plus per-page prefix queries — not from
prefix samples alone, which is how the St. Barth's row surfaced. Section A
is believed complete: no hub card is still carrying a borrowed library frame
while Drive holds a purpose-made one.

Caveat on method: the folder **cannot be enumerated by paging**. Passing a
`pageToken` returns a result set that largely repeats the previous page, so
a "full listing" assembled that way is silently partial — that is what hid
the antarctica set. Sweep by `mimeType` instead, and treat any single query
as a sample until two independent queries agree.

Section B has **not** had that treatment. It is still a sample-derived list of
same-slug collisions, and the real count may be higher.
