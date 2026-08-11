/**
 * Fixture tests for model routing.
 *
 *   node test/model-router.test.mjs
 *
 * Why this file exists: a routing mistake produces a perfectly good image in
 * the wrong model's house style. Nothing errors, nothing retries, and you find
 * out when 66 tiles are sitting in Drive looking subtly inconsistent. The only
 * place that can be caught is here.
 *
 * The check that earns this file on its own is the negation trap. Nearly every
 * prompt in the tracker ends "..., no people, no vehicles, no text" — a plain
 * keyword scan for human-centric words matches the word "people" in the clause
 * that says people must NOT appear, and routes the entire sheet to Soul 2.0.
 * That bug would look like a working pipeline. So the fixture includes a
 * landscape carrying three separate human words, all of them negated, and it
 * must come out Seedream.
 *
 * Both directions throughout: each rule is asserted to fire when it should AND
 * to stay quiet when it should not.
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { parseRows, selectRows } from "../lib/tracker.mjs";
import {
  MODELS, splitPromptPolarity, looksHumanOrEditorial, namesSignatureLandmark,
  annotateQueue, chooseModel, planQueue,
} from "../lib/model-router.mjs";

let pass = 0;
const failures = [];
const t = (name, actual, expected) => {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) { pass++; return; }
  failures.push(`${name}\n      expected ${e}, got ${a}`);
};

const FIXTURE = JSON.parse(
  await readFile(fileURLToPath(new URL("./fixture-tracker.json", import.meta.url)), "utf8")
);
const queue = selectRows(parseRows(FIXTURE.values), {
  qualifyingStatus: "prompt written",
  protectedStatuses: ["complete", "image approved"],
}).queue;

const planned = planQueue(queue, { config: { aspectRatio: "16:9" } });
const forTile = (name) => planned.find((r) => r.tileName === name);
const modelFor = (name) => forTile(name).plan.model;

/* ── polarity: the foundation everything else stands on ── */

const polarity = splitPromptPolarity(
  "A calm lagoon at dawn, warm light, no people, no boats, no text."
);
t("polarity: wanted subjects land in the positive half",
  polarity.positiveText.includes("calm lagoon at dawn"), true);
t("polarity: an excluded subject is kept out of the positive half",
  polarity.positiveText.includes("people"), false);
t("polarity: excluded subjects are collected", polarity.negatives, ["people", "boats", "text."]);
t("polarity: exclusions are counted", polarity.negativeCount, 3);

const contrast = splitPromptPolarity("a collapsed caldera not a volcanic cone");
t("polarity: 'X not Y' keeps X positive", contrast.positiveText.includes("collapsed caldera"), true);
t("polarity: 'X not Y' pushes Y negative", contrast.negativeText.includes("volcanic cone"), true);

const without = splitPromptPolarity("an empty beach without a single sunbather");
t("polarity: 'without Y' pushes Y negative", without.negativeText.includes("single sunbather"), true);
t("polarity: 'without Y' keeps the head positive", without.positiveText.includes("empty beach"), true);

t("polarity: 'not' inside a longer word is not a negation",
  splitPromptPolarity("a notable rock formation").negativeCount, 0);
t("polarity: a prompt with no exclusions has none", splitPromptPolarity("a quiet harbour").negativeCount, 0);

/* ── human / editorial detection ── */

t("soul: an explicit fashion brief is human-centric",
  looksHumanOrEditorial("editorial fashion photograph, a model wearing flowing linen"), true);
t("soul: a portrait brief is human-centric", looksHumanOrEditorial("close-up portrait, warm rim light"), true);
t("soul: an illustrated treatment counts", looksHumanOrEditorial("stylised vintage travel poster"), true);
t("soul: two people-words agreeing counts",
  looksHumanOrEditorial("a woman and a child on the harbour wall"), true);

t("soul: a plain landscape is not human-centric",
  looksHumanOrEditorial("wide cinematic photograph of a dune field at sunrise"), false);
t("soul: one incidental people-word is not enough",
  looksHumanOrEditorial("a fisherman's boat drawn up on the shingle"), false);

/* THE NEGATION TRAP. Three human words, every one of them excluded. */
const trap = splitPromptPolarity(forTile("Namibia").prompt);
t("trap: the fixture prompt really does carry human words",
  /people|crowd|vendor/.test(forTile("Namibia").prompt), true);
t("trap: they are all in the exclusion list, not the subject",
  /people|crowd|vendor/.test(trap.positiveText), false);
t("trap: so the prompt is NOT read as human-centric",
  looksHumanOrEditorial(trap.positiveText), false);
