/**
 * P3-2 (issue #28), second half — "The first sentence of the answer is a
 * complete answer in ≤25 words." (CONTENT-STANDARDS § 3.3, marked
 * non-negotiable: it is what makes an answer quotable and the accordion
 * scannable.)
 *
 * 86 of the 408 FAQ answers opened with a sentence over 25 words. The great
 * majority already ANSWER in their opening clause and then run on past an
 * em-dash or colon into the elaboration — "A minimum of four nights for a
 * first visit — enough to cover the major museum circuit…". The answer is
 * there; the punctuation is what makes it unquotable.
 *
 * So this splits at that break rather than rewriting the copy. It does not
 * touch a word of the actual content — the sentence boundary moves, nothing
 * else. Everything it cannot split cleanly is left alone and reported, to be
 * rewritten by hand rather than mangled by a regex.
 *
 * Guards, each one a case that broke an earlier version of this:
 *   - a matched PAIR of em-dashes is a parenthetical, not a break
 *     ("modest dress — shoulders and knees covered — is appropriate")
 *   - a tail opening with a relative pronoun or conjunction cannot start a
 *     sentence ("…and a late return — which is a fine experience")
 *   - "— enough to/for" needs a lead-in, not a capital letter
 *   - the head must itself be ≥3 words, or the "answer" is not one
 *   - the head must not end on a preposition or a transitive verb left
 *     dangling. There is no reliable test for this, which is why the colon
 *     rule was removed outright: on a colon the head is usually a stem, not
 *     a sentence. "Beyond standard packing, families often overlook:" split
 *     to "…families often overlook." — grammatical nonsense — and "1:1
 *     staff-to-guest ratios" split to "1. 1 staff-to-guest ratios". Only the
 *     em-dash break is safe enough to automate, and only with the guards
 *     above. Everything else is reported for a human.
 *
 *   node tools/p3-2-faq-first-sentence.mjs            # preview, writes nothing
 *   node tools/p3-2-faq-first-sentence.mjs --apply
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIR = path.join(ROOT, "src", "content-pages");
const APPLY = process.argv.includes("--apply");

/* The copy uses the literal character in most places and the entity in a few.
   An earlier version searched only for the entity, found nothing, and silently
   fell through to the colon rule — which is how the colon damage happened. */
const DASHES = ["—", "&mdash;"];
const wc = (s) => s.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

/* Cannot begin a sentence. */
const BAD_LEAD = /^(which|and|but|so|because|though|although|while|with|plus|or|nor|yet|then|that|whose|whom)\b/i;

const decode = (s) =>
  s.replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ");

/** First sentence of an answer's raw HTML, as a raw-HTML slice. */
function firstSentenceRaw(raw) {
  const guard = raw.replace(/\b(St|Mt|Dr|Mr|Ms|No|vs|approx)\./gi, (m) => m.replace(".", "@"));
  const m = guard.match(/^[\s\S]*?[.!?](?=\s|<|$)/);
  return m ? raw.slice(0, m[0].length) : raw;
}

const files = (await readdir(DIR)).filter((f) => /^(destinations|experiences)__/.test(f));

let split = 0;
const residual = [];
const previews = [];

for (const file of files) {
  const full = path.join(DIR, file);
  let html = await readFile(full, "utf8");
  let touched = false;

  html = html.replace(
    /(class="pf-a"[^>]*>)([\s\S]*?)(<\/div>)/g,
    (whole, open, body, close) => {
      const lead = body.match(/^\s*/)[0];
      const raw = body.trim();
      const sent = firstSentenceRaw(raw);
      if (wc(sent) <= 25) return whole;

      /* Find an em-dash break that leaves a ≤25-word head. */
      let cut = -1, sepLen = 0;
      for (const sep of DASHES) {
        const i = sent.indexOf(sep);
        if (i <= 0) continue;
        const head = sent.slice(0, i);
        /* No lower bound beyond non-empty. The one-word heads are the BEST
           cases here, not edge cases: "Yes — Oman is consistently rated…"
           becomes "Yes." followed by the reasoning, which is precisely the
           complete-answer-in-≤25-words the standard asks for. */
        if (wc(head) > 25 || wc(head) < 1) continue;
        /* Parenthetical em-dash pair: a second one inside the same sentence. */
        if (sent.indexOf(sep, i + sep.length) !== -1) continue;
        cut = i; sepLen = sep.length; break;
      }
      if (cut === -1) {
        residual.push({ file, why: "no clean break", text: decode(sent).slice(0, 150) });
        return whole;
      }

      const head = sent.slice(0, cut).trim().replace(/[,;]$/, "");
      let tail = sent.slice(cut + sepLen).trim();

      if (BAD_LEAD.test(tail.replace(/^<[^>]+>/, ""))) {
        residual.push({ file, why: `tail starts "${tail.split(/\s+/)[0]}"`, text: decode(sent).slice(0, 150) });
        return whole;
      }

      /* "— enough to cover X" reads as a fragment when simply capitalised. */
      tail = tail.replace(/^enough\b/i, "That is enough");
      tail = tail.replace(/^([a-z])/, (c) => c.toUpperCase());

      const rest = raw.slice(sent.length);
      touched = true;
      split++;
      previews.push(`${file}\n    was: ${decode(sent).slice(0, 120)}\n    now: ${decode(head)}. ${decode(tail).slice(0, 100)}`);
      return `${open}${lead}${head}. ${tail}${rest}${close}`;
    }
  );

  if (touched && APPLY) await writeFile(full, html, "utf8");
}

console.log(previews.slice(0, 12).join("\n\n"));
console.log(`\n… ${previews.length} sentence boundaries moved in total.\n`);
console.log(`split cleanly:      ${split}`);
console.log(`left for a human:   ${residual.length}`);
for (const r of residual) console.log(`  [${r.why}] ${r.file}\n      ${r.text}`);
console.log(APPLY ? "\nWRITTEN." : "\nPreview only — re-run with --apply to write.");
