# Overdracht: Mijn Moestuin (stand 2026-10-30)

Dit bestand is bedoeld om een nieuwe sessie in één keer op snelheid te brengen. Lees eerst dit, daarna pas code of de andere documenten.

## 1. Het project in drie zinnen

Mijn Moestuin is een rustige, Nederlandstalige (Vlaamse toon) moestuingids voor absolute beginners, gebouwd als **één statische webpagina** (`moestuin-start/index.html`: HTML, CSS en JavaScript, geen build). Doel: een beginner ziet snel wat hij nu kan doen, vindt de juiste uitleg, en weet wat hij moet doen als het misgaat. De eigenaar werkt met Claude Code als bouwer en bewaakt zelf doel en inhoud.

- Repo: `https://github.com/gtallpulse-hash/Mijn-Moestuin` (hernoemd van Houtprojecten). Lokale map: `C:\Users\trist\OneDrive\Bureaublad\moestuin`.
- Live (GitHub Pages, branch `main`, hoofdmap): `https://gtallpulse-hash.github.io/Mijn-Moestuin/`.

## 2. Afspraken met de eigenaar (belangrijk)

- **Taal en toon:** Nederlands, proper, klinisch, heel duidelijk. Geen AI-slop: geen emoji-versiering, geen kaartjesdashboards, geen opgeblazen teksten, geen nepdata.
- **Eerst onderzoek, dan voorstellen, dan vragen.** Bij twijfel eerst online zoeken bij ervaren bronnen, pas daarna zijn mening vragen. Voor grote wijzigingen: ontwerp, plan, goedkeuring, dan uitvoeren.
- **Branches:** `main` = stabiel en live (tag `v1-stabiel` = vaste terugvalpositie, commit `edc75da`). Nieuw werk op `test`. **Nooit samenvoegen met `main` of pushen zonder dat hij het vraagt.** Commits op `test` mogen zonder te vragen.
- **Eerlijk rapporteren:** zeggen wat niet getest is, wat een bron niet dekt en wat een inschatting is. Geen schijnzekerheid.
- Commitberichten eindigen met `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Git-identiteit staat repo-lokaal (Tristan, tristan.heremans@gmail.com).

## 3. Stand van zaken

| Onderdeel | Stand |
|---|---|
| `main` | `edc75da`, live, ongewijzigd. Bevat de oude versie (tabs Nu, Gewassen, Kalender, Tuin, Hulp, Gids). |
| `test` | `447e0f5`, **gepusht naar GitHub**. Bevat alle nieuw werk hieronder. Nog niet samengevoegd. |
| README | Staat op `test` (met schermafbeeldingen in `docs/img/`). Zichtbaar op de GitHub-voorpagina pas na samenvoegen. |

### Wat op `test` zit (acceptatie: alle 9 criteria gehaald, zie `docs/superpowers/specs/acceptatie-2026-10-26.md`)

1. **Kleuren en labels (fase 1):** drie gevalideerde fasekleuren (licht `#2a78d6`, `#c8501f`, `#0f8a63`; donker `#3987e5`, `#d95926`, `#199e70`). Fasen heten overal: *Zaai in huis* (open balk), *Zaai buiten* (gevulde balk), *Plant uit*, *Oogst*. Moeilijkheidsbolletjes zijn neutraal. Constante `FASEN` voedt alles.
2. **Kalender (fase 2):** tab Nu is weg; **Kalender** is het beginscherm met schakelaar *Deze maand | Jaaroverzicht*. Deze maand toont per fase maximaal 6 tegels ("Toon alle n") en een hint (`HINT`) per maand.
3. **Jaaroverzicht (fase 3):** 11 inklapbare groepen, compacte rijen (min. 44 px), "nu"-markering, zoekveld.
4. **Gids (fase 4):** 5 taakgroepen via presentatielaag `GROEPEN` (Begin hier 5, Zo doe je het 31, Weten waarom 12, Naslag 4; plagen 8 staan in Hulp via `PLAGEN`; kaart "Als het misgaat"). `GIDS`-data en artikel-id's zijn ongewijzigd.
5. **Artikelsjabloon (fase 5):** 10 artikels met kopjes *Wat doe ik / Hoe doe ik dat / Waar let ik op*; 8 tonen `bron` en `nagekeken`. *Wanneer is het rijp?* en *Voeding* hebben het sjabloon maar bewust **geen bron**.
6. **Eerder gebouwd (blijft werken):** tab **Tuin** (gewassen toevoegen, taken afvinken, plek, back-up exporteren/importeren, opslag in `localStorage` sleutel `mt-tuin-v1`), tab **Hulp** (10 problemen met mogelijke oorzaken, optioneel gewas kiezen), zoeksynoniemen (`SYN`, accent- en meervoudsongevoelig), foto's als WebP (59 stuks, 2,9 MB), toegankelijkheid (landmarks, 44 px, focus, `inert` bij popups).
7. Onafhankelijke review van de hele branch: 0 kritiek, 9 belangrijk (opgelost met tests), ~12 klein (zie 7).

