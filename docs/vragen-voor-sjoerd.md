# Vragen voor Sjoerd

Alles wat alleen Sjoerd kan aanleveren of bevestigen. Op de site staan deze punten als oranje gestippelde placeholder ("Aan te vullen"). Na beantwoorden: invullen in de genoemde bestanden; de placeholder verdwijnt dan vanzelf of wordt vervangen.

## 1. Akkoord en richting

- [ ] Wil je een nieuwe website, en is deze richting (ontwerp, teksten, opbouw) akkoord?
- [ ] Mogen de bestaande Google-reviews en de projectfoto van de huidige site gebruikt worden?
- [ ] Klopt de toon: in de ik-vorm, en de bezoeker met "je" aanspreken?

## 2. Bedrijfsgegevens → `src/content/instellingen/bedrijf.json`

- [ ] KvK-nummer (`kvk`) en btw-nummer (`btw`, optioneel tonen)
- [ ] Openingstijden of bereikbaarheid (`openingstijden`), bijv. "Ma–vr 08:00–17:00"
- [ ] Werkgebied: welke plaatsen of welke straal? (`werkgebied`) Dit is belangrijk voor de lokale vindbaarheid.
- [ ] Gebruik je WhatsApp zakelijk op je 06-nummer? (`whatsapp: true` toont een WhatsApp-knop op mobiel)
- [ ] Link naar je Google Bedrijfsprofiel (`googleReviewsUrl`), plus de huidige score en het aantal reviews (`googleScore`)

## 3. Vakinhoud en beloftes

- [ ] Welke certificeringen heb je? Bijvoorbeeld F-gassen (persoons- en bedrijfscertificaat), STEK, BRL 100. → `certificeringen` in `bedrijf.json`
- [ ] Ben je erkend Mitsubishi Electric-installateur of "Comfort Coach"?
- [ ] Welke garantie geef je op installatie en op apparatuur? → `src/content/diensten/*.md`
- [ ] Wil je indicatieve "vanaf"-prijzen tonen? Zo ja: per ruimte en systeem. → `prijsVanaf` in `src/content/instellingen/home.json` en de dienstpagina's
- [ ] Is het adviesbezoek aan huis gratis? (De offerte is volgens de huidige site vrijblijvend.) → `src/content/faq/offerte-kosten.md`
- [ ] Help je klanten met de ISDE-subsidieaanvraag? → `warmtepompen.md`, `faq/warmtepomp-subsidie.md`
- [ ] Welk onderhoudsinterval adviseer je, en bied je een onderhoudscontract aan? → `onderhoud.md`
- [ ] Doe je onderhoud en storingen aan systemen die je niet zelf hebt geplaatst, of van andere merken? → `onderhoud.md`, `faq/onderhoud-andere-merken.md`
- [ ] Klopt "een eenvoudige installatie is vaak binnen een dag klaar"? → `faq/hoe-lang-installatie.md`
- [ ] Bied je financiering aan?
- [ ] Klopt "ik kom zelf langs, ik installeer zelf"? Werk je met hulp?

## 4. Over jou → `src/content/paginas/over-sjoerd.md`

- [ ] Korte persoonlijke tekst: hoe ben je in het vak gekomen, sinds wanneer bestaat The CoolFactory, wat vind je het mooiste aan je werk?
- [ ] Tijdlijn: in welk jaar ben je begonnen in het vak, wanneer is The CoolFactory opgericht, en zijn er andere mijlpalen (bijv. eerste warmtepomp, certificering)? → `tijdlijn` in `src/content/instellingen/over.json`

## 4b. Bereikbaarheid

- [ ] Hoe snel reageer je meestal op een aanvraag of storing (bijv. "binnen een werkdag")? Dat kan prominent bij contact en onderhoud.
- [ ] Kom je bij storingen ook 's avonds of in het weekend?

## 4c. Kennisbank

- [ ] Wil je de kennisbank-artikelen (`src/content/kennis/`) nalezen? Ze bevatten algemene vakuitleg met bronnen (Milieu Centraal, RVO). Over welke onderwerpen krijg je de meeste vragen? Die zijn de beste volgende artikelen.

## 5. Beeld

- [ ] Foto van jezelf, bij voorkeur aan het werk (portret, liefst rechtop)
- [ ] Projectfoto's met korte beschrijving en plaatsnaam (bijv. "Multi-split in Raalte"). Daarmee kan later een projectenpagina.
- [ ] Is de huidige foto (buitenunit met omkasting op een plat dak) jouw werk? (Hij staat nu als 'Recent werk' op de airco-pagina.)
- [ ] Logo in hoge resolutie of origineel bestand (de SVG van de huidige site werkt al)

## 6. Juridisch

- [ ] De privacyverklaring (`src/content/paginas/privacy.md`) is een concept: laten controleren en aanvullen.

## 7. Domein, hosting en mail → zie `docs/domein-en-hosting.md`

- [ ] Waar is het domein geregistreerd, en heb je de inloggegevens?
- [ ] Wie beheert nu het hostingpakket (website + mail)?
- [ ] Welke mailadressen gebruik je (info@, andere)? Hoe lees je je mail (telefoon, Outlook, webmail)?
- [ ] Akkoord met het plan: website naar Netlify (gratis), mail en domein blijven waar ze zijn?
