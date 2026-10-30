# Ontwerp: doelkeuze en eerste stap op de Gids (2026-10-30)

Status: goedgekeurd in gesprek (variant B, zevende keuze met vervolgvraag), door de eigenaar vrijgegeven om te bouwen. Beslissingen die de eigenaar aan Claude heeft overgelaten staan onder "Beslissingen".

## Doel

Een bezoeker die de Gids voor het eerst opent, geeft in gewone taal aan wat hij wil doen, en ziet meteen **één concrete eerste stap**. Niemand wordt in een hokje gestopt: meer keuzes tegelijk kan, overslaan kan altijd, en de keuze is later te wijzigen.

Succes: een absolute beginner kan na één tik (of twee, via "Ik weet niet waar ik moet beginnen") zien wat hij als eerste doet, zonder de rest van de Gids te hoeven doorzoeken. Of dat echt zo is, moet blijken uit tests met beginners; dit ontwerp is een hypothese.

## Onderzoek (kort)

Gebaseerd op samenvattingen van tuin- en leer-apps (Hortiku, Planter, Duolingo, Headspace, Calm) en artikelen over "jobs to be done" en progressief vragen. Bronnen zijn blogs, geen gecontroleerde studies. Wat we overnemen: vraag naar de situatie of het doel, niet naar een categorie; één hoofdvraag; meerdere antwoorden toelaten; elk antwoord moet een zichtbaar gevolg hebben; overslaan en later wijzigen blijven altijd mogelijk; niets twee keer vragen.

## Gedrag

1. **Eerste bezoek aan de Gids** (geen bewaarde keuze): alleen de vraag *"Wat wil je het liefst doen?"* is zichtbaar, geen zoekveld of groepen. Overslaan kan met "Ik kijk liever zelf rond".
2. **Keuzes** (zeven):
   - Groot bovenaan: *Ik weet niet waar ik moet beginnen* (help me met mijn eerste project). Opent een vervolgvraag *"Waar kun je iets kweken?"*: vensterbank of keuken, balkon of terras, tuin, serre of kas, dat weet ik nog niet. Het antwoord kiest een van de zes stappen hieronder; "dat weet ik nog niet" kiest het potproject.
   - Daaronder, meerdere tegelijk te kiezen: Kruiden kweken · Groenten op balkon of terras · Moestuin in de grond of in een bak · Iets kweken in mijn serre of kas · Fruit kweken · Eerst begrijpen hoe het werkt.
   - Link "Heb je een probleem met een plant? Naar Hulp".
3. **Resultaat**: de kaart *Jouw eerste stap* (of *Je eerste project* via de eerste keuze), met bij meerdere keuzes een rij keuzes om te wisselen.
4. **Daarna** staat het zoekveld, de Startersgids en de groepen er gewoon onder. Een regel *Jouw keuze: … · Pas aan* opent de vraag opnieuw met de bewaarde keuzes aangevinkt.

## De kaart "Jouw eerste stap"

- **Gewas nu mogelijk** (er is een gewas dat bij de keuze past en in deze maand gezaaid of geplant kan worden, makkelijkste eerst): foto, naam, de actiezin van de tegel, de eerste drie stappen uit het gewas zelf, knoppen *Hoe teel ik dit?* en *Zet in mijn tuin*.
- **Niets nu mogelijk**: een voorbereidende stap (twee bestaande artikels), met eerlijke tekst wanneer het wel kan ("Vanaf maart kun je …"), berekend uit de gegevens.
- **Eerst begrijpen**: de kaart verwijst naar het eerste hoofdstuk van de Startersgids en twee artikels.
- Altijd eronder: twee of drie bestaande artikels "Meer voor jou".

Kandidaten per keuze (uit de bestaande gewasgegevens, geen nieuwe gegevens):

| Keuze | Gewassen die in aanmerking komen |
|---|---|
| Kruiden | soort *kruid*, geschikt voor een pot |
| Balkon of terras | soort *groente*, geschikt voor een pot, niveau makkelijk |
| Moestuin | soort *groente*, geschikt voor de grond, niveau makkelijk |
| Serre of kas | tomaat, komkommer, paprika, courgette, basilicum |
| Fruit | soort *fruit* |

## Opslag

Eén sleutel in `localStorage`: `mt-gids-doel-v1` = `{v:1, d:[…], skip:bool}`. Los van de tuin-back-up en van de teller. Een stuk of onbekend bestand geeft de vraag opnieuw, niet een fout. Er gaat niets naar een server.

## Wat het niet is

Geen account, geen aanbevelingsalgoritme, geen automatisch gewas in de Tuin, geen vragen over ruimte, zon of ervaring, geen meting van keuzes.

## Beslissingen die Claude zelf nam (met toestemming van de eigenaar)

- Zevende keuze groot bovenaan en niet in de lijst, om de lijst van zes kort te houden.
- "Eerst begrijpen" wijst naar het eerste hoofdstuk, geen gewas.
- Bij "Dat weet ik nog niet" een potproject, omdat dat overal kan.
- Het probleem-pad blijft Hulp: geen zevende gewone keuze.
- De intake verbergt de rest van de Gids bij het eerste bezoek, zodat niemand overspoeld wordt.

## Controle

Tests: eerste bezoek toont de vraag; overslaan werkt en blijft bewaard; meerdere keuzes en wisselen; "Pas aan" toont de bewaarde keuzes; voor elke keuze en elke maand een eerste stap met een zin of een geldige voorbereidende stap met bestaande artikels; de vervolgvraag; kapotte opslag; knoppen minstens 44 px; axe in licht en donker; geen overflow op 320 px.
