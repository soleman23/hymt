#!/usr/bin/env python3
"""Destination content — Spain."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from new_destinations import save

SPAIN = {
  "short": "Spain", "cta_article": "a",
  "parent": ("Europe", "/destinations/europe/"),
  "eyebrow": "Southern Europe",
  "headline": "Not One Country.<br>Five Cuisines.",
  "hero_sub": "Spain is really several nations sharing a peninsula — Basque pintxos culture, Catalan modernism, Andalusian heat and Moorish geometry, Galician seafood, Rioja's wine country. The mistake is trying to see it all. The skill is choosing.",
  "intro_label": "The Country",
  "intro_title": "Depth Over the Greatest Hits.",
  "intro_paras": [
    "The standard Spain itinerary — Madrid, Barcelona, Seville in eight days — produces a slideshow version of a country that deserves a meal-by-meal approach. Spain's pleasures are local and specific: the pintxos crawl in San Sebastián's old town, the sherry bodegas of Jerez, the menú del día at a village asador, the hour when Granada's Alhambra empties and the light goes gold.",
    "We plan Spain by region and by table. One region done deeply beats three done superficially — and Spain's high-speed rail makes two regions practical without ever seeing an airport. The variables that matter: which region, which season, and which tables are worth building the days around."
  ],
  "intro_image_ph": "Destination Photography<br>San Sebastián · Spain",
  "intro_image_label": "Basque Country · Spain",
  "places_title": "Five Spains Worth Choosing Between",
  "places_sub": "Each region is a distinct trip. First-timers should pick one or two — not all five.",
  "places": [
    {"featured": True, "bg": "#141a10", "ph": "Destination Photography · San Sebastián", "region": "The North", "name": "Basque Country",
     "desc": "The highest concentration of great eating on earth. San Sebastián's pintxos bars and Michelin counters, the fishing villages along the coast, Rioja's wineries an hour south, and Bilbao's Guggenheim as the cultural anchor. Four days minimum, elastic waistband recommended."},
    {"bg": "#101820", "ph": "Destination Photography · Andalusia", "region": "The South", "name": "Andalusia",
     "desc": "Seville's alcázar and triana tiles, Córdoba's mosque-cathedral, Granada's Alhambra — the Moorish layer of European history at its most intact. Plus sherry in Jerez and jamón in the Sierra de Aracena. Best March–May and October–November; summer heat is real."},
    {"bg": "#0e1c24", "ph": "Destination Photography · Barcelona", "region": "Catalonia", "name": "Barcelona & the Costa Brava",
     "desc": "Gaudí's city plus the rugged coves north toward France — Cadaqués, where Dalí lived, and seafood lunches in working harbors. Barcelona rewards the early-entry strategy at the famous sites; the Costa Brava rewards a slow car and an appetite."},
    {"bg": "#14202c", "ph": "Destination Photography · Rioja", "region": "Wine Country", "name": "Rioja & the Interior",
     "desc": "Spain's classic wine region — medieval Laguardia, the architectural wineries (Gehry's Marqués de Riscal, Calatrava's Ysios), and asadores serving lamb roasted over vine cuttings. Pairs naturally with the Basque Country for the definitive northern week."},
    {"bg": "#101c26", "ph": "Destination Photography · Galicia", "region": "The Northwest", "name": "Galicia",
     "desc": "Spain's green, rain-washed corner — the best seafood in Europe (percebes, pulpo, razor clams), the Rías Baixas' Albariño country, and Santiago de Compostela at the end of the Camino. For travelers who've done the famous Spain and want the real one."}
  ],
  "itins_sub": "Starting structures, always rebuilt around your dates and appetite.",
  "itineraries": [
    {"bg": "#141a10", "ph": "Journey Photography<br>Basque + Rioja", "when": "May – October · 7–9 days", "name": "The Northern Table",
     "desc": "San Sebastián for three nights of pintxos and one extraordinary tasting menu, into Rioja for winery architecture and asador lunches, finishing in Bilbao. The best week of eating in Europe, with the walks to justify it.",
     "meta1": "Northern Spain", "meta2": "7–9 Days"},
    {"bg": "#101820", "ph": "Journey Photography<br>Andalusia Triangle", "when": "March – May, Oct – Nov · 8–10 days", "name": "Andalusia Properly",
     "desc": "Seville as the base, Córdoba as a day, Granada for the Alhambra with early entry, and two nights in Jerez for sherry and horses. The Moorish triangle at the right pace, with the tables booked before you land.",
     "meta1": "Andalusia", "meta2": "8–10 Days"}
  ],
  "why_title": "What We Add to Spain Planning",
  "why_sub": "Spain's logistics are easy. Its best experiences are not — they're booked, timed, and sequenced by people who know them.",
  "why": [
    {"title": "The Tables", "desc": "Spain's great restaurants book out weeks to months ahead, and its great casual bars reward local knowledge — what to order at which counter, in what order. We plan the eating before the flights."},
    {"title": "Timed Entry, Done Right", "desc": "The Alhambra, the Sagrada Família, the Prado — the difference between the 9am entry and the 1pm queue is the difference between the place and the crowd. We secure the right slots and build days around them."},
    {"title": "Regional Sequencing", "desc": "Spain's regions don't all combine well in one trip. We tell you honestly when your list is too long — and route the ones that do connect (Basque–Rioja, Seville–Jerez–Granada) so travel days don't eat vacation days."},
    {"title": "Festival Awareness", "desc": "Semana Santa, San Fermín, La Tomatina, the ferias — Spain's festivals are extraordinary or obstructive depending on whether you planned for them. We track the calendar so you're there on purpose, or elsewhere on purpose."}
  ],
  "seasons_title": "Spain by Season",
  "seasons_sub": "Spain's climate varies by region — the south bakes when the north is gentle. Timing follows your route.",
  "seasons": [
    {"name": "Spring & Fall", "months": "April – June · Sept – Oct", "desc": "The right answer for almost every route: warm days, working cities, harvest in the wine country, and tables available with sane lead times.", "best": True},
    {"name": "High Summer", "months": "July – August", "desc": "The north at its best (San Sebastián, Galicia) while the south bakes and empties. Madrid and Seville belong to the heat — go north or wait."},
    {"name": "Winter", "months": "November – March", "desc": "Mild in the south, crisp in the north, and local everywhere. The cities are yours, the menus turn to stews and game, and prices drop across the board."}
  ],
  "testimonial": "We told Mark we wanted to eat well and not rush. He built nine days around San Sebastián and Rioja with reservations at places we couldn't have pronounced, let alone booked. Best trip of our lives, and we've been everywhere.",
  "testimonial_attr": "Northern Spain Clients · October 2024",
  "mark_title": "On Spain",
  "mark_quote": "Spain planning starts with a subtraction conversation. Everyone arrives with the same list — Madrid, Barcelona, Seville, Granada, San Sebastián, eight days — and my job is to ask which meal they're most excited about. Because Spain is a country you eat your way through or you miss. The north is the best eating in Europe. The south is the most beautiful architecture in Europe. They don't fit in the same week. Choose one, do it properly, and Spain will give you a reason to come back for the other — it always does.",
  "cta_title": "Plan a Spain Trip<br>Built Around the Table",
  "cta_sub": "Tell me which region pulls at you, your dates, and how seriously you take lunch. I'll come back with a route and the reservations to make — within one business day.",
  "faq_sub": "Questions we hear most when planning Spain trips.",
  "faqs": [
    ("How do I choose between regions?", "By appetite and interest. Food-first travelers go north (Basque Country, Rioja). Architecture and history go south (Andalusia). Barcelona plus coast suits first-timers who want variety in one place. Galicia is for return visitors who want the Spain Spaniards holiday in."),
    ("Is the Alhambra worth the planning hassle?", "Yes — but only done properly. Timed entry booked weeks ahead, the Nasrid Palaces at the earliest slot, and a guide who can read the inscriptions. Done that way it's one of Europe's great mornings; done casually it's a queue."),
    ("How far ahead do restaurant reservations need to be made?", "The famous counters — months. The excellent everyday places — a few weeks. Spain's dining culture runs late and books deep; we reserve the important tables before your flights are even ticketed."),
    ("Can I do Spain and Portugal together?", "Yes — the natural pairings are Lisbon with Andalusia, or Porto with Galicia. Ten days minimum, two weeks to do it well. We'd rather you did one country properly than two countries at a sprint."),
    ("Is Spain good for families?", "Very — the culture eats late and welcomes children at tables, the beaches are excellent, and the food works for cautious young eaters (tortilla, jamón, churros). We'd pace it slower and lean on the coastal bases."),
    ("What about the festivals?", "Worth building around — Semana Santa in Seville, the April feria, San Sebastián's film festival, harvest in Rioja. Tell us if a festival is the point or an obstacle; the planning differs completely.")
  ]
}

if __name__ == "__main__":
    save("spain", SPAIN)
