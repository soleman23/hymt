/**
 * The two content predicates verify-deployment.mjs uses, in one place so the
 * verifier and tools/verify-checks.test.mjs cannot drift apart.
 *
 * Both of these were written inline first and both were wrong in ways a green
 * build could not reveal, which is why they now live behind fixtures:
 *
 *   - linkFloor counted the whole document. Footer.astro puts 15
 *     destination/experience links on every page of the site, so every journal
 *     post scored 15 before linking to anything. The check could not fail.
 *   - testimonialAttribution matched only the first attribution on a page,
 *     opted itself out of any block carrying an extra class, and rejected an
 *     attribution containing a nested tag — including the <time> element
 *     CONTENT-STANDARDS § 5 requires for dated content.
 */
import { createHash } from "node:crypto";

/** Visible text of an HTML fragment, tags and &nbsp; removed. */
export const textIn = (s) =>
  s.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

/**
 * Visible text of a full page: scripts, styles and comments are stripped
 * BEFORE tags, so a sanctioned <!-- NEEDS MARK --> marker never counts as
 * shipped copy but the same token in rendered text does. This is the string
 * the placeholder-copy check reads.
 */
export const visibleText = (html) => html
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<!--[\s\S]*?-->/g, " ")
  .replace(/<[^>]+>/g, " ");

/**
 * Placeholder tokens that must never ship as visible copy. NEEDS FIGURE and
 * NEEDS MARK joined the list with the P3-3 figure insertion: both are
 * sanctioned inside comments, and a cost section uncommented with one still
 * in it is precisely the failure the old list could not see.
 */
export const PLACEHOLDER_PATTERNS = [
  ["Lorem ipsum", /lorem ipsum/i],
  ["TBD", /\bTBD\b/],
  ["Coming soon", /coming soon/i],
  ["TODO", /\bTODO\b/],
  ["XXX", /\bXXX\b/],
  ["Placeholder", /placeholder/i],
  ["NEEDS FIGURE / NEEDS MARK", /\bNEEDS (?:FIGURE|MARK)\b/],
];

/**
 * Inner HTML of an element whose opening tag ends at `from`, honouring nesting.
 *
 * A regex cannot do this: `<div class="x">…<div>…</div>…</div>` matched
 * non-greedily stops at the FIRST `</div>`, which truncates the content. Both
 * a testimonial block and its attribution are routinely divs inside divs, so
 * the naive version silently read half an element and reported valid markup as
 * missing.
 */
export function innerOf(html, from, tag) {
  const token = new RegExp(`<(/?)${tag}\\b`, "gi");
  token.lastIndex = from;
  let depth = 1;
  for (let m; (m = token.exec(html)); ) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return html.slice(from, m.index);
  }
  return html.slice(from); // unclosed; caller still gets something to test
}

/**
 * Distinct internal links of one kind inside <main>.
 *
 * Returns the count, or the string "no-main" when the page has no <main> — the
 * caller reports that as its own cause rather than letting every count fall to
 * zero and stack a second, misleading failure on top.
 *
 * @param {"journal"|"section"} kind  "journal" counts links OUT to
 *   /destinations/ and /experiences/; "section" counts links to /travel-journal/.
 */
export function linkFloor(html, kind) {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
  if (!main) return "no-main";
  const re = kind === "journal"
    ? /<a\b[^>]+href="(\/(?:destinations|experiences)\/[^"#?]+?)\/?"/gi
    : /<a\b[^>]+href="(\/travel-journal\/[^"#?]+?)\/?"/gi;
  // Trailing slash normalised: linkResolves() accepts either spelling, so the
  // two must not count as two distinct links, and neither may score zero.
  return new Set([...main.matchAll(re)].map((m) => m[1].replace(/\/?$/, "/"))).size;
}

/**
 * The breadcrumb trail a page renders, in document order.
 *
 * DestinationLayout builds the visible trail and the BreadcrumbList schema
 * from one array, so this is also the page's position in the hierarchy and
 * cannot disagree with the markup. A destination country page returns four
 * crumbs (Home, Destinations, Region, Name); a regional hub returns three,
 * because the layout omits the region crumb on the hubs themselves. That is
 * the signal page-length uses to tell the two apart — a hardcoded list of
 * the nine hub slugs would drift the first time one is added.
 *
 * Returns [] when the page has no breadcrumb.
 */
export function crumbTrail(html) {
  const open = /<div\b[^>]*class="[^"]*\bbreadcrumb__inner\b[^"]*"[^>]*>/i.exec(html);
  if (!open) return [];
  const inner = innerOf(html, open.index + open[0].length, "div");
  return [...inner.matchAll(
    /class="breadcrumb__(?:link|current)"[^>]*>([\s\S]*?)<\/(?:a|span)>/gi
  )].map((m) => textIn(m[1]));
}

/**
 * Words of body copy a page actually authors, for the page-length check.
 *
 * CONTENT-STANDARDS § 3.4 sets a 1,500-3,500 word range for a destination
 * country page. Nothing measured it, and nothing could: the 25 M7 pages were
 * drafted at 3,636-4,087 words -- 15-25% over the ceiling and well past
 * anything the site had ever shipped -- and every one of them built green.
 * That is the same shape as the hero stat rail: a standard with no check
 * behind it drifts silently and in one direction.
 *
 * WHAT IS COUNTED, and why it is not simply everything inside <main>:
 * the breadcrumb and the hero are emitted by DestinationLayout from props,
 * not written in the page body, and they add a fairly constant ~108 words to
 * every page. Counting them would measure the layout as much as the copy, and
 * it moves the numbers enough to matter -- Thailand is 3,402 words of copy and
 * 3,510 with the chrome, so an honest page would fail a ceiling written
 * against the standard's own number. Stripped, this returns exactly what a
 * count of src/content-pages/destinations__<slug>.html returns, which is the
 * file an author edits when the check goes red.
 *
 * Nesting is honoured through innerOf: a non-greedy `<main>...</main>` stops
 * at the first nested close and would undercount most of the page.
 *
 * Returns the count, or "no-main" so the caller can report that as its own
 * cause rather than letting a zero stack a second, misleading failure.
 */
