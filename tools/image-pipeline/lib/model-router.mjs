/**
 * Pick the Higgsfield model for a prompt (brief, step 2).
 *
 * Pure — no I/O, no browser, no config file reads beyond what is passed in — so
 * every routing rule is fixture-testable. That matters more here than anywhere
 * else in the pipeline: a routing mistake is invisible until 66 images have
 * been generated in the wrong model's house style.
 *
 * The rules, in the brief's own terms:
 *
 *   Seedream 5.0 Lite   default for standard landscape/travel photography
 *   Seedream 5.0 Pro    hero tiles: first tile of a destination, or a signature landmark
 *   Soul 2.0            fashion-aware, editorial, human-centric or stylised content
 *   Nano Banana Pro     fallback when Seedream ignores a "no X, no Y" exclusion list
 *
 * Two decisions worth stating, because both depart from a literal reading:
 *
 * NEGATION-AWARE MATCHING. These prompts end in long exclusion lists — "no
 * people, no vehicles, no text" is on most of them. Scanning raw prompt text
 * for human-centric words would route essentially every landscape in the sheet
 * to Soul 2.0, on the strength of the word that says people must NOT appear.
 * So the prompt is split into positive and negative halves first, and only the
 * positive half is ever scanned for content signals. This is the single most
 * important thing in the file.
 *
 * NANO BANANA PRO IS NEVER AUTO-SELECTED. Deciding that an image ignored its
 * exclusion list means looking at the image. Nothing here can do that, and a
 * heuristic pretending to would be a fabricated judgement. It is reachable two
 * honest ways instead: an explicit --model, or --retry-with-nano on a re-run of
 * rows you have looked at. Rows carrying a heavy exclusion list are flagged in
 * the summary so you know which images are worth checking.
 *
 * RESOLUTION. The brief mentions 4K for heroes but also states that 2K is the
 * ceiling under the current Unlimited tier. Unlimited is the binding constraint
 * — spending credits is the one thing this pipeline must never do — so the cap
 * comes from config.unlimitedResolutionByModel and defaults to 2K throughout.
 * If 4K becomes Unlimited-eligible, that is a one-line config change.
 */

export const MODELS = {
  SEEDREAM_LITE: "Seedream 5.0 Lite",
  SEEDREAM_PRO: "Seedream 5.0 Pro",
  SOUL: "Soul 2.0",
  NANO: "Nano Banana Pro",
};

export const DEFAULT_RESOLUTION_BY_MODEL = {
  [MODELS.SEEDREAM_LITE]: "2K",
  [MODELS.SEEDREAM_PRO]: "2K",
  [MODELS.SOUL]: "2K",
  [MODELS.NANO]: "2K",
};

/* Globally signature landmarks — the sort of subject that makes a tile the face
   of its destination page regardless of where it sits in sheet order. Matched
   against the positive half of the prompt and against the tile name. Extend
   freely; a miss costs a hero its Pro tier, not a broken run. */
const SIGNATURE_LANDMARKS = [
  "eiffel tower", "colosseum", "machu picchu", "taj mahal", "great wall",
  "pyramids of giza", "great pyramid", "petra", "angkor wat", "acropolis",
  "parthenon", "sagrada familia", "santorini", "matterhorn", "mount fuji",
  "grand canyon", "niagara falls", "victoria falls", "iguazu", "uluru",
  "ayers rock", "table mountain", "ngorongoro", "serengeti", "okavango",
  "kilimanjaro", "amalfi coast", "cinque terre", "positano", "bora bora",
  "mont saint-michel", "neuschwanstein", "stonehenge", "christ the redeemer",
  "sydney opera house", "golden gate", "times square", "burj khalifa",
  "petronas", "halong bay", "bagan", "torres del paine", "perito moreno",
  "banff", "moraine lake", "lake louise", "northern lights", "aurora borealis",
  "blue lagoon", "cappadocia", "hagia sophia", "blue mosque", "alhambra",
  "duomo", "st mark's square", "st peter's basilica", "trevi fountain",
  "hallstatt", "plitvice", "meteora", "mykonos", "dubrovnik", "milford sound",
  "queenstown", "antelope canyon", "monument valley", "yosemite", "yellowstone",
];

/* Signals that a prompt wants people, styling or an illustrative treatment
   rather than a photograph of a place. Only ever matched against positive text. */
const SOUL_SIGNALS = [
  "fashion", "editorial fashion", "model wearing", "fashion model",
  "portrait", "portraiture", "headshot", "close-up of a woman",
  "close-up of a man", "couple", "honeymooners", "newlyweds", "bride",
  "groom", "wedding", "family", "traveller in frame", "traveler in frame",
  "person in frame", "figure in the foreground", "lifestyle",
  "stylised", "stylized", "illustration", "illustrated", "painterly",
  "watercolour", "watercolor", "art deco poster", "vintage travel poster",
  "graphic poster", "anime", "surreal", "conceptual",
];

/* Words that only count as human-centric when the prompt is actually about
   them. Kept apart from SOUL_SIGNALS because they appear constantly in
   exclusion lists, and a stray positive mention ("a fisherman's boat") should
   not outweigh a landscape brief. Require two or more to agree. */
