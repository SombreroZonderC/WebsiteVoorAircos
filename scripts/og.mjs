// Genereert een deelafbeelding (1200×630) per pagina in public/images/og/. Draai na tekstwijzigingen:
//   node scripts/og.mjs
import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';

const bedrijf = JSON.parse(readFileSync('src/content/instellingen/bedrijf.json', 'utf8'));
const font = readFileSync('node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2').toString('base64');
const logo = readFileSync('public/images/logo-op-donker.svg').toString('base64');

const paginas = [
  { slug: 'home', woord: 'Koel. Warm.', kleur: 'mix', regel: 'Airco & warmtepompen' },
  { slug: 'airconditioning', woord: 'Koel.', kleur: 'koud', regel: 'Airco laten plaatsen' },
  { slug: 'warmtepompen', woord: 'Warm.', kleur: 'warm', regel: 'Warmtepomp: hybride of all-electric' },
  { slug: 'onderhoud', woord: 'Zorgeloos.', kleur: 'koud', regel: 'Onderhoud & service' },
  { slug: 'over-sjoerd', woord: `${bedrijf.jarenErvaring}`, kleur: 'warm', regel: `${bedrijf.eigenaar}, al ${bedrijf.jarenErvaring} jaar in het vak` },
  { slug: 'werkgebied', woord: `Vanuit ${bedrijf.adres.plaats}.`, kleur: 'koud', regel: 'Werkgebied' },
  { slug: 'veelgestelde-vragen', woord: 'Vragen?', kleur: 'wit', regel: 'Veelgestelde vragen' },
  { slug: 'kennisbank', woord: 'Kennis.', kleur: 'koud', regel: 'Kennisbank: uitleg over airco en warmtepompen' },
  { slug: 'kennisbank/hybride-of-all-electric', woord: 'Hybride?', kleur: 'warm', regel: 'Hybride of all-electric warmtepomp?' },
  { slug: 'kennisbank/verwarmen-met-een-airco', woord: 'Warmte?', kleur: 'koud', regel: 'Kun je verwarmen met een airco?' },
  { slug: 'contact', woord: `Bel ${bedrijf.eigenaar.split(' ')[0]}.`, kleur: 'wit', regel: 'Contact & offerte' },
];

const verloop = {
  koud: 'linear-gradient(100deg,#e9f3fc 10%,#8fc1f0 45%,#3a74b0 90%)',
  warm: 'linear-gradient(100deg,#fff1e6 10%,#ff7a2f 45%,#c2410c 90%)',
  mix: 'linear-gradient(100deg,#e9f3fc 5%,#8fc1f0 35%,#ff7a2f 65%,#c2410c 95%)',
  wit: 'linear-gradient(#eef3f5,#eef3f5)',
};

mkdirSync('public/images/og', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const p of paginas) {
  await page.setContent(`<style>
    @font-face{font-family:A;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:100 900;font-stretch:62% 125%}
    body{margin:0;width:1200px;height:630px;background:#05090b;color:#eef3f5;font-family:A;position:relative;overflow:hidden}
    .g{position:absolute;inset:0;background:radial-gradient(45% 60% at 15% 25%,rgba(66,125,184,.5),transparent 70%),radial-gradient(45% 60% at 90% 95%,rgba(234,91,12,.45),transparent 70%)}
    .c{position:absolute;inset:70px 80px}
    img{height:84px}
    .w{font-size:${Math.min(150, Math.round(1040 / (p.woord.length * 0.6)))}px;line-height:.9;font-weight:800;font-stretch:115%;letter-spacing:-.06em;margin:70px 0 0;background:${verloop[p.kleur]};-webkit-background-clip:text;color:transparent}
    .r{font-size:30px;font-stretch:105%;font-weight:600;color:#93a6ae;margin-top:30px}
  </style><div class="g"></div><div class="c"><img src="data:image/svg+xml;base64,${logo}"><div class="w">${p.woord}</div><div class="r">${p.regel} · ${bedrijf.adres.plaats} · ${bedrijf.telefoon.weergave}</div></div>`);
  await page.waitForTimeout(150);
  mkdirSync(`public/images/og/${p.slug}`.replace(/\/[^/]+$/, ''), { recursive: true });
  await page.screenshot({ path: `public/images/og/${p.slug}.jpg`, type: 'jpeg', quality: 85 });
  console.log('og:', p.slug);
}
await browser.close();
