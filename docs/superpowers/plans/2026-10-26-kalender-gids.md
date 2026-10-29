# Kalender (K2) en Gids in 5 taakgroepen: implementatieplan

> **Voor uitvoerders:** gebruik superpowers:subagent-driven-development (aanbevolen bij onafhankelijke taken) of superpowers:executing-plans. Stappen gebruiken selectievakjes (`- [ ]`).

**Doel:** de Kalender en de Gids zo herbouwen dat een beginner direct ziet wat nu kan en de juiste uitleg vindt.

**Architectuur:** één bestand (`moestuin-start/index.html`, gewone HTML, CSS en JavaScript, geen build). Eén centrale constante `FASEN` voedt labels, kleuren en legenda. De Gids krijgt een presentatielaag `GROEPEN` boven de ongewijzigde `GIDS`-gegevens. Controles zijn twee kleine testbestanden buiten de site.

**Techniek:** Python 3 (statische controles), JavaScript in de browser (gedragscontroles), axe-core 4.10.2 via CDN (alleen in tests), `validate_palette.js` (kleurcontrole uit de dataviz-skill).

**Spec:** `docs/superpowers/specs/2026-10-26-kalender-gids-design.md`. Lees die eerst.

## Globale eisen (gelden voor elke taak)

- Kleuren licht: zaaien `#2a78d6`, plant uit `#c8501f`, oogst `#0f8a63`. Donker: `#3987e5`, `#d95926`, `#199e70`.
- Labels, overal gelijk: `zb` = "Zaai in huis", `zd` = "Zaai buiten", `pt` = "Plant uit", `oo` = "Oogst". De tekst "Binnen voorzaaien" komt nergens meer voor.
- Open balk = Zaai in huis (`zb`), gevulde balk = Zaai buiten (`zd`).
- Tekst gebruikt de inktkleur, nooit de fasekleur. Moeilijkheidsbolletjes zijn neutraal (inkt, gevuld en leeg).
- "Deze maand": maximaal 6 tegels per sectie en daarna "Toon alle n" (bestaand patroon; bij 7 of minder toont de sectie alles).
- Alle interactieve elementen minstens 44 px hoog.
- Alle 60 artikels staan in precies één groep. Artikel-id's en paden (`catId/artId`) en `GIDS` blijven ongewijzigd, behalve in taak 5 (alleen de 10 genoemde artikels).
- Geen advies zonder bron. Een `bron` en `nagekeken` worden alleen getoond als ze echt zijn ingevuld.
- Opgeslagen sleutels blijven `mt-tuin-v1` en `sg-ch`.
- Alleen werken op branch `test`. Niet samenvoegen met `main`.
- Commit en push alleen na akkoord van de gebruiker. "Commit" in dit plan betekent: toon wat er gewijzigd is en vraag toestemming.
- Geen nieuwe afhankelijkheden in de site. Alleen `index.html` en de mappen `tests/` en `docs/` mogen wijzigen.

## Review-focus (wat de spec niet expliciet test)

1. Een maand of zoekopdracht zonder resultaat: een nette lege toestand, geen lege koppen (taak 2).
2. Bestaande Tuin-gegevens en afgevinkte taken blijven bewaard en tonen de nieuwe labels (taken 1 en 6).
3. Donkere modus: open en gevulde balken zijn zichtbaar en de rand haalt 3:1 contrast (taken 1 en 3).
4. Oude artikelverwijzingen (`plagen/...`, "Meer weten" in de Startersgids) blijven werken na hergroeperen, en de terugknop brengt je terug (taak 4).
5. Zoeken in het Jaaroverzicht opent de juiste groepen, 0 resultaten geeft een melding, en na een klik op de schakelaar blijft de toetsenbordfocus op die knop (taken 2 en 3).

## Bestandsstructuur

- Wijzig: `moestuin-start/index.html`.
- Nieuw: `tests/static_checks.py` (leest `index.html` als tekst).
- Nieuw: `tests/browser_checks.js` (ES-module; draait in de pagina via de browsertool).
- Nieuw: `docs/superpowers/specs/kleuren-validatie-2026-10-26.txt` en `acceptatie-2026-10-26.md` (bewijs).