## 4. Architectuur in het kort

- Eén bestand, geen build, vooral lange regels. Wijzigingen doe je het best met **Python-patchscripts** (lees bestand, `assert s.count(old)==1`, vervang, schrijf met `newline=""`), geschreven met het Write-hulpmiddel. **Gebruik geen backslashes of `\\n` in shell-heredocs**; die worden verminkt. Draai Python met `-I`.
- Toestand `S`: `tab` (`kal`, `alle`, `tuin`, `hulp`, `gids`), `kv` (`maand`/`jaar`), `m` (maand), `q`, `type`, `diep`, `plek`, `more`, `grp`, `jgrp`, `hulp`, `hg`, `gc` (gidsgroep of `"start"`), `ch`.
- Belangrijke functies: `render`, `renderChrome`, `viewKal/viewMaand/viewJaar`, `viewAlle`, `viewTuin`, `viewHulp`, `viewGids`, `tile`, `openDetail`, `openArticle`, `showSheet/closeOv`, `filtered` (gebruikt `zoekQ()`: zoekterm geldt alleen waar het zoekveld zichtbaar is), `faseLijst`, `starts`, `textCal`, `track`.
- Gegevens: `C` (59 gewassen: velden o.a. `zb`, `zd`, `pt`, `oo` = maandenlijsten, `pl`, `d`, `goed`/`slecht`), `GIDS` (10 categorieën, 60 artikels met blokken `p h ul ol tb tip warn more`), `SG` (Startersgids, 13 hoofdstukken), `HELP`, `HINT`, `PHOTOS`.

## 5. Testen

- Statisch: `python -I tests/static_checks.py` (15 controles).
- Gedrag (in de pagina): start vanuit de **hoofdmap van de repo** `python -m http.server 8124 --bind 127.0.0.1`, open `/moestuin-start/index.html?v=<n>`, dan in de console: `const m=await import('/tests/browser_checks.js'); JSON.stringify(await m.runAll())` (33 controles). Toegankelijkheid: `m.axeViolations()` (axe-core 4.10.2 via CDN). Overflow: `m.overflow()` na het instellen van de viewport (320, 375, 768).
- Kleuren: `validate_palette.js` uit de dataviz-skill; uitvoer staat in `docs/superpowers/specs/kleuren-validatie-2026-10-26.txt`.
- **Op de gsm bekijken:** server met `--bind 0.0.0.0` in de hoofdmap, dan `http://<IP van de pc>:8000/moestuin-start/index.html` op hetzelfde wifi (IP was 192.168.0.11; windows-firewall privé toestaan).

## 6. Bronnen en wat gecorrigeerd is

Gebruikt en gelezen: KMI (Ukkel, 1991 tot 2020: gemiddelde laatste vorst 27 maart, eerste 21 november), KNMI (De Bilt: ijsheiligenregel klopt in ~92% van de jaren), IVN factsheet Zaaien, Hubo (water geven), Leefmilieu Brussel infofiches (Irrigatie, Teelttechnieken, Gemakkelijke groenten, 2013), Velt (slakken), RHS (tomato blight), UC Master Gardener (kiemtemperaturen, in °F omgerekend), Tuinadvies.be (oudere afstandentabel).

Gecorrigeerd omdat bronnen ze niet bevestigden: "laatste vorst half april" (nu KMI-cijfers), "10 tot 15 L/m² per week", "avondwater trekt slakken aan".

## 7. Open punten

