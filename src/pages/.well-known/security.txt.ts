import type { APIRoute } from 'astro';
import { bedrijf } from '../../lib/bedrijf';
import { absoluut } from '../../lib/seo';

// security.txt (RFC 9116): waar iemand een beveiligingsprobleem met de site kan melden.
// De einddatum schuift bij elke build een jaar op, zodat het bestand niet verloopt zolang de site wordt bijgehouden.
export const GET: APIRoute = () => {
  const verloopt = new Date();
  verloopt.setUTCFullYear(verloopt.getUTCFullYear() + 1);
  verloopt.setUTCHours(0, 0, 0, 0);
  const regels = [
    `Contact: mailto:${bedrijf.email}`,
    `Expires: ${verloopt.toISOString()}`,
    'Preferred-Languages: nl, en',
    `Canonical: ${absoluut('/.well-known/security.txt')}`,
    '',
  ];
  return new Response(regels.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
