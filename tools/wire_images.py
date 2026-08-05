#!/usr/bin/env python3
"""Wire generated images into content pages + fix onclick links.
Runs against the master copy in /mnt/agents/work/hym-build."""
import os, re, shutil, sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CP = os.path.join(BASE, "src", "content-pages")
IMG = "/assets/img/"

results = []

def load(fn):
    with open(os.path.join(CP, fn), encoding="utf-8") as f:
        return f.read()

def save(fn, html):
    with open(os.path.join(CP, fn), "w", encoding="utf-8") as f:
        f.write(html)

def report(fn, what, count, expected=1):
    ok = count == expected
    results.append((ok, fn, what, count, expected))
    return ok

def bg_style(img, extra=""):
    return f"background-image:url('{IMG}{img}');background-size:cover;background-position:center{extra}"

# ── generic slot rewirers ─────────────────────────────────────────────

def wire_ph_div(html, cls, text_frag, img, expect=1):
    """Replace <div class=CLS ...>TEXT</div> (text-only or span child) with bg-image div."""
    pat = re.compile(
        r'<div class="' + re.escape(cls) + r'"[^>]*>(?:(?!</div>).)*?' + re.escape(text_frag) + r'(?:(?!</div>).)*?</div>',
        re.S)
    new = f'<div class="{cls}" style="{bg_style(img)}"></div>'
    html, n = pat.subn(new, html)
    return html, n

def wire_hero_bg(fn, img, kind="exp"):
    html = load(fn)
    cls = f"{kind}-hero__bg"
    pat = re.compile(r'<div class="' + cls + r'"><span class="' + cls + r'-ph">(?:(?!</div>).)*?</span></div>', re.S)
    html, n = pat.subn(f'<div class="{cls}" style="{bg_style(img)}"></div>', html)
    report(fn, f"{kind} hero -> {img}", n)
    save(fn, html)

# ═══ 1. HOMEPAGE ═══
html = load("home.html")

# hero carousel
old_hero = """  <div class="hero__bg">
    <span class="hero__bg-placeholder">Destination Photography</span>
  </div>"""
slides = ["h-01-maldives-aerial.jpg", "h-02-bora-bora-dawn.jpg",
          "h-03-seychelles-granite.jpg", "h-04-amalfi-golden-hour.jpg"]
new_hero = "\n".join(
    f'  <div class="hero__bg hero__slide{" is-active" if i == 0 else ""}" '
    f'style="background-image:url(\'{IMG}{s}\');background-size:cover;background-position:center"></div>'
    for i, s in enumerate(slides))
n = html.count(old_hero)
html = html.replace(old_hero, new_hero)
report("home.html", "hero carousel slides", n)

# dots after scroll indicator
old_scroll = """  <div class="hero__scroll">
    <span class="hero__scroll-label">Scroll</span>
    <div class="hero__scroll-line"></div>
  </div>"""
dots = old_scroll + """
  <div class="hero__dots">
    <button class="hero__dot is-active" aria-label="Slide 1"></button>
    <button class="hero__dot" aria-label="Slide 2"></button>
    <button class="hero__dot" aria-label="Slide 3"></button>
    <button class="hero__dot" aria-label="Slide 4"></button>
  </div>"""
n = html.count(old_scroll)
html = html.replace(old_scroll, dots)
report("home.html", "hero dots", n)

# carousel style + script at end of file
carousel_add = """
<style>
.hero__slide{opacity:0;transition:opacity 1.8s ease}
.hero__slide.is-active{opacity:1}
.hero__dots{position:absolute;right:52px;bottom:40px;z-index:2;display:flex;gap:8px}
.hero__dot{width:26px;height:2px;background:rgba(245,240,230,.25);border:none;cursor:pointer;padding:0;transition:background .3s}
.hero__dot.is-active{background:var(--gold-500)}
@media(max-width:900px){.hero__dots{right:28px;bottom:28px}}
</style>
<script>
(function(){
  var slides=[].slice.call(document.querySelectorAll('.hero__slide'));
  var dots=[].slice.call(document.querySelectorAll('.hero__dot'));
  if(slides.length<2)return;
  var i=0,t;
  function go(n){i=n;slides.forEach(function(s,k){s.classList.toggle('is-active',k===n)});dots.forEach(function(d,k){d.classList.toggle('is-active',k===n)});}
  function reset(){clearInterval(t);t=setInterval(function(){go((i+1)%slides.length)},6000);}
  dots.forEach(function(d,k){d.addEventListener('click',function(){go(k);reset();});});
  reset();
})();
</script>
"""
html = html.rstrip() + "\n" + carousel_add

