#!/usr/bin/env python3
"""Bouwt een geanonimiseerde demo van de site (fictief bedrijf) in een losse map.

Gebruik:  python3 scripts/demo/maak-demo.py <doelmap>

Stappen: kopie van de repo → namen, adres, telefoon, merk en reviews vervangen →
neutraal logo, demo-label, formulier dat niets verstuurt → astro build →
<doelmap>/pub met relatieve paden, Google Fonts en zonder echte gegevens.
De repo zelf wordt niet aangepast. Stopt met een fout als er nog echte gegevens
in de uitvoer staan.
"""
import os
import re
import shutil
import subprocess
import sys

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))

VERVANG = [
    ('thecoolfactory.nl', 'aircopompshot.example'),
    ('The CoolFactory', 'AircoPompShot'), ('CoolFactory', 'AircoPompShot'),
    ('Sjoerd Moller', 'Samson Gertson'), ('Moller', 'Gertson'), ('Sjoerd', 'Samson'), ('sjoerd', 'samson'),
    # Merk blijft staan, maar zonder te suggereren dat het fictieve bedrijf een erkende specialist is.
    ('Specialist in {bedrijf.merk}.', 'Werkt met {bedrijf.merk}.'),
    ('<span>Specialist <b>{bedrijf.merk}</b></span>', '<span>Werkt met <b>{bedrijf.merk}</b></span>'),
    ('Specialist in ${bedrijf.merk}.', 'Werkt met ${bedrijf.merk}.'),
    ('<dt>Specialisme</dt>', '<dt>Merk</dt>'),
    ('specialist in Mitsubishi Electric', 'werkt met Mitsubishi Electric'),
    ('Specialist in Mitsubishi Electric', 'Werkt met Mitsubishi Electric'),
    ('"Mitsubishi Electric-specialist"', '"Werkt met Mitsubishi Electric"'),
    ('topkwaliteit van Mitsubishi Electric', 'Mitsubishi Electric'),
    ('aan de Spekhoekweg', 'aan de Voorbeeldstraat'),
    ('Spekhoekweg 8', 'Voorbeeldstraat 1'), ('Spekhoekweg', 'Voorbeeldstraat'), ('8111 RR', '1234 AB'), ('8111 AB', '1234 AB'),
    ('Heeten', 'Voorbeeldstad'), ('Raalte', 'Voorbeeldgemeente'), ('Overijssel', 'Voorbeeldprovincie'),
    ('06 211 276 12', '06 12 34 56 78'), ('+31621127612', '+31612345678'), ('31621127612', '31612345678'),
]
# Wat na afloop nergens meer in de uitvoer mag staan.
VERBODEN = re.compile(r'[Ss]pecialist\W+(in\W+)?(<b>)?Mitsubishi|Mitsubishi Electric-specialist|Sjoerd|Moller|CoolFactory|Heeten|Spekhoek|8111|Raalte|thecoolfactory|211 ?276|0621127612|Josien|Eenkhoorn', re.I)
TEKST = ('.astro', '.ts', '.json', '.md', '.yaml', '.txt', '.css', '.mjs')
FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900'
         '&family=Inter:wght@100..900&family=IBM+Plex+Mono:wght@500&display=swap">')
LOGO = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 230 128" role="img" aria-label="AircoPompShot">
  <circle cx="34" cy="56" r="24" fill="none" stroke="#7fb4ea" stroke-width="6"/>
  <path d="M34 32 a24 24 0 0 1 0 48" fill="none" stroke="#ff7a2f" stroke-width="6"/>
  <circle cx="34" cy="56" r="7" fill="#ff7a2f"/>
  <text x="70" y="50" font-family="Archivo, Arial, sans-serif" font-weight="800" font-size="26" fill="{kleur}">Airco</text>
  <text x="70" y="78" font-family="Archivo, Arial, sans-serif" font-weight="800" font-size="26" fill="#ff7a2f">PompShot</text>
  {regel}
