/**
 * The cost-range rows seeded from docs/seo/research-backfill-2026-08-09.md,
 * keyed by content-page file. Consumed by tools/p3-8-cost-insert.mjs.
 *
 * 80 rows as of 2026-08-20: 52 carry a range, 28 are held. Do not trust these
 * two numbers if the file has been touched since — derive them, the way
 * p3-8-cost-insert.mjs now does at the end of every run. The header has been
 * wrong twice: it said 54 rows and 11 held long after the M7 pages added 25
 * held rows in one go.
 *
 * Every figure is an editorial planning band assembled from published rates
 * and official fee sources — USD, two adults sharing, five-star/boutique
 * tier, shoulder season. Not quotes.
 *
 * The band is editorial and is NOT derived from its `source`. The source is an
 * authority anchor for one concrete, checkable fee of the kind the entry
 * references — destinations__europe.html carries a whole-of-Europe band cited
 * to the price of a Louvre ticket, and never names the Louvre in its own
 * strings. Anyone re-shopping a row should know this before deciding a band is
 * unpublishable because no rate card proves it. None of the 52 would survive
 * that test.
 *
 * Most rows are dated by the global VERIFIED below. A row re-shopped later
 * carries its own `verified` override, so it states the day it was actually
 * checked rather than inheriting a date nobody looked at it on. Nine rows
 * carry one today, all 2026-08-20.
 *
 * Entries with `held` instead of a range sit below the launch bar in the
 * backfill's quality gate (Medium-low / Low-medium) and render no cost block
 * at all. Tracked on #108 — #30 was the original tracker and is closed.
 *
 * "Held" does not uniformly mean "waiting on a figure". Most of what remains is
 * held because a nightly two-adult band is the wrong unit for the destination —
 * a voyage priced per cabin, a region spanning three countries — and no
 * supplier confirmation would unblock them. #108 groups them by which kind they
 * are; read it before researching a number for any of them.
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
  "destinations__india.html": { held: "Medium-low — the spread across palace stays, tiger lodges and city five-stars is too wide to band without live quotes" },
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
  "destinations__aspen.html": { held: "Medium-low — peak-week lodging is its own market and the two holiday weeks do not share a band with the rest of the season" },
  "destinations__costa-rica.html": { held: "Medium-low — green-season and dry-season lodge rates are far enough apart that one band would describe neither" },
  "destinations__jamaica.html": { held: "Medium-low — villa-with-staff and resort pricing are different products quoted on different bases" },
  "destinations__barbados-eastern-caribbean.html": { held: "Medium-low — the band would have to span four islands with unrelated rate structures" },
  "destinations__dominican-republic.html": { held: "Medium-low — Punta Cana all-inclusive and Casa de Campo villa rates are not the same product" },
  "destinations__brazil.html": { held: "Medium-low — Pantanal lodges, Rio hotels and Northeast beach properties do not share a band" },
  "destinations__argentina.html": { held: "Medium-low — rates are quoted in USD against a moving local price level" },
  "destinations__colombia.html": { held: "Medium-low — luxury supply is thin enough that a band would rest on a handful of properties" },
  "destinations__seychelles.html": { held: "Medium-low — island-resort rates are live and the inter-island transfers move the total materially" },
  "destinations__south-africa.html": { held: "Medium-low — private-reserve lodges and city hotels sit an order of magnitude apart" },
  "destinations__zambia-victoria-falls.html": { held: "Medium-low — camp rates are seasonal and the Falls-side hotels price on a separate basis" },
  "destinations__morocco.html": { held: "Medium-low — riad and palace-hotel rates are live, and the desert leg prices per vehicle rather than per person" },
  "destinations__bhutan.html": { held: "Medium-low — the published government fee is one line of the day rate, not the day rate" },
  "destinations__vietnam-southeast-asia.html": { held: "Medium-low — the band would have to span three countries" },
  "destinations__sri-lanka.html": { held: "Medium-low — bungalow and safari-lodge rates vary by season and by coast at the same time" },
  "destinations__israel.html": { held: "Medium-low — Jerusalem and Tel Aviv hotel rates are live and gated by the religious calendar" },
  "destinations__uae-gulf.html": { held: "Medium-low — Gulf hotel rates are among the most dynamic in the industry" },
  "destinations__georgia-armenia.html": { held: "Medium-low — luxury supply is new and thin, so a band would not be stable enough to publish" },
  "destinations__australia.html": { held: "Medium-low — the band would have to span a continent and the internal flights that join it" },
  "destinations__cook-islands.html": { held: "Medium-low — Aitutaki and Rarotonga are different price levels on the same trip" },
  "destinations__vanuatu.html": { held: "Medium-low — the band would span Vanuatu, Samoa, Tonga and the Solomons" },
  "destinations__arctic-norway.html": { held: "Medium-low — aurora-season rates are live and the itineraries are chartered rather than packaged" },
  /* Basis corrected 2026-08-20 from "per person, per day, land only" to "per
     person, per voyage", matching falklands-south-georgia and the polar-regions
     parent. The page's first heading is "Svalbard Is a Ship Trip", two of its
     three itineraries are 8-12 day voyages, and the land-only unit described
     only the third. The unit is no longer the blocker; the two below are. */
  "destinations__svalbard.html": { held: "Medium-low — the per-voyage band still needs an official anchor, and the March–May snowmobile weeks price separately" },
  "destinations__greenland.html": { held: "Medium-low — charter flights and boat transfers dominate the number, and both are quoted per trip" },
  "destinations__falklands-south-georgia.html": { held: "Medium-low — voyage pricing is per departure and per cabin category" },

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
  "experiences__multigenerational-travel.html": { held: "Low-medium — the two-adult normalization is structurally weak for villa parties" },
  "experiences__sports-event-travel.html": { held: "Low-medium — needs rebuilding on event, duration and party composition" },
};
