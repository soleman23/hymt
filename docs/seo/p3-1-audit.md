# P3-1 â€” Title & description audit (review before applying)

**Status: PROPOSED. Nothing has been applied.** Per issue #26, this table is for
Devin's review; the changes land only on approval, and `--update-baseline` goes
in its own commit after that.

Generated 2026-08-07 against HEAD `8b77266`.

## Summary

| | Before | After |
|---|--:|--:|
| Pages audited (excl. `/404.html`) | 93 | 93 |
| Titles outside 30â€“65 chars | **47** | **0** |
| Descriptions outside 110â€“165 chars | **74** | **0** |
| Descriptions opening "Discover/Explore/Learn about" | 0 | 0 |
| Fully compliant on both | 12 | **93** |

**84 pages change** â€” 50 titles, 74 descriptions. Nine pages need no change at all.
Every proposed value has been machine-verified for length, uniqueness across the
site, the required brand suffix, and banned openers.

## Two findings worth deciding on before you read the table

### 1. A verifier measurement bug â€” the real violation count is 47, not 49

`tools/verify-deployment.mjs` measures the **raw HTML** title, so `&amp;` counts
as 5 characters instead of 1. Two pages are flagged that are actually compliant:

| Page | Verifier says | Rendered title actually is |
|---|--:|--:|
| `/destinations/spain/` | 68 âœ— | **64 âœ“** |
| `/destinations/uk-ireland/` | 73 âœ— | **65 âœ“** |

This matters because P3-1 flips `title-length` from a warning to a hard build
failure. Left alone, those two pages would fail the build for titles Google sees
as fine. **Recommendation: decode entities before measuring, in the same commit
that flips the check.** Both pages are then left untouched.

### 2. Three titles use `|` where the standard says `â€”`

Not length violations â€” pure consistency. `CONTENT-STANDARDS.md` Â§4 specifies the
` â€” Hit Your Mark Travel` suffix, and these three predate it:

- `/plan-your-trip/` Â· `/privacy-policy/` Â· `/terms-and-conditions/`

The swap is character-neutral, so it costs nothing. They're included in the table
below marked *consistency*. Say the word if you'd rather leave them.

**The homepage is deliberately excluded** from that rule: `Hit Your Mark Travel â€”
Bespoke Luxury Journeys` puts the brand first, which is correct for a homepage
and wrong everywhere else. Left as-is.

## What changed in the rewriting, and why

**Titles.** Sixteen destination titles were *too short* (`Asia â€” Hit Your Mark
Travel`, 27 chars) â€” these gain a descriptor using the `Place | specifics â€”
brand` pattern the site already uses on Antarctica, Iceland and Portugal, which
also front-loads real search terms. Thirty-one were *too long*, almost all from
subtitles Google was already truncating; those are cut to the distinguishing
phrase.

