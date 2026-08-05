#!/usr/bin/env python3
"""Destination content — Napa & Sonoma."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from new_destinations import save

NAPA = {
  "short": "Napa & Sonoma", "cta_article": "a",
  "parent": ("North America", "/destinations/north-america/"),
  "eyebrow": "California Wine Country",
  "headline": "America's Wine Country,<br>Done Privately",
  "hero_sub": "The valley's famous names run tasting rooms like theme parks. The version we plan is different: small producers who open their homes, vineyard lunches among the vines, and harvest-season energy you can't schedule around.",
  "intro_label": "The Region",
  "intro_title": "Two Valleys. Very Different Tempers.",
  "intro_paras": [
    "Napa is polish: the iconic estates along Highway 29, the Michelin-starred tables, cabernet that built American wine's reputation. Sonoma is its relaxed sibling: fog-cooled pinot and chardonnay near the coast, farm-to-table everything, and tasting rooms where the person pouring made the wine. Most travelers want both — the art is the sequence and the appointments.",
    "The key to wine country is access and pacing. The great small producers don't have tasting rooms — they have kitchen tables, and you visit by relationship. Three wineries a day is the ceiling; four is a mistake. And the valley in harvest season (September–October) is a different, more alive place than the valley in February."
  ],
  "intro_image_ph": "Destination Photography<br>Napa Valley Harvest",
  "intro_image_label": "Napa Valley · California",
  "places_title": "Where to Base and What to Book",
  "places_sub": "The valley rewards three or four nights — long enough to slow down, short enough to stay hungry for it.",
  "places": [
    {"featured": True, "bg": "#141a10", "ph": "Destination Photography · Napa Valley", "region": "Napa", "name": "The Valley Floor",
     "desc": "St. Helena as the base — walkable, central, and home to the valley's best tables. Days built around private appointments at small producers on Spring Mountain and Howell Mountain, with a vineyard lunch in between. The classic first Napa, done properly."},
    {"bg": "#101820", "ph": "Destination Photography · Sonoma Coast", "region": "Sonoma", "name": "The Sonoma Coast & Russian River",
     "desc": "Fog rolling through redwoods, pinot noir from the ridge vineyards, and oyster shacks on Tomales Bay. Slower, greener, and more local than Napa — the valley people fall for on their second visit. Pair with Healdsburg's plaza."},
    {"bg": "#0e1c24", "ph": "Destination Photography · Healdsburg", "region": "Sonoma", "name": "Healdsburg",
     "desc": "The most livable town in wine country — a real plaza, three-star dining, and three AVAs (Russian River, Dry Creek, Alexander Valley) within twenty minutes. The connoisseur's base for a Sonoma-focused trip."}
  ],
  "itins_sub": "The structures we refine around your palate and dates.",
  "itineraries": [
    {"bg": "#141a10", "ph": "Journey Photography<br>Napa Harvest Week", "when": "September – October · 4–5 days", "name": "Harvest in the Valley",
     "desc": "The valley at its most alive: crush pads running, pickers in the rows at dawn, and dinners celebrating the new vintage. Private appointments at estates that open only in season, a harvest lunch among the vines, and a morning balloon over the valley if the fog allows.",
     "meta1": "Napa Valley", "meta2": "4–5 Days"},
    {"bg": "#101820", "ph": "Journey Photography<br>Sonoma Slow Weekend", "when": "Year-round · 3–4 days", "name": "The Sonoma Slow Weekend",
     "desc": "Healdsburg as the base, the Russian River's pinot producers by private appointment, oysters and Dungeness crab on Tomales Bay, and a redwood walk between tastings. The reset weekend, wine-country edition.",
     "meta1": "Sonoma", "meta2": "3–4 Days"}
  ],
  "why_title": "What We Add to Wine Country Planning",
  "why_sub": "Wine country looks drive-up easy. The best of it is by appointment only — and the appointments are the trip.",
  "why": [
    {"title": "Producer Relationships", "desc": "The tastings worth having aren't bookable online. We arrange private appointments with small producers — the ones making 500 cases on a mountainside — where the person across the table made the wine."},
    {"title": "Pacing Discipline", "desc": "Three wineries a day, with lunch that matters in the middle. The classic mistake is five tastings and a blur by 4pm. Wine country rewards restraint — and a driver, always."},
    {"title": "The Tables", "desc": "The French Laundry opens reservations in fierce windows; Single Thread and the valley's other great tables follow suit. We track the booking calendars and strike when they open."},
    {"title": "Harvest Timing", "desc": "September and October transform the valley — but crush dates shift with the weather each year. We track the season and time your visit to the energy, not just the calendar."}
  ],
  "seasons_title": "Wine Country by Season",
  "seasons_sub": "Each season is a different valley. Harvest is the famous one; the others have their own arguments.",
  "seasons": [
    {"name": "Harvest", "months": "September – October", "desc": "Crush season: the valley smells of fermentation, the energy is electric, and the light goes amber. The most alive window — book months ahead.", "best": True},
    {"name": "Spring & Mustard Bloom", "months": "February – April", "desc": "Yellow mustard between the vines, green hills, and tasting rooms at their calmest. The photographer's season and the value season combined."},
    {"name": "Summer", "months": "June – August", "desc": "Warm days, cool mornings, and long evenings on the terrace. The busiest season — the right appointments and early starts make all the difference."}
  ],
  "testimonial": "Every tasting was private, at producers we'd never heard of, and better than the famous names we'd planned the trip around. Mark's version of Napa is a different valley.",
  "testimonial_attr": "Napa Valley Clients · Harvest 2024",
  "mark_title": "On Wine Country",
  "mark_quote": "Napa's famous tasting rooms are fine — but they're the lobby, not the building. The valley I know is a winemaker pouring barrel samples on a mountain you can't find without directions, lunch at a picnic table between the rows, and three wineries a day instead of five because the fourth conversation is the one you'll remember. Go in harvest if you can — the valley smells like wine being made, which sounds obvious and is somehow still surprising. And hire the driver. The whole point is what's in the glass.",
  "cta_title": "Plan a Wine Country Trip<br>Worth Tasting",
  "cta_sub": "Tell me your dates, your palate (cabernet country or pinot coast?), and whether this is a first visit or a return. I'll come back with producers, tables, and a base — within one business day.",
  "faq_sub": "Questions we hear most when planning Napa and Sonoma trips.",
  "faqs": [
    ("Napa or Sonoma?", "Both, ideally — they're thirty minutes apart and tempermentally opposite. Napa for the iconic cabernet estates and polish; Sonoma for fog-cooled pinot, farm culture, and ease. First visit: base in St. Helena, day-trip to Healdsburg. Return visit: flip it."),
    ("How many wineries per day?", "Three. Two before lunch, one after — with lunch that matters in between. Four tastings becomes a blur; five is a chore. The best visits run long because the winemaker starts telling stories, and you want room for that."),
    ("Do I need a driver?", "Yes — and not for the obvious reason alone. A good driver knows the back roads, the appointment etiquette, and when to suggest the extra stop. Rideshare exists in the valley but thins out on the mountains, where the best producers are."),
    ("When do the great restaurants open reservations?", "The French Laundry releases tables about two months out and they go in minutes. Single Thread and the other top tables have their own calendars. We track the windows and book the moment they open — it's part of the service."),
    ("Is harvest really worth the premium?", "If wine is the point of the trip — yes. The valley is working, the energy is different, and the light is at its best. If you want calm and value, February's mustard season is the insider answer."),
    ("Can families do wine country?", "Better than its reputation suggests — several estates welcome families with gardens, animals, and picnic space, and Sonoma's farm culture suits kids naturally. We'll design it so the adults taste and the kids still have a trip.")
  ]
}

if __name__ == "__main__":
    save("napa-sonoma", NAPA)
