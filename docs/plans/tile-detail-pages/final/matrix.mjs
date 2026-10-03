import fs from 'node:fs'
const D='/home/user/hymt/docs/plans/tile-detail-pages'
const audit=JSON.parse(fs.readFileSync(D+'/audit-results.json','utf8'))
const R=JSON.parse(fs.readFileSync(D+'/remaining-results.json','utf8'))
const tbp=JSON.parse(fs.readFileSync(D+'/inputs/tiles-by-page.json','utf8'))
const rows=[...Object.values(audit).flatMap(p=>p.tiles),...R.wellness.tiles]
const subs=R.consolidated.subjects
const ABBR={'adventure-active-travel':'ADV','all-inclusive-vacations':'AIV','beach-island-escapes':'BCH','cruises':'CRU','culture-immersive-travel':'CUL','family-travel':'FAM','food-wine-travel':'FWT','multigenerational-travel':'MGN','romance-celebration-travel':'ROM','safari-wildlife-travel':'SAF','sports-event-travel':'SPT','wellness-retreat-travel':'WEL'}
const NAME={'adventure-active-travel':'Adventure & Active','all-inclusive-vacations':'All-Inclusive','beach-island-escapes':'Beach & Island','cruises':'Cruises','culture-immersive-travel':'Culture & Immersive','family-travel':'Family','food-wine-travel':'Food & Wine','multigenerational-travel':'Multigenerational','romance-celebration-travel':'Romance & Celebration','safari-wildlife-travel':'Safari & Wildlife','sports-event-travel':'Sports & Event','wellness-retreat-travel':'Wellness Retreat'}
// verified changes from the two-lens review, applied on top of consolidation
const OV={
 'all-inclusive-vacations/event-card/1':{target:'Form CTA (?type=beach) + /destinations/riviera-maya-los-cabos/#places',note:'Verified change: #places (Playa del Carmen to Tulum card), not #itineraries.'},
 'all-inclusive-vacations/event-card/2':{target:'Form CTA (?type=beach) + /destinations/riviera-maya-los-cabos/#places',note:'Verified change: #places (Los Cabos & the Corridor card), not #itineraries.'},
 'beach-island-escapes/event-card/2':{target:'Form CTA (?type=beach) + /destinations/turks-caicos/#places',note:'Verified change: #places (Grace Bay & Providenciales card).'},
 'romance-celebration-travel/event-card/1':{target:'Form CTA (?type=honeymoon), no secondary link',note:'Verified change: secondary link dropped so the occasion card does not pre-empt a destination (same rule as the birthday card).'},
 'cruises/exp-card/1':{target:'/experiences/cruises/mediterranean-small-ship/',note:'Verified change: qualified slug so it does not claim the whole Mediterranean term or overlap yacht charters.'},
 'cruises/event-card/1':{target:'Form CTA (?type=cruise) + interim /travel-journal/mediterranean-october/, then /experiences/cruises/mediterranean-small-ship/#dalmatian-coast',note:'Verified change: interim link to the October Med post.'},
 'cruises/event-card/4':{target:'Form CTA (?type=cruise) + interim /travel-journal/mediterranean-october/, then /experiences/cruises/yacht-charters/#gulets',note:'Verified change: interim link has no fragment (the post has no heading ids).'},
 'family-travel/exp-card/7':{target:'/destinations/orlando/#disney-or-universal',note:'Verified change: lands on a dated Disney-or-Universal comparison section, not the places grid.'},
 'sports-event-travel/exp-card/2':{target:'/experiences/sports-event-travel/golf/',note:'Verified change: no interim link to the Masters report (it answers attending Augusta, not playing golf); stays on the form until the golf page ships.'},
 'sports-event-travel/exp-card/4':{target:'/travel-journal/heli-ski-field-report/',note:"Verified change: rename to 'Heli-Skiing', eyebrow 'British Columbia'; drop Alps and chalet copy unless an Alps page is commissioned."},
 'wellness-retreat-travel/exp-card/5':{note:'Verified change: no interim journal link; stays on the form until the page ships or the tile is replaced.'},
 'safari-wildlife-travel/exp-card/6':{note:'Recommended default (both reviewers): Path B now, swap to Zambia & Victoria Falls.'},
 'multigenerational-travel/exp-card/5':{target:'/destinations/caribbean-mexico/#itineraries',note:'Verified change: lands on the villa-week itineraries; rewrite tile copy around Turks & Caicos and Los Cabos villas now.'},
}
const out=[]
for(const [page,list] of Object.entries(tbp)){
 const arr=Array.isArray(list)?list:[...(list.expCards||list['exp-card']||[]),...(list.eventCards||list['event-card']||[])]
 for(const t of arr){
  const kind=t.kind, idx=t.index
  const a=rows.find(r=>r.page===page&&r.kind===kind&&r.index===idx)
  const s=subs.find(s=>s.tiles.some(x=>x.page===page&&x.kind===kind&&x.index===idx))
  const st=s&&s.tiles.find(x=>x.page===page&&x.kind===kind&&x.index===idx)
  const act=st?st.action:''
  let label
  if(kind==='event-card') label='EXCEPTION: KEEP PLANNING FORM'
  else if(s.targetStatus==='owner-decision') label='NEEDS OWNER DECISION'
  else if(s.targetStatus==='form-exception') label='EXCEPTION: KEEP PLANNING FORM'
  else if(/^RENAME/i.test(act)) label='SPLIT OR RENAME TILE'
  else if(s.targetStatus==='new') label=s.canonicalTarget.startsWith('/destinations/')?'CREATE DESTINATION PAGE':'CREATE EXPERIENCE DETAIL PAGE'
  else if(/REUSE \+ ENHANCE/.test(act)) label='REUSE + ENHANCE'
  else label='REUSE'
  const key=`${page}/${kind}/${idx}`, o=OV[key]||{}
  let target=s.canonicalTarget
  if(kind==='event-card'){const m=act.match(/secondary link -> (\S+)/);target='Form CTA'+(m?' + '+m[1].replace(/[;,]$/,''):'')}
  if(o.target) target=o.target
  const best=(a.candidates||[]).slice().sort((x,y)=>y.fitScore-x.fitScore)[0]
  out.push({id:`${ABBR[page]}-${kind==='exp-card'?'T':'E'}${idx}`,page,exp:NAME[page],kind,label:a.label,eyebrow:a.eyebrow,current:a.currentHref,
   visitor:a.visitorIntent,search:a.searchIntent,existing:best?`${best.url} (fit ${best.fitScore}/3)`:'none',existingType:a.existingPageType,
   target,action:label,reuse:s.targetStatus,template:s.targetStatus==='new'?s.templateIfNew:a.pageTypeOrTemplate,
   decision:act,reason:(o.note?o.note+' ':'')+s.decisionSummary,gaps:a.contentGaps,links:a.internalLinkChanges,crumb:a.breadcrumbNav,schema:a.schemaNotes,
   cannibal:a.cannibalizationRisk,images:a.imageAvailability,priority:s.priority,effort:s.effort,deps:s.ownerDecision||a.dependencies,conf:s.confidence,subject:s.subjectId+' '+s.subjectName})
 }
}
fs.writeFileSync('/tmp/claude-0/-home-user-hymt/f751563b-0cd0-5334-bcaf-d4a6bb14f3c1/scratchpad/matrix.json',JSON.stringify(out))
const c={};out.forEach(r=>{c[r.kind+'|'+r.action]=(c[r.kind+'|'+r.action]||0)+1});console.log(out.length,c)
