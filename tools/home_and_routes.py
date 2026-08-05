#!/usr/bin/env python3
"""Extract homepage content + create routes for the 8 new pages."""
import re, os, json, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from convert import UP, BASE, rewrite_links, fix_assets

CONTENT = os.path.join(BASE, "src/content-pages")
PAGES = os.path.join(BASE, "src/pages")

# ── HOMEPAGE ──
html = open(f"{UP}/HYM Homepage.html", encoding="utf-8-sig").read()
m = re.search(r'</nav>', html)
body = html[m.end():]
fm = re.search(r'<footer[\s>]', body)
body = body[:fm.start()]
body = re.sub(r'<section class="newsletter"[\s\S]*?</section>', '', body)
tp = body.find('<div class="tweaks-panel"')
if tp != -1:
    body = body[:tp]
body = re.sub(r'<script>[\s\S]*?</script>', '', body)
body = fix_assets(rewrite_links(body.strip()))
open(os.path.join(CONTENT, "home.html"), "w").write(body)
print("home content:", len(body))

open(os.path.join(PAGES, "index.astro"), "w").write('''---
import Base from "../layouts/Base.astro";
import Content from "../content-pages/home.html?raw";
---
<Base
  title="Hit Your Mark Travel — Bespoke Luxury Journeys"
  description="Hit Your Mark Travel designs bespoke journeys for the time-poor, taste-rich traveler. A lifetime of experience. A global network. And someone who actually picks up the phone."
  active=""
>
  <Fragment set:html={Content} />
</Base>
''')
print("home route created")

# ── NEW EXPERIENCE ROUTES ──
src = open(f"{UP}/HYM Experience Beach.html", encoding="utf-8-sig").read()
exp_css = re.search(r'<style>([\s\S]*?)</style>', src).group(1)

exp_metas = {
 "cruises": ("Cruises | Luxury Ocean, River & Expedition Cruises — Hit Your Mark Travel",
   "Small-ship ocean voyages, European river cruises, expedition sailings to Antarctica and the Galápagos, and private yacht charters — matched to the right vessel, cabin, and season."),
 "romance-celebration-travel": ("Romance Travel | Honeymoons, Anniversaries & Celebrations — Hit Your Mark Travel",
   "Honeymoons, anniversaries, proposals, and milestone celebrations — planned with zero margin for error. The room, the table, the moments, all arranged before you leave."),
}
for slug, (title, desc) in exp_metas.items():
    d = os.path.join(PAGES, "experiences", slug)
    os.makedirs(d, exist_ok=True)
    open(os.path.join(d, "index.astro"), "w").write(f'''---
import Base from "../../../layouts/Base.astro";
import Content from "../../../content-pages/experiences__{slug}.html?raw";
const pageCss = {json.dumps(exp_css)};
---
<Base title="{title}" description="{desc}" active="experiences" pageCss={{pageCss}}>
  <Fragment set:html={{Content}} />
</Base>
''')
    print("route:", slug)

# ── NEW DESTINATION ROUTES ──
src = open(f"{UP}/HYM Destination Japan.html", encoding="utf-8-sig").read()
dest_css = re.search(r'<style>([\s\S]*?)</style>', src).group(1)

dest_metas = {
 "portugal": ("Portugal | Lisbon, Porto & the Douro Valley — Hit Your Mark Travel",
   "Bespoke Portugal journeys — Lisbon's tasca culture, Porto's wine lodges, Douro Valley harvest, the slow Alentejo, and the western Algarve. Tables and quintas booked before you land."),
 "spain": ("Spain | Basque Country, Andalusia & Rioja — Hit Your Mark Travel",
   "Spain by region and by table — San Sebastián's pintxos, Andalusia's Moorish triangle, Rioja's wineries, Galicia's seafood. One region deeply, not five superficially."),
 "uk-ireland": ("UK & Ireland | Scotland, Ireland & England — Hit Your Mark Travel",
   "Scottish Highlands by private driver, Ireland's Wild Atlantic Way, London done properly, and the castle hotels worth booking a year out."),
 "napa-sonoma": ("Napa & Sonoma | Private Wine Country Journeys — Hit Your Mark Travel",
   "Napa and Sonoma done privately — small-producer appointments, vineyard lunches, harvest season timing, and the great tables booked the day they open."),
 "new-orleans": ("New Orleans | Music, Food & Festival Journeys — Hit Your Mark Travel",
   "New Orleans beyond Bourbon Street — Frenchmen Street with music insiders, the restaurants in the right order, Mardi Gras and Jazz Fest planned properly."),
 "canadian-rockies": ("Canadian Rockies | Banff, Lake Louise & Jasper — Hit Your Mark Travel",
   "Banff and Jasper timed right — dawn at Moraine Lake, the Icefields Parkway, larch season's golden window, and the great railway hotels."),
}
for slug, (title, desc) in dest_metas.items():
    d = os.path.join(PAGES, "destinations", slug)
    os.makedirs(d, exist_ok=True)
    open(os.path.join(d, "index.astro"), "w").write(f'''---
import Base from "../../../layouts/Base.astro";
import Content from "../../../content-pages/destinations__{slug}.html?raw";
const pageCss = {json.dumps(dest_css)};
---
<Base title="{title}" description="{desc}" active="destinations" pageCss={{pageCss}}>
  <Fragment set:html={{Content}} />
</Base>
''')
    print("route:", slug)

print("done")
