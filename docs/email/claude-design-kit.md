# Claude Design kit: HYMT monthly newsletter

Everything to paste into Claude Design to build each month's email. The plan,
calendar and reasoning are in `newsletter-plan-2026-27.md`.

## How to use it

1. Open the HYM Email Newsletter project in Claude Design. (Standalone Claude
   Design closes by December 14, 2026. From then on, use Claude Design inside
   Claude and attach `2026-09-new-website-announcement.html` as the base.)
2. Paste **Part 1, the master prompt**, once at the start of each session.
3. Paste **one month's brief from Part 3**.
4. Review it against the checklist in Part 4. Ask for changes in plain words,
   e.g. "Shorten Mark's Take to 60 words."
5. Export the HTML and paste it into Reach's Code editor.

---

## Part 1: master prompt (paste once per session)

```
You are producing a monthly email newsletter for Hit Your Mark Travel (HYMT), a
luxury travel advisory in Bend, Oregon run by Mark Sole. It is sent through
Hostinger Reach to a list that is mostly PAST CLIENTS.

BASE LAYOUT
Use "HYM Email Newsletter.html" in this project (the September 2026 "new website
is live" email) as the structural and visual base. Keep its header, Mark's Note
"M" badge block, signature, footer and colors. Replace its body with the blocks
below.

BLOCKS, IN ORDER
1. Header: logo left, small-caps right: "MONTHLY NOTE · <MONTH YYYY>"
2. Hero: full-width photo (600 wide), eyebrow, headline, 40–60 word intro, gold
   button
3. The Feature: section eyebrow + heading, short intro line, then exactly three
   items. Each has a bold lead-in and 40–60 words. 150–220 words total. No
   columns: the three items are stacked rows.
4. Book-by box: gold left rule or gold border on a #f5f0e8 background.
   "BOOK-BY" eyebrow, one bold dated line, one sentence of why.
5. Mark's Take: the existing "M" badge block, 50–80 words
6. Keep Reading: one full-width card (image on top, then eyebrow, title, 1–2
   lines, "Read ›" link) to the Travel Journal article
7. Close: one line inviting a reply, then the button "Start Planning" to
   /plan-your-trip/
8. Signature: Mark Sole, Founder & Travel Director, Hit Your Mark Travel,
   P (541) 241-6481, E mark@hymtravel.com, W hymtravel.com
9. P.S. line under the signature when the brief includes one
10. Footer: "Hit Your Mark Travel · Dream It. Aim It. Book It.", the mailing
    address line exactly as given in the brief, Instagram
    (https://www.instagram.com/travelwithsoleman/) and LinkedIn
    (https://www.linkedin.com/in/mark-sole/), the line "You're receiving this
    because you've traveled with Hit Your Mark or asked to hear from us.", then
    Reach's unsubscribe block copied VERBATIM from the base file as the very last
    element.

BRAND
Navy #0d1b2a (header, hero band, footer), deep navy #080f1a, slate #243d5c,
gold #C9A84C (buttons, rules, eyebrows), dark gold #a8862e (gold text on white),
cream #f5f0e8 (callout backgrounds), page background #e5ddd0, white content
column, body text #0d1b2a, muted #a8b8c8 on navy. Font: 'Helvetica Neue',
Helvetica, Arial, sans-serif only. Eyebrows: 10–11px, uppercase,
letter-spacing 2px. Body 15–16px / 24–26px line height.

HOSTINGER REACH TECHNICAL RULES (non-negotiable; Reach breaks anything else)
- 600px wide, ONE COLUMN ONLY. No side-by-side columns or cards anywhere. Reach
  turns columns into fixed 50% cells that don't stack on phones.
- Layout built from nested <table role="presentation"> only. No divs for layout.
- ALL CSS inline. No <style> block, no media queries, no web fonts, no
  JavaScript, no data: URIs, no background images.
- Don't rely on HTML comments, role attributes or MSO conditionals surviving.
  Reach strips them.
- Buttons are padded <td> cells with a link inside (bulletproof buttons), not
  images.
- Every <img> has absolute https src, width, height, alt, style="display:block".
  Image URLs follow
  https://www.hymtravel.com/assets/img/nl-YYYY-MM-<slug>-<name>.jpg exactly as
  listed in the brief.
- Every hymtravel.com link ends with
  ?utm_source=reach&utm_medium=email&utm_campaign=<campaign from the brief>
- Keep the hidden preheader <div> at the top with the brief's preheader text.
- No placeholder text anywhere. If something is missing, stop and ask.

VOICE
Mark writes in first person as an ADVISOR. He never claims to have taken a trip,
stayed somewhere or visited a place. Write "The question I ask first is…",
"What people usually get wrong…", "If it were my booking, I'd…". NEVER write
"When I was in…", "my stay at…" or "on my last trip…". Specifics beat adjectives:
use the numbers and facts in the brief and invent none. No prices, discounts,
urgency language or "limited time". Warm, direct, brief: a note from someone the
reader has already traveled with. Total body copy 350–500 words.

OUTPUT
One complete HTML file. Then list: subject line, preheader, every link URL and
every image filename with its required pixel size (2× display size), so the
images can be produced.
```