**Kleine, bewust uitgestelde punten:** focus gaat naar de pagina na maandkiezer/chips/groep openen/terugknop; "1 gewassen" (enkelvoud); geen resultaataantal voor schermlezers bij zoeken in het Jaaroverzicht; kapotte `sg-ch` (<0 of ≥13) laat de Gids crashen; twee "laatste vorst"-cijfers (KMI/KNMI) zonder uitleg; ijsheiligengrens varieert in de tekst; sectie toont 7 tegels zonder "Toon alle" (LIM+1); open "zaai in huis"-balk verborgen bij overlap met "zaai buiten"; enkele zwakke tests (o.a. `palet`, `jaarDonker`).

**Gegevensvraag:** gewasgegevens (zaaidiepte, afstand per gewas, bv. pompoen `afst "100-150 cm"`) wijken op punten af van de nieuwe artikels en zijn niet aan bronnen getoetst.

**Niet gedaan:** beginnerstest (geen testers; vijf opdrachten staan in de spec), test met een schermlezer.

## 8. Strategie (marktdocument geanalyseerd, nog niet uitgevoerd)

Kern: de waarde zit in informatie omzetten in de juiste actie op het juiste moment; onderscheid via persoonlijke coach, **herstelmodus** ("Welkom terug", achterstallige taken rustig herplannen) en betrouwbare, bronvermelde Vlaamse/Nederlandse gegevens. Eerlijke kanttekeningen: Makkelijke Moestuin heeft al een **gratis** app met persoonlijke taken en een winkel; "regionaal VL/NL" is geen automatisch voordeel; AI-claims zijn niet onderscheidend.

Geplande fasen (voorstel, nog niet goedgekeurd):
- **A** meting (privacyvriendelijke teller, bv. GoatCounter) en beginnerstest;
- **B** gegevens: bron, regio en nakijkdatum per gewas, numerieke duur in plaats van tekst;
- **C** tuinprofiel + plantdatum, taken uit de groeifase, "Waarom?" bij taken;
- **D** herstelmodus;
- **E** eigen webadressen per artikel/gewas (vindbaarheid, nu zit alles in één pagina) en een deelbare afbeelding.

Mijn inschatting van de kansen (oordeel, geen berekening; marktgrootte NL/BE niet gevonden): afgewerkt portfolio-project ~95%; kleine echte gebruikersgroep ~35 tot 50%; bedrijf met betekenisvol inkomen ~3 tot 8%. Retentie na 30 dagen ligt voor vergelijkbare apps rond 1 tot 15% (gezondheid en fitness 3,4 tot 3,9%).

**Drie vragen die nog openstaan:** wat is "succes" (hobby, gebruikers, inkomsten); akkoord met een cookievrije teller; blijven we statisch (installeerbare pagina) of later accounts/meldingen? Aanbeveling: eerst statisch.

## 9. Omgeving en hulpmiddelen

- Windows 10; `gh` en de `claude`-CLI staan niet op het pad. Python 3.12, Node 24, `pdftotext` beschikbaar.
- Plugins aan op het account: Design, Axe Accessibility (tools laden in sessie niet; vraagt Deque-inlog), GitHub, Skills For Real Engineers (Matt Pocock; mogelijk pas in een nieuwe sessie zichtbaar). Skills: `web-design-guidelines`, `frontend-design`, `web-perf` (geïnstalleerd), `find-skills`.
- `.superpowers/` (ledger met alle beslissingen) is git-ignored en lokaal; de belangrijkste inhoud staat in dit bestand en in het acceptatiebestand.
- Documenten: `docs/superpowers/specs/2026-10-26-kalender-gids-design.md` (ontwerp), `docs/superpowers/plans/2026-10-26-kalender-gids.md` (plan), `docs/superpowers/specs/acceptatie-2026-10-26.md` (bewijs), `README.md`.

## 10. Voorstel voor de eerstvolgende stap

1. Laat de eigenaar de `test`-versie bekijken (gsm of lokaal) en beslissen over samenvoegen met `main`.
2. Beantwoord de drie strategievragen (par. 8).
3. Begin dan met fase **A** (meting en beginnerstest) en **B** (gegevens met bronnen); werk in kleine, afgebakende wijzigingen met ontwerp, plan en tests, zoals hierboven.
4. Eventueel (niet goedgekeurd): een korte `CLAUDE.md` met deze afspraken.
