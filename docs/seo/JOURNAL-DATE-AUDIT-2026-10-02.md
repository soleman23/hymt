# Journal publication-date audit — 2026-10-02

All 32 journal posts were stamped with the September 1, 2026 publication date in commit dfde6699 during the final pre-cutover build. Decision D6 in DECISIONS.md defines first publication as the local date of launch; HANDOFF-cutover-2026-09-02.md records the production launch on September 1 Pacific (September 2 UTC). The old month labels in the editorial drafts were never publication evidence. The hub now displays September 1, 2026 in time elements for the featured post and every card. JournalLayout.astro already renders the same date in each post hero and Article JSON-LD.

Sitemap lastmod is based on later source commits and need not equal datePublished. A dateModified value should advance only when a substantive edit goes live.

| Post | Prior draft label | Published | Modified | Editorial review |
| --- | --- | --- | --- | --- |
| /travel-journal/africa-destination-guide/ | May 2026 | 2026-09-01 | — | No earlier publication evidence |
| /travel-journal/african-safari-calendar/ | April 2026 | 2026-09-01 | — | No earlier publication evidence |
| /travel-journal/amanjiwo/ | May 2026 | 2026-09-01 | — | No earlier publication evidence |
| /travel-journal/asia-destination-guide/ | May 2026 | 2026-09-01 | — | No earlier publication evidence |
| /travel-journal/aspen-book-early/ | January 2026 | 2026-09-01 | — | No earlier publication evidence |
| /travel-journal/botswana-shoulder-season/ | May 2026 | 2026-09-01 | — | No earlier publication evidence |
| /travel-journal/caribbean-mexico-destination-guide/ | May 2026 | 2026-09-01 | — | No earlier publication evidence |
| /travel-journal/europe-destination-guide/ | May 2026 | 2026-09-01 | — | No earlier publication evidence |
| /travel-journal/european-grand-tour-mistake/ | May 2026 | 2026-09-01 | — | No earlier publication evidence |
| /travel-journal/five-star-problem/ | May 2026 | 2026-09-01 | — | No earlier publication evidence |
| /travel-journal/glacier-express/ | May 2026 | 2026-09-01 | — | No earlier publication evidence |
| /travel-journal/heli-skiing/ | May 2026 | 2026-09-01 | — | No earlier publication evidence |
| /travel-journal/how-hotel-upgrades-work/ | May 2026 | 2026-09-01 | — | No earlier publication evidence |
| /travel-journal/in-defense-of-slow-travel/ | May 2026 | 2026-09-01 | — | No earlier publication evidence |
| /travel-journal/kentucky-derby/ | May 2026 | 2026-09-01 | — | No earlier publication evidence |
| /travel-journal/kyoto-april-vs-november/ | February 2026 | 2026-09-01 | — | No earlier publication evidence |
| /travel-journal/maldives-overwater-vs-beach-villa/ | April 2026 | 2026-09-01 | — | No earlier publication evidence |
| /travel-journal/the-masters/ | May 2026 | 2026-09-01 | — | No earlier publication evidence |
| /travel-journal/mediterranean-october/ | May 2026 | 2026-09-01 | — | No earlier publication evidence |
| /travel-journal/middle-east-destination-guide/ | May 2026 | 2026-09-01 | — | No earlier publication evidence |
| /travel-journal/napa-sonoma-winery-route/ | May 2026 | 2026-09-01 | — | No earlier publication evidence |
| /travel-journal/north-america-destination-guide/ | May 2026 | 2026-09-01 | — | No earlier publication evidence |
| /travel-journal/polar-destination-guide/ | May 2026 | 2026-09-01 | — | No earlier publication evidence |
| /travel-journal/private-guide-advantage/ | May 2026 | 2026-09-01 | — | No earlier publication evidence |
| /travel-journal/safari-planning-12-questions/ | March 2026 | 2026-09-01 | — | No earlier publication evidence |
| /travel-journal/singita-grumeti/ | May 2026 | 2026-09-01 | — | No earlier publication evidence |
| /travel-journal/south-america-destination-guide/ | May 2026 | 2026-09-01 | — | No earlier publication evidence |
| /travel-journal/south-pacific-destination-guide/ | May 2026 | 2026-09-01 | — | No earlier publication evidence |
| /travel-journal/the-case-for-shoulder-season/ | May 2026 | 2026-09-01 | — | No earlier publication evidence |
| /travel-journal/what-a-travel-advisor-actually-does/ | December 2025 | 2026-09-01 | 2026-09-10 | Review new inquiry-copy release date |
| /travel-journal/what-hotel-descriptions-actually-mean/ | May 2026 | 2026-09-01 | — | No earlier publication evidence |
| /travel-journal/willamette-valley-winery-route/ | May 2026 | 2026-09-01 | — | No earlier publication evidence |

The September 10 modification of what-a-travel-advisor-actually-does is supported by commit f680e44c, which changed its planning-fee claim. Its current inquiry-copy edit should receive a new modified date when that edit is published. The owner should provide a separate editorial record if any post was publicly available before the Astro cutover; do not backdate from the draft month labels.