---

## Part 2: monthly brief template

```
MONTH: <Month YYYY>   CAMPAIGN: nl-YYYY-MM-<slug>   SEND: <date>, 8:00 am PT
SUBJECT: <A>          PREHEADER: <text>
MAILING ADDRESS (footer): <street / PO box, Bend, OR ZIP>
HERO: eyebrow / headline / intro direction / button label → link
FEATURE: heading + three items (lead-in + direction + facts to use)
BOOK-BY: <dated line> (confirmed by Mark on <date>)
MARK'S TAKE: <angle>
KEEP READING: <journal title> → <link>
P.S.: <text or none>
IMAGES: <filename> — <subject> — <display size>
```

---

## Part 3: the twelve briefs

The footer address is left as `<MAILING ADDRESS>` until open item 1 in the plan
is answered. **Claude Design must not invent one.** Every Book-by line is a
draft that Mark confirms with his suppliers the week of the send. Where a line
quotes the site, the source is named.

### November 2026: your winter escape, matched to you (copy fully drafted)

```
MONTH: November 2026   CAMPAIGN: nl-2026-11-winter-escape   SEND: Thu Nov 5, 2026, 8:00 am PT
SUBJECT: What should your winter escape feel like?
PREHEADER: Three very different beaches. One question decides it.
MAILING ADDRESS (footer): <MAILING ADDRESS>

Use the copy below as written (light edits for fit only).

HERO
Eyebrow: WINTER 2027
Headline: Your Winter Escape, Matched to You
Intro: Los Cabos, the Riviera Maya and Turks & Caicos get booked as if they
were the same trip. They aren't. One question sorts them out, and if you want
February or March, now is the month to ask it.
Button: Find Your Match → https://www.hymtravel.com/destinations/caribbean-mexico/

FEATURE
Eyebrow: THREE WINTERS
Heading: Same sunshine, very different days
Intro line: Start with what a perfect afternoon looks like, not with the map.

1. Los Cabos: desert, dinner and golf.
Desert meets the Pacific here, and the restaurant scene has quietly become the
best in Mexico. The trade-off is that the sea is often too rough to swim. Choose
it if your perfect day is a round of golf, a long lunch and a pool with a view.
→ https://www.hymtravel.com/destinations/riviera-maya-los-cabos/

2. The Riviera Maya: jungle, cenotes and calm Caribbean water.
Swim in freshwater cenotes in the morning and walk Mayan ruins about an hour
inland in the afternoon, with Caribbean water to come back to. Choose it if you
want the beach plus something to explore.
→ https://www.hymtravel.com/destinations/riviera-maya-los-cabos/

3. Turks & Caicos: the beach, and nothing to prove.
Grace Bay is twelve uninterrupted miles of white sand, and the water really is
that color. It's the best fit for families and villa stays, and winter is whale
season. The quieter outer cays are there if you want a few days of nothing.
Choose it if the beach is the whole point.
→ https://www.hymtravel.com/destinations/turks-caicos/

BOOK-BY
Eyebrow: BOOK-BY
Line: Presidents' Day week (Feb 13–21, 2027) and March spring break: decide by Thanksgiving.
Why: Those are the weeks the best-located villas and family suites go first.
January and early December still have room to choose.

MARK'S TAKE
The question I ask first isn't "where?" It's "do you want to swim straight off
the beach?" If the answer is yes, Los Cabos usually drops off the list, however
good the restaurants are. If the answer is "I'll mostly be by the pool," it
moves to the top. Get that one question right and the rest of the trip mostly
plans itself.

KEEP READING
Eyebrow: FROM THE TRAVEL JOURNAL
Title: The Caribbean & Mexico Guide
Line: Island by island: what each one is actually like on the ground, and which
one fits the trip you have in mind.
→ https://www.hymtravel.com/travel-journal/caribbean-mexico-destination-guide/

CLOSE
Reply with the month you're thinking of and who's coming. I'll come back with
two or three options that fit. Or start here:
Button: Start Planning → https://www.hymtravel.com/plan-your-trip/

P.S.: If someone you know is still deciding where to go this winter, forward
this along. I'm glad to help anyone you'd send my way.

IMAGES
nl-2026-11-winter-escape-hero.jpg (calm turquoise water and white sand, no
people facing camera, 1200×525)
nl-2026-11-winter-escape-journal.jpg (Caribbean coastline or resort beach,
1088×504)
```

