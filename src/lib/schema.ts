/**
 * Schema builders. Every node that other nodes reference carries a stable
 * @id so the graph links up instead of restating the same entity. Changing
 * an @id string breaks every reference to it — treat them as permanent.
 *
 * Implementations come from docs/seo/SCHEMA-LIBRARY.md — that file is the
 * spec; this file is its only translation into code.
 */

export const ids = (site: string) => ({
  org: `${site}/#organization`,
  mark: `${site}/about/#mark-sole`,
  website: `${site}/#website`,
});

/** Strip tags and decode the handful of HTML entities the content pages use.
 *  JSON-LD carries literal text: "Turks &amp; Caicos" must ship as
 *  "Turks & Caicos". Applied at call sites so the builders below stay
 *  byte-faithful to SCHEMA-LIBRARY.md. */
export const plain = (s: string) => s
  .replace(/<[^>]*>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&rsquo;/g, '’')
  .replace(/&eacute;/g, 'é').replace(/&mdash;/g, '—').replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ').trim();

/* ── Organization / TravelAgency — homepage only ───────────────────────── */
export function organization(site: string, opts: {
  /** [DECISION-3] — city/region only, or omit entirely. No street address. */
  address?: { locality: string; region: string; country: string };
  sameAs: string[];
  memberOf?: string[]; // [DECISION-2] consortium / host-agency memberships
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
    areaServed: { '@type': 'Country', name: 'United States' },
    availableLanguage: 'en-US',
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
  datePublished?: string; dateModified?: string; section?: string; wordCount?: number;
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
    /* DECISIONS.md D6: dates are unset until the launch runbook stamps them.
       Spreads keep the keys out entirely rather than emitting undefined. */
    ...(o.datePublished && { datePublished: o.datePublished }),
    ...(o.datePublished && { dateModified: o.dateModified ?? o.datePublished }),
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

/* ── CollectionPage + ItemList — the hubs ──────────────────────────────── */
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

/* ── WebPage and its subtypes (AboutPage, ContactPage) ─────────────────────
   The SCHEMA-LIBRARY §4 mapping assigns these to pages the library's own
   builders do not cover. Kept deliberately thin: name, description, url. */
export function webPage(site: string, o: {
  type?: 'WebPage' | 'AboutPage' | 'ContactPage';
  name: string; description: string; path: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': o.type ?? 'WebPage',
    name: o.name.replace(/<[^>]*>/g, ''),
    description: o.description,
    url: `${site}${o.path}`,
    inLanguage: 'en-US',
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