const WEAK_HUMAN_SIGNALS = [
  "woman", "man", "people", "person", "child", "children", "crowd",
  "dancer", "musician", "chef", "artisan", "vendor", "guide", "local",
];

const lower = (s) => String(s ?? "").toLowerCase();

/**
 * Split a prompt into what it asks FOR and what it asks AGAINST.
 *
 * Handles the two shapes these prompts actually use:
 *   "..., no giraffe, no people, no text."        -> whole clause is negative
 *   "a collapsed caldera not a volcanic cone"     -> text after "not" is negative
 *   "without a single boat"                       -> text after "without"
 */
export function splitPromptPolarity(prompt) {
  const positive = [];
  const negative = [];

  for (const rawClause of String(prompt ?? "").split(/[,;]/)) {
    const clause = rawClause.trim();
    if (!clause) continue;

    if (/^no\s+/i.test(clause) || /^without\s+/i.test(clause)) {
      negative.push(clause.replace(/^(no|without)\s+/i, "").trim());
      continue;
    }

    /* "X not Y" and "X without Y": the head is wanted, the tail is not. Guard
       against "not" inside a word ("nothing", "notable") with word boundaries. */
    const split = clause.split(/\b(?:not|without)\b/i);
    if (split.length > 1) {
      if (split[0].trim()) positive.push(split[0].trim());
      for (const tail of split.slice(1)) if (tail.trim()) negative.push(tail.trim());
      continue;
    }

    positive.push(clause);
  }

  return {
    positiveText: positive.join(", ").toLowerCase(),
    negativeText: negative.join(", ").toLowerCase(),
    negatives: negative,
    negativeCount: negative.length,
  };
}

/** True when the prompt's positive half is about people, styling or illustration. */
export function looksHumanOrEditorial(positiveText) {
  if (SOUL_SIGNALS.some((sig) => positiveText.includes(sig))) return true;
  const weak = WEAK_HUMAN_SIGNALS.filter((sig) =>
    new RegExp(`\\b${sig}\\b`).test(positiveText)
  );
  return weak.length >= 2;
}

/** True when the prompt's positive half names a globally signature landmark. */
export function namesSignatureLandmark(positiveText, tileName = "") {
  const haystack = `${positiveText} ${lower(tileName)}`;
  return SIGNATURE_LANDMARKS.some((landmark) => haystack.includes(landmark));
}

/**
 * Mark the first qualifying row of each destination. Expects the queue in sheet
 * order, which readTracker() preserves — that ordering is what makes "first
 * tile in a region" a meaningful notion at all.
 */
export function annotateQueue(queue) {
  const seen = new Set();
  return queue.map((row) => {
    const key = lower(row.destination);
    const isFirstOfDestination = key !== "" && !seen.has(key);
    if (key) seen.add(key);
    return { ...row, isFirstOfDestination };
  });
}

/**
 * Choose model, resolution and aspect ratio for one row.
 *
 * @param row      annotated queue row (needs prompt, tileName, isFirstOfDestination)
 * @param context  { override, retryWithNano, config }
 * @returns { model, resolution, aspectRatio, reason, flags }
 */
export function chooseModel(row, context = {}) {
  const { override, retryWithNano, config = {} } = context;
  const resolutionByModel = {
    ...DEFAULT_RESOLUTION_BY_MODEL,
    ...(config.unlimitedResolutionByModel ?? {}),
  };
  const aspectRatio = config.aspectRatio ?? "16:9";
  const heavyExclusionThreshold = config.heavyExclusionThreshold ?? 4;

  const polarity = splitPromptPolarity(row.prompt);
  const flags = [];
  if (polarity.negativeCount >= heavyExclusionThreshold) {
    flags.push(
      `${polarity.negativeCount} exclusions in the prompt — worth checking the ` +
        `result honours them; re-run this row with --retry-with-nano if not`
    );
  }

  const decide = (model, reason) => ({
    model,
    resolution: resolutionByModel[model] ?? "2K",
    aspectRatio,
    reason,
    flags,
  });

  /* Explicit instruction beats every heuristic. */
  if (override) return decide(override, "explicitly requested with --model");
  if (retryWithNano) {
    return decide(
      MODELS.NANO,
      "--retry-with-nano: Nano Banana Pro follows exclusion lists more literally"
    );
  }

  /* Content type is decided before tier. A human-centric or stylised prompt
     needs the model tuned for it; whether the tile is also a hero only governs
     resolution, and under Unlimited that is 2K for Soul 2.0 anyway. */
  if (looksHumanOrEditorial(polarity.positiveText)) {
    return decide(MODELS.SOUL, "prompt is human-centric, editorial or stylised");
  }

  if (row.isFirstOfDestination) {
    return decide(
      MODELS.SEEDREAM_PRO,
      `hero tile — first queued tile for ${row.destination || "this destination"}`
    );
  }
  if (namesSignatureLandmark(polarity.positiveText, row.tileName)) {
    return decide(MODELS.SEEDREAM_PRO, "prompt describes a signature landmark");
  }

  return decide(MODELS.SEEDREAM_LITE, "standard landscape/travel photography");
}

/** Convenience: annotate then route a whole queue in one pass. */
export function planQueue(queue, context = {}) {
  return annotateQueue(queue).map((row) => ({ ...row, plan: chooseModel(row, context) }));
}