### December 2026: one trip, three generations

```
MONTH: December 2026   CAMPAIGN: nl-2026-12-three-generations   SEND: Thu Dec 3, 2026
SUBJECT: A family trip worth talking about together
PREHEADER: Bring these to dinner this month. Travel in 2028.
HERO: Eyebrow "FOR THE HOLIDAY TABLE". Headline "One Trip. Three Generations.
  Everyone Considered." Intro: the holidays are when the whole family is in one
  room, so it's the best time to start the conversation for summer 2028 or late
  2027. Button "Plan a Family Trip" → /experiences/multigenerational-travel/
FEATURE: "Six questions to bring to dinner", shown as three items of two
  questions each:
  1) Who's coming, and what can everyone comfortably do? (mobility, ages, naps,
     stairs)
  2) How do we sleep, and how do we split it? (one villa vs. connecting rooms;
     who pays for what, settled early)
  3) What do we do together, and what do we do apart? (one shared highlight a
     day; school calendars set the dates)
BOOK-BY (draft, Mark confirms): "Summer 2028 with kids: have a shortlist by the
  end of January 2027." Why: large villas and connecting rooms in school-holiday
  weeks are the scarcest rooms in travel.
MARK'S TAKE: The trip that works plans one thing a day together and leaves the
  rest open. The trip that doesn't plans everything for everyone.
KEEP READING: In Defense of Slow Travel → /travel-journal/in-defense-of-slow-travel/
P.S.: A thank-you to past clients for 2026, two sentences, warm and not salesy.
IMAGES: nl-2026-12-three-generations-hero.jpg (family walking on a beach or
  terrace seen from behind, 1200×525); -journal.jpg (1088×504)
```

### January 2027: your first safari

```
MONTH: January 2027   CAMPAIGN: nl-2027-01-first-safari   SEND: Thu Jan 7, 2027
SUBJECT: What kind of safari is right for you?
PREHEADER: Before Kenya vs. Botswana: what do you want to see?
HERO: Eyebrow "SAFARI 2028". Headline "Your First Safari Starts With the
  Experience, Not the Country". Button "Explore Africa" → /destinations/africa/
FEATURE: three decisions, in order:
  1) What do you most want to see? Big cats and the migration point to
     /destinations/kenya-tanzania/. Gorillas point to /destinations/rwanda/.
     Water and elephants point to /destinations/botswana/.
  2) How do you want to experience it? Vehicle, walking, boat, and how much
     comfort.
  3) What comes before and after? Cape Town and the Winelands
     (/destinations/south-africa/), Victoria Falls
     (/destinations/zambia-victoria-falls/), or a beach finish.
BOOK-BY (draft): "July–October 2028 dry season: start the shortlist this winter."
  Why: the smaller, best-placed camps have few tents and are the first to fill.
  Mark confirms with his partners.
MARK'S TAKE: People ask "which country?" first. The better first question is
  "what do you want to see?" The country follows from the answer.
KEEP READING: Safari Planning: 12 Questions → /travel-journal/safari-planning-12-questions/
  (Optional second text link: The African Safari Calendar →
  /travel-journal/african-safari-calendar/)
IMAGES: -hero.jpg (wildlife at golden hour, no tourists, 1200×525); -journal.jpg
```

