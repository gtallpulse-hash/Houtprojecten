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

export const checks = {
  // Taak 0: uitgangspositie
  artikels60: async () => {
    const n = GIDS.reduce((s, g) => s + g.arts.length, 0);
    return { ok: n === 60, detail: String(n) };
  },
  geenOverflow: async () => ({ ok: overflow() === false }),
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
