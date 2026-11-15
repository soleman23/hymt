/**
 * Hit Your Mark Travel public MCP server.
 * Isolated Node HTTP service. Only read-only, pre-verified public resources.
 * Supports stateless MCP 2026-07-28 and legacy 2025-11-25 Streamable HTTP.
 * No database, user accounts, bookings, payment or third-party fetches.
 */
import { createServer } from "node:http";
import { timingSafeEqual } from "node:crypto";
import { pathToFileURL } from "node:url";
import { CONTACT, SITE, SECTIONS, listSections } from "./manifest.mjs";

export const MODERN = "2026-07-28";
export const LEGACY = "2025-11-25";
export const VERSIONS = [MODERN, LEGACY];
export const SERVER_INFO = Object.freeze({
  name: "com.hymtravel/public-travel",
  title: "Hit Your Mark Travel Public Resources",
  version: "1.0.0",
  description: "Read-only public travel information and official HYMT links.",
  websiteUrl: SITE + "/"
});

const SECTIONS_SCHEMA = {
  type: "object",
  properties: {
    section: {
      type: "string",
      enum: Object.keys(SECTIONS),
      description: "Return a single travel-information section. Omit to list all."
    }
  },
  additionalProperties: false
};
const EMPTY_SCHEMA = { type: "object", properties: {}, additionalProperties: false };
export const TOOLS = Object.freeze([
  {
    name: "list_hymt_sections",
    title: "Browse HYMT travel sections",
    description: "Find official links to destinations, experiences, articles, FAQ, advisor and trip inquiry.",
    inputSchema: SECTIONS_SCHEMA,
    annotations: { readOnlyHint: true, openWorldHint: false }
  },
  {
    name: "get_hymt_public_contact",
    title: "Hit Your Mark Travel contact details",
    description: "Retrieve official public contact and inquiry details. Cannot submit an inquiry or book travel.",
    inputSchema: EMPTY_SCHEMA,
    annotations: { readOnlyHint: true, openWorldHint: false }
  }
]);

