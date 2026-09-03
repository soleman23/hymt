/**
 * Issue #156 ("LiteSpeed rate-limits GPTBot by user-agent"), made repeatable.
 *
 *   node tools/check-ai-crawlers.mjs                  # burst every agent
 *   node tools/check-ai-crawlers.mjs --burst 20       # longer bursts
 *   node tools/check-ai-crawlers.mjs --only GPTBot    # one agent
 *   node tools/check-ai-crawlers.mjs --recover GPTBot # time the cooldown
 *   node tools/check-ai-crawlers.mjs --host https://... # somewhere else
 *
 * Deliberately NOT part of `npm run build`, for the same reason as
 * check-external-links.mjs: it asks a live host, and the answer depends on who
 * is asking and how recently. A build must be a pure function of the tree.
 *
 * ── WHY THIS EXISTS AT ALL, WHICH IS THE WHOLE POINT ──
 *
 * #156 was mis-measured twice, in opposite directions, and both times the
 * method was what failed rather than the reasoning on top of it.
 *
 * First it was recorded as a flat block on two user agents. Then a re-test
 * "confirmed" GPTBot was still blocked by running the same single request three
 * times and reporting the agreement between the runs as evidence. Those three
 * runs were not three trials. They were one observation of a token bucket that
 * the first request had already drained, and repeating the probe is precisely
 * what kept it drained — so checking more carefully made the wrong answer look
 * sturdier. The opposite error is just as easy: one request against a rested
 * bucket returns 200, and reads as "fixed".
 *
 * So a single status code is not a measurement here, and this tool will not
 * report one. It sends a burst and prints the whole sequence. Two rules follow,
 * and both are enforced below rather than left to the reader:
 *
 *   1. If a burst's FIRST request is already 429, the bucket was drained before
 *      the run started. That is not a result. It prints as NO RESULT and
 *      classifies as "drained" — never as "throttled", because the run has
 *      measured nothing except its own history.
 *   2. Agents can share one counter. Measured 2026-09-03: the invented strings
 *      `xGPTBot/1.0` and `foo GPTBot/1.0 bar` were 429 on their first ever
 *      request, while `GPTBot/9.9` and `GPTBotx/1.0` passed. The origin matches
 *      the case-insensitive substring `gptbot/1` and counts everything matching
 *      it together. So bursting one agent can poison the next agent's reading,
 *      and the run order is part of the result. Controls bracket the run.
 *
 * ── WHY IT SHELLS OUT TO CURL ──
 *
 * Same reason check-external-links.mjs does for its serial pass: what is being
 * measured is how an origin treats a request, and Node's fetch (undici) brings
 * its own TLS fingerprint and header set to that question. Every measurement in
 * #156 was taken with curl. Changing the client would make new numbers
 * incomparable with the ones in the issue for no gain.
 *
 * The pure parts — classifying a sequence, deriving the budget — are exported
 * and driven red on fixtures in tools/verify-checks.test.mjs. A tool that is
 * only ever run by hand cannot notice its own classifier regressing.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const DEFAULT_HOST = "https://www.hymtravel.com";

/**
 * The agents robots.txt names, plus two controls.
 *
 * `control-*` are not crawlers and must never be throttled. They bracket the
 * run: if a control degrades, the origin is having a bad minute and no verdict
 * in the run is trustworthy. `control-unknown` is a string no list can contain,
 * which separates "this origin throttles bots" from "this origin throttles".
 *
 * `control` carries WHICH control it is, not just that it is one, because the
 * two failures mean opposite things and the first version of this tool reported
 * both as "the origin is degrading for everything". A degraded browser control
 * voids the run. A degraded unknown control with a clean browser control is the
 * opposite of noise — it is crawler-selective throttling, the most useful thing
 * this tool can find, and it was being thrown away as a bad minute.
 */
