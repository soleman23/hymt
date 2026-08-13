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

| Page | Card | Live now | Drive has |
|---|---|---|---|
| south-america | Patagonia | `e-12-patagonia-trek.jpg` | `south-america-patagonia.png` |
| south-america | Peru | `dh-17-peru-machu-picchu-dawn.jpg` | `south-america-peru.png` |
| south-america | Galápagos & Ecuador | `dh-06-galapagos-volcanic-coast.jpg` | `south-america-galapagos-and-ecuador.jpg` |
| europe | Italy | `h-04-amalfi-golden-hour.jpg` | `europe-italy.jpg` |
| europe | France | `dh-05-france-provence-dusk.jpg` | `europe-france.jpg` |
| europe | Spain | `dh-23-spain-andalusia-dusk.jpg` | `europe-spain.jpg` |
| europe | Portugal | `dh-19-portugal-douro-valley.jpg` | `europe-portugal.jpg` |
| europe | Greece & the Aegean | `dh-07-greece-caldera-dusk.jpg` | `europe-greece-and-the-aegean.jpg` |
| europe | UK & Ireland | `dh-25-uk-ireland-highland-loch.jpg` | `europe-uk-and-ireland.jpg` |
| caribbean-mexico | Turks & Caicos | `d-02-grace-bay.jpg` | `caribbean-mexico-turks-and-caicos.jpg` |
| caribbean-mexico | Riviera Maya & Los Cabos | `dh-20-riviera-maya-coast.jpg` | `caribbean-mexico-riviera-maya-and-los-cabos.jpg` |

The europe row matters most: six cards on one hub all currently borrow a
destination hero, and Drive has a purpose-made frame for every one of them.

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

Sections A and B are from targeted queries against the Drive folder, not an
exhaustive diff of every file against every live asset. Before acting on this
list, run a full comparison — the folder holds roughly 150 files and this was
assembled from samples plus prefix searches.
