#!/usr/bin/env python3
"""URL map + extraction helpers for HYM source pages."""
import re, os, json, glob

UP = "/mnt/agents/upload"
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

EXP = {
  "HYM Experiences.html": "/experiences/",
  "HYM Experience Beach.html": "/experiences/beach-island-escapes/",
  "HYM Experience All-Inclusive.html": "/experiences/all-inclusive-vacations/",
  "HYM Experience Family.html": "/experiences/family-travel/",
  "HYM Experience Multigenerational.html": "/experiences/multigenerational-travel/",
  "HYM Experience Adventure.html": "/experiences/adventure-active-travel/",
  "HYM Experience Wellness.html": "/experiences/wellness-retreat-travel/",
  "HYM Experience Culture.html": "/experiences/culture-immersive-travel/",
  "HYM Experience Food Wine.html": "/experiences/food-wine-travel/",
  "HYM Experience Safari.html": "/experiences/safari-wildlife-travel/",
  "HYM Experience Sports.html": "/experiences/sports-event-travel/",
  "HYM Experience Cruises.html": "/experiences/cruises/",
  "HYM Experience Romance.html": "/experiences/romance-celebration-travel/",
}
DEST = {
  "HYM Destinations.html": "/destinations/",
  "HYM Destination Caribbean Mexico.html": "/destinations/caribbean-mexico/",
  "HYM Destination Europe.html": "/destinations/europe/",
  "HYM Destination Africa.html": "/destinations/africa/",
  "HYM Destination Asia.html": "/destinations/asia/",
  "HYM Destination South Pacific.html": "/destinations/south-pacific/",
  "HYM Destination Middle East.html": "/destinations/middle-east/",
  "HYM Destination North America.html": "/destinations/north-america/",
  "HYM Destination South America.html": "/destinations/south-america/",
  "HYM Destination Polar Regions.html": "/destinations/polar-regions/",
  "HYM Destination Polar.html": "/destinations/polar-regions/",
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
  "HYM Destination Portugal.html": "/destinations/portugal/",
  "HYM Destination Spain.html": "/destinations/spain/",
  "HYM Destination UK Ireland.html": "/destinations/uk-ireland/",
  "HYM Destination Napa Sonoma.html": "/destinations/napa-sonoma/",
  "HYM Destination New Orleans.html": "/destinations/new-orleans/",
  "HYM Destination Canadian Rockies.html": "/destinations/canadian-rockies/",
}
CORE = {
  "HYM Homepage.html": "/",
  "HYM Home.html": "/",
  "HYM About.html": "/about/",
  "HYM Contact.html": "/contact/",
  "HYM FAQ.html": "/faq/",
  "HYM Journal.html": "/travel-journal/",
  "HYM Plan Your Trip.html": "/plan-your-trip/",
  "HYM Privacy Policy.html": "/privacy-policy/",
  "HYM Terms and Conditions.html": "/terms-and-conditions/",
}

def journal_map():
    m = {}
    for f in glob.glob(os.path.join(UP, "*.html")):
        b = os.path.basename(f)
        if b.startswith("HYM") or b in ("Brand Toolkit.html", "Experience-detail.html"):
            continue
        slug = b.replace(".html", "")
        m[b] = f"/travel-journal/{slug}/"
    return m

URLMAP = {}
for d in (EXP, DEST, CORE, journal_map()):
    URLMAP.update(d)

def rewrite_links(content):
    def repl(m):
        href = m.group(1)
        base = href.replace("../", "")
        if base.startswith("journal/"):
            base = base[len("journal/"):]
        frag = ""
        if "#" in base:
            base, frag = base.split("#", 1)
            frag = "#" + frag
        if base in URLMAP:
            return 'href="' + URLMAP[base] + frag + '"'
        return m.group(0)
    return re.sub(r'href="([^"]*\.html[^"]*)"', repl, content)

def fix_assets(content):
    content = content.replace('src="../assets/', 'src="/assets/')
    content = content.replace('src="assets/', 'src="/assets/')
    content = content.replace('href="../assets/', 'href="/assets/')
    return content

def get_inline_css(html):
    return "\n".join(re.findall(r'<style>(.*?)</style>', html, re.S))

def get_meta(html):
    t = re.search(r'<title>(.*?)</title>', html, re.S)
    d = re.search(r'<meta name="description" content="([^"]*)"', html)
    return (t.group(1).strip() if t else ""), (d.group(1) if d else "")

if __name__ == "__main__":
    print("URL map entries:", len(URLMAP), "BASE:", BASE)