**Testen starten:**
- Lokale server vanaf de hoofdmap van de repo: `python -m http.server 8123 --bind 127.0.0.1` (stop eerst de oude server die in `moestuin-start` draait).
- Pagina: `http://127.0.0.1:8123/moestuin-start/index.html?v=<nummer>`. Gebruik telkens een nieuw `v`-nummer tegen cache.
- Statisch: `python -I tests/static_checks.py` (geeft PASS of FAIL per controle; afsluitcode 1 bij een fout).
- Browser: in de pagina `JSON.stringify(await (await import('/tests/browser_checks.js')).runAll(["naam1","naam2"]))`. Zonder namen draait alles.

---

### Taak 0: Testhulpmiddelen

**Bestanden:** maak `tests/static_checks.py`, `tests/browser_checks.js`.

**Interfaces**
- Produceert: `static_checks.py` met functie `check(naam: str, ok: bool, detail: str = "") -> None` die PASS/FAIL print en bij een fout `sys.exit(1)` aan het einde veroorzaakt; leest `moestuin-start/index.html` in de variabele `SRC`.
- Produceert: `browser_checks.js` exporteert `checks: Record<string, () => Promise<{ok: boolean, detail?: string}>>`, `runAll(names?: string[]): Promise<Record<string, {ok: boolean, detail?: string}>>` en de hulpfuncties `sleep(ms)`, `go(tab: string)`, `theme(mode: "light"|"dark")`, `axeViolations(): Promise<string[]>` (laadt axe-core 4.10.2 van `https://cdn.jsdelivr.net/npm/axe-core@4.10.2/axe.min.js`), `overflow(): boolean`.

- [ ] **Stap 1: Schrijf de basiscontroles die nu moeten slagen**
  - statisch `sleutels`: `SRC.count('"mt-tuin-v1"') >= 1` en `SRC.count('"sg-ch"') >= 1`.
  - browser `artikels60`: `GIDS.reduce((s,g)=>s+g.arts.length,0) === 60`.
  - browser `geenOverflow`: `overflow() === false` op het beginscherm.
- [ ] **Stap 2: Draai ze op de huidige code**
  - Verwacht: alle drie PASS (dit is de uitgangspositie).
- [ ] **Stap 3: Commit** `tests/`, de spec en dit plan (met toestemming): bericht `docs: ontwerp en plan Kalender en Gids; testhulpmiddelen`.

---

### Taak 1: Fase 1. Kleuren, labels en neutrale bolletjes

**Bestanden:** wijzig `moestuin-start/index.html` (CSS-blok bovenaan, `KIND`, `TKIND`, legenda in `viewKal`, `tile`, `miniRow`, `.dots`); test in `tests/`.

**Interfaces**
- Produceert: `const FASEN = [["zb","Zaai in huis"],["zd","Zaai buiten"],["pt","Plant uit"],["oo","Oogst"]]`; `faseLabel(k: string): string`; CSS-variabelen `--f-zaai`, `--f-plant`, `--f-oogst` in de drie thema-bereiken (`:root`, `@media (prefers-color-scheme: dark) :root:not([data-theme="light"])`, `:root[data-theme="dark"]`); klassen `.k-zb` (open: transparante vulling, 2 px rand in `--f-zaai`), `.k-zd` (gevuld `--f-zaai`), `.k-pt` (`--f-plant`), `.k-oo` (`--f-oogst`).
- Verbruikt later: taken 2 en 3 gebruiken `FASEN` en deze klassen.