</svg>
'''
LABEL_CSS = '''
/* Alleen in de demo: vaste vermelding dat dit een fictief bedrijf is */
.demo-label {
  position: fixed; left: 12px; bottom: 12px; z-index: 60; margin: 0; padding: 6px 12px;
  border-radius: 999px; background: #ff2bd6; color: #fff; font: 700 12px/1.2 var(--font-body); pointer-events: none;
}
@media (max-width: 720px) { .demo-label { top: 84px; bottom: auto; } }
'''


def lees(p):
    with open(p, encoding='utf-8') as f:
        return f.read()


def schrijf(p, s):
    with open(p, 'w', encoding='utf-8') as f:
        f.write(s)


def vervang_vast(p, oud, nieuw):
    s = lees(p)
    if oud not in s:
        sys.exit(f'Demo-script: verwachte tekst niet gevonden in {p}:\n{oud}')
    schrijf(p, s.replace(oud, nieuw, 1))


def kopieer(doel):
    if os.path.exists(doel):
        shutil.rmtree(doel)
    negeer = shutil.ignore_patterns('node_modules', 'dist', '.git', '.astro', 'test-results', 'playwright-report',
                                    '.lighthouseci*', 'docs', 'og')
    shutil.copytree(REPO, doel, ignore=negeer)
    os.symlink(os.path.join(REPO, 'node_modules'), os.path.join(doel, 'node_modules'))


def anonimiseer(d):
    os.rename(f'{d}/src/content/paginas/over-sjoerd.md', f'{d}/src/content/paginas/over-samson.md')
    os.rename(f'{d}/src/pages/over-sjoerd.astro', f'{d}/src/pages/over-samson.astro')
    for dp, _, fs in os.walk(f'{d}/src'):
        for f in fs:
            if f.endswith(TEKST):
                p = os.path.join(dp, f)
                s = o = lees(p)
                for a, b in VERVANG:
                    s = s.replace(a, b)
                if s != o:
                    schrijf(p, s)
    for f in ('scripts/og.mjs',):
        p = os.path.join(d, f)
        if os.path.exists(p):
            os.remove(p)

    # Reviews: alleen voorbeeldteksten
    rdir = f'{d}/src/content/reviews'
    for f in os.listdir(rdir):
        os.remove(os.path.join(rdir, f))
    for i in (1, 2, 3):
        schrijf(f'{rdir}/voorbeeld-{i}.yaml',
                f'naam: Voorbeeldklant {i}\ndatum: 2025-06-0{i}\nbron: Voorbeeld\n'
                'tekst: "Voorbeeldtekst – hier komt straks een echte klantreview. Dit demo-ontwerp gebruikt geen echte reviews."\n')
    vervang_vast(f'{d}/src/pages/over-samson.astro', "r.id === 'google-reviewer'", "r.id === 'voorbeeld-1'")

    # Logo's en deelafbeeldingen (die bevatten echte gegevens)
    img = f'{d}/public/images'
    regel = '<text x="12" y="112" font-family="Arial, sans-serif" font-size="11" letter-spacing="1.5" fill="#7fb4ea">DEMO · FICTIEF BEDRIJF</text>'
    schrijf(f'{img}/logo-op-donker.svg', LOGO.format(kleur='#e9f3fc', regel=regel))
    schrijf(f'{img}/logo-origineel.svg', LOGO.format(kleur='#0c1d23', regel=regel))
    schrijf(f'{img}/logo-header.svg', LOGO.format(kleur='#e9f3fc', regel='').replace('0 0 230 128', '0 0 230 100'))
    for p in (f'{img}/og.jpg',):
        if os.path.exists(p):
            os.remove(p)
    for f in os.listdir(img):
        if f.endswith(('.png', '.jpg', '.webp')) and 'logo' in f:
            os.remove(os.path.join(img, f))

    # Demo-label en een formulier dat niets verstuurt
    vervang_vast(f'{d}/src/layouts/Base.astro', '<a class="skip-link" href="#main">Naar de inhoud</a>',
                 '<a class="skip-link" href="#main">Naar de inhoud</a>\n    <p class="demo-label">Demo-ontwerp · fictief bedrijf</p>')
    schrijf(f'{d}/src/styles/global.css', lees(f'{d}/src/styles/global.css') + LABEL_CSS)
    vervang_vast(f'{d}/src/pages/contact.astro',
                 "    if (!isLokaal) return;\n    e.preventDefault();\n    if (form.reportValidity()) location.href = '/bedankt';",
                 "    // Demo: er wordt niets verstuurd.\n    e.preventDefault();\n    if (form.reportValidity()) location.href = 'bedankt.html';")
    # Projectfoto is echt werk van het echte bedrijf: in de demo een neutrale plek
    p = f'{d}/src/pages/airconditioning.astro'
    s = lees(p)
    s = s.replace("import projectFoto from '../assets/project-dakopstelling.jpg';\n", '')
    s, n = re.subn(r'<Image src=\{projectFoto\}[^>]*/>',
                   '<div role="img" aria-label="Plek voor een projectfoto" style="aspect-ratio:4/3;display:grid;place-items:center;'
                   'background:repeating-linear-gradient(45deg,#dfe3e1 0 12px,#e9ecea 12px 24px);color:#4b5a5e;font-weight:600">'
                   'Plek voor een projectfoto</div>', s)
    if n != 1:
        sys.exit('Demo-script: projectfoto niet gevonden in airconditioning.astro')
    schrijf(p, s)
    os.remove(f'{d}/src/assets/project-dakopstelling.jpg')

    # te lange SEO-omschrijvingen na vervanging inkorten
    for dp, _, fs in os.walk(f'{d}/src/content'):
        for f in fs:
            if f.endswith('.md'):
                p = os.path.join(dp, f)
                s = lees(p)
                m = re.search(r'^seoOmschrijving: (.*)$', s, re.M)
                if m and len(m.group(1)) > 170:
                    # op hele zinnen inkorten
                    zinnen, kort = re.split(r'(?<=\.) ', m.group(1)), ''
                    for z in zinnen:
                        if len((kort + ' ' + z).strip()) > 170:
                            break
                        kort = (kort + ' ' + z).strip()
                    kort = kort or m.group(1)[:166].rsplit(' ', 1)[0] + '.'
                    schrijf(p, s.replace(m.group(0), f'seoOmschrijving: {kort}'))


def bouw(d):
    r = subprocess.run(['npx', 'astro', 'build'], cwd=d, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit(r.stdout[-3000:] + r.stderr[-3000:])


def maak_pub(d):
    pub = f'{d}/pub'
    if os.path.exists(pub):
        shutil.rmtree(pub)
    shutil.copytree(f'{d}/dist', pub)
    for f in ('sitemap-0.xml', 'sitemap-index.xml', 'robots.txt', 'llms.txt'):
        p = os.path.join(pub, f)
        if os.path.exists(p):
            os.remove(p)
    if os.path.exists(f'{pub}/images/og'):
        shutil.rmtree(f'{pub}/images/og')
    os.rename(f'{pub}/_astro', f'{pub}/assets')

    paginas = set()
    for dp, _, fs in os.walk(pub):
        for f in fs:
            if f.endswith('.html'):
                paginas.add(os.path.relpath(os.path.join(dp, f), pub)[:-5])

    for dp, _, fs in os.walk(pub):
        for f in fs:
            p = os.path.join(dp, f)
            if f.endswith(('.woff', '.woff2')):
                os.remove(p)
                continue
            if f.endswith('.css'):
                s = lees(p)
                s = re.sub(r'@font-face\{[^}]*\}', '', s).replace('url(/_astro/', 'url(')
                schrijf(p, s)
            elif f.endswith('.js'):
                schrijf(p, lees(p).replace('/_astro/', './'))
            elif f.endswith('.html'):
                diepte = os.path.relpath(p, pub).count('/')
                pre = '../' * diepte

                def pagina(m):
                    attr, pad, rest = m.group(1), m.group(2), m.group(3) or ''
                    if pad == '':
                        return f'{attr}="{pre}index.html{rest}"'
                    if pad in paginas:
                        return f'{attr}="{pre}{pad}.html{rest}"'
                    return m.group(0)

                s = lees(p)
                s = s.replace('/_astro/', '/assets/')
                s = re.sub(r'(href|src)="/(assets|images)/', lambda m: f'{m.group(1)}="{pre}{m.group(2)}/', s)
                s = s.replace('href="/favicon.svg"', f'href="{pre}favicon.svg"')
                s = re.sub(r'(href)="/([a-z0-9/-]*)([?#][^"]*)?"', pagina, s)
                s = s.replace("location.href = 'bedankt.html'", f"location.href = '{pre}bedankt.html'")
                s = s.replace('</head>', FONTS + '</head>', 1)
                schrijf(p, s)

    # Controle: geen absolute paden en geen echte gegevens meer
    fouten = []
    for dp, _, fs in os.walk(pub):
        for f in fs:
            p = os.path.join(dp, f)
            if not f.endswith(('.html', '.css', '.js', '.svg', '.txt', '.xml')):
                continue
            s = lees(p)
            fouten += [f'{f}: {m}' for m in re.findall(r'(?:href|src)="/[^"]*"|url\(/[^)]*\)', s)]
            fouten += [f'{f}: echte gegevens "{m}"' for m in set(VERBODEN.findall(s))]
    if fouten:
        sys.exit('Demo-script: controle mislukt\n' + '\n'.join(fouten[:30]))
    return pub


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    doel = os.path.abspath(sys.argv[1])
    if doel == REPO or doel.startswith(REPO + os.sep):
        sys.exit('Kies een doelmap buiten de repo.')
    kopieer(doel)
    anonimiseer(doel)
    bouw(doel)
    pub = maak_pub(doel)
    n = sum(len(fs) for _, _, fs in os.walk(pub))
    print(f'Demo klaar: {pub} ({n} bestanden)')


if __name__ == '__main__':
    main()
