#!/usr/bin/env python3
"""P1-4 codemod: give every <img> in src/content-pages/ its intrinsic
width/height, decoding="async", and loading="lazy" below the fold.

Reads each image's real pixel dimensions from public/assets/ (run
`npm run restore` first if the binaries are missing). Idempotent: an <img>
that already carries width= is left alone, so this can re-run safely after
new images are added.

Fold rule: `page-hero__watermark` sits inside the hero (first viewport) and
must NOT be lazy — lazy-loading an above-the-fold image makes LCP worse.
Everything else in content pages is below the fold.

Content note (P1-4, not fixed here): 53 of the 60 tags are the site logo
standing in for a photograph of Mark (`mark-note__photo`). That is a content
gap, not an attribute bug — tracked via DECISIONS.md D5 (photo to come).
This codemod prints the count so it is never silently accepted.
"""
import os, re, sys

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required: pip install Pillow")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CP = os.path.join(ROOT, "src", "content-pages")
PUB = os.path.join(ROOT, "public")

ABOVE_FOLD = ("page-hero__watermark",)

dims_cache = {}
def dims(src):
    if src not in dims_cache:
        p = os.path.join(PUB, src.lstrip("/").replace("/", os.sep))
        if not os.path.exists(p):
            return None
        with Image.open(p) as im:
            dims_cache[src] = im.size
    return dims_cache[src]

IMG_RE = re.compile(r"<img\b[^>]*>")
stats = {"fixed": 0, "skipped": 0, "missing": [], "mark_note": 0}

def fix_tag(tag):
    if "width=" in tag:
        stats["skipped"] += 1
        return tag
    src_m = re.search(r'src="([^"]+)"', tag)
    if not src_m:
        return tag
    d = dims(src_m.group(1))
    if d is None:
        stats["missing"].append(src_m.group(1))
        return tag
    w, h = d
    cls = (re.search(r'class="([^"]*)"', tag) or [None, ""])[1]
    lazy = not any(c in cls for c in ABOVE_FOLD)
    if "mark-note__photo" in cls:
        stats["mark_note"] += 1
    attrs = f' width="{w}" height="{h}"'
    if lazy and "loading=" not in tag:
        attrs += ' loading="lazy"'
    if "decoding=" not in tag:
        attrs += ' decoding="async"'
    stats["fixed"] += 1
    return tag[:-1] + attrs + ">"

changed_files = 0
for fname in sorted(os.listdir(CP)):
    if not fname.endswith(".html"):
        continue
    path = os.path.join(CP, fname)
    src = open(path, encoding="utf-8").read()
    out = IMG_RE.sub(lambda m: fix_tag(m.group(0)), src)
    if out != src:
        with open(path, "w", encoding="utf-8", newline="") as f:
            f.write(out)
        changed_files += 1

print(f"fixed {stats['fixed']} img tags across {changed_files} files "
      f"({stats['skipped']} already had dimensions)")
if stats["mark_note"]:
    print(f"FLAG: {stats['mark_note']} mark-note__photo tags use the site logo as a "
          f"stand-in for a photo of Mark — content gap, see DECISIONS.md D5.")
if stats["missing"]:
    print("ERROR: images referenced but not found under public/ "
          "(run `npm run restore`):")
    for m in stats["missing"]:
        print("  " + m)
    sys.exit(1)
