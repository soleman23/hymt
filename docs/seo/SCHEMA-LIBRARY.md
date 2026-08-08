# HYMT Schema, robots and head-tag library

Copy-paste implementations for Phase 2 of `SEO-AIO-PLAN.md`.

Everything absolute-URL-shaped is derived from `Astro.site`. There is no second
source of truth for the domain. `SITE` below always means:

```js
const SITE = (Astro.site?.href ?? 'https://www.hymtravel.com/').replace(/\/$/, '');
```

---

## 1. `src/components/Schema.astro`

One component. All JSON-LD goes through it.

```astro
---
/**
 * Schema — the only place the site emits JSON-LD.
 *
 * Takes one object or an array of objects and prints each as its own
 * <script type="application/ld+json">. Separate scripts rather than an
 * @graph array: a syntax error in one node then cannot take the others
 * down with it, and tools/verify-deployment.mjs can JSON.parse each block
 * independently to tell you which page and which node broke.
 *
 * Do not hand-write a ld+json <script> anywhere else. The verifier fails
 * the build if it finds one outside this component.
 */
interface Props { schema: object | object[] }
const { schema } = Astro.props;
const blocks = Array.isArray(schema) ? schema.filter(Boolean) : [schema];
---
{blocks.map((b) => (
  <script type="application/ld+json" set:html={JSON.stringify(b)} />
))}
```

---

## 2. `src/lib/schema.ts`

Builders. Keeping them out of `.astro` files means they are unit-testable and
the `@id` strings cannot drift.

```ts
/**
 * Schema builders. Every node that other nodes reference carries a stable
 * @id so the graph links up instead of restating the same entity. Changing
 * an @id string breaks every reference to it — treat them as permanent.
 */

export const ids = (site: string) => ({
  org: `${site}/#organization`,
  mark: `${site}/about/#mark-sole`,
  website: `${site}/#website`,
});

/* ── Organization / TravelAgency — homepage only ───────────────────────── */
export function organization(site: string, opts: {
  /** [DECISION-3] — city/region only, or omit entirely. No street address. */
  address?: { locality: string; region: string; country: string };
  sameAs: string[];
  memberOf?: string[]; // [DECISION-2] Virtuoso / Signature / ASTA / host agency
}) {
  const id = ids(site);
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    '@id': id.org,
    name: 'Hit Your Mark Travel',
    alternateName: 'HYMT',
    url: `${site}/`,
    logo: { '@type': 'ImageObject', url: `${site}/assets/logo.png`, width: 512, height: 512 },
    image: `${site}/assets/og-default.jpg`,
    description:
      'Single-advisor luxury travel firm designing bespoke journeys for time-poor, ' +
      'taste-rich travellers. Safari, polar expedition, Europe, Asia, South Pacific, ' +
      'food and wine, sports and event travel.',
    slogan: 'Where your vision meets the map.',
    telephone: '+1-408-568-1404',
    email: 'mark@hymtravel.com',
    priceRange: '$$$$',
    founder: { '@id': id.mark },
    employee: { '@id': id.mark },
    ...(opts.address && {
      address: {
        '@type': 'PostalAddress',
        addressLocality: opts.address.locality,
        addressRegion: opts.address.region,
        addressCountry: opts.address.country,
      },
    }),
    // No top-level availableLanguage: schema.org does not define it on
    // Organization/TravelAgency (validator.schema.org warns, found at P2-6).
    // It lives on the contactPoint, where it is a recognized property.
    areaServed: { '@type': 'Country', name: 'United States' },
    knowsAbout: [
      'Luxury travel planning', 'African safari', 'Polar expedition cruising',
      'Antarctica travel', 'Italy travel', 'Japan travel', 'French Polynesia',
      'Maldives', 'Food and wine travel', 'Multigenerational family travel',
      'Sports and event travel', 'Wellness retreats', 'Honeymoon planning',
    ],
    // Seller of Travel registrations. identifier/PropertyValue is the correct
    // shape for a licence number; do not invent a `licenseNumber` property.
    identifier: [
      { '@type': 'PropertyValue', name: 'California Seller of Travel', value: '2165910-50' },
      { '@type': 'PropertyValue', name: 'Washington Seller of Travel', value: '605920581' },
      { '@type': 'PropertyValue', name: 'Florida Seller of Travel', value: 'ST46122' },
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: '+1-408-568-1404',
      email: 'mark@hymtravel.com',
      areaServed: 'US',
      availableLanguage: 'English',
    },
    ...(opts.memberOf?.length && {
      memberOf: opts.memberOf.map((n) => ({ '@type': 'Organization', name: n })),
    }),
    sameAs: opts.sameAs,
  };
}