# cat-cards
cats = [
    ("Safari Photography", "e-11-elephant-herd-aerial.jpg"),
    ("Romance Photography", "e-13-champagne-overwater-deck.jpg"),
    ("Cruise Photography", "e-07-yacht-cove.jpg"),
    ("Villa &amp; Estate Photography", "e-06-tuscan-landscape.jpg"),
    ("Family Photography", "e-15-children-shallow-water.jpg"),
    ("Mountain Photography", "e-22-heli-ski-landing.jpg"),
    ("Motorsport Photography", "e-21-clifftop-golf.jpg"),
    ("Destination Photography", "e-19-secret-sea-cave.jpg"),  # hidden gems card (only remaining)
]
for text, img in cats:
    html, n = wire_ph_div(html, "cat-card__ph", text, img)
    report("home.html", f"cat-card '{text}' -> {img}", n)

# featured journey
pat = re.compile(r'<div class="featured__image">\s*<span class="featured__image-ph">(?:(?!</div>).)*?</span>\s*</div>', re.S)
html, n = pat.subn(f'<div class="featured__image" style="{bg_style("e-16-safari-vehicle-sunrise.jpg")}"></div>', html)
report("home.html", "featured journey -> e-16", n)

# instagram grid
ig_imgs = ["d-01-maldives-bento.jpg", "e-01-private-sandbar.jpg", "e-03-grand-resort-dusk.jpg",
           "e-05-positano-alley.jpg", "e-09-jungle-yoga-pavilion.jpg", "e-17-tuscan-wine-tasting.jpg"]
pat = re.compile(r'<div class="ig-post"><div class="ig-post__overlay"></div></div>')
n_found = len(pat.findall(html))
it = iter(ig_imgs)
html = pat.sub(lambda m: f'<div class="ig-post" style="{bg_style(next(it))}"><div class="ig-post__overlay"></div></div>', html)
report("home.html", "instagram grid x6", n_found, 6)
save("home.html", html)

# ═══ 2. EXPERIENCE PAGE HEROES ═══
exp_map = {
    "experiences__beach-island-escapes.html": "e-02-beach-golden-hour.jpg",
    "experiences__all-inclusive-vacations.html": "e-04-swim-up-bar.jpg",
    "experiences__cruises.html": "e-08-river-cruise-dawn.jpg",
    "experiences__wellness-retreat-travel.html": "e-10-thermal-pool-mountains.jpg",
    "experiences__adventure-active-travel.html": "e-12-patagonia-trek.jpg",
    "experiences__romance-celebration-travel.html": "e-14-private-beach-dinner.jpg",
    "experiences__family-travel.html": "e-16-safari-vehicle-sunrise.jpg",
    "experiences__food-wine-travel.html": "e-18-mediterranean-terrace-dinner.jpg",
    "experiences__culture-immersive-travel.html": "e-20-remote-village-dawn.jpg",
    "experiences__safari-wildlife-travel.html": "x-01-serengeti-elephants.jpg",
}
for fn, img in exp_map.items():
    wire_hero_bg(fn, img, "exp")

# ═══ 3. DESTINATION PAGE HEROES ═══
dest_map = {
    "destinations__maldives.html": "h-01-maldives-aerial.jpg",
    "destinations__french-polynesia.html": "h-02-bora-bora-dawn.jpg",
    "destinations__italy.html": "h-04-amalfi-golden-hour.jpg",
    "destinations__africa.html": "x-01-serengeti-elephants.jpg",
    "destinations__kenya-tanzania.html": "x-01-serengeti-elephants.jpg",
    "destinations__botswana.html": "e-11-elephant-herd-aerial.jpg",
    "destinations__turks-caicos.html": "d-02-grace-bay.jpg",
    "destinations__caribbean-mexico.html": "d-06-st-barts-harbour.jpg",
    "destinations__bali.html": "e-09-jungle-yoga-pavilion.jpg",
    "destinations__patagonia.html": "e-12-patagonia-trek.jpg",
    "destinations__alaska.html": "e-22-heli-ski-landing.jpg",
    "destinations__canadian-rockies.html": "e-22-heli-ski-landing.jpg",
    "destinations__europe.html": "e-06-tuscan-landscape.jpg",
    "destinations__south-pacific.html": "d-03-bora-bora-otemanu.jpg",
    "destinations__napa-sonoma.html": "e-18-mediterranean-terrace-dinner.jpg",
    "destinations__jordan.html": "x-03-petra-treasury.jpg",
}
for fn, img in dest_map.items():
    wire_hero_bg(fn, img, "dest")

