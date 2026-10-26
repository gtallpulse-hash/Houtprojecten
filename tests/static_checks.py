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

if __name__ == "__main__":
    sys.exit(1 if FAILS else 0)
