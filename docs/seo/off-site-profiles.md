# Off-site profiles — drafted now, submitted at cutover

Prepared 2026-08-24 for #97. Everything here is **ready to submit and must not
be submitted yet**.

## The one rule

Every item below ends in a link to `www.hymtravel.com`. That domain does not
resolve until the DNS cutover. **Nothing goes out until #33 passes** — the
post-cutover verification that confirms the site is actually serving.

A broken link on a consortium profile or a chamber directory is worse than a
missing one. Directory entries are slow to re-crawl once they have been seen
broken, and the first crawl of a brand-new entity is the one that sets what
search engines think the entity is.

Runbook § 4.6 is the submit-day checklist. This file is what gets pasted into it.

---

## Canonical facts — copy from here, never retype

Inconsistent naming across profiles weakens the entity instead of building it.
Every profile must agree on all of the following, exactly:

| Field | Value |
|---|---|
| Business name | Hit Your Mark Travel |
| Never | "Hit Your Mark Travel LLC", "HYMT", "Hit your Mark Travel" |
| Person | Mark Sole |
| Title | Founder & Travel Director |
| Location | Bend, Oregon |
| Street address | **None.** Per DECISIONS.md D3 the address is city and region only — on the site, in schema, and in every profile |
| Affiliation | "part of the Travel Leaders Network" — and nothing beyond that wording until Mark confirms the membership level and profile URL (D2) |
| Phone | (408) 568-1404 |
| Email | mark@hymtravel.com |
| Website | https://www.hymtravel.com/ |
| Instagram | https://www.instagram.com/travelwithsoleman/ |
| Seller of Travel | CA 2165910-50 · WA 605920581 · FL ST46122 |
| Experience | 20+ years |

### The Seller of Travel numbers are not optional on a listing

