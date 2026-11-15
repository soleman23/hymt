import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";

const read = (p) => readFile(new URL("../" + p, import.meta.url), "utf8");
for (const file of ["robots.txt", ".htaccess", "index.markdown", "agent-tools.js"]) {
  assert.equal(await read("public/" + file), await read("dist/" + file), file + " output drift");
}

const robots = await read("dist/robots.txt");
const groups = robots.split(/(?=^User-agent: )/gm);
const group = (name) => {
  const matches = groups.filter(g => new RegExp("^User-agent: " + name + "$", "m").test(g));
  assert.equal(matches.length, 1, "exactly one robots.txt group for " + name);
  return matches[0];
};
for (const section of groups.filter(g => /^Allow: \/$/m.test(g) || /^Crawl-delay: /m.test(g))) {
  assert.match(section, /^Content-Signal: search=yes, ai-input=yes, ai-train=no$/m);
}
for (const name of ["GPTBot", "ClaudeBot", "Google-Extended", "Applebot-Extended"]) {
  assert.match(group(name), /^Disallow: \/$/m, "training bot must be blocked: " + name);
  assert.doesNotMatch(group(name), /^Allow: \/$/m);
}
for (const name of ["Googlebot", "Bingbot", "OAI-SearchBot", "ChatGPT-User", "Claude-SearchBot", "Claude-User", "Applebot"]) {
  assert.match(group(name), /^Allow: \/$/m, "search bot must remain allowed: " + name);
}
assert.match(robots, /^Sitemap: https:\/\/www\.hymtravel\.com\/sitemap-index\.xml$/m);

const ht = await read("dist/.htaccess");
assert.ok(ht.includes("AddType text/markdown .markdown"));
assert.ok(ht.includes("HTTP_ACCEPT} text/markdown"));
assert.ok(ht.includes(String.raw`RewriteRule ^(index\.html)?$ /index.markdown`));
assert.ok(ht.includes("Header always set Link"));
assert.ok(ht.includes('Header always merge Vary "Accept"'));
assert.ok(ht.includes("HYMT_AGENT_HOME"));
assert.ok(ht.includes('Header always set Cache-Control "private, no-store, max-age=0, no-transform" env=HYMT_AGENT_HOME'));
const md = await read("dist/index.markdown");
for (const url of ["/destinations/", "/experiences/", "/plan-your-trip/", "/contact/"]) {
  assert.ok(md.includes("https://www.hymtravel.com" + url), "missing Markdown link: " + url);
}
const js = await read("dist/agent-tools.js");
assert.ok(js.includes("document.modelContext") && js.includes("context.registerTool"));
assert.ok(!js.includes("navigator.modelContext"));
assert.ok(js.includes("readOnlyHint: true"));
assert.ok(js.includes(")).catch(() => {})"));

const html = await read("dist/index.html");
const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
for (const type of ["TravelAgency", "WebPage", "WebSite", "Service"]) {
  assert.ok(blocks.some(node => node["@type"] === type), "missing " + type);
}
const agency = blocks.find(node => node["@type"] === "TravelAgency");
const website = blocks.find(node => node["@type"] === "WebSite");
assert.equal(website.publisher["@id"], agency["@id"]);
const services = blocks.filter(node => node["@type"] === "Service");
assert.equal(services.length, 3);
for (const service of services) {
  assert.equal(service.provider["@id"], agency["@id"]);
  assert.ok(md.includes(service.url));
}
assert.ok(html.includes('<script defer src="/agent-tools.js"></script>'));

// Test actual browser registration and execution, without network access.
let registered;
const mockDocument = {
  modelContext: {
    registerTool(tool) {
      registered = tool;
      return Promise.resolve();
    }
  }
};
runInNewContext(js, { document: mockDocument, Promise });
assert.equal(registered?.name, "explore_hymt_travel");
assert.equal(registered?.annotations?.readOnlyHint, true);
assert.deepEqual(Array.from(registered.inputSchema.required), ["topic"]);
const result = await registered.execute({ topic: "destinations" });
assert.equal(result.url, "https://www.hymtravel.com/destinations/");
assert.equal(result.business, "Hit Your Mark Travel");
const invalid = await registered.execute({ topic: "__proto__" });
assert.ok(invalid.error && !invalid.url);
assert.doesNotThrow(() => runInNewContext(js, { document: {} }));
assert.doesNotThrow(() => runInNewContext(js, {
  document: { modelContext: { registerTool() { throw new Error("unsupported"); } } }
}));
runInNewContext(js, {
  document: { modelContext: { registerTool() { return Promise.reject(new Error("unsupported")); } } },
  Promise
});
await Promise.resolve(); // registration rejection is handled, not leaked

console.log("ok robots crawler policy, Markdown discovery, linked schema and WebMCP tool execution");
