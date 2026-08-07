# HYMT Content Standards

The permanent rules for anything published on `www.hymtravel.com` — new
destination pages, experience pages, journal posts, landing pages, and edits to
existing ones. These apply from now on, indefinitely.

If you are an agent creating a page, read this file **before** writing a word,
and check the finished page against § 9 before committing.

---

## 1. The one-paragraph version

Write specifics. Every claim should carry a number, a month, a name, or a
source. Answer the page's question in the first 50 words under the first
heading, then earn the rest of the read. Say where Mark has actually been and
when. Date anything that will age. Never pad.

That is both what a good travel advisor sounds like and what search engines and
AI assistants demonstrably reward. There is no tension between the two here, and
where there ever appears to be, write for the reader.

---

## 2. Voice

Hit Your Mark Travel is one person with a phone and thirty years of receipts.
The site should sound like that person, not like a brochure.

**Do:**

- Take positions. "September is better than July in Italy, and it is not close."
- Say what things cost, roughly, and what moves the number.
- Name the trade-off. Every recommendation costs something; say what.
- Use the first person when the experience is genuinely Mark's. "I was last in
  the Serengeti in June 2025."
- Be specific about who a trip is not for.
- Use plain nouns. A lodge is a lodge.

**Don't:**

- "Discover," "unlock," "embark on a journey," "unforgettable," "hidden gem,"
  "nestled," "curated," "bespoke" more than once per page, "world-class,"
  "breathtaking," "elevate," "seamless."
- Rhetorical questions as headings. "Why Choose Italy?" is not a heading.
- Three-item lists used as rhythm rather than content.
- Superlatives without a comparison. "The best" needs a "better than what."
- Hedging stacks. "Might potentially be able to help you consider."
- Em-dash-heavy sentence construction as a default rhythm.
- Any sentence that would survive being copied onto a competitor's site
  unchanged. If it would, it says nothing.

**The test:** read the paragraph aloud. If it could appear on any luxury travel
site in the world, delete it and write the version only Mark could write.

---

## 3. Page structure

### 3.1 The answer capsule — required on every page

Directly under the first `<h2>`, 40–70 words that answer the page's core
question. Factual, self-contained, at least one number. No hook, no setup.

This is the single highest-leverage paragraph on any page. It is what a reader
scanning decides on, and it is what an answer engine quotes. The KDD 2024 GEO
study measured a 30–40% visibility improvement from exactly this kind of
change — specific statistics and confident, fluent phrasing in place of vague
claims.

```
✗ "Italy rewards the traveller who knows where to look."

✓ "The best months for Italy are May–June and September–October. July and
   August are simultaneously peak tourist season and peak heat, and the Amalfi
   Coast in particular becomes difficult. Shoulder season gives you the same
   country with 30–40% fewer visitors, lower rates, and either wildflowers or
   truffle harvest depending which end you pick."
```

### 3.2 Headings

- Exactly one `<h1>`. It is the page's subject, not the brand.
- Levels never skip. `h1 → h2 → h3`. Never `h2 → h4`.
- Write headings as the question a reader would actually type or ask, or as a
  statement of the answer. Not as labels.
  - ✗ "Seasonality"
  - ✓ "When to go to Botswana, and why the flood matters"
- Keep headings under 70 characters.
- No heading is decorative. If nothing follows it that answers it, cut it.

### 3.3 FAQ blocks

Every destination and experience page carries a `page-faq` block. Rules:

- 6–10 questions. Fewer than six and the block is not worth its space.
- Questions are the real ones — what people ask on the phone. Not
  "What makes Italy special?"
- **The first sentence of the answer is a complete answer in ≤25 words.**
  Elaboration follows. This is non-negotiable: it is what makes the answer
  quotable and what makes the accordion scannable.
- Answers run 60–200 words. Below 60 is thin; above 200 belongs in a section.
- Questions are `<button>` inside a heading with `aria-expanded` and
  `aria-controls`. Answers get a matching `id` and `role="region"`.
