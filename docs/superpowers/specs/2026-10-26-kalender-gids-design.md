# Ontwerp: Kalender (K2) en Gids in 5 taakgroepen

Status: voorstel, wacht op review. Gebouwd op branch `test`. Niets hiervan is geïmplementeerd.
Datum: 2026-10-26. Bestand: `moestuin-start/index.html`.

## 1. Doel

Een beginner moet binnen enkele seconden zien wat hij nu kan doen (Kalender) en de juiste uitleg vinden zonder een lijst van tien onderwerpen te doorzoeken (Gids).

Uitgangspunten uit het document "professioneel zonder AI-slop":
- één primaire taak per scherm;
- progressieve onthulling, zonder kerninformatie te verstoppen;
- kleur functioneel en consistent, nooit de enige drager van informatie;
- dezelfde woorden voor dezelfde dingen;
- niets bouwen zonder aantoonbare reden.

## 2. Wat dit lost op (vastgestelde feiten over de huidige app)

| # | Bevinding | Bewijs |
|---|---|---|
| F1 | De vier kalenderkleuren falen de kleurcontrole. Groen (buiten zaaien) en bruin (planten) zijn bij protanopie nauwelijks te onderscheiden (verschil 2,8; minimum 8). Normaal zicht: 11,6 (vereist 15). Blauw (`#2F7391`) is te grijs. | `validate_palette.js`, 2026-10-26 |
| F2 | Rood betekent twee dingen: oogst (balk) en moeilijk (bolletjes naast de naam). Rood is bovendien een foutkleur. | Screenshot Kalender |
| F3 | Timing staat op drie plekken: tabblad Nu, tabblad Kalender, gewasdetail. De Kalender beantwoordt "wat kan ik nu?" niet; dat vergt scrollen door 59 rijen van 85 px. | Code en screenshot |
| F4 | Drie bedieningslagen vóór de inhoud (knoppen, legenda over twee regels, filterchips). | Screenshot |
| F5 | "Binnen voorzaaien" is jargon. Onderzoek wijst aan dat het verschil tussen binnen en buiten zaaien de grootste beginnersverwarring is. | garden.org, forumbijdragen |
| F6 | De Gids heeft twee structuren zonder label: Startersgids (13 hoofdstukken) en 60 artikels in 10 onderwerpen, met overlap (hoofdstuk 9 herhaalt Plagen). | Code |
| F7 | Plagen staan in de Gids én in de nieuwe Hulp-tab. | Code |

## 3. Wat dit niet doet (buiten scope)

- Geen weersintegratie, geen regio-instelling, geen account.
- Geen nieuwe functies in Tuin of Hulp, behalve de plaag-lijst (zie 6.4).
- Geen herschrijving van de 60 artikels (alleen een sjabloon voor 10, fase 5).
- Geen zoekfunctie in de Gids (mogelijk later; dat vereist eerst een beginnerstest).

## 4. Kalender (K2): Nu en Kalender samenvoegen

### 4.1 Navigatie

Het tabblad **Nu** vervalt. Het tabblad **Kalender** wordt het beginscherm.
Menu van zes naar vijf knoppen: **Kalender, Gewassen, Tuin, Hulp, Gids**.

Bovenaan de Kalender staat een schakelaar met twee knoppen:

```
[ Deze maand ]  [ Jaaroverzicht ]
```

Standaard: **Deze maand**.

### 4.2 Weergave "Deze maand"

Doel: het antwoord op "wat kan ik nu doen?".

```
Oktober                                   <- h1
Dit kan je doen in oktober.               <- sub
jan feb mrt ... [okt] nov dec             <- maandkiezer (bestaat al)
[ Alleen makkelijk ]  [ Filter ]          <- bestaande balk

Let op: <één zin, alleen in maanden waar vorst of timing telt>

Zaai in huis (n)       <- h2, alleen als n > 0
 [tegel] [tegel] ...  6 tegels, daarna "Toon alle n"
Zaai buiten (n)
Plant uit (n)
Oogst (n)
```

