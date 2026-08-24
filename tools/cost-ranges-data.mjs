/**
 * The cost-range rows seeded from docs/seo/research-backfill-2026-08-09.md,
 * keyed by content-page file. Consumed by tools/p3-8-cost-insert.mjs.
 *
 * 80 rows as of 2026-08-24: 58 carry a band, 22 carry `noBand`, none are held.
 * Do not trust those numbers if the file has been touched since — derive them,
 * the way p3-8-cost-insert.mjs does at the end of every run. This header has
 * been wrong twice: it said 54 rows and 11 held long after the M7 pages added
 * 25 held rows in one go.
 *
 * ── The two shapes a row can take ──
 *
 * `range` — an editorial planning band: USD, two adults sharing,
 * five-star/boutique tier, shoulder season. Not quotes.
 *
 * `noBand` — a row that will never carry a band, per DECISIONS.md D8. These
 * are NOT waiting on a figure and `held` has been retired as a state. A nightly
 * two-adult band is simply the wrong unit for them: a voyage priced per cabin
 * and per departure, a region spanning three countries, a desert leg priced per
 * vehicle, a government fee that is one line of a day rate. No supplier
 * confirmation unblocks any of that, and researching a number for one produces
 * a number that is precise and false. They render the includes, excludes,
 * drivers and source with `unit` where the figure would go and `noBand` where
 * the basis line would go.
 *
 * A `noBand` row's `unit` must contain NO currency amount. The renderer throws
 * on one, and the `cost-figure-shape` check fails the build if one ships.
 *
 * ── The source is an anchor, not evidence ──
 *
 * The band is editorial and is NOT derived from its `source`. The source is an
 * authority anchor for one concrete, checkable fee of the kind the entry
 * references — destinations__europe.html carries a whole-of-Europe band cited
 * to the price of a Louvre ticket, and never names the Louvre in its own
 * strings. Anyone re-shopping a row should know this before deciding a band is
 * unpublishable because no rate card proves it. Not one of the 58 would survive
 * that test.
 *
 * Every `noBand` row carries at least one concrete, checkable number in its
 * `drivers` — a park tariff, a government levy, a permit fee, a season window.
 * That is what earns the section its place without a headline figure.
 *
 * ── Dates ──
 *
 * Most rows are dated by the global VERIFIED below. A row re-shopped later
 * carries its own `verified` override, so it states the day it was actually
 * checked rather than inheriting a date nobody looked at it on. Nine rows carry
 * 2026-08-20; six carry 2026-08-24. `noBand` rows carry none — they make no
 * claim that needs a date, and renderNoBandSection emits no verified element.
 *
 * Two of the six 2026-08-24 bands are the weakest in the file and are marked
 * here rather than in the copy: `argentina` and `colombia` both rest on
 * aggregator room anchors with no verified ground-cost data. Re-shop those two
 * first. #108.
 */
export const VERIFIED = { datetime: "2026-08-09", label: "August 2026" };