t("trap: and the row does NOT route to Soul 2.0", modelFor("Namibia") === MODELS.SOUL, false);
t("trap: it routes to Seedream Lite", modelFor("Namibia"), MODELS.SEEDREAM_LITE);

/* ── landmarks ── */

t("landmark: a signature landmark in the prompt is found",
  namesSignatureLandmark("mount fuji seen across lake kawaguchi", ""), true);
t("landmark: it is found in the tile name too", namesSignatureLandmark("", "Table Mountain"), true);
t("landmark: an ordinary subject is not a landmark",
  namesSignatureLandmark("a cedar-lined stone stairway under low cloud", "Hakone"), false);

/* ── hero: first queued tile of each destination ── */

const flags = annotateQueue(queue).map((r) => [r.tileName, r.isFirstOfDestination]);
t("hero: the first queued tile of a destination is a hero",
  flags.filter(([, first]) => first).map(([name]) => name),
  ["South Africa", "Santorini", "Tuscany", "Kyoto"]);
t("hero: later tiles of the same destination are not heroes",
  flags.find(([n]) => n === "Botswana")[1], false);

/* Italy's genuinely-first row (Amalfi Coast) has no filename, so it never
   reaches the queue. Tuscany must inherit the hero slot — proof that "first" is
   computed over what will actually be generated, not over the raw sheet. */
t("hero: a hero slot passes to the next row when the first is unusable",
  modelFor("Tuscany"), MODELS.SEEDREAM_PRO);
t("hero: the unusable row is not in the plan at all",
  planned.some((r) => r.tileName === "Amalfi Coast"), false);

/* ── the routing table as a whole ── */

t("route: hero tile -> Seedream Pro", modelFor("South Africa"), MODELS.SEEDREAM_PRO);
t("route: signature landmark, not first -> Seedream Pro", modelFor("Mount Fuji"), MODELS.SEEDREAM_PRO);
t("route: Okavango is treated as a landmark", modelFor("Botswana"), MODELS.SEEDREAM_PRO);
t("route: fashion/editorial -> Soul 2.0", modelFor("Mykonos"), MODELS.SOUL);
t("route: ordinary landscape -> Seedream Lite", modelFor("Hakone"), MODELS.SEEDREAM_LITE);
t("route: content type beats hero tier — Mykonos is editorial, not a hero shot",
  modelFor("Mykonos") === MODELS.SEEDREAM_PRO, false);

/* ── Nano Banana Pro is never chosen on a guess ── */

t("nano: nothing in the fixture auto-selects Nano Banana Pro",
  planned.some((r) => r.plan.model === MODELS.NANO), false);
t("nano: --retry-with-nano selects it",
  chooseModel(forTile("Namibia"), { retryWithNano: true }).model, MODELS.NANO);
t("nano: and says why",
  chooseModel(forTile("Namibia"), { retryWithNano: true }).reason.includes("exclusion lists"), true);

/* ── overrides ── */

t("override: --model wins over every heuristic",
  chooseModel(forTile("Mykonos"), { override: MODELS.SEEDREAM_LITE }).model, MODELS.SEEDREAM_LITE);
t("override: it wins over the hero rule too",
  chooseModel(forTile("South Africa"), { override: MODELS.SOUL }).model, MODELS.SOUL);

/* ── output shape: Unlimited caps resolution, aspect is always 16:9 ── */

t("output: every row is 16:9", [...new Set(planned.map((r) => r.plan.aspectRatio))], ["16:9"]);
t("output: every row is 2K — the Unlimited ceiling",
  [...new Set(planned.map((r) => r.plan.resolution))], ["2K"]);
t("output: a config raising the ceiling is honoured",
  chooseModel(forTile("South Africa"), {
    config: { unlimitedResolutionByModel: { [MODELS.SEEDREAM_PRO]: "4K" } },
  }).resolution, "4K");
t("output: every row carries a stated reason",
  planned.every((r) => typeof r.plan.reason === "string" && r.plan.reason.length > 0), true);

/* ── exclusion-heavy prompts get flagged for a human look ── */

t("flags: a prompt with six exclusions is flagged",
  forTile("Namibia").plan.flags.length, 1);
t("flags: the flag says how many exclusions there were",
  forTile("Namibia").plan.flags[0].includes("6 exclusions"), true);
t("flags: a prompt with none is not flagged", forTile("Hakone").plan.flags, []);

/* ── report ── */

if (failures.length) {
  process.stderr.write(`\nmodel-router: ${pass} passed, ${failures.length} FAILED\n\n`);
  for (const f of failures) process.stderr.write(`  ✗ ${f}\n\n`);
  process.exit(1);
}
process.stdout.write(`model-router: ${pass} checks passed\n`);
