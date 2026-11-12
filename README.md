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
npm run iconen    # pictogrammen opnieuw maken uit public/favicon.svg
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
| Schema's (welke velden verplicht zijn) | `src/content.config.ts`, `src/lib/bedrijf.ts`, `src/lib/inhoud.ts`, gedeelde bouwstenen in `src/lib/schemas.ts` |
| Menu's en kruimelpad (één bron voor header, footer, 404) | `src/lib/navigatie.ts` |
| Titels, canonical, deelafbeelding, structured data | `src/lib/seo.ts`, `src/lib/schema.ts` |
| Gedrag in de browser (per onderdeel één module) | `src/scripts/` (`radiogroep`, `contactformulier`, `vragenzoeker`, `diepte`, `reveal`) |
| Beveiligingsheaders (CSP, HSTS …) | `integrations/beveiligingsheaders.mjs` → `dist/_headers` |
| Huisstijl (kleuren, letters, basisstijlen) | `src/styles/global.css` |
| Componenten | `src/components/` (secties van de homepage in `src/components/home/`, het formulier in `ContactFormulier.astro`) |
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
- Alle interactieve elementen werken zonder JavaScript. Op de dienstpagina's verdwijnen de keuzeknoppen en staan alle uitkomsten onder elkaar (`data-zonder-js-tonen`). Op de homepage wisselt de keuze koelen/verwarmen dan met gewone keuzerondjes en CSS (`home/Keuze.astro`, regels in `global.css`). Het enige wat zonder script ontbreekt is de bewegende thermometer bij verwarmen. Het uitklapmenu op smalle schermen heeft een script nodig; zonder script is de menuknop een link naar het menu onderaan de pagina.
- Keuzeknoppen delen één toegankelijk patroon (`src/scripts/radiogroep.ts`: pijltjes, Home/End, één knop in de tabvolgorde).
- Afdrukken: de pagina houdt haar eigen kleuren en indeling; alleen menu's, knoppen, formulieren en beweging verdwijnen, en alles wat ingeklapt of gekozen moet worden staat uitgeklapt. Bronlinks staan voluit. De contactpagina past op één vel. (Een eerdere zwart-op-wit-versie brak onderdelen met een eigen donkere achtergrond.)
- Tekeningen op een telefoon: labels krijgen grotere letters (minimaal ongeveer 11 px). Vanaf 360 px breed past elke tekening; op nog smallere schermen krimpt hij niet verder maar schuif je hem opzij, met een aanwijzing erbij en bedienbaar met het toetsenbord (`.tekening-schuif` in `global.css`, `src/scripts/tekeningen.ts`).
- Hoog contrast (Windows): een gekozen optie krijgt een rand, omdat kleurvlakken daar wegvallen.
- De vaste belbalk op een telefoon bedekt nooit het element dat focus heeft (`scroll-padding-bottom`, extra ruimte onder de footer).
- Kennisbankartikelen met drie of meer tussenkoppen krijgen automatisch een inhoudsopgave.
- Achtergrond en beslissingen: [`docs/plan.md`](docs/plan.md). Ontwerprondes: `docs/prototype-ronde-*/` (screenshots).

## Vindbaarheid

- schema.org: `HVACBusiness` (elke pagina), `Service` (dienstpagina's), `FAQPage`, `AboutPage`, `Article` (kennisbank), `BreadcrumbList` (alle subpagina's)
- Eigen deelafbeelding per pagina (`public/images/og/`, gemaakt met `npm run og`)
- Kennisbank: algemene vakuitleg met bronvermelding en datum 'bijgewerkt'; geen beloftes namens het bedrijf
- Kennisbank-regel: elk artikel van meer dan twee alinea's heeft minimaal één illustratie (`illustratie` in de frontmatter, tekeningen in `src/components/KennisIllustratie.astro`). Een test bewaakt dit.
- `sitemap-index.xml` (automatisch), `robots.txt`, `llms.txt` (overzicht voor AI-assistenten) en `llms-full.txt` (volledige tekst van kennisbank en veelgestelde vragen, zonder onafgemaakte antwoorden)
- RSS-feed van de kennisbank: `/kennisbank/rss.xml`
- Elke veelgestelde vraag heeft een eigen link (`/veelgestelde-vragen#vraag-…`); een zoekvraag ook (`?q=subsidie`)
- Titels maximaal 60 tekens en omschrijvingen maximaal 170: afgedwongen in de schema's, de build stopt bij een te lange tekst
- Elke pagina heeft een eigen titel en omschrijving (in de content-bestanden)

## Formulier

Het contactformulier (`src/pages/contact.astro`, gedrag in `src/scripts/contactformulier.ts`) gebruikt Netlify Forms. Lokaal wordt verzenden nagebootst (je gaat direct naar `/bedankt`).

- Eigen foutmeldingen per veld (gekoppeld met `aria-describedby`), focus op het eerste foute veld, één keer versturen.
- Een half ingevuld formulier (met onderwerp) blijft bewaard in het tabblad (`sessionStorage`) en wordt gewist bij versturen. Er gaat niets naar een server voordat de bezoeker verstuurt; de privacyverklaring noemt dit.
- Foutmeldingen hebben een vaste plek: er verspringt niets als een melding verschijnt (anders gaat de klik op versturen verloren).
- Voorinvullen vanaf de dienstpagina's (`?onderwerp=`, `?ruimtes=`, `?klacht=`, `?advies=`) werkt alleen met vaste waarden; vrije tekst uit een link wordt nooit overgenomen.
- E-mailadressen moeten een punt in het domein hebben (`a@b` laat een browser zelf door).
- Spam: verborgen lokveld (Netlify honeypot), het spamfilter van Netlify Forms en maximale lengtes. Bewust geen captcha: die laadt scripts van een ander domein en hindert bezoekers. Komt er toch veel spam binnen, dan is een captcha van Netlify de volgende stap (de Content-Security-Policy moet dan worden verruimd).
- Een naam of bericht van alleen spaties telt als leeg; een telefoonnummer heeft minstens zes cijfers, een postcode de vorm 1234 AB. Zonder JavaScript controleert de browser zelf (`required`, `pattern`), behalve een bericht van alleen spaties.
- De echte verzending via Netlify kan pas op een deploy getest worden: zie de controlelijst in [`docs/domein-en-hosting.md`](docs/domein-en-hosting.md).