- [ ] **Stap 1: Schrijf de falende controles**
  - statisch `labels`: `SRC.count("Binnen voorzaaien") == 0`.
  - statisch `palet`: alle zes hex-waarden uit de globale eisen komen voor (hoofdletterongevoelig).
  - browser `fasekleuren`: voor elk thema (`theme("light")`, `theme("dark")`): `getComputedStyle` van `.legend .k-zd` heeft achtergrond gelijk aan het token; `.legend .k-zb` heeft transparante achtergrond en `border-top-color` gelijk aan het token; `.k-pt` en `.k-oo` idem.
  - browser `bolletjesNeutraal`: de achtergrond van `.dots i.on` is in alle drie niveaus gelijk en niet gelijk aan een fasekleur.
  - browser `tuinLabels`: na `TUIN.crops=["tomaat"]` toont de Tuin-tab de labels uit `FASEN` in kleine letters (bijvoorbeeld "oogst"), nooit "binnen voorzaaien".
  - browser `pilStip`: een `.act` op een tegel bevat `i.k-*` (de stip) en de tekst in inktkleur (`color` gelijk aan `--ink`).
- [ ] **Stap 2: Draai ze en zie ze falen.**
- [ ] **Stap 3: Implementeer.** `FASEN` en `faseLabel` toevoegen; `KIND` en `TKIND` daaruit afleiden (`KIND` behoudt alleen `zb`, `zd`, `pt` omdat `starts()` de sleutels gebruikt); de vier `Binnen voorzaaien`-plekken vervangen; tegelpil: `<span class="pl"><i class="k-zb" aria-hidden="true"></i>Zaai in huis</span>` (stip en inktkleurige tekst); `.dots i { background: var(--line) }` en `.dots i.on { background: var(--ink) }`, de regels `.dots.d2` en `.dots.d3` verwijderen; de oude `.k-*-t`-tekstkleuren verwijderen; legenda uit `FASEN` genereren met de aanvulling "(open)" bij `zb` en "(gevuld)" bij `zd`.
- [ ] **Stap 4: Kleurcontrole.** Draai `node <skill>/dataviz/scripts/validate_palette.js "#2a78d6,#c8501f,#0f8a63" --mode light --surface "#eaeedf"` en `... "#3987e5,#d95926,#199e70" --mode dark --surface "#12170e"`. Verwacht: `ALL CHECKS PASS` bij beide. Bewaar de uitvoer in `docs/superpowers/specs/kleuren-validatie-2026-10-26.txt`.
- [ ] **Stap 5: Draai alle controles en `axeViolations()` in licht en donker.** Verwacht: alles PASS, axe leeg. Kijk ook naar een schermafbeelding van Gewassen, Tuin en gewasdetail (open balk zichtbaar in `miniRow`).
- [ ] **Stap 6: Commit** (met toestemming): `fase 1: nieuwe fasekleuren, labels en neutrale bolletjes`.

---

### Taak 2: Fase 2. Tabs samenvoegen en weergave "Deze maand"

**Bestanden:** wijzig `index.html` (`S`, `renderChrome`, `viewNu`, `viewKal`, `ICONS`, de dispatcher in `render`, klikafhandeling, vijf Gids-teksten); test in `tests/`.

**Interfaces**
- Verbruikt: `FASEN`, `faseLabel`, `byEase`, `filtered()`, `tile(c, tags)`, het sectiepatroon met `S.more` en limiet 6.
- Produceert: `S.kv: "maand" | "jaar"` (standaard `"maand"`), `S.tab` standaard `"kal"`; `const HINT: Record<number, string>` met precies de zinnen onder "Hinttabel" hieronder; `hintVoor(m: number): string` (lege tekst als er geen hint is); `faseLijst(k: "zb"|"zd"|"pt"|"oo", m: number): Crop[]` (gefilterd met `filtered()`, gesorteerd met `byEase`); `viewMaand(): string`; `viewJaar(): string` (voorlopig de bestaande kalenderweergave onder de nieuwe naam); `viewKal(): string` (schakelaar plus verdeler). DOM: `div.kswitch[role="group"][aria-label="Weergave"]` met knoppen `data-kv="maand"` en `data-kv="jaar"` (`aria-pressed`); secties `section.sec[data-sec="zb|zd|pt|oo"]`; hint als `p.hint[role="note"]` met tekst `Let op: ${HINT[m]}`.
- Tabs: `[["kal","Kalender"],["alle","Gewassen"],["tuin","Tuin"],["hulp","Hulp"],["gids","Gids"]]`. De sleutel `nu` verdwijnt uit tabs, `ICONS` en dispatcher. De kop is in "maand" de maandnaam met hoofdletter en in "jaar" "Jaaroverzicht". Maandkiezer alleen in `kal` + `maand`.

