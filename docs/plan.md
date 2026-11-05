# Plan – nieuwe website The CoolFactory

Vastgesteld in een grill-sessie op 29-10-2026. Dit is het referentiepunt voor alle keuzes; wijzig dit document als een beslissing verandert.

## Context

- Opdrachtgever wordt Sjoerd Moller (The CoolFactory, Heeten). Hij weet nog niet van het project: v1 is een voorstel om hem te laten zien.
- Beheer na livegang: de initiatiefnemer, later eventueel een dedicated agent. Voorlopig één ontwikkelaar (Claude).

## Doel en scope

- Twee gelijkwaardige doelen:
  1. Beter gevonden worden: regionaal in Google, op termijn ook in ChatGPT en andere chatbots.
  2. Professionele, moderne, toekomstbestendige uitstraling.
- Airco en warmtepomp gelijkwaardig. Doelgroep particulieren.
- Alleen de website. Marketing en Google Bedrijfsprofiel eventueel later.
- Geen deadline, wel tempo.
- Vaste kosten zo laag als nu; ruimte voor uitbreiding als er kansen zijn.

## Techniek

- **Astro** (statische output), gewone CSS met design tokens (`src/styles/global.css`).
- Inhoud gescheiden van code:
  - Bedrijfsgegevens en homepageteksten in JSON (`src/content/instellingen/`).
  - Dienstpagina's, FAQ, reviews en tekstpagina's als Markdown/YAML in content collections (`src/content/`), met Zod-schema's in `src/content.config.ts`.
- **Geen CMS in v1**, maar de structuur is ingericht op **Keystatic** (git-based, gratis), zodat het later zonder herbouw kan worden toegevoegd.
- Hosting (af te stemmen met Sjoerd): website op **Netlify** (gratis, deploy vanuit Git, Netlify Forms). Het huidige pakket (ZXCS-platform) blijft voor **mail en domein**. Zie `docs/domein-en-hosting.md`.
- Accounts (domein, hosting, repository) uiteindelijk op naam van Sjoerd, met beheerder als collaborator.

## Ontwerp

Vastgesteld na vijf prototyperondes, elk beoordeeld door de initiatiefnemer en een onafhankelijke reviewer (screenshots in `docs/prototype-ronde-1` t/m `-5`). De prototypecode zelf staat in de git-geschiedenis; laatste stand: commit `7e3f924`.

- **Hero**: grote woorden "Koel." / "Warm." met kleurverloop (blauw/oranje) op donker, rechts een infoblok met belofte, naam, offerte en bellen.
- **Ritme**: donker / licht / donker / licht / donker ("Bel Sjoerd"). Op de homepage ligt donker achter en schuift licht er recht overheen (diepte-variant A). Geen afgeronde paneelranden. Alleen bij `prefers-reduced-motion: no-preference`, breedte > 860px en als het donkere vlak in het scherm past.
- **Homepage-opbouw**: hero → vertrouwensbalk → "Wat zoek je?" (koelen/verwarmen) met kop, CTA en ruimtekaarten met prijsindicatie → zo werkt het (technische tekening) → het resultaat (thermometers buiten/binnen) → werkwijze → je krijgt Sjoerd → reviews → "Bel Sjoerd".
- **Koelen/verwarmen**: de keuze stuurt teksten, CTA, kaarten, tekening en thermometer. Koelen = blauw, verwarmen = oranje. Beide varianten staan in de HTML (voor zoekmachines), één is verborgen.
- **Thermometer**: klassiek (glas, kwik, schaal), niet bovenaan. Binnen heeft de kleur van het verhaal.
- **Typografie**: Archivo (breed, zwaar) voor koppen, Inter voor tekst, IBM Plex Mono voor labels.
- **Niet doen**: felle blauw/oranje kleurvlakken met sneeuwvlok/vlam (lijkt op concurrent NuKoel, oogt goedkoop), bento-blokken, 3D/WebGL, zware parallax.
- Ik-vorm van Sjoerd, "je"-vorm naar de bezoeker.
- Geen stockfoto's op de live site. Placeholders (lijntekeningen) tot Sjoerd foto's levert.
- **Navigatie**: één header voor de hele site (transparant boven de hero, compact en vast na het scrollen, hamburgermenu onder 1180px), doorklik-links per sectie, footer met alle pagina's, vaste belknop op mobiel (verborgen als er al een grote belknop in beeld is).

