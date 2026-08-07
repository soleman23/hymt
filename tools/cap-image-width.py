#!/usr/bin/env python3
"""Cap manifest JPGs at 1600px wide, the widest any visitor is ever served.

Hostinger's CDN transforms images on the way out. Measured against
brown-goose-754147.hostingersite.com on 2026-08-07:

  - width is capped at 1600px. Sending DPR:3 / Sec-CH-DPR:3 and
    Viewport-Width:1920 does not raise it, so it is a flat cap, not a
    responsive ladder.
  - a client that accepts WebP gets WebP instead of JPEG.
  - a phone User-Agent gets 800px.

So a 2048px source is downscaled at the edge before it reaches anyone.
The pixels above 1600 cost repo size, base64 payload and deploy time, and
are never delivered. This caps them at the source.

    python tools/cap-image-width.py              # report only
    python tools/cap-image-width.py --apply      # rewrite

--apply rewrites, in place:
  - public/assets/img/<name>.jpg      resized, re-encoded at q85
  - images-b64/assets__img__<name>.jpg.b64
  - the "bytes" field of that entry in images-b64/MANIFEST.json

All of it is reconstructible from git: the .b64 files are tracked, and
public/assets is regenerated from them by tools/restore_images.py. To undo,
`git checkout images-b64/` then re-run restore_images.py.

NOTE: this does not make pages load faster for visitors. The CDN was already
downscaling to 1600 (and to 800 WebP on phones), so the bytes leaving the edge
are unchanged. The win is repo and pipeline size, not page weight.
"""
import base64, io, json, os, sys
from PIL import Image

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B64DIR = os.path.join(BASE, "images-b64")
MANIFEST = os.path.join(B64DIR, "MANIFEST.json")

CAP = 1600
QUALITY = 85

# Unreferenced by any page since the Sports hero swap, and it is the frame
# e-27-wimbledon-pimms-terrace.jpg was cropped out of. Shrinking it would
# degrade any future re-crop and saves no visitor a single byte.
SKIP = {"e-23-wimbledon-pimms.jpg"}


def main():
    apply = "--apply" in sys.argv
    manifest = json.load(open(MANIFEST))
    before = after = 0
    rows, skipped = [], []

    for m in manifest:
        path = os.path.join(BASE, m["target"])
        name = os.path.basename(path)
        if not path.lower().endswith((".jpg", ".jpeg")) or not os.path.exists(path):
            continue
        im = Image.open(path)
        w, h = im.size
        if w <= CAP:
            continue
        if name in SKIP:
            skipped.append(name)
            continue

        old = os.path.getsize(path)
        new_h = round(h * CAP / w)
        resized = im.convert("RGB").resize((CAP, new_h), Image.LANCZOS)

        buf = io.BytesIO()
        resized.save(buf, "JPEG", quality=QUALITY, optimize=True, progressive=True)
        data = buf.getvalue()

        if apply:
            with open(path, "wb") as f:
                f.write(data)
            b64_path = os.path.join(B64DIR, "assets__img__%s.b64" % name)
            with open(b64_path, "w", newline="") as f:
                f.write(base64.b64encode(data).decode("ascii"))
            m["bytes"] = len(data)

        before += old
        after += len(data)
        rows.append((name, w, h, old, new_h, len(data)))

    rows.sort(key=lambda r: -(r[3] - r[5]))
    for name, w, h, old, new_h, new in rows:
        print("  %-42s %4dx%-4d -> %4dx%-4d  %6.0f -> %6.0f KB  (-%2.0f%%)"
              % (name, w, h, CAP, new_h, old / 1024, new / 1024,
                 100 * (old - new) / old))

    if skipped:
        print("\nskipped: %s" % ", ".join(sorted(skipped)))
    print("\n%s%d images capped at %dpx"
          % ("" if apply else "[report only, nothing written] ", len(rows), CAP))
    print("images     %.1f MB -> %.1f MB   saved %.1f MB (%.0f%%)"
          % (before / 1e6, after / 1e6, (before - after) / 1e6,
             100 * (before - after) / before if before else 0))
    b_before, b_after = (before * 4 + 2) // 3, (after * 4 + 2) // 3
    print("base64     %.1f MB -> %.1f MB   saved %.1f MB"
          % (b_before / 1e6, b_after / 1e6, (b_before - b_after) / 1e6))

    if apply:
        # Match the file as committed: CRLF, no trailing newline.
        with open(MANIFEST, "w", newline="\r\n") as f:
            json.dump(manifest, f, indent=2)
        print("\nMANIFEST.json byte counts updated.")
        print("Now run:  python tools/restore_images.py")
    else:
        print("\nRe-run with --apply to write.")


if __name__ == "__main__":
    main()