Regels:
- Volgorde van de secties volgt de tijdlijn van een gewas: in huis zaaien, buiten zaaien, uitplanten, oogsten.
- Een gewas kan in meerdere secties staan. Dat is correct (de acties zijn verschillend). Elke sectie toont maximaal 6 tegels en een knop "Toon alle n" (bestaand patroon).
- Tegels tonen foto, naam en niveau. De sectiekop zegt al welke actie het is, dus de actiepil op de tegel vervalt in deze weergave. Elders (Tuin, Gewassen) blijft de pil bestaan.
- De sectie "Volgende maand" vervalt. De maandkiezer dekt dat.
- Lege toestand: "In oktober valt er niets te zaaien of planten. Kijk bij oogst, of kies een andere maand."
- De hint "Let op" komt uit de bestaande Gids-teksten (klimaat, ijsheiligen). Inhoud: zie 4.6.

### 4.3 Weergave "Jaaroverzicht"

Doel: het hele jaar van één gewas in één oogopslag.

```
Jaaroverzicht
[ Alleen makkelijk ] [ Filter ]      zoek [..........]
Legenda:  [▭ Zaai in huis] [■ Zaai buiten] [■ Plant uit] [■ Oogst]

Vruchtgroente  7 gewassen   [+]      <- inklapbaar zoals bij Gewassen
  J F M A M J J A S O N D
  Aubergine   Makkelijk
  zaaien   ·▭▭▭···········       ▭ = in huis (open), ■ = buiten (gevuld)
  planten  ·····■■········
  oogst    ········■■■■···
```

Regels:
- Gewassen staan in de 11 bestaande groepen, standaard **ingeklapt** (zelfde patroon en code als het tabblad Gewassen). Bij zoeken of filteren klappen ze open.
- Drie rijen per gewas blijven (zaaien, planten, oogst), maar compacter: balkhoogte 8 px, afstand 4 px, rij ongeveer 56 px in plaats van 85 px.
- **Open balk = binnen zaaien, gevulde balk = buiten zaaien.** Zo hoeven beide dezelfde kleur te delen en is het onderscheid niet van kleur afhankelijk.
- De huidige maand heeft een zichtbare kolomband en een label "nu" boven de maandletter. De letter zelf is niet alleen een kleurverschil.
- Niveau staat als woord ("Makkelijk"), niet als gekleurde bolletjes.
- Elke rij is een knop naar het gewasdetail; de `aria-label` bevat de tekstversie (bestaande `textCal`). De weergave "Deze maand" is het tabel-equivalent.
- Geen waarden op de balken, geen tooltip nodig.

### 4.4 Namen van de fasen (overal gelijk)

| Code | Nieuw label | Was |
|---|---|---|
| `zb` | Zaai in huis | Binnen voorzaaien |
| `zd` | Zaai buiten | Buiten zaaien |
| `pt` | Plant uit | Planten |
| `oo` | Oogst | Oogst |

Geldt voor: tegelpillen, legenda, sectiekoppen, Tuin-taken, gewasdetail, `aria-label`s, en de teksten in de Gids die "voorzaaien" gebruiken waar het de fase betreft. Het woord "voorzaaien" wordt één keer uitgelegd in de Woordenlijst.

### 4.5 Kleuren (gevalideerd)

Drie tinten voor drie fasen. Zaai in huis en Zaai buiten delen de tint en verschillen in vulling.

| Fase | Licht | Donker |
|---|---|---|
| Zaaien (open/gevuld) | `#2a78d6` | `#3987e5` |
| Plant uit | `#c8501f` | `#d95926` |
| Oogst | `#0f8a63` | `#199e70` |

Controle met `validate_palette.js` (oppervlak licht `#eaeedf`, donker `#12170e`):

