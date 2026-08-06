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
"""
import base64, json, os, shutil

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B64DIR = os.path.join(BASE, "images-b64")

manifest = json.load(open(os.path.join(B64DIR, "MANIFEST.json")))
aliases = json.load(open(os.path.join(B64DIR, "ALIASES.json")))

restored = 0
for m in manifest:
    rel = m["target"]  # "public/assets/img/x.jpg" relative to repo root
    data = base64.b64decode(open(os.path.join(B64DIR, os.path.basename(m["b64"]))).read())
    targets = [
        os.path.join(BASE, rel),
        os.path.join(BASE, rel.replace("public/", "dist/", 1)),
    ]
    for t in targets:
        os.makedirs(os.path.dirname(t), exist_ok=True)
        with open(t, "wb") as f:
            f.write(data)
        restored += 1

for alias, src in aliases.items():
    src_p = os.path.join(BASE, "dist", src)
    dst_p = os.path.join(BASE, "dist", "assets", alias)
    if os.path.exists(src_p):
        shutil.copyfile(src_p, dst_p)
        restored += 1

print(f"restored {restored} image files")
