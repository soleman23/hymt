import assert from "node:assert/strict";

const ORIGIN = "https://hymt-public-mcp.onrender.com";
const SITE = "https://www.hymtravel.com";
const MODERN = "2026-07-28";
const LEGACY = "2025-11-25";
const CHECK_SITE = process.argv.includes("--site");
const RETRIES = process.argv.includes("--retry") ? 24 : 1;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function request(url, init = {}) {
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(15000), redirect: "manual" });
  const body = await response.text();
  let json;
  try { json = JSON.parse(body); }
  catch { throw new Error(url + " returned non-JSON, status=" + response.status + ", sample=" + body.slice(0, 180)); }
  return { response, json };
}
async function getJson(path, expectedType) {
  const { response, json } = await request(path);
  assert.equal(response.status, 200, path + " status");
  assert.match(response.headers.get("content-type") || "", expectedType, path + " content type");
  return json;
}
async function postRpc(method, params, id, modern = false, extra = {}) {
  const headers = {
    "content-type": "application/json",
    accept: "application/json, text/event-stream",
    "mcp-protocol-version": modern ? MODERN : LEGACY,
    ...(modern ? { "mcp-method": method, ...(method === "tools/call" ? { "mcp-name": params.name } : {}) } : {}),
    ...extra
  };
  const fullParams = modern
    ? { ...params, _meta: { "io.modelcontextprotocol/protocolVersion": MODERN, "io.modelcontextprotocol/clientCapabilities": {} } }
    : params;
  return request(ORIGIN + "/mcp", { method: "POST", headers, body: JSON.stringify({ jsonrpc: "2.0", id, method, params: fullParams }) });
}
async function verify() {
  const health = await getJson(ORIGIN + "/healthz", /application\/json/i);
  assert.equal(health.status, "ok");

  const card = await getJson(ORIGIN + "/mcp/server-card", /application\/mcp-server-card\+json/i);
  assert.equal(card.name, "com.hymtravel/public-travel");
  assert(card.remotes?.some(remote => remote.url === ORIGIN + "/mcp" && remote.type === "streamable-http"));
  const catalog = await getJson(ORIGIN + "/.well-known/ai-catalog.json", /application\/ai-catalog\+json/i);
  assert(catalog.entries?.some(entry => entry.url === ORIGIN + "/mcp/server-card"));
  const alias = await getJson(ORIGIN + "/.well-known/mcp/server-card.json", /application\/mcp-server-card\+json/i);
  assert.deepEqual(alias, card);

  const init = await postRpc("initialize", {
    protocolVersion: LEGACY, capabilities: {}, clientInfo: { name: "hymt-live-check", version: "1.0" }
  }, 1);
  assert.equal(init.response.status, 200);
  assert.equal(init.json.result.protocolVersion, LEGACY);

  const modernDiscover = await postRpc("server/discover", {}, 2, true);
  assert.equal(modernDiscover.response.status, 200);
  assert.equal(modernDiscover.json.result.resultType, "complete");
  const list = await postRpc("tools/list", {}, 3, true);
  assert.equal(list.response.status, 200);
  for (const name of ["list_hymt_sections", "get_hymt_public_contact"])
    assert(list.json.result.tools.some(tool => tool.name === name), name + " missing");

  for (const name of ["list_hymt_sections", "get_hymt_public_contact"]) {
    const call = await postRpc("tools/call", { name, arguments: {} }, 4, true);
    assert.equal(call.response.status, 200);
    assert.equal(call.json.result.isError, false);
    assert(call.json.result.structuredContent, name + " missing structured content");
  }

  const invalid = await postRpc("tools/call", { name: "get_hymt_public_contact", arguments: { unwanted: true } }, 5, true);
  assert.equal(invalid.json.result.isError, true);
  const crossOrigin = await postRpc("tools/list", {}, 6, true, { Origin: "https://untrusted.invalid" });
  assert.equal(crossOrigin.response.status, 403);
  const unsupported = await request(ORIGIN + "/mcp", { method: "GET" });
  assert.equal(unsupported.response.status, 405);
  console.log("PASS Render health, Server Card, AI Catalog, legacy + modern MCP, both tools, negative cases.");

  if (CHECK_SITE) {
    const siteCatalog = await getJson(SITE + "/.well-known/ai-catalog.json", /json/i);
    assert(siteCatalog.entries?.some(entry => entry.url === ORIGIN + "/mcp/server-card"));
    const siteCard = await getJson(SITE + "/.well-known/mcp/server-card.json", /json/i);
    assert.deepEqual(siteCard, card, "website discovery card must match live MCP endpoint");
    console.log("PASS production website discovery catalog + Server Card.");
  }
}

for (let attempt = 1; attempt <= RETRIES; attempt++) {
  try { await verify(); process.exit(0); }
  catch (err) {
    console.error("Attempt " + attempt + "/" + RETRIES + ": " + err.message);
    if (attempt === RETRIES) process.exit(1);
    await delay(15000);
  }
}
