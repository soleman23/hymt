#!/usr/bin/env python3
"""Destination content — Canadian Rockies."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from new_destinations import save

CANADIAN_ROCKIES = {
  "short": "Canadian Rockies", "cta_article": "a",
  "parent": ("North America", "/destinations/north-america/"),
  "eyebrow": "Western Canada",
  "headline": "The Alps Without<br>the Crowds",
  "hero_sub": "Banff, Lake Louise, and Jasper deliver mountain scenery on a scale that rivals Switzerland — turquoise lakes, hanging glaciers, and wildlife that walks through town — with a fraction of the European crowds and none of the jet lag for North Americans.",
  "intro_label": "The Region",
  "intro_title": "Three Parks. One Great Road.",
  "intro_paras": [
    "The Canadian Rockies run along the Continental Divide through Banff and Jasper National Parks, connected by the Icefields Parkway — 144 miles that rank among the world's great drives. Turquoise lakes (Moraine, Louise, Peyto), the Columbia Icefield, and valleys where elk and bears outnumber people.",
    "The planning variables are season and access. The famous lakes thaw in June; the larch trees turn gold in a two-week September window; the Icefields Parkway is a commitment that rewards early starts. And the great railway hotels — Banff Springs, Chateau Lake Louise — book out for summer nearly a year ahead. This is a destination where the calendar is the itinerary."
  ],
  "intro_image_ph": "Destination Photography<br>Moraine Lake at Dawn",
  "intro_image_label": "Banff National Park · Canada",
  "places_title": "The Bases That Matter",
  "places_sub": "The Rockies reward two or three bases rather than a new bed every night — the driving is the sightseeing.",
  "places": [
    {"featured": True, "bg": "#141a10", "ph": "Destination Photography · Banff", "region": "Banff NP", "name": "Banff & Lake Louise",
     "desc": "The heart of the range: the town of Banff as the base, Moraine Lake and Lake Louise at dawn (before the shuttle crowds), Johnston Canyon's catwalks, and the Banff Springs for a night of railway-era grandeur. Four days minimum in summer or larch season."},
    {"bg": "#101820", "ph": "Destination Photography · Icefields Parkway", "region": "The Parkway", "name": "The Icefields Parkway",
     "desc": "One of the world's great drives — the Columbia Icefield, Peyto Lake's wolf-head turquoise, and a glacier walk on the Athabasca. Done properly as a full one-way day between Banff and Jasper with the stops timed against the light."},
    {"bg": "#0e1c24", "ph": "Destination Photography · Jasper", "region": "Jasper NP", "name": "Jasper",
     "desc": "The wilder, quieter park — Maligne Lake's Spirit Island (the most photographed spot in the Rockies, reachable only by boat), dark-sky stargazing in October's festival, and wildlife that wanders the townsite. Two or three nights for the park's northern soul."},
    {"bg": "#14202c", "ph": "Destination Photography · Rocky Mountaineer", "region": "By Rail", "name": "The Rocky Mountaineer",
     "desc": "The luxury train through the range — glass-domed coaches, gold-leaf service, and mountain scenery as a moving table. Vancouver to Banff or Jasper over two days; the connoisseur's way to arrive, and a trip unto itself."}
  ],
  "itins_sub": "The classic structures — always rebuilt around your dates and hiking appetite.",
  "itineraries": [
    {"bg": "#141a10", "ph": "Journey Photography<br>Rockies Grand Week", "when": "June – September · 7–9 days", "name": "Banff to Jasper, Properly",
     "desc": "Three nights in Banff with dawn starts at the famous lakes, the Icefields Parkway as a full day with a glacier walk, two nights in Jasper for Maligne Lake and the wildlife, and the railway hotels where they count. The complete Rockies week.",
     "meta1": "Banff & Jasper", "meta2": "7–9 Days"},
    {"bg": "#101820", "ph": "Journey Photography<br>Larch Season", "when": "Mid-September – Early October · 5–6 days", "name": "The Golden Window",
     "desc": "Two weeks a year, the alpine larches turn gold against the first snows — the Larch Valley trail above Moraine Lake becomes the most beautiful walk in Canada. Timed by the season's turn, not the calendar; we track it annually.",
     "meta1": "Larch Season", "meta2": "5–6 Days"}
  ],
  "why_title": "What We Add to Rockies Planning",
  "why_sub": "The parks are public, but the access isn't equal. Timing and reservations separate the postcard from the crowd.",
  "why": [
    {"title": "Dawn Access Strategy", "desc": "Moraine Lake is now shuttle-only; Lake Louise's lot fills by 6am. We arrange the earliest shuttles, private transfers where allowed, and the alternatives (Emerald Lake, Yoho) that give you the turquoise without the queue."},
    {"title": "Railway Hotel Rooms", "desc": "The Banff Springs and Chateau Lake Louise are the Rockies' legendary stays — and their best room categories sell out for summer nearly a year ahead. We book early and choose the wing, not just the hotel."},
    {"title": "Season Tracking", "desc": "Lake thaw, larch turn, trail openings, wildlife patterns — the Rockies run on nature's calendar. We time your visit to the version of the parks you came for."},
    {"title": "Guides Where They Count", "desc": "Glacier walks, wildlife photography, and the serious hikes reward certified guides — for safety, access, and the difference between seeing a bear and understanding what it's doing."}
  ],
  "seasons_title": "The Rockies by Season",
  "seasons_sub": "The parks are three destinations wearing one name — summer, larch season, and winter are entirely different trips.",
  "seasons": [
    {"name": "Summer", "months": "Mid-June – Early September", "desc": "The lakes thawed and turquoise, every trail open, and the long northern light. The famous window — book hotels six to twelve months ahead.", "best": True},
    {"name": "Larch Season", "months": "Mid-September – Early October", "desc": "The golden two weeks: larches turning, first snows on the peaks, crowds gone. The connoisseur's window — timed by the season, not the calendar."},
    {"name": "Winter", "months": "December – March", "desc": "World-class skiing at Lake Louise and Banff's resorts, ice walks in the canyons, and the frozen lakes under snow. A different, quieter park — at half the summer price."}
  ],
  "testimonial": "We stood at Moraine Lake at 6am with maybe ten other people. By nine it was a crowd scene. That one piece of timing advice — from Mark — made the entire trip.",
  "testimonial_attr": "Canadian Rockies Clients · Larch Season 2024",
  "mark_title": "On the Rockies",
  "mark_quote": "The Canadian Rockies are the best mountain value in the world — Alps-scale scenery, no transatlantic flight, and hotels that cost a third of their Swiss equivalents. But the secret's out, and the famous lakes now run on shuttle schedules and 6am alarms. That's fine — it just means the trip is won or lost in the planning. Dawn at Moraine Lake, the Parkway as a full day instead of a commute, Jasper for the quiet. And if you can swing mid-September, the larches will ruin every other mountain for you.",
  "cta_title": "Plan a Rockies Trip<br>Timed Right",
  "cta_sub": "Tell me your dates, your hiking appetite, and whether the train appeals. I'll come back with a route, hotels, and the access plan — within one business day.",
  "faq_sub": "Questions we hear most when planning Canadian Rockies trips.",
  "faqs": [
    ("How do I get to Moraine Lake now?", "By shuttle or licensed tour only — private cars are no longer permitted. The earliest shuttles book out weeks ahead, and they're worth it: the lake at dawn, before the crowds, is one of North America's great sights. We secure the slots as part of planning."),
    ("Banff or Jasper?", "Both, connected by the Icefields Parkway — Banff for the famous lakes and infrastructure, Jasper for the wilder, quieter version. The drive between them is a highlight, not a transfer. Three nights Banff, two Jasper is the classic split."),
    ("Is the Rocky Mountaineer worth it?", "For rail lovers and scenery-first travelers, yes — two days of glass-domed mountain travel with excellent service, and you arrive rested. It's a trip unto itself rather than transportation; we often pair it with a Rockies week."),
    ("When do the lakes thaw?", "Moraine Lake and the high lakes typically thaw in early to mid-June; the famous turquoise color peaks as glacial melt feeds them through July and August. Before mid-June, many high-country sights are still under snow."),
    ("Will I see wildlife?", "Very likely — elk in Banff's townsite, bears along the Parkway, bighorn sheep on the cliffs, and moose in Jasper's wetlands. Dawn and dusk are the windows; a wildlife guide dramatically improves both the sightings and the understanding."),
    ("Is it good for families?", "One of the best — easy trails with spectacular payoffs, canoes on the lakes, the glacier experience, and wildlife as daily entertainment. The Rockies work for ages six to ninety-six; we adjust the trail choices accordingly.")
  ]
}

if __name__ == "__main__":
    save("canadian-rockies", CANADIAN_ROCKIES)
