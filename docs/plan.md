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

- Donkere basis met blauw (koud) en oranje (warm) uit het bestaande logo; stoere brede koppen (Archivo, breedte-as); strakke kaarten en dunne lijnen (Linear/Stripe-achtig).
- Geen 3D/WebGL, geen zware animaties, geen experimentele navigatie.
- Ik-vorm van Sjoerd, "je"-vorm naar de bezoeker.
- Neutrale grafische placeholders voor foto's. Homepage in twee POC-versies naast elkaar:
  - `/poc/zonder-foto` – placeholders
  - `/poc/met-stock` – stockfoto's (gelabeld als sfeerbeeld)
  - `/poc` – vergelijking naast elkaar
  - POC-pagina's zijn `noindex` en verdwijnen na de keuze.

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
| Privacyverklaring | `/privacy` | wettelijk |

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
