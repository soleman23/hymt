#!/usr/bin/env python3
"""Build a new experience page from data using the exact source template markup."""
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

HEADER = lambda eyebrow, title, sub: f'''  <div style="margin-bottom:40px">
    <div class="label" style="margin-bottom:12px">{eyebrow}</div>
    <h2 style="font-family:var(--font-d);font-size:clamp(24px,3vw,36px);font-weight:700;letter-spacing:-.02em;color:var(--text-primary);margin-bottom:10px">{title}</h2>
    <p style="font-family:var(--font-b);font-size:15px;color:var(--text-secondary);line-height:1.65;max-width:54ch">{sub}</p>
  </div>'''

def build(d):
    # The 6-card grid. One shape for every experience page — see the
    # .exp-card block in styles/experience.css. Tags are required: a card
    # without them leaves a hole where the pill row sits on every other page.
    countries = "\n".join(f'''
    <a class="exp-card" href="/plan-your-trip/">
      <div class="exp-card__ph" style="background:{c["bg"]}">{c["ph"]}</div>
      <div class="exp-card__overlay"></div>
      <div class="exp-card__body">
        <div class="exp-card__region">{c["region"]}</div>
        <div class="exp-card__name">{c["name"]}</div>
        <div class="exp-card__desc">{c["desc"]}</div>
        <div class="exp-card__tags">{"".join(f'<span class="exp-tag">{t}</span>' for t in c["tags"])}</div>
      </div>
      <div class="exp-card__arrow">Explore &rarr;</div>
    </a>''' for c in d["countries"])

    events = "\n".join(f'''
    <div class="event-card">
      <div class="event-image" style="background:{e["bg"]}">{e["ph"]}</div>
      <div class="event-body">
        <div class="event-when">{e["when"]}</div>
        <div class="event-name">{e["name"]}</div>
        <div class="event-desc">{e["desc"]}</div>
        <div class="event-meta"><span>{e["meta1"]}</span><span>{e["meta2"]}</span></div>
        <button class="event-cta" onclick="window.location='/plan-your-trip/'">Plan This Trip</button>
      </div>
    </div>''' for e in d["events"])

    inclusions = "\n".join(f'''
    <div class="inclusion-item">
      <div class="inclusion-icon">⬡</div>
      <div class="inclusion-title">{i["title"]}</div>
      <div class="inclusion-desc">{i["desc"]}</div>
    </div>''' for i in d["inclusions"])

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

    return f'''<div class="breadcrumb">
  <div class="breadcrumb__inner">
    <a class="breadcrumb__link" href="/">Home</a>
    <span class="breadcrumb__sep">›</span>
    <a class="breadcrumb__link" href="/experiences/">Experiences</a>
    <span class="breadcrumb__sep">›</span>
    <span class="breadcrumb__current">{d["short"]}</span>
  </div>
</div>

<section class="exp-hero">
  <div class="exp-hero__bg"><span class="exp-hero__bg-ph">Hero Photography · {d["short"]}</span></div>
  <img src="/assets/logo.png" class="exp-hero__watermark" alt="" aria-hidden="true">
  <div class="exp-hero__overlay"></div>
  <div class="exp-hero__content">
    <div class="label">{d["eyebrow"]}</div>
    <h1 class="exp-hero__headline">{d["headline"]}</h1>
    <p class="exp-hero__sub">{d["hero_sub"]}</p>
    <div class="exp-hero__ctas">
      <a href="/plan-your-trip/" class="btn-primary-gold">{d["hero_cta1"]}</a>
      <a href="#destinations" class="btn-ghost-gold">Explore Destinations ↓</a>
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

<section class="exp-cards-section" id="destinations">
{HEADER("Where to Go", d["countries_title"], d["countries_sub"])}
  <div class="exp-cards">{countries}
  </div>
</section>

<section class="events-section">
{HEADER("Signature Experiences", "Trips We Plan Often", d["events_sub"])}
  <div class="events-grid">{events}
  </div>
</section>

<section class="inclusions-section">
{HEADER("The Details", d["inclusions_title"], d["inclusions_sub"])}
  <div class="inclusions-grid">{inclusions}
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

<section class="exp-cta">
  <div class="label" style="margin-bottom:14px">Ready When You Are</div>
  <h2 class="exp-cta__title">{d["cta_title"]}</h2>
  <p class="exp-cta__body">{d["cta_sub"]}</p>
  <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
    <a href="/plan-your-trip/" class="btn-primary-gold">{d["hero_cta1"]}</a>
    <a href="/experiences/" class="btn-ghost-gold" style="border-color:rgba(138,155,176,.35)">Explore All Experiences</a>
  </div>
  <p class="exp-cta__note">No booking fees &nbsp;·&nbsp; Response within 24 hours &nbsp;·&nbsp; Fully bespoke</p>
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
    path = os.path.join(BASE, "src/content-pages", f"experiences__{slug}.html")
    html = build(d)
    open(path, "w").write(html)
    print(slug, "built:", len(html))

if __name__ == "__main__":
    print("builder ready")
