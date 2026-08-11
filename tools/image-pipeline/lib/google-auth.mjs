/**
 * Google OAuth for the place-card image pipeline.
 *
 * Deliberately no `googleapis` SDK. Node 22 has native fetch, and the three
 * things this pipeline needs from Google — refresh a token, read/write a values
 * range, upload a file — are four REST calls between them. Pulling in the SDK
 * would add a ~50-package dependency tree to a tool whose entire point is to
 * stay out of the site's dependency graph.
 *
 * Auth is a user refresh token rather than a service account because the
 * tracker sheet and the destination folder are both owned by a person, and a
 * service account would need each shared to it explicitly (and Shared Drive
 * membership granted) before a single write would land. The refresh token acts
 * as that person, so whatever they can already see in the browser, this works on.
 *
 * Credentials are read from the environment first, then from .secrets.json.
 * Both are gitignored; this repository is public and nothing here may be
 * committed. loadCredentials() throws with setup instructions rather than
 * returning a half-populated object, because a missing scope surfaces later as
 * an opaque 403 on the first write, long after the images were generated.
 */
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SECRETS_PATH = join(HERE, "..", ".secrets.json");
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

/* Both are needed: spreadsheets to write H/I, drive.file to upload and to read
   back the webViewLink of what we uploaded. drive.file is intentionally the
   narrow scope — it grants access to files this client creates, not the whole
   Drive. The destination folder must therefore be passed as an explicit parent
   (it is, from config), and the consent screen must list both. */
export const REQUIRED_SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
];

const SETUP_HINT = `
Google credentials are missing. See tools/image-pipeline/README.md § Google setup.

In short: create a Desktop OAuth client, then supply either

  export GOOGLE_CLIENT_ID=...
  export GOOGLE_CLIENT_SECRET=...
  export GOOGLE_REFRESH_TOKEN=...

or a gitignored tools/image-pipeline/.secrets.json:

  { "client_id": "...", "client_secret": "...", "refresh_token": "..." }

The token must carry both of these scopes:
${REQUIRED_SCOPES.map((s) => `  ${s}`).join("\n")}
`.trim();

/**
 * Resolve credentials from env, falling back to .secrets.json.
 * Throws with setup instructions if any of the three parts is absent.
 */
export async function loadCredentials() {
  let fileCreds = {};
  try {
    fileCreds = JSON.parse(await readFile(SECRETS_PATH, "utf8"));
  } catch (err) {
    /* A missing secrets file is normal when env vars are used. A malformed one
       is not, and silently treating it as absent would send the user hunting
       through OAuth config for a stray comma. */
    if (err.code !== "ENOENT") {
      throw new Error(`${SECRETS_PATH} exists but could not be parsed: ${err.message}`);
    }
  }

  const creds = {
    clientId: process.env.GOOGLE_CLIENT_ID || fileCreds.client_id,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || fileCreds.client_secret,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN || fileCreds.refresh_token,
  };

  const missing = Object.entries(creds)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length) {
    throw new Error(`${SETUP_HINT}\n\nMissing: ${missing.join(", ")}`);
  }
  return creds;
}

/**
 * An access-token provider that refreshes on demand and caches until 60s before
 * expiry. A full run is ~66 rows over potentially an hour or more, which will
 * cross the standard 3600s token lifetime; without this the run would die
 * partway with a 401 after images had already been generated and paid for in
 * wall-clock time.
 */
export function createTokenProvider(creds) {
  let cached = null;
  let expiresAt = 0;
  let inFlight = null;

  async function refresh() {
    const body = new URLSearchParams({
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
      refresh_token: creds.refreshToken,
      grant_type: "refresh_token",
    });

    const res = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const text = await res.text();

    if (!res.ok) {
      /* invalid_grant is the common one and its default message ("Bad Request")
         says nothing useful, so name the three real causes. */
      let detail = text;
      try {
        const parsed = JSON.parse(text);
        detail = parsed.error_description || parsed.error || text;
        if (parsed.error === "invalid_grant") {
          detail +=
            " — the refresh token was revoked, expired, or belongs to a different" +
            " OAuth client than GOOGLE_CLIENT_ID. Re-mint it (README § Google setup).";
        }
      } catch {
        /* non-JSON error body: fall through with the raw text */
      }
      throw new Error(`Google token refresh failed (${res.status}): ${detail}`);
    }

    const data = JSON.parse(text);
    cached = data.access_token;
    expiresAt = Date.now() + (data.expires_in ?? 3600) * 1000 - 60_000;

    /* Google echoes the granted scopes. Catching a missing one here — before a
       single image is generated — is the difference between a clear message and
       an hour of work that cannot be written back to the sheet. */
    if (typeof data.scope === "string") {
      const granted = new Set(data.scope.split(/\s+/));
      const absent = REQUIRED_SCOPES.filter((s) => !granted.has(s));
      if (absent.length) {
        throw new Error(
          `The refresh token is valid but is missing required scope(s):\n` +
            absent.map((s) => `  ${s}`).join("\n") +
            `\n\nGranted: ${data.scope}\n\nRe-mint the token with both scopes (README § Google setup).`
        );
      }
    }
    return cached;
  }

  return async function getAccessToken() {
    if (cached && Date.now() < expiresAt) return cached;
    /* Collapse concurrent refreshes; the pipeline is sequential today but the
       upload and sheet-write legs both ask for a token in quick succession. */
    if (!inFlight) {
      inFlight = refresh().finally(() => {
        inFlight = null;
      });
    }
    return inFlight;
  };
}

/**
 * fetch() wrapper that attaches the bearer token and turns a non-2xx into an
 * Error carrying Google's own message. Every Google call in this pipeline goes
 * through here so error handling is uniform and no call site has to remember
 * to check res.ok.
 */
export async function googleFetch(getAccessToken, url, options = {}) {
  const token = await getAccessToken();
  const res = await fetch(url, {
    ...options,
    headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let message = text.slice(0, 500);
    try {
      message = JSON.parse(text).error?.message ?? message;
    } catch {
      /* non-JSON error body: keep the truncated raw text */
    }
    const err = new Error(`Google API ${res.status} on ${new URL(url).pathname}: ${message}`);
    err.status = res.status;
    throw err;
  }
  return res;
}
