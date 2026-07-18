# Hit Your Mark Travel — Hostinger Deployment Guide

Two complete deliverables were built for you. Pick one to launch; you can switch later.

| | **Option A — Static Site** | **Option B — WordPress Theme** |
|---|---|---|
| File | `hymtravel-static-site.zip` | `hym-travel-wordpress-theme.zip` |
| What it is | The complete 98-page site, ready to serve | Design system + core page templates for WordPress |
| Pages live on day one | All 98 (every destination, experience, journal article) | Core pages (home, hubs, about, FAQ, contact, plan, legal); detail pages and journal posts are added in wp-admin over time |
| Editing | Edit HTML directly (Cursor/AI) | Edit in WordPress admin |
| Speed / maintenance | Fastest possible; zero maintenance | Slightly heavier; plugin/core updates |
| Best if | You want the full site live this week | You want a CMS long-term |

**Recommendation: launch Option A now.** It is the whole site, pixel-finished, with all images in place. Option B is there when you want self-serve editing.

---

## Option A — Deploy the static site (≈15 minutes)

### 1. Upload
1. Hostinger hPanel → **Files → File Manager** → open `public_html`.
2. Delete Hostinger's default `index.php`/placeholder files.
3. Upload `hymtravel-static-site.zip` into `public_html`.
4. Right-click the zip → **Extract**. The contents (`index.html`, folders like `destinations/`, `assets/`, `sitemap.xml`, `robots.txt`) must sit **directly inside `public_html`** — not in a subfolder. Delete the zip afterward.

(Alternative: FTP with the credentials in hPanel → Files → FTP Accounts.)

> **`.htaccess` is already included** at the zip root. It forces HTTPS, redirects www → non-www, enables gzip compression, sets long cache lifetimes on your images, adds security headers, and routes the custom 404 page. Hostinger runs LiteSpeed, which reads `.htaccess` — no extra config needed. Just make sure it extracts into `public_html` with everything else (it's a hidden dotfile, so enable "show hidden files" in File Manager to see it).

### 2. Point the domain
- If `hymtravel.com` is registered **at Hostinger**: hPanel → Domains → assign to this hosting plan. Done.
- If registered elsewhere (e.g. GoDaddy/Namecheap): either change nameservers to Hostinger's (shown in hPanel → Domains → DNS) — simplest — or create an **A record** pointing `@` and `www` to your hosting IP (hPanel → Hosting Details).

### 3. SSL (HTTPS)
hPanel → **Security → SSL** → Install the **free Let's Encrypt** certificate on the domain. Hostinger's "Force HTTPS" toggle and the `.htaccess` redirect both do the same job — enable the hPanel toggle and the site's HTTPS is locked in from every angle. Verify `https://hymtravel.com` loads with the padlock.

### 4. Activate the forms (Web3Forms key)
Forms currently carry the placeholder `YOUR_WEB3FORMS_KEY`.
1. Go to [web3forms.com](https://web3forms.com) → enter **mark@hymtravel.com** → copy the access key they email you.
2. Replace the placeholder in all HTML files. Fastest way: hPanel → **Files → FTP** + any editor, or SSH (`find public_html -name "*.html" -exec sed -i 's/YOUR_WEB3FORMS_KEY/PASTE_KEY_HERE/g' {} +`). The key appears in the newsletter form on nearly every page plus the two inquiry forms (96 files total).
3. Test: submit the Plan Your Trip form — it should land in mark@hymtravel.com within a minute. **Check spam on the first one** and mark it "not spam."

### 5. Post-launch
- Google Search Console → add property → submit `https://hymtravel.com/sitemap.xml`.
- `robots.txt` is already in place.
- Email: set up mark@hymtravel.com in hPanel → Emails (or point MX to Google Workspace if you prefer Gmail).

---

## Option B — Deploy WordPress (≈45 minutes)

### 1. Install WordPress
hPanel → **Websites → Auto Installer → WordPress**. Use the same domain, admin email mark@hymtravel.com. Then SSL as above.

### 2. Server config (already handled)
Hostinger's WordPress auto-installer writes its own working `.htaccess` and `wp-config.php` — you don't need to touch either. The theme zip includes `htaccess-wordpress-reference.txt` with optional hardening (blocks xmlrpc brute-force, protects wp-config, disables directory browsing) you can merge in later; it's not required to go live.

### 3. Install the theme
WP Admin → **Appearance → Themes → Add New → Upload Theme** → choose `hym-travel-wordpress-theme.zip` → Install → **Activate**.

### 4. Create the pages
In **Pages → Add New**, create these and assign the template in the Page sidebar (Template dropdown):

| Page (title) | Slug | Template |
|---|---|---|
| Home | home | *(any — front-page.php applies automatically)* |
| Experiences | experiences | Experiences Hub |
| Destinations | destinations | Destinations Hub |
| About | about | About |
| FAQ | faq | FAQ |
| Contact | contact | Contact |
| Plan Your Trip | plan-your-trip | Plan Your Trip |
| Privacy Policy | privacy-policy | Privacy Policy |
| Terms & Conditions | terms-and-conditions | Terms and Conditions |
| Travel Journal | travel-journal | *(default — set as Posts page)* |

Then **Settings → Reading**: Homepage = *Home* (static page), Posts page = *Travel Journal*.
**Settings → Permalinks**: choose **Post name**.

### 5. Menu
**Appearance → Menus** → create "Primary" with: Experiences, Destinations, About, Travel Journal, Contact → assign to **Primary Navigation**.

### 6. Forms key
**Settings → General → Web3Forms Access Key** → paste your key → Save. (Same web3forms.com process as Option A.)

### 7. Build out detail pages & journal over time
- **Experience/destination detail pages**: Add Page → set parent (Experiences or Destinations) → assign **Experience Detail** or **Destination Detail** template → set a Featured Image (it becomes the hero) → paste content. The 47 generated images are inside the theme at `assets/img/` and also in the static zip — upload via Media Library as needed.
- **Journal**: Posts → Add New. Featured image = hero; Excerpt = the deck under the headline; Categories drive the filter bar on the journal index.

---

## Notes on what was built

- **98 pages**, all interlinked, SEO meta/canonicals/JSON-LD in place, `sitemap.xml` + `robots.txt` included.
- **47 images produced** from your Image Prompt Library (plus 6 supplemental heroes to cover sections the library didn't map). All follow the brand rules: golden-hour editorial photography, no faces, no text overlays. See `hymtravel-image-production-checklist.csv` for exactly where each image is used.
- **The About page photo is your real family photo** (from the files you provided) — no fake people anywhere on the site.
- **Forms**: Plan Your Trip + Contact + newsletter all run on Web3Forms (free, no backend needed). Just add the key (Option A step 4, or Option B step 6).
- **E-commerce/booking**: not included per your call — the structure leaves room to add a booking tool later.
- Phone shown site-wide: (408) 568-1404 · mark@hymtravel.com · Seller of Travel numbers in the footer (CA 2165910-50, WA 605920581, FL ST46122).

## If you want changes
- **Static site**: open the extracted files in Cursor and ask for the change — the design system lives in one stylesheet per page's `<style>` block plus shared CSS. Re-upload changed files.
- Keep a local copy of the unzipped static site as your working master.