/* ── Person — /about/ only ─────────────────────────────────────────────── */
export function person(site: string, opts: { sameAs: string[]; image?: string }) {
  const id = ids(site);
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': id.mark,
    name: 'Mark Sole',
    givenName: 'Mark',
    familyName: 'Sole',
    jobTitle: 'Founder & Travel Director',
    worksFor: { '@id': id.org },
    url: `${site}/about/`,
    ...(opts.image && { image: `${site}${opts.image}` }),
    description:
      'Founder of Hit Your Mark Travel. Designs bespoke luxury itineraries ' +
      'across Africa, the polar regions, Europe, Asia and the South Pacific.',
    knowsAbout: [
      'Luxury travel advisory', 'Safari planning', 'Polar expedition travel',
      'Sports and event travel', 'Multigenerational travel',
    ],
    sameAs: opts.sameAs,
  };
}

/* ── BreadcrumbList — built from the same props the visible trail uses ─── */
export function breadcrumbs(site: string, trail: { name: string; path?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name.replace(/<[^>]*>/g, ''), // trail labels carry <br> and entities
      ...(c.path ? { item: `${site}${c.path}` } : {}),
    })),
  };
}

/* ── Article — journal posts ───────────────────────────────────────────── */
export function article(site: string, o: {
  headline: string; description: string; path: string; image: string;
  datePublished: string; dateModified?: string; section?: string; wordCount?: number;
}) {
  const id = ids(site);
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: o.headline.replace(/<[^>]*>/g, '').slice(0, 110),
    description: o.description,
    image: [`${site}${o.image}`],
    author: { '@id': id.mark },
    publisher: { '@id': id.org },
    datePublished: o.datePublished,
    dateModified: o.dateModified ?? o.datePublished,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${site}${o.path}` },
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    ...(o.section && { articleSection: o.section }),
    ...(o.wordCount && { wordCount: o.wordCount }),
  };
}

/* ── TouristDestination — destination pages ────────────────────────────── */
export function destination(site: string, o: {
  name: string; description: string; path: string; image: string;
  touristType?: string[]; includes?: string[]; geo?: { lat: number; lon: number };
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: o.name,
    description: o.description,
    url: `${site}${o.path}`,
    image: `${site}${o.image}`,
    ...(o.touristType && { touristType: o.touristType }),
    ...(o.includes && {
      includesAttraction: o.includes.map((n) => ({ '@type': 'TouristAttraction', name: n })),
    }),
    ...(o.geo && {
      geo: { '@type': 'GeoCoordinates', latitude: o.geo.lat, longitude: o.geo.lon },
    }),
  };
}

/* ── Service — experience pages ────────────────────────────────────────── */
export function service(site: string, o: {
  name: string; description: string; path: string; serviceType: string;
}) {
  const id = ids(site);
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: o.name,
    serviceType: o.serviceType,
    description: o.description,
    url: `${site}${o.path}`,
    provider: { '@id': id.org },
    areaServed: { '@type': 'Country', name: 'United States' },
    audience: { '@type': 'Audience', audienceType: 'Luxury travellers' },
  };
}

/* ── CollectionPage + ItemList — the two hubs ──────────────────────────── */
export function collection(site: string, o: {
  name: string; description: string; path: string;
  items: { name: string; path: string }[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: o.name,
    description: o.description,
    url: `${site}${o.path}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: o.items.length,
      itemListElement: o.items.map((it, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: it.name,
        url: `${site}${it.path}`,
      })),
    },
  };
}