### February 2027: the anniversary trip that feels like yours

```
MONTH: February 2027   CAMPAIGN: nl-2027-02-anniversary   SEND: Thu Feb 4, 2027
SUBJECT: More than a dinner reservation
PREHEADER: Planning a milestone for late 2027 or 2028.
HERO: Eyebrow "MILESTONES". Headline "The Anniversary Trip That Feels Like
  Yours". Button → /experiences/romance-celebration-travel/
FEATURE: three choices that shape a celebration trip:
  1) Privacy or exploration? A private-pool villa you barely leave, or a place to
     discover together.
  2) One base or several stops? Fewer check-outs means more of the trip.
  3) The personal detail: the private dinner, the surprise, the thing only you
     two would care about.
  Examples to name: the Maldives (/destinations/maldives/), St. Lucia
  (/destinations/st-lucia/), French Polynesia (/destinations/french-polynesia/),
  Italy (/destinations/italy/).
BOOK-BY (draft): "For a fall 2027 milestone, start in spring." Why: the smaller
  resorts have only a handful of their best villas.
MARK'S TAKE: The detail people remember is almost never the room category. It's
  the one thing that was planned just for them.
KEEP READING: Maldives: Overwater or Beach? → /travel-journal/maldives-overwater-vs-beach-villa/
P.S.: Referral line.
IMAGES: -hero.jpg (private terrace or overwater deck for two, 1200×525); -journal.jpg
```

### March 2027: adventure without an endurance test

```
MONTH: March 2027   CAMPAIGN: nl-2027-03-easy-adventure   SEND: Thu Mar 4, 2027
SUBJECT: You don't have to summit anything
PREHEADER: Patagonia, Galápagos and the Dolomites at your pace.
HERO: Eyebrow "ACTIVE TRAVEL". Headline "Adventure Without an Endurance Test".
  Intro may nod to readers whose good weekend already starts at a trailhead.
  Button → /experiences/adventure-active-travel/
FEATURE: three ways to be active and still sleep well:
  1) Guided walking with a lodge at the end: Patagonia (/destinations/patagonia/),
     the Dolomites (/destinations/dolomites/)
  2) Wildlife on foot and by boat: Galápagos (/destinations/galapagos/)
  3) Big scenery, short days: Canadian Rockies (/destinations/canadian-rockies/)
  Common thread: support vehicles, choice of distance each day, recovery time
  built in.
BOOK-BY (draft): "Patagonia's 2027–28 season runs roughly November–March:
  decide by early summer." Mark confirms.
MARK'S TAKE: A good guide matters more than the trail. They set the pace to the
  group, not the group to the pace.
KEEP READING: The Private Guide Advantage → /travel-journal/private-guide-advantage/
IMAGES: -hero.jpg (hiker from behind on a wide mountain trail, 1200×525); -journal.jpg
```

### April 2027: a European trip with fewer hotel changes

```
MONTH: April 2027   CAMPAIGN: nl-2027-04-one-region-europe   SEND: Thu Apr 8, 2027
SUBJECT: Less checking out. More being there.
PREHEADER: Tuscany, Provence or Portugal for fall 2027.
HERO: Eyebrow "FALL 2027". Headline "A European Trip With Fewer Hotel Changes".
  Button → /destinations/europe/
FEATURE: three regions you can do properly from one or two bases:
  Tuscany (/destinations/italy/), Provence (/destinations/france/), Portugal
  (/destinations/portugal/). For each: the base, the day trips, and why
  September–October suits it.
BOOK-BY (draft): "September–October 2027: decide by June." Why: the best small
  hotels in these regions have few rooms, and fall is their second peak.
MARK'S TAKE: The most common Europe mistake is five cities in ten days. Two
  bases and a driver beats it every time.
KEEP READING: The European Grand Tour Mistake → /travel-journal/european-grand-tour-mistake/
  (Optional second text link: The Mediterranean in October →
  /travel-journal/mediterranean-october/)
IMAGES: -hero.jpg (hill town or vineyard in soft autumn light, 1200×525); -journal.jpg
```

### May 2027: build a wine-country trip around the table

