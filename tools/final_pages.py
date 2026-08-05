#!/usr/bin/env python3
"""Generate legal pages (privacy, terms), robots.txt and sitemap.xml."""
import os, datetime

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://www.hymtravel.com"

LEGAL_CSS = """
.breadcrumb {
  background:var(--bg-surface);border-bottom:1px solid var(--border-subtle);
  padding:14px 52px;margin-top:76px;
}
.breadcrumb__inner {
  display:flex;align-items:center;gap:10px;
  font-family:var(--font-d);font-size:10px;font-weight:600;
  letter-spacing:.12em;text-transform:uppercase;
}
.breadcrumb__link { color:var(--text-muted);text-decoration:none;transition:color .15s }
.breadcrumb__link:hover { color:var(--gold-400) }
.breadcrumb__sep { color:var(--text-muted);font-size:10px }
.breadcrumb__current { color:var(--gold-500) }
.legal-hero {
  background:var(--bg-surface);border-bottom:1px solid var(--border-subtle);
  padding:80px 52px 72px;
}
.legal-hero__inner { max-width:860px }
.legal-hero__label {
  font-family:var(--font-d);font-size:10px;font-weight:700;
  letter-spacing:.2em;text-transform:uppercase;color:var(--gold-500);margin-bottom:18px;
}
.legal-hero__title {
  font-family:var(--font-d);font-size:clamp(34px,5vw,54px);font-weight:700;
  letter-spacing:-.03em;color:var(--text-primary);line-height:1.02;margin-bottom:22px;
}
.legal-hero__sub {
  font-family:var(--font-b);font-size:16px;color:var(--text-secondary);
  line-height:1.75;max-width:62ch;
}
.legal-body { background:var(--bg-page);padding:64px 52px 96px }
.legal-body__inner { max-width:780px }
.legal-updated {
  font-family:var(--font-d);font-size:10px;font-weight:600;
  letter-spacing:.14em;text-transform:uppercase;color:var(--text-muted);
  margin-bottom:40px;padding-bottom:20px;border-bottom:1px solid var(--border-subtle);
}
.legal-body h2 {
  font-family:var(--font-d);font-size:22px;font-weight:700;
  letter-spacing:-.01em;color:var(--text-primary);
  margin:44px 0 16px;
}
.legal-body h2:first-of-type { margin-top:0 }
.legal-body p {
  font-family:var(--font-b);font-size:14px;color:var(--text-secondary);
  line-height:1.85;margin-bottom:14px;
}
.legal-body ul {
  list-style:none;padding:0;margin:0 0 14px;
}
.legal-body ul li {
  font-family:var(--font-b);font-size:14px;color:var(--text-secondary);
  line-height:1.8;padding-left:18px;position:relative;margin-bottom:6px;
}
.legal-body ul li::before {
  content:'\\2014';position:absolute;left:0;color:var(--gold-500);font-size:11px;
}
.legal-body a { color:var(--gold-400);text-decoration:none;border-bottom:1px solid rgba(201,168,76,.3) }
.legal-body a:hover { border-bottom-color:var(--gold-400) }
.legal-note {
  background:var(--accent-subtle);border:1px solid var(--border-gold);
  border-left:3px solid var(--gold-500);
  padding:16px 20px;margin:20px 0;
}
.legal-note p { font-size:13px;margin:0 }
@media(max-width:960px){
  .breadcrumb,.legal-hero,.legal-body { padding-left:28px;padding-right:28px }
}
"""