- **Answers must render visible with JavaScript off.** The hide rule is scoped
  to `.js-accordion`. Never move it outside that scope. (This was broken
  site-wide until August 2026 — every answer on the site was permanently
  invisible. Do not reintroduce it.)

### 3.4 Length

| Page type | Target |
|---|---|
| Destination (country/place) | 1,500–3,500 words |
| Destination (regional hub) | 1,200–2,000 words |
| Experience | 1,200–2,000 words |
| Journal post | 1,500–3,000 words |
| Hub / index | 600–1,200 words |

These are ranges, not quotas. The GEO research found adding length produced
**zero** measured citation benefit. Never pad to hit a number. A tight
1,200-word destination page beats a padded 3,000-word one every time.

---

## 4. Metadata

### Title

- 30–65 characters **including** the ` — Hit Your Mark Travel` suffix.
- Distinguishing term first: `Botswana — Hit Your Mark Travel`.
- Unique across all 94+ pages. The build fails if a title changes without an
  explicit `--update-baseline`.
- Journal posts: the post's real headline, truncated at a natural break, with
  ` — Hit Your Mark Travel Journal`.

### Meta description

- 110–165 characters.
- Contains a specific — a month, a number, a place name, a price band.
- Written as a reason to click, not a summary of the page.
- Never starts with "Discover", "Explore", "Learn about", or the page title.

```
✗ "Discover the beauty of Botswana with Hit Your Mark Travel. Explore our
   luxury safari options today."

✓ "Botswana's Okavango flood peaks June–August, six months after the rain that
   caused it. Which camps, which months, and what a private-concession safari
   actually costs."
```

### OG image

- 1200×630, under 300 KB, legible at thumbnail size.
- `og:image:alt` describes the image.
- Per-page where one exists; the default only as a fallback.

---

## 5. Evidence, sourcing, dates

### Cite external authorities

Inline citation of authoritative sources was the strongest single lever in the
GEO study (+30–40%, up to +115% for lower-ranked pages). Any factual claim about
the outside world gets a linked source:

- Permit costs and quotas → the issuing authority (e.g. Rwanda Development
  Board for gorilla permits)
- Park rules, entry fees → the national park authority
- Visa and entry requirements → the relevant government site, plus a "verify
  before travel" line
- Event dates and ticketing → the event's own site
- Expedition operator standards → IAATO, AECO

Link out. It costs nothing and it makes the page more citable, not less.

### Date everything perishable

Any page containing a price, a schedule, an event date, a permit cost or an
entry rule carries a visible `<time>` element:

```html
<p class="content-note">Prices verified <time datetime="2026-08-15">August 2026</time>.
Permit costs and park fees change; confirm before booking.</p>
```

And in the schema: `dateModified`. Freshness is both a documented ranking input
and a demonstrated AI-citation factor, and it is the cheapest one available.

### Numbers over adjectives

| Instead of | Write |
|---|---|
| "a short flight" | "roughly 90 minutes, Maun to the delta" |
| "expensive" | "$1,200–2,200 per person per night, all-inclusive" |
| "the high season" | "July and August" |
| "many of our clients" | "eleven of the last fifteen groups I sent" |
| "a long waiting list" | "the badge waiting list closed in 1978" |

---

## 6. E-E-A-T

Google's own guidance rewards *"expertise that comes from having actually used a
product or service, or visiting a place."* For a single-advisor firm, that
is the entire competitive moat, and it has to be visible on the page.

**Every journal post** carries a byline linking to `/about/`, a publication
date, and a last-updated date when different.

**Every destination and experience page** carries at least one first-hand
sentence where it is true — a month, a year, a named property, a specific
observation. If Mark has not been somewhere, say so plainly and say who the
on-the-ground partner is. Honesty about the gap is stronger than pretending it
does not exist.