/* ── FAQPage ───────────────────────────────────────────────────────────────
   Google stopped serving FAQ rich results on 2026-05-07. This ships because
   it is semantically accurate and free, NOT because it will render stars or
   an expander in the SERP. Do not restructure content to feed it.          */
export function faq(qa: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: qa.map(({ q, a }) => ({
      '@type': 'Question',
      name: q.replace(/<[^>]*>/g, ''),
      acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]*>/g, '') },
    })),
  };
}
```

### Extracting FAQ pairs without hand-maintaining a second copy

The Q&A lives in `src/content-pages/*.html`. Do **not** retype it into a props
array — the two copies will diverge. Parse it at build time from the raw content
string the page already imports:

```ts
/**
 * Pull {q,a} pairs out of a content-page HTML string. Runs at build time.
 *
 * Split-then-match, not one big regex: a single non-greedy pattern spanning
 * the whole item swallows the answer's own closing </div> into the outer
 * match and silently extracts zero pairs (the first draft of this function
 * did exactly that). Splitting on the item-opening tag keeps each chunk
 * self-contained. Verified against destinations__italy.html (8/8),
 * destinations__botswana.html (8), destinations__antarctica.html (6),
 * experiences__cruises.html (6) on 2026-08-07.
 *
 * Assumes answers contain no nested <div>. The verifier check below is what
 * catches it if that assumption ever breaks.
 */
export function extractFaq(html: string) {
  const out: { q: string; a: string }[] = [];
  const items = html.split('<div class="pf-item">').slice(1);
  for (const chunk of items) {
    const q = chunk.match(/class="pf-q__text"[^>]*>([\s\S]*?)<\/span>/)?.[1];
    const a = chunk.match(/class="pf-a"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/)?.[1];
    if (q && a) out.push({ q: strip(q), a: strip(a) });
  }
  return out;
}
const strip = (s: string) =>
  s.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
```

The P0-1 markup change (`<button class="pf-q">` inside an `<h3>`) does not
affect this parser — it keys on `pf-q__text` and `pf-a`, which survive the
change. Still: add a verifier check that `extractFaq()` returns a non-zero
count for every page whose HTML contains `page-faq`, and that the count equals
the page's `pf-item` count. A silent zero or a mismatch means the parser broke.

---

## 3. Wiring it into the layouts

### `Base.astro` — additions only

```astro
---
import Schema from "../components/Schema.astro";
import Accordion from "../components/Accordion.astro";
import Analytics from "../components/Analytics.astro";

interface Props {
  /* …existing props… */
  /** Extra JSON-LD nodes for this page. Base always emits the org reference. */
  schema?: object | object[];
  /** Absolute path of the LCP image, preloaded in <head>. */
  preloadImage?: string;
  modifiedDate?: string;
}
---
<head>
  {/* …existing head… */}
  {preloadImage && (
    <link rel="preload" as="image" href={preloadImage} fetchpriority="high" />
  )}
  {schema && <Schema schema={schema} />}
</head>
<body class="theme-dark">
  {/* …existing body… */}
  <Accordion />
  <Analytics />
</body>
```

Remove the inline `orgSchema` / `articleSchema` objects from `Base.astro`. The
org node moves to the homepage; `Article` moves to `JournalLayout`, built with
`article()` above. `Base` should no longer know about schema shapes at all — it
just prints whatever it is handed.

### `DestinationLayout.astro`

```astro
---
import { breadcrumbs, destination } from "../lib/schema";
const SITE = (Astro.site?.href ?? "https://www.hymtravel.com/").replace(/\/$/, "");
const path = canonicalPath || Astro.url.pathname;