**Hinttabel (exact)**
- 2 en 3: "Warmteminnende gewassen zoals tomaat en paprika zaai je nu alleen binnen."
- 4: "De laatste nachtvorst valt gemiddeld rond half april, maar kan later komen."
- 5: "Plant vorstgevoelige gewassen pas na de ijsheiligen (11 tot 13 mei)."
- 10 en 11: "De eerste vorst valt gemiddeld tussen half oktober en begin november."
- Andere maanden: geen hint.

- [ ] **Stap 1: Controleer de hintzinnen aan de bronnen.** Lees de Gids-artikels `seizoen/klimaat`, `seizoen/ijsheiligen`, `seizoen/vier-seizoenen` en `seizoen/kas-koude-bak` in `index.html`. Elke zin moet er door gedekt zijn; pas de zin aan of laat hem vervallen als dat niet zo is, en meld dat aan de gebruiker.
- [ ] **Stap 2: Schrijf de falende controles**
  - browser `tabs`: knoppen in `#nav` zijn exact `["Kalender","Gewassen","Tuin","Hulp","Gids"]`; `S.tab === "kal"` en `S.kv === "maand"` bij laden.
  - browser `maand`: `#h1` gelijk aan de huidige maandnaam met hoofdletter; de `data-sec`-waarden komen voor in de volgorde `zb, zd, pt, oo`; geen sectie met 0 tegels; een sectie met meer dan 7 gewassen toont 6 tegels en een knop "Toon alle n"; na een klik toont ze alles en de focus staat op het eerste nieuwe tegeltje.
  - browser `hint`: voor elke sleutel van `HINT` toont `p.hint` exact `Let op: ` plus de zin; voor maand 1 bestaat `p.hint` niet.
  - browser `leeg`: met `S.q = "zzzz"` en `render()` staat er geen sectiekop en een tekst die begint met `In ` en eindigt met `Kies een andere maand.`
  - browser `focusSchakelaar`: na een klik op `[data-kv="jaar"]` is `document.activeElement` die knop (niet `body`).
  - statisch `teksten`: `re.search(r"pagina Nu|Open Nu|op Nu", SRC)` is `None`; de vijf aangepaste plekken noemen "Kalender".
  - statisch `sleutels`: blijft slagen.
- [ ] **Stap 3: Draai ze en zie ze falen.**
- [ ] **Stap 4: Implementeer.** Lege toestand: als `zb`, `zd` en `pt` leeg zijn: `In ${maand} valt er niets te zaaien of planten. Kijk bij oogst, of kies een andere maand.`; als ook `oo` leeg is: `In ${maand} is er niets te doen met deze filters. Kies een andere maand.` Houd de focus na het wisselen: render, dan `document.querySelector('[data-kv="x"]').focus()`. Vervang "pagina Nu" en "Open Nu" in de Gids-teksten door "Kalender".
- [ ] **Stap 5: Draai alles, `axeViolations()` en een schermafbeelding op 375 × 812.** Verwacht: PASS, axe leeg, schakelaar, maandkiezer en minstens één sectiekop met tegels zichtbaar zonder scrollen.
- [ ] **Stap 6: Commit** (met toestemming): `fase 2: Kalender als beginscherm met weergave Deze maand`.

---

### Taak 3: Fase 3. Jaaroverzicht

**Bestanden:** wijzig `index.html` (`viewJaar`, `track`, CSS voor `.trk`, `.mhead`, `.crow`, `.legend`, klikafhandeling voor groepen, `renderChrome` voor de zoekbalk).

**Interfaces**
- Verbruikt: `viewJaar`, `GROUPS`, `textCal(c)`, `track(c)`, het groepenpatroon `details.grp` van het tabblad Gewassen, `FASEN`.
- Produceert: `S.jgrp: Set<string>` (open groepen in het Jaaroverzicht, apart van `S.grp`); `details.grp[data-view="jaar"]`; zoekveld `#q` ook zichtbaar in `kal` + `jaar`.

