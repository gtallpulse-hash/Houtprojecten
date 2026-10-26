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

if __name__ == "__main__":
    sys.exit(1 if FAILS else 0)
