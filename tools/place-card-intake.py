#!/usr/bin/env python3
"""Intake place-card images and convert a destination page to `--photo`.

Does the whole 4-step intake and the markup conversion in one pass, which is
the part of the photo rollout that is fiddly and easy to get subtly wrong.

    python tools/place-card-intake.py <srcdir> <page> <grid-style|EMPTY> \
        <file>:<slug> [<file>:<slug> ...]

Example — the page's grid opens as
`<div class="places-grid places-grid--even" style="--card-desc-lines:5">`:

    python tools/place-card-intake.py /tmp/frames portugal 'style="--card-desc-lines:5"' \
        lisbon.png:portugal-lisbon  porto.png:portugal-porto  ...

If the grid has no style attribute, pass EMPTY.

What it does, per image:
  1. public/assets/img/<slug>.jpg   — approved bytes kept when the source is
     already a JPEG <=1600px wide; otherwise resized to 1600px and re-encoded
     at q85 progressive. (public/assets/img is gitignored; the b64 twin is the
     tracked copy — see docs/seo/HANDOFF-photo-rollout.md.)
  2. images-b64/assets__img__<slug>.jpg.b64 — single line, no trailing newline
  3. an images-b64/MANIFEST.json entry — written back at indent=1 with CRLF
     and a trailing newline, which is the committed file's exact format. Do
     NOT switch this to cap-image-width.py's indent=2.

Then, for the page:
  - adds `places-grid--photo` and drops any `--card-desc-lines` style, which is
    dead under --photo (destination.css sets min-height:0 on the description)
  - replaces each `.place-card__ph` + sibling `.place-card__overlay` with
    `<img class="place-card__img">` carrying the TRUE intrinsic width/height
  - derives each card's slug from its own `.place-card__name`, so a mismatch
    between the markup and the files you pass is a hard failure, not a silent
    wrong-image

Every step asserts. It refuses to half-convert a page: if any card's asset is
missing, or the converted count does not match the number of pairs given, it
raises before writing the page back.

Re-running on an already-correct image is byte-identical, so it is safe to use
to adopt an asset that already exists in public/assets/img (this is how
kenya-tanzania-serengeti.jpg was picked up for free).

Afterwards, always: `npm run build`, then measure in the browser.
"""
import base64
import html
import io
import json
import os
import re
import sys
import unicodedata

from PIL import Image

CAP = 1600
QUALITY = 85


def slugify(name):
    """Card name -> slug. The entity and accent handling is essential:
    without it Española/Bartolomé/Mývatn silently miss their files."""
    n = html.unescape(name)
    n = unicodedata.normalize("NFKD", n)
    n = "".join(c for c in n if not unicodedata.combining(c))
    n = n.replace("&", "and").lower()
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", n)).strip("-")


def intake(base, src_dir, pairs):
    manifest_path = os.path.join(base, "images-b64", "MANIFEST.json")
    manifest = json.load(open(manifest_path))
    existing = {m["target"] for m in manifest}

    for fname, slug in pairs:
        path = os.path.join(src_dir, fname)
        assert os.path.exists(path), "source not found: " + path
        im = Image.open(path)
        w, h = im.size

        if im.format == "JPEG" and w <= CAP:
            data = open(path, "rb").read()
            out_w, out_h, how = w, h, "kept approved bytes"
        else:
            out_w = min(w, CAP)
            out_h = round(h * out_w / w)
            buf = io.BytesIO()
            im.convert("RGB").resize((out_w, out_h), Image.LANCZOS).save(
                buf, "JPEG", quality=QUALITY, optimize=True, progressive=True)
            data = buf.getvalue()
            how = "re-encoded %dx%d %s" % (w, h, im.format)

        target = "public/assets/img/%s.jpg" % slug
        open(os.path.join(base, target), "wb").write(data)

        b64rel = "images-b64/assets__img__%s.jpg.b64" % slug
        with open(os.path.join(base, b64rel), "w", newline="") as f:
            f.write(base64.b64encode(data).decode("ascii"))

        if target not in existing:
            manifest.append({"b64": b64rel, "target": target, "bytes": len(data)})
        else:
            for m in manifest:
                if m["target"] == target:
                    m["bytes"] = len(data)

        print("  %-52s %4dx%-4d %8d B  %s" % (slug, out_w, out_h, len(data), how))

    # indent=1, CRLF, trailing newline — matches the committed file byte for byte.
    with open(manifest_path, "w", newline="\r\n") as f:
        json.dump(manifest, f, indent=1)
        f.write("\n")
    print("  manifest entries: %d" % len(manifest))


def convert(base, page, grid_style, expected):
    path = os.path.join(base, "src", "content-pages",
                        "destinations__%s.html" % page)
    s = open(path, encoding="utf-8").read()

    if "places-grid--photo" in s:
        print("  %s is already on --photo; nothing to convert." % page)
        print("  (Intake above still ran, and is byte-identical for an "
              "unchanged image.)")
        return

    opener = '<div class="places-grid places-grid--even"%s>' % (
        " " + grid_style if grid_style != "EMPTY" else "")
    assert opener in s, (
        "grid opening tag not found. Expected exactly:\n    %s\n"
        "Check the real tag with:\n"
        "    grep -o '<div class=\"places-grid[^>]*>' "
        "src/content-pages/destinations__%s.html" % (opener, page))
    s = s.replace(
        opener, '<div class="places-grid places-grid--even places-grid--photo">', 1)

    pat = re.compile(
        r'[ \t]*<div class="place-card__ph"[^>]*>.*?</div>\n'
        r'[ \t]*<div class="place-card__overlay"></div>\n'
        r'(?P<rest>\s*<div class="place-card__body">\s*'
        r'<div class="place-card__region">(?P<region>[^<]+)</div>\s*'
        r'<div class="place-card__name">(?P<name>[^<]+)</div>)', re.S)

    count = [0]

    def repl(m):
        name, region = m.group("name"), m.group("region")
        slug = "%s-%s" % (page, slugify(name))
        asset = os.path.join(base, "public", "assets", "img", slug + ".jpg")
        assert os.path.exists(asset), (
            "card %r wants %s.jpg, which does not exist" % (name, slug))
        w, h = Image.open(asset).size
        count[0] += 1
        return ('      <img class="place-card__img" src="/assets/img/%s.jpg" '
                'alt="%s, %s" width="%d" height="%d" loading="lazy" '
                'decoding="async">\n' % (slug, name, region, w, h)) + m.group("rest")

    s = pat.sub(repl, s)

    assert count[0] == expected, "converted %d cards, expected %d" % (
        count[0], expected)
    assert "place-card__ph" not in s, "leftover place-card__ph"
    assert "place-card__overlay" not in s, "leftover place-card__overlay"
    assert "card-desc-lines" not in s, "leftover --card-desc-lines"

    open(path, "w", encoding="utf-8", newline="").write(s)
    print("  converted %d %s cards" % (count[0], page))


def main():
    if len(sys.argv) < 5:
        print(__doc__)
        return 1
    src_dir, page, grid_style = sys.argv[1], sys.argv[2], sys.argv[3]
    pairs = [a.split(":", 1) for a in sys.argv[4:]]
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    print("intake:")
    intake(base, src_dir, pairs)
    print("convert:")
    convert(base, page, grid_style, len(pairs))
    print("\nNow run:  npm run build")
    return 0


if __name__ == "__main__":
    sys.exit(main())