- [ ] **Stap 1: Schrijf de falende controles**
  - browser `jaarGroepen`: 11 groepen, standaard geen enkele `open`; met `S.q = "sla"` zijn alleen groepen met resultaten aanwezig en open; met `S.q = "zzzz"` staat er "Geen gewassen gevonden. Pas je zoekopdracht of filters aan."
  - browser `jaarRij`: na het openen van de eerste groep is `.crow` hoogstens 60 px hoog; geen `.dots` binnen `.crow`; elke `.crow` heeft een `aria-label` dat `textCal(c)` bevat en een zichtbaar niveauwoord ("Makkelijk", "Gemiddeld" of "Moeilijk").
  - browser `jaarNu`: `getComputedStyle(document.querySelector(".mhead .now"), "::before").content` is `"nu"`.
  - browser `jaarLegenda`: de legenda bevat exact de vier labels uit `FASEN` met "(open)" en "(gevuld)" bij de twee zaailabels, op hoogstens twee regels.
  - browser `jaarDonker`: in het donkere thema heeft `.trk .k-zb` een randkleur met contrast van minstens 3:1 tegen `--bg`. Bereken met een kleine contrastfunctie.
  - browser `focusSchakelaar` en `geenOverflow`: blijven slagen.
- [ ] **Stap 2: Draai ze en zie ze falen.**
- [ ] **Stap 3: Implementeer.** `viewJaar` bouwt de groepen met `details.grp` (ingeklapt behalve bij zoeken of filteren) en per gewas een `button.crow` met naam en niveauwoord; `.trk` krijgt `grid-auto-rows: 8px` en `row-gap: 4px` met afgeronde balken van 4 px; `.mhead .now::before { content: "nu" }`; de toggle-luisteraar kiest `S.jgrp` of `S.grp` op basis van `data-view`.
- [ ] **Stap 4: Draai alles, axe in licht en donker, en meet overflow op 320, 375 en 768 px** (met de resize-tool van de browser, dan `overflow()`). Verwacht: PASS, axe leeg, geen overflow.
- [ ] **Stap 5: Commit** (met toestemming): `fase 3: compact Jaaroverzicht met open en gevulde balken`.

---

### Taak 4: Fase 4. Gids in vijf groepen en plaaglijst in Hulp

**Bestanden:** wijzig `index.html` (`GROEPEN`, `PLAGEN`, `artByPath`, `viewGids`, `renderChrome` voor kop en onderschrift, Hulp-startscherm, klikafhandeling).

**Interfaces**
- Produceert: `const GROEPEN: Array<{id: "begin"|"doen"|"waarom"|"naslag", t: string, d: string, ic: string, subs: Array<{t?: string, arts: string[]}>}>`; `const PLAGEN: string[]` (8 paden, alle `plagen/...`); `artByPath(p: string): {cat, a} | null`; kaart `button.gcat[data-act="tohulp"]` ("Als het misgaat") die `S.tab = "hulp"` zet.
- Indeling (paden als `catId/artId`; een pad zonder categorievoorvoegsel hoort bij de categorie die er direct vóór staat):
  - `begin` (5): beginnen/waar-begin-ik, plek-kiezen, pot-bak-grond, gereedschap, eerste-jaar.
  - `doen` (31) in zes `subs`: Zaaien en planten (zaaien/zaaien-binnen-buiten, zaaigrond-licht, verspenen-afharden, kiemtijd, zaad-kopen, plantafstand, plantjes-kopen); Verzorgen (verzorging/water-geven, regenwater, onkruid, steun, tomaat-verzorgen, snoeien, weinig-tijd, plus grond/mulchen); Grond en voeding (grond/compost, potgrond, groenbemesters); Oogsten en bewaren (oogsten/oogst-wanneer, bewaren, invriezen, drogen, zaad-bewaren); Seizoen en kleine ruimtes (seizoen/kas-koude-bak, winter-groenten, klein/balkon, schaduw, verticaal); Slim combineren (combineren/tussenteelt, drie-zusters, helpers).
  - `waarom` (12): grond/grondsoorten, ph-kalk, voeding; seizoen/klimaat, ijsheiligen, vier-seizoenen, droogte-hitte; combineren/combi-hoe, vruchtwisseling; kennis/families, groenten-groepen, soorten-rassen.
  - `naslag` (4): combineren/combi-goed, combi-slecht; kennis/woordenlijst, faq. De secties "Buren in één oogopslag" (`overview()`) en "Bronnen en controle" staan op deze pagina na de artikels.
  - `PLAGEN` (8): plagen/slakken, bladluis, koolwitje, wortelvlieg, phytophthora, meeldauw, dieren, plagen-overzicht.
