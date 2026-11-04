import { z } from 'astro/zod';
import aircoJson from '../content/instellingen/airconditioning.json';
import warmtepompJson from '../content/instellingen/warmtepompen.json';
import onderhoudJson from '../content/instellingen/onderhoud.json';
import overJson from '../content/instellingen/over.json';

// Teksten van de signatuur-elementen per pagina. Staan in JSON (singletons) zodat een CMS
// (Keystatic) ze later kan bewerken; de schema's bewaken dat er niets ontbreekt.

const kaart = z.object({ titel: z.string(), tekst: z.string() });
const blok = z.object({ eyebrow: z.string(), titel: z.string() });
const stappenBlok = blok.extend({ stappen: z.array(kaart).min(1) });
const systeem = z.object({ label: z.string(), titel: z.string(), tekst: z.string(), punten: z.array(z.string()) });
const uitkomst = z.object({ richting: z.string(), toelichting: z.string() });

export const airco = z
  .object({
    kiezer: blok.extend({
      opties: z
        .array(
          z.object({
            label: z.string(),
            type: z.string(),
            regel: z.string(),
            tekst: z.string(),
            prijsVanaf: z.string().nullable(),
          }),
        )
        .length(4),
    }),
    opengewerkt: stappenBlok.extend({ stappen: z.array(kaart).length(4) }),
    seizoen: blok,
    ctaTitel: z.string(),
  })
  .parse(aircoJson);

export const warmtepomp = z
  .object({
    huis: blok.extend({ hybride: systeem, electric: systeem }),
    check: blok.extend({
      vragen: z.object({
        isolatie: z.object({ label: z.string(), goed: z.string(), matig: z.string(), weet: z.string() }),
        afgifte: z.object({ label: z.string(), vloer: z.string(), radiatoren: z.string(), beide: z.string() }),
        buiten: z.object({ label: z.string(), ja: z.string(), weet: z.string() }),
      }),
      uitkomsten: z.object({ hybride: uitkomst, electric: uitkomst, beide: uitkomst, buitenOnbekend: z.string() }),
      cta: z.string(),
      disclaimer: z.string(),
    }),
    kringloop: stappenBlok.extend({ stappen: z.array(kaart).length(4) }),
    subsidie: z.object({ titel: z.string(), tekst: z.string(), link: z.url() }),
    ctaTitel: z.string(),
  })
  .parse(warmtepompJson);

export const onderhoud = z
  .object({
    controle: blok.extend({ punten: z.array(kaart).min(1) }),
    storing: z.object({ titel: z.string(), tekst: z.string() }),
    ctaTitel: z.string(),
  })
  .parse(onderhoudJson);

export const over = z
  .object({
    tijdlijn: z.array(z.object({ jaar: z.string().nullable(), titel: z.string(), tekst: z.string().nullable() })),
  })
  .parse(overJson);
