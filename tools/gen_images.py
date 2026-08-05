#!/usr/bin/env python3
"""Batch-generate all site images via the image_generation plugin script.
Handles the gateway returning PNG regardless of requested extension:
normalizes every result to the manifest's .jpg filename."""
import json, os, subprocess, time

TOOL = "/app/.agents/plugins/image_generation/scripts/image_generation_tool.py"
MANIFEST = "/mnt/agents/work/hym-build/tools/image-gen-manifest.json"
OUTDIR = "/tmp/hym-run/public/assets/img"
LOG = "/tmp/hym-run/tools/gen-images.log"

os.makedirs(OUTDIR, exist_ok=True)
items = json.load(open(MANIFEST))

def log(msg):
    line = f"[{time.strftime('%H:%M:%S')}] {msg}"
    print(line, flush=True)
    with open(LOG, "a") as f:
        f.write(line + "\n")

def find_actual(jpg_path):
    """Return existing generated file for this basename (jpg/jpeg/png)."""
    base = jpg_path.rsplit(".", 1)[0]
    for ext in (".jpg", ".jpeg", ".png"):
        p = base + ext
        if os.path.exists(p) and os.path.getsize(p) > 10000:
            return p
    return None

def normalize_to_jpg(actual, jpg_path):
    """Convert png->jpg if needed; return final jpg path."""
    if actual == jpg_path:
        return jpg_path
    from PIL import Image
    im = Image.open(actual).convert("RGB")
    im.save(jpg_path, "JPEG", quality=88, optimize=True)
    os.remove(actual)
    return jpg_path

# normalize anything already on disk
for it in items:
    target = os.path.join(OUTDIR, it["file"])
    actual = find_actual(target)
    if actual and actual != target:
        normalize_to_jpg(actual, target)
        log(f"normalized {os.path.basename(actual)} -> {it['file']}")

todo = [it for it in items if find_actual(os.path.join(OUTDIR, it["file"])) is None]
log(f"START batch: {len(todo)} of {len(items)} images to generate")

ok, fail = 0, []
for n, it in enumerate(todo, 1):
    out = os.path.join(OUTDIR, it["file"])
    cmd = [
        "python3", TOOL, "generate",
        "--description", it["prompt"],
        "--ratio", it["ratio"],
        "--resolution", it["res"],
        "--background", "opaque",
        "--output", out,
    ]
    done = False
    for attempt in (1, 2):
        try:
            subprocess.run(cmd, capture_output=True, text=True, timeout=420)
            actual = find_actual(out)
            if actual:
                normalize_to_jpg(actual, out)
                done = True
                break
            err = "no output file"
        except subprocess.TimeoutExpired:
            err = "timeout"
        log(f"  attempt {attempt} failed for {it['id']}: {err}")
        time.sleep(5)
    if done:
        ok += 1
        log(f"[{n}/{len(todo)}] OK {it['file']} ({os.path.getsize(out)//1024} KB)")
    else:
        fail.append(it["id"])
        log(f"[{n}/{len(todo)}] FAIL {it['id']}")

log(f"DONE batch: {ok} ok, {len(fail)} failed: {fail}")
