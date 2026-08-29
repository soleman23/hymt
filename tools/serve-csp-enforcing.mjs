/**
 * Serve dist/ with the site's Content-Security-Policy applied as ENFORCING.
 *
 *   node tools/serve-csp-enforcing.mjs [port]      (default 4399)
 *
 * The header ships as Content-Security-Policy-Report-Only (#82), which by
 * construction cannot break a page - and therefore cannot prove anything
 * either. This reads that exact value from dist/.htaccess and sends it as a
 * real Content-Security-Policy, deliberately stricter than production, so a
 * wrong script hash or a missing origin blocks the script here and shows up
 * in the browser console, instead of at launch when #100 flips the header.
 *
 * This is the technique the 2026-08-17 verification used ("dist/ was served
 * locally with this exact policy applied as *enforcing*"), written down so
 * #100's re-test of the conversion path does not have to reinvent it. Browse
 * home, Contact, Plan Your Trip, a destination page, a journal post and both
 * hubs; the console must show zero CSP violations and every form must still
 * reach its branded success state (stub fetch first - do not send Mark a
 * test inquiry).
 *
 * Only .html responses get the header, which is where a CSP applies. Not
 * meant to resemble Hostinger in any other way; the point is the header.
 */
import http from "node:http";
import { cspHeaders } from "./content-checks.mjs";
import { readFile } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIST = path.join(ROOT, "dist");
const PORT = Number(process.argv[2] ?? 4399);

const htaccess = await readFile(path.join(DIST, ".htaccess"), "utf8");
/* Either spelling. This tool existed to rehearse #100, and pinning
   -Report-Only meant it stopped working the moment #100 landed — exactly when
   you would reach for it to check the rollback, or to re-rehearse after a
   change. cspHeaders() returns enforcing first, so after the flip this serves
   the real policy and the rehearsal becomes a faithful replay. */
const present = cspHeaders(htaccess);
if (present.length === 0) {
  console.error("dist/.htaccess has no Content-Security-Policy header in either spelling - run `npm run build` first");
  process.exit(1);
}
if (present.length > 1) {
  console.error(`dist/.htaccess ships BOTH ${present.map((p) => p.name).join(" and ")} - a browser applies both. Delete whichever is not intended before rehearsing.`);
  process.exit(1);
}
const CSP = present[0].policy;
if (present[0].name === "Content-Security-Policy") {
  console.log("note: dist/ already ships an ENFORCING policy, so this server is now a faithful replay of production rather than a stricter rehearsal of it.");
}

const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml",
  ".woff2": "font/woff2", ".woff": "font/woff", ".xml": "application/xml", ".txt": "text/plain",
  ".ico": "image/x-icon", ".json": "application/json",
};

http.createServer(async (req, res) => {
  let file = path.join(DIST, decodeURIComponent(new URL(req.url, "http://localhost").pathname));
  if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, "index.html");
  if (!existsSync(file)) { file = path.join(DIST, "404.html"); res.statusCode = 404; }
  const ext = path.extname(file).toLowerCase();
  res.setHeader("Content-Type", TYPES[ext] ?? "application/octet-stream");
  if (ext === ".html") res.setHeader("Content-Security-Policy", CSP);
  res.end(await readFile(file));
}).listen(PORT, () => {
  console.log(`dist/ on http://localhost:${PORT}/ with the CSP ENFORCING (report-only in production)`);
  console.log(`script-src: ${/script-src ([^;]*)/.exec(CSP)?.[1].split(" ").length ?? 0} sources`);
});
