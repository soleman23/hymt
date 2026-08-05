#!/usr/bin/env python3
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from new_experiences import save

ROMANCE = {
  "short": "Romance & Celebration",
  "eyebrow": "Honeymoons & Milestones",
  "headline": "The Trip You'll<br>Describe Forever",
  "hero_sub": "A honeymoon, an anniversary, the birthday that deserves more than dinner. These trips carry more weight than any other — and they're the ones where the details absolutely cannot be wrong.",
  "hero_cta1": "Plan My Celebration",
  "intro_label": "Why It Matters",
  "intro_title": "Once. Done Right. Remembered Always.",
  "intro_paras": [
    "Most trips can be good. The honeymoon has to be right — there's no second version of it, and the margin for a disappointing hotel, a mishandled transfer, or a 'romantic dinner' that turns out to be a buffet with candles is exactly zero.",
    "This is the category where our work matters most. The room with the actual private pool, not the plunge pool shared with the deck. The table on the sand that the resort sets once per evening, booked before you arrive. The flight routing that gets you there a day early so the first day of the trip isn't spent recovering from it.",
    "Milestone trips — anniversaries, big birthdays, proposals, the long-overdue trip for two — run on the same principle. They're remembered by their details. We handle the details."
  ],
  "intro_image_ph": "Experience Photography<br>Private Beach Dinner at Dusk",
  "intro_image_label": "Honeymoon · The Maldives",
  "countries_title": "Where Celebrations Belong",
  "countries_sub": "Each delivers a different register of romance — seclusion, drama, warmth, or wonder. The right one depends on the two of you.",
  "countries": [
    {"featured": True, "bg": "#101820", "ph": "Destination Photography · The Maldives", "region": "Indian Ocean", "name": "The Maldives",
     "desc": "The honeymoon benchmark for a reason: a villa over water that's yours alone, a house reef off your deck, and resorts that have raised privacy to an art form. The choice of atoll, villa orientation, and meal plan matters more than the brand name. Best November through April."},
    {"bg": "#0e1c24", "ph": "Destination Photography · Santorini", "region": "Greece", "name": "Santorini & the Aegean",
     "desc": "The caldera view from the right suite, on the quiet side of the island, in May or October when the light is still extraordinary and the crowds are not. We pair it with a slower island — Folegandros, Paros — for the version of Greece the cruise passengers never see."},
    {"bg": "#14202c", "ph": "Destination Photography · Amalfi Coast", "region": "Italy", "name": "The Amalfi Coast",
     "desc": "Positano and Ravello done privately: the cliffside suite, the boat day to Capri with lunch at anchor, the table at the restaurant you'd never get into on your own. September and early October are the connoisseur's months — warm sea, soft light, working towns."},
    {"bg": "#101c26", "ph": "Destination Photography · Bora Bora", "region": "French Polynesia", "name": "Bora Bora",
     "desc": "The postcard that actually delivers — Mount Otemanu from your overwater deck, a lagoon that shifts through four colors by lunch, and a level of quiet that recalibrates you. Worth the long flight for ten days minimum; pairing with Moorea softens the journey."},
    {"bg": "#0f1b24", "ph": "Destination Photography · African Safari", "region": "Africa", "name": "A Safari Honeymoon",
     "desc": "For couples who'd rather be astonished than lounged: private camps where dinner is served in a different location each night, a guide to yourselves, and the kind of silence that only exists in the bush. Botswana and the Serengeti are the classics; Rwanda adds gorillas."},
    {"bg": "#122029", "ph": "Destination Photography · Kyoto", "region": "Japan", "name": "Kyoto in Season",
     "desc": "The connoisseur's romance: a ryokan with a private onsen, kaiseki dinners that unfold over three hours, and temple gardens at the exact two-week window when the maples turn. For couples who find intimacy in beauty rather than beaches."}
  ],
  "events_sub": "The occasion shapes the trip. These are the celebrations we plan most.",
  "events": [
    {"bg": "#101820", "ph": "Experience Photography<br>Overwater Villa · Honeymoon", "when": "Year-round by region · 10–14 days", "name": "The Honeymoon, Full Stop",
     "desc": "Ten days minimum — the trip deserves it. We build in the slow start, the middle adventure, and the ending somewhere that makes leaving hurt a little. Every transfer, table, and room category confirmed before you leave, with a contact who answers if anything shifts.",
     "meta1": "Bespoke", "meta2": "10–14 Days"},
    {"bg": "#0e1c24", "ph": "Experience Photography<br>Anniversary Dinner · Private Terrace", "when": "Year-round · 7–10 days", "name": "The Anniversary Return",
     "desc": "Back to where it started, or somewhere the two of you have been promising yourselves for years. We arrange the dinner that marks the actual evening — the private terrace, the vintage from the year you married, the details that say someone remembered.",
     "meta1": "Milestone", "meta2": "7–10 Days"},
    {"bg": "#14202c", "ph": "Experience Photography<br>Proposal Setting · Secluded Cove", "when": "Year-round · 5–10 days", "name": "The Proposal, Choreographed",
     "desc": "We've planned engagements on sandbanks, in vineyard rows, on the deck of a gulet at anchor. The setting, the timing, the photographer who appears to be a passing tourist, and the celebration dinner already booked. You only have to ask.",
     "meta1": "Proposal", "meta2": "5–10 Days"},
    {"bg": "#101c26", "ph": "Experience Photography<br>Milestone Birthday · Private Villa", "when": "Year-round · 7–12 days", "name": "The Birthday Worth the Flight",
     "desc": "Fifty, sixty, seventy — the birthdays that deserve a place, not just a party. A private villa with the people who matter, a chef for the week, and one evening that's formally celebrated while the rest of the trip stays gloriously unstructured.",
     "meta1": "Celebration", "meta2": "7–12 Days"}
  ],
  "inclusions_title": "What Every Celebration Includes",
  "inclusions_sub": "The visible parts of the trip are the easy half. These are the arrangements that make it feel effortless.",
  "inclusions": [
    {"title": "Room Category Obsession", "desc": "On a honeymoon, the room is not a detail. We know which 'private pool' is actually private, which view is the one in the photographs, and which upgrade is worth ten percent more — and which is worth nothing at all."},
    {"title": "The Arranged Moments", "desc": "The private dinner on the sand, the in-villa breakfast the first morning, the bottle waiting on arrival. We coordinate directly with the property before you travel — you never have to ask for the things that should simply happen."},
    {"title": "Pacing & Recovery", "desc": "The classic honeymoon mistake is doing too much. We build the slow start after the wedding, the decompression day before the long flight home, and a rhythm that lets the trip breathe. Exhausted is not romantic."},
    {"title": "Surprise Logistics", "desc": "For proposals and anniversary surprises, we coordinate with the property and any photographers directly — your partner sees nothing in the confirmations. The choreography stays invisible until the moment it isn't."},
    {"title": "Photography Where It Matters", "desc": "For proposals, honeymoons, and milestone trips, we arrange professional photographers in most destinations — an hour or a day, editorial in style, never a photoshoot that eats the trip."},
    {"title": "A Human on Standby", "desc": "If the flight cancels or the weather turns, you message one person — not a call center. On trips with zero margin for error, that matters more than anything else we arrange."}
  ],
  "seasons_title": "Celebration Season by Destination",
  "seasons_sub": "The same destination in the wrong month can quietly diminish the occasion. Timing is the first conversation.",
  "seasons": [
    {"name": "Maldives & Indian Ocean", "months": "November – April", "desc": "The dry northeast monsoon: calm seas, clear water, and the best visibility for the house reef. December through March is the peak window — book six months out.", "best": True},
    {"name": "The Mediterranean", "months": "May – June · Sept – Oct", "desc": "Warm sea, long light, and the towns still working. Santorini and Amalfi at their most beautiful — without the July and August compression."},
    {"name": "The South Pacific", "months": "May – October", "desc": "The dry season in French Polynesia and Fiji: lower humidity, reliable sun, and the lagoons at their clearest. The long flight rewards at least ten days."}
  ],
  "testimonial": "Mark planned our honeymoon while we were planning a wedding — which is to say, he planned it entirely. The room, the dinners, the boat day we didn't know to ask for. We thought about nothing. That's the whole review.",
  "testimonial_attr": "Honeymoon Clients · The Maldives, 2024",
  "mark_title": "On Celebrations",
  "mark_quote": "I plan honeymoons differently from every other trip, because the stakes are different. A family vacation can survive a mediocre hotel. A honeymoon cannot — you'll describe that room at dinners for the rest of your life. So I'm obsessive about the parts other people gloss over: the orientation of the villa, the first morning after the wedding, the table where you'll have the dinner you remember. And I tell couples the truth about pacing — the temptation is to do everything, and the result is a honeymoon photographed beautifully and experienced exhaustedly. Do less. Stay longer. Let the trip be the honeymoon. That's the whole philosophy, and it's never once been wrong.",
  "cta_title": "Plan the Trip<br>You'll Describe Forever",
  "cta_sub": "Tell me the occasion, the dates, and what the two of you love. I'll come back with a specific destination, property, and the moments we'll arrange — within one business day.",
  "faq_sub": "Questions we hear most when planning honeymoons and milestone trips.",
  "faqs": [
    ("How far ahead should we plan a honeymoon?", "Six to nine months is ideal — the best room categories at the best properties book early, especially for the Maldives, Bora Bora, and safari camps in season. Shorter timelines are workable; we've planned remarkable honeymoons in six weeks. But earlier gives you the rooms everyone else wanted."),
    ("We can't decide between beach, safari, and Europe. How do we choose?", "Start with what you want to feel. Total privacy and decompression points to the Maldives or Bora Bora. Shared adventure points to safari — and nothing bonds two people like the bush. Culture, food, and wandering point to Italy or Japan. Many couples split the trip: five days of safari, five of beach. That combination is hard to beat."),
    ("What does a honeymoon like this typically cost?", "Most of our honeymoon clients invest between $25,000 and $60,000 for ten to fourteen days, depending on destination and season. We design to your actual budget honestly — a perfectly chosen $20,000 trip beats a strained $50,000 one. The first conversation includes real numbers, not vague ranges."),
    ("Can you help with a proposal without my partner finding out?", "Yes — and it's some of the most enjoyable planning we do. All communication runs through you alone; the property, photographer, and any arrangements are coordinated without anything appearing in shared confirmations. Your partner finds out at the moment, not before."),
    ("Is travel insurance worth it for a honeymoon?", "For trips of this value and this importance — yes, genuinely. Not the checkbox kind, but proper coverage for cancellation, medical care abroad, and interruption. We'll walk you through what to look for; it's one of the few boring details that can save an unforgettable trip."),
    ("What if we want to bring kids on an anniversary trip?", "Then we design it as a family trip with romantic structure — a villa with space, a resort with a genuinely good kids' club, and at least one dinner for two that the property arranges childcare around. The occasion still gets its evening.")
  ]
}

if __name__ == "__main__":
    save("romance-celebration-travel", ROMANCE)
