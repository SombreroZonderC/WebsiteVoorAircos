# Domein, hosting en mail – stappenplan

**Eerst afstemmen met Sjoerd.** Niets hiervan uitvoeren zonder zijn akkoord en zijn inloggegevens.

## Huidige situatie

Vastgesteld via een openbare DNS-opvraging (oktober 2026):

| Record | Waarde | Betekenis |
|---|---|---|
| NS | `ns.zxcs.nl`, `ns.zxcs.eu`, `ns.zxcs.be` | DNS wordt beheerd op het ZXCS-hostingplatform (via de huidige hoster) |
| A / AAAA | `185.104.29.32` / `2a06:2ec0:1::93` | Huidige WordPress-site |
| MX | `mail.thecoolfactory.nl` | **Mail draait op hetzelfde hostingpakket** |
| TXT (SPF) | `v=spf1 a mx ip4:185.104.29.32 … include:filter-out.zxcs.nl ~all` | Mail wordt vanaf dat pakket verstuurd |

**Belangrijkste conclusie: website en mail zitten in hetzelfde pakket.** Zeg het pakket dus niet op zolang de mail daar draait, anders werkt info@thecoolfactory.nl niet meer.

## Aanpak (zelfde kosten als nu)

- **Website** → Netlify (gratis plan). De site wordt automatisch opnieuw gebouwd bij elke wijziging in Git, en het contactformulier werkt via Netlify Forms.
- **Mail en domein** → blijven waar ze zijn, in het huidige pakket.
- **Alleen twee DNS-records wijzigen** (apex + www). De nameservers **niet** verhuizen: dan zouden ook de mailrecords mee moeten.

## Stappen

### 1. Voorbereiden

1. Inloggegevens van Sjoerd: het klantpaneel van de hoster (DNS-beheer) en eventueel de domeinregistratie.
2. Noteer alle huidige DNS-records (screenshot of export), als terugvaloptie.
3. Maak een back-up van de huidige WordPress-site (exportfunctie van de hoster of een plugin).

### 2. Accounts

1. Maak een **GitHub-account of -organisatie op naam van Sjoerd** en zet de repository daarheen over, met de beheerder als collaborator. Of laat de repository staan en geef Sjoerd eigenaarsrechten.
2. Maak een **Netlify-account op naam van Sjoerd** (gratis) en nodig de beheerder uit.

### 3. Site op Netlify zetten

1. Netlify → *Add new site* → *Import from Git* → kies de repository.
2. De instellingen staan al in `netlify.toml` (build: `npm run build`, map: `dist`, Node 22).
3. Na de eerste build draait de site op een tijdelijk adres (`…netlify.app`). **Hier alles testen**: pagina's, mobiel, formulier.
4. **Controleren op het tijdelijke adres** (dit kan lokaal niet getest worden; lokaal wordt verzenden nagebootst):
   - [ ] Formulier invullen en versturen → je komt op `/bedankt` en de inzending staat in Netlify onder *Forms* → "offerte".
   - [ ] Formulier met het verborgen lokveld ingevuld (via de ontwikkeltools) → de inzending komt in *Spam* terecht.
   - [ ] `…/contact/` (met slash aan het eind) komt uit op de contactpagina. Zo niet: zet *Pretty URLs* aan of voeg een redirect toe.
   - [ ] Geen fouten in de browserconsole over *Content Security Policy* op een paar pagina's. Zo wel: staat *Asset optimization* of *Snippet injection* aan? Beide moeten uit (`netlify.toml` zet nabewerking al uit).
   - [ ] `…/onbekend-adres` toont de 404-pagina.
   - [ ] Netlify herkent het formulier ook nu nabewerking uit staat (`skip_processing`). Zo niet: alleen de formulierdetectie aanzetten, de rest uit laten.
   - [ ] Na livegang: hebben álle subdomeinen (mail, webmail) geldig HTTPS? Pas dan mag `includeSubDomains` bij HSTS in `integrations/beveiligingsheaders.mjs`. Nu staat het bewust uit.
5. **Formulier**: Netlify → *Forms* → formulier "offerte" verschijnt na de eerste inzending. Zet een e-mailmelding naar info@thecoolfactory.nl aan. Controleer de actuele limieten van het gratis plan.

### 4. Domein koppelen

1. Netlify → *Domain management* → voeg `thecoolfactory.nl` toe. Netlify voegt `www` automatisch toe.
2. In het **DNS-beheer bij de huidige hoster**:
   - **Apex** (`thecoolfactory.nl`): A-record naar `75.2.60.5`, of een ALIAS/ANAME naar `apex-loadbalancer.netlify.com` als de hoster dat ondersteunt.
   - **AAAA-record van het apex-domein verwijderen** (`2a06:2ec0:1::93`). Anders gaat bezoekersverkeer via IPv6 nog naar de oude site.
   - **www**: CNAME naar het Netlify-subdomein (staat in Netlify onder *Pending DNS verification*).
   - **Niet aanraken**: MX, `mail.`, SPF/TXT en andere mailrecords.
3. Wachten op DNS-verspreiding (minuten tot enkele uren). Netlify regelt daarna automatisch HTTPS (Let's Encrypt).

Bron DNS-instructies: [Netlify – Configure external DNS](https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/).

### 5. Na livegang

1. Test: `https://thecoolfactory.nl`, `https://www.thecoolfactory.nl`, het formulier, en **een testmail naar én van info@**.
2. **Google Search Console**: eigendom verifiëren via een DNS-TXT-record en `https://thecoolfactory.nl/sitemap-index.xml` indienen.
3. **Google Bedrijfsprofiel**: controleren of de websitelink klopt.
4. Eventueel ook Bing Webmaster Tools, dat ook voor ChatGPT-zoekresultaten wordt gebruikt.

### 6. Terugvalplan

Gaat er iets mis: zet het A-record (en eventueel het AAAA-record) terug naar de oude waarden uit stap 1. De oude site staat dan weer online, en de mail is nooit geraakt.

## Later (optioneel)

- **Mail verhuizen** naar een losse maildienst. Daarna kan het hostingpakket opgezegd worden, en blijft alleen de domeinregistratie over. Of dat goedkoper is, hangt af van de huidige pakketprijs.
- **Beheersysteem (Keystatic)** zodat Sjoerd zelf teksten en foto's kan aanpassen, zie de README.
