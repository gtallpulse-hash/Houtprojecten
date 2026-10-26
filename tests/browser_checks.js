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
  TUIN.crops = oud;
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