const trail = [
  { name: "Home", path: "/" },
  { name: "Destinations", path: "/destinations/" },
  ...(region ? [{ name: region.label, path: region.href }] : []),
  { name },
];

const schema = [
  breadcrumbs(SITE, trail),
  destination(SITE, {
    name, description: description ?? "", path,
    image: hero.image ?? "/assets/og-default.jpg",
    touristType, includes, geo,
  }),
  faqPairs.length ? faq(faqPairs) : null,
].filter(Boolean);
---
<Base … schema={schema} preloadImage={hero.image}>
```

The visible breadcrumb must be rendered from the **same `trail` array**, not
from a separate hand-written block. That is what guarantees markup and display
can never disagree.

`ExperienceLayout` and `JournalLayout` follow the identical pattern with
`service()` and `article()`.

---

## 4. Page type → schema

| Page | Nodes |
|---|---|
| `/` | `TravelAgency` (full, with `@id`), `WebPage` |
| `/about/` | `Person`, `AboutPage`, `BreadcrumbList` |
| `/contact/` | `ContactPage`, `BreadcrumbList` |
| `/plan-your-trip/` | `ContactPage`, `BreadcrumbList` |
| `/destinations/` | `CollectionPage` + `ItemList` (42 children), `BreadcrumbList` |
| `/destinations/<slug>/` | `WebPage`, `BreadcrumbList`, `TouristDestination`, `FAQPage` |
| `/experiences/` | `CollectionPage` + `ItemList` (12 children), `BreadcrumbList` |
| `/experiences/<slug>/` | `WebPage`, `BreadcrumbList`, `Service`, `FAQPage` |
| `/travel-journal/` | `CollectionPage` + `ItemList` (29 posts), `BreadcrumbList` |
| `/travel-journal/<slug>/` | `Article`, `BreadcrumbList` |
| `/faq/` | `FAQPage`, `BreadcrumbList` |
| `/privacy-policy/`, `/terms-and-conditions/` | `WebPage`, `BreadcrumbList` |
| `/404.html` | none |

**Never emit:** `AggregateRating` on HYMT-controlled reviews · `WebSite` +
`SearchAction` sitelinks searchbox (deprecated) · `HowTo` · `Product` ·
`Offer` with a price we cannot honour.

---

## 5. `public/robots.txt` — production

Replaces the current file. Ships in the repo; the staging `noindex` is handled
by the host-scoped `X-Robots-Tag` in `.htaccess`, not here.

```
# Hit Your Mark Travel — https://www.hymtravel.com
# Posture: allow every crawler that can cite us in a user-facing answer.
# Block crawlers that only harvest for training-data resale, where there is
# no citation surface and therefore no upside.

# ── Search engines ──
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Applebot
Allow: /

User-agent: DuckDuckBot
Allow: /

# ── AI answer engines: allowed, deliberately ──
# These retrieve and cite with attribution. Being in their index is the point.
User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: GPTBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Meta-ExternalAgent
Allow: /

User-agent: Amazonbot
Allow: /

# ── Harvest-only crawlers: no citation surface, no upside ──
User-agent: CCBot
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: Diffbot
Disallow: /

User-agent: cohere-ai
Disallow: /

User-agent: cohere-training-data-crawler
Disallow: /

User-agent: Timpibot
Disallow: /

User-agent: omgili
Disallow: /

User-agent: omgilibot
Disallow: /

User-agent: Webzio-Extended
Disallow: /

User-agent: ImagesiftBot
Disallow: /

# ── SEO crawlers: allowed but throttled ──
User-agent: AhrefsBot
Crawl-delay: 10

User-agent: SemrushBot
Crawl-delay: 10

User-agent: dotbot
Crawl-delay: 10

# ── Everything else ──
User-agent: *
Allow: /

