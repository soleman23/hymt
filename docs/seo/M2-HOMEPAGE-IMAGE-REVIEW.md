# M2 homepage first-slide image review

Issue: #35. Reviewed 2026-10-04.

The homepage preloaded a responsive AVIF but rendered its first carousel slide
as a CSS background using the original JPEG. Chromium downloaded both files.
The first slide now uses an eager decorative image through the existing
responsive picture pipeline, matching the existing preload. Its cover crop,
slide container and navigation remain intact. Later slides retain their
existing deferred background loading.

## Validation

- Full build passed: 132 pages, 1,117 verifier fixtures, responsive assets,
  metadata baseline, asset references and enforcing CSP checks.
- Four homepage-specific fixtures cover complete markup, a bare image,
  a missing preload and a missing AVIF source.
- Paired mobile browser measurements used fresh contexts, disabled cache,
  412 × 823 viewport, DPR 1.75, 150 ms latency, 1,638.4 Kbps download,
  4× CPU slowdown and an ABBAAB order. Each run observed 4.5 seconds after
  DOM readiness.
- All three baseline runs downloaded two first-slide image files totaling
  236,081 encoded body bytes. All three changed runs downloaded one AVIF
  totaling 26,049 bytes: 210,032 bytes removed, about 89% of the first-slide
  image payload. This percentage does not describe the whole page.
- Browser checks at 375, 768 and 1,440 pixels confirmed the image fills its
  slide, uses a cover crop, loads successfully and creates no horizontal
  overflow. Screenshots were visually reviewed. Manual dot navigation and
  the first slide with JavaScript disabled passed without browser errors.

## Limits

The measured LCP node remained the hero text. Before/after timings varied;
these runs do not establish a consistent LCP improvement. Field CWV remains
unverified, and #35 stays open. No claim of a passing field percentile is made.
The CDN `no-transform` setting, metadata, carousel script, imagery and
application dependencies were unchanged. Raw measurements and screenshots
remain in private local evidence.
