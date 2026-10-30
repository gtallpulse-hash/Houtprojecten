# Controle van de gewasgegevens (fase B, eerste ronde), 2026-10-30

Er is **niets in `index.html` gewijzigd**. Dit is een rapport met voorstellen. Het gaat om de lijst `C` (35 gewassen) en de artikels die dezelfde cijfers noemen.

Let op: de lijst telt **35 gewassen**. Het getal 59 in het overdrachtsdocument is het aantal foto's, niet het aantal gewassen.

## Wat is gecontroleerd en hoe

| Soort controle | Omvang | Zekerheid |
|---|---|---|
| Intern: maanden in de velden `zb`, `zd`, `pt`, `oo` tegen de maanden in de stappentekst (`st`) | alle 35 | Gemeten met een script. |
| Intern: buren (`goed`, `slecht`) op tegenspraak en onbekende id's | alle 35 | Gemeten. Geen tegenspraak en geen onbekend id gevonden. |
| Intern: veld `afst` tegen de tabel in het artikel *Plantafstanden en rijen* | 8 gewassen uit de tabel | Gemeten (vergelijking van de cijfers). |
| Extern: bronnen tegen 4 punten (spruitkool, radijs, knoflook, pompoen) | 4 gewassen | Alleen gelezen via samenvattingen van zoekresultaten, **niet** de volledige pagina's. De Velt-pagina's zelf kwamen niet naar boven. |

De overige 31 gewassen zijn **niet** aan externe bronnen getoetst. Dit is dus een eerste ronde, geen afgeronde controle.

## Bevindingen

### Interne tegenstrijdigheden (zeker)

1. **Radijs, plantafstand.** Het veld `afst` zegt "3-5 cm in de rij". Het artikel zegt "2 tot 3 cm". De bronnen die ik vond, noemen 2 tot 3 cm tussen de planten (Brussels infofiche, Plukkers: 3 cm) en 10 tot 15 cm tussen de rijen. **Voorstel:** het veld `afst` wordt "2-3 cm in de rij, 10-15 cm tussen de rijen".
2. **Pompoen, ruimte.** Het veld `afst` zegt "100-150 cm". Het artikel zegt "2 tot 3 m² per plant". Dat spreekt elkaar tegen (100 tot 150 cm is ongeveer 1 tot 2 m²). Zaadleveranciers noemen 120 tot 150 cm voor grote rassen (ongeveer 1,5 tot 2 m²) en 60 x 140 cm voor kleine rassen (ongeveer 0,85 m²). Een gemeentepagina noemt "zeker 1 m²". **Voorstel:** het artikel wordt "ongeveer 1,5 tot 2 m² per plant voor grote rassen, 1 m² voor compacte rassen". Het veld `afst` mag blijven staan.
3. **Spruitkool, zaaimaand.** Het veld `zd` bevat maart tot mei, de stap zegt "april-mei in een bed". De bronnen die ik vond, noemen maart tot april (zaaikistje of bed) of half april tot half mei. **Voorstel:** de stap wordt "Zaai van half maart tot mei", zodat tekst en velden overeenkomen. Dit is een kleine correctie en geen fout die een seizoen kost.

### Bevestigd door bronnen

- **Knoflook:** plantdiepte 5 cm en plantperiode oktober tot half november komen overeen met wat de bronnen noemen (5 tot 6 cm, tweede week oktober tot derde week november). Het veld `pt` bevat ook februari en maart, maar de stappentekst noemt alleen het najaar. Dat voorjaarsvenster heb ik **niet** bevestigd gezien. **Voorstel:** nakijken of het voorjaar blijft staan.

### Overgebleven onzekerheid

- Bronnen verschillen onderling: pompoenzaaidiepte 1 cm tegenover 3 tot 4 cm, knoflook 2,5 tot 6 cm. Dat is normaal. Het advies "controleer het zaadzakje van je ras" blijft dus nodig.
- De velden `dagen` (bijvoorbeeld "60-90 dagen na uitplanten") zijn nog niet nagekeken. Het ontwerp (fase B) wil die ook numeriek maken.

## Voorstel voor de volgende ronde

1. De drie correcties hierboven doorvoeren (klein, met tests).
2. Per gewas een veld `bron` en `nagekeken` toevoegen, zoals de artikels al hebben, en dat in het gewasdetail tonen.
3. De overige 31 gewassen in groepen controleren: eerst de gewassen met de meeste foutkans voor een beginner (tomaat, courgette, komkommer, paprika, stokboon: alles wat vorstgevoelig is), dan de rest.