Sitemap: https://www.hymtravel.com/sitemap-index.xml
```

**Two things worth understanding before anyone edits this file.**

`Google-Extended` is set to `Allow` on purpose. It is a training and grounding
token only — Google documents that it has no effect on Search inclusion and is
not a ranking signal. Allowing it costs nothing and keeps HYMT eligible for
Gemini grounding. Blocking it buys nothing.

Blocking `GPTBot` would be a mistake even though it is the training crawler.
For a business that wants to be recommended by AI assistants, being in the
training corpus is upside, not a leak. The content is public marketing copy;
there is nothing here to protect.

---

## 6. `public/llms.txt` `[POST]`

Ship it in Phase 5. It costs two minutes. Attach no expectations: Ahrefs'
May-2026 study of 137,210 domains found 97% of published `llms.txt` files got
zero traffic that month, and Google has said it does not use the file.

```markdown
# Hit Your Mark Travel

> Single-advisor luxury travel firm. Mark Sole designs bespoke journeys —
> safari, polar expedition, Europe, Asia, South Pacific, food and wine, and
> sports and event travel — for travellers who are short on time and specific
> about quality. US-based, serving clients nationwide.
> CA Seller of Travel 2165910-50 · WA 605920581 · FL ST46122.

Contact: mark@hymtravel.com · +1 408 568 1404

## Core pages

- [About Mark Sole](https://www.hymtravel.com/about/): who plans the trips, credentials, and how the practice works
- [Plan Your Trip](https://www.hymtravel.com/plan-your-trip/): the inquiry form and what happens after it
- [FAQ](https://www.hymtravel.com/faq/): fees, process, what is and is not included
- [Destinations](https://www.hymtravel.com/destinations/): 42 destination guides across nine regions
- [Experiences](https://www.hymtravel.com/experiences/): 12 trip types
- [Travel Journal](https://www.hymtravel.com/travel-journal/): 29 first-hand field reports and planning guides

## Optional

- [Privacy Policy](https://www.hymtravel.com/privacy-policy/)
- [Terms & Conditions](https://www.hymtravel.com/terms-and-conditions/)
```

---

## 7. `<head>` reference — what every page must carry

Inherited from `Base.astro`. Listed so a reviewer can check a page against it.

```html
<title>{unique, 30–65 chars, ends "— Hit Your Mark Travel"}</title>
<meta name="description" content="{unique, 110–165 chars, contains a specific}">
<link rel="canonical" href="https://www.hymtravel.com{path}">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#0d1b2a">

<meta property="og:type" content="{website|article}">
<meta property="og:site_name" content="Hit Your Mark Travel">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:url" content="https://www.hymtravel.com{path}">
<meta property="og:image" content="https://www.hymtravel.com{ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{describes the image}">
<meta property="og:locale" content="en_US">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{description}">
<meta name="twitter:image" content="https://www.hymtravel.com{ogImage}">

<link rel="preload" as="image" href="{hero}" fetchpriority="high">
<link rel="icon" type="image/png" href="/assets/logo.png">
<link rel="apple-touch-icon" href="/assets/logo.png">
```

Deliberately absent: `meta keywords` (ignored since 2009), `robots` (default is
`index,follow` — only add when a page must differ), `hreflang` (single-language
site), `revisit-after`, `author` meta, `WebSite`/`SearchAction`.

---

## 8. Validation checklist

Before marking Phase 2 done, run one page of each type through both tools and
log the result in `docs/seo/validation-log.md`.

| Tool | Pass condition |
|---|---|
| [Rich Results Test](https://search.google.com/test/rich-results) | `Article` and `BreadcrumbList` detected, zero errors, zero warnings |
| [Schema Markup Validator](https://validator.schema.org/) | zero errors on every node including the non-rich-result types |
| `curl -s <url> \| grep -c 'ld+json'` | matches the expected node count for that page type |
| GSC → Enhancements → Breadcrumbs | 83 valid items, post-launch |

Note: `TouristDestination`, `Service`, `ItemList` and `FAQPage` will show
"no rich result" or an equivalent notice in the Rich Results Test. That is the
expected outcome, not a failure — they are there for entity clarity.
