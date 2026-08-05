#!/usr/bin/env python3
"""Generate WordPress page templates from the static content-pages."""
import os, re

STATIC = "/mnt/agents/work/hym-build/src/content-pages"
THEME = "/mnt/agents/work/hym-wp-theme/hym-travel"

TEMPLATES = [
    ("home.html", "front-page.php", None, True),
    ("experiences.html", "page-templates/experiences.php", "Experiences Hub", True),
    ("destinations.html", "page-templates/destinations.php", "Destinations Hub", True),
    ("about.html", "page-templates/about.php", "About", True),
    ("faq.html", "page-templates/faq.php", "FAQ", True),
    ("contact.html", "page-templates/contact.php", "Contact", False),
    ("plan-your-trip.html", "page-templates/plan-your-trip.php", "Plan Your Trip", False),
    ("privacy-policy.html", "page-templates/privacy-policy.php", "Privacy Policy", False),
    ("terms-and-conditions.html", "page-templates/terms.php", "Terms and Conditions", False),
]

PHP_KEY = "<?php echo esc_attr( get_option( 'hym_web3forms_key', '94312057-04b8-44d8-a7a8-7cb083d999b8' ) ); ?>"

def convert(html):
    html = re.sub(
        r"/assets/img/([a-z0-9\-\.]+\.jpg)",
        lambda m: "<?php echo hym_img( '" + m.group(1) + "' ); ?>",
        html,
    )
    html = html.replace("/assets/logo.png", "<?php echo esc_url( HYM_URI . '/assets/logo.png' ); ?>")
    html = html.replace("/assets/family-amalfi.png", "<?php echo esc_url( HYM_URI . '/assets/family-amalfi.png' ); ?>")
    html = html.replace("94312057-04b8-44d8-a7a8-7cb083d999b8", PHP_KEY)
    return html

for src, tpl, name, newsletter in TEMPLATES:
    with open(os.path.join(STATIC, src), encoding="utf-8") as f:
        html = f.read()
    html = convert(html)
    out = "<?php\n/**\n"
    if name:
        out += " * Template Name: " + name + "\n *\n"
    else:
        out += " * Front page.\n *\n"
    out += " * @package hym-travel\n */\nget_header();\n?>\n"
    out += html.strip() + "\n"
    if newsletter:
        out += "<?php hym_newsletter(); ?>\n"
    out += "<?php get_footer();\n"
    dest = os.path.join(THEME, tpl)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, "w", encoding="utf-8") as f:
        f.write(out)
    print("wrote", tpl, len(out), "bytes")
print("done")
