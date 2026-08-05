#!/usr/bin/env python3
"""Remove the 'AI-generated' watermark burned into the bottom-left corner
of gateway-generated images. Detects bright watermark pixels inside a
bottom-left region and inpaints them."""
import os, sys
import cv2
import numpy as np

IMGDIR = "/tmp/hym-run/public/assets/img"

def remove_wm(path):
    img = cv2.imread(path)
    if img is None:
        return False
    h, w = img.shape[:2]
    # region where the watermark lives: left 30%, bottom 12%
    x0, y0 = 0, int(h * 0.88)
    x1, y1 = int(w * 0.30), h
    roi = img[y0:y1, x0:x1]

    gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    # watermark text is light relative to local background: adaptive threshold
    blur = cv2.GaussianBlur(gray, (0, 0), 3)
    diff = cv2.subtract(blur, gray)  # background - pixel: bright text -> negative? use absdiff
    diff = cv2.absdiff(blur, gray)
    _, mask = cv2.threshold(diff, 18, 255, cv2.THRESH_BINARY)
    # only keep small bright-on-anything components: also include pixels brighter than 170
    _, bright = cv2.threshold(gray, 175, 255, cv2.THRESH_BINARY)
    mask = cv2.bitwise_or(mask, bright)
    # restrict to actual text zone (bottom part of roi), allow full width of roi
    zone = np.zeros_like(mask)
    zone[int(mask.shape[0] * 0.25):, :] = 255
    mask = cv2.bitwise_and(mask, zone)
    mask = cv2.dilate(mask, np.ones((5, 5), np.uint8), iterations=2)

    full = np.zeros((h, w), np.uint8)
    full[y0:y1, x0:x1] = mask
    out = cv2.inpaint(img, full, 7, cv2.INPAINT_TELEA)
    cv2.imwrite(path, out, [cv2.IMWRITE_JPEG_QUALITY, 90])
    return int(mask.sum() // 255)

if __name__ == "__main__":
    files = sorted(f for f in os.listdir(IMGDIR) if f.endswith(".jpg"))
    print(f"processing {len(files)} images")
    for f in files:
        n = remove_wm(os.path.join(IMGDIR, f))
        print(f"  {f}: {n} px inpainted")
    print("done")
