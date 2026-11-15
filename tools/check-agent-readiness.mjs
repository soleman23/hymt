import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const read = (p) => readFile(new URL("../" + p, import.meta.url), "utf8");
for (const file of ["robots.txt", ".htaccess", "index.markdown", "agent-tools.js"]) {
  assert.equal(await read("public/" + file), await read("dist/" + file), file + " output drift");
}
const robots = await read("dist/robots.txt");
const groups = robots.split(/(?=^User-agent: )/gm);
for (const group of groups.filter(g => /^Allow: \/$/m.test(g) || /^Crawl-delay: /m.test(g))) {
  assert.match(group, /^Content-Signal: search=yes, ai-input=yes, ai-train=no$/m);
}
const ht = await read("dist/.htaccess");
assert.ok(ht.includes("AddType text/markdown .markdown"));
assert.ok(ht.includes("HTTP_ACCEPT} text/markdown"));
assert.ok(ht.includes("RewriteRule ^(index\\.html)?$ /index.markdown") || ht.includes("RewriteRule ^(index\\.html)?$ /index.markdown".replace("\\\\", "\\")));
assert.ok(ht.includes("Header always set Link"));
assert.ok(ht.includes('Header always merge Vary "Accept"'));
const md = await read("dist/index.markdown");
assert.ok(md.includes("https://www.hymtravel.com/plan-your-trip/"));
const js = await read("dist/agent-tools.js");
assert.ok(js.includes("document.modelContext") && js.includes("context.registerTool"));
assert.ok(!js.includes("navigator.modelContext"));
const html = await read("dist/index.html");
const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
for (const type of ["TravelAgency", "WebPage", "WebSite", "Service"]) {
  assert.ok(blocks.some(node => node["@type"] === type), "missing " + type);
}
assert.equal(blocks.filter(node => node["@type"] === "Service").length, 3);
assert.ok(html.includes('<script defer src="/agent-tools.js"></script>'));
console.log("ok agent-readable routes, resources, schema, and WebMCP bootstrap");
