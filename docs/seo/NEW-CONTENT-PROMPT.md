# Prompts for creating new HYMT content

Paste these into Claude Code inside the `soleman23/hymt` repo. Each one is
self-contained. Fill the `{{...}}` slots and delete the rest.

All four assume the agent has read `docs/seo/CONTENT-STANDARDS.md` and
`docs/seo/SCHEMA-LIBRARY.md`, which the prompts instruct it to do.

---

## 1. New journal post

```
Create a new travel journal post for hymtravel.com.

TOPIC: {{e.g. What a private Africa safari actually costs, and what moves the number}}
TARGET QUERY CLUSTER: {{A — cost transparency, from docs/seo/KEYWORD-MAP.md}}
SLUG: {{what-a-safari-actually-costs}}
CATEGORY: {{Planning Guide | Experience Report | Field Report | Destination Guide}}
PUBLISH DATE: {{2026-09-12}}

Before writing:
1. Read docs/seo/CONTENT-STANDARDS.md in full.
2. Read docs/seo/KEYWORD-MAP.md and confirm which cluster this serves and which
   existing pages it should link to.
3. Read two existing posts under src/content-pages/travel-journal__*.html to
   match structure, class names and tone. Do not invent new classes.

Then create:
- src/content-pages/travel-journal__{{slug}}.html — the article body only. Use
  the same section and class structure as the existing posts. No <head>, no nav,
  no footer, no <style> block.
- src/pages/travel-journal/{{slug}}/index.astro — the JournalLayout wrapper,
  following the pattern of an existing post exactly.

Requirements:
- Title 30–65 chars including " — Hit Your Mark Travel Journal".
- Meta description 110–165 chars containing a specific figure or month.
- One <h1>; no skipped heading levels; headings written as real questions or as
  statements of the answer.
- An answer capsule of 40–70 words directly under the first <h2>: a complete,
  factual answer with at least one number in it.
- 1,500–3,000 words. Do not pad to hit the number.
- Every external factual claim linked to an authoritative source (park
  authority, permit issuer, event organiser, government site).
- At least two outbound internal links to /destinations/ or /experiences/ pages,
  with descriptive anchor text.
- publishDate and modifiedDate set in the .astro wrapper.
- A visible date line for anything perishable: prices, permits, event logistics.
- Hero image from public/assets/img/ that already exists. If none fits, leave
  hero.image unset so the placeholder plate renders, and add a
  <!-- NEEDS IMAGE: description --> comment. Never reference an image that does
  not exist.

Do NOT:
- Invent first-hand experience for Mark. Where the piece needs a personal
  detail, insert <!-- NEEDS MARK: what's needed --> and continue.
- Invent prices, permit costs, dates or statistics. If you do not have a
  verifiable figure, write <!-- NEEDS FIGURE: what's needed --> instead.
- Add pageCss. Journal posts share src/styles/journal.css.
- Use any phrase from the banned list in CONTENT-STANDARDS.md § 2.

Finally:
- Add the post card to src/content-pages/travel-journal.html, matching the
  existing cards.
- Add two links to this post from relevant destination or experience pages.
- Run: npx astro build && python3 tools/restore_images.py && node tools/verify-deployment.mjs
- If the verifier reports a head-baseline change, run it once with
  --update-baseline and commit that separately.
- Report the CONTENT-STANDARDS.md § 9 checklist with each item ticked or
  explained.
```

---

## 2. New destination page