# maldives stay-card (North Malé / Soneva Jani)
html = load("destinations__maldives.html")
pat = re.compile(r'<div class="stay-card__image"[^>]*>(?:(?!</div>).)*?North Malé Atoll(?:(?!</div>).)*?</div>', re.S)
html, n = pat.subn(f'<div class="stay-card__image" style="{bg_style("p-01-soneva-jani.jpg")}"></div>', html, count=1)
report("destinations__maldives.html", "stay-card North Malé -> p-01", n)
save("destinations__maldives.html", html)

# french-polynesia Bora Bora place-card
html = load("destinations__french-polynesia.html")
pat = re.compile(r'<div class="place-card__ph"[^>]*>Destination Photography · Bora Bora</div>', re.S)
html, n = pat.subn(f'<div class="place-card__ph" style="{bg_style("p-03-four-seasons-bora-bora.jpg")}"></div>', html)
report("destinations__french-polynesia.html", "Bora Bora card -> p-03", n)
save("destinations__french-polynesia.html", html)

# ═══ 4. DESTINATIONS HUB ═══
html = load("destinations.html")
hub = [
    ("Destination Photography · The Maldives", "d-01-maldives-bento.jpg"),
    ("Destination Photography · Seychelles", "d-05-seychelles-boulders.jpg"),
    ("Destination Photography · St. Barth's", "d-06-st-barts-harbour.jpg"),
    ("Destination Photography · Turks &amp; Caicos", "d-02-grace-bay.jpg"),
    ("Destination Photography · Botswana · Moremi", "e-11-elephant-herd-aerial.jpg"),
    ("Destination Photography · Serengeti", "x-01-serengeti-elephants.jpg"),
    ("Destination Photography · Amalfi Coast", "d-04-positano-cliffside.jpg"),
    ("Destination Photography · Provence", "e-06-tuscan-landscape.jpg"),
    ("Destination Photography · Bora Bora", "d-03-bora-bora-otemanu.jpg"),
    ("Destination Photography · Bali", "e-09-jungle-yoga-pavilion.jpg"),
    ("Destination Photography · Patagonia", "e-12-patagonia-trek.jpg"),
    ("Destination Photography · Banff", "e-22-heli-ski-landing.jpg"),
    ("Destination Photography · Jordan · Petra", "x-03-petra-treasury.jpg"),
]
for text, img in hub:
    html, n = wire_ph_div(html, "dest-card__ph", text, img)
    report("destinations.html", f"hub card '{text[-22:]}' -> {img}", n)
# final CTA
pat = re.compile(r'<section class="final-cta">')
html, n = pat.subn(
    f'<section class="final-cta" style="background-image:linear-gradient(135deg,rgba(8,15,26,.86),rgba(8,15,26,.55)),url(\'{IMG}f-01-teal-lagoon-cta.jpg\');background-size:cover;background-position:center">',
    html)
report("destinations.html", "final CTA -> f-01", n)
# fix Ask Mark onclick links
html, n = re.subn(r"window\.location\.href='HYM Homepage\.html#contact'", "window.location.href='/plan-your-trip/'", html)
report("destinations.html", "Ask Mark onclick -> /plan-your-trip/", n, 3)
save("destinations.html", html)

# ═══ 5. ABOUT ═══
html = load("about.html")
pat = re.compile(r'<div class="story__photo">\s*<span class="story__photo-ph">(?:(?!</span>).)*?</span>', re.S)
html, n = pat.subn(
    '<div class="story__photo" style="background-image:url(\'/assets/family-amalfi.png\');background-size:cover;background-position:center">',
    html)
report("about.html", "story photo -> family-amalfi.png", n)
pat = re.compile(r'<div class="page-hero__bg"></div>')
html, n = pat.subn(f'<div class="page-hero__bg" style="{bg_style("u-02-agency-lifestyle.jpg")}"></div>', html)
report("about.html", "about hero -> u-02", n)
save("about.html", html)

# ═══ 6. JOURNAL HUB ═══
html = load("travel-journal.html")
# featured
pat = re.compile(r'<div class="journal-featured__image-inner">\s*<span class="journal-featured__image-ph">(?:(?!</div>).)*?</span>\s*</div>', re.S)
html, n = pat.subn(f'<div class="journal-featured__image-inner" style="{bg_style("e-16-safari-vehicle-sunrise.jpg")}"></div>', html)
report("travel-journal.html", "journal featured -> e-16", n)