export const AGENTS = [
  { name: "control-chrome", control: "browser", ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36" },
  { name: "control-unknown", control: "unknown", ua: "ZeeblorpCrawler/3.7 (+https://example.invalid/bot)" },

  /* The "AI answer engines: allowed, deliberately" block of public/robots.txt,
     in full. These are the agents where a 429 costs a citation, which is the
     entire stake of #156, so the fixtures require this set to stay in step with
     that file rather than trusting anyone to remember. */
  { name: "OAI-SearchBot", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot" },
  { name: "ChatGPT-User", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot" },
  { name: "GPTBot", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.1; +https://openai.com/gptbot" },
  { name: "Claude-SearchBot", ua: "Mozilla/5.0 (compatible; Claude-SearchBot/1.0; +claudebot@anthropic.com)" },
  { name: "Claude-User", ua: "Mozilla/5.0 (compatible; Claude-User/1.0; +claudebot@anthropic.com)" },
  { name: "ClaudeBot", ua: "Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)" },
  { name: "PerplexityBot", ua: "Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)" },
  { name: "Perplexity-User", ua: "Mozilla/5.0 (compatible; Perplexity-User/1.0; +https://perplexity.ai/perplexitybot)" },
  { name: "Google-Extended", ua: "Mozilla/5.0 (compatible; Google-Extended/1.0; +http://www.google.com/bot.html)" },
  { name: "Applebot-Extended", ua: "Mozilla/5.0 (compatible; Applebot-Extended/1.0; +http://www.apple.com/go/applebot)" },
  { name: "Meta-ExternalAgent", ua: "meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)" },
  { name: "Amazonbot", ua: "Mozilla/5.0 (compatible; Amazonbot/0.1; +https://developer.amazon.com/support/amazonbot)" },

  /* Search engines. Not the subject of #156, but they are the reference class:
     if Googlebot is fine while GPTBot is not, the treatment is per-agent. */
  { name: "Googlebot", ua: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" },
  { name: "Bingbot", ua: "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)" },
];

/**
 * Classify a burst by its shape, not by any single code in it.
 *
 * "drained" is the one that matters. It is not a milder "throttled" — it is the
 * absence of a measurement, and conflating the two is the exact mistake that
 * put a wrong conclusion into #156 twice.
 *
 * "throttled" means one specific shape and nothing else: a run of 200s, then a
 * 429, then 429 to the end of the burst. That is an exhaustion transition, and
 * it is the only shape from which the position of the first 429 means anything.
 *
 * A 200 arriving AFTER a 429 is not that. `[200, 200, 429, 200, 200, 200]` used
 * to classify as "throttled" and print "2 through, then 429" while requests 4
 * through 6 all succeeded — the tool over-claiming a fixed limit from a shape
 * that does not show one, which is the same failure as reading a single status
 * code, just with more digits in front of it. The bucket refilled mid-burst, or
 * the origin was intermittent; neither fixes a transition point, so it is
 * "unstable" and yields no budget number.
 */
export function classifyBurst(codes) {
  if (!Array.isArray(codes) || codes.length === 0) return "empty";
  const bad = codes.find((c) => c !== 200 && c !== 429);
  if (bad !== undefined) return "error";
  if (codes[0] === 429) return "drained";
  if (codes.every((c) => c === 200)) return "clean";
  return codes.slice(codes.indexOf(429)).every((c) => c === 429) ? "throttled" : "unstable";
}

/**
 * How many requests the agent got before the first 429.
 *
 * Null unless the burst actually caught the transition, because that is the
 * only shape where the number means anything. On a "clean" burst the budget is
 * merely "more than we sent"; on a "drained" burst it is unknown; on an
 * "unstable" one the 429 was not a transition at all. Returning a number in any
 * of those cases would invite it to be quoted as the limit — the issue already
 * had to add "treat 7 as one observation, not a documented limit".
 */
export function budgetFrom(codes) {
  return classifyBurst(codes) === "throttled" ? codes.indexOf(429) : null;
}

/** Did a control degrade? Then nothing else in the run is trustworthy. */
export function controlsHeld(results) {
  return results
    .filter((r) => r.control)
    .every((r) => classifyBurst(r.codes) === "clean");
}

/**
 * The whole decision — exit code and closing text — as a pure function.
 *
 * This lives here, exported and fixtured, because the first version had it
 * inline in main() where nothing could test it, and it shipped the exact bug
 * this tool exists to prevent: it filtered for "throttled" and "drained" only,
 * so an agent that came back 503 (or 0, from a failed curl) matched neither,
 * and a run where GPTBot was never successfully measured printed "Every agent
 * took the full burst. #156 is not reproducing right now." and exited 0.
 *
 * The classifier had fifteen fixtures. The decision that consumed it had none,
 * which is precisely why the error landed there and not in the classifier.
 *
 * So the rule is inverted from what it was. Success is not "nothing I looked
 * for was found" — it is "every crawler in the run returned a clean burst, and
 * there was at least one crawler in the run". Everything else is a non-zero
 * exit, including shapes added to the classifier after this was written.
 */
export function verdict(results, { only = null } = {}) {
  const lines = [];
  const cls = (r) => classifyBurst(r.codes);
  const unusable = (r) => cls(r) === "error" || cls(r) === "empty";
  const controls = results.filter((r) => r.control);
  const crawlers = results.filter((r) => !r.control);

  /* Nothing usable came back from anything. That is a statement about this
     machine or --host, not about the origin, and saying "the origin is
     degrading" here — as the first version did when `--burst` was passed
     without a number — invents a finding out of having sent no requests. */
  if (controls.length > 0 && controls.every(unusable)) {
    lines.push(
      "No control got a usable response, so this run never reached a working",
      "origin. Check the network and --host. This says nothing about #156.",
    );
    return { code: 1, lines };
  }

  /* The browser control is the "is this origin healthy at all" question. */
  if (controls.some((r) => r.control !== "unknown" && cls(r) !== "clean")) {
    lines.push(
      "The browser control did not come back clean. The origin is degrading for",
      "everything, not just crawlers — treat every verdict above as void.",
    );
    return { code: 1, lines };
  }

  /* Browser clean, invented UA throttled. Not a bad minute: the origin is
     matching on user-agent shape. It changes what #156 is — a generic bot rule
     rather than a GPTBot-specific one is a different ticket — so it is reported
     as the finding it is, and the crawler rows below still stand. */
  const selective = controls.some((r) => r.control === "unknown" && cls(r) !== "clean");
  if (selective) {
    lines.push(
      "control-unknown degraded while the browser control stayed clean. This",
      "origin throttles by user-agent shape, not just this one crawler, so a 429",
      "below is evidence of a generic bot rule rather than an agent-specific one.",
      "That is a different ticket. The crawler rows still stand — read them in",
      "that light rather than discarding them.",
      "",
    );
  }

  for (const r of crawlers.filter((r) => cls(r) === "drained")) {
    lines.push(
      `${r.name} was already on a 429 at the first request, so this run did not`,
      "measure it. Leave the agent alone until it rests and re-run, or time the",
      `cooldown: node tools/check-ai-crawlers.mjs --recover ${r.name}`,
      "",
    );
  }

  for (const r of crawlers.filter(unusable)) {
    const got = r.codes.length ? r.codes.join(" ") : "no requests at all";
    lines.push(
      `${r.name} returned ${got}, which is not a sequence this tool can read.`,
      "That is the absence of a measurement, not a clean one — do not record",
      "this agent as reachable on the strength of it.",
      "",
    );
  }

  for (const r of crawlers.filter((r) => cls(r) === "unstable")) {
    lines.push(
      `${r.name} returned 200s after a 429 (${r.codes.join(" ")}), so the burst never`,
      "fixed an exhaustion point. Re-run it when the origin is quiet.",
      "",
    );
  }

  for (const r of crawlers.filter((r) => cls(r) === "throttled")) {
    lines.push(`${r.name} took ${budgetFrom(r.codes)} requests, then 429 for the rest of the burst.`);
  }
  if (crawlers.some((r) => cls(r) === "throttled")) lines.push("");

  /* A run with no crawler in it cannot support a conclusion about crawlers.
     Reachable via `--only <typo>`, which used to leave just the two controls
     and then print " took the full burst" with an empty list of names. */
  if (crawlers.length === 0) {
    lines.push(
      "No crawler was measured in this run, so it supports no conclusion at all.",
    );
    return { code: 1, lines };
  }

  if (crawlers.every((r) => cls(r) === "clean") && !selective) {
    lines.push(
      only
        ? `${crawlers.map((a) => a.name).join(", ")} took the full burst. This run measured that\n` +
          "and nothing else — it says nothing about the other agents, #156 included.\n" +
          "Drop --only for a verdict on the issue."
        : "Every agent took the full burst. #156 is not reproducing right now.",
      "Log the run in docs/seo/ai-visibility-log.md before closing anything.",
    );
    return { code: 0, lines };
  }

  return { code: 1, lines };
}

async function status(url, ua) {
  try {
    const { stdout } = await execFileAsync(
      "curl",
      ["-s", "-o", process.platform === "win32" ? "NUL" : "/dev/null",
       "-w", "%{http_code}", "--max-time", "20", "-A", ua, url],
      { timeout: 30_000 },
    );
    return Number.parseInt(stdout.trim(), 10) || 0;
  } catch {
    return 0;
  }
}

async function burst(url, ua, n) {
  const codes = [];
  for (let i = 0; i < n; i += 1) codes.push(await status(url, ua));
  return codes;
}

const VERDICT = {
  clean: "OK        ",
  throttled: "THROTTLED ",
  drained: "NO RESULT ",
  unstable: "UNSTABLE  ",
  error: "ERROR     ",
  empty: "ERROR     ",
};

async function recover(url, agent, maxMinutes) {
  // One probe a minute. An agent that allowed a back-to-back burst cannot be
  // exhausted by 1/min, so a run that never returns 200 is itself the finding:
  // the window is longer than the run, or every request extends it.
  process.stdout.write(`Timing cooldown for ${agent.name}, one probe per minute, max ${maxMinutes}.\n`);
  for (let i = 1; i <= maxMinutes; i += 1) {
    const code = await status(url, agent.ua);
    const stamp = new Date().toISOString().slice(11, 19);
    process.stdout.write(`  ${stamp}  probe ${String(i).padStart(2)}  ${code}\n`);
    if (code === 200) {
      process.stdout.write(`\nRecovered after ${i} minute-spaced probes.\n`);
      return 0;
    }
    if (i < maxMinutes) await new Promise((r) => setTimeout(r, 60_000));
  }
  process.stdout.write(
    `\nStill 429 after ${maxMinutes} minute-spaced probes. Either the window is\n` +
    `longer than this run, or each request extends it. Both are worth reporting:\n` +
    `at 1 req/min a crawl of this site cannot make progress.\n`,
  );
  return 1;
}

async function main() {
  const argv = process.argv.slice(2);
  const arg = (flag, fallback) => {
    const i = argv.indexOf(flag);
    return i === -1 ? fallback : argv[i + 1];
  };
  const host = (arg("--host", DEFAULT_HOST) || DEFAULT_HOST).replace(/\/$/, "");
  const url = `${host}/`;
  const only = arg("--only", null);
  const recoverFor = arg("--recover", null);

  /* `--burst` with no number used to yield NaN, which sent zero requests and
     then still reached a verdict. A flag that silently measures nothing is
     worse than one that fails. */
  const size = Number.parseInt(arg("--burst", "12"), 10);
  if (!Number.isInteger(size) || size < 1) {
    process.stderr.write(`--burst needs a positive integer, got "${arg("--burst", "") ?? ""}".\n`);
    process.exit(2);
  }

  if (recoverFor) {
    const agent = AGENTS.find((a) => a.name.toLowerCase() === recoverFor.toLowerCase());
    if (!agent) {
      process.stderr.write(`Unknown agent "${recoverFor}".\n`);
      process.exit(2);
    }
    process.exit(await recover(url, agent, Number.parseInt(arg("--minutes", "40"), 10)));
  }

  /* `--recover` has always validated its agent name; `--only` did not, so a
     typo quietly left just the two controls and the run then claimed the burst
     was taken by an empty list of agents. Same check, same exit code. */
  if (only && !AGENTS.some((a) => a.name.toLowerCase() === only.toLowerCase())) {
    process.stderr.write(
      `Unknown agent "${only}". Known: ${AGENTS.map((a) => a.name).join(", ")}\n`,
    );
    process.exit(2);
  }

  const agents = only
    ? AGENTS.filter((a) => a.control || a.name.toLowerCase() === only.toLowerCase())
    : AGENTS;

  process.stdout.write(`Bursting ${size} requests per agent at ${url}\n`);
  process.stdout.write("Read the whole sequence. A single code is not a measurement.\n\n");

  const results = [];
  for (const agent of agents) {
    const codes = await burst(url, agent.ua, size);
    results.push({ ...agent, codes });
    const shape = classifyBurst(codes);
    process.stdout.write(`${VERDICT[shape]}${agent.name.padEnd(24)}${codes.join(" ")}\n`);
    if (shape === "throttled") {
      process.stdout.write(`${" ".repeat(34)}^ ${budgetFrom(codes)} through, then 429\n`);
    }
  }

  // Re-burst the first control last. If it degraded across the run, the origin
  // changed underneath the measurements and every verdict above is suspect.
  const bracket = await burst(url, AGENTS[0].ua, size);
  const bracketName = `${AGENTS[0].name} (again)`;
  results.push({ ...AGENTS[0], name: bracketName, codes: bracket });
  process.stdout.write(`${VERDICT[classifyBurst(bracket)]}${bracketName.padEnd(24)}${bracket.join(" ")}\n\n`);

  /* Every remaining decision — what this run is allowed to claim, and what it
     exits with — is made in verdict(), which is pure and fixtured. Nothing in
     main() gets to decide, because that is where the last one went wrong. */
  const { code, lines } = verdict(results, { only });
  process.stdout.write(`${lines.join("\n")}\n`);
  process.exit(code);
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("check-ai-crawlers.mjs")) {
  main();
}
