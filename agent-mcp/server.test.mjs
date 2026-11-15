import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { createMcpServer, LEGACY, MODERN, SERVER_INFO } from "./server.mjs";
import { SITE, SECTIONS } from "./manifest.mjs";
import { access } from "node:fs/promises";

let server, base;
before(async () => {
  server = createMcpServer({ publicUrl: "https://mcp.example.test" });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  base = "http://127.0.0.1:" + server.address().port;
});
after(async () => { await new Promise((resolve) => server.close(resolve)); });

async function rpc(method, params = {}, opt = {}) {
  const modern = opt.modern !== false;
  const id = opt.id ?? 1;
  const meta = modern
    ? { _meta: {
      "io.modelcontextprotocol/protocolVersion": MODERN,
      "io.modelcontextprotocol/clientInfo": { name: "test", version: "1.0" },
      "io.modelcontextprotocol/clientCapabilities": {}
    } }
    : {};
  const request = {
    jsonrpc: "2.0", id, method,
    params: { ...params, ...meta }
  };
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    ...(modern ? { "MCP-Protocol-Version": MODERN, "Mcp-Method": method } :
      (method === "initialize" ? {} : { "MCP-Protocol-Version": LEGACY })),
    ...(modern && method === "tools/call" ? { "Mcp-Name": params.name } : {}),
    ...(opt.headers || {})
  };
  const response = await fetch(base + "/mcp", {
    method: "POST", headers, body: JSON.stringify(request)
  });
  return { status: response.status, body: await response.json(), headers: response.headers };
}

test("public read-only resource manifest points at existing routes", async () => {
  for (const [key, item] of Object.entries(SECTIONS)) {
    assert.match(SITE + item.path, /^https:\/\/www\.hymtravel\.com\//);
    const path = new URL("../src/pages" + item.path + "index.astro", import.meta.url);
    await access(path).catch(() => { throw new Error("missing route " + key); });
  }
});
test("health, Server Card and AI Catalog are truthful", async () => {
  const h = await fetch(base + "/healthz");
  assert.equal(h.status, 200);
  assert.equal((await h.json()).status, "ok");
  const cardResponse = await fetch(base + "/mcp/server-card");
  assert.match(cardResponse.headers.get("content-type"), /mcp-server-card\+json/);
  const card = await cardResponse.json();
  assert.equal(card.name, SERVER_INFO.name);
  assert.equal(card.remotes[0].url, "https://mcp.example.test/mcp");
  assert.deepEqual(card.remotes[0].supportedProtocolVersions, [MODERN, LEGACY]);
  const alias = await (await fetch(base + "/.well-known/mcp/server-card.json")).json();
  assert.deepEqual(alias, card);
  const catalog = await (await fetch(base + "/.well-known/ai-catalog.json")).json();
  assert.equal(catalog.specVersion, "1.0");
  assert.equal(catalog.entries[0].type, "application/mcp-server-card+json");
  assert.equal(catalog.entries[0].url, "https://mcp.example.test/mcp/server-card");
});
test("modern discover and tools/list use mandatory metadata", async () => {
  const discover = await rpc("server/discover");
  assert.equal(discover.status, 200);
  assert.equal(discover.body.result.resultType, "complete");
  assert.deepEqual(discover.body.result.supportedVersions, [MODERN, LEGACY]);
  const list = await rpc("tools/list");
  assert.equal(list.status, 200);
  assert.equal(list.body.result.resultType, "complete");
  assert.equal(list.body.result.tools.length, 2);
  assert.equal(list.body.result.cacheScope, "public");
});
test("modern tools/call is read-only, returns structured links, rejects invalid input", async () => {
  const ok = await rpc("tools/call", { name: "list_hymt_sections",
    arguments: { section: "destinations" } });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.result.structuredContent.sections[0].url,
    "https://www.hymtravel.com/destinations/");
  const no = await rpc("tools/call", { name: "list_hymt_sections",
    arguments: { section: "../../secrets" } });
  assert.equal(no.body.result.isError, true);
  const contact = await rpc("tools/call", { name: "get_hymt_public_contact", arguments: {} });
  assert.equal(contact.body.result.structuredContent.email, "mark@hymtravel.com");
});
test("legacy initialize and tools/list remain compatible", async () => {
  const hello = await rpc("initialize", { protocolVersion: LEGACY, capabilities: {},
    clientInfo: { name: "test", version: "1.0" } }, { modern: false });
  assert.equal(hello.status, 200);
  assert.equal(hello.body.result.protocolVersion, LEGACY);
  const tools = await rpc("tools/list", {}, { modern: false });
  assert.equal(tools.status, 200);
  assert.equal(tools.body.result.tools.length, 2);
  assert.equal(tools.body.result.resultType, undefined);
});
test("headers, unknown methods, origins and size limits fail closed", async () => {
  const bad = await rpc("tools/list", {}, { headers: { "Mcp-Method": "tools/call" } });
  assert.equal(bad.status, 400);
  const unknown = await rpc("not/a/method");
  assert.equal(unknown.status, 404);
  const origin = await fetch(base + "/mcp", { method: "POST",
    headers: { Origin: "https://untrusted.example" } });
  assert.equal(origin.status, 403);
  const get = await fetch(base + "/mcp");
  assert.equal(get.status, 405);
  const tooBig = await fetch(base + "/mcp", { method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
    body: "x".repeat(40000) });
  assert.equal(tooBig.status, 413);
});
test("browser preflight is restricted to explicitly trusted origins", async () => {
  const good = await fetch(base + "/mcp", { method: "OPTIONS",
    headers: { Origin: "https://www.hymtravel.com" } });
  assert.equal(good.status, 204);
  assert.equal(good.headers.get("access-control-allow-origin"), SITE);
  const bad = await fetch(base + "/mcp", { method: "OPTIONS",
    headers: { Origin: "https://unknown.example" } });
  assert.equal(bad.status, 403);
});