California requires registered sellers of travel to display the registration
number **on all advertising**
([oag.ca.gov/travel](https://oag.ca.gov/travel)). A directory listing or a
consortium profile is advertising. So CA 2165910-50 appears on every profile
that carries a description field, in the same form the site uses.

Before submitting anything, confirm all three registrations are current — a
lapsed number published in six places is worse than none:

- CA — https://sotas.doj.ca.gov/sellerSearch.action (searchable by number)
- FL — https://csapp.fdacs.gov/cspublicapp/businesssearch/businesssearch.aspx
- WA — https://dol.wa.gov/professional-licenses/sellers-travel

### Specialties — the same four, in the same order, everywhere

The site organises the practice into four areas. Profiles that reorder or
rename them fragment the entity:

1. **Elite motorsport** — circuit access at Formula 1 weekends, paddock and
   pit-lane experiences, hospitality
2. **Championship golf** — tee times at private clubs and bucket-list courses
3. **Bespoke sport** — seats at the finals that matter, and access to the
   people behind the game
4. **Global luxury** — fully planned international trips, from private-guide
   safaris to multi-country cultural tours

---

## 1. Consortium / host-agency advisor profile — Travel Leaders Network

**Status: copy ready, written to TLN's own five required fields. Awaiting
Mark's Agent Profiler login and his numeric agent ID.**

### Where this actually lives

Three names get conflated; they are three different things:

| | |
|---|---|
| `travelleadersnetwork.com` | The B2B/member site. **Does not host public profiles.** |
| `travelleaders.com` | The consumer site. **This is where the public profile lives.** |
| `agentprofiler.travelleaders.com` | The back office where the profile is written. Member login. |

Public profile URLs are `travelleaders.com/agent/{numeric id}`, with one
additionally-indexable page per specialty bio at `/agent/{id}/bio/{n}`. There
are no vanity slugs — the ID is numeric only.

### Set expectations: this is a lead channel, not an SEO asset

Every profile URL serves a byte-identical SPA shell. The `<title>` is the
generic *"#1 Travel Agent Network in North America"* on every profile;
there is no meta description, no canonical, no `og:*`, and the advisor's name
does not appear in the raw HTML at all. Content is injected client-side, and
Google picks up the advisor-specific title on some profiles and not others.
The only JSON-LD emitted is a `BreadcrumbList` whose name is the generic site
title — no `Person`, no `LocalBusiness`, no `Review`.

So do not plan for this page to rank. Its value is TLN's own lead flow —
Internova reports 2M+ consumer leads since 2012 across 22,000+ profiles, an
average booked trip above $11,000, and roughly 25% conversion — plus the
entity signal of a consistent, corroborating profile. Write it for the human
reading it and for TLN's internal search, not for Google.

### The five required fields

TLN's own guide names exactly five things a profile needs to go "online
eligible": **profile image · website display title · full bio · at least one
featured specialty · at least one featured destination.** All five are below.

### Field 1 — Website display title

This becomes the `<h1>` on the bio pages. TLN's guidance is explicit: do not
repeat the name or the location, because both are shown automatically.
"Travel Agent" and "Bend Travel Agent" are named as bad examples. Search cards
truncate around 50 characters, so the front half has to carry it.

> **Formula 1, Championship Golf & Global Luxury Travel**

(51 characters. If the field or the card truncates hard, fall back to
**"Formula 1 & Championship Golf Travel Specialist"** — 47.)

### Field 2 — Specialty tags, and the one that matters

TLN exposes 110 interests across 8 categories, and Mark's niche is a
first-class tag rather than something to describe in prose:

| Tag | Note |
|---|---|
| **Auto Racing** | interest ID 111, about 1,000 advisors carry it. **There is no "Formula 1" tag** — this is the one. The current top result on that facet is a Monaco specialist, so the competition for it is real and shallow. |
| **Sporting Events** | The second half of the sports practice |
| **Golf** | About 2,300 advisors |
| **Tennis** | — |
| Luxury · Bespoke Travel · Premier Concierge Services | The global-luxury half |
| Safari · Private Jet Charters | Supporting |

**Destinations:** Monaco and Monte Carlo first — they are what the Auto Racing
facet is searched with — then the safari and cultural markets the site covers.

**Preferred suppliers:** the supplier filter includes **Roadtrips Sports
Travel**, which is an Internova sister brand under the same parent as TLN.
For an advisor whose practice is motorsport and championship golf, being
findable on that supplier facet is the single highest-value filter box on the
form. Set it if the relationship supports it.

### Field 3 — Full bio ("About Me")

TLN's guide says to write numbers **as digits, never spelled out** ("27, not
twenty-seven"), and to cut fluff. Live profiles run short — a real Bend-market
example measures 37 words. Two lengths, both written to that rule:

**Short (about 45 words — matches what live profiles actually carry):**

> I build trips around world-class sport. 20 years planning bespoke travel,
> concentrated in Formula 1 circuit and paddock access, championship golf at
> Augusta, St Andrews and Pebble Beach, and the finals worth flying for.
> Alongside that, a full global luxury practice. Every itinerary built from
> scratch.

**Longer, if the field rewards it (about 110 words):**

> I started Hit Your Mark Travel to do one thing properly: pair the intensity
> of world-class sport with the standard of a genuinely luxurious trip.
>
> 20 years of planning bespoke journeys sits behind it. It runs as a
> consultancy, not a booking desk — every itinerary is built from scratch.
>
> The work concentrates in 4 areas: elite motorsport, including circuit and
> paddock access at Formula 1 weekends; championship golf, from Augusta to
> St Andrews to Pebble Beach; bespoke sport, meaning seats at the finals that
> matter; and global luxury — private-guide safaris and multi-country cultural
> itineraries.
>
> 1 advisor, start to finish. No hand-offs, no intake queue.
>
> CA Seller of Travel 2165910-50 · WA 605920581 · FL ST46122

### Field 4 — Featured specialty bios

Each one gets its own indexable `/bio/{n}` URL and its own image, so these are
four separate small landing pages, not one. Write one per practice area, each
titled as a claim rather than a category:

1. **"Formula 1 Weekends, Paddock to Grandstand"** — what the hospitality
   tiers actually are and what each one buys
2. **"Augusta, St Andrews, Pebble Beach"** — how access to closed courses is
   really allocated
3. **"The Finals Worth Flying For"** — Wimbledon, Royal Ascot, the Kentucky
   Derby, the Dubai World Cup
4. **"Private-Guide Safari and Multi-Country Culture"** — the global luxury half

Specialty images render at 500×280 (roughly 16:9). Source them from the
site's own library rather than commissioning new ones.

### Field 5 — Profile image

`public/assets/img/sp-mark-sole-portrait.jpg` — the same crop the About page
displays and the same file the `Person` schema names. Keep all three in step.
The delivered asset on live profiles measures 350×390, a portrait ratio of
roughly 9:10, so check the crop survives that shape before uploading.

### Certifications and Awards section

Restate the three Seller of Travel registrations here as well as in the bio.
TLN's guide says to avoid acronyms in this section, so write them out:
"California Seller of Travel, registration 2165910-50", and so on.

### Reviews

Agent Profiler has a built-in review request under **My Profile → My
Reviews**, and the agency must approve each one before it displays. This is
the one legitimate route to public star ratings — see the note in § 8 about
why HYMT-controlled reviews must never carry `AggregateRating` on our own site.
**This is also the natural home for the testimonials #67 is collecting**: a
client willing to be quoted is usually willing to leave a TLN review, and that
one lands somewhere we do not control and therefore counts for more.

### Not available on this profile

There is no social-links field on any live profile, and contact runs through
"Email me" / "Call me" / "Video appointment" buttons rather than `mailto:` or
`tel:` links. So the profile cannot link out to hymtravel.com the way a
directory listing would. **`sameAs` still works** — it points from our site to
the profile, which is the direction that matters for entity consolidation.

### Reference

TLN's own guidance document, hosted publicly by a member agency:
https://ictravel.com/wp-content/uploads/2022/07/Travel-Leaders-Agent-Profiler-Suggestions-for-setting-up.pdf

### Still needed from Mark

- Agent Profiler login → the numeric agent ID → the public profile URL, which
  is what unblocks the `sameAs` entry in § 7
- Confirmation of the affiliate/associate agency line, which is rendered
  automatically from his affiliation and is the one field he does not write
- Whether the Roadtrips supplier relationship can be claimed

### Generic bios, for anywhere that is not TLN

The versions below spell numbers out and are the right register for ASTA, the
Chamber, LinkedIn and press. **Do not paste these into Agent Profiler** — use
the digits versions above, per TLN's guidance.

### Long bio (about 150 words — for a profile with a full bio field)

> Mark Sole is the founder and Travel Director of Hit Your Mark Travel, a
> single-advisor luxury practice based in Bend, Oregon and part of the Travel
> Leaders Network.
>
> He started the practice to do one thing properly: pair the intensity of
> world-class sport with the standard of a genuinely luxurious trip. Twenty
> years of planning bespoke journeys sits behind it, and it runs as a
> consultancy rather than a booking desk — every itinerary is built from
> scratch.
>
> His work concentrates in four areas: elite motorsport, including circuit
> access and paddock hospitality at Formula 1 weekends; championship golf, from
> Augusta to St Andrews to Pebble Beach; bespoke sport, meaning seats at the
> finals that matter and access to the people behind the game; and global
> luxury travel — private-guide safaris, multi-country cultural itineraries,
> and the trips that do not fit a package.
>
> One person answers the phone, knows your file, and stands behind every
> recommendation.
>
> CA Seller of Travel 2165910-50 · WA 605920581 · FL ST46122

### Short bio (about 50 words — for a card or a directory summary)

> Mark Sole is the founder of Hit Your Mark Travel, a single-advisor luxury
> practice in Bend, Oregon, part of the Travel Leaders Network. Twenty years
> of bespoke planning, concentrated in elite motorsport, championship golf,
> bespoke sport and global luxury travel. Every itinerary built from scratch.
> CA Seller of Travel 2165910-50.

### One line (about 20 words)

> Luxury travel advisor in Bend, Oregon. Formula 1, championship golf, bespoke
> sport and global luxury — every itinerary built from scratch.

### Specialty tags

Use the profile's own taxonomy where it has one, mapping to: Luxury Travel ·
Sports & Event Travel · Motorsport / Formula 1 · Golf Travel · Safari ·
Cultural & Immersive Travel · Multi-Generational Travel · Honeymoon &
Celebration · Cruise.

### Headshot

`public/assets/img/sp-mark-sole-portrait.jpg` — the same crop the About page
displays and the same file the `Person` schema names. Keep these three in step;
if the profile photo changes, the site's changes with it.

---

## 2. ASTA directory listing

**Status: copy ready. Recommendation: do not buy this yet. The consumer
listing is not reachable by paying dues, and the step that unlocks it depends
on Travel Leaders Network, not on Mark.**

### What the research found, and why it changes the plan

The consumer directory is **VeriVacation** (verivacation.com), not TravelSense
— TravelSense's endpoints are dead and it has been dropped from ASTA's
navigation. Getting into VeriVacation takes three things, in order:

1. **ASTA membership** — Independent Advisor / Independent Contractor tier,
   **$255/year** as of 2026. Runs a full 12 months from payment, never
   prorated, auto-renewing by default. Join at
   https://www.asta.org/content/Membership/join-renew.aspx
2. **Verified Travel Advisor (VTA) certification** — four self-paced courses,
   and the gate: **$500,000 in verified sales**. Membership alone buys no
   consumer listing. Every profile in VeriVacation is a VTA.
3. **Sales verification by someone else.** ASTA's rule is explicit:
   *independent contractors cannot verify their own sales* — a host agency,
   consortium or supplier must do it. **That means Travel Leaders Network has
   to verify Mark's $500,000, and until someone asks them whether they will,
   this whole item is blocked on a party outside the business.**

### And the listing itself is weaker than it sounds

A VeriVacation profile displays a headshot, name, city/state, agency name, a
tagline, a bio, travel and destination specialisations, and languages. It
displays **no phone number, no email, and no website URL** — every contact
routes through an on-site lead form.

So it sends no link equity and no referral traffic to hymtravel.com, and it
cannot join `sameAs` as a corroborating link in the way a Chamber listing can.
Its value is the ASTA referral flow and the credential, not the link.

### Recommendation

Ask TLN first: *"will you verify sales for a VTA application?"* If the answer
is no, the $255 buys trade membership and E&O access — which may well be worth
it on their own merits — but it does not buy the directory listing, and it
should not be bought expecting one. Sequence it after the Chamber listing,
which costs less and yields a real indexable link.

### Copy, for when it is unblocked

The description below also works for any host-agency directory with the same
shape.

### Description

> Hit Your Mark Travel is a single-advisor luxury practice based in Bend,
> Oregon, part of the Travel Leaders Network. Founder Mark Sole plans bespoke
> international travel with a concentration in sport: Formula 1 circuit and
> paddock access, championship golf at Augusta, St Andrews and Pebble Beach,
> and seats at the finals that matter. Alongside that sits a full global
> luxury practice — private-guide safaris, multi-country cultural itineraries,
> and celebration travel. Every itinerary is built from scratch; there is no
> intake queue and no hand-off. CA Seller of Travel 2165910-50 · WA 605920581 ·
> FL ST46122.

### Fields to have ready

Business name · advisor name · Bend, OR · phone · email · website ·
specialties (the four, in order) · years in business (20+) · consortium
(Travel Leaders Network) · Seller of Travel numbers · logo · headshot.

---

## 3. LinkedIn

**Status: ready to paste.** Update the profile at cutover; the website field is
the only part that must wait.

### Headline (220 char limit)

> Founder & Travel Director, Hit Your Mark Travel · Bespoke luxury travel from
> Bend, Oregon · Formula 1, championship golf and the trips that don't fit a
> package

### About section

> I started Hit Your Mark Travel to do one thing properly: pair the intensity
> of world-class sport with the standard of a genuinely luxurious trip.
>
> Twenty years of planning bespoke journeys sits behind it. It runs as a
> consultancy, not a booking desk — every itinerary is built from scratch, and
> I put my name on all of it.
>
> The work tends to fall into four areas:
>
> • Elite motorsport — circuit access at Formula 1 weekends, with paddock and
>   pit-lane experiences and hospitality
> • Championship golf — tee times at private clubs and bucket-list courses
>   around the world
> • Bespoke sport — seats at the finals that matter, and access to the people
>   behind the game
> • Global luxury — fully planned international trips, from private-guide
>   safaris to multi-country cultural tours
>
> Hit Your Mark Travel is a single-advisor practice and part of the Travel
> Leaders Network. One person answers the phone, knows your file, and stands
> behind every recommendation — no hand-offs, no intake queue, no call center.
>
> If your first question is "what do you charge?", I'm probably not the right
> fit. If it's "can you get me somewhere truly exceptional?" — then we should
> talk.
>
> Based in Bend, Oregon. Available anywhere.
> mark@hymtravel.com · (408) 568-1404
> CA Seller of Travel 2165910-50 · WA 605920581 · FL ST46122

### Licenses & Certifications entries

Add three, one per registration. LinkedIn's fields map like this:

| Field | CA | WA | FL |
|---|---|---|---|
| Name | Seller of Travel Registration | Seller of Travel Registration | Seller of Travel Registration |
| Issuing organization | California Department of Justice, Office of the Attorney General | Washington State Department of Licensing | Florida Department of Agriculture and Consumer Services |
| Credential ID | 2165910-50 | 605920581 | ST46122 |
| Credential URL | https://sotas.doj.ca.gov/sellerSearch.action | https://dol.wa.gov/professional-licenses/sellers-travel | https://csapp.fdacs.gov/cspublicapp/businesssearch/businesssearch.aspx |

Leave "This credential does not expire" **unchecked** — all three renew.

### Skills

Luxury Travel · Travel Planning · Itinerary Development · Sports Travel ·
Event Travel · Safari · Destination Weddings · Client Relationship Management ·
Supplier Negotiation

---

## 4. Bend Chamber of Commerce

**Status: copy ready. One question to ask before paying — see below.**

The directory runs on GrowthZone at `business.bendchamber.org`.

### The opportunity, stated plainly

The category a travel advisor lists under is **`Travel - Agencies & Brokers`**
(category ID 485828, under `TOURS & TRANSPORTATION`). It currently contains
**exactly one member**, and that listing carries a name and a category and
nothing else — no logo, no phone, no website, no description. `Vacation -
Planning` (485689) holds one entry, Visit Central Oregon.

A properly completed listing is immediately the strongest travel entry in the
directory. That is unusual and worth acting on.

### Tier

| Tier | Cost | What the listing gets |
|---|---|---|
| Basic | $180 | Business name only. No link, no description, no phone — **not worth buying** |
| Small Business | $495 | "Search Engine Optimized listing in online member directory" |
| Growth | $1,175 | Priority listing plus premium features — highlights, logo, photos, video |

**Ask this before paying:** does the $495 Small Business listing include the
logo, photos and video, or do those start at Growth ($1,175)? The published
tier copy lists "premium features (highlights, logo, photos, video)" only from
Growth upward but never says Small Business excludes them. It is the difference
between $495 and $1,175. Garrett Jaenicke, Director of Marketing & Member
Service — garrett@bendchamber.org.

Apply at https://business.bendchamber.org/member-application. Use the
`business.` host: two buttons on the public membership page point at a Webflow
staging host that loads in an error state.

### Listing description (about 95 words, matching the length of the strongest
existing listings in the directory)

> Hit Your Mark Travel is a luxury travel consultancy based in Bend, planning
> bespoke international journeys for travelers who want the trip built around
> them rather than the other way round.
>
> Founder Mark Sole has twenty years in bespoke travel, with a concentration
> in sport — Formula 1 circuit and paddock access, championship golf at
> Augusta, St Andrews and Pebble Beach, and seats at the finals worth flying
> for — alongside a full global luxury practice covering private-guide
> safaris, multi-country cultural itineraries and celebration travel.
>
> Every itinerary is built from scratch. One advisor, start to finish.
>
> Part of the Travel Leaders Network. CA Seller of Travel 2165910-50 ·
> WA 605920581 · FL ST46122.

### Categories to claim

Primary `Travel - Agencies & Brokers` (485828). With the extra category slots:
`Vacation - Planning` (485689) and `Tours - Operators` (485690).

### The address field

The GrowthZone listing renders a street address with a Google Maps link.
DECISIONS.md D3 says city and region only. If the form requires a street
address, ask whether it can be suppressed from public display — GrowthZone
supports hidden address fields. **Do not publish a home address to satisfy a
form.**

---

## 5. Travel-industry podcasts

See § 9. Target list, contact routes and which shows take outside guests.

### The pitch, in one paragraph

> I'm Mark Sole — I run Hit Your Mark Travel, a single-advisor luxury practice
> in Bend, Oregon. My niche is unusual enough that it might make a good
> conversation: I build trips around world-class sport. Formula 1 paddock
> weekends, Augusta and St Andrews, the finals that people plan a year around.
> The interesting part isn't the access — it's that sports travel breaks most
> of the assumptions the luxury playbook runs on. The date is fixed, the
> inventory is finite, and the client's emotional stake is in something you
> cannot control. I've spent twenty years learning how to plan against that,
> and I'm happy to talk about what it teaches you that a beach week never
> would.

---

## 6. Press

See § 10 for outlets and submission routes.

### Angle A — trade press: what sports travel teaches about fixed-date inventory

The advisor-facing angle. Sports travel inverts the normal luxury planning
model: the date cannot move, the inventory is genuinely finite, and demand is
inelastic in a way beach and safari demand is not. An advisor who works that
way has a different toolkit. Pitch to trade outlets as a practitioner piece,
not a business announcement.

### Angle B — local business: a specialist practice in a town that gets
categorised as an outdoor destination

Bend is covered as a recreation town. A luxury travel consultancy whose
clients fly to Monaco and Augusta is a different story about the same place,
and local business desks are receptive to "the business you didn't know was
here" framing.

### Angle C — the launch itself

Weakest of the three and should go last. A new website is not news. It becomes
news only when attached to something — a first season of Formula 1 bookings, a
named client outcome that can be published, a milestone.

### One-paragraph pitch

> Mark Sole runs Hit Your Mark Travel out of Bend, Oregon — a single-advisor
> luxury practice whose specialty is travel built around world-class sport:
> Formula 1 paddock weekends, championship golf at Augusta and St Andrews, and
> the finals clients plan a year around. It is a niche that breaks the usual
> luxury-travel assumptions, because the date is fixed and the inventory is
> genuinely finite. Twenty years in, he has strong views on what that teaches
> you about planning under constraint. Happy to arrange an interview.

---

## 7. `sameAs` — update only what actually publishes

The `Organization` node lives in `src/pages/index.astro` and the `Person` node
in `src/pages/about/index.astro`. Both currently carry one entry:
`https://www.instagram.com/travelwithsoleman/`.

As each profile goes live and is confirmed serving, add its URL. Candidates,
in the order they are likely to land:

- Google Business Profile (D4 — Devin creates it; the profile URL joins here)
- LinkedIn
- Travel Leaders Network advisor profile
- Bend Chamber directory listing
- ASTA advisor listing

**A `sameAs` entry pointing at a profile that was never published is a factual
error in structured data.** Add the URL after the profile is live, not when it
is submitted, and open the URL in a private window to confirm it is publicly
reachable rather than login-gated.

---

## 8. Not worth attempting

- **Wikidata and Crunchbase** — not until press coverage exists to cite as
  notability. Unchanged from #38.
- **EDCO** — oriented toward traded-sector companies, recruitment and job
  creation. Low relevance for a solo advisory practice.
- **Visit Bend** — a destination management organisation, not a membership
  body. Its paid options are event listings and visitor-centre brochures.

## 9. Podcast targets

Researched 2026-08-24. Every "latest episode" date was taken from the iTunes
lookup API (`itunes.apple.com/lookup?id=<appleId>&entity=podcastEpisode`),
which returns machine-readable release dates — rendered Apple and aggregator
pages lazy-load their episode lists and produced wrong years on three earlier
passes. **Re-check activity before pitching**; this list ages.

### Tier 1 — published pitch route, format fits, start here

| Show | Host | Latest ep | Pitch route |
|---|---|---|---|
| **Trade Secrets** | Jamie Biesiada (Travel Weekly) + Emma Weissmann (TravelAge West) | 2026-08-17 | tradesecrets@travelweekly.com · hotline 201-902-2098 |
| **Travel Agent Chatter / Friday 15** | Steph Lee + Shayna Zand (Host Agency Reviews) | 2026-08-14 | hello@hostagencyreviews.com — they publish an open call for advisor guests |
| **Strategic Travel Entrepreneur** | Rita M. Perez | 2026-08-21 | rita@steeryourmarketing.com |
| **Away We Go Podcast** | Dianne Bortoletto + Ciara Gillan | ~2026-08-18 | hello@awaywegopodcast.com |
| **The Traveling Golf Diva** | Doris R. Muscarella | 2026-07-25 | Open guest form: thetravelinggolfdiva.com/become-a-guest/ |

**Away We Go is the single best fit on the list** — an F1 show explicitly about
the travel, food and lifestyle around Grand Prix weekends, which is Mark's
niche stated back to him. It books non-celebrity guests and publishes a real
address.

**Trade Secrets is the best trade target** — the format is literally "our
editors ask a veteran travel advisor to join them", and it has both an email
and a listener hotline.

**The Traveling Golf Diva is the only show here with an open guest form.**
Hard rule on that one: no sales pitches, no promotion — promotional content
gets edited out unless you are a paying partner. It must be pure how-to.

### Tier 2 — good fit, route is social or indirect

| Show | Host | Latest ep | Route |
|---|---|---|---|
| **TIQUE Talks** | Robin Bradley + Jennifer Jacob | 2026-08-21 | tiquehq.com/contact (general form) |
| **The Travel Agent Guide** | Byrd Bergeron + Haley DeCarlo | 2026-08-19 | Instagram / Facebook only — no email published |
| **Humans of Travel** | Chelsee Lowe (TravelAge West) | 2026-08-10 | No public route; Chelsee Lowe via LinkedIn |
| **Travel Agent Achievers** | Roslyn Ranse | 2026-07-27 | Contact form at travelagentachievers.com/contact — the email renders obfuscated, read it off the page |
| **Missed Apex F1** | "Spanners" + Matt Trumpets | 2026-08-23 | spanners@missedapex.net · WhatsApp +44 79 4747 1840 |
| **BendBEAT** | Brian Ladd | 2026-01-20 | The Ladd Group, 541.633.4569 — local Bend business format, but only one confirmed 2026 episode |

### Tier 3 — pitch as a source, not as a guest

- **The Folo by Travel Weekly** (Rebecca Tobin, daily-ish, most active show
  found) — predominantly Travel Weekly staff editors. Outside voices appear as
  sources on a news topic, not as profile subjects. Pitch on a news peg: F1's
  US calendar, an Augusta access story, a Ryder Cup travel surge.
- **Unpacked by Afar** (Aislyn Greene) — books outside experts every episode,
  but it is a national magazine with staff producers. Pitch one reported story
  idea, never a bio.
- **Luxury Travel Insider** (Sarah Groen) — runs "Expert Panel" episodes of
  destination specialists. **The host owns a competing luxury advisory.** The
  currency is destination expertise she does not have, never the firm.

### Do not pitch

- **Beyond (Embark Beyond)** — in-house marketing show for a much larger
  competing agency, and no published pitch route.
- **Golf and the Good Life**, **The Golf Trip Authority**, **Travel Royally**,
  **Gimme Golf** — all owned by competing golf tour operators.
- **F1 Nation, F1 Explains, The F1 Show, Beyond the Grid** — official and
  broadcaster shows. They book drivers, team principals and accredited F1
  journalists, not travel vendors, and have no public pitch route.
- **The Travel Diaries** — celebrity-guest format.
- **Travel Biz CEO** (last episode 2021), **Hustle Northwest** (last episode
  2025-05-01), **Talking GolfGetaways** (no 2026 episode confirmed) — dormant.

### A structural note worth knowing before pitching

Three of the four luxury-travel shows on this list are hosted or owned by
competing travel businesses. That is the shape of the niche, not bad luck. The
pitch into those has to trade destination expertise, never business profile.
The shows that will take a profile pitch are the trade-advisor shows and the
sport-specific ones.

### Not checked

`Wanderlust Wednesdays`, `Travel MBA`, `The Travel Agent Success Podcast`,
`Travel Agent Marketing`, `Ready Set Travel Biz`, `Travel Trade Talk`,
`Travel Agent School`, `Home Based Travel Agent Show`, `Bliss to Abundance`,
`Travel Geniuses` — the research pass hit its search cap before confirming
whether any of these are active. Check a 2026 episode date via the iTunes
lookup endpoint above before contacting any of them.

## 10. Press outlets

_Filled in below from the 2026-08-24 research pass._

---

## Acceptance for #97

- [x] All six items drafted and ready to submit
- [x] Naming and positioning consistent across all drafts — § "Canonical facts"
      is the single source and every draft is written from it
- [ ] Nothing submitted, and no link to `hymtravel.com` published anywhere,
      before #33 passes — **stays open until cutover; this is the constraint,
      not a task**