## Beveiliging

- `integrations/beveiligingsheaders.mjs` schrijft bij elke build `dist/_headers`: Content-Security-Policy (scripts alleen van de eigen site of met een hash die bij de build hoort; geen `unsafe-inline` of `unsafe-eval` voor scripts), HSTS (bewust zonder subdomeinen, zie de controlelijst), `X-Frame-Options: DENY`, `Permissions-Policy`, `Referrer-Policy`, `Cross-Origin-Opener-Policy`.
- De testserver (`scripts/serve-dist.mjs`) stuurt dezelfde headers mee. Tests en Lighthouse draaien dus onder de policy van de live site; een script dat de policy blokkeert, laat de tests falen.
- De site laadt niets van andere domeinen (lettertypen staan lokaal), heeft geen cookies en geen trackers. Een test bewaakt dat.
- Structured data wordt zo geschreven dat tekst uit de inhoud het script-blok niet kan afsluiten (`jsonLd` in `src/lib/seo.ts`).
- `/.well-known/security.txt` vertelt waar een beveiligingsprobleem gemeld kan worden; de einddatum schuift bij elke build op.
- CI heeft alleen leesrechten, de acties staan vast op een commit, en `npm audit` draait als aparte taak die de rest niet blokkeert.
- Netlify mag de bestanden niet nabewerken, anders veranderen de scripts en kloppen de hashes niet meer. `netlify.toml` zet nabewerking uit (`skip_processing`); zet daarnaast geen snippet-injectie aan. Op deploy-previews blokkeert de policy de Netlify-werkbalk; dat is onschuldig.

## Kwaliteitscontrole

- `tests/`: de lijst met pagina's komt uit de sitemap van de build, dus een nieuwe pagina of een nieuw artikel wordt vanzelf meegetest. Desktop en mobiel.
  - `paginas.spec.ts`: elke pagina laadt zonder (console)fouten, heeft één h1, geen ernstige toegankelijkheidsfouten (axe, WCAG 2.2 AA), geen horizontale scroll (ook op 320 px), geldige JSON-LD; tekeningen passen op 360/375/390 px met labels van minimaal 11 px; toegankelijkheid na interactie; focus niet achter de belbalk; hoog contrast
  - `interacties.spec.ts`, `navigatie.spec.ts`, `formulier.spec.ts`, `kennisbank.spec.ts`: de interactieve onderdelen, menu's, het formulier (ook de echte verzendroute: via `127.0.0.2` verstuurt de browser het formulier zelf, één POST, ook bij dubbelklikken), inhoudsopgave, feed en afdrukken
  - `zonder-js.spec.ts`: alle inhoud is bereikbaar zonder JavaScript, ook de verwarmen-kant van de homepage en het menu op een smal scherm
  - `beveiliging.spec.ts`: headers, CSP, geen externe verzoeken, geen vrije tekst uit links
  - `visueel.spec.ts`: elke vindbare pagina als volledig beeld vergeleken met een vastgelegd beeld (desktop en mobiel, vrijwel exact: maximaal 400 afwijkende beeldpunten), plus drie scrollstanden van de homepage mét het diepte-effect. Na een bewuste ontwerpwijziging: `npm run test:beelden`, de nieuwe beelden nakijken en committen. Afweging: de beelden (37 stuks, ruim 20 MB) staan in de repo zodat een wijziging en haar beeld in dezelfde commit zitten; ze zijn gemaakt met de Chromium van Playwright 1.63 op Linux, dus een andere browserversie vraagt nieuwe beelden.
  - `vindbaarheid.spec.ts`: unieke titels en omschrijvingen, canonical, deelafbeelding, alle interne links en ankers, `llms.txt`
- `.github/workflows/ci.yml`: bij elke push `npm audit`, `astro check`, build, tests en Lighthouse (minimaal 95 per categorie, mediaan van 3 metingen per pagina, `lighthouserc.json`).

## Demo

`scripts/demo/maak-demo.py` maakt een kopie met een fictief bedrijf (AircoPompShot, Samson Gertson, Voorbeeldstad), voorbeeldreviews, een neutraal logo, een roze demo-label en een formulier dat niets verstuurt. Het script stopt als er nog echte gegevens in de uitvoer staan. Bedoeld om het ontwerp te laten zien zonder het echte bedrijf te publiceren.

## Live zetten

Zie [`docs/domein-en-hosting.md`](docs/domein-en-hosting.md). Kort: Netlify (instellingen in `netlify.toml`). Mail en domein blijven bij de huidige hoster.

## Later: beheersysteem

De inhoud staat bewust in Markdown, YAML en JSON met schema's, zodat er later een git-gebaseerd CMS bovenop kan zonder iets te verplaatsen. Het plan is **Keystatic**:

- collections `diensten`, `faq`, `reviews`, `paginas`, `kennis` → de mappen in `src/content/`
- singletons `bedrijf`, `home`, `airconditioning`, `warmtepompen`, `onderhoud`, `over` → de JSON-bestanden in `src/content/instellingen/`
