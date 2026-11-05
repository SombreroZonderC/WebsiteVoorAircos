const { chromium } = require('playwright');
const out = '/tmp/claude-0/-home-user-WebsiteVoorAircos/a8938f9d-48d7-5c69-9723-6a6ebfffa881/scratchpad/review2/';
const pages = ['/', '/airconditioning', '/warmtepompen', '/onderhoud', '/over-sjoerd', '/werkgebied', '/veelgestelde-vragen', '/contact', '/kennisbank', '/kennisbank/hybride-of-all-electric', '/kennisbank/verwarmen-met-een-airco', '/privacy', '/404'];
(async () => {
  const b = await chromium.launch();
  for (const [name, vp] of [['d', {width:1440,height:900}], ['m', {width:390,height:844}]]) {
    const ctx = await b.newContext({ viewport: vp, reducedMotion: 'reduce', deviceScaleFactor: 1 });
    const p = await ctx.newPage();
    const errs = [];
    p.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
    p.on('pageerror', e => errs.push(String(e)));
    for (const u of pages) {
      await p.goto('http://localhost:4322' + u, { waitUntil: 'networkidle' });
      await p.waitForTimeout(300);
      const f = name + '_' + (u === '/' ? 'home' : u.slice(1).replace(/\//g,'_')) + '.png';
      await p.screenshot({ path: out + f, fullPage: true });
      const h = await p.evaluate(() => document.documentElement.scrollHeight);
      const ow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      console.log(f, h, ow ? 'OVERFLOW' : '', errs.splice(0).join(' | '));
    }
    await ctx.close();
  }
  await b.close();
})();
