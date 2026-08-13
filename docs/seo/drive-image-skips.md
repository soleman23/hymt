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
`japan-kyoto`, `kenya-tanzania-serengeti`, `french-polynesia-bora-bora`.

**Why this happened:** the hub rollout generated images without checking the
Drive folder first. The lesson is in [[hymt-drive-image-tracker]]: check Drive
before generating anything.

## C · Not skipped — simply not reached yet

Drive also holds place-card sets for pages still on placeholder plates: bali,
botswana, egypt, fiji, france, french-polynesia, galapagos, greece, iceland,
italy, japan, thailand, turks-caicos. Those are the remaining import backlog,
not conflicts, and they need no new generation.

## Completeness

Section A was re-derived on 2026-08-13 from a full enumeration of the folder,
not from prefix samples, which is how the St. Barth's row surfaced. Section A
is now believed complete: no hub card is still carrying a borrowed library
frame while Drive holds a purpose-made one.

Section B has **not** had that treatment. It is still a sample-derived list of
same-slug collisions, and the real count may be higher.
