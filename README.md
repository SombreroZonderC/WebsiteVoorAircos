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
```

## Waar staat wat

| Wat | Waar |
|---|---|
| Bedrijfsgegevens (telefoon, adres, KvK, werkgebied, Google-score …) | `src/content/instellingen/bedrijf.json` |
| Alle teksten van de homepage | `src/content/instellingen/home.json` |
| Dienstpagina's (airco, warmtepompen, onderhoud) | `src/content/diensten/*.md` |
| Veelgestelde vragen (één bestand per vraag) | `src/content/faq/*.md` |
| Reviews | `src/content/reviews/*.yaml` |
| Over Sjoerd, werkgebied, privacy | `src/content/paginas/*.md` |
| Schema's (welke velden verplicht zijn) | `src/content.config.ts`, `src/lib/bedrijf.ts` |
| Huisstijl (kleuren, letters, basisstijlen) | `src/styles/global.css` |
| Componenten | `src/components/` |
| Pagina's / routes | `src/pages/` |

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
- Achtergrond en beslissingen: [`docs/plan.md`](docs/plan.md). Ontwerprondes: `docs/prototype-ronde-*/` (screenshots).

## Vindbaarheid

- schema.org: `HVACBusiness` (elke pagina), `Service` (dienstpagina's), `FAQPage`, `AboutPage`
- `sitemap-index.xml` (automatisch), `robots.txt`, `llms.txt` (samenvatting voor AI-assistenten)
- Elke pagina heeft een eigen titel en omschrijving (in de content-bestanden)

## Formulier

Het contactformulier (`src/pages/contact.astro`) gebruikt Netlify Forms. Lokaal wordt verzenden nagebootst (je gaat direct naar `/bedankt`).

## Live zetten

Zie [`docs/domein-en-hosting.md`](docs/domein-en-hosting.md). Kort: Netlify (instellingen in `netlify.toml`). Mail en domein blijven bij de huidige hoster.

## Later: beheersysteem

De inhoud staat bewust in Markdown, YAML en JSON met schema's, zodat er later een git-gebaseerd CMS bovenop kan zonder iets te verplaatsen. Het plan is **Keystatic**:

- collections `diensten`, `faq`, `reviews`, `paginas` → de mappen in `src/content/`
- singletons `bedrijf` en `home` → de JSON-bestanden in `src/content/instellingen/`