## Pagina's

| Pagina | Route | Zoekintentie |
|---|---|---|
| Home | `/` | airco/warmtepomp Heeten |
| Airconditioning | `/airconditioning` | airco laten plaatsen + regio |
| Warmtepompen (incl. hybride) | `/warmtepompen` | warmtepomp installateur + regio |
| Onderhoud & service | `/onderhoud` | airco/warmtepomp onderhoud + regio |
| Over Sjoerd | `/over-sjoerd` | vertrouwen |
| Werkgebied | `/werkgebied` | plaatsnamen |
| Veelgestelde vragen | `/veelgestelde-vragen` | long-tail, citeerbaar voor chatbots |
| Contact / offerte | `/contact` | aanvragen |
| Kennisbank | `/kennisbank`, `/kennisbank/<artikel>` | informatieve vragen ("hybride of all-electric", "verwarmen met airco"), citeerbaar voor chatbots |
| Privacyverklaring | `/privacy` | wettelijk |

Signatuur per pagina (zelfde systeem, elke pagina een eigen 'pop'):

| Pagina | Reuzenwoord | Eigen element |
|---|---|---|
| Home | Koel. Warm. | keuze koelen/verwarmen die tekst, kaarten, tekening en thermometer aanstuurt |
| Airconditioning | Koel. | opstelling-kiezer, scroll-verhaal binnenunit, seizoensband, projectfoto |
| Warmtepompen | Warm. | huis-doorsnede hybride/all-electric, geschiktheidscheck, kringloop |
| Onderhoud | Zorgeloos. | manometer, checklist, donkere band "Storing? Bel direct." |
| Over Sjoerd | 20+ | portret, tijdlijn (placeholders), citaat |
| Werkgebied | Vanuit Heeten. | oriëntatiekaart met ringen op 10 en 20 km (geen toezegging) |
| Vragen | Vragen? | zoekveld met synoniemen, tellers per onderwerp |
| Kennisbank | Kennis. / per artikel | "In het kort", bronnen, datum bijgewerkt |
| Contact | (gesplitst scherm) | keuzetegels, voorgevuld vanaf dienstpagina's |

Projectenpagina pas als Sjoerd foto's levert.

## Inhoud

- Bedrijfsfeiten alleen van de huidige site (20+ jaar ervaring, Mitsubishi Electric, reviews, adres, telefoon, e-mail).
- Algemene vakuitleg mag geschreven worden.
- Alles wat alleen Sjoerd weet: zichtbare placeholder, verzameld in `docs/vragen-voor-sjoerd.md`.

## Formulier

- Verplicht (zoals nu): naam, e-mail, bericht.
- Optioneel: telefoon, postcode + plaats, onderwerp, type woning, contactvoorkeur.
- v1: verzending gemockt (redirect naar bedankpagina), markup klaar voor Netlify Forms.

## Vindbaarheid (SEO + AI)

- schema.org: `HVACBusiness` (sitebreed), `Service` per dienstpagina, `FAQPage`.
- Consistente naam/adres/telefoon.
- `llms.txt`, AI-crawlers toegestaan in `robots.txt`.
- Zelfstandige, feitelijke FAQ-antwoorden.
- Alle inhoud in HTML, geen JS nodig.
- `Article` met bronnen (kennisbank) en `BreadcrumbList` op subpagina's.
- Eigen deelafbeelding per pagina.
- Geen review-sterren in structured data (Google toont geen sterren voor self-serving reviews).

## Definition of done v1

- Mobile-first, werkt op alle schermbreedtes.
- Lighthouse ≥95 op alle vier categorieën.
- WCAG AA (contrast, toetsenbord, screenreader).
- Alle inhoud werkt zonder JavaScript.
- `docs/vragen-voor-sjoerd.md` compleet.
- `docs/domein-en-hosting.md` aanwezig.

## Presentatie

Lokaal op de laptop van de initiatiefnemer; daarna optioneel een beveiligde preview-link.

## Werkwijze

Branch `claude/elegant-goodall-tmcnwo`, commit per mijlpaal: basis → homepage + POC → dienstpagina's → overige pagina's → documentatie. PR alleen op verzoek.
