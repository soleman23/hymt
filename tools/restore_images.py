#!/usr/bin/env python3
"""Restore site images from images-b64/ after cloning.

GitHub push tooling cannot store binary files, so every site image is
committed as base64 text in images-b64/. Run this after cloning, and after
every build — `astro build` wipes dist/assets/ each time:

    python3 tools/restore_images.py

It reconstructs:
  - public/assets/... (Astro source images)
  - dist/assets/... (built site mirrors)
  - dist/assets/*.jpg journal hero aliases

Writes are retried. This checkout lives under OneDrive, and writing ~960
files back to back into synced storage intermittently fails with
`OSError: [Errno 22] Invalid argument` — the sync engine holding the handle
as the file lands. It failed three builds in a row on a DIFFERENT file each
time (dh-01-antarctica, dh-23-spain, jh-12-mediterranean), which is what
identifies it as contention rather than a bad path or a corrupt entry: the
same write succeeds moments later. Since `npm run build` runs this and the
build is the commit gate, one unlucky file blocked every commit.
"""
import base64, json, os, shutil, time

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B64DIR = os.path.join(BASE, "images-b64")

RETRIES = 5


def write_retrying(path, data):
    """Write bytes, retrying the transient OneDrive EINVAL described above.

    Re-raises anything that is not errno 22, and re-raises 22 itself once the
    attempts are spent — a real bad path must still fail the build loudly
    rather than be silently skipped.
    """
    for attempt in range(RETRIES):
        try:
            with open(path, "wb") as f:
                f.write(data)
            return attempt
        except OSError as e:
            if e.errno != 22 or attempt == RETRIES - 1:
                raise
            time.sleep(0.2 * (attempt + 1))

manifest = json.load(open(os.path.join(B64DIR, "MANIFEST.json")))
aliases = json.load(open(os.path.join(B64DIR, "ALIASES.json")))

restored = 0
retried = 0
for m in manifest:
    rel = m["target"]  # "public/assets/img/x.jpg" relative to repo root
    data = base64.b64decode(open(os.path.join(B64DIR, os.path.basename(m["b64"]))).read())
    targets = [
        os.path.join(BASE, rel),
        os.path.join(BASE, rel.replace("public/", "dist/", 1)),
    ]
    for t in targets:
        os.makedirs(os.path.dirname(t), exist_ok=True)
        retried += write_retrying(t, data)
        restored += 1

for alias, src in aliases.items():
    src_p = os.path.join(BASE, "dist", src)
    dst_p = os.path.join(BASE, "dist", "assets", alias)
    if os.path.exists(src_p):
        with open(src_p, "rb") as f:
            retried += write_retrying(dst_p, f.read())
        restored += 1

print(f"restored {restored} image files" + (f" ({retried} write retries)" if retried else ""))
