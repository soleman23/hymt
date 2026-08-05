#!/usr/bin/env python3
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from new_experiences import save

CRUISES = {
  "short": "Cruises & Yachts",
  "eyebrow": "Sea & River",
  "headline": "The Right Ship<br>Changes Everything",
  "hero_sub": "Cruising done well is the most efficient way to see the world's coastlines — done poorly, it's a floating buffet with a crowd attached. The difference is ship size, itinerary design, and who booked it for you.",
  "hero_cta1": "Plan My Cruise",
  "intro_label": "Why Cruise Travel",
  "intro_title": "Small Ships, Real Itineraries",
  "intro_paras": [
    "The cruise industry is built around a volume model: five thousand passengers, a port every day, and an onboard economy designed to keep you spending. That model produces a specific kind of trip — and it's rarely the one our clients are looking for.",
    "The version of cruising we plan is different. Ships measured in hundreds of guests, not thousands. Itineraries that stay late in port or overnight where the day-trippers leave. Expedition vessels with naturalists and Zodiacs where the destination is the point, river ships that dock in the center of the city you're there to see, and private yachts where the itinerary is a conversation, not a schedule.",
    "The choice of vessel, cabin category, and sailing date matters more in cruising than in almost any other travel category — the same itinerary on two different ships is two different trips. That matching problem is what we're for."
  ],
  "intro_image_ph": "Experience Photography<br>River Cruise at Dawn · The Rhine",
  "intro_image_label": "River Cruise · Europe",
  "countries_title": "Waters We Know in Detail",
  "countries_sub": "Each cruising ground rewards a different kind of ship and season. The right combination depends on what you're actually going to see.",
  "countries": [
    {"featured": True, "bg": "#101820", "ph": "Destination Photography · The Mediterranean", "region": "Europe", "name": "The Mediterranean",
     "desc": "The classic luxury cruising ground — but the version worth doing avoids the megaship ports in August. Small-ship and yacht itineraries through the Dalmatian coast, the Greek Isles beyond Mykonos and Santorini, and the Amalfi anchorages the big ships can't reach. Best May–June and September–October."},
    {"bg": "#0e1c24", "ph": "Destination Photography · Alaska", "region": "North America", "name": "Alaska",
     "desc": "Expedition cruising at its most accessible — glaciers, whales, and brown bears from a small ship that can nose into fjords the big vessels pass by. The Inside Passage done properly includes time in the smaller communities, not just the cruise ports. Best June through August."},
    {"bg": "#14202c", "ph": "Destination Photography · The Galápagos", "region": "South America", "name": "The Galápagos",
     "desc": "A destination that only exists as a cruise — the islands are visited by licensed vessel, full stop. Ship selection here is the entire decision: the best naturalist guides, the right island sequence, and vessels small enough to feel the place rather than tour it. Year-round, with wildlife calendars that vary by month."},
    {"bg": "#101c26", "ph": "Destination Photography · European Rivers", "region": "Europe", "name": "The European Rivers",
     "desc": "The Rhine, Danube, Rhône, and Douro — docked in the center of Vienna, Budapest, or Lyon rather than a bus ride outside it. River cruising rewards the right ship choice: the difference between vessels is felt most at dinner and in the cabin. Shoulder season (April, October) means fewer ships and better tables."},
    {"bg": "#0f1b24", "ph": "Destination Photography · Antarctica", "region": "Polar Regions", "name": "Antarctica & the Arctic",
     "desc": "The ultimate expedition cruise. Ship choice determines everything: how many landings per day, whether you camp on the ice, how the vessel handles the Drake Passage. We book ice-class expedition ships with serious naturalist teams — never the large vessels that can only look from a distance. November through March for Antarctica."},
    {"bg": "#122029", "ph": "Destination Photography · Private Yacht Charter", "region": "Bespoke", "name": "Private Yacht Charters",
     "desc": "The anti-cruise: your own crewed vessel, your own pace, your own anchorages. Turkish gulets, Greek island catamarans, Caribbean motor yachts — with a chef who learns how you take breakfast by day two. The most flexible version of water travel that exists."}
  ],
  "events_sub": "A starting point, not a menu. Every sailing we book is shaped around the clients on it.",
  "events": [
    {"bg": "#101820", "ph": "Experience Photography<br>Dalmatian Coast · Croatia", "when": "May – June, September · 8–10 days", "name": "The Dalmatian Coast by Small Ship",
     "desc": "Dubrovnik to Split the way it should be done — overnighting in Hvar and Korčula after the day boats leave, swimming off the stern in quiet coves, and a ship small enough to dock in the old harbors. Paired with two nights on land at either end.",
     "meta1": "Croatia", "meta2": "8–10 Days"},
    {"bg": "#0e1c24", "ph": "Experience Photography<br>Expedition Vessel · Antarctica", "when": "November – March · 11–14 days", "name": "Antarctica, Done Properly",
     "desc": "An ice-class expedition ship with two landings a day, a naturalist team worth listening to, and — for those who want it — a night camping on the ice. The trip that resets what travel can be. Booked twelve to eighteen months out; the best cabins go first.",
     "meta1": "Antarctica", "meta2": "11–14 Days"},
    {"bg": "#14202c", "ph": "Experience Photography<br>Rhone Valley · France", "when": "April, October · 8 days", "name": "The Rhône for Wine People",
     "desc": "Lyon to Avignon on a river ship chosen for its kitchen, with private tastings in Hermitage and Châteauneuf-du-Pape that the ship's excursions don't include. We add the producers we've worked with for years — the ones who don't take groups.",
     "meta1": "France", "meta2": "8 Days"},
    {"bg": "#101c26", "ph": "Experience Photography<br>Gulet Charter · Turkish Coast", "when": "May – October · 7 days", "name": "A Gulet of Your Own",
     "desc": "A crewed wooden gulet on Turkey's Turquoise Coast — captain, chef, and a route that bends around your mood each morning. Ruins by tender, lunch at anchor, and evenings in harbor towns the cruise ships have never heard of. The definitive family or group charter.",
     "meta1": "Turkey", "meta2": "7 Days"}
  ],
  "inclusions_title": "What Every Cruise Booking Includes",
  "inclusions_sub": "The fare is the beginning, not the end. What surrounds it is where trips are made or quietly diminished.",
  "inclusions": [
    {"title": "Ship & Cabin Selection", "desc": "We've sailed or inspected the vessels we recommend. We know which cabin categories justify their premium, which decks to avoid, and which 'suites' are marketing. On the right ship, in the right cabin, the same itinerary is a different trip."},
    {"title": "Pre & Post Extensions", "desc": "The cruise is rarely the whole trip. We build the land portion around it — the two nights in Athens before the Aegean, the wine country week after the Douro — so the journey has a beginning and an end, not just a middle."},
    {"title": "Private Shore Arrangements", "desc": "Ship excursions move at the speed of the slowest passenger. We arrange private guides and drivers in the ports that matter — you see the place on your schedule, with someone who knows it, and you're back before the gangway closes."},
    {"title": "Expedition Vetting", "desc": "For polar, Galápagos, and remote expedition sailings, the operator's safety record, naturalist quality, and landing logistics are the trip. We book expedition lines with serious track records — and we can tell you why, specifically."},
    {"title": "Charter Brokerage", "desc": "For private yachts, we work with established charter brokers, inspect crew references, and structure the provisioning around your table — not a standard menu. The boat is the easy part; the crew is everything."},
    {"title": "Flights, Transfers & the Boring Parts", "desc": "Embarkation day has a way of going wrong in small ways. Flights timed to the sailing, transfers that know the terminal, and a plan for the luggage — all confirmed before you leave home."}
  ],
  "seasons_title": "Cruising Season by Region",
  "seasons_sub": "The same coastline in the wrong month is a different trip. Timing is the first decision.",
  "seasons": [
    {"name": "Mediterranean Shoulder", "months": "May – June · Sept – Oct", "desc": "Warm water, working harbors, and restaurant tables you can actually get. The Med at its best — before and after the August compression.", "best": True},
    {"name": "Alaska & Expedition North", "months": "June – August", "desc": "The short northern window. Wildlife at peak activity, the longest days, and expedition ships deployed to Alaska, Greenland, and the High Arctic."},
    {"name": "Antarctica & the South", "months": "November – March", "desc": "The austral summer is the only window. November for pristine snow and penguin courtship; February–March for whales and the warmest temperatures."}
  ],
  "testimonial": "Mark talked us out of the big ship we thought we wanted and onto a two-hundred-passenger vessel we'd never heard of. We docked in harbors the big ships sailed past. It was the best travel decision we've made in twenty years of trips.",
  "testimonial_attr": "Clients since 2019 · Mediterranean Small-Ship Voyage",
  "mark_title": "On Cruising",
  "mark_quote": "The first conversation I have with most cruise clients is a subtraction exercise. They come in with a megaship brochure — five thousand passengers, seven pools, a go-kart track — and I ask them what they actually want to feel when they wake up in a new port. It's almost never a go-kart track. The right ship is the one that gets small enough to let the destination in. Two hundred guests, a naturalist who can name the bird, dinner where the chef knows it's you by the second night. That's what water travel is supposed to be. And yes, it costs roughly the same as the floating resort — the difference isn't the money, it's knowing the difference exists.",
  "cta_title": "Plan a Cruise<br>Worth Sailing",
  "cta_sub": "Tell me the coastline you're drawn to, when you can travel, and who's coming. I'll come back with specific ships, cabins, and sailing dates — with the reasoning behind each — within one business day.",
  "faq_sub": "Questions we hear most when planning cruises and yacht charters.",
  "faqs": [
    ("I've never cruised — is it right for me?", "It depends entirely on the ship. Clients who swear they 'aren't cruise people' often love small-ship and expedition cruising — two hundred guests, a destination focus, no queueing. What they dislike is the volume model, not the water. The first conversation is about what you want the trip to feel like; the vessel follows from that."),
    ("Small ship versus big ship — what's the real difference?", "Everything that matters. Small ships dock in harbors big ships can't enter, stay in port after the day-trippers leave, and run dinner as a restaurant rather than a seating. Big ships offer more onboard entertainment and lower headline fares — but the destination becomes a backdrop. If the point is the place, the ship should be small."),
    ("When should I book an expedition cruise?", "Twelve to eighteen months ahead for Antarctica, the Galápagos, and High Arctic sailings. The best ships carry one to two hundred guests, and the desirable cabin categories sell out long before departure. Last-minute expedition deals exist, but they're rarely on the ships we'd put you on."),
    ("Is a private yacht charter complicated to arrange?", "Less than most clients expect. We work with established charter brokers, match the vessel and crew to your group, and structure provisioning around how you actually eat and drink. You tell us the coastline and the dates; the boat, crew, and itinerary come back as one proposal."),
    ("What about seasickness?", "A fair concern, and a manageable one. Modern expedition ships are stabilized; itineraries can be chosen for sheltered waters; the Galápagos and Greek Isles are gentle compared to the Drake Passage. We plan around your tolerance honestly — including when that means picking the river instead of the ocean."),
    ("Are cruises good value for a family or group?", "Charters and small-ship bookings often compare surprisingly well to equivalent land trips — one unpacking, meals and guiding included, and a built-in structure that works across generations. For multigenerational groups especially, a yacht or small ship solves problems that villas can't.")
  ]
}

if __name__ == "__main__":
    save("cruises", CRUISES)
