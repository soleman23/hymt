#!/usr/bin/env python3
"""Destination content — New Orleans."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from new_destinations import save

NEW_ORLEANS = {
  "short": "New Orleans", "cta_article": "a",
  "parent": ("North America", "/destinations/north-america/"),
  "eyebrow": "The American South",
  "headline": "America's Most<br>Foreign City",
  "hero_sub": "New Orleans doesn't feel like the United States — it feels like its own small country, with its own cuisine, its own music, and its own relationship with time. Done right, it's three or four of the most atmospheric days in American travel.",
  "intro_label": "The City",
  "intro_title": "Beyond Bourbon Street.",
  "intro_paras": [
    "The French Quarter is worth its morning — the beignets, the architecture, the street musicians before the crowds — but the New Orleans that matters lives elsewhere: the jazz clubs of Frenchmen Street where the music is the point, not the wallpaper; the Garden District's live oaks and mansions; the neighborhood restaurants where a Tuesday lunch becomes a two-hour event.",
    "The city's pleasures are edible, musical, and architectural — and they reward local guidance more than almost anywhere in America. Which second line is worth joining, which restaurant's bar is better than its dining room, which cemetery tour is history and which is theater. The calendar matters enormously: Mardi Gras and Jazz Fest are the famous windows, but the city's quiet weeks have their own case."
  ],
  "intro_image_ph": "Destination Photography<br>Frenchmen Street at Night",
  "intro_image_label": "New Orleans · Louisiana",
  "places_title": "The Neighborhoods That Matter",
  "places_sub": "New Orleans is a city of neighborhoods — each with its own register. Three or four days covers the essential ones properly.",
  "places": [
    {"featured": True, "bg": "#141a10", "ph": "Destination Photography · French Quarter", "region": "The Quarter", "name": "The French Quarter, Early",
     "desc": "The architecture, Café du Monde before the line forms, and the antique shops and courtyards behind the famous facades. Walk it in the morning with a historian who can read the buildings; by evening, the Quarter belongs to the party — and you should be on Frenchmen Street instead."},
    {"bg": "#101820", "ph": "Destination Photography · Frenchmen Street", "region": "The Music", "name": "Frenchmen Street",
     "desc": "The live-music corridor where locals actually go — half a dozen clubs within two blocks, brass bands spilling onto the pavement, and sets that run late. Go with someone who knows which room has the good band on a given night."},
    {"bg": "#0e1c24", "ph": "Destination Photography · Garden District", "region": "Uptown", "name": "The Garden District & Magazine Street",
     "desc": "Live oaks, Greek Revival mansions, and the streetcar rumbling up St. Charles. Magazine Street's six miles of shops and restaurants lead to Audubon Park. The city's genteel register — and its best neighborhood restaurants."},
    {"bg": "#14202c", "ph": "Destination Photography · Bayou", "region": "Beyond the City", "name": "The Bayou & River Road",
     "desc": "An hour out, the cypress swamps and plantation country — airboat tours through the bayou, and the River Road's honest, complicated plantation history told by the right guides. The essential half-day context for understanding where the city came from."}
  ],
  "itins_sub": "The structures we rebuild around your dates and appetite.",
  "itineraries": [
    {"bg": "#141a10", "ph": "Journey Photography<br>New Orleans Deep Week", "when": "October – April · 4–5 days", "name": "The City, Deep Version",
     "desc": "The Quarter with a historian, Frenchmen Street with a music insider, a private cooking class that runs through gumbo's family arguments, a bayou morning, and the restaurants — Commander's, the neighborhood gems, the late-night oyster bar — booked in the right order.",
     "meta1": "New Orleans", "meta2": "4–5 Days"},
    {"bg": "#101820", "ph": "Journey Photography<br>Jazz Fest", "when": "Late April – Early May · 4 days", "name": "Jazz Fest Properly",
     "desc": "The festival by day — with the strategy for stages, food stalls, and shade that separates veterans from casualties — and the city's clubs by night, when the festival musicians sit in until 3am. The best week of the year in American music, with the planning to match.",
     "meta1": "Jazz Fest", "meta2": "4 Days"}
  ],
  "why_title": "What We Add to New Orleans Planning",
  "why_sub": "The city is compact but layered. The difference between tourist New Orleans and the real one is guidance.",
  "why": [
    {"title": "Music Insiders", "desc": "Which club has the band worth hearing on your specific Tuesday — that knowledge isn't on the internet. Our guides are musicians and scene veterans who plan your nights by the actual lineup."},
    {"title": "The Restaurants, in Order", "desc": "New Orleans dining rewards sequencing: the grand Creole rooms, the neighborhood bistros, the po' boy counter, the oyster happy hour. We book the right meal on the right night, including the tables that don't take online reservations."},
    {"title": "Festival Strategy", "desc": "Mardi Gras and Jazz Fest are extraordinary with a plan and exhausting without one. Hotel location, parade logistics, tickets, and recovery time — we build the week so the festival is the joy it should be."},
    {"title": "Honest Context", "desc": "The city's history — Creole culture, slavery, Katrina, rebuilding — deserves guides who tell it straight. The plantation and cemetery tours we book are the ones that do."}
  ],
  "seasons_title": "New Orleans by Season",
  "seasons_sub": "The calendar rules this city more than most. The season you choose is the city you get.",
  "seasons": [
    {"name": "The Sweet Spot", "months": "October – April", "desc": "Warm days, cool nights, and the city at its most comfortable — with Mardi Gras (Feb/March) and Jazz Fest (late April) as the twin peaks.", "best": True},
    {"name": "Festival Windows", "months": "Feb – Early May", "desc": "Mardi Gras and Jazz Fest book out the city's best hotels a year ahead. Extraordinary weeks — plan them early or don't plan them at all."},
    {"name": "Summer", "months": "June – September", "desc": "Hot, humid, and gloriously cheap. The music doesn't stop, the restaurants are yours, and the city belongs to its residents. For heat-tolerant travelers, a secret season."}
  ],
  "testimonial": "Mark's music guide knew which club had the good band on a Tuesday. We followed him for two nights and heard things we'll never hear again. The restaurants were booked before we even asked.",
  "testimonial_attr": "New Orleans Clients · Jazz Fest 2024",
  "mark_title": "On New Orleans",
  "mark_quote": "New Orleans is the one American city where I insist clients take a guide, at least for a day. Not because it's hard to navigate — because the good stuff is invisible. The club with the legendary Tuesday set looks like a dive from the street. The restaurant everyone photographs is rarely the one the neighborhood eats at. And the city's history is too rich and too complicated to get from a plaque. Give it four days, a music guide, and an appetite. It'll give you back more than any city in the country.",
  "cta_title": "Plan a New Orleans Trip<br>With Soul",
  "cta_sub": "Tell me your dates, your music and food priorities, and whether a festival is the point. I'll come back with a base, a guide, and the tables — within one business day.",
  "faq_sub": "Questions we hear most when planning New Orleans trips.",
  "faqs": [
    ("How many days does the city need?", "Three to four covers it properly: the Quarter, Frenchmen Street, the Garden District, a bayou or plantation half-day, and four nights of music. Longer works if a festival anchors the trip."),
    ("Should we stay in the French Quarter?", "Near it, not necessarily in it. The Quarter's edges and the nearby Marigny offer the atmosphere with better sleep. We know which hotels put you a short walk from the music without the 2am street noise through the window."),
    ("Is Mardi Gras worth planning around?", "If it's on your list — absolutely, with a year of lead time and the right hotel location. It's a week of parades, costumes, and joy, but the logistics (routes, crowds, closures) reward professional planning more than any event in America."),
    ("What about the food — where do we even start?", "With a strategy: one grand Creole dinner, one neighborhood bistro, one oyster happy hour, one po' boy, one cooking class. The city's cuisine is deep and regional — you'll eat better with a plan than with a list of famous names."),
    ("Is it family-friendly?", "The food, the music (early sets), the streetcars, and the swamp tours all work beautifully for families. The Quarter's nightlife register is easy to route around. Families leave loving the city — kids remember the beignets and the alligators forever."),
    ("When is it too hot?", "July through September is genuinely hot and humid — locals build their days around it (early, late, and air-conditioned in between). If heat doesn't bother you, it's the best-value season. If it does, October through April is your city.")
  ]
}

if __name__ == "__main__":
    save("new-orleans", NEW_ORLEANS)