PRIVACY_BODY = """
<div class="breadcrumb"><div class="breadcrumb__inner">
  <a class="breadcrumb__link" href="/">Home</a>
  <span class="breadcrumb__sep">›</span>
  <span class="breadcrumb__current">Privacy Policy</span>
</div></div>

<div class="legal-hero"><div class="legal-hero__inner">
  <div class="legal-hero__label">Privacy Policy</div>
  <h1 class="legal-hero__title">Your Privacy, Handled<br>With the Same Care as Your Trip</h1>
  <p class="legal-hero__sub">You trust us with your travel dreams &mdash; and, inevitably, some personal information. This policy explains what we collect, why we collect it, who we share it with, and the choices you have. Plain language, no fine-print games.</p>
</div></div>

<div class="legal-body"><div class="legal-body__inner">
  <div class="legal-updated">Last updated: July 2026</div>

  <h2>Who We Are</h2>
  <p>Hit Your Mark Travel is an independent luxury travel advisory founded by Mark Sole. Throughout this policy, "we," "us," and "our" refer to Hit Your Mark Travel. You can reach us at any time at <a href="mailto:mark@hymtravel.com">mark@hymtravel.com</a> or <a href="tel:+14085681404">(408) 568-1404</a>.</p>

  <h2>What We Collect</h2>
  <p>We collect only the information needed to plan and book exceptional travel:</p>
  <ul>
    <li><strong>Inquiry details</strong> &mdash; when you submit our Plan Your Trip or contact forms: your name, email address, phone number, trip type, destinations, dates, budget range, party size, and anything you tell us about your vision for the trip.</li>
    <li><strong>Newsletter signups</strong> &mdash; your email address, so we can send you the travel notes you asked for.</li>
    <li><strong>Booking information</strong> &mdash; when you decide to travel with us, we collect the details suppliers require (full legal names, dates of birth, passport details, dietary or accessibility needs, loyalty numbers, and payment details passed to the relevant supplier or secure payment processor).</li>
    <li><strong>Basic site data</strong> &mdash; standard, non-identifying server logs (pages visited, browser type, approximate region) used to keep the site fast and secure.</li>
  </ul>

  <h2>How We Use It</h2>
  <ul>
    <li>To respond to your inquiry and design your itinerary.</li>
    <li>To make and manage bookings with hotels, cruise lines, tour operators, airlines, and other travel suppliers on your behalf.</li>
    <li>To send trip documents, confirmations, and on-trip support communications.</li>
    <li>To send our newsletter and occasional notes we think you'll value &mdash; only if you've asked for them, and every email includes an unsubscribe link.</li>
    <li>To meet legal, tax, and regulatory obligations, including Seller of Travel compliance.</li>
  </ul>

  <h2>Who We Share It With</h2>
  <p>We never sell your personal information. We share it only where necessary:</p>
  <ul>
    <li><strong>Travel suppliers</strong> &mdash; hotels, cruise lines, tour operators, transfer companies, and insurers, strictly as needed to confirm and operate your booking. Their own privacy policies apply to how they handle your data.</li>
    <li><strong>Service providers</strong> &mdash; our website forms are processed by Web3Forms, and our email is delivered through standard business email providers. These processors handle data only to deliver the service.</li>
    <li><strong>Legal requirements</strong> &mdash; if required by law, regulation, or valid legal process.</li>
  </ul>

  <h2>Cookies &amp; Analytics</h2>
  <p>This site is designed to be light on tracking. We do not use advertising cookies or sell browsing behavior. If we add privacy-respecting analytics in the future, we will update this policy before doing so.</p>

  <h2>How Long We Keep It</h2>
  <p>Inquiry emails and form submissions are kept as long as needed to work with you and for a reasonable period afterward in case you return to an earlier trip idea. Booking records are retained for the period required by tax, accounting, and Seller of Travel regulations. You may ask us to delete your information at any time (see below), subject to those legal retention requirements.</p>

  <h2>Security</h2>
  <p>We limit access to your information to the people planning your trip, use reputable providers for email and form processing, and never store full payment card numbers on this website. No method of transmission over the internet is 100% secure, but we treat your information the way we'd want ours treated.</p>

  <h2>Your Rights</h2>
  <p>Wherever you live, you may ask us to:</p>
  <ul>
    <li>Confirm what personal information we hold about you.</li>
    <li>Correct anything that's inaccurate.</li>
    <li>Delete your information, subject to legal retention requirements.</li>
    <li>Stop marketing emails at any time &mdash; one click on any unsubscribe link does it.</li>
  </ul>
  <p>California residents have additional rights under the CCPA/CPRA, including the right to know, delete, and correct personal information, and the right to non-discrimination for exercising those rights. We do not sell or "share" (as defined by the CPRA) your personal information. To exercise any of these rights, email <a href="mailto:mark@hymtravel.com">mark@hymtravel.com</a>.</p>

  <h2>Children</h2>
  <p>Our services are directed to adults. We do not knowingly collect personal information from children under 13. Family trip details for minors are provided by their parents or guardians as part of a booking.</p>

  <h2>Changes to This Policy</h2>
  <p>If we update this policy, we'll post the new version here with a revised "last updated" date. Significant changes will be flagged on the page.</p>

  <h2>Contact</h2>
  <div class="legal-note">
    <p>Questions about this policy or your information? Email <a href="mailto:mark@hymtravel.com">mark@hymtravel.com</a> or call <a href="tel:+14085681404">(408) 568-1404</a>. Hit Your Mark Travel is a registered Seller of Travel: California 2165910-50, Washington 605920581, Florida ST46122.</p>
  </div>
</div></div>
"""

