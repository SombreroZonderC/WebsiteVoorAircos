// Centrale bedrijfsgegevens. Pas hier aan, dan verandert het overal op de site.
// Velden met `null` of een lege lijst zijn nog niet bekend en worden niet getoond.

export const site = {
  name: 'The CoolFactory',
  tagline: 'Airconditioning & warmtepompen',
  owner: 'Sjoerd Moller',
  url: 'https://thecoolfactory.nl',

  phone: {
    display: '06 211 276 12',
    href: 'tel:+31621127612',
  },
  email: 'info@thecoolfactory.nl',
  // Zet op true als Sjoerd WhatsApp gebruikt op zijn 06-nummer.
  whatsapp: false,
  whatsappHref: 'https://wa.me/31621127612',

  address: {
    street: 'Spekhoekweg 8',
    postalCode: '8111 RR',
    city: 'Heeten',
    region: 'Overijssel',
    country: 'NL',
  },

  yearsExperience: '20+',
  brand: 'Mitsubishi Electric',

  // Nog aan te vullen door Sjoerd:
  kvk: null as string | null,
  btw: null as string | null,
  openingHours: null as string | null, // bijv. 'Ma–vr 08:00–17:00'
  certifications: [] as string[], // bijv. 'F-gassen gecertificeerd (STEK/BRL 100)'
  serviceAreas: [] as string[], // plaatsen waar Sjoerd werkt, bijv. 'Raalte', 'Deventer'
  googleReviewsUrl: null as string | null, // link naar het Google Bedrijfsprofiel
};

export const reviews = [
  {
    name: 'Ann Josien',
    date: '2025-06-17',
    text: 'Sjoerd heeft ons super geholpen met het installeren van een hybride, stille warmtepomp, en een airco. Dit voor echt een goede prijs. Wij zijn heel tevreden; perfecte service en de communicatie verliep steeds soepel en vlot.',
  },
  {
    name: 'Google-reviewer',
    date: '2025-06-17',
    text: 'Super tevreden over The CoolFactory. Het advies, de communicatie en het installeren van onze warmtepomp en airco’s is vlekkeloos verlopen. Betrouwbaar en kwalitatief goed! Meerdere mensen in mijn netwerk doorverwezen en allemaal tevreden. Aanrader.',
  },
  {
    name: 'Harriet Eenkhoorn',
    date: '2025-06-02',
    text: 'Betrouwbaar, vakkundig, werkt erg netjes, goede service en een nette prijs. Wij zijn meer dan tevreden met onze airco’s geplaatst door The CoolFactory.',
  },
];

export const nav = [
  { href: '/airconditioning', label: 'Airconditioning' },
  { href: '/warmtepompen', label: 'Warmtepompen' },
  { href: '/onderhoud', label: 'Onderhoud' },
  { href: '/over-sjoerd', label: 'Over Sjoerd' },
  { href: '/werkgebied', label: 'Werkgebied' },
];
