// Maakt de pictogrammen voor telefoons en oudere browsers uit public/favicon.svg:
//   node scripts/iconen.mjs
// apple-touch-icon.png (180), icon-192.png, icon-512.png en favicon.ico (32, PNG in een ICO-omhulsel).
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';

const svg = readFileSync('public/favicon.svg', 'utf8');
// Vierkant zonder afgeronde hoeken: iOS en Android snijden zelf hun vorm uit.
const vol = svg.replace(/rx="\d+"/, 'rx="0"');

const browser = await chromium.launch();
const page = await browser.newPage();
async function png(grootte, bron) {
  await page.setViewportSize({ width: grootte, height: grootte });
  await page.setContent(`<style>*{margin:0}svg{display:block;width:${grootte}px;height:${grootte}px}</style>${bron}`);
  return page.screenshot({ type: 'png', omitBackground: true });
}

writeFileSync('public/apple-touch-icon.png', await png(180, vol));
writeFileSync('public/images/icon-192.png', await png(192, vol));
writeFileSync('public/images/icon-512.png', await png(512, vol));

// ICO met één PNG-afbeelding van 32×32 (sinds Windows Vista toegestaan)
const klein = await png(32, svg);
const kop = Buffer.alloc(22);
kop.writeUInt16LE(1, 2); // type: icoon
kop.writeUInt16LE(1, 4); // aantal afbeeldingen
kop.writeUInt8(32, 6); // breedte
kop.writeUInt8(32, 7); // hoogte
kop.writeUInt16LE(1, 10); // kleurvlakken
kop.writeUInt16LE(32, 12); // bits per pixel
kop.writeUInt32LE(klein.length, 14);
kop.writeUInt32LE(22, 18); // begin van de afbeelding
writeFileSync('public/favicon.ico', Buffer.concat([kop, klein]));

await browser.close();
console.log('Pictogrammen gemaakt in public/.');
