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
 * The value below is Cloudflare's documented ALWAYS-PASSES test key
 * (https://developers.cloudflare.com/turnstile/troubleshooting/testing/). It
 * renders a real widget that succeeds on any hostname, which is what lets
 * the integration be built and browsed before the production widget exists.
 * It protects nothing. Replace it with the key from the Cloudflare
 * dashboard's Turnstile widget for hymtravel.com + www.hymtravel.com before
 * turning Turnstile on in Web3Forms.
 */
export const TURNSTILE_SITE_KEY = "1x00000000000000000000AA";