- Gids-startpagina: de Startersgids-kaart blijft; daarna vier groepskaarten (`begin`, `doen`, `waarom`, `naslag`) en de kaart "Als het misgaat". De "Buren"- en "Bronnen"-secties verlaten de startpagina.
- Groepspagina: `S.gc` is een groep-id (of `"start"`); terugknop "‹ Gids"; subkoppen als `h2`; kaartjes in het bestaande `acards`-formaat. De kop in `renderChrome` komt uit `GROEPEN`.
- Hulp-startscherm: het blok "Liever zelf zoeken?" wordt het blok "Plagen en ziektes opzoeken" met de 8 `PLAGEN` als knoppen `data-art`.

- [ ] **Stap 1: Schrijf de falende controles**
  - browser `groepen`: de paden uit `GROEPEN` plus `PLAGEN` zijn 60 uniek en vormen exact de verzameling `${g.id}/${a.id}` uit `GIDS`; elk pad geeft een resultaat van `artByPath`; aantallen per groep zijn 5, 31, 12 en 4; `PLAGEN.length === 8`.
  - browser `gidsStart`: Startersgids-kaart aanwezig; 5 elementen `.gcat`; geen sectie "Buren in één oogopslag" op de startpagina.
  - browser `groepPaginas`: elke groep toont het verwachte aantal `.acard`; `doen` toont 6 `h2`-subkoppen; `naslag` toont `overview()`.
  - browser `alleArtikels`: voor elk van de 60 paden toont `openArticle(pad)` een niet-lege `#sheet-t`; daarna `closeOv()`; een "Meer weten"-knop in de Startersgids (`data-art`) opent het juiste artikel.
  - browser `naarHulp`: een klik op `[data-act="tohulp"]` zet `S.tab === "hulp"`.
  - browser `hulpPlagen`: het Hulp-startscherm heeft 8 knoppen `button[data-art^="plagen/"]`.
  - browser `terug`: vanaf een groepspagina brengt `[data-act="gback"]` je naar de Gids-startpagina.
  - browser `geenOverflow`, axe: blijven slagen.
- [ ] **Stap 2: Draai ze en zie ze falen.**
- [ ] **Stap 3: Implementeer.** Presentatielaag; `GIDS` blijft onaangeroerd. Iconen uit de bestaande `GIC`-sleutels: `sprout` (begin), `pot` (doen), `book` (waarom), `basket` (naslag), `bug` (hulp).
- [ ] **Stap 4: Draai alles, axe in licht en donker, schermafbeeldingen van de Gids op 375 px.** Verwacht: PASS.
- [ ] **Stap 5: Commit** (met toestemming): `fase 4: Gids in vijf taakgroepen en plaaglijst in Hulp`.

---

### Taak 5: Fase 5. Artikelsjabloon met bron voor 10 artikels

**Bestanden:** wijzig `index.html` (`openArticle` en de 10 artikels in `GIDS`).

