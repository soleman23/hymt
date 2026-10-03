import fs from 'node:fs'
const SP = '/tmp/claude-0/-home-user-hymt/f751563b-0cd0-5334-bcaf-d4a6bb14f3c1/scratchpad'
const D = '/home/user/hymt/docs/plans/tile-detail-pages'
const R = JSON.parse(fs.readFileSync(D + '/remaining-results.json', 'utf8'))
const M = JSON.parse(fs.readFileSync(SP + '/matrix.json', 'utf8'))
const dec = (s) => String(s ?? '').replace(/&amp;/g, '&').replace(/&#39;/g, "'")
const esc = (s) => dec(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
for (const r of M) for (const k of Object.keys(r)) r[k] = dec(r[k])
const C = R.consolidated
const subs = C.subjects
const ver = Object.fromEntries(R.verified.map((v) => [v.subject.subjectId, v.verdicts]))
const tileIds = (s) => s.tiles.map((t) => M.find((m) => m.page === t.page && m.kind === t.kind && +m.idx === t.index)?.id).filter(Boolean)
M.forEach((m) => { const [p, k, i] = [m.page, m.kind, m.id.match(/\d+$/)[0]]; m.idx = i })

const reviewHtml = (id) => {
  const vs = ver[id]
  if (!vs) return '<p class="muted">Skipped review: high-confidence reuse with no change to the target.</p>'
  return '<ul class="review">' + vs.map((v) => `<li><span class="lens">${v.lens === 'duplication-seo' ? 'Duplication / SEO' : 'Visitor intent'}</span> <span class="verdict v-${v.verdict}">${v.verdict.replace(/-/g, ' ')}</span> ${v.requiredChanges && !/^none/i.test(v.requiredChanges) ? esc(v.requiredChanges) : '<span class="muted">No changes required.</span>'}</li>`).join('') + '</ul>'
}
const subjectCard = (s, withSpec) => `<details class="subj"><summary><span class="sid">${s.subjectId}</span> <b>${esc(s.subjectName)}</b> <code>${esc(s.canonicalTarget)}</code> <span class="pill p-${s.priority}">${s.priority}</span> <span class="tiles">${tileIds(s).join(' · ')}</span></summary>
<div class="subj-body"><p>${esc(s.decisionSummary)}</p>
${withSpec && s.enhancementSpec ? `<h5>Consolidated enhancement</h5><p>${esc(s.enhancementSpec)}</p>` : ''}
${s.wordHeadroom && !/n\/a/i.test(s.wordHeadroom) ? `<p class="meta"><b>Word headroom:</b> ${esc(s.wordHeadroom)}</p>` : ''}
${s.conflictsResolved && !/^none/i.test(s.conflictsResolved) ? `<p class="meta"><b>Conflict resolved:</b> ${esc(s.conflictsResolved)}</p>` : ''}
<h5>Adversarial review</h5>${reviewHtml(s.subjectId)}</div></details>`

const unchanged = subs.filter((s) => s.targetStatus === 'existing-unchanged')
const enhance = subs.filter((s) => s.targetStatus === 'existing-enhance')
const briefCard = (b) => {
  const url = b.url.split(/\s/)[0]
  const s = subs.find((x) => x.canonicalTarget.split(/\s/)[0] === url || (url.includes('mediterranean') && x.subjectId === 'S17') || x.canonicalTarget.startsWith(url))
  const cond = s && s.targetStatus === 'owner-decision'
  const li = (a) => '<ul>' + a.map((x) => `<li>${esc(x)}</li>`).join('') + '</ul>'
  return `<details class="brief"><summary><code>${esc(url)}</code> <b>${esc(b.name.replace(/\s*\(CONDITIONAL.*\)/, ''))}</b> ${cond ? '<span class="pill p-owner">Owner-gated</span>' : ''} <span class="pill p-${s ? s.priority : 'P3'}">${s ? s.priority : ''}</span></summary>
<div class="subj-body"><dl class="kv">
<dt>Serves</dt><dd>${s ? tileIds(s).join(' · ') : ''}</dd>
<dt>Primary intent</dt><dd>${esc(b.primaryIntent)}</dd>
<dt>Working title</dt><dd>${esc(b.workingTitle)}</dd>
<dt>Meta description</dt><dd>${esc(b.metaDescription)} <span class="muted">(${b.descriptionLength} chars)</span></dd>
<dt>H1</dt><dd>${esc(b.h1Direction)}</dd>
<dt>Breadcrumb</dt><dd>${esc(b.breadcrumb)}</dd>
<dt>Template</dt><dd>${esc(b.template)}</dd>
<dt>Schema</dt><dd>${esc(b.schemaNodes)}</dd>
<dt>Answer capsule</dt><dd>${esc(b.answerCapsuleDirection)}</dd>
<dt>Word target</dt><dd>${esc(b.wordTarget)}</dd>
<dt>Effort</dt><dd>${esc(b.effort)}</dd>
<dt>Dependencies</dt><dd>${esc(b.dependencies)}</dd>
<dt>Conflicts and how the page avoids them</dt><dd>${esc(b.conflicts)}</dd>
<dt>Hub, nav, llms.txt</dt><dd>${esc(b.hubAndNavChanges)}</dd>
</dl>
<h5>Sections, in order</h5><ol class="secs">${b.sections.map((x) => `<li>${esc(x.replace(/^\d+\.\s*/, ''))}</li>`).join('')}</ol>
<h5>FAQ candidates</h5>${li(b.faqCandidates)}
<h5>Authoritative sources to research</h5>${li(b.authoritativeSources)}
<h5>Inbound links (pages that must link here)</h5>${li(b.inboundLinksFrom)}
<h5>Outbound links</h5>${li(b.outboundLinksTo)}
<h5>Existing images that fit</h5>${li(b.existingImages)}
<h5>Image gaps</h5>${li(b.imageGaps)}
<h5>NEEDS MARK (first-hand facts only Mark can supply)</h5>${li(b.needsMark)}
${s ? '<h5>Adversarial review</h5>' + reviewHtml(s.subjectId) : ''}
</div></details>`
}
const isDest = (b) => b.url.startsWith('/destinations/')
const briefsDest = R.briefs.filter(isDest), briefsExp = R.briefs.filter((b) => !isDest(b))

const counts = {}; M.forEach((r) => { counts[r.action] = (counts[r.action] || 0) + 1 })
let html = fs.readFileSync(SP + '/template.html', 'utf8')
const fill = {
  UNCHANGED: unchanged.map((s) => subjectCard(s, false)).join('\n'),
  ENHANCE: enhance.map((s) => subjectCard(s, true)).join('\n'),
  NEWDEST: briefsDest.map(briefCard).join('\n'),
  NEWEXP: briefsExp.map(briefCard).join('\n'),
  N_UNCHANGED: unchanged.length, N_ENHANCE: enhance.length,
  RENAMES: C.renamesOrSplits.map((x) => `<li>${esc(x)}</li>`).join(''),
  CROSS: C.crossPageFindings.map((x) => `<li>${esc(x)}</li>`).join(''),
  DROPPED: C.droppedOrMergedRecommendations.map((x) => `<li>${esc(x)}</li>`).join(''),
  EVENTPOLICY: esc(C.eventCardPolicy).replace(/ \((\d)\) /g, '</p><p>($1) ').replace(/ EXCEPTIONS:/, '</p><p><b>Exceptions:</b>'),
  MATRIX: JSON.stringify(M).replace(/</g, '\\u003c'),
  COUNTS: JSON.stringify(counts),
}
for (const [k, v] of Object.entries(fill)) html = html.split(`{{${k}}}`).join(String(v))
const left = html.match(/\{\{[A-Z_]+\}\}/g); if (left) throw new Error('unfilled ' + left)
fs.writeFileSync(SP + '/tile-plan.html', html)
console.log('ok', html.length, counts)
