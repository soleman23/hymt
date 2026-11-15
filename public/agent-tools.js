/**
 * Read-only homepage WebMCP tool. Experimental browser feature.
 * No personal data, submission, booking, or network calls.
 */
(() => {
  const context = document.modelContext;
  if (!context || typeof context.registerTool !== "function") return;
  const pages = {
    destinations: ["Destinations", "Browse regional and country destination guides.", "/destinations/"],
    experiences: ["Travel Experiences", "Browse safari, cruise, family, food and wine, and other travel styles.", "/experiences/"],
    planning: ["Plan Your Trip", "Read the planning process and use the official inquiry form yourself.", "/plan-your-trip/"],
    faq: ["Travel FAQ", "Explore the planning process, fees, and frequently asked questions.", "/faq/"],
    journal: ["Travel Journal", "Read destination and travel planning articles.", "/travel-journal/"]
  };
  try {
    context.registerTool({
      name: "explore_hymt_travel",
      description: "Find official Hit Your Mark Travel destination, experience, planning, FAQ and journal pages. Read-only; does not submit forms or make bookings.",
      inputSchema: {
        type: "object",
        properties: {
          topic: {
            type: "string",
            enum: ["destinations", "experiences", "planning", "faq", "journal"],
            description: "The kind of official HYMT information to find."
          }
        },
        required: ["topic"],
        additionalProperties: false
      },
      execute: async ({ topic } = {}) => {
        const page = Object.prototype.hasOwnProperty.call(pages, topic) ? pages[topic] : null;
        return page
          ? { business: "Hit Your Mark Travel", title: page[0], description: page[1], url: "https://www.hymtravel.com" + page[2] }
          : { error: "Choose destinations, experiences, planning, faq or journal." };
      }
    });
  } catch {
    // Browser preview behavior changes; ordinary site functionality must not.
  }
})();