**Interfaces**
- Verbruikt: `GIDS`, `blocks`, `h`, `MF`.
- Produceert: optionele velden `bron: string` en `nagekeken: "JJJJ-MM"` op een artikel; `openArticle` toont `Bron: ${bron}. Nagekeken: ${maandnaam} ${jaar}.` onderaan als `p.credit`, alleen als beide velden gevuld zijn.
- De 10 artikels: zaaien/zaaien-binnen-buiten, verzorging/water-geven, seizoen/ijsheiligen, seizoen/klimaat, zaaien/kiemtijd, zaaien/plantafstand, oogsten/oogst-wanneer, grond/voeding, plagen/slakken, plagen/phytophthora.
- Structuur van deze artikels: drie `h`-blokken, exact "Wat doe ik", "Hoe doe ik dat", "Waar let ik op", in die volgorde.

- [ ] **Stap 1: Schrijf de falende controles**
  - browser `sjabloon`: de `h`-titels van elk van de 10 artikels zijn precies die drie, in volgorde.
  - browser `bronnen`: voor elk artikel zijn `bron` en `nagekeken` beide gevuld of beide leeg; de 10 hebben ze gevuld; de zichtbare regel in `#sheet` komt overeen en bestaat niet bij artikels zonder velden.
  - statisch `geenPlaatshouders`: `re.search(r"TODO|TBD|lorem", SRC, re.I)` is `None`.
- [ ] **Stap 2: Draai ze en zie ze falen.**
- [ ] **Stap 3: Per artikel de inhoud nakijken.** Zoek met WebSearch en WebFetch minstens één betrouwbare Nederlandstalige of Belgische bron (bijvoorbeeld Velt, Hubo, Aveve, IVN, RHS); lees die echt; vergelijk met de huidige tekst; pas aan waar ze afwijkt; vul `bron` en `nagekeken` pas daarna in. Houd een lijst bij van elke inhoudelijke wijziging en toon die aan de gebruiker. Een artikel waarvoor geen bron gevonden wordt, blijft zonder `bron`; meld het.
- [ ] **Stap 4: Implementeer de weergave in `openArticle`** en herschrijf de 10 artikels in het sjabloon (kort, concreet, gewone woorden).
- [ ] **Stap 5: Draai alles en axe.** Verwacht: PASS.
- [ ] **Stap 6: Commit** (met toestemming): `fase 5: artikelsjabloon met bron voor 10 artikels`.

---

### Taak 6: Eindcontrole

**Bestanden:** maak `docs/superpowers/specs/acceptatie-2026-10-26.md`.

- [ ] **Stap 1: Draai `python -I tests/static_checks.py` en `runAll()`.** Verwacht: alles PASS.
- [ ] **Stap 2: Draai de acceptatiecriteria 1 tot 9 uit de spec** en noteer per criterium het bewijs in het acceptatiebestand: validatoruitvoer, axe-uitkomst per scherm in licht en donker, overflow op 320, 375 en 768 px, de lijst met 44 px-controle, en de gedragstest.
- [ ] **Stap 3: Gegevensbehoud.** Zet via `localStorage` een tuin met een afgevinkte taak (`mt-tuin-v1`) en een Startersgids-stand (`sg-ch`), herlaad, en controleer dat beide intact zijn en de taken de nieuwe labels tonen.
- [ ] **Stap 4: Vink af of meld per criterium wat niet gehaald is.** Verzwijg niets.
- [ ] **Stap 5: Rapporteer aan de gebruiker** en vraag toestemming om `test` te pushen. Samenvoegen met `main` gebeurt alleen op uitdrukkelijk verzoek.

---

## Zelfcontrole tegen de spec

- Kleuren, labels, bolletjes (spec 4.4, 4.5): taak 1.
- Tabs, "Deze maand", hint, lege toestand (4.1, 4.2, 4.6): taak 2.
- Jaaroverzicht (4.3): taak 3.
- Vijf groepen, 60 artikels, Hulp-plaaglijst (5.1 tot 5.3): taak 4.
- Sjabloon, bron en nakijkdatum (5.4): taak 5.
- Acceptatie en beginnerstest (8): taak 6. De beginnerstest wacht op testers en staat daarom niet als taak; de vijf opdrachten staan in de spec.
- Fase 0 (`CLAUDE.md` en `docs/`) is geen onderdeel van dit plan, want niet goedgekeurd.
