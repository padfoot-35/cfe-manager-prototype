// CFE Manager simulation engine: one month (Oct 2030) in 15-minute blocks for one 100 MW campus
// plus a factory pool. Deterministic synthetic weather. All numbers are illustrative and
// anchored to the team's platform model v6 (prices, cost stack, pooling).

export const P = {
  month: "October 2030", days: 31, blocks: 96,
  loadMW: 100,                 // contracted campus load
  solarMW: 380, windMW: 110,   // partner-owned, contracted
  battMW: 100, battMWh: 400, rte: 0.90, socMin: 0.10, socMax: 0.95,
  loss: 0.03,                  // delivery losses
  poolShare: 0.70,             // max share of surplus that can be pooled (captive rules)
  factories: 8, factoryMW: 8.5, shiftStart: 8, shiftEnd: 18,
  topupCapMW: 20, topupPrice: 5.0,
  priceEnergy: 6.496, listPrice: 6.65, feeLakhPerMWMonth: 1.5, allIn: 6.70, diy: 7.00, rebate: 0.10, // v6: energy after 75% fee carve-out; rebate once the state pool is 80% full
  cost: { solar: 2.54, battery: 1.54, wind: 1.08, delivery: 1.21, cert: 0.02 },
  poolPrice: 3.00, exchangePrice: 1.50, factorySaving: 2.0, factoryFeeShare: 0.10,
  payoutPerPoint: 0.02, payoutCap: 0.10, suretyShare: 0.5, floor: 0.90, co2: 0.71,
};

// small deterministic PRNG
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

export const SCENARIOS = [
  { id: "normal", name: "Normal month", desc: "Base weather, all partners available, pooling open." },
  { id: "windlull", name: "Wind lull tonight", desc: "Wind −65% from 18:00 to 06:00 on 15 Oct." },
  { id: "batttrip", name: "Battery trips at 22:30", desc: "Battery unavailable 22:30–06:00 on 15 Oct." },
  { id: "aiload", name: "Customer AI training run", desc: "+20 MW from 20:00 to 06:00, 15–16 Oct." },
  { id: "cloud", name: "Cloud cover", desc: "Solar −40% from 08:00 to 17:00 on 15 Oct." },
  { id: "noclear", name: "Exchange does not clear", desc: "No green top-up available on 15 Oct." },
  { id: "poolblock", name: "Maharashtra blocks pooling", desc: "Pooling closed all month: surplus goes to the exchange at ₹1.50." },
  { id: "factoryleaves", name: "Two factories leave the pool", desc: "Pool shrinks from 8 to 6 factories from 10 Oct." },
  { id: "badweek", name: "A bad week of wind", desc: "Wind −65% for seven days, 12–18 Oct." },
  { id: "gridcharge", name: "Battery charged from the grid", desc: "Off-plan grid charging 02:00–05:00: that stored energy cannot count." },
];

