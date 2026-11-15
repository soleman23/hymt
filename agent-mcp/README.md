# Hit Your Mark Travel — public MCP backend

Independent Node 22+ service for public, read-only HYMT information. Does not share a process with the static Astro site.

- Protocols: stateless Streamable HTTP 2026-07-28 and 2025-11-25.
- Endpoint: POST /mcp
- Discovery: GET /mcp/server-card (experimental Server Card extension), GET /.well-known/ai-catalog.json; compatibility alias GET /.well-known/mcp/server-card.json.
- Health: GET /healthz
- Tools: list_hymt_sections, get_hymt_public_contact.
- No user records, booking, payment, inquiry submission, external fetches or database credentials.
- The MCP Server Card does not enumerate tools, which are obtained through tools/list.

## Local test

From the agent-mcp directory:

    npm test
    npm start

MCP_PUBLIC_URL defaults to localhost in development. It MUST be set to the real HTTPS service origin for production. NODE_ENV=production rejects a non-HTTPS URL. PORT comes from the hosting provider.

## Deployment choices and owner gate

Recommended: deploy as a separate Node Web Service (e.g. Render) from this repository, root directory agent-mcp, startup command npm start, health check /healthz. Set MCP_PUBLIC_URL to the ACTUAL service origin, not the main www website unless it truly routes to the server. Configure rate limiting, request limits, TLS, edge/WAF logs without visitor details and any domain customisation through the hosting provider. This service is intentionally public read-only. For optional private deployment set MCP_ACCESS_TOKEN (bearer) and MCP_ALLOWED_ORIGINS as needed.

Do NOT publish discovery on www.hymtravel.com until the real external endpoint is deployed and passes initialize, server/discover, tools/list, tools/call, the negative cases and origin checks with a real MCP client. Then publish the domain AI Catalog and optional compatibility Server Card alias in public/.well-known/ on www, and narrowly exempt ONLY these JSON paths from Hostinger's .htaccess .json denial. Never unban arbitrary .json files. Main-site source and dist copies must match.

## Security notes

Public information only, small 32 KiB request cap and in-process sliding time-window abuse budget, validated Origin, exact allowed routes, strict tool arguments and no outbound URLs. The server intentionally does not log request bodies. In-process limits are shared by the connection's remoteAddress (which can be a load-balancer address) and reset on restart; Node-level protection is not a substitute for provider-level rate limiting, DDoS controls, service health checks and alerting. The experimental card spec and MCP protocol may evolve; periodically check upstream and conformance-test before publishing revised metadata.

No production endpoint is asserted until it is actually hosted.
