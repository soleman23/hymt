/**
 * Cloudflare Turnstile site key for the three Web3Forms forms (#74).
 *
 * The site key is public by design (it ships in every page, like the
 * Web3Forms access key); the SECRET key never enters this repo — it is pasted
 * into the Web3Forms dashboard (Settings → Spam & Security → Captcha
 * Protection → Cloudflare Turnstile) and nowhere else.
 *
 * One place on purpose: Base.astro hands this to Turnstile.astro, and the
 * three form scripts read it from there, so swapping the key is a one-line
 * change here and a rebuild.
 *
 * This is the production widget "hymtravel.com" (Managed mode, hostnames
 * hymtravel.com + www.hymtravel.com), created 2026-09-02 in the Cloudflare
 * account through Turnstile Spin. It only renders on those hostnames.
 *
 * For local browsing use Cloudflare's documented ALWAYS-PASSES test key,
 * "1x00000000000000000000AA" (developers.cloudflare.com/turnstile/
 * troubleshooting/testing/): a real widget that succeeds anywhere and
 * protects nothing — never commit it back here.
 */
export const TURNSTILE_SITE_KEY = "0x4AAAAAAElB27lbtyz5RDEV";
