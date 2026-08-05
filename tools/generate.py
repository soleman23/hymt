#!/usr/bin/env python3
"""Generate all Astro pages from source HTML."""
import re, os, json, glob, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from convert import UP, BASE, rewrite_links, fix_assets, get_inline_css, get_meta

PAGES = os.path.join(BASE, "src/pages")
CONTENT = os.path.join(BASE, "src/content-pages")
os.makedirs(PAGES, exist_ok=True)
os.makedirs(CONTENT, exist_ok=True)

def get_body(html):
    m = re.search(r'</nav>', html)
    body = html[m.end():] if m else html
    fm = re.search(r'<footer[\s>]', body)
    if fm:
        body = body[:fm.start()]
    body = re.sub(r'<section class="newsletter"[\s\S]*?</section>', '', body)
    # cut tweaks panel and everything after it (it's always the last block before scripts)
    tp = body.find('<div class="tweaks-panel"')
    if tp != -1:
        body = body[:tp]
    body = re.sub(r'<script>[\s\S]*?</script>', '', body)
    return body.strip()

def esc_prop(s):
    return s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", " ")

def route_name(route):
    parts = [p for p in route.strip("/").split("/") if p]
    return "__".join(parts) if parts else "home"

def rel_base(route):
    depth = len([p for p in route.strip("/").split("/") if p])
    return "../" * (depth + 1)

def write_page(route, title, desc, active, content, page_css, schema="website", show_newsletter=True):
    rn = route_name(route)
    open(os.path.join(CONTENT, rn + ".html"), "w").write(content)
    d = os.path.join(PAGES, route.strip("/"))
    os.makedirs(d, exist_ok=True)
    base = rel_base(route)
    nl = "" if show_newsletter else ' showNewsletter={false}'
    page = f'''---
import Base from "{base}layouts/Base.astro";
import Content from "{base}content-pages/{rn}.html?raw";
const pageCss = {json.dumps(page_css)};
---
<Base title="{esc_prop(title)}" description="{esc_prop(desc)}" active="{active}" pageCss={{pageCss}} schemaType="{schema}"{nl}>
  <Fragment set:html={{Content}} />
</Base>
'''
    open(os.path.join(d, "index.astro"), "w").write(page)

MANIFEST = []

def convert(src_file, route, active, schema="website", show_newsletter=True):
    html = open(os.path.join(UP, src_file), encoding="utf-8-sig").read()
    title, desc = get_meta(html)
    content = fix_assets(rewrite_links(get_body(html)))
    css = get_inline_css(html)
    write_page(route, title, desc, active, content, css, schema, show_newsletter)
    MANIFEST.append({"route": route, "title": title, "desc": desc, "src": src_file})

convert("HYM About.html", "/about/", "about")
convert("HYM Contact.html", "/contact/", "contact")
convert("HYM FAQ.html", "/faq/", "")
convert("HYM Journal.html", "/travel-journal/", "journal")
convert("HYM Experiences.html", "/experiences/", "experiences")
convert("HYM Destinations.html", "/destinations/", "destinations")

for src, route in [
  ("HYM Experience Beach.html", "/experiences/beach-island-escapes/"),
  ("HYM Experience All-Inclusive.html", "/experiences/all-inclusive-vacations/"),
  ("HYM Experience Family.html", "/experiences/family-travel/"),
  ("HYM Experience Multigenerational.html", "/experiences/multigenerational-travel/"),
  ("HYM Experience Adventure.html", "/experiences/adventure-active-travel/"),
  ("HYM Experience Wellness.html", "/experiences/wellness-retreat-travel/"),
  ("HYM Experience Culture.html", "/experiences/culture-immersive-travel/"),
  ("HYM Experience Food Wine.html", "/experiences/food-wine-travel/"),
  ("HYM Experience Safari.html", "/experiences/safari-wildlife-travel/"),
  ("HYM Experience Sports.html", "/experiences/sports-event-travel/"),
]:
    convert(src, route, "experiences")

dest_pages = {
  "HYM Destination Caribbean Mexico.html": "/destinations/caribbean-mexico/",
  "HYM Destination Europe.html": "/destinations/europe/",
  "HYM Destination Africa.html": "/destinations/africa/",
  "HYM Destination Asia.html": "/destinations/asia/",
  "HYM Destination South Pacific.html": "/destinations/south-pacific/",
  "HYM Destination Middle East.html": "/destinations/middle-east/",
  "HYM Destination North America.html": "/destinations/north-america/",
  "HYM Destination South America.html": "/destinations/south-america/",
  "HYM Destination Polar Regions.html": "/destinations/polar-regions/",
  "HYM Destination Alaska.html": "/destinations/alaska/",
  "HYM Destination Bali.html": "/destinations/bali/",
  "HYM Destination Botswana.html": "/destinations/botswana/",
  "HYM Destination Egypt.html": "/destinations/egypt/",
  "HYM Destination Fiji.html": "/destinations/fiji/",
  "HYM Destination France.html": "/destinations/france/",
  "HYM Destination French Polynesia.html": "/destinations/french-polynesia/",
  "HYM Destination Galapagos.html": "/destinations/galapagos/",
  "HYM Destination Greece.html": "/destinations/greece/",
  "HYM Destination Hawaii.html": "/destinations/hawaii/",
  "HYM Destination Italy.html": "/destinations/italy/",
  "HYM Destination Japan.html": "/destinations/japan/",
  "HYM Destination Jordan.html": "/destinations/jordan/",
  "HYM Destination Kenya Tanzania.html": "/destinations/kenya-tanzania/",
  "HYM Destination Maldives.html": "/destinations/maldives/",
  "HYM Destination New York.html": "/destinations/new-york/",
  "HYM Destination New Zealand.html": "/destinations/new-zealand/",
  "HYM Destination Oman.html": "/destinations/oman/",
  "HYM Destination Patagonia.html": "/destinations/patagonia/",
  "HYM Destination Peru.html": "/destinations/peru/",
  "HYM Destination Rwanda.html": "/destinations/rwanda/",
  "HYM Destination Thailand.html": "/destinations/thailand/",
  "HYM Destination Turks Caicos.html": "/destinations/turks-caicos/",
}
for src, route in dest_pages.items():
    convert(src, route, "destinations")

journal_files = [f for f in glob.glob(os.path.join(UP, "*.html"))
                 if not os.path.basename(f).startswith("HYM")
                 and os.path.basename(f) not in ("Brand Toolkit.html", "Experience-detail.html")]
for f in sorted(journal_files):
    b = os.path.basename(f)
    slug = b.replace(".html", "")
    convert(b, f"/travel-journal/{slug}/", "journal", schema="article")

print(f"Generated {len(MANIFEST)} pages")
json.dump(MANIFEST, open(os.path.join(BASE, "tools/manifest.json"), "w"), indent=1)