export const COST_RANGES = {
  /* ── Destinations · broad regions ── */
  "destinations__africa.html": {
    range: "$800–$3,000",
    includes: [
      "A luxury safari camp or lodge on an all-inclusive basis",
      "All meals and house drinks, with laundry at most camps",
      "Twice-daily shared game activities and core park or reserve fees",
    ],
    excludes: [
      "International and inter-camp flights unless expressly stated",
      "Premium wines, private-vehicle upgrades, visas and insurance",
      "Gratuities for guides and camp staff",
    ],
    drivers: [
      "Country and concession — the same night prices very differently across the continent",
      "Migration timing and dry-season demand",
      "Camp exclusivity and fly-in logistics",
    ],
    source: { text: "TANAPA park tariffs", href: "https://www.tanzaniaparks.go.tz/tourism/visitor-information/tariff" },
  },
  "destinations__asia.html": {
    range: "$500–$1,400",
    includes: [
      "Five-star or boutique hotels, breakfast included",
      "Private transfers between cities and airports",
      "Private guiding, core admissions and selected meals",
    ],
    excludes: [
      "International airfare to the region",
      "Most lunches and dinners, visas and insurance",
      "Optional spa treatments, premium experiences and gratuities",
    ],
    drivers: [
      "Country and city mix — packaged luxury sits at the low end, private bespoke at the top",
      "Hotel and suite category",
      "How many days carry a private guide, plus domestic flights",
    ],
    source: { text: "Japan National Tourism Organization", href: "https://www.japan.travel/en/plan/" },
  },
  "destinations__europe.html": {
    range: "$700–$1,500",
    includes: [
      "Five-star or boutique hotels with breakfast",
      "Private transfers and private guiding",
      "Principal admissions and selected rail or short-haul segments",
    ],
    excludes: [
      "Transatlantic airfare",
      "Most meals and city taxes unless packaged",
      "Major-event tickets and room-category upgrades",
    ],
    drivers: [
      "Country and city — capital-city five-stars set the ceiling",
      "Hotel tier and the driver-guide versus rail mix",
      "Major events and festival weeks",
    ],
    source: { text: "Louvre admission prices", href: "https://www.louvre.fr/en/visit/hours-admission/tickets-and-prices" },
  },
  "destinations__middle-east.html": {
    range: "$600–$1,600",
    includes: [
      "Luxury hotels with breakfast",
      "A private driver and transfers throughout",
      "Private guiding, key admissions and selected meals",
    ],
    excludes: [
      "International airfare and visas",
      "Most meals outside touring days",
      "Premium desert-camp and aviation experiences, plus gratuities",
    ],
    drivers: [
      "Country and routing — internal flights and desert camps move the number most",
      "Hotel tier and guiding intensity",
      "Winter-sun demand at the Gulf resorts",
    ],
    source: { text: "U.S. State Department travel advisories", href: "https://travel.state.gov/en/international-travel/travel-advisories/global-events/middle-east.html" },
  },
  "destinations__north-america.html": {
    range: "$600–$1,200",
    includes: [
      "Luxury hotels or lodges with breakfast",
      "Private or premium ground transport",
      "Core guiding and park admissions",
    ],
    excludes: [
      "Airfare to the destination",
      "Most meals and reservations not packaged",
      "Optional helicopter or floatplane access, plus gratuities",
    ],
    drivers: [
      "City stays versus remote lodges — remote access carries the premium",
      "Guide and vehicle days",
      "Park, rail and event availability in the travel window",
    ],
    source: { text: "U.S. National Park Service entrance fees", href: "https://www.nps.gov/aboutus/entrance-fee-prices.htm" },
  },
  "destinations__polar-regions.html": {
    range: "$14,000–$50,000",
    includes: [
      "A twin-share expedition cabin",
      "All onboard meals and the expedition team's lecture program",
      "Zodiac landings and standard expedition gear where stated",
    ],
    excludes: [
      "Air to the gateway port and pre- or post-voyage hotels",
      "Evacuation insurance, premium cabins and specialty activities",
      "Some gratuities, depending on the operator",
    ],
    drivers: [
      "Which pole and route — the Ross Sea and the high Arctic sit at the top",
      "Voyage length, ship and cabin category",
      "Fly-cruise options and activity add-ons",
    ],
    source: { text: "IAATO visitor guidelines", href: "https://iaato.org/visiting-antarctica/visitor-guidelines-library" },
  },
  "destinations__south-america.html": {
    range: "$600–$1,200",
    includes: [
      "Luxury hotels with breakfast",
      "Private transfers and guides",
      "Key admissions, selected domestic transport and some meals",
    ],
    excludes: [
      "International airfare",
      "Most meals; expedition-cruise segments like the Galápagos price separately",
      "Insurance and gratuities",
    ],
    drivers: [
      "Country and remoteness — lodge access drives cost more than city choice",
      "Domestic flight legs",
      "Lodge and hotel tier, plus guiding",
    ],
    source: { text: "CONAF Torres del Paine", href: "https://www.conaf.cl/parque_nacionales/parque-nacional-torres-del-paine/" },
  },
  "destinations__south-pacific.html": {
    range: "$600–$1,900",
    includes: [
      "Half of a double luxury room or villa",
      "Breakfast, or full board only where the resort states it",
      "Standard non-motorized resort amenities",
    ],
    excludes: [
      "International and inter-island flights",
      "Boat or helicopter transfers, taxes and service charges",
      "Premium dining, spa and diving",
    ],
    drivers: [
      "Island remoteness and transfer logistics",
      "Overwater villa versus garden or beach room",
      "Meal-plan level",
    ],
    source: { text: "Tourism Fiji", href: "https://www.fiji.travel/" },
  },

  /* ── Destinations · countries and places ── */
  "destinations__alaska.html": {
    range: "$600–$1,100",
    includes: [
      "Premium or luxury lodging, with road and rail transfers",
      "Selected wildlife and glacier activities",
      "Some meals, typically breakfast and lodge dinners",
    ],
    excludes: [
      "Airfare to Alaska and any cruise component",
      "Most meals unless stated",
      "Helicopter flightseeing and gratuities",
    ],
    drivers: [
      "Remote fly-in lodges versus road-and-rail itineraries",
      "Wildlife season timing",
      "Rail class and flightseeing add-ons",
    ],
    source: { text: "Denali National Park fees", href: "https://www.nps.gov/dena/planyourvisit/fees.htm" },
  },
  "destinations__antarctica.html": {
    range: "$14,000–$35,000",
    includes: [
      "A twin-share expedition cabin with all meals",
      "The expedition team, lectures and Zodiac landings",
      "Standard cold-weather gear where the operator provides it",
    ],
    excludes: [
      "Air to Ushuaia or Punta Arenas, and pre-voyage hotels",
      "Evacuation insurance and premium cabin categories",
      "Optional kayaking, helicopter and submersible programs; some gratuities",
    ],
    drivers: [
      "Route and length — a Peninsula voyage versus South Georgia or the Ross Sea",
      "Ship and cabin category",
      "Fly-cruise versus sailing the Drake Passage",
    ],
    source: { text: "IAATO", href: "https://iaato.org/visiting-antarctica" },
  },
  "destinations__botswana.html": {
    range: "$900–$3,300",
    includes: [
      "A luxury camp on an all-inclusive basis",
      "All meals and house drinks, with laundry at most camps",
      "Twice-daily shared safari activities and core fees",
    ],
    excludes: [
      "International and inter-camp flights unless stated",
      "Premium wines and private-vehicle upgrades",
      "Gratuities",
    ],
    drivers: [
      "Delta water levels and the concession the camp sits on",
      "Season — the June–October dry season commands the top of the band",
      "Camp tier and fly-in routing",
    ],
    source: { text: "Botswana Dept. of Wildlife & National Parks", href: "https://www.gov.bw/tourism/group-tours-national-parks-game-reserves-or-campsites" },
  },
  "destinations__canadian-rockies.html": {
    range: "$700–$1,400",
    includes: [
      "Luxury hotels and lodges, with premium transfers",
      "Scheduled activities and stated park admissions",
      "Breakfast and selected meals",
    ],
    excludes: [
      "International airfare",
      "Rocky Mountaineer upgrades and flightseeing",
      "Most free-time meals and gratuities",
    ],
    drivers: [
      "Lodge category at Banff and Lake Louise",
      "Rocky Mountaineer service level",
      "Private touring versus small group in peak summer",
    ],
    source: { text: "Parks Canada Banff fees", href: "https://parks.canada.ca/pn-np/ab/banff/visit/tarifs-fees" },
  },
  "destinations__egypt.html": {
    range: "$450–$1,600",
    includes: [
      "Five-star hotels, and a luxury Nile cruise segment where stated",
      "Private transfers and an Egyptologist guide",
      "Core admissions, selected meals and domestic flights where stated",
    ],
    excludes: [
      "International airfare and the visa",
      "Gratuities — a real line item in Egypt",
      "Optional tomb tickets and premium suites",
    ],
    drivers: [
      "Nile vessel and cabin category",
      "Egyptologist caliber and private-guide days",
      "Domestic air and special-access sites",
    ],
    source: { text: "Experience Egypt", href: "https://www.experienceegypt.eg/en" },
  },
  "destinations__fiji.html": {
    range: "$300–$1,400",
    includes: [
      "Half of a luxury room, bure or villa",
      "Breakfast, or all-inclusive only where the resort states it",
      "Standard resort activities",
    ],
    excludes: [
      "International airfare and island transfers",
      "Taxes and service charges where billed separately",
      "Spa, diving and gratuities",
    ],
    drivers: [
      "Main-island versus private-island resorts",
      "Villa category and meal plan",
      "Boat versus seaplane transfer",
    ],
    source: { text: "Fiji Revenue & Customs Service", href: "https://frcs.org.fj/our-services/customs/travellers/departing-the-country/" },
  },
  "destinations__france.html": {
    range: "$700–$1,400",
    includes: [
      "Five-star or boutique hotels with breakfast",
      "Private transfers and guiding",
      "Main admissions and selected rail segments",
    ],
    excludes: [
      "Transatlantic airfare",
      "Most meals, and the nightly city tax unless packaged",
      "Event premiums and gratuities",
    ],
    drivers: [
      "Paris and the Riviera versus the rest of the country",
      "Hotel tier and driver-guide days",
      "Event season — festive Paris and the Riviera exceed the band",
    ],
    source: { text: "official French tourist-tax schedule", href: "https://entreprendre.service-public.fr/vosdroits/F31635" },
  },
  "destinations__french-polynesia.html": {
    range: "$600–$1,900",
    includes: [
      "Half of a luxury room or overwater bungalow",
      "Breakfast only where the resort includes it",
      "Standard resort facilities",
    ],
    excludes: [
      "International and inter-island flights",
      "Boat or helicopter transfers, taxes and service charges",
      "Meals, spa, diving and gratuities",
    ],
    drivers: [
      "Bora Bora versus Tahiti and Moorea",
      "Villa tier, lagoon view and private pool",
      "Dry-season demand, May through October",
    ],
    source: { text: "Tahiti Tourisme", href: "https://www.tahititourisme.com/" },
  },
  "destinations__galapagos.html": {
    range: "$10,950–$21,900 for a seven-night voyage",
    includes: [
      "A shared luxury cabin or suite, with all meals and open bar",
      "Twice-daily island landings with licensed naturalists",
      "Wi-Fi, equipment and qualifying island transfers",
    ],
    excludes: [
      "Mainland Ecuador hotels and flights",
      "The $200 park entry levy and $20 transit control card",
      "Insurance and gratuities",
    ],
    drivers: [
      "Vessel and suite category",
      "Seven versus fourteen nights aboard",
      "Festive-week departures and full charters",
    ],
    source: { text: "Galápagos National Park entry levy", href: "https://galapagos.gob.ec/tributo-de-ingreso/" },
  },
  "destinations__greece.html": {
    range: "$900–$1,600",
    includes: [
      "Luxury rooms with breakfast",
      "Private or small-group transfers and guiding",
      "Principal admissions and selected meals",
    ],
    excludes: [
      "International airfare",
      "Most meals; ferries and domestic flights unless stated",
      "Beach clubs and gratuities",
    ],
    drivers: [
      "Island mix and logistics",
      "Mykonos and Santorini room rates in peak season",
      "Private touring intensity",
    ],
    source: { text: "Hellenic Heritage e-ticket portal", href: "https://hhticket.gr/tap_b2c_new/english/" },
  },
  "destinations__iceland.html": {
    range: "$1,100–$1,900",
    includes: [
      "Luxury rooms with breakfast",
      "A private vehicle and guide, or a high-end small group",
      "Transfers and core excursions",
    ],
    excludes: [
      "International airfare",
      "Most meals",
      "Helicopter, snowmobile, glacier and spa upgrades, plus gratuities",
    ],
    drivers: [
      "Private-guide and 4x4 days",
      "Season — aurora winter versus midnight-sun summer",
      "Remoteness and adventure add-ons",
    ],
    source: { text: "Vatnajökull National Park", href: "https://www.vatnajokulsthjodgardur.is/en/" },
  },
  "destinations__italy.html": {
    range: "$1,000–$1,800",
    includes: [
      "Luxury rooms with breakfast",
      "Private transfers throughout",
      "Expert guides, priority admissions and selected meals",
    ],
    excludes: [
      "Transatlantic airfare",
      "Most meals and wine",
      "Premium rail unless stated, and gratuities",
    ],
    drivers: [
      "Region — the Lakes, the Amalfi Coast and Venice set the ceiling",
      "Room and view category",
      "Private access, boat days and driver days",
    ],
    source: { text: "Vatican Museums admission", href: "https://www.museivaticani.va/content/museivaticani/en/organizza-visita/tariffe-e-biglietti.html" },
  },
  "destinations__japan.html": {
    range: "$1,300–$2,500",
    includes: [
      "Luxury hotels and ryokan, with breakfast and selected dinners",
      "Private transfers and guides",
      "Reserved rail seats and key experiences",
    ],
    excludes: [
      "International airfare",
      "Most meals and luggage shipping",
      "Premium train and air upgrades, plus gratuities",
    ],
    drivers: [
      "Cherry-blossom and autumn-foliage dates",
      "Ryokan tier and luxury-train segments",
      "Private guide-and-vehicle days versus rail",
    ],
    source: { text: "Japan Rail Pass pricing", href: "https://japanrailpass.net/en/purchase/price/" },
  },
  "destinations__jordan.html": {
    range: "$650–$1,200",
    includes: [
      "Luxury hotels and a desert camp, with breakfast and selected dinners",
      "A private driver-guide throughout",
      "Petra admission or the Jordan Pass where eligible",
    ],
    excludes: [
      "International airfare, and the visa where applicable",
      "Most lunches",
      "Optional special-access sites and gratuities",
    ],
    drivers: [
      "Petra and Wadi Rum lodging tier",
      "Vehicle and guide configuration",
      "Dead Sea and Aqaba nights",
    ],
    source: { text: "Petra entrance fees", href: "https://www.visitpetra.jo/en/Petrafees" },
  },
  "destinations__kenya-tanzania.html": {
    range: "$1,000–$2,000",
    includes: [
      "A luxury camp or lodge with meals and drinks",
      "Stated game drives, and park or conservancy fees",
      "Laundry at many camps, plus packaged charter transfers",
    ],
    excludes: [
      "International airfare and visas",
      "City hotels outside the itinerary",
      "Ballooning, premium alcohol, gratuities and insurance",
    ],
    drivers: [
      "Migration position and season",
      "Camp tier, and fly-in versus road transfers",
      "A private vehicle and guide",
    ],
    source: { text: "TANAPA park tariffs", href: "https://www.tanzaniaparks.go.tz/tourism/visitor-information/tariff" },
  },
  "destinations__maldives.html": {
    range: "$900–$2,500",
    includes: [
      "Half of a luxury villa with breakfast",
      "The 10% service charge and 17% TGST",
      "The $12 per-person, per-night Green Tax",
    ],
    excludes: [
      "International airfare",
      "The seaplane or speedboat transfer unless packaged",
      "Other meals, alcohol, spa, diving and gratuities",
    ],
    drivers: [
      "Villa category — overwater with pool tops the band",
      "Meal plan and transfer type",
      "Festive-season dates",
    ],
    source: { text: "Maldives Inland Revenue Authority", href: "https://www.mira.gov.mv/Pages/View/whatisgreentax" },
  },
  "destinations__new-zealand.html": {
    range: "$700–$1,400",
    includes: [
      "Luxury lodges and hotels with breakfast",
      "A private vehicle and guide on touring days",
      "Ground transfers and core activities",
    ],
    excludes: [
      "International and domestic flights unless stated",
      "Most meals",
      "Helicopter access, premium wine and golf, plus gratuities",
    ],
    drivers: [
      "Guide days and remoteness",
      "Lodge tier — the marquee lodges can push past the band",
      "Milford, heli and active add-ons",
    ],
    source: { text: "NZ Department of Conservation", href: "https://www.doc.govt.nz/parks-and-recreation/places-to-go/fiordland/places/fiordland-national-park/things-to-do/tracks/milford-track/" },
  },
  "destinations__oman.html": {
    range: "$650–$1,300",
    includes: [
      "Five-star hotels and a desert camp",
      "Breakfast and selected dinners",
      "A private driver, transfers and core excursions",
    ],
    excludes: [
      "International airfare, and the eVisa where required",
      "Most meals",
      "Spa treatments and gratuities",
    ],
    drivers: [
      "Resort and desert-camp tier",
      "4x4 and guide days",
      "Desert and Musandam logistics",
    ],
    source: { text: "Royal Oman Police eVisa", href: "https://evisa.rop.gov.om/" },
  },
  "destinations__patagonia.html": {
    range: "$700–$1,500",
    includes: [
      "A luxury lodge or hotel, full board where the lodge states it",
      "Included excursions and ground transfers",
      "Stated park admissions",
    ],
    excludes: [
      "Airfare to Chile or Argentina, and domestic legs",
      "Premium boat and helicopter access",
      "Gear rental and gratuities",
    ],
    drivers: [
      "All-inclusive lodges versus town hotels",
      "Chile, Argentina or both — routing drives transfer cost",
      "Guiding and transfer intensity",
    ],
    source: { text: "CONAF Torres del Paine", href: "https://www.conaf.cl/parque_nacionales/parque-nacional-torres-del-paine/" },
  },
  "destinations__peru.html": {
    range: "$700–$1,500",
    includes: [
      "Luxury hotels, with breakfast and selected meals",
      "Private transfers and guides",
      "Admissions, premium rail to Machu Picchu and ground transport",
    ],
    excludes: [
      "International airfare; domestic flights unless listed",
      "Hiram Bingham and top Belmond upgrades",
      "Insurance and gratuities",
    ],
    drivers: [
      "Hotel tier in Cusco and the Sacred Valley",
      "Train class to Machu Picchu",
      "Permits and an Amazon extension",
    ],
    source: { text: "official Machu Picchu tickets", href: "https://www.machupicchu.gob.pe/online-tickets/?lang=en" },
  },
  "destinations__portugal.html": {
    range: "$800–$1,200",
    includes: [
      "Luxury rooms with breakfast",
      "Private transfers and guides",
      "Core admissions and selected food-and-wine experiences",
    ],
    excludes: [
      "Transatlantic airfare",
      "Most meals",
      "Premium bottles, wine shipping and gratuities",
    ],
    drivers: [
      "Lisbon and Porto versus the Douro and Alentejo",
      "Driver and boat days",
      "Private quinta access",
    ],
    source: { text: "VisitPortugal wine tourism", href: "https://www.visitportugal.com/en/content/wine-tourism" },
  },
  "destinations__rwanda.html": {
    range: "$1,500–$3,800",
    includes: [
      "A shared luxury lodge on full board",
      "Standard drinks and lodge service",
      "Scheduled lodge activities",
    ],
    excludes: [
      "The $1,500 per-person, per-trek gorilla permit",
      "Regional and international flights",
      "Helicopter or private transfers unless bundled, plus gratuities",
    ],
    drivers: [
      "Lodge and suite tier — the top lodges rank among Africa's most expensive",
      "Season",
      "Number of trekking days",
    ],
    source: { text: "Visit Rwanda gorilla permits", href: "https://visitrwanda.com/interests/gorilla-tracking/" },
  },
  "destinations__spain.html": {
    range: "$850–$1,500",
    includes: [
      "Five-star or boutique hotels with breakfast",
      "Private transfers and guiding",
      "Standard timed admissions",
    ],
    excludes: [
      "Transatlantic airfare; internal flights unless stated",
      "Most meals and shopping",
      "Optional yacht and helicopter days",
    ],
    drivers: [
      "City and island mix",
      "Room tier in Madrid, Barcelona and the islands",
      "Private and after-hours access",
    ],
    source: { text: "official Alhambra tickets", href: "https://tickets.alhambra-patronato.es/en/" },
  },
  "destinations__thailand.html": {
    range: "$650–$1,200",
    includes: [
      "Five-star hotels with breakfast",
      "Private transfers and licensed guiding",
      "Standard admissions and selected touring meals",
    ],
    excludes: [
      "International airfare; domestic flights where optional",
      "Most dinners",
      "Spa, shopping and gratuities",
    ],
    drivers: [
      "City versus island split",
      "Hotel and villa tier",
      "Private boat days and domestic flights",
    ],
    source: { text: "Tourism Authority of Thailand", href: "https://www.tourismthailand.org/" },
  },
  "destinations__turks-caicos.html": {
    range: "$650–$1,800",
    includes: [
      "Half of a luxury room or suite",
      "Breakfast where the resort bundles it",
      "An arrival transfer, and the 12% accommodation-tax allowance",
    ],
    excludes: [
      "International flights",
      "Other meals; villa chef and provisioning",
      "Spa, yacht and fishing charters, and motorized watersports",
    ],
    drivers: [
      "Grace Bay versus private-island properties",
      "Suite or villa category, and season",
      "Meal plan and boat transfers",
    ],
    source: { text: "Turks & Caicos accommodation tax", href: "https://www.gov.tc/revenue/htt" },
  },
  "destinations__uk-ireland.html": {
    range: "$850–$1,500",
    includes: [
      "Luxury hotels with breakfast",
      "A private driver-guide, or first-class rail",
      "Standard admissions",
    ],
    excludes: [
      "Transatlantic airfare",
      "Most meals, theatre and events",
      "Golf, castle buyouts and gratuities",
    ],
    drivers: [
      "London and Dublin city rates",
      "Chauffeur mileage and country-house tier",
      "Private access and event weeks",
    ],
    source: { text: "the National Trust", href: "https://www.nationaltrust.org.uk/visit" },
  },

  /* ── Experiences ── */
  "experiences__adventure-active-travel.html": {
    range: "$800–$1,800",
    includes: [
      "Luxury lodging along the route",
      "Trip leaders, supported routes and standard equipment",
      "Trip transfers and most meals",
    ],
    excludes: [
      "International airfare, and pre- or post-trip nights",
      "Specialty gear rental",
      "Gratuities and insurance",
    ],
    drivers: [
      "Destination and hotel collection",
      "Scheduled group versus private bespoke departure",
      "Equipment and support complexity",
    ],
    source: { text: "U.S. National Park Service passes", href: "https://www.nps.gov/planyourvisit/passes.htm" },
  },
  "experiences__all-inclusive-vacations.html": {
    range: "$500–$1,800",
    includes: [
      "Luxury accommodation with all meals",
      "Drinks on the stated plan",
      "Non-motorized watersports and most resort activities",
    ],
    excludes: [
      "Airfare, and private transfers unless named",
      "Spa and motorized watersports",
      "Premium excursions and top-shelf pours where excluded",
    ],
    drivers: [
      "Resort and island",
      "Room category and inclusion plan",
      "Festive dates and transfer logistics",
    ],
    source: { text: "Spice Island Beach Resort inclusions", href: "https://www.spiceislandbeachresort.com/resort-at-a-glance/inclusions" },
  },
  "experiences__beach-island-escapes.html": {
    range: "$450–$1,600",
    includes: [
      "Half of a luxury beachfront room or suite",
      "Breakfast, and known taxes and fees",
      "A basic arrival-transfer allowance",
    ],
    excludes: [
      "Airfare",
      "Other meals unless packaged",
      "Beach clubs, cabanas, spa and boat days",
    ],
    drivers: [
      "Destination access and beachfront position",
      "Suite or villa category",
      "Season — festive supplements are real",
    ],
    source: { text: "NOAA hurricane climatology", href: "https://www.nhc.noaa.gov/climo/" },
  },
  "experiences__cruises.html": {
    range: "$5,000–$30,000",
    includes: [
      "A shared cabin with onboard meals",
      "The expedition team and lecture program",
      "Scheduled landings and standard gear where stated",
    ],
    excludes: [
      "International airfare and insurance",
      "Gratuities unless included",
      "Premium excursions, pre- and post-cruise land, and top suites",
    ],
    drivers: [
      "Region and voyage length",
      "Ship and cabin category",
      "Fly-cruise legs and single supplements",
    ],
    source: { text: "IAATO", href: "https://iaato.org/visiting-antarctica" },
  },
  "experiences__culture-immersive-travel.html": {
    range: "$700–$1,500",
    includes: [
      "Luxury hotels with breakfast",
      "A private scholar-guide and transfers",
      "Standard admissions and selected meals",
    ],
    excludes: [
      "International airfare",
      "After-hours openings and private buyouts",
      "Most dinners and shopping",
    ],
    drivers: [
      "Guide caliber — a subject scholar prices above a licensed guide",
      "City and transport mix",
      "Special access",
    ],
    source: { text: "Louvre admission", href: "https://www.louvre.fr/en/visit/hours-admission" },
  },
  "experiences__family-travel.html": {
    range: "$750–$1,500",
    includes: [
      "Family-suitable luxury lodging",
      "Private transfers and guides",
      "Standard admissions and selected activities",
    ],
    excludes: [
      "Airfare and childcare",
      "Room-configuration premiums beyond double-share",
      "Specialist activities",
    ],
    drivers: [
      "Children's ages and room count",
      "Destination and school-holiday timing",
      "Vehicle and guide configuration",
    ],
    source: { text: "Singita's lodge age policy", href: "https://singita.com/lodge/singita-boulders-lodge/information/" },
  },
  "experiences__food-wine-travel.html": {
    range: "$750–$1,500",
    includes: [
      "Luxury lodging with breakfast",
      "A private driver-guide",
      "Premium tastings and selected pairing meals",
    ],
    excludes: [
      "Airfare",
      "Bottle purchases and shipping",
      "Rare-wine flights, extra Michelin menus and gratuities",
    ],
    drivers: [
      "Region — Napa and Burgundy price above emerging regions",
      "Private-tasting tier",
      "Pairing-meal caliber and chauffeur time",
    ],
    source: { text: "Opus One tasting experiences", href: "https://www.opusonewinery.com/plan-your-visit/" },
  },
  "experiences__safari-wildlife-travel.html": {
    range: "$1,200–$3,200",
    includes: [
      "A luxury camp with all meals and standard drinks",
      "Shared game drives and lodge activities",
      "Laundry, transfers and conservation fees where the camp bundles them",
    ],
    excludes: [
      "International and regional flights",
      "Visas and special permits — gorilla permits price separately",
      "A private vehicle, ballooning and gratuities",
    ],
    drivers: [
      "Country and concession",
      "Migration and season",
      "Camp tier, fly-in routing and a private guide",
    ],
    source: { text: "Kenya Wildlife Service", href: "https://kws.go.ke/" },
  },
  "experiences__wellness-retreat-travel.html": {
    range: "$900–$2,500",
    includes: [
      "Luxury accommodation with all meals and non-alcoholic drinks",
      "Core classes and programming",
      "A published treatment credit, or included treatments",
    ],
    excludes: [
      "Airfare",
      "Diagnostics not named in the program",
      "Extra private sessions, alcohol and supplements",
    ],
    drivers: [
      "Clinical-diagnostic versus restorative programs",
      "Treatment intensity and consultations",
      "Room category and length of stay",
    ],
    source: { text: "Canyon Ranch packages", href: "https://www.canyonranch.com/offers" },
  },

  /* ── Held — research confidence below the launch bar (#30) ── */
  "destinations__caribbean-mexico.html": {
    range: "$400–$1,700",
    includes: [
      "Half of a luxury room, suite or villa, and an arrival transfer",
      "Breakfast or a meal plan where the property bundles it",
      "Room levies like Barbados's BDS $35 (US$17.50) per bedroom",
    ],
    excludes: [
      "International airfare",
      "Inter-island flights, and meals outside the property's plan",
      "Villa chef and provisioning, boat charters, spa and gratuities",
    ],
    drivers: [
      "Island — St. Barth's tops the band, the Dominican Republic anchors it",
      "Season — May and late November run 30–40% under February",
      "Room category — beachfront prices well above garden view",
    ],
    verified: { datetime: "2026-08-20", label: "August 2026" },
    source: { text: "Barbados room rate levy", href: "https://bra.gov.bb/attachment?file=Attachments%2FTourism+Levy+Act%2C+2019-57.pdf&name=Tourism+Levy+Act%2C+2019-57" },
  },
  "destinations__bali.html": {
    range: "$250–$800",
    includes: [
      "Half of a five-star room or a one-bedroom pool villa, two adults sharing",
      "The 10% hospitality tax and a 5–10% service charge on quoted rates",
      "Breakfast for two where the published rate carries it",
    ],
    excludes: [
      "International airfare and the internal flights to Komodo or Lombok",
      "The IDR 150,000 (about $8) Bali tourist levy, charged once per visit",
      "Lunch, dinner, alcohol, spa treatments and a car with driver",
    ],
    drivers: [
      "Area — Uluwatu and Seminyak villas run about 70% above Ubud in high season",
      "Dates — mid-August runs about 27% above mid-May across 251 sampled villas",
      "Property tier — Capella Ubud starts at about double the Apurva Kempinski rate",
    ],
    verified: { datetime: "2026-08-20", label: "August 2026" },
    source: { text: "Bali tourist levy", href: "https://lovebali.baliprov.go.id/" },
  },
  "destinations__india.html": {
    unit: "Quoted per property class, not per India night",
    noBand: "A family-seat palace in Rajasthan, a tented camp at a tiger reserve and a Delhi five-star are three different purchases inside one two-week itinerary, and a band wide enough to cover all three would tell a reader nothing about any of them.",
    includes: [
      "Heritage, palace or five-star rooms with breakfast, at whichever class is chosen",
      "A car and driver throughout, with city guides on touring days",
      "Monument admissions, and park entry and jeep on tiger nights where stated",
    ],
    excludes: [
      "International airfare and the e-Visa",
      "Internal flights, including the sector between the north and Kerala",
      "Most meals, gratuities and special-access or camera charges",
    ],
    drivers: [
      "The Taj Mahal at ₹1,100 for a foreign visitor, plus ₹200 for the main mausoleum",
      "Which property class — a family seat, a restored fort and a costumed new build all say heritage",
      "October to March against the April-to-June tiger window, when rates fall and the heat arrives",
    ],
    source: { text: "Archaeological Survey of India, Taj Mahal ticketing", href: "https://www.tajmahal.gov.in/ticketing.aspx" },
  },
  "destinations__hawaii.html": {
    range: "$650–$1,400",
    includes: [
      "Half of a five-star or boutique resort room, room only",
      "Hawaii's 11% accommodations tax, the 3% county surcharge and the GET pass-on",
      "A rental car with parking and park entry, plus one guided activity a day averaged",
    ],
    excludes: [
      "Mainland airfare and the inter-island flights",
      "All meals, alcohol, spa and golf",
      "Optional helicopter and private boat days, plus gratuities",
    ],
    drivers: [
      "Island and resort region — Maui County luxury ran $853–$982 a room a night against Oahu's $437–$472",
      "Room category — oceanfront and suites roughly double the room line and set the top of the band",
      "Summer and festive weeks against the April–June and September–October windows",
    ],
    verified: { datetime: "2026-08-20", label: "August 2026" },
    source: { text: "Hawaii transient accommodations tax", href: "https://files.hawaii.gov/tax/news/announce/ann26-01.pdf" },
  },
  "destinations__napa-sonoma.html": {
    range: "$800–$1,600",
    includes: [
      "Half of a five-star or boutique room",
      "The 13% lodging tax and 2% tourism assessment on Napa nights",
      "Two tasting appointments, a shared car and driver on tasting days, one strong dinner",
    ],
    excludes: [
      "Flights into San Francisco or Oakland",
      "Bottles bought at the cellar door and their shipping",
      "Resort fees, spa treatments and gratuities",
    ],
    drivers: [
      "Hotel tier — a boutique inn holds the floor, an estate resort tops the band",
      "Harvest weeks — September and October price above this shoulder-season band",
      "Tasting tier — basic pours average $40, elevated tastings $200 or more",
    ],
    verified: { datetime: "2026-08-20", label: "August 2026" },
    source: { text: "Napa County transient occupancy tax rates", href: "https://www.napacounty.gov/1266/Transient-Occupancy-Tax" },
  },
  "destinations__new-orleans.html": {
    range: "$450–$900",
    includes: [
      "Half of a five-star or boutique double room",
      "Breakfast, plus all room taxes including the 5% city hotel-motel tax",
      "Local transfers and a share of private guiding",
    ],
    excludes: [
      "Airfare into Louis Armstrong International",
      "Lunches and dinners, including the grand Creole rooms",
      "Alcohol, festival tickets, spa and gratuities",
    ],
    drivers: [
      "Festival weeks — Mardi Gras 9 February 2027, Jazz Fest 22 April",
      "Room category — a Quarter-facing suite tops the band",
      "How much of the week is privately guided",
    ],
    verified: { datetime: "2026-08-20", label: "August 2026" },
    source: { text: "City of New Orleans hotel-motel tax rates", href: "https://services.nola.gov/CNO/Services/Revenue/Forms/8010inst.htm" },
  },
  "destinations__new-york.html": {
    range: "$700–$1,500",
    includes: [
      "Half of a West Village or Tribeca boutique room",
      "Hotel taxes, plus $3.50 a room a night in flat city and state fees",
      "Everyday meals, museum entry and subway fares",
    ],
    excludes: [
      "Airfare into JFK, LaGuardia or Newark",
      "Omakase counters, tasting menus and premium wine",
      "A private food-specialist day, Broadway seats and tips",
    ],
    drivers: [
      "Hotel choice — Tribeca's best rooms run more than double the downtown boutique floor",
      "Dates — October rooms run well above late August across the boutique tier",
      "Where you eat — a bistrot dinner circuit runs several times the counter-and-market days",
    ],
    verified: { datetime: "2026-08-20", label: "August 2026" },
    source: { text: "NYC hotel room occupancy tax", href: "https://www.nyc.gov/site/finance/business/business-hotel-room-occupancy-tax.page" },
  },
  "destinations__riviera-maya-los-cabos.html": {
    range: "$450–$1,200",
    includes: [
      "Half of a five-star or boutique room, breakfast where the property bundles it",
      "The 16% IVA and the state lodging tax on the room rate",
      "Beach and pool service, Wi-Fi and gym access",
    ],
    excludes: [
      "International airfare, airport transfers and each state's per-person visitor tax",
      "Lunch, dinner and alcohol unless the property is all-inclusive",
      "Excursions, cenote and Mayan-site entry, spa, golf and gratuities",
    ],
    drivers: [
      "Room category — a beachfront suite tops the band, a garden room sits near the floor",
      "Meal plan — an all-inclusive rate absorbs those meals and prices above room-only",
      "Dates — peak nights at the Cabo flagships run over twice their off-peak rate",
    ],
    verified: { datetime: "2026-08-20", label: "August 2026" },
    source: { text: "Mexico's IVA rate (Ley del IVA, Article 1)", href: "https://wwwmat.sat.gob.mx/articulo/19848/articulo-1" },
  },
  "destinations__st-barths.html": {
    range: "$350–$1,750",
    includes: [
      "Half of a boutique hotel room or a two-bedroom villa, two adults sharing",
      "The 5% taxe de séjour on the net room rate",
      "Daily maid service and the villa agency's 10% service fee at the top end",
    ],
    excludes: [
      "International airfare and the St. Martin connection",
      "Restaurants, beach clubs, alcohol and gratuities",
      "Car hire, boat charters and spa treatments",
    ],
    drivers: [
      "Villa versus hotel — two adults taking a villa alone tops the band",
      "Occupancy — four sharing a two-bedroom villa halves the per-person figure",
      "Late-December dates — New Year's week runs about three times a high-season week",
    ],
    verified: { datetime: "2026-08-20", label: "August 2026" },
    source: { text: "Collectivité de Saint-Barthélemy taxe de séjour tariff", href: "https://comstbarth.taxesejour.fr/portail/document/2444874/download" },
  },

  /* ── The M7 destination set (#40-#65) ──
     Twenty-five pages created after the 2026-08-09 backfill, so none of
     them has a researched row to draw on. Each ships its cost block
     commented out, the same way India (#54) does, and joins the queue
     for a supplier-confirmed band rather than guessing one. ── */
  "destinations__aspen.html": {
    unit: "Priced by the week, and by which week",
    noBand: "Aspen runs three separate markets inside one season — the Christmas to New Year and Presidents' weeks, X Games week at Buttermilk, and everything else — and a band built on the average of them would be wrong in all three.",
    includes: [
      "Lodging in the core or slopeside, on the week you actually book",
      "A lift ticket valid across all four mountains",
      "Local lodging and sales taxes on the room rate",
    ],
    excludes: [
      "Airfare into Aspen/Pitkin County, and the Denver drive contingency",
      "Private instruction, rentals and any heli or cat day",
      "Meals, gratuities and the excise tax a private-home rental adds",
    ],
    drivers: [
      "Which week — Christmas, New Year and Presidents' week clear before they reach the open market",
      "Lodging type — Aspen taxes a lodge night at 12.35% and a classic short-term rental at 22.35%",
      "Private instruction — a named instructor booked early, or whoever the schedule has left",
    ],
    source: { text: "City of Aspen lodging tax rates", href: "https://aspen.gov/1427/Lodging-and-Short-Term-Rental-Taxes" },
  },
  "destinations__costa-rica.html": {
    unit: "Quoted by season, green or dry, per lodge night",
    noBand: "The same lodge room is a different price in the December-to-April dry season and in the green season from May, and September and October are wet enough on the Pacific that some Osa and Central Pacific lodges reduce operations or close outright — one band would describe neither half of the year.",
    includes: [
      "A lodge or small hotel with breakfast, at whichever season's rate applies",
      "A naturalist guide on activity days, booked by name rather than by agency",
      "Private ground transfers, and the park reservations held before the hotels",
    ],
    excludes: [
      "International airfare, and the domestic flights to the Osa and Tortuguero",
      "National-park entry, and the certified guide Corcovado requires of every visitor",
      "Most meals, adventure activities and gratuities",
    ],
    drivers: [
      "Dry season December to April against green season from May, with September and October wettest on the Pacific",
      "Two bases or four — a third region costs two mornings and a packing day",
      "Corcovado's mandatory certified guide, and the daily caps that sell out before hotel rooms do",
    ],
    source: { text: "SINAC protected-area entry tariffs", href: "https://www.sinac.go.cr/ES/transprncia/Documents/Tarifas%20Ingreso%20ASP.pdf" },
  },
  "destinations__jamaica.html": {
    unit: "Sold per villa week or per resort room-night",
    noBand: "A staffed Hanover villa is let by the week for the whole house, with a cook, housekeeper and butler on the estate's payroll, while an all-inclusive down the same coast sells a per-person room-night with the food and drink inside it — the same seven days quoted two ways that do not average.",
    includes: [
      "A villa with cook, housekeeper and butler employed by the estate",
      "Or an all-inclusive room-night with meals, drinks and resort facilities",
      "Airport transfers with a vetted driver, and days out kept inside an hour",
    ],
    excludes: [
      "International airfare, and the North–South highway toll where the routing uses it",
      "Villa provisioning, which is shopped to your household rather than fixed",
      "Excursions, the Blue Mountains and Kingston days, and gratuities",
    ],
    drivers: [
      "Jamaica's own room tax, US$1 per room-night under 51 rooms and US$4 at 101 and above",
      "Party size against the villa break-even, which sits around six people",
      "December to April, against a hurricane season the National Hurricane Center peaks on 10 September",
    ],
    source: { text: "Jamaica Guest Accommodation Room Tax", href: "https://www.jamaicatax.gov.jm/guest-accommodation-room-tax1" },
  },
  "destinations__barbados-eastern-caribbean.html": {
    unit: "Priced per island, not across the region",
    noBand: "Every hop on this page crosses into another country, and five of them set their own accommodation taxes, holiday-week calendars and villa rules, so one regional nightly band would be an average of five unrelated markets.",
    includes: [
      "Half of a west-coast hotel room or villa, two adults sharing",
      "The 7.5 percent VAT Barbados charges on direct tourism services",
      "Airport transfers, and a hire car for the east-coast day",
    ],
    excludes: [
      "International airfare, and every regional hop between islands",
      "Restaurants, beach clubs, alcohol and gratuities",
      "A crewed charter or a managed villa, which price on their own bases",
    ],
    drivers: [
      "Which coast — west-facing rooms carry the island's top rates and the south sits below them",
      "Which island the nights fall on — Barbados taxes tourism accommodation at 7.5 percent against a 17.5 percent standard rate, and each neighbour sets its own",
      "Christmas and New Year, the two weeks that book first and hold their rates hardest",
    ],
    source: { text: "Barbados VAT rate on tourism accommodation", href: "https://bra.gov.bb/Popular-Topics/Value-Added-Tax/VAT-Rates" },
  },
  "destinations__dominican-republic.html": {
    unit: "Sold per all-inclusive room-night or per villa week",
    noBand: "A Punta Cana all-inclusive is quoted per person with food, drink and tax already inside it, while a Casa de Campo villa is quoted for the whole house before an 18% ITBIS and the 10% legal service charge land on top — those are two products on two bases, not two points on one band.",
    includes: [
      "An all-inclusive room with meals, drinks and resort entertainment",
      "Or a staffed villa with cook and housekeeper, priced by the house",
      "Ground transfers from whichever of the four usable airports the routing needs",
    ],
    excludes: [
      "International airfare, and the transfer daylight a Punta Cana arrival costs",
      "Green fees at Teeth of the Dog and Punta Espada, and permitted whale boats",
      "The 18% ITBIS and 10% service charge wherever a rate is quoted net",
    ],
    drivers: [
      "Whether the rate is gross or net of 18% ITBIS and the 10% service charge",
      "All-inclusive room-nights against a villa let by the house for the same party",
      "The mid-January to late March humpback window, when peninsula hotels commit early",
    ],
    source: { text: "Dominican ITBIS rate (DGII)", href: "https://dgii.gov.do/cicloContribuyente/obligacionesTributarias/principalesImpuestos/Paginas/Itbis.aspx" },
  },
  "destinations__brazil.html": {
    unit: "Priced per region, on two opposite calendars",
    noBand: "A Pantanal river camp sells full board with boat days, a Rio hotel sells a room, and Fernando de Noronha charges a per-person environmental tax on top of whatever the bed costs, so no single nightly figure covers the three.",
    includes: [
      "Hotels in Rio, and full board at a Pantanal river camp",
      "Boat days with a pilot, and guiding in the cities",
      "Ground transfers and stated park admissions",
    ],
    excludes: [
      "International airfare, and the domestic legs that route through a hub",
      "The e-visa United States, Canadian and Australian passport holders need",
      "Fernando de Noronha's environmental preservation tax and marine park entry",
    ],
    drivers: [
      "Which regions the month allows — July to October for the Pantanal, September to March for the Northeast coast",
      "Fernando de Noronha's environmental preservation tax, R$105.79 for a single day and R$901.36 for ten",
      "Boat days at Porto Jofre, where the pilots worth having commit months ahead",
    ],
    source: { text: "Fernando de Noronha environmental preservation tax", href: "https://www.noronha.pe.gov.br/catalogo-de-servicos-old2/taxa-de-preservacao-ambiental-tpa/" },
  },
  "destinations__argentina.html": {
    range: "$450–$1,000",
    includes: [
      "Half of a Buenos Aires five-star or a Uco Valley bodega room, with breakfast",
      "Private transfers, and a driver-guide on the touring and tasting days",
      "Core admissions, including the ARS 60,000 non-resident ticket at Iguazú",
    ],
    excludes: [
      "International airfare and the domestic flights between regions",
      "Most lunches and dinners, wine bought at the cellar door and its shipping",
      "Premium cellar verticals, estancia riding days and gratuities",
    ],
    drivers: [
      "Which two regions — Buenos Aires and Mendoza price above Salta and the Quebrada",
      "Bodega access — a tasting-room visit and a private vertical with the winemaker are not the same line",
      "Domestic air — three regions in twelve days adds flights, not just nights",
    ],
    verified: { datetime: "2026-08-24", label: "August 2026" },
    source: { text: "Argentine national park entrance fees", href: "https://www.argentina.gob.ar/parquesnacionales/tarifas" },
  },
  "destinations__colombia.html": {
    range: "$350–$900",
    includes: [
      "Half of a walled-city, Bogotá or Medellín boutique room, or a working finca in Quindío, with breakfast",
      "Private transfers and a local guide on the days that need one",
      "Park entry, including Tayrona's COP 96,500 high-season rate for non-resident foreigners",
    ],
    excludes: [
      "International airfare and the internal flights that replace the drives",
      "The Chocó fly-in lodges, which quote per person all-inclusive on a different basis",
      "Most dinners, the Ciudad Perdida trek and gratuities",
    ],
    drivers: [
      "City against finca — a Cartagena suite runs several times a coffee-farm room",
      "Dates — late December into early January is the most expensive stretch on the coast",
      "How many legs are flown — Bogotá to the coffee region and Medellín to Cartagena are flights, not drives",
    ],
    verified: { datetime: "2026-08-24", label: "August 2026" },
    source: { text: "Parques Nacionales 2026 entry-fee resolution", href: "https://www.parquesnacionales.gov.co/wp-content/uploads/2025/12/RESOLUCION-551-DE-19-DE-DICIEMBRE-DE-2025-DG.pdf" },
  },
  "destinations__seychelles.html": {
    range: "$400–$1,300",
    includes: [
      "Half of a granite-island five-star or boutique room, breakfast where the rate carries it",
      "The SCR 100 (about $7) sustainability levy, charged per person per night at large hotels and island resorts",
      "Scheduled catamaran crossings, a hire car or transfers on Mahé, and reserve entry like the Vallée de Mai's SCR 450",
    ],
    excludes: [
      "International airfare and the light-aircraft hop to a private island",
      "Lunch and dinner — outside the private islands this is not an all-inclusive country",
      "Diving, boat charters, spa and gratuities",
    ],
    drivers: [
      "Island and property — a La Digue boutique holds the floor, a Praslin five-star sets the ceiling, and the one-property private islands price several times above the band",
      "Which coast the room faces — the southeast trades run May to September and reverse in November",
      "How many crossings the week carries — Mahé–Praslin is €56 a person each way before the La Digue leg",
    ],
    verified: { datetime: "2026-08-24", label: "August 2026" },
    source: { text: "Vallée de Mai entrance fee", href: "https://www.sif.sc/vdm" },
  },
  "destinations__south-africa.html": {
    unit: "Sold as reserve nights and city nights separately",
    noBand: "A Sabi Sand lodge night buys guiding, trackers, off-road traversing rights, meals and drinks in one figure, while a Cape Town hotel night buys a room and breakfast — the two sit an order of magnitude apart, and one band would describe neither.",
    includes: [
      "All-inclusive bush nights — meals, house drinks, twice-daily drives and reserve levies",
      "Room and breakfast in Cape Town and the Winelands, priced on its own",
      "Private transfers and driver-guide days, with the Nelspruit or Johannesburg leg where stated",
    ],
    excludes: [
      "International airfare, and the light-aircraft or scheduled sector to the reserve",
      "Most Cape meals, wine tastings, cableway and Robben Island tickets",
      "Gratuities for guides and trackers, visas and insurance",
    ],
    drivers: [
      "Kruger's daily conservation fee — R602 per international adult, R692 from 1 November 2026",
      "Which reserve rather than which lodge, since traversing and off-road rights belong to the reserve",
      "April, September and October, when both halves work and both commit a year out",
    ],
    source: { text: "SANParks daily conservation fees", href: "https://www.sanparks.org/travel/book/useful-information/rates-fees/" },
  },
  "destinations__zambia-victoria-falls.html": {
    unit: "Sold per camp night, all-inclusive, or per hotel room",
    noBand: "A South Luangwa bushcamp night is one all-inclusive figure covering meals, drinks, laundry, a licensed walking guide, an armed scout and the park fee, at a camp that only exists from about June to October, while a Livingstone hotel sells a room and leaves the Falls gate fee outside it.",
    includes: [
      "A camp on an all-inclusive basis, with meals, house drinks and laundry at most camps",
      "Twice-daily activities — drives, walks with an armed scout, canoes in the Lower Zambezi",
      "Park entry where the camp rate carries it, plus packaged charter transfers",
    ],
    excludes: [
      "International airfare, and the internal light-aircraft sectors between parks",
      "Livingstone hotel nights, which price on a separate basis from the camps",
      "The Zambian visa, gratuities, and Devil's Pool or bridge activities",
    ],
    drivers: [
      "South Luangwa's park fee, US$25 per person per day for non-residents",
      "The June-to-October bushcamp season, with the exact dates set each year by the rains",
      "Falls water against game season — April peaks the river, October empties the eastern cataract",
    ],
    source: { text: "Zambia park-entry permit fees (DNPW)", href: "https://www.businesslicenses.gov.zm/license/id/213" },
  },
  "destinations__morocco.html": {
    unit: "Priced per room, and per vehicle on the road",
    noBand: "The riads price per room and the Sahara leg prices per vehicle, so the same 4x4 and driver costs a couple exactly what it costs a family of four and the per-person figure halves without the trip changing at all.",
    includes: [
      "A riad room inside the medina, and a hotel outside the walls for the pool nights",
      "A car and driver for the road legs, priced per vehicle rather than per seat",
      "A licensed guide for the first full day in Fez and in Marrakech",
    ],
    excludes: [
      "International airfare, and the open-jaw premium on a one-way route",
      "Motorway tolls, fuel and the driver's own overnight costs where billed separately",
      "Most meals, monument entry and gratuities",
    ],
    drivers: [
      "Party size on the desert leg, because the vehicle costs the same for two as for four",
      "Motorway tolls, billed by vehicle class rather than by passenger — 25, 36 or 43 dirhams for Casablanca to Rabat",
      "The October-to-April window, and the Easter and Christmas fortnights when the good riads go six months ahead",
    ],
    source: { text: "Morocco's motorway toll grid, by vehicle class", href: "https://www.adm.co.ma/fr/grille-tarifaire-sur-le-reseau" },
  },
  "destinations__bhutan.html": {
    unit: "A government fee per night, plus a day rate",
    noBand: "The Sustainable Development Fee is published and fixed, but it is a government levy sitting on top of a day rate that swings by a multiple between a valley guesthouse and the five-lodge circuit.",
    includes: [
      "A licensed guide and a driver with a vehicle for the whole itinerary",
      "Hotel nights, monument entry and most meals at the tier you book",
      "The Sustainable Development Fee where the operator collects it with the itinerary",
    ],
    excludes: [
      "International flights into Paro, and the domestic hop to Bumthang",
      "The US$40 one-off visa application fee, charged per person",
      "Gratuities for the guide and driver, and the top lodge categories",
    ],
    drivers: [
      "The government fee — US$100 per adult per night, US$50 for ages six to eleven, none under six",
      "Lodge tier — the five-lodge circuit and a valley guesthouse are the same country on different money",
      "Days and valleys — Bumthang adds a long driving day over two passes in each direction",
    ],
    source: { text: "Bhutan Department of Tourism SDF rates", href: "https://bhutan.travel/faqs" },
  },
  "destinations__vietnam-southeast-asia.html": {
    unit: "Priced as separate country legs, not one nightly rate",
    noBand: "Vietnam, Cambodia and Laos price in three separate currencies with their own visa regimes and site fees, so one nightly figure would average a Hanoi hotel against an Angkor pass and describe neither.",
    includes: [
      "Five-star and boutique city hotels with breakfast",
      "A private guide and vehicle on touring days, with site admissions",
      "An overnight cabin on a Lan Ha Bay boat, full board",
    ],
    excludes: [
      "International airfare, and the three internal flights the north-to-south route needs",
      "A separate e-visa for each country on the route",
      "The Angkor park pass, gratuities and travel insurance",
    ],
    drivers: [
      "Cabin count on the bay boat — four berths and forty berths are different products",
      "Whether Cambodia is on the route — Angkor's three-day pass is $62 a person before the flight",
      "The February-to-April window, the only stretch that works from Hanoi to the Mekong Delta at once",
    ],
    source: { text: "Angkor Archaeological Park pass prices", href: "https://www.angkorenterprise.gov.kh/en/available-tickets" },
  },
  "destinations__sri-lanka.html": {
    unit: "Priced by coast and season, not per island night",
    noBand: "Sri Lanka runs two monsoons on opposite flanks — the southwest from May to September and the northeast from December to February — so a planter's bungalow above Nuwara Eliya and a beach hotel at Trincomalee are in high season in different months of the same year, and no single band holds both.",
    includes: [
      "A bungalow, boutique hotel or safari lodge on whichever coast is in season",
      "A car and driver throughout, with site guides where stated",
      "Reserved hill-line rail seats, booked ahead rather than hoped for",
    ],
    excludes: [
      "International airfare and the Electronic Travel Authorization",
      "Cultural Triangle site tickets, and park entry and jeep hire at Yala or Wilpattu",
      "Most meals, whale boats and gratuities",
    ],
    drivers: [
      "The southwest monsoon May to September and the northeast December to February, on opposite coasts",
      "Which coast the month puts you on, since the beach half of the trip simply moves",
      "Yala's Block 1 closing for several weeks around September, on dates set annually",
    ],
    source: { text: "Central Cultural Fund ticket prices", href: "https://ccf.gov.lk/vsl/tickets" },
  },
  "destinations__israel.html": {
    range: "$500–$1,100",
    includes: [
      "Half of a Jerusalem or Tel Aviv five-star or boutique room with breakfast",
      "A licensed guide on the touring days, and a car and driver where the route needs one",
      "Site admissions like Masada National Park's ₪37 adult ticket, plus local transfers",
    ],
    excludes: [
      "International airfare, insurance and gratuities",
      "Most lunches and dinners, including the Tel Aviv tasting rooms",
      "Optional Dead Sea spa programmes and premium experiences",
    ],
    drivers: [
      "The calendar, not the season — Rosh Hashanah, Yom Kippur and Sukkot make October the most expensive month in Jerusalem, and Passover fills the city for a week in spring",
      "The guide — a licensed guide runs about $400 a day, a specialist with a vehicle $550–$650",
      "Where the nights go — an Old City-facing room and a Dead Sea resort price nothing like a Galilee guesthouse",
    ],
    verified: { datetime: "2026-08-24", label: "August 2026" },
    source: { text: "Masada National Park entrance fees", href: "https://en.parks.org.il/reserve-park/masada-national-park/" },
  },
  "destinations__uae-gulf.html": {
    range: "$400–$1,500",
    includes: [
      "Half of a Dubai, Abu Dhabi or Doha five-star room with breakfast",
      "The AED 20 a night Tourism Dirham on a five-star Dubai room, plus the charges that add 22–25% to a quoted rate",
      "Airport transfers, a car on touring days and admissions like the observation deck and Louvre Abu Dhabi",
    ],
    excludes: [
      "International airfare and the Oman crossing",
      "Most meals — Dubai dining is where a Gulf budget actually goes",
      "Desert camps in the Liwa, private aviation and gratuities",
    ],
    drivers: [
      "Dates — the Abu Dhabi Grand Prix and February trade-fair weeks can double a room rate",
      "Address — a Downtown tower, a Jumeirah beach resort and a Saadiyat resort are three different price levels",
      "Season — cool-season rates run well above the April and October shoulder, and collapse by June",
    ],
    verified: { datetime: "2026-08-24", label: "August 2026" },
    source: { text: "UAE Government hotel fees", href: "https://u.ae/en/information-and-services/visiting-and-exploring-the-uae/where-to-stay-in-the-uae" },
  },
  "destinations__georgia-armenia.html": {
    unit: "Hotel nights and guesthouse nights, priced apart",
    noBand: "Tbilisi and Yerevan have five-star hotels; Kakheti, Svaneti and southern Armenia have family guesthouses and winery estates that are genuinely excellent and are not five-star, so a single nightly figure would average two different products — and the driver moves the day rate further than the room does.",
    includes: [
      "A four- or five-star room in Tbilisi and Yerevan, and a family guesthouse or winery estate outside them",
      "A car and driver throughout — the Georgian Military Highway and the Ushguli track are not self-drive propositions",
      "Cellar visits, site admissions such as the Georgian National Museum's 40 GEL foreign-national ticket, and the border-day handover",
    ],
    excludes: [
      "International airfare and the open-jaw home leg out of Yerevan",
      "Most meals, the wine bought at the cellar and its shipping",
      "The Tatev cableway, Gudauri ski days and gratuities",
    ],
    drivers: [
      "Which nights are hotel nights and which are guesthouse nights — settled before anything is booked, because the gap is the trip",
      "The driver-and-guide day rate, which on a touring itinerary outweighs the room",
      "Rtveli — late September into late October is the strongest window in either country and the one that books first",
    ],
    source: { text: "Georgian National Museum ticket prices", href: "https://museum.ge/index.php?lang_id=ENG&sec_id=5&m=319" },
  },
  "destinations__australia.html": {
    unit: "Priced per region, plus the flights between them",
    noBand: "Sydney, the Red Centre, the reef and Tasmania are four separate cost floors joined by domestic sectors, and a single nightly figure would sit above the cheapest of them and well below a Kimberley expedition berth.",
    includes: [
      "Luxury hotels and lodges with breakfast, in whichever regions the trip covers",
      "Private or premium ground transport, and transfers at each sector end",
      "Core guiding, park passes and the reef day boat where stated",
    ],
    excludes: [
      "International airfare, and the domestic sector into each new region",
      "The ETA or eVisitor authorisation every visitor needs before departure",
      "Kimberley expedition berths, liveaboard cabins and most meals",
    ],
    drivers: [
      "How many regions — the Uluru-Kata Tjuta pass is A$38 for three days, and each extra region adds a sector",
      "Reef days, which carry the A$8.50 per-person environmental management charge on any trip of three hours or more",
      "The calendar split — May to September for the centre and the tropics, December to February for Sydney and Tasmania",
    ],
    source: { text: "Uluru-Kata Tjuta National Park pass", href: "https://uluru.gov.au/plan/buy-your-pass/" },
  },
  "destinations__cook-islands.html": {
    unit: "Priced per island, plus the sector between them",
    noBand: "Aitutaki and Rarotonga sit at different price levels on the same trip, and because the split that works gives Aitutaki five of nine nights, one nightly figure would be an average weighted to the wrong island.",
    includes: [
      "Half of a beachfront room or bungalow, two adults sharing",
      "Breakfast where the property includes it, and airport transfers",
      "A lagoon cruise day on Aitutaki",
    ],
    excludes: [
      "International airfare into Rarotonga, the country's only gateway",
      "The Rarotonga to Aitutaki sector, which carries no checked bag on Seat Only fares",
      "Most meals, kitesurfing and diving, plus travel insurance",
    ],
    drivers: [
      "The island split — five nights on Aitutaki against three on Rarotonga moves the total more than the property does",
      "The domestic sector, a 40-minute flight run up to five times a day, with excess baggage at NZ$3.50 a kilo",
      "The overwater bungalows, which exist at exactly one resort in the country and commit furthest ahead",
    ],
    source: { text: "Air Rarotonga baggage and excess rates", href: "https://airraro.com/passenger-baggage/" },
  },
  "destinations__vanuatu.html": {
    unit: "Priced per country leg and per boat day",
    noBand: "Four countries share the May-to-October window and nothing else: a Luganville dive package, a Tanna volcano lodge and a licensed Tongan whale boat price on three different bases, and an average of them describes none.",
    includes: [
      "A lodge or resort room with breakfast, on whichever island the leg falls",
      "Guided dives or lagoon days where the operator packages them",
      "Road transfers, and the 4WD crossing to the Yasur ash plain",
    ],
    excludes: [
      "International airfare and every domestic turboprop sector",
      "Dive insurance, technical gas and gear hire beyond the package",
      "Village and kastom-site fees paid on the ground, plus gratuities",
    ],
    drivers: [
      "Each country taxes and licenses separately — Tonga's consumption tax has run at 15 percent since April 2005",
      "How many domestic sectors the route needs, since each costs most of a day and cancels for weather",
      "The July-to-October whale window in Vava'u, when licensed boats and dive slots commit months ahead",
    ],
    source: { text: "Tonga's 15% consumption tax", href: "https://www.revenue.gov.to/consumption-tax-overview" },
  },
  "destinations__arctic-norway.html": {
    range: "$550–$1,400",
    includes: [
      "Half of a Tromsø, Lofoten or Alta room at the top of the local stock, with breakfast",
      "Norway's 12% VAT on the room and on passenger transport",
      "A small-group aurora chase on each dark night, published at NOK 2,200 a person",
    ],
    excludes: [
      "International airfare and the domestic connection to Tromsø, Evenes or Alta",
      "Most dinners, and the rental car with studded tyres on a self-drive week",
      "Dog sledding, whale days and a private chase vehicle, plus gratuities",
    ],
    drivers: [
      "How many nights you give the sky — five usually produces a clear window; three is a coin toss",
      "Shared chase or private — a vehicle that keeps driving inland at midnight is the biggest line after the room",
      "Base — a Tromsø city hotel holds the floor, a Lofoten rorbu or a Finnmark lodge sets the ceiling",
    ],
    verified: { datetime: "2026-08-24", label: "August 2026" },
    source: { text: "Norway's VAT rates", href: "https://www.skatteetaten.no/en/rates/value-added-tax/" },
  },
  /* Basis corrected 2026-08-20 from "per person, per day, land only" to "per
     person, per voyage", matching falklands-south-georgia and the polar-regions
     parent. The page's first heading is "Svalbard Is a Ship Trip", two of its
     three itineraries are 8-12 day voyages, and the land-only unit described
     only the third. The unit is no longer the blocker; the two below are. */
  "destinations__svalbard.html": {
    unit: "Priced per cabin per voyage, or per snowmobile day",
    noBand: "Svalbard sells two products in two units — an eight to twelve day voyage priced by cabin grade on a named vessel, and a March to May snowmobile week priced by the day out of Longyearbyen — and a single nightly figure would describe neither.",
    includes: [
      "A twin-share cabin on a small ice-strengthened vessel, all meals aboard",
      "The expedition team, Zodiac operations and the landings the ice permits",
      "The NOK 150 Svalbard environmental fee, collected inside the ticket",
    ],
    excludes: [
      "Flights to Longyearbyen through Oslo or Tromsø, and the buffer night",
      "Evacuation insurance, premium cabins and specialist photography programmes",
      "Gratuities, cold-weather gear hire and pre-voyage hotel nights",
    ],
    drivers: [
      "Passenger count — Norway caps ships in the protected areas at 200, with landings limited to 43 sites",
      "Cabin grade and vessel — the same sailing week prices several ways on one hull",
      "Which season — the March to May snowmobile weeks are a separate product on a per-day basis",
    ],
    source: { text: "Svalbard environmental fee", href: "https://www.sysselmesteren.no/en/svalbards-environmental-protection-fund/" },
  },
  "destinations__greenland.html": {
    unit: "Priced per sector and per charter, not nightly",
    noBand: "Nothing here is bought by the head for a night: the boat to the Eqi front, the helicopter into Tasiilaq and the cabin on a Scoresby Sund ship are each quoted per trip, so a party of two pays close to what a party of six does.",
    includes: [
      "A room in a town hotel or lodge, breakfast where the property offers it",
      "The scheduled boat day, the sled team and the guide who runs it",
      "Ferry or scheduled-boat legs where the coastal service replaces a flight",
    ],
    excludes: [
      "International flights, and the Air Greenland sectors between towns",
      "Helicopter legs, charter boats and the buffer night the schedule needs",
      "Cold-weather kit hire, gratuities and anything a ship prices separately",
    ],
    drivers: [
      "Ship or land base — Scoresby Sund has one settlement and no way in but a hull",
      "Remote-area permits — the government's expedition application fee is DKK 4,000 per expedition, not per traveller",
      "Season — the sled window runs roughly February to April and ends when the ice breaks, not on a date",
    ],
    source: { text: "Greenland expedition permit fees", href: "https://expeditionsgreenland.gl/en/apply-for-an-expedition-permit" },
  },
  "destinations__falklands-south-georgia.html": {
    unit: "Priced per cabin category, per departure",
    noBand: "Pricing here is set by cabin category on a single 18 to 22 day departure, and the Falklands also work as an air-and-lodge week costing a fraction of a berth, so no nightly figure covers both.",
    includes: [
      "A twin-share cabin, all meals aboard and the expedition team",
      "Zodiac landings, the biosecurity programme and the daily briefings at sea",
      "The South Georgia visitor permit, lodged by the operator for each passenger",
    ],
    excludes: [
      "Flights to Ushuaia, and the pre-voyage nights before embarkation",
      "Evacuation insurance, single supplements and the top cabin grades",
      "Kayak and camping programmes, gratuities, and the separate Falklands land week",
    ],
    drivers: [
      "Cabin category — the same departure prices several ways on one hull",
      "Passenger count — no more than 100 people are ashore at one site at a time",
      "The government visitor permit — £250 a head from 1 July 2026, £275 from 2027, £300 from 2028",
    ],
    source: { text: "South Georgia visitor permit fees", href: "https://gov.gs/visitor-permit-fee-update/" },
  },

  "experiences__romance-celebration-travel.html": {
    range: "$600–$2,000",
    includes: [
      "Half of a luxury suite, overwater villa or ryokan room with breakfast",
      "Local lodging and accommodation taxes on the room",
      "Full board and guiding where a safari camp prices all-inclusive",
    ],
    excludes: [
      "International airfare, plus the seaplane or inter-camp flight unless packaged",
      "Meals and drinks outside those plans, spa treatments and gratuities",
      "The top villa and presidential categories, which price above the band",
    ],
    drivers: [
      "Destination — a private safari camp prices several times a Mediterranean five-star",
      "Room category — overwater with a private pool tops the band",
      "Festive and peak-season dates, where supplements are real",
    ],
    verified: { datetime: "2026-08-20", label: "August 2026" },
    source: { text: "Kyoto City accommodation tax", href: "https://www.city.kyoto.lg.jp/gyozai/page/0000236942.html" },
  },
  "experiences__multigenerational-travel.html": {
    unit: "Priced per villa and per party, not per head",
    noBand: "The villa, the chef, the driver and the boat day are each bought once for the whole party, so the per-person figure falls as the group grows and a two-adult night describes nobody in it.",
    includes: [
      "A villa or multi-bedroom configuration with shared space for the whole group",
      "A private driver and the transfers that keep the party together",
      "The shared anchors — a chef dinner, a cooking class, a boat day",
    ],
    excludes: [
      "International flights, which price per person and per age band",
      "Childcare, connecting-room premiums and anything booked for one generation only",
      "Meals outside the villa, gratuities and the guide days each group takes separately",
    ],
    drivers: [
      "Party size against bedroom count — the same villa week divides very differently by eight or by four",
      "Which weeks — school-holiday windows price above the May–June and September–October shoulder",
      "Per-party fees — Hawaii Volcanoes charges $30 a vehicle for seven days, whether that is two people or fourteen",
    ],
    source: { text: "Hawaii Volcanoes National Park entrance fees", href: "https://www.nps.gov/havo/planyourvisit/fees.htm" },
  },
  "experiences__sports-event-travel.html": {
    unit: "Priced by the seat, not by the night",
    noBand: "What sets the number here is the seat rather than the room, and a seat is priced per event, per day and per person's age — six sports on this page span a range no single nightly figure could sit inside.",
    includes: [
      "Event access at the category booked — hospitality suite, grandstand or enclosure",
      "A hotel within walking distance or a short private transfer of the venue",
      "Transfers on event days, and the catering the package itself carries",
    ],
    excludes: [
      "International flights, and the nights either side of the event",
      "Anything outside the package's own catering and hospitality window",
      "Cancel-for-any-reason cover, which event trips need more than most",
    ],
    drivers: [
      "Which event — the ticket, not the room, is the largest line on the trip",
      "Party composition — Monaco prices ages six to fifteen at half the adult ticket, and free on Thursday",
      "Duration — a two- or three-day Monaco package takes 10% off the daily rate; a single Sunday does not",
    ],
    source: { text: "Automobile Club de Monaco ticket terms", href: "https://acm.mc/en/epreuves/formula-1-grand-prix-de-monaco/useful-infos/information-about-ticket-or-package-purchase/" },
  },
};