**`/about/`** is the entity page, not a marketing page. It carries: Mark's name
and photo, years in the industry, consortium and host-agency affiliations, ASTA
membership if held, the three Seller of Travel license numbers in body copy
(not only the footer), where he has actually travelled, how the practice works,
and how he is paid.

**Never** publish AI-drafted content as first-hand experience. Mark's
experiences are his. An agent drafting a page leaves a clearly marked
`<!-- NEEDS MARK: first-hand detail -->` comment rather than inventing one.

---

## 7. Internal linking

- Every journal post links to **at least two** destination or experience pages
  with descriptive anchor text.
- Every destination and experience page links to **at least two** related
  journal posts, in a "Read more" block after the FAQ.
- Every regional hub links to all its children; every child links back to its
  hub. The breadcrumb does not count.
- Anchor text describes the destination. "Botswana safari planning," never
  "click here" or a bare URL.
- 3–4 genuinely related destinations at the foot of each destination page.
  Related means a reader choosing between them would actually be choosing
  between them.

---

## 8. Images

- Every `<img>`: `alt`, intrinsic `width`, intrinsic `height`,
  `decoding="async"`.
- `loading="lazy"` below the fold. **Never** on the LCP image.
- Hero images pass through the layout's `preloadImage` prop.
- Alt text says what is in the frame and why it is on this page. Not the
  destination name repeated. Not a caption.
  - ✗ `alt="Italy"`
  - ✓ `alt="Amalfi Coast cliff road at golden hour, Positano below"`
- Decorative images: `alt=""` **and** `aria-hidden="true"`.
- No stock-photo clichés and no placeholder images, ever.

---

## 9. Pre-commit checklist

Every new or edited page. `npm run build` enforces the machine-checkable ones;
these are the rest.

**Structure**
- [ ] Exactly one `<h1>`; no skipped heading levels
- [ ] Answer capsule under the first `<h2>`: 40–70 words, ≥1 number
- [ ] 6–10 FAQ questions; each answer opens with a ≤25-word complete answer
- [ ] FAQ answers visible with JavaScript disabled
- [ ] Length inside the range for the page type, with no padding

**Metadata**
- [ ] Title 30–65 chars, unique, distinguishing term first
- [ ] Description 110–165 chars, unique, contains a specific
- [ ] Canonical correct (inherited — do not override)
- [ ] OG image exists, 1200×630, with `og:image:alt`

**Schema**
- [ ] `BreadcrumbList` matches the visible trail exactly
- [ ] Page-type schema per `SCHEMA-LIBRARY.md` § 4
- [ ] Journal posts: `datePublished` and `dateModified` set
- [ ] No `AggregateRating` on HYMT-controlled reviews

**Content**
- [ ] Every factual external claim linked to an authority
- [ ] Perishable content carries a visible date
- [ ] At least one genuine first-hand detail, or a `NEEDS MARK` comment
- [ ] No banned phrases (§ 2)
- [ ] No "Lorem ipsum", "TBD", "Coming soon", "TODO"

**Links and images**
- [ ] ≥2 outbound internal links with descriptive anchor text
- [ ] Every internal link resolves in `dist/`
- [ ] Every `<img>` has `alt`, `width`, `height`, `decoding`
- [ ] Below-fold images lazy; LCP image not lazy

**Build**
- [ ] `npm run build` passes
- [ ] `python3 tools/restore_images.py` run after the build
- [ ] Intentional title/description changes: `--update-baseline` in its own commit
- [ ] Renders correctly at 375 px and 768 px

---

## 10. Publishing cadence

Two to four journal posts per month, chosen from `KEYWORD-MAP.md` in priority
order. Consistency matters more than volume — four thin posts is worse than one
that answers a question nobody else has answered.

Every quarter:

- Re-verify every published price range and permit cost; update `dateModified`.
- Re-check event logistics posts (Masters, Derby) against the current year.
- Add new FAQ questions from what clients actually asked that quarter. That is
  the best keyword research available and it is free.