```
Create a new destination page for hymtravel.com.

DESTINATION: {{Namibia}}
SLUG: {{namibia}}
PARENT REGION: {{Africa — /destinations/africa/}}

Before writing:
1. Read docs/seo/CONTENT-STANDARDS.md in full.
2. Read src/content-pages/destinations__italy.html and
   src/pages/destinations/italy/index.astro end to end. Match that structure
   exactly — this is a templated page type and the shape is not negotiable.
3. Read src/layouts/DestinationLayout.astro to see which props exist.

Create:
- src/content-pages/destinations__{{slug}}.html — body sections only.
- src/pages/destinations/{{slug}}/index.astro — the DestinationLayout wrapper.

Required sections, in this order, matching the existing pages' classes:
1. Intro / overview with the answer capsule under the first <h2>
2. Places or regions worth planning properly
3. What HYMT adds to planning this destination
4. {{Destination}} by season
5. A cost-range block: per-person per-day range, what is in it, what moves it,
   and a dated "verified as of" line
6. Mark's note
7. CTA to /plan-your-trip/
8. page-faq block: 6–10 real questions

FAQ markup — use exactly this shape, with unique ids per question:

  <div class="pf-item">
    <h3 class="pf-q-h">
      <button class="pf-q" type="button" aria-expanded="false"
              aria-controls="pf-{{slug}}-1" id="pf-{{slug}}-1-q">
        <span class="pf-q__text">QUESTION</span>
        <span class="pf-q__icon" aria-hidden="true">+</span>
      </button>
    </h3>
    <div class="pf-a" id="pf-{{slug}}-1" role="region" aria-labelledby="pf-{{slug}}-1-q">
      ANSWER
    </div>
  </div>

The first sentence of every answer must be a complete answer in 25 words or
fewer.

Wrapper requirements:
- Title 30–65 chars ending " — Hit Your Mark Travel".
- Description 110–165 chars with a specific in it.
- region prop set to the parent hub.
- hero.stats: only stats you can source. Never estimate a flight time. Leave a
  stat out rather than guess.
- Schema per docs/seo/SCHEMA-LIBRARY.md § 4: WebPage, BreadcrumbList,
  TouristDestination, FAQPage.

Do NOT:
- Add pageCss. Destination pages share src/styles/destination.css and
  src/styles/section-shared.css.
- Leave DestinationLayout.
- Reference an image that does not exist in public/assets/img/.
- Invent first-hand experience or unverifiable figures — use
  <!-- NEEDS MARK: ... --> and <!-- NEEDS FIGURE: ... -->.

Finally:
- Add the destination card to src/content-pages/destinations.html and to the
  parent region hub page.
- Add it to the footer Destinations column only if it is a regional hub.
- Link to it from at least two related destination pages and one journal post.
- Run the build, restore images, run the verifier, report the § 9 checklist.
```

---

## 3. New experience page

```
Create a new experience page for hymtravel.com.

EXPERIENCE: {{Golf travel}}
SLUG: {{golf-travel}}

Same process as the destination prompt, with these differences:
- Model on src/content-pages/experiences__safari-wildlife-travel.html and
  src/pages/experiences/safari-wildlife-travel/index.astro.
- Layout is ExperienceLayout (no region prop, no hero stat rail).
- Shared CSS is src/styles/experience.css + src/styles/section-shared.css.
- Schema is WebPage + BreadcrumbList + Service + FAQPage. Service.serviceType is
  the experience name; provider references the Organization @id.
- Sections: intro with answer capsule → who this is for and who it is not →
  where we plan it → what HYMT adds → typical cost range with a dated line →
  Mark's note → CTA → page-faq.
- The "who it is not for" section is required. It is the most useful paragraph
  on any experience page and the one competitors never write.
- Add the card to src/content-pages/experiences.html and to the footer
  Experiences column if it belongs there.
- Cross-link to at least three destination pages where this experience is
  strongest.
```

---

## 4. Audit an existing page

```
Audit {{/destinations/botswana/}} against docs/seo/CONTENT-STANDARDS.md.

1. Read docs/seo/CONTENT-STANDARDS.md and docs/seo/SCHEMA-LIBRARY.md.
2. Read both the .astro wrapper and the src/content-pages/*.html body.
3. Read the built page in dist/ to see what actually ships.

Report a table with one row per issue: severity (critical/high/medium/low),
what is wrong, the file and line, and the exact fix. Cover:

- Title length and uniqueness; description length and whether it contains a
  specific
- Presence and quality of the answer capsule under the first <h2>
- Heading hierarchy and whether headings are questions/answers or just labels
- FAQ block: question count, whether each answer opens with a ≤25-word complete
  answer, and whether the accessible markup (button, aria-expanded,
  aria-controls, role=region) is correct
- Whether FAQ answers render with JavaScript disabled
- Schema: which nodes are present, which are missing per SCHEMA-LIBRARY.md § 4,
  whether BreadcrumbList matches the visible trail
- Images: alt, width, height, decoding, loading; whether the LCP image is
  preloaded and not lazy
- Internal links out (need ≥2) and in
- Unsourced factual claims that should carry a link
- Perishable content with no visible date
- Absence of first-hand detail
- Any phrase from the banned list in § 2
- Placeholder text of any kind

Then apply every critical and high fix. List the medium and low ones for
review rather than applying them. Run the build and the verifier, and confirm
zero visual change to the rendered page.
```

---

## 5. Quarterly refresh

```
Run the quarterly content refresh described in
docs/seo/CONTENT-STANDARDS.md § 10.

1. Find every page containing a price, permit cost, event date, entry
   requirement or "as of" line. List them with the date each was last verified.
2. For each, flag whether the figure is older than 6 months.
3. For anything stale, produce a checklist of exactly which figure needs
   re-verifying and from which authority.
4. Check the Masters and Kentucky Derby posts against the current year's dates
   and pricing.
5. Report which pages need dateModified bumped once figures are confirmed.

Do not update any figure yourself unless you can cite a current authoritative
source in the same edit. An out-of-date number that is honestly dated is better
than a fresh-looking number that is wrong.
```
