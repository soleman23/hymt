#!/usr/bin/env python3
"""Generate the plan-your-trip astro wrapper with its pageCss.
Content lives in src/content-pages/plan-your-trip.html (pipeline-owned)."""
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PLAN_CSS = """
.plan-hero{position:relative;margin-top:76px;padding:120px 52px 100px;overflow:hidden;background:var(--navy-900)}
.plan-hero__bg{position:absolute;inset:0}
.plan-hero__overlay{position:absolute;inset:0;background:linear-gradient(135deg,rgba(8,15,26,.9) 0%,rgba(8,15,26,.55) 55%,rgba(8,15,26,.35) 100%)}
.plan-hero__inner{position:relative;max-width:860px}
.plan-hero__label{font-family:var(--font-d);font-size:10px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--gold-500);margin-bottom:18px}
.plan-hero__title{font-family:var(--font-d);font-size:clamp(36px,5.4vw,60px);font-weight:700;letter-spacing:-.03em;color:var(--cream-100);line-height:1.02;margin-bottom:22px}
.plan-hero__sub{font-family:var(--font-b);font-size:16px;color:rgba(245,240,230,.72);line-height:1.75;max-width:60ch}
.plan-section{background:var(--bg-page);padding:72px 52px}
.plan-grid{display:grid;grid-template-columns:1fr 360px;gap:56px;max-width:1200px;margin:0 auto}
.plan-form-wrap{min-width:0}
.plan-aside__block{background:var(--bg-surface);border:1px solid var(--border-subtle);border-left:3px solid var(--gold-500);padding:26px 28px;margin-bottom:24px}
.plan-aside__title{font-family:var(--font-d);font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--gold-500);margin-bottom:16px}
.plan-aside__block p{font-family:var(--font-b);font-size:13.5px;color:var(--text-secondary);line-height:1.8;margin:0 0 10px}
.plan-aside__block p:last-child{margin-bottom:0}
.plan-aside__block a{color:var(--gold-400);text-decoration:none}
.plan-aside__step{display:flex;gap:14px;margin-bottom:14px}
.plan-aside__step:last-child{margin-bottom:0}
.plan-aside__step p{font-size:13px;margin:0}
.plan-aside__num{font-family:var(--font-d);font-size:12px;font-weight:700;color:var(--gold-500);border:1px solid var(--border-gold);width:26px;height:26px;min-width:26px;display:flex;align-items:center;justify-content:center;border-radius:50%}
.plan-aside__muted{color:var(--text-muted)!important;font-size:12px!important}
.inq-success{background:var(--bg-surface);border:1px solid var(--border-gold);padding:48px 44px;text-align:center}
.inq-success__label{font-family:var(--font-d);font-size:10px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--gold-500);margin-bottom:16px}
.inq-success__title{font-family:var(--font-d);font-size:28px;font-weight:700;letter-spacing:-.02em;color:var(--text-primary);margin-bottom:14px}
.inq-success__sub{font-family:var(--font-b);font-size:14px;color:var(--text-secondary);line-height:1.8}
.inq-success__sub a{color:var(--gold-400);text-decoration:none}
.plan-steps{background:var(--bg-surface);border-top:1px solid var(--border-subtle);padding:80px 52px 96px}
.plan-steps__inner{max-width:1100px;margin:0 auto}
.plan-steps__label{font-family:var(--font-d);font-size:10px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--gold-500);margin-bottom:16px}
.plan-steps__title{font-family:var(--font-d);font-size:clamp(28px,4vw,42px);font-weight:700;letter-spacing:-.02em;color:var(--text-primary);margin-bottom:44px}
.plan-steps__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
.plan-step{background:var(--bg-page);border:1px solid var(--border-subtle);padding:32px 30px}
.plan-step__num{font-family:var(--font-d);font-size:26px;font-weight:700;color:var(--gold-500);opacity:.55;margin-bottom:18px}
.plan-step__title{font-family:var(--font-d);font-size:19px;font-weight:700;letter-spacing:-.01em;color:var(--text-primary);margin-bottom:12px}
.plan-step__sub{font-family:var(--font-b);font-size:13.5px;color:var(--text-secondary);line-height:1.75;margin:0}
@media(max-width:1024px){.plan-grid{grid-template-columns:1fr}}
@media(max-width:768px){
.plan-hero,.plan-section,.plan-steps{padding-left:28px;padding-right:28px}
.plan-steps__grid{grid-template-columns:1fr}
}
"""

def esc(s):
    return s.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${").replace("\n", "\\n")

pg = os.path.join(BASE, "src", "pages", "plan-your-trip")
os.makedirs(pg, exist_ok=True)
astro = (
    "---\n"
    'import Base from "../../layouts/Base.astro";\n'
    'import Content from "../../content-pages/plan-your-trip.html?raw";\n'
    f'const pageCss = "{esc(PLAN_CSS)}";\n'
    "---\n"
    '<Base title="Plan Your Trip | Hit Your Mark Travel" description="Tell us where your mark is. Share your trip vision and Mark Sole will reply personally within one business day." canonicalPath="/plan-your-trip/" pageCss={pageCss} showNewsletter={false}>\n'
    "  <Fragment set:html={Content} />\n"
    "</Base>\n"
)
with open(os.path.join(pg, "index.astro"), "w", encoding="utf-8") as f:
    f.write(astro)
print("wrote plan-your-trip/index.astro")
