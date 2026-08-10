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

/** Visible text of an HTML fragment, tags and &nbsp; removed. */
export const textIn = (s) =>
  s.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

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
