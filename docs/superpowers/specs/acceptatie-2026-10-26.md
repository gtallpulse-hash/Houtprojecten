# Acceptatie: Kalender en Gids (2026-10-26)

Uitgevoerd op branch `test`, lokale testserver, Chromium in de browserpaneel.
Commando's: `python -I tests/static_checks.py` en `runAll()` uit `tests/browser_checks.js`.

## Resultaat per criterium (spec, hoofdstuk 8)

| # | Criterium | Uitkomst | Bewijs |
|---|---|---|---|
| 1 | Kleurcontrole licht en donker | **Gehaald** | `kleuren-validatie-2026-10-26.txt`: ALL CHECKS PASS in beide thema's |
| 2 | axe-core: 0 overtredingen | **Gehaald** | axe-core 4.10.2: 14 weergaven in licht én donker (28 scans), 0 overtredingen. Weergaven: Kalender maand, Jaaroverzicht, Gewassen, Tuin, Hulp (start en detail), Gids (start, vier groepen, Startersgids), gewasdetail, artikel |
| 3 | Geen horizontale overflow op 320, 375 en 768 px | **Gehaald** | 11 weergaven plus gewasdetail op elke breedte: geen overflow |
| 4 | Beginscherm op 375 x 812 toont titel, schakelaar, maandkiezer en minstens één sectie met tegels zonder scrollen | **Gehaald** | Titel tot 97 px, schakelaar tot 194, maandkiezer tot 255, sectiekop tot 485, eerste tegel tot 678; het menu begint op 737 |
| 5 | "Binnen voorzaaien" komt niet meer voor | **Gehaald** | statische controle `labels`: 0 keer |
| 6 | 60 artikels bereikbaar, elk in één groep, Plagen via Hulp | **Gehaald** | controles `groepen`, `alleArtikels`, `hulpPlagen`: 5 + 31 + 12 + 4 + 8 = 60; alle 60 openen; 46 "Meer weten"-links in de Startersgids verwijzen naar bestaande artikels |
| 7 | Geen verlies van opgeslagen gegevens | **Gehaald** | Tuin (`mt-tuin-v1`) met afgevinkte taak en Startersgids-stand (`sg-ch`) overleven een herlaad; taken tonen de nieuwe labels |
| 8 | Alle interactieve elementen minstens 44 px | **Gehaald, met één uitzondering** | controle `doelen44` op 9 weergaven, de 13 Startersgids-hoofdstukken, twee artikels en de vergelijking (na de reviewer-fixpas; eerder bleken de hoofdstukpunten 36 px en de "Meer weten"-knoppen ongeveer 32 px). Uitzondering: links in lopende tekst (bijvoorbeeld "Bron" in de fotocredit en bronnenlijst) zijn uitgezonderd; WCAG 2.2 kent die uitzondering voor doelgrootte |
| 9 | Gedragstest | **Gehaald** | 33 van 33 browsercontroles en 15 van 15 statische controles |

## Afwijkingen en vondsten tijdens het werk

- Jaaroverzicht: rij minimaal 44 px (spec noemde ongeveer 56 px) zodat criterium 8 klopt.
- Afstand tussen de drie balklijnen 2 px in plaats van 4 px, voor een compacte rij.
- Het artikel-id is `soorten-rassen`, niet `soort-rassen`.
- Hintzin voor februari en maart is gewijzigd omdat de oorspronkelijke zin niet door de Gids gedekt werd.
- **Vorstdata gecorrigeerd.** De app noemde als gemiddelde "laatste vorst rond half april" en "eerste vorst tussen half oktober en begin november". Het KMI geeft voor Ukkel (1991 tot 2020) 27 maart en 21 november. Het klimaatartikel, de voetregel en de hints zijn aangepast. Ukkel is één weerstation in Brussel; op andere plekken kan het afwijken.
- **Water geven.** Het artikel noemde 10 tot 15 liter per m² per week en dat 's avonds water geven slakken aanlokt. Geen van de geraadpleegde bronnen bevestigde dat; beide zijn weggelaten. De vingertest volgt nu Leefmilieu Brussel (hand op 10 cm diepte).

## Wat niet gedekt is

- **Twee artikels hebben het sjabloon maar geen bron:** *Wanneer is het rijp?* en *Voeding: stikstof, fosfor en kalium*. In de geraadpleegde bronnen vond ik geen dekking voor hun kernclaims. Ze tonen daarom geen bronregel.
- **Bronnen die ik niet kon lezen of die zwak zijn:** het KMI-document is een samenvattend overzicht zonder uitgebreide definitie van "vorstdag"; de tabel van Tuinadvies.be is ouder; de kiemgegevens komen uit een Amerikaanse tabel (UC Master Gardener) in graden Fahrenheit, omgerekend naar Celsius. Controleer ze waar mogelijk nog aan een lokale zaadleverancier.
- **Beginnerstest:** niet uitgevoerd (geen testers). De vijf opdrachten staan in de spec.
- **Handmatig getest met een schermlezer:** nee. Automatische controles vinden maar een deel van de toegankelijkheidsproblemen.

## Onafhankelijke review van de hele branch

Een reviewer in een nieuwe context (zonder browser) las de hele branch: 0 kritieke bevindingen, 9 belangrijke, ongeveer 12 kleine. Alle 9 belangrijke zijn opgelost, elk met een eerst falende test:

1. Een zoekterm uit het Jaaroverzicht filterde ook "Deze maand" zonder zichtbare oorzaak. Zoeken geldt nu alleen waar het zoekveld zichtbaar is.
2. Hoofdstukpunten van de Startersgids (36 px) en "Meer weten"-knoppen (ongeveer 32 px) zijn 44 px; de test dekt die weergaven nu.
3. Hulp en het phytophthora-artikel spraken elkaar tegen over afvoer ("restafval" tegenover composthoop) en over aangetaste delen tegenover hele planten; nu één lijn. Het artikel meldt dat de bron een Britse pagina is.
4. Water geven en het droogteartikel spraken elkaar tegen over moment en verbranding. De verbrandingsclaim is weggelaten, het einde van de dag is toegevoegd en het artikel zegt dat het voor volle grond geldt.
5. Kiemtijd: tuinboon 2 tot 5 cm (was inconsistent), wortel twee tot drie weken in het voorjaar, en een verwijzing naar de gewaspagina en het zaadzakje.
6. Plantafstand: verwijzing naar de gewaspagina; de pompoenillustratie in de Startersgids noemt alleen nog courgette (1 plant per m²).
7. De hint voor februari noemde tomaat, die dan niet bij "Zaai in huis" staat; nu alleen paprika. Een nieuwe test vergelijkt hint en lijst.
8. De koppen in Tuin heten nu "Plant uit" en "Oogst".
9. Een artikel toont nu zijn groep (bijvoorbeeld "Zo doe je het › Verzorgen") in plaats van het oude onderwerp.

Open gebleven (bewust, kleine punten): zie het ledger (`Final: minor (deferred)`), onder meer de focus na het wisselen van maand, het enkelvoud "1 gewassen", het aantal resultaten voor schermlezers bij zoeken in het Jaaroverzicht, en een kapotte `sg-ch`-waarde. Een gegevensvraag blijft: de gewaspagina's (zaaidiepte en afstand per gewas) wijken op enkele punten af van de artikels en zijn niet aan bronnen getoetst.
