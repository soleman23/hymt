import fs from 'node:fs';
import path from 'node:path';
const dir = 'src/content-pages';
const files = fs.readdirSync(dir).filter(f => /^experiences__.*\.html$/.test(f));
const out = [];
const strip = s => s.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
for (const f of files) {
  const slug = f.replace(/^experiences__/, '').replace(/\.html$/, '');
  const html = fs.readFileSync(path.join(dir,f),'utf8');
  // exp-card tiles
  const cardRe = /<a class="exp-card(?:[^"]*)" href="([^"]*)"[\s\S]*?<\/a>/g;
  let m; let i=0;
  const secHeads = [...html.matchAll(/<section class="exp-cards-section"[^>]*>([\s\S]*?)<div class="exp-cards/g)].map(x=>strip(x[1]));
  while ((m = cardRe.exec(html))) {
    const block = m[0]; i++;
    const g = re => { const r = re.exec(block); return r ? r[1] : ''; };
    out.push({
      page: slug, kind: 'exp-card', index: i,
      href: m[1],
      region: strip(g(/<div class="exp-card__region">([\s\S]*?)<\/div>/)),
      name: strip(g(/<div class="exp-card__name">([\s\S]*?)<\/div>/)),
      desc: strip(g(/<div class="exp-card__desc">([\s\S]*?)<\/div>/)),
      tags: [...block.matchAll(/<span class="exp-tag">([\s\S]*?)<\/span>/g)].map(x=>strip(x[1])),
      img: g(/<img class="exp-card__img" src="([^"]*)"/),
      alt: g(/<img class="exp-card__img"[^>]*alt="([^"]*)"/),
      arrow: strip(g(/<div class="exp-card__arrow">([\s\S]*?)<\/div>/)),
      sectionHeading: secHeads[0] || '',
    });
  }
  // event cards
  const evRe = /<div class="event-card">([\s\S]*?)<\/div>\s*<\/div>\s*(?=<div class="event-card">|<\/div>)/g;
  let j=0;
  const evBlocks = html.split('<div class="event-card">').slice(1);
  for (const blk of evBlocks) {
    j++;
    const g = re => { const r = re.exec(blk); return r ? r[1] : ''; };
    out.push({
      page: slug, kind: 'event-card', index: j,
      href: g(/<a class="event-cta" href="([^"]*)"/),
      when: strip(g(/<div class="event-when">([\s\S]*?)<\/div>/)),
      name: strip(g(/<div class="event-name">([\s\S]*?)<\/div>/)),
      desc: strip(g(/<div class="event-desc">([\s\S]*?)<\/div>/)),
      meta: [...blk.matchAll(/<div class="event-meta">([\s\S]*?)<\/div>/g)].map(x=>strip(x[1])),
      img: g(/<img class="event-image__img" src="([^"]*)"/),
      ctaLabel: strip(g(/<a class="event-cta"[^>]*>([\s\S]*?)<\/a>/)),
    });
  }
}
fs.writeFileSync(process.argv[2], JSON.stringify(out,null,1));
const byPage = {};
for (const t of out) { byPage[t.page] ??= {exp:0, ev:0}; byPage[t.page][t.kind==='exp-card'?'exp':'ev']++; }
console.log(JSON.stringify(byPage,null,1));
console.log('TOTAL exp-card:', out.filter(t=>t.kind==='exp-card').length, 'event-card:', out.filter(t=>t.kind==='event-card').length);
for (const t of out.filter(t=>t.kind==='exp-card')) console.log(`${t.page}\t#${t.index}\t${t.region}\t${t.name}\t${t.href}\t${t.img}`);
console.log('--- event cards ---');
for (const t of out.filter(t=>t.kind==='event-card')) console.log(`${t.page}\t#${t.index}\t${t.name}\t${t.href}\t${t.meta.join('|')}`);
