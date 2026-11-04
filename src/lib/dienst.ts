import { getCollection, getEntry } from 'astro:content';
import { bedrijf, bedrijfId } from './bedrijf';
import { faqSchema } from './schema';

// Gedeelde gegevens voor de dienstpagina's: de inhoud, de bijbehorende FAQ en de structured data.
export async function laadDienst(id: 'airconditioning' | 'warmtepompen' | 'onderhoud') {
  const dienst = (await getEntry('diensten', id))!;
  const d = dienst.data;
  const faqs = (await getCollection('faq', (f) => f.data.categorie === d.faqCategorie)).sort(
    (a, b) => a.data.volgorde - b.data.volgorde,
  );
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: d.titel,
      serviceType: d.menuLabel,
      description: d.seoOmschrijving,
      url: `${bedrijf.url}/${id}`,
      provider: { '@id': bedrijfId },
      areaServed: bedrijf.werkgebied.length > 0 ? bedrijf.werkgebied : bedrijf.adres.plaats,
      brand: { '@type': 'Brand', name: bedrijf.merk },
    },
    ...faqSchema(faqs),
  ];
  return { dienst, d, faqs, schema };
}