TERMS_BODY = """
<div class="breadcrumb"><div class="breadcrumb__inner">
  <a class="breadcrumb__link" href="/">Home</a>
  <span class="breadcrumb__sep">›</span>
  <span class="breadcrumb__current">Terms &amp; Conditions</span>
</div></div>

<div class="legal-hero"><div class="legal-hero__inner">
  <div class="legal-hero__label">Terms &amp; Conditions</div>
  <h1 class="legal-hero__title">The Agreement Behind<br>Every Great Trip</h1>
  <p class="legal-hero__sub">These terms govern the travel planning and booking services provided by Hit Your Mark Travel. They're written to be read &mdash; please do read them before you book, because they explain how the travel industry actually works and where responsibilities sit.</p>
</div></div>

<div class="legal-body"><div class="legal-body__inner">
  <div class="legal-updated">Last updated: July 2026</div>

  <h2>1. Our Role</h2>
  <p>Hit Your Mark Travel acts as your travel advisor and as an agent for the independent travel suppliers &mdash; hotels, cruise lines, tour operators, airlines, transfer companies, and insurers &mdash; that provide your travel services. We do not own, operate, or control those suppliers. When you book through us, you enter into a contract with each supplier, governed by that supplier's own terms and conditions.</p>

  <h2>2. Quotes, Pricing &amp; Availability</h2>
  <ul>
    <li>Quotes are estimates based on availability and pricing at the time they're given. Prices are not guaranteed until a deposit or full payment is received and confirmed by the supplier.</li>
    <li>Prices may change due to currency fluctuations, supplier surcharges, taxes, fuel surcharges, or availability. We'll always tell you before confirming if a price has changed.</li>
    <li>We work hard to ensure the information on this website and in our proposals is accurate, but errors can occur; we reserve the right to correct pricing or descriptive errors, including after a quote is issued but before booking is confirmed.</li>
  </ul>

  <h2>3. Payments</h2>
  <p>Deposit and payment schedules are set by each supplier and will be clearly communicated before you commit. Payments are processed by the supplier or its authorized payment processor. Failure to pay by a due date may result in cancellation of the booking and applicable penalties.</p>

  <h2>4. Cancellations, Changes &amp; Refunds</h2>
  <p>Cancellation and change policies are set by each supplier and vary widely &mdash; from fully refundable to completely non-refundable. We will always outline the key deadlines and penalties for your specific itinerary before you book. Our role in any cancellation or change is to advocate for you with the supplier, but refunds are ultimately governed by the supplier's terms.</p>

  <h2>5. Planning Fees</h2>
  <p>Where a planning or consultation fee applies, it will be disclosed and agreed in writing before we begin detailed itinerary work. Planning fees compensate the research, design, and booking management that goes into a bespoke trip and are non-refundable once work has begun.</p>

  <h2>6. Travel Documents &amp; Entry Requirements</h2>
  <p>You are responsible for holding valid travel documents: passports (typically valid at least six months beyond your return date), visas, vaccination certificates, and any other entry requirements for your destinations. We'll flag known requirements as a courtesy, but final responsibility rests with the traveler. We strongly recommend verifying requirements with the relevant consulates or official government sources.</p>

  <h2>7. Travel Insurance</h2>
  <p>We strongly recommend comprehensive travel insurance covering cancellation, interruption, medical expenses, evacuation, and baggage. If you decline coverage, you acknowledge that you may be personally responsible for losses that insurance would have covered. We can introduce you to insurance options; the policy contract is between you and the insurer.</p>

  <h2>8. Health, Safety &amp; Local Conditions</h2>
  <p>Travel involves inherent risks &mdash; from weather and natural events to political conditions, strikes, and health advisories. We monitor conditions for our travelers and share what we know, but we cannot guarantee conditions in any destination. Government advisories (such as those from the U.S. Department of State) are available to all travelers and worth reviewing for any international trip.</p>

  <h2>9. Limitation of Liability</h2>
  <p>As an agent for independent suppliers, Hit Your Mark Travel is not liable for the acts, errors, omissions, representations, warranties, breaches, or negligence of any supplier, nor for personal injury, property damage, delay, or other loss arising from supplier services or events beyond our reasonable control, including force majeure events such as natural disasters, pandemics, war, terrorism, or government action. Our liability, if any, is limited to the planning fees paid to us for the trip in question.</p>

  <h2>10. Seller of Travel Registrations</h2>
  <div class="legal-note">
    <p>Hit Your Mark Travel is a registered Seller of Travel: <strong>California 2165910-50</strong> &middot; <strong>Washington 605920581</strong> &middot; <strong>Florida ST46122</strong>. Registration as a seller of travel does not constitute approval by the State of California. California law requires certain sellers of travel to have a trust account or bond; this business participates in the Travel Consumer Restitution Corporation (TCRC).</p>
  </div>

  <h2>11. Website Content</h2>
  <p>Destination descriptions, journal articles, and itineraries on this website are provided for inspiration and general information. They reflect conditions and prices at the time of writing and may change. Nothing on this site constitutes a binding offer until confirmed in a written proposal.</p>

  <h2>12. Governing Law</h2>
  <p>These terms are governed by the laws of the State of California, without regard to conflict-of-law principles. Any dispute arising from our services will be resolved in the courts of California, unless otherwise required by law.</p>

  <h2>13. Contact</h2>
  <div class="legal-note">
    <p>Questions about these terms? Email <a href="mailto:mark@hymtravel.com">mark@hymtravel.com</a> or call <a href="tel:+14085681404">(408) 568-1404</a>.</p>
  </div>
</div></div>
"""