| Controle | Licht | Donker |
|---|---|---|
| Lichtheidsband | PASS | PASS |
| Chroma | PASS | PASS |
| Kleurenblindheid (kleinste verschil) | PASS, 9,9 (deutan) | PASS, 9,4 (deutan) |
| Normaal zicht (kleinste verschil) | PASS, 24,9 | PASS, 26,5 |
| Contrast met achtergrond (≥ 3:1) | PASS | PASS |

Overige regels:
- Tekst in tegels, pillen en legenda gebruikt de inktkleur. De fasekleur staat alleen op een kleine stip of balk.
- Moeilijkheidsbolletjes worden neutraal (inkt, gevuld en leeg). Geen rood, geel of groen meer.
- Groen als primaire accentkleur van de app (knoppen) blijft; het is een andere tint dan de oogstkleur en verschijnt niet in dezelfde grafiek.

### 4.6 Hint "Let op deze maand"

Eén zin, alleen waar tijd of vorst telt. Bron: bestaande Gids-artikels "Het klimaat in Vlaanderen" en "De ijsheiligen en vorst".

| Maanden | Inhoud (concept, nog te controleren) |
|---|---|
| feb, mrt | Warmteminnende gewassen zoals tomaat en paprika zaai je nu alleen binnen. |
| apr | De laatste nachtvorst valt gemiddeld rond half april, maar kan later komen. |
| mei | Plant vorstgevoelige gewassen pas na de ijsheiligen (11 tot 13 mei). |
| okt, nov | De eerste vorst valt gemiddeld tussen half oktober en begin november. |
| andere | geen hint |

De zinnen worden vóór implementatie nagelezen aan de bronnen in de Gids. Er komt geen advies bij dat nergens gebaseerd is.

## 5. Gids: vijf taakgroepen

### 5.1 Structuur

Elke gebruikerstaak heeft één ingang (Diátaxis: leren, doen, uitleg, naslag, plus herstel).

| Groep | Soort | Inhoud |
|---|---|---|
| **Begin hier** | leren | Startersgids (13 hoofdstukken, onveranderd) en 5 voorbereidende artikels |
| **Zo doe je het** | doen | 31 artikels in 6 subkoppen |
| **Als het misgaat** | herstellen | kaart die naar de tab **Hulp** gaat |
| **Weten waarom** | uitleg | 12 artikels |
| **Naslag** | opzoeken | 4 artikels, plus de bestaande blokken "Buren in één oogopslag" en "Bronnen en controle" |

Gidspagina: bovenaan de Startersgids-kaart (zoals nu), daarna vier groepskaarten en één kaart "Als het misgaat". Een groepskaart opent een lijst (bestaand patroon `S.gc`). In "Zo doe je het" staan de artikels onder subkoppen, omdat 31 artikels in één platte lijst te veel zijn.

### 5.2 Indeling van de 60 artikels

Artikel-id's en paden blijven gelijk. Alleen de weergave verandert; de gegevens in `GIDS` en alle bestaande verwijzingen blijven werken.

**Begin hier (5)**: waar-begin-ik, plek-kiezen, pot-bak-grond, gereedschap, eerste-jaar.

**Zo doe je het (31)**
- Zaaien en planten (7): zaaien-binnen-buiten, zaaigrond-licht, verspenen-afharden, kiemtijd, zaad-kopen, plantafstand, plantjes-kopen
- Verzorgen (8): water-geven, regenwater, onkruid, steun, tomaat-verzorgen, snoeien, mulchen, weinig-tijd
- Grond en voeding (3): compost, potgrond, groenbemesters
- Oogsten en bewaren (5): oogst-wanneer, bewaren, invriezen, drogen, zaad-bewaren
- Seizoen en kleine ruimtes (5): kas-koude-bak, winter-groenten, balkon, schaduw, verticaal
- Slim combineren (3): tussenteelt, drie-zusters, helpers

