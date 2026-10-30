// Gedragscontroles voor moestuin-start/index.html. Draait in de pagina.
// Gebruik (javascript-tool in de browser, pagina geladen via de testserver):
//   JSON.stringify(await (await import('/tests/browser_checks.js')).runAll(['artikels60']))
// De globale constanten van de pagina (GIDS, S, TUIN, ...) zijn hier bereikbaar.

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function go(tab) {
  document.querySelector(`#nav [data-tab="${tab}"]`).click();
  await sleep(250);
}

export function theme(mode) {
  document.documentElement.dataset.theme = mode;
}

export function overflow() {
  const d = document.documentElement;
  return d.scrollWidth > d.clientWidth;
}

export async function axeViolations() {
  if (!window.axe) {
    await new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/axe-core@4.10.2/axe.min.js";
      s.onload = res;
      s.onerror = () => rej(new Error("axe laden mislukt"));
      document.head.appendChild(s);
    });
  }
  await sleep(300);
  document.getAnimations().forEach((a) => a.finish());
  await sleep(200);
  const r = await window.axe.run(document, { resultTypes: ["violations"] });
  return r.violations.map((v) => `${v.id} x${v.nodes.length} ${v.nodes[0].target.join(" ").slice(0, 60)}`);
}

const hexRgb = (h) => {
  h = h.trim().replace("#", "");
  const n = parseInt(h, 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};
const tok = (name) => getComputedStyle(document.documentElement).getPropertyValue(name);
const css = (el, prop) => getComputedStyle(el)[prop];

export const checks = {
  // Taak 0: uitgangspositie
  artikels60: async () => {
    const n = GIDS.reduce((s, g) => s + g.arts.length, 0);
    return { ok: n === 60, detail: String(n) };
  },
  geenOverflow: async () => ({ ok: overflow() === false }),
};

checks.fasekleuren = async () => {
  const fails = [];
  await go("kal");
  S.kv = "jaar"; render(); await sleep(100);
  for (const mode of ["light", "dark"]) {
    theme(mode);
    await sleep(100);
    const z = hexRgb(tok("--f-zaai")), p = hexRgb(tok("--f-plant")), o = hexRgb(tok("--f-oogst"));
    const L = (k) => document.querySelector(`.legend .k-${k}`);
    if (css(L("zd"), "backgroundColor") !== z) fails.push(mode + " zd");
    if (css(L("pt"), "backgroundColor") !== p) fails.push(mode + " pt");
    if (css(L("oo"), "backgroundColor") !== o) fails.push(mode + " oo");
    if (css(L("zb"), "backgroundColor") !== "rgba(0, 0, 0, 0)") fails.push(mode + " zb vulling");
    if (css(L("zb"), "borderTopColor") !== z || css(L("zb"), "borderTopWidth") !== "2px") fails.push(mode + " zb rand");
  }
  theme("light");
  return { ok: fails.length === 0, detail: fails.join(", ") };
};

checks.legendaTekst = async () => {
  await go("kal");
  S.kv = "jaar"; render(); await sleep(100);
  const t = document.querySelector(".legend").innerText;
  const ok = ["Zaai in huis (open)", "Zaai buiten (gevuld)", "Plant uit", "Oogst"].every((x) => t.includes(x));
  return { ok, detail: t.replace(/\s+/g, " | ") };
};

checks.bolletjesNeutraal = async () => {
  await go("alle");
  document.querySelectorAll("details.grp").forEach((d) => (d.open = true));
  await sleep(200);
  const bg = (n) => { const e = document.querySelector(`.dots.d${n} i.on`); return e && css(e, "backgroundColor"); };
  const kleuren = [bg(1), bg(2), bg(3)];
  const fase = [tok("--f-zaai"), tok("--f-plant"), tok("--f-oogst")].map(hexRgb);
  const ok = kleuren.every(Boolean) && new Set(kleuren).size === 1 && !fase.includes(kleuren[0]);
  return { ok, detail: kleuren.join(" / ") };
};

checks.tuinLabels = async () => {
  const lab = { zb: "zaai in huis", zd: "zaai buiten", pt: "plant uit", oo: "oogst" };
  const fouten = Object.keys(lab).filter((k) => TKIND[k] !== lab[k]);
  const id = C.find((c) => ["zb", "zd", "pt", "oo"].some((k) => c[k].includes(NOW))).id;
  const oud = TUIN.crops.slice();
  TUIN.crops = [id];
  await go("tuin");
  const txt = [...document.querySelectorAll(".task span")].map((s) => s.textContent);
  const koppen = [...document.querySelectorAll(".tasks")].map((u) => u.previousElementSibling && u.previousElementSibling.textContent);
  TUIN.crops = oud;
  if (koppen.some((k) => /^(Planten|Oogsten)$/.test(k))) fouten.push("oude koppen: " + koppen.join("|"));
  if (!txt.length || txt.some((t) => /voorzaaien|planten$/.test(t))) fouten.push("taaktekst: " + txt.join("; "));
  return { ok: fouten.length === 0, detail: fouten.join(", ") };
};

checks.pilStip = async () => {
  const host = document.createElement("div");
  host.innerHTML = tile(BY.tomaat, ["zb", "zd"]);
  document.body.appendChild(host);
  const act = host.querySelector(".act");
  const stip = act && act.querySelector("i.k-zb");
  const pl = act && act.querySelector(".pl");
  const inkt = hexRgb(tok("--ink"));
  const ok = !!stip && !!pl && css(pl, "color") === inkt && act.innerText.includes("Zaai in huis") && act.innerText.includes("Zaai buiten");
  host.remove();
  return { ok, detail: act ? act.innerHTML.slice(0, 120) : "geen .act" };
};

checks.miniOpen = async () => {
  openDetail("tomaat");
  await sleep(300);
  document.getAnimations().forEach((a) => a.finish());
  const e = document.querySelector("#sheet .mini b.k-zb.on");
  const ok = !!e && css(e, "backgroundColor") === "rgba(0, 0, 0, 0)" && css(e, "borderTopWidth") === "2px";
  closeOv();
  return { ok };
};

const maandNaam = (m) => MF[m - 1].charAt(0).toUpperCase() + MF[m - 1].slice(1);
const resetFilters = () => { S.q = ""; S.type = "alle"; S.diep = "alle"; S.plek = "alle"; S.more.clear(); };

checks.tabs = async () => {
  const labels = [...document.querySelectorAll("#nav button")].map((b) => b.textContent.trim());
  const ok = JSON.stringify(labels) === JSON.stringify(["Kalender", "Gewassen", "Tuin", "Hulp", "Gids"]);
  return { ok, detail: labels.join(",") };
};

checks.maand = async () => {
  const fouten = [];
  resetFilters(); S.tab = "kal"; S.kv = "maand"; S.m = NOW; render(); await sleep(150);
  if (document.getElementById("h1").textContent !== maandNaam(NOW)) fouten.push("h1");
  const secs = [...document.querySelectorAll("[data-sec]")].map((e) => e.dataset.sec);
  const volgorde = ["zb", "zd", "pt", "oo"].filter((k) => secs.includes(k));
  if (JSON.stringify(secs) !== JSON.stringify(volgorde)) fouten.push("volgorde " + secs);
  if (document.querySelectorAll("[data-sec] .act").length) fouten.push("pillen in maandweergave");
  for (const k of secs) {
    const n = faseLijst(k, NOW).length, sec = document.querySelector(`[data-sec="${k}"]`);
    const tegels = sec.querySelectorAll(".tile").length, knop = sec.querySelector("[data-more]");
    if (n === 0) fouten.push("lege sectie " + k);
    if (n > 7 && (tegels !== 6 || !knop || !knop.textContent.includes("Toon alle " + n))) fouten.push("limiet " + k);
    if (n <= 7 && (tegels !== n || knop)) fouten.push("alles " + k);
  }
  const lang = secs.find((k) => faseLijst(k, NOW).length > 7);
  if (lang) {
    document.querySelector(`[data-sec="${lang}"] [data-more]`).click(); await sleep(150);
    const sec = document.querySelector(`[data-sec="${lang}"]`);
    if (sec.querySelectorAll(".tile").length !== faseLijst(lang, NOW).length) fouten.push("toon alle");
    if (document.activeElement !== sec.querySelectorAll(".tile > button")[6]) fouten.push("focus na toon alle");
  }
  resetFilters();
  return { ok: fouten.length === 0, detail: fouten.join(", ") };
};

checks.hint = async () => {
  const fouten = [];
  S.tab = "kal"; S.kv = "maand"; resetFilters();
  for (const k of Object.keys(HINT)) {
    S.m = +k; render(); await sleep(50);
    const h = document.querySelector("p.hint");
    if (!h || h.textContent !== "Let op: " + HINT[k]) fouten.push("maand " + k);
  }
  S.m = 1; render(); await sleep(50);
  if (document.querySelector("p.hint")) fouten.push("hint in januari");
  S.m = NOW; render();
  return { ok: fouten.length === 0, detail: fouten.join(", ") };
};

checks.leeg = async () => {
  S.tab = "kal"; S.kv = "maand"; S.m = NOW; S.plek = "__geen__"; render(); await sleep(100);
  const e = document.querySelector("#main .empty");
  const txt = e ? e.innerText.trim() : "";
  const ok = !document.querySelector("[data-sec]") && txt.startsWith("In ") && txt.endsWith("Kies een andere maand.");
  resetFilters(); render();
  return { ok, detail: txt.slice(0, 120) };
};

checks.focusSchakelaar = async () => {
  S.tab = "kal"; S.kv = "maand"; render(); await sleep(100);
  document.querySelector('[data-kv="jaar"]').click(); await sleep(150);
  const ok1 = document.activeElement && document.activeElement.dataset.kv === "jaar" && S.kv === "jaar";
  document.querySelector('[data-kv="maand"]').click(); await sleep(150);
  const ok2 = document.activeElement && document.activeElement.dataset.kv === "maand" && S.kv === "maand";
  return { ok: !!(ok1 && ok2) };
};

const lum = (rgb) => {
  const [r, g, b] = rgb.match(/\d+/g).map(Number).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const jaar = async () => { resetFilters(); S.tab = "kal"; S.kv = "jaar"; S.jgrp.clear(); render(); await sleep(150); };
const openEerste = async () => { const d = document.querySelector('details.grp[data-view="jaar"]'); d.open = true; await sleep(100); return d; };

checks.jaarGroepen = async () => {
  const fouten = [];
  await jaar();
  const g = () => [...document.querySelectorAll('details.grp[data-view="jaar"]')];
  if (g().length !== 11) fouten.push("aantal " + g().length);
  if (g().some((d) => d.open)) fouten.push("standaard open");
  S.q = "sla"; render(); await sleep(100);
  if (!g().length || g().length >= 11 || g().some((d) => !d.open || !d.querySelector(".crow"))) fouten.push("zoeken sla");
  S.q = "zzzz"; render(); await sleep(100);
  const e = document.querySelector("#main .empty");
  if (!e || e.innerText.trim() !== "Geen gewassen gevonden. Pas je zoekopdracht of filters aan.") fouten.push("lege toestand");
  resetFilters(); render();
  return { ok: fouten.length === 0, detail: fouten.join(", ") };
};

checks.jaarRij = async () => {
  const fouten = [];
  await jaar(); await openEerste();
  const rijen = [...document.querySelectorAll(".crow")];
  if (!rijen.length) return { ok: false, detail: "geen rijen" };
  const h = Math.max(...rijen.map((r) => r.getBoundingClientRect().height));
  if (h > 60) fouten.push("hoogte " + Math.round(h));
  if (document.querySelector(".crow .dots")) fouten.push("bolletjes");
  for (const r of rijen) {
    const c = BY[r.dataset.open], niv = r.querySelector(".niv");
    if (!niv || niv.textContent !== DIFF[c.d]) fouten.push("niveau " + c.id);
    if (!r.getAttribute("aria-label").includes(textCal(c))) fouten.push("aria " + c.id);
  }
  return { ok: fouten.length === 0, detail: fouten.slice(0, 4).join(", ") };
};

checks.jaarNu = async () => {
  await jaar(); await openEerste();
  const c = getComputedStyle(document.querySelector(".mhead .now"), "::before").content;
  return { ok: c === '"nu"', detail: c };
};

checks.jaarLegenda = async () => {
  await jaar();
  const l = document.querySelector(".legend"), t = l.innerText.replace(/\s+/g, " ");
  const labels = ["Zaai in huis (open)", "Zaai buiten (gevuld)", "Plant uit", "Oogst"].every((x) => t.includes(x));
  const regels = l.getBoundingClientRect().height / parseFloat(getComputedStyle(l).lineHeight || "20");
  return { ok: labels && regels <= 2.6, detail: regels.toFixed(1) + " regels" };
};

checks.jaarDonker = async () => {
  await jaar(); await openEerste();
  theme("dark"); await sleep(100);
  const bar = document.querySelector(".trk i.k-zb");
  const c = bar ? contrast(css(bar, "borderTopColor"), hexRgb(tok("--bg"))) : 0;
  theme("light");
  return { ok: c >= 3, detail: c.toFixed(2) };
};

checks.zoekJaar = async () => {
  await jaar();
  const q = document.getElementById("q");
  if (!q) return { ok: false, detail: "geen zoekveld in Jaaroverzicht" };
  q.value = "courgette"; q.dispatchEvent(new Event("input", { bubbles: true })); await sleep(150);
  const ok = !!document.querySelector('details.grp[data-view="jaar"][open] .crow') && document.activeElement && document.activeElement.id === "q";
  resetFilters(); render();
  return { ok: !!ok };
};

const gids = async () => { resetFilters(); S.tab = "gids"; S.gc = null; render(); await sleep(100); };

checks.groepen = async () => {
  const fouten = [];
  const alle = GROEPEN.flatMap((g) => g.subs.flatMap((x) => x.arts)).concat(PLAGEN);
  const uit = new Set(GIDS.flatMap((g) => g.arts.map((a) => g.id + "/" + a.id)));
  if (alle.length !== 60 || new Set(alle).size !== 60) fouten.push("aantal " + alle.length + "/" + new Set(alle).size);
  if (alle.some((p) => !uit.has(p) || !artByPath(p))) fouten.push("onbekend pad: " + alle.filter((p) => !uit.has(p)).join(","));
  const tel = GROEPEN.map((g) => g.subs.reduce((n, x) => n + x.arts.length, 0));
  if (JSON.stringify(tel) !== "[5,31,12,4]") fouten.push("per groep " + tel);
  if (PLAGEN.length !== 8) fouten.push("plagen " + PLAGEN.length);
  return { ok: fouten.length === 0, detail: fouten.join(", ") };
};

checks.gidsStart = async () => {
  await gids();
  const fouten = [];
  if (!document.querySelector(".hero-card")) fouten.push("geen Startersgids");
  if (document.querySelectorAll(".gcat").length !== 5) fouten.push("kaarten " + document.querySelectorAll(".gcat").length);
  if (document.getElementById("main").innerText.includes("Buren in één oogopslag")) fouten.push("Buren staat nog op de startpagina");
  if (!document.querySelector('[data-act="tohulp"]')) fouten.push("geen Als het misgaat");
  return { ok: fouten.length === 0, detail: fouten.join(", ") };
};

checks.groepPaginas = async () => {
  const fouten = [];
  const verwacht = { begin: 5, doen: 31, waarom: 12, naslag: 4 };
  for (const [id, n] of Object.entries(verwacht)) {
    await gids();
    document.querySelector(`[data-cat="${id}"]`).click(); await sleep(150);
    const k = document.querySelectorAll("#main .acard").length;
    if (k !== n) fouten.push(`${id}: ${k}`);
    if (id === "doen" && document.querySelectorAll("#main h2").length !== 6) fouten.push("subkoppen " + document.querySelectorAll("#main h2").length);
    if (id === "naslag" && (!document.querySelector("#main table") || !document.getElementById("main").innerText.includes("Bronnen en controle"))) fouten.push("naslag-blokken");
  }
  return { ok: fouten.length === 0, detail: fouten.join(", ") };
};

checks.alleArtikels = async () => {
  const fouten = [];
  const alle = GROEPEN.flatMap((g) => g.subs.flatMap((x) => x.arts)).concat(PLAGEN);
  for (const p of alle) {
    openArticle(p);
    const t = document.getElementById("sheet-t");
    if (!t || !t.textContent.trim()) fouten.push(p);
    closeOv();
  }
  const links = new Set();
  for (let i = 0; i < SG.length; i++) {
    S.tab = "gids"; S.gc = "start"; S.ch = i; render();
    document.querySelectorAll("#main [data-art]").forEach((b) => links.add(b.dataset.art));
  }
  for (const p of links) if (!artByPath(p)) fouten.push("Meer weten: " + p);
  S.gc = null;
  return { ok: fouten.length === 0, detail: fouten.slice(0, 5).join(", ") + ` (${links.size} Meer weten-links)` };
};

checks.naarHulp = async () => {
  await gids();
  document.querySelector('[data-act="tohulp"]').click(); await sleep(150);
  return { ok: S.tab === "hulp" && document.getElementById("h1").textContent === "Hulp" };
};

checks.hulpPlagen = async () => {
  S.tab = "hulp"; S.hulp = null; render(); await sleep(100);
  const b = [...document.querySelectorAll('#main button[data-art^="plagen/"]')];
  const paden = b.map((x) => x.dataset.art).sort();
  const ok = b.length === 8 && JSON.stringify(paden) === JSON.stringify([...PLAGEN].sort()) && paden.every((p) => artByPath(p));
  return { ok, detail: String(b.length) };
};

checks.terug = async () => {
  await gids();
  document.querySelector('[data-cat="doen"]').click(); await sleep(100);
  document.querySelector('[data-act="gback"]').click(); await sleep(100);
  return { ok: document.querySelectorAll(".gcat").length === 5 && S.gc === null };
};

const SJABLOON = ["zaaien/zaaien-binnen-buiten", "verzorging/water-geven", "seizoen/ijsheiligen", "seizoen/klimaat", "zaaien/kiemtijd", "zaaien/plantafstand", "oogsten/oogst-wanneer", "grond/voeding", "plagen/slakken", "plagen/phytophthora"];
const ZONDER_BRON = ["oogsten/oogst-wanneer", "grond/voeding"];

checks.sjabloon = async () => {
  const fouten = [];
  const verwacht = JSON.stringify(["Wat doe ik", "Hoe doe ik dat", "Waar let ik op"]);
  for (const pad of SJABLOON) {
    const r = artByPath(pad);
    const titels = r.a.b.filter((x) => x.k === "h").map((x) => x.t);
    if (JSON.stringify(titels) !== verwacht) fouten.push(pad + ": " + titels.join("|"));
  }
  return { ok: fouten.length === 0, detail: fouten.join("; ") };
};

checks.bronnen = async () => {
  const fouten = [];
  for (const g of GIDS) for (const a of g.arts) {
    if (!!a.bron !== !!a.nagekeken) fouten.push("half ingevuld: " + g.id + "/" + a.id);
  }
  for (const pad of SJABLOON) {
    const r = artByPath(pad), moetBron = !ZONDER_BRON.includes(pad);
    if (moetBron !== !!(r.a.bron && r.a.nagekeken)) fouten.push("bron " + pad);
    openArticle(pad);
    const regel = [...document.querySelectorAll("#sheet p.credit")].find((e) => e.textContent.startsWith("Bron:"));
    if (moetBron && (!regel || !regel.textContent.includes("Nagekeken: oktober 2026"))) fouten.push("regel ontbreekt " + pad);
    if (!moetBron && regel) fouten.push("regel zonder bron " + pad);
    closeOv();
  }
  openArticle("beginnen/waar-begin-ik");
  if ([...document.querySelectorAll("#sheet p.credit")].some((e) => e.textContent.startsWith("Bron:"))) fouten.push("regel bij artikel zonder velden");
  closeOv();
  return { ok: fouten.length === 0, detail: fouten.join("; ") };
};

// Acceptatiecriterium 8: interactieve elementen zijn minstens 44 px hoog.
// Vangnet voor de opgeslagen tuin: niets gaat stilzwijgend verloren.
checks.tuinVangnet = async () => {
  const bewaar = { a: localStorage.getItem(TK), b: localStorage.getItem(TKOPIE) };
  const oud = { crops: TUIN.crops.slice(), bak: TUIN.bak };
  const fouten = [];
  try {
    const id = C[0].id;
    // 1. onbekend id: kopie van het origineel blijft bewaard
    localStorage.removeItem(TKOPIE);
    const raw1 = JSON.stringify({ v: 1, crops: [id, "bestaat-niet"], plek: "alle", done: {} });
    localStorage.setItem(TK, raw1);
    const t1 = tuinLoad();
    if (t1.crops.length !== 1 || t1.crops[0] !== id) fouten.push("onbekend id niet gefilterd");
    if (localStorage.getItem(TKOPIE) !== raw1) fouten.push("geen kopie bij onbekend id");
    // 2. kapot bestand: lege tuin, maar kopie bewaard
    localStorage.removeItem(TKOPIE);
    localStorage.setItem(TK, "{kapot");
    const t2 = tuinLoad();
    if (t2.crops.length !== 0) fouten.push("kapot bestand geeft gewassen");
    if (localStorage.getItem(TKOPIE) !== "{kapot") fouten.push("geen kopie bij kapot bestand");
    // 3. een eerste kopie wordt niet overschreven
    localStorage.setItem(TK, "[1,2]");
    tuinLoad();
    if (localStorage.getItem(TKOPIE) !== "{kapot") fouten.push("eerste kopie overschreven");
    // 4. gezond bestand: geen kopie, oude gegevens zonder versie of back-upveld blijven werken
    localStorage.removeItem(TKOPIE);
    localStorage.setItem(TK, JSON.stringify({ crops: [id], plek: "pot", done: { "10": ["x"] } }));
    const t4 = tuinLoad();
    if (t4.crops.length !== 1 || t4.plek !== "pot" || !t4.done["10"] || t4.bak !== 0) fouten.push("oud formaat niet gelezen");
    if (localStorage.getItem(TKOPIE) !== null) fouten.push("onnodige kopie");
    // 5. opslaan schrijft de versie
    TUIN.crops = [id];
    tuinSave();
    if (JSON.parse(localStorage.getItem(TK)).v !== TVERSIE) fouten.push("versie niet bewaard");
    // 6. herinnering: zichtbaar zonder recente back-up, weg na een verse
    TUIN.bak = 0;
    await go("tuin");
    if (!document.getElementById("tbak")) fouten.push("herinnering ontbreekt");
    TUIN.bak = Date.now();
    await go("tuin");
    if (document.getElementById("tbak")) fouten.push("herinnering blijft staan");
    TUIN.crops = [];
    TUIN.bak = 0;
    await go("tuin");
    if (document.getElementById("tbak")) fouten.push("herinnering bij lege tuin");
  } finally {
    for (const [k, v] of [[TK, bewaar.a], [TKOPIE, bewaar.b]]) {
      if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v);
    }
    TUIN.crops = oud.crops;
    TUIN.bak = oud.bak;
    await go("kal");
  }
  return { ok: fouten.length === 0, detail: fouten.join("; ") || "6 onderdelen" };
};

export function kleineDoelen() {
  const sel = "button, a[href], input:not([type=hidden]), select, summary";
  return [...document.querySelectorAll(sel)]
    .filter((e) => e.offsetParent !== null && !e.closest("[hidden]") && !e.closest("[inert]"))
    .filter((e) => !(e.tagName === "A" && e.closest("p, li")))  // links in lopende tekst zijn uitgezonderd (WCAG 2.2, doelgrootte)
    .map((e) => ({ e, h: e.getBoundingClientRect().height }))
    .filter((x) => x.h > 0 && x.h < 43.5)
    .map((x) => `${x.e.tagName.toLowerCase()}.${(x.e.className || "").toString().split(" ")[0]} ${Math.round(x.h)}px "${(x.e.textContent || x.e.getAttribute("aria-label") || "").trim().slice(0, 25)}"`);
}

checks.doelen44 = async () => {
  const uit = {};
  const doe = async (naam, fn) => { await fn(); await sleep(200); const k = kleineDoelen(); if (k.length) uit[naam] = k.slice(0, 4); };
  await doe("kal-maand", async () => { resetFilters(); S.tab = "kal"; S.kv = "maand"; render(); });
  await doe("kal-jaar", async () => { S.kv = "jaar"; render(); document.querySelector('details.grp[data-view="jaar"]').open = true; });
  await doe("alle", async () => { S.tab = "alle"; render(); document.querySelectorAll("details.grp").forEach((d) => (d.open = true)); });
  await doe("tuin", async () => { S.tab = "tuin"; render(); });
  await doe("hulp", async () => { S.tab = "hulp"; S.hulp = null; render(); });
  await doe("hulp-detail", async () => { S.hulp = "geel"; render(); });
  await doe("gids", async () => { S.tab = "gids"; S.gc = null; S.hulp = null; render(); });
  await doe("gids-naslag", async () => { S.gc = "naslag"; render(); });
  await doe("detail", async () => { S.gc = null; openDetail("tomaat"); });
  closeOv();
  for (let i = 0; i < SG.length; i++) await doe("start-" + i, async () => { S.tab = "gids"; S.gc = "start"; S.ch = i; render(); });
  S.gc = null;
  for (const pad of ["zaaien/zaaien-binnen-buiten", "plagen/slakken"]) await doe("artikel " + pad, async () => { openArticle(pad); });
  closeOv();
  await doe("vergelijk", async () => { S.cmp.clear(); S.cmp.add("tomaat"); S.cmp.add("courgette"); openCompare(); });
  closeOv(); S.cmp.clear();
  return { ok: Object.keys(uit).length === 0, detail: JSON.stringify(uit) };
};

checks.zoekLekt = async () => {
  const secties = () => [...document.querySelectorAll("[data-sec]")].map((x) => x.dataset.sec + ":" + faseLijst(x.dataset.sec, NOW).length).join(",");
  resetFilters(); S.tab = "kal"; S.kv = "maand"; S.m = NOW; render(); await sleep(100);
  const basis = secties();
  S.kv = "jaar"; render(); await sleep(100);
  const q = document.getElementById("q");
  q.value = "tomaat"; q.dispatchEvent(new Event("input", { bubbles: true })); await sleep(100);
  document.querySelector('[data-kv="maand"]').click(); await sleep(150);
  const na = secties();
  resetFilters(); render();
  return { ok: na === basis && basis !== "", detail: basis + " <> " + na };
};

checks.hintGewassen = async () => {
  const fouten = [];
  resetFilters(); S.tab = "kal"; S.kv = "maand";
  for (const m of [2, 3]) {
    S.m = m; render(); await sleep(50);
    const lijst = faseLijst("zb", m).map((c) => c.id);
    const genoemd = C.filter((c) => new RegExp("(^|[^a-z])" + c.n.toLowerCase() + "([^a-z]|$)").test(HINT[m].toLowerCase()));
    if (!genoemd.length) fouten.push("geen gewas in hint " + m);
    for (const c of genoemd) if (!lijst.includes(c.id)) fouten.push(`${c.n} staat niet bij Zaai in huis in maand ${m}`);
  }
  S.m = NOW; render();
  return { ok: fouten.length === 0, detail: fouten.join("; ") };
};

checks.artikelGroep = async () => {
  const fouten = [];
  const verwacht = { "grond/mulchen": "Zo doe je het › Verzorgen", "seizoen/ijsheiligen": "Weten waarom", "plagen/slakken": "Hulp", "combineren/combi-goed": "Naslag" };
  for (const [pad, tekst] of Object.entries(verwacht)) {
    openArticle(pad);
    const meta = document.querySelector("#sheet .meta").textContent;
    if (!meta.startsWith(tekst)) fouten.push(pad + ": " + meta);
    closeOv();
  }
  return { ok: fouten.length === 0, detail: fouten.join("; ") };
};

checks.consistentie = async () => {
  const fouten = [];
  const txt = (p) => JSON.stringify(artByPath(p).a.b);
  const hulp = HELP.flatMap((x) => x.w).filter((w) => w.t === "Phytophthora").map((w) => w.d).join(" ");
  if (/restafval|Verwijder aangetaste delen/.test(hulp)) fouten.push("Hulp phytophthora spreekt artikel tegen");
  if (!txt("plagen/phytophthora").includes("composthoop") || !txt("plagen/phytophthora").includes("vier jaar")) fouten.push("phytophthora-artikel mist compost- of rotatieregel");
  const water = txt("verzorging/water-geven");
  if (/verbrand/i.test(water)) fouten.push("water: verbrandingsclaim");
  if (!water.includes("einde van de dag") || !water.includes("Potten en bakken")) fouten.push("water: moment of potten ontbreekt");
  const kiem = txt("zaaien/kiemtijd");
  if (!kiem.includes("2 tot 5 cm") || !kiem.includes("gewaspagina") || !kiem.includes("twee tot drie weken")) fouten.push("kiemtijd: nuance ontbreekt");
  if (!txt("zaaien/plantafstand").includes("gewaspagina")) fouten.push("plantafstand: verwijzing ontbreekt");
  return { ok: fouten.length === 0, detail: fouten.join("; ") };
};

export async function runAll(names) {
  const out = {};
  for (const naam of names || Object.keys(checks)) {
    try {
      out[naam] = await checks[naam]();
    } catch (e) {
      out[naam] = { ok: false, detail: "fout: " + e.message };
    }
  }
  return out;
}