export function simulate(opts = {}) {
  const sc = opts.scenario || "normal";
  const mode = opts.mode || "engine"; // 'engine' or 'fixed' (no coordination, no pooling)
  const p = { ...P, ...(opts.params || {}) };
  const r = rng(20301015);
  const N = p.days * p.blocks;
  const dayCloud = [], dayWind = [];
  for (let d = 0; d < p.days; d++) { dayCloud.push(0.80 + 0.20 * r()); dayWind.push(0.65 + 0.70 * r()); }
  let soc = 0.5 * p.battMWh, dirty = 0; // dirty = MWh in the battery that came from the grid
  const B = [];
  let windWalk = 0;
  for (let i = 0; i < N; i++) {
    const d = Math.floor(i / p.blocks), b = i % p.blocks, h = b / 4, day = d + 1;
    // demand
    let load = p.loadMW * (0.97 + 0.06 * r());
    if (sc === "aiload" && ((day === 15 && h >= 20) || (day === 16 && h < 6))) load += 20;
    // solar
    let sol = 0;
    if (h > 6.25 && h < 18.25) sol = p.solarMW * Math.pow(Math.sin(Math.PI * (h - 6.25) / 12), 1.15) * dayCloud[d] * (0.93 + 0.07 * r());
    if (sc === "cloud" && day === 15 && h >= 8 && h < 17) sol *= 0.6;
    // wind: stronger in evening/night
    windWalk = Math.max(-0.25, Math.min(0.25, windWalk + (r() - 0.5) * 0.06));
    let wcf = (0.30 + 0.16 * Math.cos(2 * Math.PI * (h - 23) / 24) + windWalk) * dayWind[d];
    let wind = Math.max(0, Math.min(1, wcf)) * p.windMW;
    if (sc === "windlull" && ((day === 15 && h >= 18) || (day === 16 && h < 6))) wind *= 0.35;
    if (sc === "badweek" && day >= 12 && day <= 18) wind *= 0.35;
    const battOut = sc === "batttrip" && ((day === 15 && h >= 22.5) || (day === 16 && h < 6));
    const topupOk = !(sc === "noclear" && day === 15);
    const nFact = sc === "factoryleaves" && day >= 10 ? 6 : p.factories;
    const poolOpen = mode === "engine" && sc !== "poolblock";
    const inShift = h >= p.shiftStart && h < p.shiftEnd && (d % 7 !== 6); // Sundays off
    const poolCap = poolOpen && inShift ? nFact * p.factoryMW : 0;

    const avail = (sol + wind) * (1 - p.loss);
    const sSol = sol * (1 - p.loss), sWind = wind * (1 - p.loss);
    let serve = Math.min(load, avail);
    let fromSol = Math.min(load, sSol), fromWind = Math.max(0, serve - fromSol);
    let excess = avail - serve;
    // charge battery from clean excess
    let charge = 0;
    if (!battOut) charge = Math.min(excess, p.battMW, (p.socMax * p.battMWh - soc) * 4 / Math.sqrt(p.rte));
    soc += charge / 4 * Math.sqrt(p.rte); excess -= charge;
    let gridCharge = 0;
    if (sc === "gridcharge" && h >= 2 && h < 5 && !battOut) { gridCharge = Math.min(40, Math.max(0, (p.socMax * p.battMWh - soc) * 4)); soc += gridCharge / 4 * Math.sqrt(p.rte); dirty += gridCharge / 4 * Math.sqrt(p.rte); }
    // surplus: pool first (up to share and factory demand), rest exchange
    let pooled = Math.min(excess * p.poolShare, poolCap), exch = excess - pooled;
    // shortfall
    let short = load - serve, dis = 0, top = 0, dirtyOut = 0;
    if (!battOut && short > 0) {
      const availE = Math.max(0, soc - p.socMin * p.battMWh) * Math.sqrt(p.rte) * 4; // MW for one block
      if (mode === "engine") {
        // spread stored energy over the remaining dark blocks; top-up covers the rest
        const blocksToSun = h >= 18 ? (24 - h + 7) * 4 : h < 7 ? (7 - h) * 4 : 4;
        const spread = availE / 4 / Math.max(1, blocksToSun) * 4;
        dis = Math.min(short, p.battMW, availE, Math.max(spread * 1.15, short - (topupOk ? p.topupCapMW : 0)));
      } else {
        // fixed schedule: flat discharge 18:00-06:00
        if (h >= 18 || h < 6) dis = Math.min(short, p.battMW, availE, p.battMWh * 0.85 / 12);
      }
      const out = dis / 4 / Math.sqrt(p.rte); const f = soc > 0 ? Math.min(1, dirty / soc) : 0;
      dirtyOut = dis * f; dirty = Math.max(0, dirty - out * f); soc -= out;
    }
    short -= dis;
    if (short > 0 && topupOk) { top = Math.min(short, mode === "engine" ? p.topupCapMW : p.topupCapMW * 0.5); short -= top; }
    const grid = short;
    // stored energy that came from the grid cannot count
    const disClean = dis - dirtyOut;
    const clean = load - grid - (dis - disClean);
    B.push({ i, day, b, h, load, sol: fromSol, wind: fromWind, solRaw: sol, windRaw: wind, charge, dis, top, grid: grid + (dis - disClean), pooled, exch, soc, clean, poolCap });
  }
  return { blocks: B, summary: summarize(B, p, sc, mode) };
}

export function summarize(B, p = P, sc = "normal", mode = "engine") {
  const E = k => B.reduce((s, x) => s + x[k], 0) / 4; // MWh
  const load = E("load"), clean = E("clean"), grid = E("grid"), pooled = E("pooled"), exch = E("exch"), top = E("top"), dis = E("dis");
  const score = clean / load;
  // hourly
  const hours = [];
  for (let k = 0; k < B.length; k += 4) {
    const s = B.slice(k, k + 4); const l = s.reduce((a, x) => a + x.load, 0), c = s.reduce((a, x) => a + x.clean, 0);
    hours.push({ day: s[0].day, hour: Math.floor(s[0].h), load: l / 4, clean: c / 4, score: c / l });
  }
  const below = hours.filter(x => x.score < 0.9).length;
  const kWh = load * 1000;
  const billEnergy = load * 1000 * p.priceEnergy / 1e7; // Rs Cr
  const fee = p.feeLakhPerMWMonth * p.loadMW / 100; // Rs Cr per month
  const c = p.cost;
  const partner = kWh * (c.solar + c.battery + c.wind + c.delivery + c.cert) / 1e7;
  const topCost = top * 1000 * p.topupPrice / 1e7;
  const surplusRev = (pooled * p.poolPrice + exch * p.exchangePrice) * 1000 / 1e7;
  const factoryFees = pooled * 1000 * p.factorySaving * p.factoryFeeShare / 1e7;
  const rebate = (mode === "engine" && sc !== "poolblock") ? kWh * p.rebate / 1e7 : 0; // pool full in this month
  const bill = billEnergy + fee - rebate;
  const pts = Math.max(0, (p.floor - score) * 100);
  const payout = Math.min(p.payoutCap, pts * p.payoutPerPoint) * bill;
  const margin = bill - partner - topCost + surplusRev + factoryFees - payout * (1 - p.suretyShare);
  return {
    load, clean, grid, pooled, exch, top, dis, score, hours, below,
    worst: hours.reduce((m, x) => x.score < m.score ? x : m, hours[0]),
    bill, billEnergy, fee, rebate, partner, topCost, surplusRev, factoryFees, payout, margin,
    marginPerKWh: margin * 1e7 / kWh, co2: clean * p.co2,
  };
}

export const fmt = (v, d = 1) => (v == null || isNaN(v)) ? "–" : Number(v).toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d });
export const pct = (v, d = 1) => fmt(v * 100, d) + "%";