# fix onclick journal links FIRST (journal/X.html -> /travel-journal/X/)
def fix_onclick(m):
    slug = m.group(1)[:-5]  # strip .html
    return f"window.location.href='/travel-journal/{slug}/'"
html, n = re.subn(r"window\.location\.href='journal/([a-z0-9\-]+\.html)'", fix_onclick, html)
report("travel-journal.html", "onclick journal links", n, 29)

# article card images, keyed by article slug
card_imgs = {
    "botswana-shoulder-season": "e-11-elephant-herd-aerial.jpg",
    "heli-ski-field-report": "e-22-heli-ski-landing.jpg",
    "masters-field-report": "e-21-clifftop-golf.jpg",
    "european-grand-tour-mistake": "e-05-positano-alley.jpg",
    "in-defense-of-slow-travel": "i-02-anniversary-table.jpg",
    "singita-grumeti-field-report": "x-01-serengeti-elephants.jpg",
    "mediterranean-october": "i-03-spring-amalfi.jpg",
    "europe-destination-guide": "h-04-amalfi-golden-hour.jpg",
    "polar-destination-guide": "x-06-polar-iceberg-twilight.jpg",
    "south-america-destination-guide": "e-12-patagonia-trek.jpg",
    "middle-east-destination-guide": "x-03-petra-treasury.jpg",
    "south-pacific-destination-guide": "i-01-maldives-season-guide.jpg",
    "asia-destination-guide": "x-02-bali-rice-terraces.jpg",
    "north-america-destination-guide": "x-05-grand-teton-dawn.jpg",
    "caribbean-mexico-destination-guide": "d-02-grace-bay.jpg",
    "napa-sonoma-winery-route": "x-04-napa-vineyard-dining.jpg",
    "willamette-valley-winery-route": "e-17-tuscan-wine-tasting.jpg",
}
for slug, img in card_imgs.items():
    anchor = f"window.location.href='/travel-journal/{slug}/'"
    i = html.find(anchor)
    if i == -1:
        report("travel-journal.html", f"card {slug}", 0)
        continue
    seg_end = html.find("</div>\n      <div class=\"article-card__body\">", i)
    seg = html[i:seg_end]
    pat = re.compile(r'<div class="article-card__image-inner"[^>]*>\s*<span>(?:(?!</div>).)*?</span>\s*</div>', re.S)
    seg2, n = pat.subn(f'<div class="article-card__image-inner" style="{bg_style(img)}"></div>', seg)
    if n == 1:
        html = html[:i] + seg2 + html[seg_end:]
    report("travel-journal.html", f"card {slug} -> {img}", n)
save("travel-journal.html", html)

# ═══ 7. JOURNAL ARTICLE HERO ALIASES ═══
aliases = {
    "africa-safari.jpg": "x-01-serengeti-elephants.jpg",
    "asia-landscape.jpg": "x-02-bali-rice-terraces.jpg",
    "caribbean-beach.jpg": "d-02-grace-bay.jpg",
    "europe-landscape.jpg": "h-04-amalfi-golden-hour.jpg",
    "middle-east-landscape.jpg": "x-03-petra-treasury.jpg",
    "napa-vineyard-dining.jpg": "x-04-napa-vineyard-dining.jpg",
    "north-america-landscape.jpg": "x-05-grand-teton-dawn.jpg",
    "polar-landscape.jpg": "x-06-polar-iceberg-twilight.jpg",
    "south-america-landscape.jpg": "e-12-patagonia-trek.jpg",
    "south-pacific-landscape.jpg": "h-01-maldives-aerial.jpg",
    "willamette-vineyard.jpg": "e-17-tuscan-wine-tasting.jpg",
}
imgdir = os.path.join(BASE, "public", "assets", "img")
adir = os.path.join(BASE, "public", "assets")
for alias, src in aliases.items():
    sp = os.path.join(imgdir, src)
    ap = os.path.join(adir, alias)
    if os.path.exists(sp):
        shutil.copyfile(sp, ap)
        report("aliases", f"{alias} <- {src}", 1)
    else:
        report("aliases", f"{alias} <- {src} (SOURCE MISSING)", 0)

# ═══ SUMMARY ═══
fails = [r for r in results if not r[0]]
print(f"\n{len(results) - len(fails)}/{len(results)} wiring ops OK")
for ok, fn, what, count, exp in fails:
    print(f"  FAIL {fn}: {what} (found {count}, expected {exp})")