export function bodyWords(html) {
  const open = /<main\b[^>]*>/i.exec(html);
  if (!open) return "no-main";
  let inner = innerOf(html, open.index + open[0].length, "main");
  for (const [tag, cls] of [["div", "breadcrumb"], ["section", "dest-hero"]]) {
    const m = new RegExp(`<${tag}\\b[^>]*class="[^"]*\\b${cls}\\b[^"]*"[^>]*>`, "i").exec(inner);
    if (!m) continue;
    const from = m.index + m[0].length;
    inner = inner.slice(0, m.index) + " " + inner.slice(from + innerOf(inner, from, tag).length);
  }
  return visibleText(inner).split(/\s+/).filter(Boolean).length;
}

/**
 * FAQ answers whose FIRST sentence runs over `max` words (default 25).
 *
 * CONTENT-STANDARDS § 3.3, marked non-negotiable: the first sentence of every
 * FAQ answer is a complete answer in ≤25 words — it is what makes the answer
 * quotable by an answer engine and the accordion scannable. The site reached
 * 0-of-408 over the limit in two passes (50 mechanical em-dash splits, 36
 * hand rewrites); this check is what keeps a future page from quietly
 * regressing the standard one answer at a time.
 *
 * Returns [{question, words}] for the offenders — empty array means clean.
 * Decimal points ("2.5 hours") and common abbreviations do not end a
 * sentence; the boundary needs whitespace or a tag after the mark.
 */
export function faqFirstSentenceOver(html, max = 25) {
  const out = [];
  for (const [, q, a] of html.matchAll(
    /class="pf-q__text">([^<]*)<[\s\S]*?class="pf-a"[^>]*>([\s\S]*?)<\/div>/g
  )) {
    const text = textIn(a);
    const guard = text.replace(/\b(St|Mt|Dr|Mr|Ms|No|vs|approx)\./gi, (m) => m.replace(".", "\u0000"));
    const m = guard.match(/^[\s\S]*?[.!?](?=\s|$)/);
    const first = (m ? m[0] : guard).replace(/\u0000/g, ".");
    const words = first.split(/\s+/).filter(Boolean).length;
    if (words > max) out.push({ question: textIn(q), words });
  }
  return out;
}

/**
 * Dangerous URL schemes in link-bearing attributes (SEC-8, #81).
 *
 * The content pages render through `set:html`, so a URL that arrives via an
 * automated insert (worksheet ingestion, figure scripts) ships exactly as
 * written. `javascript:`/`vbscript:` anywhere, and `data:text/html` on a
 * link, are stored-XSS vectors — no page on this site has a legitimate use
 * for any of them. Numeric entities are decoded first so `&#106;avascript:`
 * cannot slip past as an encoding.
 *
 * Returns the offending attribute values — empty array means clean.
 */
export function unsafeHrefs(html) {
  const out = [];
  const decode = (s) => s
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&Tab;|&NewLine;/gi, "");
  for (const m of html.matchAll(/\b(?:href|src|action|formaction)\s*=\s*("[^"]*"|'[^']*')/gi)) {
    const val = decode(m[1].slice(1, -1)).replace(/[\s\u0000-]+/g, "").toLowerCase();
    if (/^(javascript|vbscript):/.test(val) || val.startsWith("data:text/html")) {
      out.push(m[1].slice(1, -1).slice(0, 80));
    }
  }
  return out;
}

/**
 * Image assets a page fetches BEFORE any scrolling (#72, runbook §2.4).
 *
 * Two things load eagerly and are worth counting:
 *   - an <img> without loading="lazy";
 *   - an inline background-image, which cannot be made lazy at all — that is
 *     the whole reason it keeps causing this. The related-destinations cards
 *     shipped 699 KB per page that way (#69), and the homepage shipped
 *     5.72 MB (#72).
 *
 * data: URIs are skipped (already in the HTML, not a second fetch) and each
 * path is counted once however many times it appears, matching what a browser
 * actually does with its cache.
 *
 * Returns the distinct asset paths. The caller turns those into bytes — this
 * stays pure so it can be fixture-tested without a filesystem.
 */
