// Safe, read-only production verification. No form submissions.
import assert from "node:assert/strict";
import { setTimeout as delay } from "node:timers/promises";

const ROOT = "https://www.hymtravel.com";
const retry = process.argv.includes("--retry");
const attempts = retry ? 20 : 1;
const required = ["GPTBot", "ClaudeBot", "Google-Extended", "Applebot-Extended"];

async function read(path, accept = "text/html") {
  const response = await fetch(ROOT + path, {
    headers: { Accept: accept },
    redirect: "follow",
    signal: AbortSignal.timeout(12000),
  });
  return { response, body: await response.text() };
}
async function verify() {
  const robots = await read("/robots.txt", "text/plain");
  assert.equal(robots.response.status, 200, "robots.txt must be public");
  assert.ok(robots.body.includes("Content-Signal: search=yes, ai-input=yes, ai-train=no"));
  for (const bot of required) {
    const re = new RegExp("User-agent: " + bot + "\\s*\\nDisallow: /", "i");
    assert.match(robots.body, re, bot + " must be disallowed");
  }
  const llms = await read("/llms.txt", "text/plain");
  assert.equal(llms.response.status, 200);
  assert.match(llms.body, /Hit Your Mark Travel/);
  const js = await read("/agent-tools.js", "application/javascript");
  assert.equal(js.response.status, 200);
  assert.match(js.body, /document\.modelContext/);
  const direct = await read("/index.markdown", "text/markdown");
  assert.equal(direct.response.status, 200);
  assert.match(direct.response.headers.get("content-type") || "", /text\/markdown/i);
  assert.match(direct.body, /^# Hit Your Mark Travel/m);

  const representations = ["text/html", "text/markdown", "text/html", "text/markdown", "text/html"];
  for (const accept of representations) {
    const { response, body } = await read("/", accept);
    assert.equal(response.status, 200);
    const ct = response.headers.get("content-type") || "";
    assert.match(ct, accept === "text/markdown" ? /text\/markdown/i : /text\/html/i,
      "wrong variant at CDN for Accept " + accept);
    const vary = response.headers.get("vary") || "";
    assert.match(vary, /\bAccept\b/i, "Vary: Accept missing");
    const link = response.headers.get("link") || "";
    assert.ok(link.includes("</llms.txt>") && link.includes("</index.markdown>"),
      "agent alternate Link header missing");
    const cache = response.headers.get("cache-control") || "";
    // Hostinger's FilesMatch policy is authoritative: HTML currently returns
    // public, max-age=0, must-revalidate, no-transform. The Vary header plus
    // alternating response-body checks below detect cross-variant caching.
    assert.ok(/no-store/i.test(cache) ||
      (/max-age=0/i.test(cache) && /must-revalidate/i.test(cache)),
      "Expected non-stale cache policy, got: " + cache);
    if (accept === "text/markdown") {
      assert.match(body, /^# Hit Your Mark Travel/m);
      assert.doesNotMatch(body, /<!DOCTYPE html>/i);
    } else {
      assert.match(body, /<!DOCTYPE html>/i);
      assert.match(body, /<html lang="en">/);
      assert.match(body, /application\/ld\+json/);
    }
  }
}

for (let i = 1; i <= attempts; i++) {
  try {
    await verify();
    console.log("ok production agent surfaces, CDN negotiation, headers, robots and assets");
    process.exit(0);
  } catch (error) {
    console.error("agent-live attempt " + i + "/" + attempts + ":", error.message);
    if (i === attempts) process.exit(1);
    await delay(45000);
  }
}