**Weten waarom (12)**: grondsoorten, ph-kalk, voeding, klimaat, ijsheiligen, vier-seizoenen, droogte-hitte, combi-hoe, vruchtwisseling, families, groenten-groepen, soort-rassen.

**Naslag (4)**: combi-goed, combi-slecht, woordenlijst, faq.

**Verhuist naar Hulp (8)**: slakken, bladluis, koolwitje, wortelvlieg, phytophthora, meeldauw, dieren, plagen-overzicht.

Controle: 5 + 31 + 12 + 4 + 8 = 60. Elk artikel staat in precies één groep.

### 5.3 Hulp krijgt de plaaglijst

Op het beginscherm van Hulp, onder de 10 problemen, komt een blok "Plagen en ziektes opzoeken" met de 8 artikels. Het bestaande blok "Liever zelf zoeken?" gaat daarin op. Dit voorkomt dubbele ingangen (F7).

### 5.4 Artikelsjabloon (alleen voor 10 artikels, fase 5)

Drie delen: **Wat doe ik**, **Hoe doe ik dat**, **Waar let ik op**. Onderaan bron en nakijkmaand. Prioriteit: zaaien-binnen-buiten, water-geven, ijsheiligen, klimaat, kiemtijd, plantafstand, oogst-wanneer, voeding, slakken, phytophthora.

Bron en nakijkmaand worden alleen getoond als ze echt zijn ingevuld. Geen plaatsvervangende tekst.

## 6. Gevolgen voor de code

| Onderdeel | Wijziging |
|---|---|
| Tabs (`T` in `renderChrome`, `ICONS`, dispatcher, `S.tab`) | `nu` verwijderen; `kal` wordt beginscherm. Beginstand `S.tab="kal"` |
| `viewNu`, `viewKal` | samengevoegd tot `viewKal` met twee weergaven; nieuwe stand `S.kv` ("maand" of "jaar") |
| `KIND`, `TKIND`, legenda | nieuwe labels (4.4) |
| CSS `.k-zb`, `.k-zd`, `.k-pt`, `.k-oo`, `.k-*-t`, `.dots` | nieuwe kleurtokens licht en donker; open balk voor `zb`; neutrale bolletjes |
| `miniRow` in gewasdetail | zelfde klassen, dus automatisch bijgewerkt; open balk toepassen |
| Gids (`viewGids`, `S.gc`, categoriepagina) | groepenlaag `GROEPEN` boven `GIDS`; subkoppen; kaart "Als het misgaat" |
| Hulp | blok met plaaglijst |
| Teksten in Gids die "pagina Nu" noemen (4 plekken) | wijzigen naar "Kalender" |
| Hint per maand | nieuwe kleine gegevenstabel `HINT` |

Aandachtspunten:
- `starts(c,m)` en de gegevens `zb`, `zd`, `pt`, `oo` blijven ongewijzigd.
- Tuin-taken gebruiken `TKIND`; de nieuwe labels komen mee.
- Zoeksynoniemen, Tuin-opslag en back-up blijven onaangeroerd.

## 7. Risico's en randgevallen

| Risico | Aanpak |
|---|---|
| Een gewas verschijnt in meerdere secties van "Deze maand" | bewust; maximaal 6 tegels per sectie; beoordelen in de beginnerstest |
| Maand zonder activiteit | lege toestand met wegwijzer (4.2) |
| Hintzin klopt niet voor elke regio | formuleren als gemiddelde; bron vermelden; geen datum als schijnprecisie |
| Open versus gevulde balk wordt niet begrepen | uitleg in de legenda; testen met beginners |
| Smal scherm (320 px) | geen horizontale overflow; menu met vijf knoppen heeft ruimte |
| Donkere modus | eigen waarden, apart gevalideerd (4.5) |
| Oude verwijzingen naar tab "Nu" | geen opgeslagen tabstand; alleen tekst in de Gids aanpassen |
| Artikel dat in geen groep terechtkomt | een controlescript telt alle 60 artikels |

## 8. Acceptatiecriteria