**Journal titles are the tight case.** The ` â€” Hit Your Mark Travel Journal`
suffix eats 31 of the 65 characters, leaving 34 for the headline. Twenty-two
posts needed cutting, so long-form subtitles ("Six Regions, the Right Season, and
Why Asia Requires a Different Planning Framework") are gone. This costs nothing
in practice â€” Google truncated them at ~60 characters anyway â€” and the full
headline still sits in the `<h1>` and the `Article.headline` schema.

**Descriptions.** All 74 violations were *too long*; none were too short, and
none opened with a banned word, so the existing copy was already well aimed. The
rewrite trims to 110â€“165 while keeping the concrete opener (place names, months,
numbers) that made them work. No description was replaced wholesale.

---

## The table


### Core pages

**`/about/`** â€” no change needed (title 38, description 158)

**`/contact/`** â€” no change needed (title 30, description 144)

**`/destinations/`**

| | chars | value |
|---|--:|---|
| Title | 35 | Destinations â€” Hit Your Mark Travel *(unchanged)* |
| Desc now | 204 | 60+ handpicked luxury destinations across 9 regions â€” every one personally visited and vetted. From Maldives overwater villas to Botswana safaris, Santorini caldera suites to Patagonian wilderness lodges. |
| **Desc new** | **144** | **60+ destinations across 9 regions, every one personally visited â€” from Maldives overwater villas to Botswana safari camps and Patagonian lodges.** |

**`/experiences/`**

| | chars | value |
|---|--:|---|
| Title | 34 | Experiences â€” Hit Your Mark Travel *(unchanged)* |
| Desc now | 201 | Twelve curated luxury travel experiences â€” beach escapes, all-inclusive vacations, family, multigenerational, adventure, wellness, culture, food &#38; wine, cruises, romance, safari, and sports travel. |
| **Desc new** | **148** | **Twelve luxury travel experiences â€” beach escapes, family and multigenerational trips, adventure, wellness, food and wine, cruises, safari and sport.** |

**`/faq/`** â€” no change needed (title 49, description 140)

**`/`**

| | chars | value |
|---|--:|---|
| Title | 46 | Hit Your Mark Travel â€” Bespoke Luxury Journeys *(unchanged)* |
| Desc now | 174 | Hit Your Mark Travel designs bespoke journeys for the time-poor, taste-rich traveler. A lifetime of experience. A global network. And someone who actually picks up the phone. |
| **Desc new** | **145** | **Bespoke journeys for the time-poor, taste-rich traveler. A lifetime of experience, a global network, and someone who actually picks up the phone.** |

**`/plan-your-trip/`**

| | chars | value |
|---|--:|---|
| Title now | 37 | Plan Your Trip \| Hit Your Mark Travel |
| **Title new** | **37** | **Plan Your Trip â€” Hit Your Mark Travel** |
| Desc | 111 | Tell us where your mark is. Share your trip vision and Mark Sole will reply personally within one business day. *(unchanged)* |

**`/privacy-policy/`**

| | chars | value |
|---|--:|---|
| Title now | 37 | Privacy Policy \| Hit Your Mark Travel |
| **Title new** | **37** | **Privacy Policy â€” Hit Your Mark Travel** |
| Desc | 118 | How Hit Your Mark Travel collects, uses, and protects your personal information â€” plain language, no fine-print games. *(unchanged)* |

**`/terms-and-conditions/`**

| | chars | value |
|---|--:|---|
| Title now | 41 | Terms & Conditions \| Hit Your Mark Travel |
| **Title new** | **41** | **Terms & Conditions â€” Hit Your Mark Travel** |
| Desc | 156 | The terms governing travel planning and booking services from Hit Your Mark Travel, a registered Seller of Travel (CA 2165910-50, WA 605920581, FL ST46122). *(unchanged)* |

**`/travel-journal/`** â€” no change needed (title 37, description 138)


### Destinations (42)

**`/destinations/africa/`**

| | chars | value |
|---|--:|---|
| Title now | 29 | Africa â€” Hit Your Mark Travel |
| **Title new** | **58** | **Africa \| Safari, Gorillas & Morocco â€” Hit Your Mark Travel** |
| Desc now | 185 | Kenya, Tanzania, Botswana, South Africa, Rwanda, and Morocco. African travel planned around the camps, guides, and windows that actually deliver the continent at its most extraordinary. |
| **Desc new** | **138** | **Kenya, Tanzania, Botswana, South Africa, Rwanda and Morocco â€” planned around the camps, guides and seasonal windows that actually deliver.** |

**`/destinations/alaska/`**

| | chars | value |
|---|--:|---|
| Title now | 29 | Alaska â€” Hit Your Mark Travel |
| **Title new** | **60** | **Alaska \| Wilderness Lodges & Glaciers â€” Hit Your Mark Travel** |
| Desc now | 237 | The Inside Passage, Denali, the Kenai Peninsula, Prince William Sound, and Arctic Alaska. The last genuinely wild place in North America â€” planned around the wilderness lodges, float planes, and guides that make the scale comprehensible. |
| **Desc new** | **147** | **The Inside Passage, Denali and the Kenai Peninsula â€” planned around the wilderness lodges and float planes that make Alaska's scale comprehensible.** |

**`/destinations/antarctica/`**

| | chars | value |
|---|--:|---|
| Title now | 75 | Antarctica \| Expedition Cruises & the Last Continent â€” Hit Your Mark Travel |
| **Title new** | **54** | **Antarctica \| Expedition Cruises â€” Hit Your Mark Travel** |
| Desc | 157 | Antarctica planned properly â€” which expedition ship, whether to fly the Drake, when to go for whales or penguins, and how to avoid the trips that disappoint. *(unchanged)* |

**`/destinations/asia/`**

| | chars | value |
|---|--:|---|
| Title now | 27 | Asia â€” Hit Your Mark Travel |
| **Title new** | **52** | **Asia \| Japan, Thailand & Bali â€” Hit Your Mark Travel** |
| Desc now | 203 | Japan, Bali, Thailand, Vietnam, India, and Sri Lanka. Asian travel planned around the guides, properties, and windows that reveal the continent at its most extraordinary â€” not the surface, but the depth. |
| **Desc new** | **143** | **Japan, Bali, Thailand, Vietnam, India and Sri Lanka â€” planned around the guides, properties and windows that reveal the depth, not the surface.** |

**`/destinations/bali/`**

| | chars | value |
|---|--:|---|
| Title now | 27 | Bali â€” Hit Your Mark Travel |
| **Title new** | **61** | **Bali \| Ubud, Komodo & the Nusa Islands â€” Hit Your Mark Travel** |
| Desc now | 192 | Ubud, Sidemen Valley, the Nusa Islands, Komodo, and Lombok. Bali's spiritual geography, rice terrace culture, and surrounding islands â€” planned around the experiences most visitors never find. |
| **Desc new** | **142** | **Ubud, Sidemen Valley, the Nusa Islands, Komodo and Lombok â€” Bali's rice terrace culture and the surrounding islands most visitors never reach.** |

**`/destinations/botswana/`**

| | chars | value |
|---|--:|---|
| Title | 31 | Botswana â€” Hit Your Mark Travel *(unchanged)* |
| Desc now | 184 | The Okavango Delta, Chobe, Central Kalahari, and Linyanti. Botswana's low-volume, high-value safari model produces the most pristine wilderness experience available anywhere in Africa. |
| **Desc new** | **140** | **The Okavango Delta, Chobe, Central Kalahari and Linyanti. Botswana's low-volume model produces the most pristine safari available in Africa.** |

**`/destinations/canadian-rockies/`**

| | chars | value |
|---|--:|---|
| Title now | 69 | Canadian Rockies \| Banff, Lake Louise & Jasper â€” Hit Your Mark Travel |
| **Title new** | **56** | **Canadian Rockies \| Banff & Jasper â€” Hit Your Mark Travel** |
| Desc | 135 | Banff and Jasper timed right â€” dawn at Moraine Lake, the Icefields Parkway, larch season's golden window, and the great railway hotels. *(unchanged)* |

**`/destinations/caribbean-mexico/`**

| | chars | value |
|---|--:|---|
| Title | 41 | Caribbean & Mexico â€” Hit Your Mark Travel *(unchanged)* |
| Desc now | 228 | Turks &#38; Caicos, St. Barth's, Jamaica, Barbados, Riviera Maya, and Los Cabos. Caribbean and Mexico travel planned around the specific islands, properties, and windows that actually deliver â€” not the ones that photograph well. |
| **Desc new** | **135** | **Turks & Caicos, St. Barth's, Jamaica, Barbados, Riviera Maya and Los Cabos â€” the islands, properties and windows that actually deliver.** |

**`/destinations/egypt/`**

| | chars | value |
|---|--:|---|
| Title now | 28 | Egypt â€” Hit Your Mark Travel |
| **Title new** | **57** | **Egypt \| Pyramids, Luxor & the Nile â€” Hit Your Mark Travel** |
| Desc now | 226 | The Pyramids of Giza, the Valley of the Kings, Abu Simbel, and the Nile between Luxor and Aswan. Egyptian travel planned around the Egyptologists, the dawn access, and the timing that delivers the monuments without the crowds. |
| **Desc new** | **136** | **The Pyramids, the Valley of the Kings, Abu Simbel and the Nile â€” planned around Egyptologists and the dawn access that beats the crowds.** |

**`/destinations/europe/`**

| | chars | value |
|---|--:|---|
| Title now | 29 | Europe â€” Hit Your Mark Travel |
| **Title new** | **61** | **Europe \| Italy, France, Spain & Greece â€” Hit Your Mark Travel** |
| Desc now | 217 | Italy, France, Spain, Portugal, Greece, and the United Kingdom. European travel planned around the specific places, guides, and access that most itineraries never reach â€” not the highlights, but the depth behind them. |
| **Desc new** | **140** | **Italy, France, Spain, Portugal, Greece and the UK â€” planned around the places, guides and access that most European itineraries never reach.** |

**`/destinations/fiji/`**

| | chars | value |
|---|--:|---|
| Title now | 27 | Fiji â€” Hit Your Mark Travel |
| **Title new** | **60** | **Fiji \| Private Islands & Coral Diving â€” Hit Your Mark Travel** |
| Desc now | 249 | The Mamanuca and Yasawa Islands, the Coral Coast, the Lau Group, and Vanua Levu. Fiji planned around the private island resorts, the soft coral diving, and the genuine Pacific welcome that the brochures hint at and only the right itinerary delivers. |
| **Desc new** | **145** | **The Mamanuca and Yasawa Islands, the Coral Coast and the Lau Group â€” private island resorts, soft coral diving, and the right itinerary for each.** |

**`/destinations/france/`**

| | chars | value |
|---|--:|---|
| Title now | 29 | France â€” Hit Your Mark Travel |
| **Title new** | **58** | **France \| Paris, Burgundy & Provence â€” Hit Your Mark Travel** |
| Desc now | 197 | Paris, Provence, Bordeaux, the Loire Valley, Alsace, and Normandy. French travel planned around the food specialists, property selections, and the depth that converts a visit into an understanding. |
| **Desc new** | **148** | **Paris, Provence, Bordeaux, the Loire, Alsace and Normandy â€” planned around the food specialists and properties that turn a visit into understanding.** |

**`/destinations/french-polynesia/`**

| | chars | value |
|---|--:|---|
| Title | 39 | French Polynesia â€” Hit Your Mark Travel *(unchanged)* |
| Desc now | 200 | Bora Bora, Moorea, Tahiti, Fakarava, and the Tuamotu atolls. French Polynesia planned around the lagoon properties, the island combinations, and the dive sites that justify the distance from anywhere. |
| **Desc new** | **135** | **Bora Bora, Moorea, Tahiti and the Tuamotu atolls â€” the lagoon properties, island combinations and dive sites that justify the distance.** |

**`/destinations/galapagos/`**

| | chars | value |
|---|--:|---|
| Title | 36 | The GalÃ¡pagos â€” Hit Your Mark Travel *(unchanged)* |
| Desc now | 231 | Santa Cruz, Fernandina, EspaÃ±ola, BartolomÃ©, and the outer islands. The GalÃ¡pagos planned around the liveaboard vs land-based decision, the island selection, and the naturalist guides that reveal what Darwin was actually observing. |
| **Desc new** | **136** | **Santa Cruz, Fernandina, EspaÃ±ola and BartolomÃ© â€” the liveaboard versus land-based decision, island selection, and the naturalist guides.** |

**`/destinations/greece/`**

| | chars | value |
|---|--:|---|
| Title now | 29 | Greece â€” Hit Your Mark Travel |
| **Title new** | **64** | **Greece \| Aegean Islands & the Peloponnese â€” Hit Your Mark Travel** |
| Desc now | 215 | Athens, Santorini, Mykonos, Crete, the Peloponnese, and Rhodes. Greek travel planned around the archaeological access, island combinations, and property selections that deliver the country at its most extraordinary. |
| **Desc new** | **139** | **Athens, Santorini, Mykonos, Crete, the Peloponnese and Rhodes â€” archaeological access, island combinations, and the right property on each.** |

**`/destinations/hawaii/`**

| | chars | value |
|---|--:|---|
| Title now | 29 | Hawaii â€” Hit Your Mark Travel |
| **Title new** | **60** | **Hawaii \| Maui, Kauai & the Big Island â€” Hit Your Mark Travel** |
| Desc now | 222 | Maui, Kauai, the Big Island, and Lanai. Hawaii planned around the island selection, the property choices, the inter-island sequencing, and the experiences that convert a beach vacation into one of the great American trips. |
| **Desc new** | **139** | **Maui, Kauai, the Big Island and Lanai â€” island selection, inter-island sequencing, and the experiences that make it more than a beach trip.** |

**`/destinations/iceland/`**

| | chars | value |
|---|--:|---|
| Title now | 75 | Iceland \| Northern Lights, Highlands & the Ring Road â€” Hit Your Mark Travel |
| **Title new** | **60** | **Iceland \| Northern Lights & Ring Road â€” Hit Your Mark Travel** |
| Desc now | 166 | Iceland planned properly â€” when the northern lights are actually likely, which regions justify the drive, and how to see the country without the Golden Circle crowds. |
| **Desc new** | **147** | **Iceland planned properly â€” when the northern lights are actually likely, which regions justify the drive, and how to skip the Golden Circle crowds.** |

**`/destinations/italy/`**

| | chars | value |
|---|--:|---|
| Title now | 28 | Italy â€” Hit Your Mark Travel |
| **Title new** | **63** | **Italy \| Rome, Tuscany & the Amalfi Coast â€” Hit Your Mark Travel** |
| Desc now | 203 | Rome, Tuscany, the Amalfi Coast, Venice, Sicily, and Puglia. Italian travel planned around the art historians, food specialists, and property selections that reveal the country at its most extraordinary. |
| **Desc new** | **143** | **Rome, Tuscany, the Amalfi Coast, Venice, Sicily and Puglia â€” planned around the art historians, food specialists and properties worth the rate.** |

**`/destinations/japan/`**

| | chars | value |
|---|--:|---|
| Title now | 28 | Japan â€” Hit Your Mark Travel |
| **Title new** | **58** | **Japan \| Tokyo, Kyoto & Ryokan Stays â€” Hit Your Mark Travel** |
| Desc now | 215 | Tokyo, Kyoto, Osaka, Hiroshima, Kanazawa, and rural Japan. The most complete travel destination in the world â€” planned around specialist guides, the right properties, and the depth that most itineraries never reach. |
| **Desc new** | **136** | **Tokyo, Kyoto, Osaka, Hiroshima, Kanazawa and rural Japan â€” the most complete destination in the world, planned around specialist guides.** |

**`/destinations/jordan/`**

| | chars | value |
|---|--:|---|
| Title now | 29 | Jordan â€” Hit Your Mark Travel |
| **Title new** | **62** | **Jordan \| Petra, Wadi Rum & the Dead Sea â€” Hit Your Mark Travel** |
| Desc now | 197 | Petra, Wadi Rum, the Dead Sea, Jerash, and the Aqaba coast. Jordan planned around the Nabataean archaeology, the Bedouin guides, and the hospitality culture that makes every Jordan traveler return. |
| **Desc new** | **143** | **Petra, Wadi Rum, the Dead Sea and Jerash â€” Nabataean archaeology, Bedouin desert camps, and the hospitality culture that brings travelers back.** |

**`/destinations/kenya-tanzania/`**

| | chars | value |
|---|--:|---|
| Title | 39 | Kenya & Tanzania â€” Hit Your Mark Travel *(unchanged)* |
| Desc now | 210 | The Masai Mara, Serengeti, Amboseli, Ngorongoro, and Laikipia. East Africa's greatest wildlife theater planned around the camps, guides, and seasonal windows that put you in the right place at the right moment. |
| **Desc new** | **134** | **The Masai Mara, Serengeti, Amboseli and Ngorongoro â€” East Africa's greatest wildlife theater, timed to the camps and seasonal windows.** |

**`/destinations/maldives/`** â€” no change needed (title 35, description 149)

**`/destinations/middle-east/`** â€” no change needed (title 34, description 163)

**`/destinations/napa-sonoma/`**

| | chars | value |
|---|--:|---|
| Title now | 68 | Napa & Sonoma \| Private Wine Country Journeys â€” Hit Your Mark Travel |
| **Title new** | **59** | **Napa & Sonoma \| Private Wine Country â€” Hit Your Mark Travel** |
| Desc | 149 | Napa and Sonoma done privately â€” small-producer appointments, vineyard lunches, harvest season timing, and the great tables booked the day they open. *(unchanged)* |

**`/destinations/new-orleans/`**

| | chars | value |
|---|--:|---|
| Title now | 68 | New Orleans \| Music, Food & Festival Journeys â€” Hit Your Mark Travel |
| **Title new** | **60** | **New Orleans \| Music, Food & Festivals â€” Hit Your Mark Travel** |
| Desc | 152 | New Orleans beyond Bourbon Street â€” Frenchmen Street with music insiders, the restaurants in the right order, Mardi Gras and Jazz Fest planned properly. *(unchanged)* |

**`/destinations/new-york/`**

| | chars | value |
|---|--:|---|
| Title | 31 | New York â€” Hit Your Mark Travel *(unchanged)* |
| Desc now | 213 | Manhattan, Brooklyn, the Hudson Valley, the Hamptons, and Upstate New York. The city that rewards knowing it â€” planned around the neighborhoods, the food specialists, and the escapes that most visitors never find. |
| **Desc new** | **136** | **Manhattan, Brooklyn, the Hudson Valley and the Hamptons â€” the neighborhoods, food specialists and escapes that most visitors never find.** |

**`/destinations/new-zealand/`**

| | chars | value |
|---|--:|---|
| Title | 34 | New Zealand â€” Hit Your Mark Travel *(unchanged)* |
| Desc now | 269 | Queenstown, Fiordland, the Marlborough wine region, Rotorua, the Bay of Islands, and Stewart Island. New Zealand planned around the South Island landscapes, the Great Walk lodge-supported routes, and the adventure and elegance combinations that justify the long flight. |
| **Desc new** | **140** | **Queenstown, Fiordland, Marlborough and the Bay of Islands â€” South Island landscapes and lodge-supported Great Walks that justify the flight.** |

**`/destinations/north-america/`**

| | chars | value |
|---|--:|---|
| Title | 36 | North America â€” Hit Your Mark Travel *(unchanged)* |
| Desc now | 228 | Napa &#38; Sonoma, Hawaii, Alaska, New York, the Canadian Rockies, and New Orleans. North American travel planned around the specific places, properties, and experiences that actually deliver â€” not the ones that photograph well. |
| **Desc new** | **144** | **Napa & Sonoma, Hawaii, Alaska, New York, the Canadian Rockies and New Orleans â€” the places and properties that deliver, not the photogenic ones.** |

**`/destinations/oman/`**

| | chars | value |
|---|--:|---|
| Title now | 27 | Oman â€” Hit Your Mark Travel |
| **Title new** | **60** | **Oman \| Wahiba Sands & Musandam Fjords â€” Hit Your Mark Travel** |
| Desc now | 262 | Muscat, Wahiba Sands, the Musandam Peninsula, Nizwa, and Wadi Shab. The Middle East's most underused destination â€” extraordinary landscape diversity, one of the highest hospitality standards in the world, and a self-drive road trip culture that rewards planning. |
| **Desc new** | **150** | **Muscat, Wahiba Sands, the Musandam Peninsula and Nizwa â€” the Middle East's most underused destination, and a self-drive culture that rewards planning.** |

**`/destinations/patagonia/`**

| | chars | value |
|---|--:|---|
| Title | 32 | Patagonia â€” Hit Your Mark Travel *(unchanged)* |
| Desc now | 216 | Torres del Paine, Los Glaciares, El ChaltÃ©n, Tierra del Fuego, and the Beagle Channel. The end of the earth â€” planned around the weather windows, the right lodges, and the trekking that makes the distance worthwhile. |
| **Desc new** | **138** | **Torres del Paine, Los Glaciares, El ChaltÃ©n and Tierra del Fuego â€” planned around the weather windows, the right lodges, and the trekking.** |

**`/destinations/peru/`**

| | chars | value |
|---|--:|---|
| Title now | 27 | Peru â€” Hit Your Mark Travel |
| **Title new** | **62** | **Peru \| Machu Picchu & the Sacred Valley â€” Hit Your Mark Travel** |
| Desc now | 226 | Machu Picchu, the Sacred Valley, Cusco, Lake Titicaca, and the Amazon. Peru planned around the altitude acclimatization, the archaeological context, and the experiences that convert a Machu Picchu visit into an Andean journey. |
| **Desc new** | **143** | **Machu Picchu, the Sacred Valley, Cusco, Lake Titicaca and the Amazon â€” altitude acclimatization, archaeological context, and an Andean journey.** |

**`/destinations/polar-regions/`**

| | chars | value |
|---|--:|---|
| Title | 36 | Polar Regions â€” Hit Your Mark Travel *(unchanged)* |
| Desc now | 201 | Antarctica, Arctic Norway, Svalbard, Greenland, and Iceland. Polar expedition travel planned around the vessels, naturalists, and windows that deliver the ends of the earth at their most extraordinary. |
| **Desc new** | **143** | **Antarctica, Arctic Norway, Svalbard, Greenland and Iceland â€” polar expeditions planned around the vessels, naturalists and windows that matter.** |

**`/destinations/portugal/`**

| | chars | value |
|---|--:|---|
| Title now | 66 | Portugal \| Lisbon, Porto & the Douro Valley â€” Hit Your Mark Travel |
| **Title new** | **59** | **Portugal \| Lisbon, Porto & the Douro â€” Hit Your Mark Travel** |
| Desc now | 181 | Bespoke Portugal journeys â€” Lisbon's tasca culture, Porto's wine lodges, Douro Valley harvest, the slow Alentejo, and the western Algarve. Tables and quintas booked before you land. |
| **Desc new** | **145** | **Lisbon's tasca culture, Porto's wine lodges, Douro harvest, the slow Alentejo and the western Algarve. Tables and quintas booked before you land.** |

**`/destinations/riviera-maya-los-cabos/`**

| | chars | value |
|---|--:|---|
| Title now | 83 | Riviera Maya & Los Cabos \| Mexico Beach Travel Done Properly â€” Hit Your Mark Travel |
| **Title new** | **47** | **Riviera Maya & Los Cabos â€” Hit Your Mark Travel** |
| Desc now | 170 | Mexico's two great beach coasts, planned properly â€” which Riviera Maya resorts are worth it, when Los Cabos is at its best, and how to avoid the versions that disappoint. |
| **Desc new** | **152** | **Mexico's two great beach coasts â€” which Riviera Maya resorts are worth it, when Los Cabos is at its best, and how to avoid the versions that disappoint.** |

**`/destinations/rwanda/`**

| | chars | value |
|---|--:|---|
| Title now | 29 | Rwanda â€” Hit Your Mark Travel |
| **Title new** | **57** | **Rwanda \| Mountain Gorilla Trekking â€” Hit Your Mark Travel** |
| Desc now | 204 | Mountain gorilla trekking in the Volcanoes National Park. Rwanda's highlands offer the most profound wildlife encounter available anywhere â€” and a country rebuilt around extraordinary small-group tourism. |
| **Desc new** | **151** | **Mountain gorilla trekking in Volcanoes National Park â€” the most profound wildlife encounter available, in a country rebuilt around small-group tourism.** |

**`/destinations/south-america/`**

| | chars | value |
|---|--:|---|
| Title | 36 | South America â€” Hit Your Mark Travel *(unchanged)* |
| Desc now | 191 | Patagonia, Peru, the GalÃ¡pagos, Brazil, Colombia, and Argentina. South American travel planned around the landscapes, lodges, and windows that deliver the continent at its most extraordinary. |
| **Desc new** | **142** | **Patagonia, Peru, the GalÃ¡pagos, Brazil, Colombia and Argentina â€” planned around the landscapes, lodges and windows that deliver the continent.** |

**`/destinations/south-pacific/`**

| | chars | value |
|---|--:|---|
| Title | 36 | South Pacific â€” Hit Your Mark Travel *(unchanged)* |
| Desc now | 186 | French Polynesia, Fiji, New Zealand, Australia, and the Cook Islands. South Pacific travel planned around the overwater villas, private islands, and landscapes that justify the distance. |
| **Desc new** | **142** | **French Polynesia, Fiji, New Zealand, Australia and the Cook Islands â€” the overwater villas, private islands and landscapes worth the distance.** |

**`/destinations/spain/`** â€” no change needed (title 64, description 165)

**`/destinations/st-barths/`**

| | chars | value |
|---|--:|---|
| Title now | 75 | St. Barth's \| Villas, Beaches & the French Caribbean â€” Hit Your Mark Travel |
| **Title new** | **53** | **St. Barth's \| Villas & Beaches â€” Hit Your Mark Travel** |
| Desc | 155 | St. Barth's planned properly â€” which beach to base on, villa versus hotel, how the December window really works, and why the island rewards a return visit. *(unchanged)* |

**`/destinations/thailand/`**

| | chars | value |
|---|--:|---|
| Title | 31 | Thailand â€” Hit Your Mark Travel *(unchanged)* |
| Desc now | 213 | Bangkok, Chiang Mai, the northern hill tribes, and the southern islands. Thailand planned around the food culture, the temples, the specialist guides, and the versions of each destination most visitors never find. |
| **Desc new** | **140** | **Bangkok, Chiang Mai, the northern hill tribes and the southern islands â€” the food culture, temples and specialist guides most visitors miss.** |

**`/destinations/turks-caicos/`**

| | chars | value |
|---|--:|---|
| Title | 37 | Turks & Caicos â€” Hit Your Mark Travel *(unchanged)* |
| Desc now | 238 | Grace Bay, North Caicos, Salt Cay, Pine Cay, and Parrot Cay. Turks &#38; Caicos planned around the right villa or resort on Providenciales, the quieter outer cays, and the diving and whale-watching that the brochures don't always mention. |
| **Desc new** | **148** | **Grace Bay, North Caicos, Salt Cay, Pine Cay and Parrot Cay â€” the right villa on Providenciales, the quieter outer cays, and the winter whale season.** |

**`/destinations/uk-ireland/`** â€” no change needed (title 65, description 136)


### Experiences (12)

**`/experiences/adventure-active-travel/`**

| | chars | value |
|---|--:|---|
| Title | 48 | Adventure & Active Travel â€” Hit Your Mark Travel *(unchanged)* |
| Desc now | 222 | Patagonia, Peru, New Zealand, Iceland, the Dolomites, and beyond. Active travel planned around your fitness level, the right permits, and guides who know the terrain. Not just destinations â€” experiences built around doing. |
| **Desc new** | **149** | **Patagonia, Peru, New Zealand, Iceland and the Dolomites â€” active travel planned around your fitness level, the right permits, and guides who know it.** |

**`/experiences/all-inclusive-vacations/`**

| | chars | value |
|---|--:|---|
| Title | 46 | All-Inclusive Vacations â€” Hit Your Mark Travel *(unchanged)* |
| Desc now | 224 | Mexico, Jamaica, Dominican Republic, St. Lucia, and the Mediterranean. The all-inclusive category spans a remarkable quality range. We know which properties actually deliver â€” and which ones photograph better than they stay. |
| **Desc new** | **154** | **Mexico, Jamaica, the Dominican Republic, St. Lucia and the Mediterranean. Which all-inclusive properties actually deliver, and which just photograph well.** |

**`/experiences/beach-island-escapes/`**

| | chars | value |
|---|--:|---|
| Title | 45 | Beach & Island Escapes â€” Hit Your Mark Travel *(unchanged)* |
| Desc now | 192 | Maldives, Turks &#38; Caicos, Seychelles, St. Barth's, and the South Pacific. Private beach access, direct overwater villas, and the right week for the water. Every property personally vetted. |
| **Desc new** | **147** | **Maldives, Turks & Caicos, Seychelles, St. Barth's and the South Pacific â€” private beach access, overwater villas, and the right week for the water.** |

**`/experiences/cruises/`**

| | chars | value |
|---|--:|---|
| Title now | 73 | Cruises \| Luxury Ocean, River & Expedition Cruises â€” Hit Your Mark Travel |
| **Title new** | **58** | **Cruises \| Ocean, River & Expedition â€” Hit Your Mark Travel** |
| Desc now | 179 | Small-ship ocean voyages, European river cruises, expedition sailings to Antarctica and the GalÃ¡pagos, and private yacht charters â€” matched to the right vessel, cabin, and season. |
| **Desc new** | **155** | **Small-ship ocean voyages, European rivers, expedition sailings to Antarctica and the GalÃ¡pagos, and private charters â€” matched to vessel, cabin and season.** |

**`/experiences/culture-immersive-travel/`**

| | chars | value |
|---|--:|---|
| Title | 49 | Culture & Immersive Travel â€” Hit Your Mark Travel *(unchanged)* |
| Desc now | 213 | Japan, Italy, Morocco, Jordan, Greece, and beyond. Cultural travel planned around depth over breadth â€” private expert guides, genuine access, and the kind of understanding that doesn't come from a highlights tour. |
| **Desc new** | **137** | **Japan, Italy, Morocco, Jordan and Greece â€” cultural travel planned for depth over breadth, with private expert guides and genuine access.** |

**`/experiences/family-travel/`**

| | chars | value |
|---|--:|---|
| Title | 36 | Family Travel â€” Hit Your Mark Travel *(unchanged)* |
| Desc now | 197 | Mexico, Costa Rica, Hawaii, Europe, and beyond. Family travel planned around how families actually travel â€” not adult itineraries with kids added on. Every detail vetted from check-in to check-out. |
| **Desc new** | **144** | **Mexico, Costa Rica, Hawaii and Europe â€” family travel planned around how families actually travel, not adult itineraries with children added on.** |

**`/experiences/food-wine-travel/`**

| | chars | value |
|---|--:|---|
| Title | 41 | Food & Wine Travel â€” Hit Your Mark Travel *(unchanged)* |
| Desc now | 219 | Italy, Japan, France, Spain, California, and Peru. Food and wine travel planned around producers, markets, and the people making what ends up on the table â€” not just the restaurants that have already been written about. |
| **Desc new** | **154** | **Italy, Japan, France, Spain, California and Peru â€” built around the producers, markets and people making the food, not the restaurants already written up.** |

**`/experiences/multigenerational-travel/`**

| | chars | value |
|---|--:|---|
| Title | 47 | Multigenerational Travel â€” Hit Your Mark Travel *(unchanged)* |
| Desc now | 231 | Italy, Japan, Hawaii, Portugal, and beyond. Multigenerational travel planned around what actually works when grandparents, parents, and kids are all on the same trip â€” pacing, villa configurations, shared time and independent time. |
| **Desc new** | **156** | **Italy, Japan, Hawaii and Portugal â€” planned around what works when grandparents, parents and kids travel together: pacing, villas, shared and separate time.** |

**`/experiences/romance-celebration-travel/`**

| | chars | value |
|---|--:|---|
| Title now | 80 | Romance Travel \| Honeymoons, Anniversaries & Celebrations â€” Hit Your Mark Travel |
| **Title new** | **51** | **Romance & Celebration Travel â€” Hit Your Mark Travel** |
| Desc now | 167 | Honeymoons, anniversaries, proposals, and milestone celebrations â€” planned with zero margin for error. The room, the table, the moments, all arranged before you leave. |
| **Desc new** | **157** | **Honeymoons, anniversaries, proposals and milestone celebrations, planned with zero margin for error. The room, the table and the moments arranged in advance.** |

**`/experiences/safari-wildlife-travel/`**

| | chars | value |
|---|--:|---|
| Title | 47 | Safari & Wildlife Travel â€” Hit Your Mark Travel *(unchanged)* |
| Desc now | 171 | Botswana, Kenya, Tanzania, South Africa, Rwanda. Private camps, expert guides, and the kind of access that makes a safari unforgettable. Every property personally visited. |
| **Desc new** | **140** | **Botswana, Kenya, Tanzania, South Africa and Rwanda â€” private camps, expert guides, and the access that separates a safari from a game drive.** |

**`/experiences/sports-event-travel/`**

| | chars | value |
|---|--:|---|
| Title | 44 | Sports & Event Travel â€” Hit Your Mark Travel *(unchanged)* |
| Desc now | 167 | Courtside at Wimbledon. Trackside at Monaco. Fairways at Augusta. The world's great sporting moments â€” with VIP access, luxury accommodation, and every detail handled. |
| **Desc new** | **135** | **Courtside at Wimbledon, trackside at Monaco, fairways at Augusta â€” the great sporting moments with VIP access and every detail handled.** |

**`/experiences/wellness-retreat-travel/`**

| | chars | value |
|---|--:|---|
| Title | 48 | Wellness & Retreat Travel â€” Hit Your Mark Travel *(unchanged)* |
| Desc now | 211 | Bali, Sri Lanka, Japan, Mexico, and beyond. Wellness travel planned around what you actually need â€” genuine programs, vetted practitioners, and properties that deliver restoration rather than just describing it. |
| **Desc new** | **143** | **Bali, Sri Lanka, Japan and Mexico â€” wellness travel built on genuine programs and vetted practitioners, at properties that deliver restoration.** |


### Travel Journal (29)

**`/travel-journal/africa-destination-guide/`**

| | chars | value |
|---|--:|---|
| Title now | 118 | The Africa Destination Guide: Safari Camp Selection and Six Regions Worth Understanding â€” Hit Your Mark Travel Journal |
| **Title new** | **59** | **The Africa Destination Guide â€” Hit Your Mark Travel Journal** |
| Desc now | 206 | From the Okavango Delta to gorilla country to Morocco's medinas â€” six African regions, why camp selection matters more than any other decision in safari travel, and the properties that consistently deliver. |
| **Desc new** | **152** | **Six African regions, why camp selection matters more than any other safari decision, and the properties that consistently deliver â€” Okavango to Morocco.** |

**`/travel-journal/african-safari-calendar/`**

| | chars | value |
|---|--:|---|
| Title now | 79 | The African Safari Calendar: When to Go for What â€” Hit Your Mark Travel Journal |
| **Title new** | **58** | **The African Safari Calendar â€” Hit Your Mark Travel Journal** |
| Desc now | 206 | Africa's safari regions run on different seasonal logics. Here's the month-by-month breakdown â€” migration cycles, dry season windows, and why the green season is more compelling than most travelers realize. |
| **Desc new** | **149** | **Africa's regions run on different seasonal logics. The month-by-month breakdown: migration cycles, dry-season windows, and the case for green season.** |

**`/travel-journal/amanjiwo-field-report/`**

| | chars | value |
|---|--:|---|
| Title | 55 | Three Nights at Amanjiwo â€” Hit Your Mark Travel Journal *(unchanged)* |
| Desc now | 189 | Borobudur at dawn, a private pool facing the volcanoes, and a staff-to-guest ratio that makes the phrase 'dedicated service' finally mean something. Here is what the experience actually is. |
| **Desc new** | **150** | **Borobudur at dawn, a private pool facing the volcanoes, and a staff-to-guest ratio that makes 'dedicated service' mean something. What it actually is.** |

**`/travel-journal/asia-destination-guide/`**

| | chars | value |
|---|--:|---|
| Title now | 142 | The Asia Destination Guide: Six Regions, the Right Season, and Why Asia Requires a Different Planning Framework â€” Hit Your Mark Travel Journal |
| **Title new** | **57** | **The Asia Destination Guide â€” Hit Your Mark Travel Journal** |
| Desc now | 209 | Japan, Bhutan, Southeast Asia, Indonesia, India, and the Maldives â€” six Asian regions that require fundamentally different planning approaches, the seasonal logic behind each, and the properties worth knowing. |
| **Desc new** | **147** | **Japan, Bhutan, Southeast Asia, Indonesia, India and the Maldives â€” six regions needing fundamentally different planning, and the logic behind each.** |

**`/travel-journal/botswana-shoulder-season/`**

| | chars | value |
|---|--:|---|
| Title now | 96 | Botswana Before the Crowd: Why Shoulder Season Changes Everything â€” Hit Your Mark Travel Journal |
| **Title new** | **56** | **Botswana Before the Crowd â€” Hit Your Mark Travel Journal** |
| Desc now | 183 | Moremi Game Reserve in May and June â€” before the crowds and while the water levels are still rising â€” is a different kind of safari experience. Here's the version worth knowing about. |
| **Desc new** | **141** | **Moremi in May and June, before the crowds and while the water is still rising, is a different safari. Here's the version worth knowing about.** |

**`/travel-journal/caribbean-mexico-destination-guide/`**

| | chars | value |
|---|--:|---|
| Title now | 103 | The Caribbean & Mexico Destination Guide: How to Choose the Right Island â€” Hit Your Mark Travel Journal |
| **Title new** | **59** | **The Caribbean & Mexico Guide â€” Hit Your Mark Travel Journal** |
| Desc now | 200 | Six Caribbean and Mexico destinations, their honest differences, when to go, which properties actually earn their rates, and why the island you choose matters more than any other decision you'll make. |
| **Desc new** | **144** | **Six Caribbean and Mexico destinations, their honest differences, when to go, and why the island you choose matters more than any other decision.** |

**`/travel-journal/europe-destination-guide/`**

| | chars | value |
|---|--:|---|
| Title now | 104 | The Europe Destination Guide: Choosing the Right Version of the Continent â€” Hit Your Mark Travel Journal |
| **Title new** | **59** | **The Europe Destination Guide â€” Hit Your Mark Travel Journal** |
| Desc now | 196 | From the Amalfi cliff hotels to ProvenÃ§al village stays to Norway's fjord country â€” six European regions, their honest character, when the season matters, and the properties that earn their rates. |
| **Desc new** | **148** | **Six European regions, their honest character, when the season matters, and the properties that earn their rates â€” Amalfi cliffs to Norwegian fjords.** |

**`/travel-journal/european-grand-tour-mistake/`**

| | chars | value |
|---|--:|---|
| Title now | 80 | The European Grand Tour Is Usually the Wrong Trip â€” Hit Your Mark Travel Journal |
| **Title new** | **62** | **The European Grand Tour Mistake â€” Hit Your Mark Travel Journal** |
| Desc now | 202 | London, Paris, Rome, Florence, Venice, Barcelona in two weeks. It's the most common European itinerary and one of the least satisfying travel experiences available. Here is why â€” and what to do instead. |
| **Desc new** | **154** | **London, Paris, Rome, Florence, Venice and Barcelona in two weeks: the most common European itinerary, and one of the least satisfying. What to do instead.** |

**`/travel-journal/five-star-problem/`**

| | chars | value |
|---|--:|---|
| Title | 52 | The Five-Star Problem â€” Hit Your Mark Travel Journal *(unchanged)* |
| Desc now | 214 | The five-star rating once meant something specific. It no longer does. Here is what actually tells you whether a hotel is exceptional â€” and why the official categories have become nearly useless as a planning tool. |
| **Desc new** | **155** | **The five-star rating once meant something specific. It no longer does. What actually tells you whether a hotel is exceptional, and why the categories fail.** |

**`/travel-journal/glacier-express-field-report/`**

| | chars | value |
|---|--:|---|
| Title | 62 | The Glacier Express, End to End â€” Hit Your Mark Travel Journal *(unchanged)* |
| Desc now | 177 | Zermatt to St. Moritz in eight hours. 291 bridges, 91 tunnels, and one of the most deliberate rail journeys on earth. Here is what the experience is â€” and why direction matters. |
| **Desc new** | **140** | **Zermatt to St. Moritz in eight hours: 291 bridges, 91 tunnels, and one of the most deliberate rail journeys on earth. Why direction matters.** |

**`/travel-journal/heli-ski-field-report/`**

| | chars | value |
|---|--:|---|
| Title now | 85 | A Week of Heli-Skiing: What the Experience Actually Is â€” Hit Your Mark Travel Journal |
| **Title new** | **52** | **A Week of Heli-Skiing â€” Hit Your Mark Travel Journal** |
| Desc now | 298 | No lifts. No groomers. No other tracks in the snow. A helicopter drops you at a peak and you ski back to the valley, then does it again. Here is what a week of heli-skiing in British Columbia actually looks like â€” the runs, the weather, the lodge, and what you need to be able to ski before you go. |
| **Desc new** | **154** | **No lifts, no groomers, no other tracks. What a week of heli-skiing in British Columbia actually looks like â€” the runs, the lodge, and the skiing required.** |

**`/travel-journal/how-hotel-upgrades-work/`** â€” no change needed (title 63, description 139)

**`/travel-journal/in-defense-of-slow-travel/`**

| | chars | value |
|---|--:|---|
| Title | 56 | In Defense of Slow Travel â€” Hit Your Mark Travel Journal *(unchanged)* |
| Desc now | 199 | The case for staying longer, covering less ground, and returning from a trip with something more than a list of places visited. Why slower travel is almost always better â€” and cheaper than you think. |
| **Desc new** | **145** | **The case for staying longer and covering less ground. Why slower travel almost always produces the better trip â€” and costs less than you'd think.** |

**`/travel-journal/kentucky-derby-field-report/`**

| | chars | value |
|---|--:|---|
| Title now | 86 | The Kentucky Derby: What the Race Actually Is to Attend â€” Hit Your Mark Travel Journal |
| **Title new** | **59** | **The Kentucky Derby, Attended â€” Hit Your Mark Travel Journal** |
| Desc now | 239 | It's a two-minute race that takes twelve hours to attend. Both of those facts are exactly right. Here is what the Kentucky Derby experience actually is â€” the tiers, the buildup, the race itself, and how to do Louisville properly around it. |
| **Desc new** | **148** | **A two-minute race that takes twelve hours to attend, and both facts are right. The tiers, the buildup, the race, and how to do Louisville around it.** |

**`/travel-journal/masters-field-report/`**

| | chars | value |
|---|--:|---|
| Title now | 87 | The Masters: What Augusta National Actually Is to Attend â€” Hit Your Mark Travel Journal |
| **Title new** | **62** | **The Masters at Augusta National â€” Hit Your Mark Travel Journal** |
| Desc now | 217 | The badge waiting list closed in 1978. The concession prices haven't changed in decades. No phones, no advertising, no crowds in the usual sense. Here is what The Masters experience actually is â€” and how access works. |
| **Desc new** | **147** | **The badge waiting list closed in 1978. No phones, no advertising, no crowds in the usual sense. What The Masters actually is, and how access works.** |

**`/travel-journal/mediterranean-october/`**

| | chars | value |
|---|--:|---|
| Title | 59 | The Mediterranean in October â€” Hit Your Mark Travel Journal *(unchanged)* |
| Desc now | 189 | September is still crowded and expensive. October changes everything â€” the heat is gone, the crowds have left, the sea is still warm, and harvest season is underway across Italy and Greece. |
| **Desc new** | **150** | **September is still crowded and expensive. October changes everything: the heat gone, the sea still warm, and harvest underway across Italy and Greece.** |

**`/travel-journal/middle-east-destination-guide/`**

| | chars | value |
|---|--:|---|
| Title now | 145 | The Middle East Destination Guide: Six Regions, Ancient History, and the World's Newest Hospitality Infrastructure â€” Hit Your Mark Travel Journal |
| **Title new** | **52** | **The Middle East Guide â€” Hit Your Mark Travel Journal** |
| Desc now | 215 | The UAE, Jordan, Oman, Saudi Arabia, Egypt, and Turkey â€” why the Middle East is the most consistently underestimated luxury travel region in the world, the seasonal logic behind it, and the properties worth knowing. |
| **Desc new** | **147** | **The UAE, Jordan, Oman, Saudi Arabia, Egypt and Turkey â€” the most consistently underestimated luxury region, its seasonal logic, and the properties.** |

**`/travel-journal/napa-sonoma-winery-route/`**

| | chars | value |
|---|--:|---|
| Title now | 105 | The Napa & Sonoma Winery Route: How to Actually Drink Well in Wine Country â€” Hit Your Mark Travel Journal |
| **Title new** | **61** | **The Napa & Sonoma Winery Route â€” Hit Your Mark Travel Journal** |
| Desc now | 188 | A 2 and 3-day winery route through Napa Valley and Sonoma â€” the appointments worth making, the properties worth staying at, and the mistakes most wine country trips make before they start. |
| **Desc new** | **155** | **A 2- and 3-day winery route through Napa and Sonoma: the appointments worth making, where to stay, and the mistakes most wine trips make before they start.** |

**`/travel-journal/north-america-destination-guide/`**

| | chars | value |
|---|--:|---|
| Title now | 107 | The North America Destination Guide: Six Regions Worth Booking Intentionally â€” Hit Your Mark Travel Journal |
| **Title new** | **54** | **The North America Guide â€” Hit Your Mark Travel Journal** |
| Desc now | 199 | From Alaskan wilderness lodges to Utah desert sanctuaries to Hawaii's most exclusive island â€” six North American regions, their honest character, when to go, and the properties that earn their rates. |
| **Desc new** | **150** | **Six North American regions, their honest character, when to go, and the properties that earn their rates â€” Alaskan lodges to Hawaii's quietest island.** |

**`/travel-journal/polar-destination-guide/`**

| | chars | value |
|---|--:|---|
| Title now | 118 | The Polar Regions Guide: Antarctica, the Arctic, and the Case for the Ends of the Earth â€” Hit Your Mark Travel Journal |
| **Title new** | **54** | **The Polar Regions Guide â€” Hit Your Mark Travel Journal** |
| Desc now | 226 | Antarctica, Svalbard, Greenland, Iceland, South Georgia, and Alaska â€” why polar travel operates on a completely different planning logic than anywhere else, and the expedition vessels and lodges worth building the trip around. |
| **Desc new** | **153** | **Antarctica, Svalbard, Greenland, Iceland and South Georgia â€” why polar travel runs on completely different planning logic, and the vessels worth booking.** |

**`/travel-journal/private-guide-advantage/`**

| | chars | value |
|---|--:|---|
| Title now | 102 | The Private Guide Advantage: What Separates Great Guides from Good Ones â€” Hit Your Mark Travel Journal |
| **Title new** | **58** | **The Private Guide Advantage â€” Hit Your Mark Travel Journal** |
| Desc now | 198 | The difference between a licensed guide and an exceptional one isn't credentials â€” it's depth, specialization, and the right questions asked before the day begins. How to find the ones worth hiring. |
| **Desc new** | **156** | **The difference between a licensed guide and an exceptional one isn't credentials. It's depth, specialization, and the questions asked before the day starts.** |

**`/travel-journal/safari-planning-12-questions/`**

| | chars | value |
|---|--:|---|
| Title now | 93 | Safari Planning: The 12 Questions Worth Asking Before You Book â€” Hit Your Mark Travel Journal |
| **Title new** | **60** | **Safari Planning: 12 Questions â€” Hit Your Mark Travel Journal** |
| Desc now | 187 | Most people ask about price and availability. The questions that actually determine the quality of a safari â€” camp size, guide tenure, vehicle policy â€” rarely come up until it's too late. |
| **Desc new** | **154** | **Most people ask about price and availability. The questions that decide safari quality â€” camp size, guide tenure, vehicle policy â€” rarely come up in time.** |

**`/travel-journal/singita-grumeti-field-report/`**

| | chars | value |
|---|--:|---|
| Title | 61 | Four Nights at Singita Grumeti â€” Hit Your Mark Travel Journal *(unchanged)* |
| Desc now | 175 | The migration crosses the Western Corridor in July. Here's what that actually looks like from the camp â€” and what separates Grumeti from the other properties in the ecosystem. |
| **Desc new** | **147** | **The migration crosses the Western Corridor in July. What that looks like from camp, and what separates Grumeti from the other Serengeti properties.** |

**`/travel-journal/south-america-destination-guide/`**

| | chars | value |
|---|--:|---|
| Title now | 105 | The South America Destination Guide: Six Regions Beyond the Marquee Images â€” Hit Your Mark Travel Journal |
| **Title new** | **54** | **The South America Guide â€” Hit Your Mark Travel Journal** |
| Desc now | 224 | Argentina, Chile, Peru, the GalÃ¡pagos, Colombia, and Brazil â€” why South America's luxury travel product is underused almost entirely because of a perception gap, and the properties and seasons worth building the trip around. |
| **Desc new** | **154** | **Argentina, Chile, Peru, the GalÃ¡pagos, Colombia and Brazil â€” why the continent's luxury product is underused on a perception gap, and the seasons to book.** |

**`/travel-journal/south-pacific-destination-guide/`**

| | chars | value |
|---|--:|---|
| Title now | 142 | The South Pacific Destination Guide: Six Regions, the Case for the Long Flight, and the Lagoons That Justify It â€” Hit Your Mark Travel Journal |
| **Title new** | **54** | **The South Pacific Guide â€” Hit Your Mark Travel Journal** |
| Desc now | 222 | French Polynesia, Fiji, New Zealand, Australia, the Cook Islands, and Melanesia â€” why the South Pacific rewards the traveler willing to commit to the distance, and the properties and seasons worth building the trip around. |
| **Desc new** | **143** | **French Polynesia, Fiji, New Zealand, Australia and the Cook Islands â€” why the South Pacific rewards committing to the distance, and when to go.** |

**`/travel-journal/the-case-for-shoulder-season/`**

| | chars | value |
|---|--:|---|
| Title | 59 | The Case for Shoulder Season â€” Hit Your Mark Travel Journal *(unchanged)* |
| Desc now | 194 | Peak season is the most crowded, most expensive version of most destinations. Here's why the months on either side almost always produce the better trip â€” and the specific windows worth knowing. |
| **Desc new** | **155** | **Peak season is the most crowded, most expensive version of any destination. Why the months on either side produce the better trip, and the windows to book.** |

**`/travel-journal/what-a-travel-advisor-actually-does/`**

| | chars | value |
|---|--:|---|
| Title now | 90 | What a Travel Advisor Actually Does (And Why It's Worth It) â€” Hit Your Mark Travel Journal |
| **Title new** | **57** | **What a Travel Advisor Does â€” Hit Your Mark Travel Journal** |
| Desc | 146 | The honest answer is less glamorous than the brochure version. Here's what a travel advisor actually does â€” and why the right one pays for itself. *(unchanged)* |

**`/travel-journal/what-hotel-descriptions-actually-mean/`**

| | chars | value |
|---|--:|---|
| Title now | 68 | What Hotel Descriptions Actually Mean â€” Hit Your Mark Travel Journal |
| **Title new** | **59** | **What Hotel Descriptions Mean â€” Hit Your Mark Travel Journal** |
| Desc now | 181 | A translation guide for the language hotels use in their room descriptions â€” what the words signal, what they obscure, and the three questions worth asking before you book any room. |
| **Desc new** | **142** | **A translation guide for hotel room descriptions â€” what the words signal, what they hide, and the three questions worth asking before you book.** |

**`/travel-journal/willamette-valley-winery-route/`**

| | chars | value |
|---|--:|---|
| Title now | 94 | The Willamette Valley Winery Route: Oregon's Answer to Burgundy â€” Hit Your Mark Travel Journal |
| **Title new** | **58** | **The Willamette Valley Route â€” Hit Your Mark Travel Journal** |
| Desc | 164 | A 2 and 3-day winery route through the Willamette Valley â€” Dundee Hills, Ribbon Ridge, Eola-Amity, and the wineries that made Oregon Pinot Noir worth traveling for. *(unchanged)* |