```
MONTH: May 2027   CAMPAIGN: nl-2027-05-wine-country   SEND: Thu May 6, 2027
SUBJECT: Let the next trip start with dinner
PREHEADER: Start close to home. Go further next year.
HERO: Eyebrow "FOOD & WINE". Headline "Build a Wine-Country Trip Around the
  Table". Button → /experiences/food-wine-travel/
FEATURE: three distances:
  1) Close to home: the Willamette Valley (producers, meals, a driver) →
     /travel-journal/willamette-valley-winery-route/
  2) A long weekend: Napa & Sonoma → /travel-journal/napa-sonoma-winery-route/
  3) The big one for 2028: Tuscany or France → /destinations/italy/,
     /destinations/france/
  Theme: the meals, the producers and the downtime set the itinerary, not the
  tasting count.
BOOK-BY (draft): "Willamette harvest weekends (September–October 2027): book
  lodging and appointments by July." Mark confirms.
MARK'S TAKE: Three tastings a day is the ceiling. The best days have two, a long
  lunch and a nap.
KEEP READING: The Willamette Valley Route → /travel-journal/willamette-valley-winery-route/
P.S.: Referral line.
IMAGES: -hero.jpg (long table set in a vineyard, 1200×525); -journal.jpg
```

### June 2027: river cruise or ocean cruise?

```
MONTH: June 2027   CAMPAIGN: nl-2027-06-river-or-ocean   SEND: Thu Jun 3, 2027
SUBJECT: Choose the cruise by the days you want
PREHEADER: Ports, ship feel, cabins: what actually decides it.
HERO: Eyebrow "CRUISES 2028". Headline "River or Ocean? Start With the Day
  Ashore". Button → /experiences/cruises/
FEATURE: three deciders:
  1) The day ashore: river ships dock in town and you walk off. Ocean ships reach
     coasts and islands, sometimes by tender.
  2) Ship atmosphere: small and quiet, or big with choices.
  3) The cabin: what you'll actually use (balcony, suite, location).
  One line on expedition ships (Galápagos, Antarctica) as a third path.
BOOK-BY (draft): "Spring and fall 2028 river sailings: the best cabin categories
  go first, often a year or more out." Mark confirms.
MARK'S TAKE: Pick the itinerary first and the cruise line second. The ports are
  the trip.
KEEP READING: The Case for Shoulder Season → /travel-journal/the-case-for-shoulder-season/
IMAGES: -hero.jpg (river ship moored at a historic town, 1200×525); -journal.jpg
```

### July 2027: what "all-inclusive" should mean for your trip

```
MONTH: July 2027   CAMPAIGN: nl-2027-07-all-inclusive-checklist   SEND: Thu Jul 8, 2027
SUBJECT: Before you book the all-inclusive
PREHEADER: Eight things to check before you book winter 2027–28.
HERO: Eyebrow "WINTER 2027–28". Headline "What 'All-Inclusive' Should Mean for
  Your Trip". Button → /experiences/all-inclusive-vacations/
FEATURE: the checklist as three grouped items:
  1) Food and drink: à la carte vs. buffet, dinner reservations, which drinks are
     actually included
  2) Getting around: airport transfers, excursions, what costs extra
  3) The room and the crowd: room location, adults-only vs. family, kids' club
     ages
BOOK-BY (draft): "Christmas–New Year's 2027: book by the end of summer." Why:
  holiday weeks at the resorts people actually want fill first.
MARK'S TAKE: "All-inclusive" means very different things at different resorts.
  The questions above find the difference before you arrive, not after.
KEEP READING: What Hotel Descriptions Actually Mean → /travel-journal/what-hotel-descriptions-actually-mean/
IMAGES: -hero.jpg (quiet adults' pool or beach cabana, 1200×525); -journal.jpg
```

### August 2027: turn a bucket-list sporting event into a proper trip

