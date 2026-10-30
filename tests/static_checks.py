"""Statische controles op moestuin-start/index.html.

Gebruik: python -I tests/static_checks.py
Elke controle print PASS of FAIL. Afsluitcode 1 bij minstens één FAIL.
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = (ROOT / "moestuin-start" / "index.html").read_text(encoding="utf-8")
FAILS = []


def check(naam: str, ok: bool, detail: str = "") -> None:
    print(("PASS" if ok else "FAIL"), naam, detail)
    if not ok:
        FAILS.append(naam)


# --- Taak 0: uitgangspositie
check("sleutels", SRC.count('"mt-tuin-v1"') >= 1 and SRC.count('"sg-ch"') >= 1)

# --- Taak 1: kleuren en labels
check("labels", SRC.count("Binnen voorzaaien") == 0, f"{SRC.count('Binnen voorzaaien')} keer")
for hx in ["#2a78d6", "#c8501f", "#0f8a63", "#3987e5", "#d95926", "#199e70"]:
    check("palet " + hx, hx in SRC.lower())

# --- Taak 2: tabs en weergave Deze maand
check("teksten", re.search(r"pagina Nu|Open Nu|op Nu|Open de pagina Nu", SRC) is None)
check("geenNuTab", '["nu","Nu"]' not in SRC and "viewNu" not in SRC)
check("standaard", 'S={tab:"kal"' in SRC and 'kv:"maand"' in SRC)
check("sleutels blijven", SRC.count('"mt-tuin-v1"') >= 1 and SRC.count('"sg-ch"') >= 1)

# --- Taak 5: bronnen en sjabloon
check("geenPlaatshouders", re.search(r"TODO|TBD|lorem", SRC, re.I) is None)
check("vorstdata uit bron", "rond half april" not in SRC and "tussen half oktober en begin november" not in SRC and "27 maart" in SRC and "21 november" in SRC)

# --- Gegevenscontrole fase B, eerste ronde (docs/gegevens-controle-2026-10-30.md)
check("radijsAfstand", 'afst:"2-3 cm in de rij, 10-15 cm tussen de rijen"' in SRC and "radijs:[1,3,12]" in SRC and 'afst:"3-5 cm in de rij"' not in SRC)
check("pompoenRuimte", "2 tot 3 m² per plant" not in SRC and "1,5 tot 2 m² per plant" in SRC)
check("spruitkoolZaai", "Zaai april-mei in een bed." not in SRC and "Zaai van eind maart tot mei in een bed." in SRC)

# --- Audit fase 1: structuur van het document
check("titelInHead", SRC.index("<title>") < SRC.index("<body>"))
check("navVoorMain", SRC.index('<nav class="nav"') < SRC.index('<main id="main"'))
check("naam", "Moestuin Start" not in SRC and "<title>Mijn Moestuin</title>" in SRC)

# --- Reviewer-herstel
check("pompoenillustratie", "Courgette en pompoen: 1 plant per m" not in SRC)

if __name__ == "__main__":
    sys.exit(1 if FAILS else 0)
