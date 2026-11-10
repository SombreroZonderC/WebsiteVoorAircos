# The CoolFactory – website

Website voor The CoolFactory (Sjoerd Moller, Heeten): airconditioning en warmtepompen van Mitsubishi Electric.
Statische site gebouwd met [Astro](https://astro.build).

## Starten

Vereist Node 22 (zie `.nvmrc`).

```bash
npm install
npm run dev       # ontwikkelserver op http://localhost:4321
npm run build     # bouwt de site naar dist/
npm run preview   # bekijkt de gebouwde site
npx astro check   # type- en schemacontrole
npm test          # Playwright-tests op de gebouwde site (eerst npm run build)
npm run og        # deelafbeeldingen opnieuw maken (public/images/og/)
npm run demo      # geanonimiseerde demo (fictief bedrijf) in ../demo-build/pub
```

Tests draaien met de vooraf geïnstalleerde Chromium: `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers npm test` (in CI installeert de workflow de browser zelf).

## Waar staat wat

| Wat | Waar |
|---|---|
| Bedrijfsgegevens (telefoon, adres, KvK, werkgebied, Google-score …) | `src/content/instellingen/bedrijf.json` |
| Alle teksten van de homepage | `src/content/instellingen/home.json` |
| Teksten van de interactieve onderdelen per pagina | `src/content/instellingen/{airconditioning,warmtepompen,onderhoud,over}.json` |
| Kennisbank-artikelen (met bronnen) | `src/content/kennis/*.md` |
| Dienstpagina's (airco, warmtepompen, onderhoud) | `src/content/diensten/*.md` |
| Veelgestelde vragen (één bestand per vraag) | `src/content/faq/*.md` |
| Reviews | `src/content/reviews/*.yaml` |
| Over Sjoerd, werkgebied, privacy | `src/content/paginas/*.md` |
| Schema's (welke velden verplicht zijn) | `src/content.config.ts`, `src/lib/bedrijf.ts` |
| Huisstijl (kleuren, letters, basisstijlen) | `src/styles/global.css` |
| Componenten | `src/components/` |
| Pagina's / routes | `src/pages/` (elke dienst heeft een eigen pagina: `airconditioning.astro`, `warmtepompen.astro`, `onderhoud.astro`) |
| Diepte-effect (sitebreed) | `src/scripts/diepte.ts` + klassen `.paar/.vlak/.plak/.paneel` in `global.css` |

Een veld op `null` of een lege lijst in `bedrijf.json` betekent "nog niet bekend": het wordt dan niet getoond, of als placeholder.

### Placeholders

Informatie die Sjoerd nog moet aanleveren staat in de teksten als:

```html
<span class="todo">Sjoerd: welke garantie geef je?</span>
```

Dat verschijnt als oranje gestippeld label "Aan te vullen". Alle open vragen staan in [`docs/vragen-voor-sjoerd.md`](docs/vragen-voor-sjoerd.md). Placeholder-antwoorden worden automatisch uit de structured data (FAQPage) gehouden.

## Ontwerp

- Donkere hero, daarna afwisselend lichte en donkere vlakken. Op de homepage ligt donker "achter" en schuift licht er recht overheen (diepte-effect).
- Het diepte-effect staat alleen aan bij `prefers-reduced-motion: no-preference`, schermbreedte > 860px en als elk donker vlak in het scherm past. Anders is het een gewone afwisseling.
- Koelen = blauw, verwarmen = oranje. De keuze "Wat zoek je?" op de homepage stuurt teksten, kaarten, tekening en thermometer aan.
- Elke pagina heeft een reuzenwoord in de hero en een eigen opvallend element:
  - airconditioning: opstelling-kiezer (single/multi-split), scroll-verhaal van de binnenunit, seizoensband
  - warmtepompen: huis-doorsnede (hybride/all-electric), geschiktheidscheck, scroll-uitleg van de kringloop
  - onderhoud: manometer, storingswijzer (klacht kiezen → zelf checken / normaal / bel als, doorsturen naar contact), onderhoudskalender per seizoen en een checklist die zich afvinkt
  - over Sjoerd: portret, reuzen-"20+", tijdlijn, citaat
  - werkgebied: gestileerde kaart met afstandsringen
  - vragen: zoekveld en onderwerptegels
  - contact: gesplitst scherm met keuzetegels (voorgevuld vanaf de dienstpagina's)
- Navigatie: één header; op mobiel een hamburgermenu met icoon per item, Home bovenaan, actieve pagina oranje gemarkeerd, offerteknop altijd onderin beeld en een lichte gloed bij Airconditioning en Warmtepompen. Subpagina's hebben een zichtbaar kruimelpad (`Kruimelpad.astro`), uit dezelfde bron als de structured data.
- Kleurdiscipline (focal points): één oranje knop per scherm, neutrale labels, één gloed per scherm, decoratie in inkt. Zie `docs/plan.md` → Kleurdiscipline.
- Alle interactieve elementen werken zonder JavaScript (je ziet dan de standaardstand of een gewone lijst).
- Achtergrond en beslissingen: [`docs/plan.md`](docs/plan.md). Ontwerprondes: `docs/prototype-ronde-*/` (screenshots).

## Vindbaarheid

- schema.org: `HVACBusiness` (elke pagina), `Service` (dienstpagina's), `FAQPage`, `AboutPage`, `Article` (kennisbank), `BreadcrumbList` (alle subpagina's)
- Eigen deelafbeelding per pagina (`public/images/og/`, gemaakt met `npm run og`)
- Kennisbank: algemene vakuitleg met bronvermelding en datum 'bijgewerkt'; geen beloftes namens het bedrijf
- Kennisbank-regel: elk artikel van meer dan twee alinea's heeft minimaal één illustratie (`illustratie` in de frontmatter, tekeningen in `src/components/KennisIllustratie.astro`). Een test bewaakt dit.
- `sitemap-index.xml` (automatisch), `robots.txt`, `llms.txt` (samenvatting voor AI-assistenten)
- Elke pagina heeft een eigen titel en omschrijving (in de content-bestanden)

## Formulier

Het contactformulier (`src/pages/contact.astro`) gebruikt Netlify Forms. Lokaal wordt verzenden nagebootst (je gaat direct naar `/bedankt`).

## Kwaliteitscontrole

- `tests/site.spec.ts`: elke pagina laadt zonder fouten, heeft één h1, geen ernstige toegankelijkheidsfouten (axe) en geen horizontale scroll; plus de interactieve onderdelen, het mobiele menu, 'minder beweging' en geldige JSON-LD. Desktop en mobiel.
- `.github/workflows/ci.yml`: bij elke push `astro check`, build, tests en Lighthouse (minimaal 95 per categorie, mediaan van 3 metingen per pagina, `lighthouserc.json`).

## Demo

`scripts/demo/maak-demo.py` maakt een kopie met een fictief bedrijf (AircoPompShot, Samson Gertson, Voorbeeldstad), voorbeeldreviews, een neutraal logo, een roze demo-label en een formulier dat niets verstuurt. Het script stopt als er nog echte gegevens in de uitvoer staan. Bedoeld om het ontwerp te laten zien zonder het echte bedrijf te publiceren.

## Live zetten

Zie [`docs/domein-en-hosting.md`](docs/domein-en-hosting.md). Kort: Netlify (instellingen in `netlify.toml`). Mail en domein blijven bij de huidige hoster.

## Later: beheersysteem

De inhoud staat bewust in Markdown, YAML en JSON met schema's, zodat er later een git-gebaseerd CMS bovenop kan zonder iets te verplaatsen. Het plan is **Keystatic**:

- collections `diensten`, `faq`, `reviews`, `paginas`, `kennis` → de mappen in `src/content/`
- singletons `bedrijf`, `home`, `airconditioning`, `warmtepompen`, `onderhoud`, `over` → de JSON-bestanden in `src/content/instellingen/`