function validOrigin(origin, publicUrl, extra = "") {
  if (!origin) return true; // Native clients ordinarily omit Origin.
  const origins = new Set([SITE, publicUrl, ...extra.split(",").map(x => x.trim()).filter(Boolean)]);
  return origins.has(origin);
}
function bearerMatches(provided, expected) {
  if (!expected) return true;
  const actual = provided?.startsWith("Bearer ") ? provided.slice(7) : "";
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
function setJsonHeaders(res, status, mime = "application/json; charset=utf-8") {
  res.statusCode = status;
  res.setHeader("Content-Type", mime);
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
}
function send(res, status, value, mime) {
  setJsonHeaders(res, status, mime);
  res.end(JSON.stringify(value));
}
function errorResponse(id, code, message, data) {
  return {
    jsonrpc: "2.0", id: id ?? null,
    error: { code, message, ...(data ? { data } : {}) }
  };
}
function error(res, status, id, code, message, data) {
  return send(res, status, errorResponse(id, code, message, data));
}
function ok(res, id, result) {
  return send(res, 200, { jsonrpc: "2.0", id, result });
}
function card(publicUrl) {
  return {
    $schema: "https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json",
    name: SERVER_INFO.name,
    title: SERVER_INFO.title,
    description: SERVER_INFO.description,
    version: SERVER_INFO.version,
    websiteUrl: SITE + "/",
    repository: { source: "github", url: "https://github.com/soleman23/hymt", subfolder: "agent-mcp" },
    remotes: [{ type: "streamable-http", url: publicUrl + "/mcp", supportedProtocolVersions: VERSIONS }]
  };
}
function catalog(publicUrl) {
  return {
    specVersion: "1.0",
    entries: [{
      identifier: "urn:air:hymtravel.com:mcp:public-travel",
      type: "application/mcp-server-card+json",
      url: publicUrl + "/mcp/server-card"
    }]
  };
}
function validateArguments(name, args) {
  if (!args || typeof args !== "object" || Array.isArray(args)) return "arguments must be an object";
  if (name === "list_hymt_sections") {
    if (Object.keys(args).some(k => k !== "section")) return "Unexpected parameter";
    if (Object.hasOwn(args, "section") && !Object.hasOwn(SECTIONS, args.section)) return "Unknown section";
    return null;
  }
  if (name === "get_hymt_public_contact") {
    if (Object.keys(args).length !== 0) return "This tool takes no arguments";
    return null;
  }
  return "Unknown tool";
}
function toolPayload(name, args) {
  if (name === "list_hymt_sections") {
    return { business: CONTACT.name, sections: listSections(args.section), source: SITE + "/" };
  }
  return CONTACT;
}

function respondRpc(req, res, msg) {
  const id = msg?.id;
  if (!msg || Array.isArray(msg) || typeof msg !== "object" || msg.jsonrpc !== "2.0" ||
      typeof msg.method !== "string" || msg.method.length > 128 ||
      (id !== undefined && typeof id !== "string" && typeof id !== "number")) {
    return error(res, 400, null, -32600, "Invalid JSON-RPC request");
  }
  if (id === undefined && msg.method.startsWith("notifications/")) {
    setJsonHeaders(res, 202);
    return res.end();
  }
  if (id === undefined) return error(res, 400, null, -32600, "Request id is required");
  const headerVersion = req.headers["mcp-protocol-version"];
  const meta = msg.params?._meta;
  const bodyVersion = meta?.["io.modelcontextprotocol/protocolVersion"];
  const isLegacyInit = msg.method === "initialize";
  const modern = !isLegacyInit && (bodyVersion === MODERN || headerVersion === MODERN);

  if (modern) {
    if (headerVersion !== MODERN || bodyVersion !== MODERN) {
      return error(res, 400, id, -32020, "HeaderMismatch: MCP-Protocol-Version must match request metadata");
    }
    if (req.headers["mcp-method"] !== msg.method) {
      return error(res, 400, id, -32020, "HeaderMismatch: Mcp-Method does not match request");
    }
    if (!meta || typeof meta["io.modelcontextprotocol/clientCapabilities"] !== "object" ||
        meta["io.modelcontextprotocol/clientCapabilities"] === null) {
      return error(res, 400, id, -32602, "Missing client capabilities metadata");
    }
    if (msg.method === "tools/call" && req.headers["mcp-name"] !== msg.params?.name) {
      return error(res, 400, id, -32020, "HeaderMismatch: Mcp-Name does not match tool");
    }
  } else if (!isLegacyInit && headerVersion && headerVersion !== LEGACY) {
    return error(res, 400, id, -32022, "Unsupported protocol version",
      { supported: VERSIONS, requested: headerVersion });
  } else if (!isLegacyInit && !headerVersion) {
    return error(res, 400, id, -32022, "Missing MCP-Protocol-Version", { supported: VERSIONS });
  }

  if (headerVersion && !VERSIONS.includes(headerVersion)) {
    return error(res, 400, id, -32022, "Unsupported protocol version",
      { supported: VERSIONS, requested: headerVersion });
  }

  switch (msg.method) {
    case "initialize": {
      const want = msg.params?.protocolVersion;
      if (typeof want !== "string" || !msg.params?.clientInfo || !msg.params?.capabilities) {
        return error(res, 400, id, -32602, "Invalid initialize parameters");
      }
      return ok(res, id, {
        protocolVersion: LEGACY,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions: "Read-only public travel information. Refer visitors to the official inquiry form."
      });
    }
    case "server/discover":
      if (!modern) return error(res, 404, id, -32601, "Method not found for legacy protocol");
      return ok(res, id, {
        resultType: "complete",
        supportedVersions: VERSIONS,
        capabilities: { tools: {} },
        _meta: { "io.modelcontextprotocol/serverInfo": SERVER_INFO },
        instructions: "Only public information. Never submit a travel inquiry or claim live availability.",
        ttlMs: 300000, cacheScope: "public"
      });
    case "ping":
      return ok(res, id, modern ? { resultType: "complete" } : {});
    case "tools/list":
      if (msg.params?.cursor) return error(res, 400, id, -32602, "No pagination cursor is supported");
      return ok(res, id, modern
        ? { resultType: "complete", tools: TOOLS, ttlMs: 300000, cacheScope: "public" }
        : { tools: TOOLS });
    case "tools/call": {
      const name = msg.params?.name;
      if (!TOOLS.some(t => t.name === name)) return error(res, 404, id, -32602, "Unknown tool");
      const args = msg.params?.arguments ?? {};
      const invalid = validateArguments(name, args);
      if (invalid) return ok(res, id, {
        ...(modern ? { resultType: "complete" } : {}),
        content: [{ type: "text", text: invalid }], isError: true
      });
      const data = toolPayload(name, args);
      return ok(res, id, {
        ...(modern ? { resultType: "complete", structuredContent: data } : {}),
        content: [{ type: "text", text: JSON.stringify(data) }], isError: false
      });
    }
    default:
      return error(res, 404, id, -32601, "Method not found");
  }
}

export function createMcpServer(options = {}) {
  const publicUrl = (options.publicUrl || process.env.MCP_PUBLIC_URL ||
    "http://127.0.0.1:3400").replace(/\/$/, "");
  const origin = new URL(publicUrl);
  if (!["https:", "http:"].includes(origin.protocol) ||
      (process.env.NODE_ENV === "production" && origin.protocol !== "https:")) {
    throw new Error("MCP_PUBLIC_URL must be a real HTTPS public URL in production");
  }
  const allowedOrigins = options.allowedOrigins ?? process.env.MCP_ALLOWED_ORIGINS ?? "";
  const token = options.token ?? process.env.MCP_ACCESS_TOKEN ?? "";
  return createServer(async (req, res) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    const incomingOrigin = req.headers.origin;
    if (!validOrigin(incomingOrigin, origin.origin, allowedOrigins)) {
      return error(res, 403, null, -32000, "Origin not permitted");
    }
    if (incomingOrigin) {
      res.setHeader("Access-Control-Allow-Origin", incomingOrigin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers",
        "Content-Type, Accept, MCP-Protocol-Version, Mcp-Method, Mcp-Name, Authorization");
    }
    const url = new URL(req.url || "/", publicUrl).pathname;
    if (req.method === "OPTIONS" && url === "/mcp") {
      res.statusCode = 204;
      return res.end();
    }
    if (req.method === "GET" && url === "/healthz") {
      return send(res, 200, { status: "ok", service: SERVER_INFO.name, version: SERVER_INFO.version });
    }
    if (req.method === "GET" && (url === "/mcp/server-card" ||
        url === "/.well-known/mcp/server-card.json")) {
      return send(res, 200, card(publicUrl), "application/mcp-server-card+json");
    }
    if (req.method === "GET" && url === "/.well-known/ai-catalog.json") {
      return send(res, 200, catalog(publicUrl), "application/ai-catalog+json");
    }
    if (url !== "/mcp") return error(res, 404, null, -32601, "Not found");
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST, OPTIONS");
      return error(res, 405, null, -32600, "Only POST is supported");
    }
    if (!bearerMatches(req.headers.authorization, token)) {
      res.setHeader("WWW-Authenticate", 'Bearer realm="HYMT public MCP"');
      return error(res, 401, null, -32000, "Unauthorized");
    }
    if (!(req.headers["content-type"] || "").toLowerCase().startsWith("application/json")) {
      return error(res, 415, null, -32600, "Content-Type must be application/json");
    }
    const accept = req.headers.accept || "";
    if (!accept.includes("application/json") || !accept.includes("text/event-stream")) {
      return error(res, 406, null, -32600, "Accept must include JSON and SSE");
    }
    try {
      let body = "";
      for await (const part of req) {
        body += part.toString("utf8");
        if (Buffer.byteLength(body, "utf8") > 32768) {
          return error(res, 413, null, -32600, "Request too large");
        }
      }
      let msg;
      try { msg = JSON.parse(body); }
      catch { return error(res, 400, null, -32700, "Invalid JSON"); }
      return respondRpc(req, res, msg);
    } catch {
      if (!res.headersSent) error(res, 400, null, -32600, "Request could not be read");
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT || 3400);
  createMcpServer().listen(port, "0.0.0.0", () => {
    console.log("HYMT public MCP listening on port " + port);
  });
}
