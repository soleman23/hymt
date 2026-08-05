#!/usr/bin/env python3
"""Build a destination page from data using the exact source template markup."""
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

HEADER = lambda eyebrow, title, sub: f'''  <div style="margin-bottom:40px">
    <div class="label" style="margin-bottom:12px">{eyebrow}</div>
    <h2 style="font-family:var(--font-d);font-size:clamp(24px,3vw,36px);font-weight:700;letter-spacing:-.02em;color:var(--text-primary);margin-bottom:10px">{title}</h2>
    <p style="font-family:var(--font-b);font-size:15px;color:var(--text-secondary);line-height:1.65;max-width:54ch">{sub}</p>
  </div>'''

def build(d):
    places = "\n".join(f'''
    <a class="place-card{" place-card--featured" if p.get("featured") else ""}" href="/plan-your-trip/">
      <div class="place-card__ph" style="background:{p["bg"]}">{p["ph"]}</div>
      <div class="place-card__overlay"></div>
      <div class="place-card__body">
        <div class="place-card__region">{p["region"]}</div>
        <div class="place-card__name">{p["name"]}</div>
        <div class="place-card__desc">{p["desc"]}</div>
      </div>
      <div class="place-card__arrow">Plan This Trip →</div>
    </a>''' for p in d["places"])

    itins = "\n".join(f'''
    <div class="itin-card">
      <div class="itin-image" style="background:{i["bg"]}">{i["ph"]}</div>
      <div class="itin-body">
        <div class="itin-duration">{i["when"]}</div>
        <div class="itin-name">{i["name"]}</div>
        <div class="itin-desc">{i["desc"]}</div>
        <div class="itin-meta"><span>{i["meta1"]}</span><span>{i["meta2"]}</span></div>
        <button class="itin-cta" onclick="window.location='/plan-your-trip/'">Plan This Trip</button>
      </div>
    </div>''' for i in d["itineraries"])

    whys = "\n".join(f'''
    <div class="why-item">
      <div class="why-icon">⬡</div>
      <div class="why-title">{w["title"]}</div>
      <div class="why-desc">{w["desc"]}</div>
    </div>''' for w in d["why"])

    seasons = "\n".join(f'''
    <div class="season-item{" season-item--best" if s.get("best") else ""}">
      <div class="season-name">{s["name"]}</div>
      <div class="season-months">{s["months"]}</div>
      <div class="season-desc">{s["desc"]}</div>
      {"<div class=\"season-badge\">Best Window</div>" if s.get("best") else ""}
    </div>''' for s in d["seasons"])

    faqs = "\n".join(f'''
    <div class="pf-item">
      <div class="pf-q"><span class="pf-q__text">{q}</span><span class="pf-q__icon">+</span></div>
      <div class="pf-a">{a}</div>
    </div>''' for q, a in d["faqs"])

    intro_paras = "".join(f'<p class="intro-body">{p}</p>' for p in d["intro_paras"])

    crumbs = f'<a class="breadcrumb__link" href="/">Home</a>\n    <span class="breadcrumb__sep">›</span>\n    <a class="breadcrumb__link" href="/destinations/">Destinations</a>'
    if d.get("parent"):
        crumbs += f'\n    <span class="breadcrumb__sep">›</span>\n    <a class="breadcrumb__link" href="{d["parent"][1]}">{d["parent"][0]}</a>'
    crumbs += f'\n    <span class="breadcrumb__sep">›</span>\n    <span class="breadcrumb__current">{d["short"]}</span>'

    return f'''<div class="breadcrumb">
  <div class="breadcrumb__inner">
    {crumbs}
  </div>
</div>

<section class="dest-hero">
  <div class="dest-hero__bg"><span class="dest-hero__bg-ph">Hero Photography · {d["short"]}</span></div>
  <img src="/assets/logo.png" class="dest-hero__watermark" alt="" aria-hidden="true">
  <div class="dest-hero__overlay"></div>
  <div class="dest-hero__content">
    <div class="label">{d["eyebrow"]}</div>
    <h1 class="dest-hero__headline">{d["headline"]}</h1>
    <p class="dest-hero__sub">{d["hero_sub"]}</p>
    <div class="dest-hero__ctas">
      <a href="/plan-your-trip/" class="btn-primary-gold">Plan {d["cta_article"]} {d["short"]} Trip</a>
      <a href="#places" class="btn-ghost-gold">Explore {d["short"]} ↓</a>
    </div>
  </div>
</section>

<section class="intro-section">
  <div class="intro-content">
    <div class="label" style="margin-bottom:12px">{d["intro_label"]}</div>
    <h2 class="intro-title">{d["intro_title"]}</h2>
    {intro_paras}
  </div>
  <div class="intro-image">{d["intro_image_ph"]}<span class="intro-image-label">{d["intro_image_label"]}</span></div>
</section>

<section class="places-section" id="places">
{HEADER("Where to Go", d["places_title"], d["places_sub"])}
  <div class="places-grid">{places}
  </div>
</section>

<section class="itineraries-section">
{HEADER("Signature Journeys", "Trips We Plan Often", d["itins_sub"])}
  <div class="itineraries-grid">{itins}
  </div>
</section>

<section class="why-section">
{HEADER("The Details", d["why_title"], d["why_sub"])}
  <div class="why-grid">{whys}
  </div>
</section>

<section class="seasons-strip">
{HEADER("When to Go", d["seasons_title"], d["seasons_sub"])}
  <div class="seasons-grid">{seasons}
  </div>
</section>

<section class="testimonial-section">
  <div class="testimonial-mark">&ldquo;</div>
  <p class="testimonial-quote">{d["testimonial"]}</p>
  <div class="testimonial-attr">{d["testimonial_attr"]}</div>
</section>

<section class="mark-note">
  <div style="margin-bottom:40px">
    <div class="label" style="margin-bottom:12px">A Note from Mark</div>
    <h2 style="font-family:var(--font-d);font-size:clamp(22px,2.5vw,30px);font-weight:700;letter-spacing:-.02em;color:var(--text-primary)">{d["mark_title"]}</h2>
  </div>
  <div class="mark-note__grid">
    <img src="/assets/logo.png" class="mark-note__photo" alt="Hit Your Mark Travel">
    <div>
      <div class="mark-note__name">Mark Sole</div>
      <div class="mark-note__title">Founder &amp; Travel Director · Hit Your Mark Travel</div>
      <p class="mark-note__quote">
        "{d["mark_quote"]}"
      </p>
    </div>
  </div>
</section>

<section class="dest-cta">
  <div class="label" style="margin-bottom:14px">Ready When You Are</div>
  <h2 class="dest-cta__title">{d["cta_title"]}</h2>
  <p class="dest-cta__body">{d["cta_sub"]}</p>
  <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
    <a href="/plan-your-trip/" class="btn-primary-gold">Plan {d["cta_article"]} {d["short"]} Trip</a>
    <a href="/destinations/" class="btn-ghost-gold" style="border-color:rgba(138,155,176,.35)">All Destinations</a>
  </div>
  <p class="dest-cta__note">No booking fees &nbsp;·&nbsp; Response within 24 hours &nbsp;·&nbsp; Fully bespoke</p>
</section>

<section class="page-faq">
  <div class="page-faq__header">
    <div class="page-faq__label">Common Questions</div>
    <h2 class="page-faq__title">{d["short"]} — FAQ</h2>
    <p class="page-faq__sub">{d["faq_sub"]} More detail on the full FAQ page.</p>
  </div>
  <div class="pf-grid">{faqs}
  </div>
  <div class="page-faq__more"><a class="page-faq__more-link" href="/faq/">Full FAQ Page →</a></div>
</section>
'''

def save(slug, d):
    path = os.path.join(BASE, "src/content-pages", f"destinations__{slug}.html")
    html = build(d)
    open(path, "w").write(html)
    print(slug, "built:", len(html))

if __name__ == "__main__":
    print("destination builder ready")