export function eagerImageRefs(html) {
  const out = new Set();
  const add = (p) => {
    if (p && !p.startsWith("data:") && !/^https?:/i.test(p)) out.add(p.split(/[?#]/)[0]);
  };
  for (const tag of html.match(/<img\b[^>]*>/gi) ?? []) {
    if (/\bloading\s*=\s*["']?lazy/i.test(tag)) continue;
    add(/\bsrc\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1]);
  }
  /* Inline styles only. A background-image declared in a stylesheet may never
     paint, so counting it would produce false failures; every offender this
     check exists for has been an inline style attribute. */
  for (const style of html.match(/\bstyle\s*=\s*"[^"]*"/gi) ?? []) {
    for (const m of style.matchAll(/background-image\s*:\s*url\(\s*['"]?([^'")]+)/gi)) add(m[1]);
  }
  return [...out];
}

/**
 * Links that open a new tab without opener protection (SEC-5, #80).
 *
 * `target="_blank"` without `rel="noopener"` hands the opened page a live
 * `window.opener` handle back to ours, which is the tabnabbing vector. The
 * house style is `rel="noopener noreferrer"`, but `noreferrer` alone also
 * severs the handle in every browser that matters, so either token passes —
 * the check enforces the security property, not the spelling.
 *
 * Returns the offending anchor tags — empty array means clean.
 */
export function unsafeBlankLinks(html) {
  const out = [];
  for (const m of html.matchAll(/<a\b[^>]*\btarget\s*=\s*["']?_blank["']?[^>]*>/gi)) {
    const rel = /\brel\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/i.exec(m[0]);
    const raw = rel ? rel[1].replace(/^["']|["']$/g, "") : "";
    const tokens = raw.toLowerCase().split(/\s+/);
    if (!tokens.includes("noopener") && !tokens.includes("noreferrer")) {
      out.push(m[0].slice(0, 90));
    }
  }
  return out;
}

/**
 * The automated-insert surface must stay inert (SEC-8, #81).
 *
 * `.cost-range` sections are written by tools/p3-8-cost-insert.mjs from
 * worksheet data, not by hand. Script tags and inline event handlers have no
 * business there, so their presence means either the insert path failed to
 * escape or someone pasted markup into a data field. Checked per section,
 * with nesting honoured via innerOf().
 *
 * Returns ["script"|"event-handler", …] findings — empty array means clean.
 */
export function inertCostSections(html) {
  const out = [];
  const open = /<(\w+)\b[^>]*\bclass="[^"]*\bcost-range\b[^"]*"[^>]*>/gi;
  for (const m of html.matchAll(open)) {
    const inner = innerOf(html, m.index + m[0].length, m[1]);
    if (/<script\b/i.test(inner)) out.push("script");
    if (/\son\w+\s*=/i.test(inner)) out.push("event-handler");
  }
  return out;
}

/**
 * Whether every `.cls` block on the page carries a non-empty `.attrCls`.
 *
 * Returns "PASS", "FAIL", or "no-blocks" when the component is absent.
 * Classes are matched as TOKENS, so `class="pull-quote featured"` is still a
 * pull-quote — an exact-attribute match let a block opt itself out of the
 * check by gaining one utility class.
 */
export function testimonialAttribution(html, cls, attrCls) {
  const blockRe = new RegExp(`<(\\w+)\\b[^>]*\\bclass="[^"]*\\b${cls}\\b[^"]*"[^>]*>`, "gi");
  const blocks = [...html.matchAll(blockRe)];
  if (!blocks.length) return "no-blocks";

  for (const b of blocks) {
    const inner = innerOf(html, b.index + b[0].length, b[1]);
    const a = new RegExp(`<(\\w+)\\b[^>]*\\bclass="[^"]*\\b${attrCls}\\b[^"]*"[^>]*>`, "i").exec(inner);
    if (!a) return "FAIL";
    if (!textIn(innerOf(inner, a.index + a[0].length, a[1]))) return "FAIL";
  }
  return "PASS";
}


/**
 * Article cards that link nowhere (#106).
 *
 * The journal index shipped 39 cards of which 7 contained no <a> at all -- a
 * <span class="article-card__read">Read more</span> and nothing else. Three
 * duplicated an article already linked on the same page; four advertised
 * articles that did not exist. Unreachable by keyboard, invisible to crawlers,
 * and silently absent from the page's own ItemList schema, which is built by
 * parsing for exactly the link they lacked.
 *
 * Nothing caught it. `internal-links` only validates hrefs that exist, so a
 * card with no href is not a broken link to it -- it is nothing at all. That is
 * the gap this closes.
 *
 * Returns the titles of cards with no in-site link; [] means every card links.
 */
export function linklessCards(html, cls = "article-card") {
  const out = [];
  const open = new RegExp(`<(\\w+)\\b[^>]*\\bclass="[^"]*\\b${cls}\\b[^"]*"[^>]*>`, "gi");
  for (const m of html.matchAll(open)) {
    /* The card may BE the link rather than contain one: the journal index uses
       <div class="article-card"> with an <a> inside, while the related-articles
       grid on every post uses <a class="article-card" href="...">. Checking
       only the inside reports all 86 of the latter as broken. */
    if (m[1].toLowerCase() === "a" && /\bhref="\/[^"]*"/i.test(m[0])) continue;
    const inner = innerOf(html, m.index + m[0].length, m[1]);
    if (/<a\b[^>]*\bhref="\/[^"]*"/i.test(inner)) continue;
    const title = /class="[^"]*__title"[^>]*>([\s\S]*?)<\//i.exec(inner);
    out.push(title ? textIn(title[1]) : "(untitled card)");
  }
  return out;
}


/**
 * Inline event handlers that call a function nothing defines (#104).
 *
 * `unsafeHrefs` and `inertCostSections` already police what an inline handler
 * may CONTAIN. Nothing checked that the function it names exists. The result
 * shipped and stayed shipped: `copyLink()` on 64 buttons across all 32 journal
 * pages, `shareArticle('facebook')` on 18 more, defined nowhere in the repo or
 * the built site. Valid markup, clean build, every button dead, and all of them
 * carrying an aria-label announcing a working control.
 *
 * Only BARE calls count. `window.location.href='/x/'` is a member expression
 * and resolves at runtime, so it is not this check's business.
 *
 * Definitions are read from the page's own inline <script> blocks, which is the
 * only place a global handler can come from on this site — there are no
 * external script files.
 *
 * Returns [{ name, count }] for each unresolved function, or [] when clean.
 */
const HANDLER_KEYWORDS = new Set([
  "if", "for", "while", "switch", "catch", "return", "typeof", "function",
  "new", "do", "else", "delete", "void", "in", "of",
]);

/* Callable browser globals an inline handler may legitimately reach for. Kept
   deliberately short: anything not here has to be defined on the page. */
const HANDLER_GLOBALS = new Set([
  "alert", "confirm", "prompt", "open", "print", "fetch", "setTimeout",
  "setInterval", "clearTimeout", "clearInterval", "encodeURIComponent",
  "decodeURIComponent", "Number", "String", "Boolean", "Array", "Object",
  "JSON", "Math", "Date", "RegExp", "parseInt", "parseFloat", "isNaN",
]);

export function undefinedInlineHandlers(html) {
  const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => m[1]).join("\n");

  const defined = new Set();
  for (const re of [
    /\bfunction\s+([A-Za-z_$][\w$]*)/g,
    /\b(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=/g,
    /\bwindow\.([A-Za-z_$][\w$]*)\s*=/g,
  ]) {
    for (const m of scripts.matchAll(re)) defined.add(m[1]);
  }

  const missing = new Map();
  for (const attr of html.matchAll(/\son[a-z]+\s*=\s*"([^"]*)"/gi)) {
    /* (^|[^.\w$]) rejects `foo.bar(` and `a.foo(` — only an unqualified
       identifier immediately followed by ( is a global call. */
    for (const call of attr[1].matchAll(/(?:^|[^.\w$])([A-Za-z_$][\w$]*)\s*\(/g)) {
      const name = call[1];
      if (HANDLER_KEYWORDS.has(name) || HANDLER_GLOBALS.has(name)) continue;
      if (defined.has(name)) continue;
      missing.set(name, (missing.get(name) ?? 0) + 1);
    }
  }
  return [...missing].map(([name, count]) => ({ name, count }));
}


/**
 * Inline event handler attributes, of any kind (#100).
 *
 * `undefinedInlineHandlers` above asks whether the function an inline handler
 * names actually exists. This asks whether the attribute should be there at
 * all, which is a different question with a different answer: all 46 handlers
 * this check was written for were live, working, and invisible to that one.
 *
 * The reason to care is the CSP. `script-src 'unsafe-inline'` is precisely
 * what permits an onclick attribute to run, so #100 cannot drop it while any
 * page still carries one. 35 of the 46 were a single pattern -- a card div with
 * onclick setting window.location.href -- which was also unreachable by
 * keyboard and unfollowable by a crawler, so they were owed anyway.
 *
 * script, style and comment bodies are stripped before scanning, and that is
 * not tidiness: the journal hub's pageCss is inlined into a style element and
 * its comment describes the handlers that were removed, so a scan of the raw
 * page would report the fix as the defect. This predicate hit exactly that on
 * its first run against real output.
 *
 * The value is not required to be quoted. Everything here quotes attributes,
 * but a check that only sees the tidy spelling is a check that can be walked
 * around without meaning to.
 *
 * Returns [{ name, count }] per attribute name; [] when the page is clean.
 */
export function inlineHandlers(html) {
  const markup = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  const found = new Map();
  for (const m of markup.matchAll(/\s(on[a-z]+)\s*=/gi)) {
    const name = m[1].toLowerCase();
    found.set(name, (found.get(name) ?? 0) + 1);
  }
  return [...found].map(([name, count]) => ({ name, count }));
}


/**
 * The hero stat rail, as rendered (#94).
 *
 * DestinationLayout drops any stat missing a label or a value, and the rail is
 * hidden below 900px, so a page that quietly loses a stat still looks fine in
 * review and still passes a build. That is exactly how this sat at 0% while
 * being a launch gate: 42 of 43 pages shipped one stat, the worksheet behind it
 * had 42 empty rows, and nothing anywhere went red.
 *
 * Reads the built HTML rather than the source, so it checks what a visitor
 * actually gets. Returns the labels found, in document order.
 */
export function heroStatLabels(html) {
  const open = /<div class="dest-hero__right"[^>]*>/i.exec(html);
  if (!open) return [];
  /* innerOf, not a non-greedy regex: each stat is its own <div> inside the
     rail, so the naive match stops at the first </div> and reports one stat on
     a page that has three. This predicate hit that exact bug before it was
     fixture-tested, which is the argument for the fixtures. */
  const rail = innerOf(html, open.index + open[0].length, "div");
  return [...rail.matchAll(/<span class="dest-hero__stat-label"[^>]*>([\s\S]*?)<\/span>/g)]
    .map((m) => textIn(m[1]));
}

/**
 * The counts written into `public/llms.txt` are hand-authored facts about the
 * shape of the site, and hand-authored facts rot on a schedule. The
 * SCHEMA-LIBRARY template this file was built from still claimed "42
 * destination guides" and "29 property assessments" when the site had 43 and
 * 32 — it was written once and never re-derived. #98 is the identical defect
 * one level up, in the runbook.
 *
 * So every number in llms.txt is stated in a fixed phrase that this predicate
 * re-derives from the built site on every build. Add a claim here and to
 * llms.txt together, or do not put the number in the file.
 *
 * `actual` is {destinations, experiences, journal}. Returns human-readable
 * mismatches; [] means every claim in the file is currently true.
 */
export const LLMS_CLAIMS = [
  ["destinations", /(\d+)\s+destination guides\b/],
  ["experiences", /(\d+)\s+trip types\b/],
  ["journal", /(\d+)\s+field reports and planning guides\b/],
];

export function llmsClaimMismatches(text, actual) {
  const out = [];
  for (const [key, re] of LLMS_CLAIMS) {
    const m = text.match(re);
    if (!m) {
      out.push(`${key}: llms.txt no longer states this count in the phrase the check reads`);
      continue;
    }
    const claimed = Number(m[1]);
    if (claimed !== actual[key]) {
      out.push(`${key}: llms.txt claims ${claimed}, the built site has ${actual[key]}`);
    }
  }
  return out;
}


/**
 * User-editable form fields with no length cap (#74).
 *
 * All three forms POST straight to Web3Forms from the client, so `maxlength`
 * is the only in-repo limit on what a submission can carry. Contact and Plan
 * Your Trip cap every field and mirror the cap in JS; the Newsletter shipped
 * with none, on 94 of 98 pages, and nothing anywhere could see it -- the
 * deployment guide said "all three forms carry length caps" for months.
 *
 * Returns each <input> or <textarea> a visitor can type into that has no
 * maxlength. Skips inputs whose type cannot carry free text, and anything
 * readonly or disabled -- Plan Your Trip's two stepper displays are
 * `<input readonly>` with no type at all, so a predicate keyed on `type=`
 * alone would either miss every <textarea> or fail on those two.
 */
const NON_TEXT_INPUT_TYPES = new Set([
  "hidden", "checkbox", "radio", "submit", "button", "reset", "file",
  "image", "range", "color",
]);

export function uncappedFields(html) {
  const out = [];
  for (const m of html.matchAll(/<(input|textarea)\b[^>]*>/gi)) {
    const tag = m[0];
    if (/\bmaxlength\s*=/i.test(tag)) continue;
    if (/\b(?:readonly|disabled)\b/i.test(tag)) continue;
    if (m[1].toLowerCase() === "input") {
      const type = /\btype\s*=\s*["']?([a-z-]+)/i.exec(tag)?.[1]?.toLowerCase() ?? "text";
      if (NON_TEXT_INPUT_TYPES.has(type)) continue;
    }
    out.push(tag);
  }
  return out;
}


/**
 * Intrinsic dimensions of a PNG or JPEG from its header bytes, or null.
 * The site references only these two formats; anything else returns null and
 * imgRatioMismatches skips it rather than guessing.
 */
export function imageDims(buf) {
  if (buf.length >= 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  }
  if (buf.length >= 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marker = buf[i + 1];
      if (marker === 0xff) { i++; continue; }
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; }
      /* SOF0-SOF15 carry the frame size; DHT (C4), JPG (C8) and DAC (CC)
         share the range and do not. */
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        /* JPEG stores height before width; returned as {w, h} like PNG. */
        return { w: buf.readUInt16BE(i + 7), h: buf.readUInt16BE(i + 5) };
      }
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  return null;
}

/**
 * <img> tags whose declared width/height do not match the file's shape.
 *
 * Every logo <img> declared 1254x1254 for a 256x256 file - a number true of
 * an earlier logo, copied forward into 10 source lines and 94 built tags.
 * It caused no CLS only because the ratio happened to still be 1:1 and CSS
 * sizes every one of them, which is exactly why nothing saw it: img-attrs
 * asks whether width and height are PRESENT, not whether they are true.
 *
 * The invariant that matters for layout is the ratio, so that is what is
 * checked: a declaration at the rendered size (the 52x52 nav logo for a
 * 256x256 file) is fine; a declaration whose ratio disagrees with the file's
 * by more than 1% reserves the wrong box and shifts the page when the image
 * lands. `dimsOf(src)` resolves a root-relative src to {w, h} or null; the
 * verifier reads dist/, the fixtures pass a table. Only local srcs with both
 * attributes are judged - missing attributes are img-attrs' job.
 */
export function imgRatioMismatches(html, dimsOf) {
  const out = [];
  for (const img of html.match(/<img\b[^>]*>/gi) ?? []) {
    const src = /\bsrc\s*=\s*"(\/[^"]+)"/i.exec(img)?.[1];
    const w = Number(/\bwidth\s*=\s*"(\d+)"/i.exec(img)?.[1]);
    const h = Number(/\bheight\s*=\s*"(\d+)"/i.exec(img)?.[1]);
    if (!src || src.startsWith("//") || !w || !h) continue;
    const real = dimsOf(src.split(/[?#]/)[0]);
    if (!real || !real.w || !real.h) continue;
    const drift = Math.abs(w / h - real.w / real.h) / (real.w / real.h);
    if (drift > 0.01) {
      out.push({ src, declared: `${w}×${h}`, real: `${real.w}×${real.h}` });
    }
  }
  return out;
}

/**
 * CSP script hashes (#100).
 *
 * The 425 inline <script> blocks across the site are 10 distinct bodies, so
 * script-src can name them by hash instead of carrying 'unsafe-inline'. Two
 * facts make that a build check rather than a list pasted into .htaccess:
 *
 *   1. A browser hashes the script text AFTER the HTML parser has normalised
 *      CRLF and lone CR to LF. Three of the ten bodies carry CR in dist/ -
 *      home, Contact and Plan Your Trip, i.e. the hero and both real forms -
 *      because their src/content-pages/*.html are CRLF files passed through
 *      verbatim. Hash the raw bytes and the browser demands a different
 *      value; the mistake is invisible from the source side because the
 *      Astro compiler normalises .astro-sourced blocks.
 *   2. Any hash in script-src makes a CSP2 browser IGNORE 'unsafe-inline'.
 *      Coverage is all-or-nothing, and an edit to any inline script changes
 *      its hash. Under report-only that is a console line nobody reads;
 *      under enforcing it is that script dead on every page carrying it.
 *      One such edit happened the same session this was written.
 *
 * cspScriptHash hashes one body the browser's way. inlineScriptHashes returns
 * the distinct hashes a page needs, skipping ld+json data blocks (script-src
 * does not apply to a non-executable type) and anything with a src=.
 * cspDirective pulls one directive's value out of an .htaccess Header line.
 * cspScriptSrcDrift diffs a script-src value against the hashes dist/ needs.
 */
export function cspScriptHash(body) {
  return "sha256-" + createHash("sha256").update(body.replace(/\r\n?/g, "\n"), "utf8").digest("base64");
}

export function inlineScriptHashes(html) {
  const out = new Set();
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\btype\s*=\s*["']?application\/ld\+json/i.test(m[1])) continue;
    if (/\bsrc\s*=/i.test(m[1])) continue;
    out.add(cspScriptHash(m[2]));
  }
  return [...out];
}

export function cspDirective(htaccess, header, directive) {
  const line = new RegExp(`^\\s*Header\\s+(?:always\\s+)?set\\s+${header}\\s+"([^"]*)"`, "mi").exec(htaccess);
  if (!line) return null;
  for (const part of line[1].split(";")) {
    const [name, ...rest] = part.trim().split(/\s+/);
    if (name === directive) return rest.join(" ");
  }
  return null;
}

export function cspScriptSrcDrift(scriptSrc, needed) {
  const tokens = (scriptSrc ?? "").split(/\s+/).filter(Boolean);
  const listed = new Set(tokens.filter((t) => /^'sha256-[A-Za-z0-9+/=]+'$/.test(t)).map((t) => t.slice(1, -1)));
  const want = new Set(needed);
  return {
    missing: [...want].filter((h) => !listed.has(h)),
    stale: [...listed].filter((h) => !want.has(h)),
    unsafeInline: tokens.includes("'unsafe-inline'"),
  };
}

/**
 * Analytics without the production-hostname gate.
 *
 * CLAUDE.md: never fire analytics on the staging host. Analytics.astro
 * enforces that with one line - `if (location.hostname !==
 * 'www.hymtravel.com') return;` - ahead of anything that touches gtag, and
 * that line is the only thing standing between the staging site and a GA4
 * property full of its own traffic. Nothing asserted it stayed.
 *
 * True when the page carries GA4 (a gtag.js URL, a gtag() call, or a G-
 * measurement ID) and does NOT carry that gate. The gate is matched
 * literally, allowing either quote style and any whitespace: hostname
 * compared with !== to www.hymtravel.com, then a return. A reformat passes;
 * a dropped, inverted or re-hosted gate does not.
 */
export function analyticsUngated(html) {
  const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]).join("\n");
  const hasAnalytics = /googletagmanager\.com\/gtag\/js|\bgtag\s*\(|["']G-[A-Z0-9]{6,}["']/.test(scripts);
  if (!hasAnalytics) return false;
  const gated = /location\.hostname\s*!==\s*["']www\.hymtravel\.com["']\s*\)\s*\{?\s*return\b/.test(scripts);
  return !gated;
}

/**
 * Accordion hide rules that have escaped their .js-accordion scope.
 *
 * P0-1, the plan's F1 "Critical": every FAQ answer on the site was
 * permanently invisible because `.pf-a` and `.faq-a` were display:none
 * unconditionally, revealed only by a click handler that never ran for a
 * crawler. The fix scopes the hide to `.js-accordion`, which
 * Accordion.astro sets on <html> only once its script has run, so with JS
 * off every answer renders open. CLAUDE.md: never move the hide rule
 * outside that scope. Nothing asserted it stayed inside.
 *
 * Takes CSS text - a built stylesheet or the body of an inline <style> -
 * and returns every selector that hides an answer without the scope. Rules
 * are split on `}` and selectors on `,`, which is enough for the minified
 * output Astro emits. A rule nested in an @media block arrives as
 * `@media(...){.pf-a{display:none`, so the LAST `{` is the rule's own and
 * the block's prefix rides along on the first selector, harmlessly. (The
 * first draft used the first `{`, which put the real selector into the
 * declarations and let an @media-wrapped hide through - the fixture caught
 * it.)
 */
export function unscopedAccordionHides(css) {
  const out = [];
  for (const rule of css.split("}")) {
    const brace = rule.lastIndexOf("{");
    if (brace === -1) continue;
    const decls = rule.slice(brace + 1);
    if (!/display\s*:\s*none\b/i.test(decls)) continue;
    for (const sel of rule.slice(0, brace).split(",")) {
      const s = sel.trim();
      if (/\.(?:pf-a|faq-a)\b/.test(s) && !/\.js-accordion\b/.test(s)) out.push(s);
    }
  }
  return out;
}

/**
 * Web3Forms access keys a page carries, and whether it carries the honeypot.
 *
 * The key is public by design and lives in three source files in two shapes:
 * a hidden <input name="access_key" value="..."> (Newsletter) and
 * formData.append('access_key', '...') (Contact, Plan Your Trip). CLAUDE.md:
 * never change it - the recipient problem (#74) is a dashboard setting, and
 * minting a fresh key against the right address is the tempting wrong fix.
 * A partial rotation is the other failure: two keys live at once, and the
 * form on the page with the old one fails silently.
 *
 * web3formsKeys returns the distinct key values on a page, from either
 * shape. hasHoneypot is the botcheck checkbox, which all three forms carry.
 */
export function web3formsKeys(html) {
  const out = new Set();
  const uuid = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
  for (const m of html.matchAll(new RegExp(`name=["']access_key["'][^>]*value=["'](${uuid})["']`, "gi"))) out.add(m[1]);
  for (const m of html.matchAll(new RegExp(`value=["'](${uuid})["'][^>]*name=["']access_key["']`, "gi"))) out.add(m[1]);
  for (const m of html.matchAll(new RegExp(`append\\(\\s*["']access_key["']\\s*,\\s*["'](${uuid})["']`, "gi"))) out.add(m[1]);
  return [...out];
}

export function hasHoneypot(html) {
  return /<input\b[^>]*\bname=["']botcheck["']/i.test(html);
}

/**
 * Gaps in the shipped .htaccess.
 *
 * Nothing asserted this file at all. Delete or rename public/.htaccess, or
 * edit its header block, and the build stays fully green while the site
 * ships with no CSP, no X-Content-Type-Options, no X-Frame-Options, no
 * Referrer-Policy, no Permissions-Policy, no staging noindex and no cache
 * rules. The one existing check that covers a leg of this, staging-noindex,
 * only runs under --remote against a deployed host - i.e. after the mistake
 * has shipped, never in a build.
 *
 * COMMENTS ARE STRIPPED FIRST, and that is not incidental: the word
 * `immutable` appears four times in this file today and every one is inside
 * a comment explaining why it was REMOVED (#107). A predicate over raw text
 * reports the fix as the defect - the identical trap `inline-handler` hit on
 * the journal hub's <style> comment.
 *
 * Directive-level only for the CSP: the sha256 list is csp-script-src's job,
 * so this asserts the shape (every directive present, and the two source
 * entries whose loss fails silently) and not the hashes.
 */
export const HTACCESS_SECURITY_HEADERS = [
  ["X-Content-Type-Options", "nosniff"],
  ["X-Frame-Options", "SAMEORIGIN"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
  ["Permissions-Policy", "geolocation=(), microphone=(), camera=()"],
];

/* Each entry: directive, and a source that must appear in it (or null for
   presence alone). The two non-null ones fail SILENTLY under an enforcing
   policy - connect-src kills all three forms' fetch, frame-src 'none' is
   what a CAPTCHA would have to replace rather than extend (#74/#100). */
export const CSP_DIRECTIVES = [
  ["default-src", "'self'"],
  ["script-src", "'self'"],
  ["style-src", "'self'"],
  ["img-src", "'self'"],
  ["font-src", "'self'"],
  ["connect-src", "https://api.web3forms.com"],
  ["form-action", "https://api.web3forms.com"],
  ["frame-ancestors", "'self'"],
  ["frame-src", "'none'"],
  ["base-uri", "'self'"],
  ["object-src", "'none'"],
];

export function htaccessGaps(text) {
  const live = text
    .split(/\r?\n/)
    .filter((l) => !/^\s*#/.test(l))
    .join("\n");
  const out = [];

  for (const [name, value] of HTACCESS_SECURITY_HEADERS) {
    const re = new RegExp(`^\\s*Header\\s+(?:always\\s+)?set\\s+${name}\\s+"([^"]*)"`, "mi");
    const m = re.exec(live);
    if (!m) out.push(`${name} header is missing`);
    else if (m[1] !== value) out.push(`${name} is "${m[1]}", expected "${value}"`);
  }

  /* The staging noindex is two lines that only work together. */
  const robots = /^\s*Header\s+always\s+set\s+X-Robots-Tag\s+"([^"]*)"\s+env=IS_STAGING/mi.exec(live);
  if (!robots) out.push("staging X-Robots-Tag header (env=IS_STAGING) is missing — the preview host would be indexable");
  else if (!/noindex/.test(robots[1])) out.push(`staging X-Robots-Tag is "${robots[1]}", which does not contain noindex`);
  if (!/^\s*SetEnvIf\s+Host\s+"[^"]*hostingersite[^"]*"\s+IS_STAGING=1/mi.test(live)) {
    out.push("SetEnvIf that arms IS_STAGING is missing — the X-Robots-Tag header is inert without it");
  }

  const csp = /^\s*Header\s+always\s+set\s+Content-Security-Policy(-Report-Only)?\s+"([^"]*)"/mi.exec(live);
  if (!csp) {
    out.push("no Content-Security-Policy header at all");
  } else {
    const policy = csp[2];
    for (const [directive, needle] of CSP_DIRECTIVES) {
      const d = new RegExp(`(?:^|;)\\s*${directive}\\s+([^;]*)`).exec(policy);
      if (!d) out.push(`CSP has no ${directive} directive`);
      else if (needle && !d[1].includes(needle)) out.push(`CSP ${directive} does not allow ${needle}`);
    }
  }

  const caches = [...live.matchAll(/^\s*Header\s+(?:always\s+)?set\s+Cache-Control\s+"([^"]*)"/gim)];
  if (!caches.length) out.push("no Cache-Control header — every asset would fall back to the host default");
  for (const c of caches) {
    if (/\bimmutable\b/.test(c[1])) {
      out.push(`Cache-Control "${c[1]}" contains immutable — #107: it promises a URL's bytes never change, which is false for the hand-named files under /assets/img/, and it served a year-old image from the CDN`);
    }
    if (!/\bno-transform\b/.test(c[1])) {
      out.push(`Cache-Control "${c[1]}" lacks no-transform (#95) — the CDN may recompress the asset`);
    }
  }
  return out;
}

/**
 * Cards that claim to be photographed but are not (#93).
 *
 * #93's central acceptance line - "no page carries the --photo modifier with
 * any card short of a real photograph" - was enforced by nothing. The
 * verifier had no concept of a grid modifier at all, so a half-converted
 * page built green and the defect was visible only in a browser.
 *
 * Two shapes, and the second is the one that made the original count hard:
 *   a. a grid on `places-grid--photo` / `exp-cards--photo` that still holds
 *      a `__ph` swatch or its `__overlay` sibling;
 *   b. a `__ph` carrying `style="background-image:..."` ANYWHERE. That is a
 *      photo smuggled in as a CSS background rather than an <img> - it has
 *      no alt, no width/height, and cannot lazy-load, so it breaks three
 *      CLAUDE.md image rules at once while looking correct. 19 cards were in
 *      that state when #93 was filed, which is why the true figure was 181
 *      and not 200.
 *
 * A grid WITHOUT the modifier may hold swatches: that is the honest
 * un-converted state, and 4 destination + 7 experience pages are in it.
 */
export function photoGridDefects(html) {
  const out = [];
  for (const m of html.matchAll(/class="([a-z-]*(?:places-grid|exp-cards)[a-z-]*(?:\s+[a-z-]+)*)"/gi)) {
    if (!/--photo\b/.test(m[1])) continue;
    /* Slice from this grid's opening tag to the next section boundary. */
    const rest = html.slice(m.index);
    const end = rest.slice(1).search(/<\/section>|class="[a-z-]*(?:places-grid|exp-cards)/i);
    const block = end === -1 ? rest : rest.slice(0, end + 1);
    const swatches = (block.match(/__ph\b/g) ?? []).length;
    const overlays = (block.match(/__overlay\b/g) ?? []).length;
    if (swatches) out.push(`a --photo grid still holds ${swatches} placeholder swatch${swatches === 1 ? "" : "es"}`);
    else if (overlays) out.push(`a --photo grid still holds ${overlays} swatch overlay${overlays === 1 ? "" : "s"}`);
  }
  const bgPhotos = (html.match(/__ph[^"]*"[^>]*style="[^"]*background-image/gi) ?? []).length;
  if (bgPhotos) {
    out.push(`${bgPhotos} placeholder${bgPhotos === 1 ? " carries" : "s carry"} a background-image — a photo as CSS has no alt, no intrinsic size and cannot lazy-load; use <img>`);
  }
  return out;
}

/**
 * A link nested inside a card's own link (#93).
 *
 * `.place-card` and `.exp-card` ARE anchors. HTML forbids an <a> inside an
 * <a>, and the parser does not merely tolerate it — the adoption agency
 * algorithm closes the outer anchor early and CLONES it, so one card becomes
 * several DOM nodes: a photograph with no body, a body with no photograph,
 * and a stray fragment.
 *
 * 28 of these shipped across 10 destination pages, every one an
 * authoritative-source link inside `.place-card__desc`. `/destinations/
 * argentina/` rendered **12** `.place-card` elements for its six cards, live,
 * on the swatch layout — and every check in this file stayed green, because
 * the SOURCE is well-formed. Only a real HTML parser sees it. That is the
 * whole reason this check reads the tag stream rather than trusting nesting.
 *
 * A swatch card hides the damage; `--photo` puts it in the middle of the
 * page. So this deliberately does NOT require the `--photo` modifier — the
 * defect is equally real on the pages still waiting to be converted.
 */
export function nestedCardAnchors(html) {
  const out = [];
  const OPEN = /<a\b[^>]*class="[^"]*\b(place-card|exp-card)\b[^"]*"[^>]*>/gi;
  for (const m of html.matchAll(OPEN)) {
    const rest = html.slice(m.index + m[0].length);
    /* The card should end at its own </a>. A nested <a> steals that closer,
       so scan to whichever tag comes first: an opener means a nested link. */
    const next = rest.search(/<a\b|<\/a>/i);
    if (next === -1 || !/^<a\b/i.test(rest.slice(next))) continue;
    const name = (rest.slice(0, next).match(/-card__name">([^<]*)/) ?? [])[1];
    out.push(
      `a .${m[1]} is itself an <a> and contains another <a>${name ? ` (${name.trim()})` : ""}` +
      " — the HTML parser splits it into separate cards, so the photograph and the copy land on different tiles",
    );
  }
  return out;
}

/**
 * ItemList defects in a page's JSON-LD.
 *
 * The journal hub's ItemList is parsed out of the hub HTML, and the featured
 * post is also a card in the grid, so it parsed out twice: numberOfItems was
 * 33 for 32 posts and one URL sat at two positions. schema-valid only asks
 * whether the block parses, so that shipped.
 *
 * Walks every ld+json block, finds every ItemList (top level, in mainEntity,
 * or in an @graph), and returns one string per defect: a URL that appears
 * more than once, or a numberOfItems that disagrees with the element count.
 * A block that does not parse is schema-valid's problem, not this one's, so
 * it is skipped here rather than reported twice.
 */
export function itemListDefects(html) {
  const out = [];
  const lists = [];
  const collect = (node) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) { node.forEach(collect); return; }
    if (node["@type"] === "ItemList" && Array.isArray(node.itemListElement)) lists.push(node);
    for (const k of ["mainEntity", "@graph"]) if (node[k]) collect(node[k]);
  };
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try { collect(JSON.parse(m[1])); } catch { /* schema-valid reports it */ }
  }
  for (const list of lists) {
    const label = list.name ? `ItemList "${list.name}"` : "ItemList";
    const positions = new Map();
    list.itemListElement.forEach((it, i) => {
      const u = it.url ?? it.item?.["@id"] ?? it.item;
      if (typeof u !== "string") return;
      positions.set(u, (positions.get(u) ?? []).concat(it.position ?? i + 1));
    });
    for (const [u, pos] of positions) {
      if (pos.length > 1) out.push(`${label} lists ${u} ${pos.length}×, at positions ${pos.join(", ")}`);
    }
    if (typeof list.numberOfItems === "number" && list.numberOfItems !== list.itemListElement.length) {
      out.push(`${label} claims numberOfItems ${list.numberOfItems} but carries ${list.itemListElement.length} elements`);
    }
  }
  return out;
}

/* remoteRoutes / remoteMisses (remote spot-check, § 5 of verify-deployment).
   Split out of the remote block so the route selection and the pass/fail
   decision can be fixture-tested without a network.

   The sample used to be three hardcoded routes. That is how the 25 M7
   destination pages reached the dev site without the remote leg fetching a
   single one of them: the check reported "ok" because it never looked at
   them. Deriving the list from what the build actually produced means a new
   page cannot ship outside the sample. */
export function remoteRoutes(urls) {
  return [...new Set(urls)]
    .filter((u) => !/(^|\/)404\.html$/.test(u))
    .sort();
}

/* results: [{ route, ok, status }] → the ones that did not answer.

   429 is deliberately NOT a miss. Sweeping 122 routes made www.hymtravel.com
   rate-limit every one of them, and the first version of this reported "122 of
   122 built pages do not answer" — which would have read as a catastrophic
   deploy failure when the pages were fine and the host was just throttling.
   A check that cries wolf gets ignored, so throttling is reported as its own
   inconclusive state rather than as absence. */
export const isThrottled = (status) => status === 429 || status === 503;

export function remoteMisses(results) {
  return results
    .filter((r) => !r.ok && !isThrottled(r.status))
    .map((r) => `${r.route} -> ${r.status}`);
}

/* The routes we could not get an answer for either way. Not a pass. */
export function remoteThrottled(results) {
  return results.filter((r) => !r.ok && isThrottled(r.status)).map((r) => r.route);
}

/**
 * Whether every `.cost-range__figure` on the page says the kind of thing its
 * class claims it does.
 *
 * Two shapes ship after DECISIONS.md D8. A banded row renders a currency
 * range. A no-band row renders a short unit phrase instead — "Priced per
 * voyage, not per night" — and carries the `--unit` modifier. Each must be
 * what it says it is:
 *
 *   priced-unit    a `--unit` figure showing a price. That is a band that
 *                  escaped the decision to withhold one, and it is the exact
 *                  outcome #108 exists to prevent: a number that is precise
 *                  and false.
 *   unpriced-band  a plain figure with no price in it. That is a band that
 *                  lost its number somewhere between the data file and the
 *                  page, rendering a cost section that costs nothing.
 *
 * Neither shape trips any existing check. `placeholder-copy` only matches the
 * literal "NEEDS FIGURE", so a figure that silently went blank, or a no-band
 * row that gained a range from a mis-keyed edit, both ship green without this.
 *
 * Returns [kind, text] pairs.
 */
export function costFigureShape(html) {
  const out = [];
  /* Comments first. A held page ships its whole cost section commented out,
     placeholders and all, and that scaffold contains a literal
     `<div class="cost-range__figure">NEEDS FIGURE: …</div>`. Scanning raw HTML
     reported all 28 of them on the first real run — the check's own first
     finding was against itself. Sanctioned inside a comment, failed outside
     one, exactly as `visibleText` treats NEEDS FIGURE. */
  const live = html.replace(/<!--[\s\S]*?-->/g, " ");
  const re = /<div\b[^>]*\bclass="([^"]*\bcost-range__figure\b[^"]*)"[^>]*>([\s\S]*?)<\/div>/gi;
  for (const m of live.matchAll(re)) {
    const isUnit = /\bcost-range__figure--unit\b/.test(m[1]);
    const text = textIn(m[2]);
    /* A currency amount, not merely a digit: "Priced per voyage over 18 days"
       is a legitimate unit phrase and must not read as a price. */
    const priced = /[$€£]\s?\d/.test(text);
    if (isUnit && priced) out.push(["priced-unit", text]);
    if (!isUnit && !priced) out.push(["unpriced-band", text]);
  }
  return out;
}

/**
 * Every [loc, date] pair a sitemap declares, in document order.
 *
 * A lastmod in the future is never valid — it claims a page changed on a day
 * that has not happened. Google's guidance is to stop trusting a sitemap's
 * dates once they stop being accurate, so one bad entry devalues the signal
 * for every URL in the file, and it does so silently.
 *
 * This shipped: `/` and `/about/` carried 2026-08-25 in committed dist. See
 * the sitemap-future-lastmod block in verify-deployment.mjs for the cause.
 *
 * Compares the captured YYYY-MM-DD *string* against `today`, which is
 * lexicographic and therefore chronological. Deliberately not a Date compare
 * against `Date.now()`: astro emits these as midnight UTC, so the offending
 * `2026-08-25T00:00:00.000Z` was already in the past as an instant at the
 * moment the 17:47 Pacific build wrote it. An instant compare passes on the
 * exact dist this exists to catch; a local-day compare fails it.
 *
 * `today` is injected rather than read from the clock, so the fixtures are
 * not themselves time-dependent.
 *
 * The `<lastmod>` must follow its `</loc>` with only whitespace between, so a
 * URL that carries no lastmod cannot be paired with the next entry's date.
 * Matches both the `<url>` shape in sitemap-0.xml and the `<sitemap>` shape in
 * sitemap-index.xml.
 */
export function lastmodPairs(xml) {
  const out = [];
  const re = /<loc>([^<]*)<\/loc>\s*<lastmod>(\d{4}-\d{2}-\d{2})/g;
  for (const m of xml.matchAll(re)) out.push([m[1], m[2]]);
  return out;
}

/**
 * Sitemap `lastmod` values dated after the build day, as [loc, date] pairs.
 *
 * Split from {@link lastmodPairs} so the caller can also ask how many dates the
 * regex actually saw. "No future dates" and "parsed nothing at all" are the
 * same empty array, and the second is a check that has stopped working — the
 * verifier compares the pair count against the raw `<lastmod>` count for
 * exactly that reason.
 */
export function futureLastmods(xml, today) {
  return lastmodPairs(xml).filter(([, when]) => when > today);
}
