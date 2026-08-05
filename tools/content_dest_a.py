#!/usr/bin/env python3
"""Destination content — Portugal, Spain, UK & Ireland."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from new_destinations import save

PORTUGAL = {
  "short": "Portugal", "cta_article": "a",
  "parent": ("Europe", "/destinations/europe/"),
  "eyebrow": "Southern Europe",
  "headline": "Europe's Quietest<br>Great Destination",
  "hero_sub": "Portugal delivers what the rest of Western Europe keeps promising — extraordinary food, serious wine, golden light, and hotels worth the journey — at a pace and price that feel like a different decade.",
  "intro_label": "The Country",
  "intro_title": "Small Country. Outsized Table.",
  "intro_paras": [
    "Portugal is compact enough to drive end to end in five hours and deep enough to fill three weeks without repetition. Lisbon's tiled hills and late-night tasca culture, Porto's riverside wine lodges, the Douro's terraced vineyards, the Alentejo's cork-oak plains, and the Algarve's cliff-backed coves — each is a distinct trip, and all of them connect easily.",
    "The planning variable is timing and routing, not finding things to do. Portugal in August means queues at the famous places and heat in the Alentejo; Portugal in May or October means the same light, the same tables, and half the competition for both. The country rewards travelers who sequence it properly — and it forgives almost everything else."
  ],
  "intro_image_ph": "Destination Photography<br>Douro Valley · Portugal",
  "intro_image_label": "Douro Valley · Portugal",
  "places_title": "Five Regions Worth Planning Properly",
  "places_sub": "Each offers a different Portugal. Most trips combine two or three — Lisbon plus one is the classic structure.",
  "places": [
    {"featured": True, "bg": "#141a10", "ph": "Destination Photography · Lisbon", "region": "The Capital", "name": "Lisbon",
     "desc": "The city that rewards walkers and eaters in equal measure. Skip the tram queues; the version worth having is a tasca crawl through Mouraria with a food guide who grew up there, dinner at a chef's counter that's booked six weeks out, and a morning at the market before the crowds. Two to three nights, no more."},
    {"bg": "#101820", "ph": "Destination Photography · Douro Valley", "region": "Wine Country", "name": "The Douro Valley",
     "desc": "The world's oldest demarcated wine region — terraced vineyards dropping to the river, quintas that have made port for two centuries, and harvest season (September) when the whole valley smells of must. Stay at a working quinta, taste at the lodges in Vila Nova de Gaia by private arrangement, and take the slow train back along the river."},
    {"bg": "#0e1c24", "ph": "Destination Photography · Porto", "region": "The North", "name": "Porto",
     "desc": "Lisbon's moodier sibling — granite, azulejos, and the port wine lodges stacked along the Gaia riverfront. Francesinha for the brave, serious contemporary restaurants for everyone, and the Lello bookstore before opening hours. Two nights, paired naturally with the Douro."},
    {"bg": "#14202c", "ph": "Destination Photography · Alentejo", "region": "The Interior", "name": "The Alentejo",
     "desc": "Portugal's slow heartland — cork oaks, black pigs, megalithic stones, and some of the country's best wines made in near-obscurity. Évora for a night, a herdade (estate hotel) for two, and dinners that run long because there's nowhere else to be. The connoisseur's Portugal."},
    {"bg": "#101c26", "ph": "Destination Photography · Algarve", "region": "The Coast", "name": "The Algarve, Western End",
     "desc": "Skip the central resort strip. The western Algarve — Sagres, Salema, the Costa Vicentina — keeps the dramatic cliff-backed coves and working fishing towns, loses the crowds. Best May–June and September, when the sea is warm and the summer pressure is off."}
  ],
  "itins_sub": "The classic structures we build on — always reshaped around your dates and table preferences.",
  "itineraries": [
    {"bg": "#141a10", "ph": "Journey Photography<br>Lisbon + Douro", "when": "May – October · 8–10 days", "name": "Lisbon, Porto & the Douro",
     "desc": "The essential first Portugal: three nights in Lisbon with a food guide, the river train to Porto, two nights among the lodges, and two at a working quinta in the valley during or just before harvest. The country's greatest hits without ever feeling rushed.",
     "meta1": "Portugal", "meta2": "8–10 Days"},
    {"bg": "#101820", "ph": "Journey Photography<br>Alentejo Slow Week", "when": "April – June, Sept – Oct · 7 days", "name": "The Slow Alentejo",
     "desc": "For return visitors and deliberate travelers: Évora's Roman bones, a wine estate with a serious cellar, village lunches that start at 1pm and end at 4, and star-fields the Alentejo's dark-sky reserve is famous for. The trip that resets your metabolism.",
     "meta1": "Alentejo", "meta2": "7 Days"}
  ],
  "why_title": "What We Add to Portugal Planning",
  "why_sub": "Portugal looks easy to plan. The difference between a good trip and a great one is in the tables, the timing, and the quintas.",
  "why": [
    {"title": "Table Reservations That Matter", "desc": "Lisbon and Porto's best small restaurants take bookings weeks out and don't hold tables for walk-ins. We book the counters and tascas we've eaten at ourselves — and tell you which famous names to skip."},
    {"title": "Quinta Relationships", "desc": "The Douro's best wine estates don't run public tours worth having. Our visits are private: the cellar, the winemaker when he's there, and a lunch on the terrace that the booking engines don't offer."},
    {"title": "Routing That Saves a Day", "desc": "Lisbon–Porto–Douro looks simple and hides traps: wrong stations, wrong train times, a drive that eats a day if sequenced badly. We route it so the travel itself is part of the trip — the river train, not the highway."},
    {"title": "Season Honesty", "desc": "August in the Algarve and July in the Alentejo are not what the photos promise. We tell you when your dates work, when they don't, and what to do about it — including when the answer is 'same trip, three weeks later.'"}
  ],
  "seasons_title": "Portugal by Season",
  "seasons_sub": "The country is year-round; the version you want depends on what you're eating, drinking, and avoiding.",
  "seasons": [
    {"name": "Late Spring & Early Fall", "months": "May – June · Sept – Oct", "desc": "The connoisseur's windows: warm light, working cities, harvest energy in the Douro from September, and tables available at the places that matter.", "best": True},
    {"name": "High Summer", "months": "July – August", "desc": "Beach weather at its best — and crowds at their worst. The Algarve and Lisbon's famous spots compress; the interior stays quiet. Plan early and go west."},
    {"name": "Winter", "months": "November – March", "desc": "Mild, green, and genuinely local. Rain in the north, crisp sun in the south, and the cities returned to their residents. The best value window of the year."}
  ],
  "testimonial": "Mark routed us Lisbon to the Douro by the river train with a quinta stay we'd never have found. The winemaker joined us for lunch. That's not a booking engine trip — that's knowing a place.",
  "testimonial_attr": "Portugal Clients · September Harvest, 2024",
  "mark_title": "On Portugal",
  "mark_quote": "Portugal is the destination I recommend most often to people who say they've 'done Europe.' It has everything Italy has — the food culture, the wine, the light, the layers of history — with a tenth of the performance around it. The tasca owner who sits down at your table to explain the dish isn't doing it for a review score; that's just how the country works. The mistake people make is treating it as a weekend add-on. Lisbon deserves three nights. The Douro deserves harvest season. And the Alentejo — the Alentejo is where I send people who ask where I go myself.",
  "cta_title": "Plan a Portugal Trip<br>Built Around the Table",
  "cta_sub": "Tell me your dates, your appetite for wine country versus coast, and whether this is a first visit or a return. I'll come back with a route, quinta recommendations, and the tables to book — within one business day.",
  "faq_sub": "Questions we hear most when planning Portugal trips.",
  "faqs": [
    ("How many days does Portugal need?", "Eight to ten for the classic Lisbon–Porto–Douro triangle; five or six for Lisbon plus one region; two weeks to add the Alentejo and Algarve properly. It's compact — but the pace is the point. Rushing Portugal misses Portugal."),
    ("Is Portugal good for food-focused travelers?", "It's one of Europe's best eating destinations, full stop. The tasca culture in Lisbon, Porto's contemporary scene, Alentejo's pork and wine, and seafood everywhere along the coast. The key is booking the small places ahead — the best seats are counters of ten."),
    ("When is the Douro harvest?", "Typically September into early October, varying by year and grape. It's the valley's most atmospheric window — picking, lagares (foot-treading), and the smell of fermentation everywhere. Harvest visits book out; plan six months ahead."),
    ("Can Portugal combine with Spain?", "Naturally — Lisbon with Andalusia, or Porto with Galicia. We route it so the border is invisible: the Minho crossing into Galicia's Rías Baixas is one of Iberia's great drives. Ten days minimum to do both countries justice."),
    ("Is Portugal family-friendly?", "Genuinely. The Portuguese are warm with children in restaurants, the beaches are safe, and the pace suits families. We'd steer families toward the western Algarve or a quinta with a pool over city marathons."),
    ("What should I skip?", "The famous tram, the timed palace entry at peak hours, and any restaurant with a tout outside. Portugal's pleasures are working ones — markets, tascas, quintas, and coastline. We'll mark the tourist traps on your map so you can walk around them.")
  ]
}

if __name__ == "__main__":
    save("portugal", PORTUGAL)