1. `validate_palette.js` geeft PASS in licht en donker voor de definitieve kleuren (uitvoer bewaard).
2. axe-core: 0 overtredingen op Kalender (beide weergaven), Gids (alle groepen), Hulp, gewasdetail, Tuin.
3. Geen horizontale overflow op 320, 375 en 768 px.
4. Op 375 × 812 px toont het beginscherm: titel, schakelaar, maandkiezer en minstens één sectiekop met tegels, zonder te scrollen.
5. De tekst "Binnen voorzaaien" komt niet meer voor in de interface.
6. Alle 60 artikels bereikbaar, elk in één groep; Plagen bereikbaar via Hulp.
7. Geen opgeslagen gegevens (Tuin, afgevinkte taken) gaan verloren.
8. Alle interactieve elementen minstens 44 px hoog.
9. Gedragstest in de browser: schakelaar, maandwissel, "Toon alle", inklappen van groepen, openen van een artikel via elke groep.

Beginnerstest (alleen als testers beschikbaar zijn; doelen zijn voorstellen, geen eis):
- Opdracht 1: "Je hebt nog nooit groenten gekweekt. Zoek uit wat je nu kunt beginnen."
- Opdracht 2: "Zoek op hoe je tomaten moet verzorgen."
- Opdracht 3: "Je plant krijgt gele bladeren. Zoek wat je kunt doen."
- Opdracht 4: "Zoek uit wat 'voorzaaien' betekent."
- Doel: minstens 4 van 5 testers voltooien opdracht 1 binnen 60 seconden zonder hulp.

## 9. Fasering

Elke fase is één afgebakende, terugdraaibare wijziging met eigen controle en eigen commit op `test`.

| Fase | Inhoud |
|---|---|
| 1 | Kleuren, labels en neutrale bolletjes in alle bestaande weergaven |
| 2 | Tabs samenvoegen en weergave "Deze maand" met hint |
| 3 | Weergave "Jaaroverzicht" |
| 4 | Gids in 5 groepen en plaaglijst in Hulp |
| 5 | Artikelsjabloon, bron en nakijkmaand voor 10 artikels |

Voorstel, buiten de goedgekeurde scope: **fase 0**, een beknopte `CLAUDE.md` en een kleine map `docs/` (productprincipes, designregels, schrijfregels, checklist), zoals het document aanbeveelt.

## 10. Open punten

1. Naam van het beginscherm: "Kalender" (voorstel) of een andere naam?
2. Beginnerstest: zijn er testers beschikbaar? Zonder test blijven de keuzes onderbouwd door onderzoek, maar niet getest.
3. Hintzinnen (4.6): jij leest ze na vóór publicatie, naast mijn controle aan de Gids.

## 11. Bronnen

- Canonical, [Diátaxis](https://ubuntu.com/blog/diataxis-a-new-foundation-for-canonical-documentation): vier soorten documentatie niet mengen.
- Europa Web Guide, [Navigation system](https://commission.europa.eu/resources/europa-web-guide/planning-your-web-presence/architecture-and-navigation/navigation-system_en): taakgerichte navigatie; waarschuwing bij te veel verstopte inhoud.
- NN/g, [Progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/).
- Makkelijke Moestuin, [Kennisbank](https://makkelijkemoestuin.nl/kennisbank): structuur met "Wat zie je?" en maandlijst.
- Hubo, [Zaaikalender](https://www.hubo.be/nl/hulp-en-advies/tuin/moestuin/zaaikalender/) en RHS, [Jobs per maand](https://www.rhs.org.uk/advice/in-month/march/jobs).
- garden.org, [Creating a Planting Calendar](https://garden.org/courseweb/vegetables/CLASS3/c3p3.html): terugtellen vanaf de laatste vorst.

Beperking: er is geen onderzoek gevonden dat balken beter werken dan een lijst voor beginners. Daarom is de lijst de standaard en de balk optioneel.