```
MONTH: August 2027   CAMPAIGN: nl-2027-08-event-travel   SEND: Thu Aug 5, 2027
SUBJECT: Build the trip around the event
PREHEADER: The tickets are the easy part. The days around them aren't.
HERO: Eyebrow "2028 EVENTS". Headline "Turn a Bucket-List Event Into a Proper
  Trip". Button → /experiences/sports-event-travel/
FEATURE: three 2028 events, each with stay, transfers and the days around it:
  1) The LA28 Summer Olympics (July 2028)
  2) The Masters (April 2028) → /travel-journal/the-masters/
  3) The Kentucky Derby (May 2028) → /travel-journal/kentucky-derby/
  REQUIRED wording: admission comes only through official or authorized
  channels. HYMT arranges travel, stays and authorized hospitality, not tickets.
  Mark confirms event dates before send.
BOOK-BY (draft): "Spring and summer 2028 events: start now. Hospitality and
  nearby hotels commit up to a year or more out." Mark confirms per event. (The
  site's Formula 1 page says the best Grand Prix seats commit 6–18 months out,
  but that's a Grand Prix figure. Don't apply it to other events.)
MARK'S TAKE: The event is one day. The trip is the five days around it. Plan
  those as carefully as the seat.
KEEP READING: The Masters at Augusta National → /travel-journal/the-masters/
P.S.: Referral line.
IMAGES: -hero.jpg (stadium or course atmosphere with no logos or trademarks,
  1200×525); -journal.jpg
```

### September 2027: cherry blossoms or autumn leaves? (new)

```
MONTH: September 2027   CAMPAIGN: nl-2027-09-japan-seasons   SEND: Thu Sep 9, 2027
SUBJECT: Cherry blossoms or autumn leaves?
PREHEADER: The best ryokan for April 2028 book about now.
HERO: Eyebrow "JAPAN 2028". Headline "Cherry Blossoms or Autumn Leaves?".
  Button → /destinations/japan/
FEATURE: three items: April (cherry blossom: the famous one, the crowds, the
  booking pressure), November (autumn foliage: quieter and nearly as fine), and
  how to choose (crowds, weather, what else is on the route).
BOOK-BY: "April 2028: the best ryokan book about twelve months out, which means
  now." (Source: Kyoto in April vs. November.)
MARK'S TAKE: If the dates are flexible, November is the better-kept secret. If
  it has to be cherry blossom, decide this month.
KEEP READING: Kyoto in April vs. November → /travel-journal/kyoto-april-vs-november/
IMAGES: -hero.jpg (Kyoto temple with seasonal color, no crowds, 1200×525); -journal.jpg
```

### October 2027: your 2028 travel calendar (new)

```
MONTH: October 2027   CAMPAIGN: nl-2027-10-2028-calendar   SEND: Thu Oct 7, 2027
SUBJECT: What to book now for 2028
PREHEADER: Safari, polar, Japan, holidays: the book-by dates.
HERO: Eyebrow "ONE YEAR OF NOTES". Headline "Your 2028 Travel Calendar: What to
  Book When". Short thank-you for a year of reading. Button → /plan-your-trip/
FEATURE: three seasons of book-by guidance (a scannable list, still single
  column):
  1) Book now: July–Oct 2028 safari; Antarctica and polar 2028–29
     (/travel-journal/polar-destination-guide/); summer 2028 family villas
  2) Book this winter: fall 2028 Europe; 2028 events
  3) Book by spring: winter 2028–29 beaches and holidays
  Each line links to that month's 2026–27 topic page.
BOOK-BY: none this month (the whole email is the book-by).
MARK'S TAKE: Thank you, and ask: "What should I write about next year? Reply
  with one word." Their replies become next year's plan.
KEEP READING: The Case for Shoulder Season → /travel-journal/the-case-for-shoulder-season/
P.S.: Thank-you plus referral.
IMAGES: -hero.jpg (open planner or map with travel details, warm light, 1200×525); -journal.jpg
```

---

## Part 4: review checklist before export

- [ ] One column throughout. Nothing sits side by side.
- [ ] No "When I…" or "my stay" lines. Mark only advises.
- [ ] The Book-by line is confirmed by Mark and dated.
- [ ] Every hymtravel.com link has the month's `utm_campaign`.
- [ ] Every image has alt text and an exact `nl-YYYY-MM-` filename.
- [ ] The footer has the real mailing address and Reach's unsubscribe block is
      the last element.
- [ ] Body copy is 350–500 words. No prices, no urgency language, no
      placeholders.
- [ ] The subject and preheader match the brief. Set the preheader in the Reach
      wizard too.
