#!/usr/bin/env python3
"""Destination content — UK & Ireland."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from new_destinations import save

UK_IRELAND = {
  "short": "UK & Ireland", "cta_article": "a",
  "parent": ("Europe", "/destinations/europe/"),
  "eyebrow": "Northern Europe",
  "headline": "Castles, Coast,<br>and Proper Tables",
  "hero_sub": "London done deeply, the Highlands by private driver, Ireland's west coast at its wildest, and country-house hotels that invented the category. The British Isles reward travelers who get out of the cities — and know which rooms to book when they do.",
  "intro_label": "The Region",
  "intro_title": "Two Islands. A Lifetime of Roads.",
  "intro_paras": [
    "The UK and Ireland share a language and a sea, but travel very differently. England is country houses, garden tours, and London's restaurant renaissance. Scotland is single-track roads, whisky distilleries, and landscape on a scale that surprises first-timers. Ireland is the warmest welcome in Europe wrapped around the Atlantic's most dramatic coastline.",
    "The planning skill is routing: these islands look small and drive slow. The classic mistakes are too many one-night stops and underestimating distances on rural roads. We build trips with two and three-night bases, private drivers where the roads deserve your eyes instead of your hands, and the rooms — castle, manor, lighthouse keeper's cottage — that become the stories you tell."
  ],
  "intro_image_ph": "Destination Photography<br>Scottish Highlands",
  "intro_image_label": "The Highlands · Scotland",
  "places_title": "Six Bases Worth Planning Around",
  "places_sub": "Each anchors a different version of the islands. Most trips combine two with a city bookend.",
  "places": [
    {"featured": True, "bg": "#141a10", "ph": "Destination Photography · Scottish Highlands", "region": "Scotland", "name": "The Highlands & Skye",
     "desc": "Glencoe's valleys, the road to Skye, Eilean Donan at dusk, and distilleries that have made whisky the same way for two centuries. A private driver-guide turns the single-track roads from stress into cinema. Four days minimum; the weather is part of the show."},
    {"bg": "#101820", "ph": "Destination Photography · Ireland West Coast", "region": "Ireland", "name": "The Wild Atlantic Way",
     "desc": "Ireland's west coast from Donegal to Kerry — the Cliffs of Moher at opening time, Dingle's pubs with actual sessions, Connemara's light, and country houses like Ballyfin and Ashford Castle as the bookends. The warmest version of dramatic landscape anywhere."},
    {"bg": "#0e1c24", "ph": "Destination Photography · London", "region": "England", "name": "London, Properly",
     "desc": "Not the tourist circuit — the London of serious restaurants, neighborhood markets, private gallery tours, and theatre booked before you fly. Two to three nights with a driver for the day trips (Oxford, Bath, the Cotswolds) that complete the picture."},
    {"bg": "#14202c", "ph": "Destination Photography · Cotswolds", "region": "England", "name": "The Cotswolds",
     "desc": "Honey-stone villages, garden tours, and manor-house hotels with proper afternoon tea — the England of the imagination, delivered. Best with a driver or a brave left-hand-drive attitude, and two nights minimum to let the pace work."},
    {"bg": "#101c26", "ph": "Destination Photography · Edinburgh", "region": "Scotland", "name": "Edinburgh",
     "desc": "The castle on its rock, the New Town's Georgian elegance, and a restaurant scene that's quietly become one of Britain's best. August brings the Festival (book a year out); the rest of the year brings the city at its own pace. The natural Highlands gateway."},
    {"bg": "#122029", "ph": "Destination Photography · Dublin", "region": "Ireland", "name": "Dublin",
     "desc": "Trinity's Long Room, the serious side of Temple Bar's neighbors, and the literary pub tour that earns its cliché. Two nights, then west — Dublin is the arrival lounge for the Atlantic coast, not the destination."}
  ],
  "itins_sub": "The classic structures — always rebuilt around your dates, your driver preference, and your castle tolerance.",
  "itineraries": [
    {"bg": "#141a10", "ph": "Journey Photography<br>Scotland Grand Route", "when": "May – September · 9–12 days", "name": "Scotland: City to Summit",
     "desc": "Edinburgh for two nights, into the Highlands by private driver — Glencoe, Skye, and a castle stay — finishing at a distillery with a cask tasting arranged. The full drama of Scotland without touching a steering wheel.",
     "meta1": "Scotland", "meta2": "9–12 Days"},
    {"bg": "#101820", "ph": "Journey Photography<br>Ireland Atlantic Route", "when": "May – September · 10–12 days", "name": "Ireland's Atlantic Edge",
     "desc": "Dublin to Donegal, down the Wild Atlantic Way through Connemara, Clare, and Kerry, with nights at the country's great houses and a guide for the stretches that deserve stories. Ireland at its warmest and wildest.",
     "meta1": "Ireland", "meta2": "10–12 Days"}
  ],
  "why_title": "What We Add to UK & Ireland Planning",
  "why_sub": "The islands are easy to reach and easy to underestimate. The difference is routing, drivers, and rooms.",
  "why": [
    {"title": "Private Drivers & Guides", "desc": "On single-track Highland roads and boreens in Kerry, a driver-guide transforms the trip: you watch the landscape, they handle the logistics, and the stories come free. We book the ones we've traveled with."},
    {"title": "Castle & Manor Rooms", "desc": "The great country houses book out for summer and Christmas far ahead — and room categories vary wildly within the same castle. We know which tower room is worth it and which 'estate view' faces the car park."},
    {"title": "Realistic Routing", "desc": "These islands drive slow. We build two and three-night bases instead of a new bed every night — the trip you remember is the one with time for the second walk and the third pub."},
    {"title": "Season & Festival Timing", "desc": "Edinburgh in August, the Chelsea Flower Show, Wimbledon, the Highland games — the right event elevates a trip; the wrong week fills every hotel. We plan the calendar first, the route second."}
  ],
  "seasons_title": "UK & Ireland by Season",
  "seasons_sub": "The weather is a participant, not an obstacle. The season shapes which version of the islands you get.",
  "seasons": [
    {"name": "Late Spring & Summer", "months": "May – September", "desc": "The long light (10pm sunsets in the Highlands), the gardens at full show, and the best odds on dry walking weather. Book early — the great houses fill.", "best": True},
    {"name": "Autumn", "months": "October – November", "desc": "Bracken turns the Highlands copper, the crowds thin to nothing, and the pubs get serious. The photographer's season, at lower rates."},
    {"name": "Winter & Christmas", "months": "December – March", "desc": "Castle hotels do Christmas properly — fires, feasts, frost on the lawns. Deep winter is for city trips and whisky; the rural roads reward patience."}
  ],
  "testimonial": "Mark put us in a castle outside Inverness with a driver named Hamish who knew every glen and every story. We didn't drive a mile, and we saw more of Scotland than friends who'd been three times.",
  "testimonial_attr": "Scotland Clients · September 2024",
  "mark_title": "On the British Isles",
  "mark_quote": "People plan the UK and Ireland like a checklist — London, Edinburgh, Dublin, a castle somewhere — and end up with a blur of one-night stands and motorways. The islands don't work that way. The magic is in the slow parts: the third night in the same Highland hotel when the weather finally breaks, the pub in Dingle where the session starts because someone recognized you from yesterday. Book fewer beds. Hire the driver. Stay in the castle that's actually old, not the one with the new spa wing. That's the whole formula.",
  "cta_title": "Plan Your Trip<br>to the Isles",
  "cta_sub": "Tell me which island pulls at you, your dates, and your castle ambitions. I'll come back with a route, driver options, and the rooms to book — within one business day.",
  "faq_sub": "Questions we hear most when planning UK and Ireland trips.",
  "faqs": [
    ("Should I drive myself or hire a driver?", "In the Highlands and rural Ireland, hire the driver — the single-track roads demand attention you should be giving the landscape, and a good driver-guide adds stories you can't rent a car with. In England's countryside, confident drivers do fine; we'll route around the stressful bits."),
    ("How do I combine England, Scotland, and Ireland?", "Honestly: two of the three in a standard trip. London plus Highlands, or Dublin plus the west coast, or London–Edinburgh by train. All three needs two weeks and a tolerance for travel days. We'll tell you which pairing makes sense for your dates."),
    ("Are the castle hotels worth it?", "The great ones, absolutely — Ashford Castle, Inverlochy, Ballyfin are experiences unto themselves. The key is room selection within the castle and knowing which 'castle hotels' are really conference venues with turrets. We know the difference."),
    ("What's the best time for Scotland?", "May–June and September for the light and the midges' absence; August for Edinburgh's festivals if you book a year ahead. The Highlands in any season — the weather is part of the drama, and the hotels have fires for a reason."),
    ("How far ahead should we book?", "Six months for summer travel and the great country houses; a full year for Edinburgh in August or Christmas at a castle. The islands' best rooms are few, and the world has discovered them."),
    ("Is it good for families?", "Excellent — castles, falconry, boat trips, and pub gardens that welcome children. The UK and Ireland are the easiest European destinations for multigenerational trips; everyone finds their register.")
  ]
}

if __name__ == "__main__":
    save("uk-ireland", UK_IRELAND)