def css_block(s):
    return s.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${").replace("\n", "\\n")


def write_legal(slug, title_tag, desc, body):
    cp = os.path.join(BASE, "src", "content-pages", f"{slug}.html")
    with open(cp, "w", encoding="utf-8") as f:
        f.write(body.strip() + "\n")
    pg = os.path.join(BASE, "src", "pages", slug)
    os.makedirs(pg, exist_ok=True)
    astro = (
        "---\n"
        'import Base from "../../layouts/Base.astro";\n'
        f'import Content from "../../content-pages/{slug}.html?raw";\n'
        f'const pageCss = "{css_block(LEGAL_CSS)}";\n'
        "---\n"
        f'<Base title="{title_tag}" description="{desc}" canonicalPath="/{slug}/" '
        'pageCss={pageCss} showNewsletter={false}>\n'
        "  <Fragment set:html={Content} />\n"
        "</Base>\n"
    )
    with open(os.path.join(pg, "index.astro"), "w", encoding="utf-8") as f:
        f.write(astro)
    print("wrote", slug)


write_legal(
    "privacy-policy",
    "Privacy Policy | Hit Your Mark Travel",
    "How Hit Your Mark Travel collects, uses, and protects your personal information &mdash; plain language, no fine-print games.",
    PRIVACY_BODY,
)
write_legal(
    "terms-and-conditions",
    "Terms &amp; Conditions | Hit Your Mark Travel",
    "The terms governing travel planning and booking services from Hit Your Mark Travel, a registered Seller of Travel (CA 2165910-50, WA 605920581, FL ST46122).",
    TERMS_BODY,
)

# ── plan-your-trip (regenerate after any pages-dir wipe) ──
import subprocess
subprocess.run(
    ["python3", os.path.join(os.path.dirname(os.path.abspath(__file__)), "plan_page.py")],
    check=True,
)

# ── robots.txt ──
pub = os.path.join(BASE, "public")
os.makedirs(pub, exist_ok=True)
with open(os.path.join(pub, "robots.txt"), "w", encoding="utf-8") as f:
    f.write(
        "User-agent: *\nAllow: /\n\n"
        f"Sitemap: {SITE}/sitemap.xml\n"
    )
print("wrote robots.txt")

# ── sitemap.xml ──
pages_root = os.path.join(BASE, "src", "pages")
routes = []
for dirpath, _dirs, files in os.walk(pages_root):
    if "index.astro" in files:
        rel = os.path.relpath(dirpath, pages_root)
        route = "/" if rel == "." else "/" + rel.replace(os.sep, "/") + "/"
        routes.append(route)
routes.sort()


def prio(r):
    if r == "/":
        return "1.0"
    if r in ("/plan-your-trip/", "/experiences/", "/destinations/"):
        return "0.9"
    if r.startswith("/experiences/") or r.startswith("/destinations/"):
        return "0.8"
    if r == "/travel-journal/":
        return "0.7"
    if r.startswith("/travel-journal/"):
        return "0.6"
    if r in ("/privacy-policy/", "/terms-and-conditions/"):
        return "0.2"
    return "0.7"


today = datetime.date.today().isoformat()
items = "\n".join(
    f"  <url><loc>{SITE}{r}</loc><lastmod>{today}</lastmod>"
    f"<changefreq>{'weekly' if r == '/' or r == '/travel-journal/' else 'monthly'}</changefreq>"
    f"<priority>{prio(r)}</priority></url>"
    for r in routes
)
with open(os.path.join(pub, "sitemap.xml"), "w", encoding="utf-8") as f:
    f.write(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"{items}\n</urlset>\n"
    )
print(f"wrote sitemap.xml with {len(routes)} routes")
