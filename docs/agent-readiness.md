# HYMT agent-readiness deployment notes

This is a static Astro/Hostinger site. Its existing TravelAgency schema is a LocalBusiness subtype and other site pages already use Article, Service, FAQPage, TouristDestination, BreadcrumbList and CollectionPage.

## Implemented

- Robots Content-Signal: search=yes, ai-input=yes, ai-train=no, repeated for allowed crawler groups. Signals are preferences, not guaranteed enforcement; existing bot allow/disallow rules stay intact.
- Homepage WebSite and three real on-page travel Service nodes, linked to the existing TravelAgency identity.
- A short public /index.markdown alternate; /llms.txt remains the navigation guide.
- Root Accept: text/markdown negotiation, MIME type, RFC 8288 Link discovery and Vary: Accept via Hostinger .htaccess.
- Read-only homepage WebMCP tool using document.modelContext, with safe feature detection. No form submission, personal data, backend calls or booking.
- CI check of deployed asset parity and schema presence.

## Review and deploy

A merge to main deploys production. Before merging, run npm run build and node tools/check-agent-readiness.mjs; ensure generated dist matches source. After deployment, inspect live responses:

    curl -sSI https://www.hymtravel.com/
    curl -sSI https://www.hymtravel.com/index.markdown
    curl -sS -i -H 'Accept: text/markdown' https://www.hymtravel.com/
    curl -sS -i -H 'Accept: text/html' https://www.hymtravel.com/
    curl -sS https://www.hymtravel.com/robots.txt

HTML must remain the default. Markdown requests must return Markdown with text/markdown Content-Type. Both homepage variants must carry Vary: Accept. Check the Link header. Alternate HTML and Markdown requests repeatedly, because the Hostinger CDN may ignore Vary and cache the wrong variant. If that happens, turn off the Accept rewrite and retain the direct /index.markdown URL until CDN behavior is fixed.

Test explore_hymt_travel(topic=destinations) in a WebMCP-enabled Chromium browser. Browsers without WebMCP must continue working. Confirm inquiry and newsletter forms are unaffected.

## MCP Server Card (not yet appropriate)

Do not create /.well-known/mcp/server-card.json with a fictitious endpoint. This static site currently has no remotely callable MCP protocol server. SEP-1649 was superseded by SEP-2127, which describes domain discovery through /.well-known/ai-catalog.json and metadata for an actual working MCP endpoint. Implement and test a separately hosted read-only Streamable HTTP server (initialize, tools/list, tools/call, error handling, rate limiting and access policy) first, then publish a truthful server card and catalog. WebMCP is not a backend MCP server.
