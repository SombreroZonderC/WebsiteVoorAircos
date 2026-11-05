import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 412, height: 900 } });
for (const pad of ['/','/airconditioning','/warmtepompen','/onderhoud','/werkgebied','/contact','/over-sjoerd']) {
  await p.goto('http://localhost:4322' + pad); await p.evaluate(() => document.fonts.ready);
  const r = await p.evaluate(() => [...document.querySelectorAll('svg text')].map(t => {
    const svg = t.ownerSVGElement; const vb = svg.viewBox.baseVal; const bb = t.getBBox();
    const uit = vb && vb.width && (bb.x < vb.x - 1 || bb.x + bb.width > vb.x + vb.width + 1 || bb.y < vb.y - 1 || bb.y + bb.height > vb.y + vb.height + 1);
    return uit ? `${t.textContent.trim()} [${Math.round(bb.x)}..${Math.round(bb.x+bb.width)} / vb ${vb.width}]` : null;
  }).filter(Boolean));
  if (r.length) console.log(pad, r);
}
await b.close();
