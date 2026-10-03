import fs from 'node:fs';
import path from 'node:path';
const root = 'src/pages/destinations';
const out = [];
for (const slug of fs.readdirSync(root)) {
  const f = path.join(root, slug, 'index.astro');
  if (!fs.existsSync(f)) continue;
  const s = fs.readFileSync(f, 'utf8');
  const g = re => { const r = re.exec(s); return r ? r[1] : ''; };
  const html = fs.existsSync(`src/content-pages/destinations__${slug}.html`) ? fs.readFileSync(`src/content-pages/destinations__${slug}.html`,'utf8') : '';
  const ids = [...html.matchAll(/ id="([^"]+)"/g)].map(m=>m[1]).filter(id=>!/^pf-/.test(id));
  const sections = [...html.matchAll(/<section class="([^"]+)"/g)].map(m=>m[1]);
  const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map(m=>m[1].replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim());
  const expLinks = [...new Set([...html.matchAll(/href="(\/experiences\/[^"]*)"/g)].map(m=>m[1]))];
  const destLinks = [...new Set([...html.matchAll(/href="(\/destinations\/[^"]*)"/g)].map(m=>m[1]))];
  const words = html.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().split(' ').length;
  out.push({
    slug, name: g(/name=\{?"([^"]+)"/), region: g(/region=\{\{\s*label:\s*"([^"]+)"/), regionHref: g(/region=\{\{[^}]*href:\s*"([^"]+)"/),
    title: g(/title="([^"]+)"/), description: g(/description="([^"]+)"/),
    heroImage: g(/image:\s*"([^"]+)"/), placeholder: g(/placeholder:\s*"([^"]+)"/),
    eyebrow: g(/eyebrow:\s*"([^"]+)"/), headline: g(/headline:\s*"([^"]+)"/),
    ids, sections, h2s, expLinks, destLinks, words,
  });
}
fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
for (const d of out) console.log(`${d.slug}\t${d.name}\t[${d.region} ${d.regionHref}]\t${d.heroImage || 'PH:'+d.placeholder}\twords=${d.words}\tids=${d.ids.join(',')}\texp=${d.expLinks.join(',')}`);
console.log('\n--- section classes union ---');
const u = {}; for (const d of out) for (const s of d.sections) u[s]=(u[s]||0)+1; console.log(JSON.stringify(u,null,1));
console.log('\n--- h2 sample (maldives) ---'); console.log(out.find(d=>d.slug==='maldives').h2s.join(' | '));
