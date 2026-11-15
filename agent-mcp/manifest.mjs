/** Public URLs only. No customer or booking data. */
export const SITE = "https://www.hymtravel.com";
export const SECTIONS = Object.freeze({
  destinations: {
    title: "Destinations",
    description: "Explore regional and country-specific travel guides.",
    path: "/destinations/"
  },
  experiences: {
    title: "Travel Experiences",
    description: "Explore custom family trips, safaris, cruises, food and wine, and other travel styles.",
    path: "/experiences/"
  },
  journal: {
    title: "Travel Journal",
    description: "Read travel planning articles and destination insights.",
    path: "/travel-journal/"
  },
  faq: {
    title: "Travel Planning FAQ",
    description: "Answers about travel planning, process and fees.",
    path: "/faq/"
  },
  about: {
    title: "About the Advisor",
    description: "Read about Mark Sole and Hit Your Mark Travel.",
    path: "/about/"
  },
  planning: {
    title: "Plan Your Trip",
    description: "Official inquiry form; no MCP tool submits it.",
    path: "/plan-your-trip/"
  }
});
export function listSections(section) {
  if (section !== undefined && !Object.hasOwn(SECTIONS, section)) return null;
  const keys = section === undefined ? Object.keys(SECTIONS) : [section];
  return keys.map((key) => ({
    key, title: SECTIONS[key].title, description: SECTIONS[key].description,
    url: SITE + SECTIONS[key].path
  }));
}
export const CONTACT = Object.freeze({
  name: "Hit Your Mark Travel",
  founder: "Mark Sole",
  areaServed: "United States",
  location: "Bend, Oregon, USA",
  email: "mark@hymtravel.com",
  telephone: "+1-541-241-6481",
  website: SITE + "/",
  inquiryUrl: SITE + "/plan-your-trip/",
  note: "Private consultations and arrangements take place through the advisor. No booking or payment API is offered."
});
