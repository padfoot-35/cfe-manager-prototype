import React, { useState, useEffect } from "react";
import { useApp, Head, Kpi, Table, status, Barcode, fmt, pct } from "./ui.jsx";
import { CUSTOMERS, PARTNERS, CONTRACTS, RISKS, STATES, GATE_NAMES } from "./data.js";

// ---------- Diagnostic tool ----------
const SOLAR = (() => { const a = []; for (let h = 0; h < 24; h++) { const x = h + 0.5; a.push(x > 6.3 && x < 18.3 ? Math.pow(Math.sin(Math.PI * (x - 6.3) / 12), 1.15) : 0); } const s = a.reduce((p, v) => p + v, 0); return a.map(v => v / s); })();
const SHAPES = { "Flat 24/7 (data centre)": Array(24).fill(1), "AI training (night-heavy)": Array.from({ length: 24 }, (_, h) => (h >= 20 || h < 6) ? 1.25 : 0.85), "Office / GCC (day-heavy)": Array.from({ length: 24 }, (_, h) => (h >= 8 && h < 20) ? 1.6 : 0.45) };
export function diagnose({ mw, shape, solarShare }) {
  const sh = SHAPES[shape]; const t = sh.reduce((a, v) => a + v, 0); const load = sh.map(v => v / t * 24 * mw);
  const daily = load.reduce((a, v) => a + v, 0);
  const sol = SOLAR.map(f => f * daily * solarShare);
  const now = load.map((l, h) => Math.min(l, sol[h]) / l);
  const score = load.reduce((a, l, h) => a + Math.min(l, sol[h]), 0) / daily;
  // Night Wrap: shift surplus with a 4-hour battery of 0.4x load, plus night green blocks to ~70%
  let store = Math.min(load.reduce((a, l, h) => a + Math.max(0, sol[h] - l), 0) * 0.88, mw * 0.4 * 4);
  const wrap = now.slice(); const order = [18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 17];
  for (const h of order) { const need = load[h] * (1 - wrap[h]); const use = Math.min(need, store, mw * 0.4); store -= use; wrap[h] += use / load[h]; }
  const wrapNight = wrap.map((v, h) => (h >= 17 || h < 7) ? Math.max(v, 0.58) : v);
  const wrapScore = Math.min(0.75, load.reduce((a, l, h) => a + l * wrapNight[h], 0) / daily);
  const cfe = load.map((_, h) => (h === 19 || h === 20) ? 0.7 : 0.94);
  const cfeScore = load.reduce((a, l, h) => a + l * cfe[h], 0) / daily;
  return { score, now, wrap: wrapNight, wrapScore, cfe, cfeScore, annualGWh: daily * 365 / 1000 };
}

export function Diagnostic() {
  const [f, setF] = useState({ name: "Colocation H", state: "Maharashtra", mw: 60, shape: "Flat 24/7 (data centre)", solarShare: 1.0 });
  const [ran, setRan] = useState(true);
  const r = diagnose(f);
  const up = (k, v) => { setF({ ...f, [k]: v }); };
  const recommend = r.score < 0.5 ? (f.mw >= 20 ? "CFE Service" : "Night Wrap") : r.score < 0.75 ? "Night Wrap" : "CFE Service";
  return (
    <div>
      <Head eyebrow="Grow · free product that opens every sale" title="Hourly diagnostic" lede="Enter a site and its current supply. In seconds you see the true hourly clean share behind a '100% green' annual claim, and the cheapest path to 75% and 90%." />
      <div className="grid g12">
        <div className="card">
          <h2>Your site</h2>
          <label className="f">Organisation</label><input type="text" value={f.name} onChange={e => up("name", e.target.value)} />
          <div className="grid g2" style={{ marginTop: 8 }}>
            <div><label className="f">State</label><select value={f.state} onChange={e => up("state", e.target.value)}>{STATES.map(s => <option key={s.name}>{s.name}</option>)}</select></div>
            <div><label className="f">Average IT load, MW</label><input type="number" min="1" max="500" value={f.mw} onChange={e => up("mw", Math.max(1, +e.target.value))} /></div>
          </div>
          <label className="f" style={{ marginTop: 8 }}>Load shape</label><select value={f.shape} onChange={e => up("shape", e.target.value)}>{Object.keys(SHAPES).map(s => <option key={s}>{s}</option>)}</select>
          <label className="f" style={{ marginTop: 8 }}>Annual solar bought vs annual use: <b className="mono">{pct(f.solarShare, 0)}</b></label>
          <input type="range" min="0.2" max="1.4" step="0.05" value={f.solarShare} onChange={e => up("solarShare", +e.target.value)} />
          <p className="small muted">100% = the site buys as much solar in a year as it uses, so it reports "100% green".</p>
          <button className="btn dark" onClick={() => setRan(true)}>Run diagnostic</button>
          <p className="small muted" style={{ marginTop: 10 }}>In live use this reads 12 months of 15-minute meter data, read-only. The diagnostic costs us ~₹4 lakh and is free to the customer.</p>
        </div>
        {ran && <div className="card">
          <div className="eyebrow">Diagnostic result · {f.name} · {f.state}</div>
          <div className="grid g3" style={{ margin: "10px 0" }}>
            <Kpi l="Annual claim" v={pct(Math.min(1, f.solarShare), 0)} s="matched over a year" />
            <Kpi l="True hourly clean share" v={pct(r.score, 0)} s="matched hour by hour" c="r" />
            <Kpi l="SBTi recognition" v={r.score >= 0.5 ? "≥50% ✓" : "below 50%"} s="≥50% to 2030, ≥75% to 2035, ≥90% after" c={r.score >= 0.5 ? "y" : "r"} />
          </div>
          <h3>A typical day today</h3><Barcode hours={r.now} />
          <h3 style={{ marginTop: 14 }}>Path to 75%: Night Wrap · {pct(r.wrapScore, 0)}</h3><Barcode hours={r.wrap} />
          <p className="small muted">Battery shifting of your own midday solar plus night green blocks. No new equity for you. We keep about ₹8.1 lakh per MW a year.</p>
          <h3 style={{ marginTop: 14 }}>Path to 90%: CFE Service · {pct(r.cfeScore, 0)}</h3><Barcode hours={r.cfe} />
          <p className="small muted">Full supply from partner solar, wind and batteries, guaranteed at 90% for 15 years at ₹6.50/kWh all-in (₹6.30 energy + ₹0.21 platform fee), versus ~₹6.51 to do it yourself.</p>
          <div className="note" style={{ marginTop: 10 }}><b>Recommended next step: {recommend}.</b> Annual use {fmt(r.annualGWh, 0)} GWh. Start with shadow mode: see your real hourly score for 1–3 months before any commitment.</div>
        </div>}
      </div>
    </div>
  );
}

// ---------- Pipeline and waves ----------
export function Pipeline() {
  const [diag, setDiag] = useState(50);
  const prop = diag * 0.5, ts = prop * 0.4, signed = ts * 0.65;
  const waves = [
    ["Wave 1 · now", ["Colocation operators", "STT GDC, Nxtra, CtrlS, Sify, Yotta", "Tenants want 75–100% by renewal", "Night Wrap → CFE Service"], ["Hyperscalers in India", "Google, Microsoft, AWS", "Tenants, no open access; Mumbai at 20% hourly", "Hourly Certificates"]],
    ["Wave 2", ["Multinationals' Indian sites", "GCCs, pharma, auto", "SBTi Category A; 1–20 MW sites", "Certificates, Ledger"], ["Indian SBTi companies", "IT services, banks (445 firms)", "Hourly share assured from 2027; BRSR Core", "Ledger → Night Wrap"]],
    ["Wave 3", ["EU exporters", "Cement, fertiliser", "CBAM credit needs an hourly physical PPA", "CFE Service"]],
  ];
  return (
    <div>
      <Head eyebrow="Grow" title="Pipeline and customer waves" lede="Five segments in three waves. We land with a free diagnostic, prove with a wrap or certificates, and convert to CFE Service at re-contracting." />
      <div className="grid g3">{waves.map(([w, ...segs], i) => <div key={w} className="card" style={{ borderTop: `4px solid ${["#ffe600", "#f5b800", "#c7cbd8"][i]}` }}><h2>{w}</h2>{segs.map(s => <div key={s[0]} style={{ padding: "8px 0", borderBottom: "1px solid var(--line)" }}><b>{s[0]}</b><div className="small muted">{s[1]}</div><div className="small">{s[2]}</div><span className="pill y" style={{ marginTop: 4 }}>{s[3]}</span></div>)}</div>)}</div>
      <div className="grid g2" style={{ marginTop: 14 }}>
        <div className="card">
          <h2>Funnel per year</h2>
          <label className="f">Diagnostics run: <b className="mono">{diag}</b> (model: 8 in 2027 rising to 120 in 2036)</label>
          <input type="range" min="8" max="120" value={diag} onChange={e => setDiag(+e.target.value)} />
          {[["Diagnostics", diag, 1], ["Proposals (50%)", prop, .5], ["Term sheets (40%)", ts, .2], ["Signed (65%)", signed, .13]].map(([l, v, w]) => <div key={l} style={{ margin: "8px auto", width: (40 + 60 * w) + "%", background: l.startsWith("Signed") ? "#ffe600" : "#4a5170", color: l.startsWith("Signed") ? "#111" : "#fff", borderRadius: 6, padding: "6px 10px", textAlign: "center" }}><b className="mono">{fmt(v, 0)}</b> {l}</div>)}
          <p className="small muted">13% of diagnostics sign, within the 12–18% sales benchmark. Product split at signing: CFE 15% · Night Wrap 45% · Certificates 25% · Ledger 15%.</p>
        </div>
        <div className="card">
          <h2>Not targeted</h2>
          <p>Cost-first industry (~80% of open-access buyers). They buy on price; our value is ESG credibility. They join as <b>factory pool members</b> instead, buying our midday surplus.</p>
          <h2 style={{ marginTop: 14 }}>Go-to-market</h2>
          <Table cols={["Step", "When", "Price"]} rows={[["1 Diagnostic", "Weeks 0–6", "Free"], ["2 Wrap or Certificates", "Months 2–12", "₹8 lakh/MW or ₹145/MWh"], ["3 CFE Service", "Year 2+, at re-contracting", "~₹0.60/kWh kept"], ["4 Expand", "Every year", "₹12 lakh per pool"]]} />
        </div>
      </div>
    </div>
  );
}

// ---------- Onboarding queue ----------
const APPLICANTS = [
  ["Colocation H", "Customer", "cust", 8], ["IT Services E", "Customer", "custE", 8], ["Deccan Solar Park", "Partner", "partnerMH", 7], ["Konkan Storage", "Partner", "partner", 7],
  ["Surat Textile Mills", "Factory", "factory", 6], ["Pune Forgings", "Factory", "factoryP", 6], ["Partner trading member", "Trading member", "trader", 4], ["Assurance firm", "Verifier", "verifier", 4],
];
const STAGE_NAMES = { Customer: ["Register", "Meter data", "Diagnostic", "Term sheet", "Diligence", "Contract", "Shadow mode", "Live"], Partner: ["Register", "6 gates", "Backtest", "Terms", "Signing", "Integration", "Live"], Factory: ["Register", "Load data", "Savings", "Membership", "Open access", "Live"], "Trading member": ["Empanelment", "Mandate", "Systems link", "Live"], Verifier: ["Appointment", "Method review", "Access", "Monthly review"] };
const PORTAL = { Customer: "portal-customer", Partner: "portal-partner", Factory: "portal-factory", "Trading member": "portal-trader", Verifier: "portal-verifier" };
export function Queue() {
  const { journeys, setJourney, setPage } = useApp();
  const init = { custE: 2, partnerMH: 3, factoryP: 1 };
  const rows = APPLICANTS.map(([n, side, id, total]) => { const done = journeys[id] ?? init[id] ?? 0; const live = done >= total; return [<b>{n}</b>, side, live ? <span className="pill g">Live</span> : <span className="pill y">{STAGE_NAMES[side][done]}</span>, live ? "–" : done % 2 ? "CFE Manager" : "Applicant", `${done}/${total}`,
    <div className="row">{!live && <button className="btn sm dark" onClick={() => setJourney(id, done + 1)}>Approve stage</button>}<button className="btn sm" onClick={() => setPage(PORTAL[side])}>Open portal</button></div>]; });
  const open = APPLICANTS.filter(([, , id, t]) => (journeys[id] ?? init[id] ?? 0) < t).length;
  return (
    <div>
      <Head eyebrow="Grow" title="Every applicant, every stage, one queue" lede="Customers, partners, factories, the trading member and the verifier each follow their own journey in their portal. Submissions land here; approving a stage unlocks the next one in their portal." />
      <div className="grid g4" style={{ marginBottom: 14 }}><Kpi l="Open applications" v={open} /><Kpi l="Waiting on us" v={Math.ceil(open / 3)} s="target: 2 working days" c="y" /><Kpi l="Waiting on applicants" v={open - Math.ceil(open / 3)} s="reminders weekly" /><Kpi l="Live this quarter" v={APPLICANTS.length - open + 3} s="incl. existing portfolio" c="g" /></div>
      <div className="card"><Table cols={["Applicant", "Side", "Stage", "Waiting on", "Progress", "Action"]} rows={rows} /></div>
      <p className="small muted">Demo: approvals are simulated and kept only in this browser tab.</p>
    </div>
  );
}

export function Customers() {
  const [sel, setSel] = useState(0);
  const c = CUSTOMERS[sel];
  return (
    <div>
      <Head eyebrow="Grow" title="Customers" lede="One promise, five things to buy. Most accounts land on a lighter product and step up to CFE Service when the campus re-contracts." />
      <div className="grid g21">
        <div className="card"><Table cols={["Customer", "Site", "MW", "Product", "Wave", "Status", "Hourly score"]} num={[2]} rows={CUSTOMERS.map((x, i) => [<button className="btn sm" onClick={() => setSel(i)}>{x.name}</button>, x.site, x.mw, x.product, x.wave, status(x.status), x.score])} /></div>
        <div className="card"><div className="eyebrow">Account</div><h2>{c.name}</h2><p className="muted">{c.site} · {c.state} · {c.mw} MW</p>
          <Table cols={["", ""]} rows={[["Product", c.product], ["Wave", c.wave], ["Status", status(c.status)], ["Hourly score", c.score], ["Buying committee", "Sustainability, finance, legal, IT"], ["Next step", c.status === "Live" ? "Expand: Ledger on every pool" : c.status === "Shadow mode" ? "Sign MSA after shadow report" : "Run diagnostic / proposal"]]} />
        </div>
      </div>
    </div>
  );
}

export function Partners() {
  return (
    <div>
      <Head eyebrow="Grow · asset-light" title="Partners own the assets; we run the engine" lede="CFE Manager owns no plants. Developers and battery owners sign 15-year PPAs or tolls with us; their costs pass through. Every asset clears six gates before it can supply." />
      <div className="grid g4" style={{ marginBottom: 14 }}><Kpi l="Assets we own" v="0 MW" c="y" /><Kpi l="Live partner capacity" v="490 MW" s="380 solar + 110 wind" /><Kpi l="Partner storage" v="400 MWh" s="100 MW toll" /><Kpi l="Partner revenue per 100 MW" v="₹452 Cr" s="a year, contracted" c="g" /></div>
      <div className="card"><Table cols={["Asset", "Partner", "Type", "State", "Capacity", "Contract", "Gates (of 6)", "Status"]} rows={PARTNERS.map(p => [<span className="mono">{p.id}</span>, p.name, p.kind, p.state, p.mw + " " + p.unit, p.contract, <div className="bar" style={{ width: 90 }}><div style={{ width: p.gates / 6 * 100 + "%", background: p.gates === 6 ? "#2fbf71" : "#f5b800" }} /></div>, status(p.status)])} /></div>
      <div className="card" style={{ marginTop: 14 }}><h2>The six gates</h2><div className="grid g3">{["Location and grid connection", "Metering to 15-minute blocks", "Attributes not already sold", "Data feeds (SCADA / QCA forecasts)", "Lender consent", "Backtest in the portfolio engine"].map((g, i) => <div key={g} className="row"><span className="pill b">{i + 1}</span>{g}</div>)}</div><p className="small muted">Rejected example: out-of-state wind with no grid route, and solar whose certificates are already sold to another buyer.</p></div>
    </div>
  );
}

export function Contracts() {
  return (
    <div>
      <Head eyebrow="Grow" title="One commercial interface, ten documents behind it" lede="The customer signs one services agreement. Physical supply, storage, trading, open access, pooling and certificates each keep their own document and counterparty." />
      <div className="card"><Table cols={["Document", "Parties", "Status", "Key terms", "Owner"]} rows={CONTRACTS.map(c => [<b>{c[0]}</b>, c[1], status(c[2]), c[3], c[4]])} /></div>
      <div className="card" style={{ marginTop: 14 }}><h2>Who carries which risk</h2><Table cols={["Risk", "Carried by", "How it is managed"]} rows={RISKS} /></div>
    </div>
  );
}

export function Feasibility() {
  const [f, setF] = useState({ name: "AI Campus G", state: "Maharashtra", mw: 150, shape: "Flat 24/7 (data centre)", target: "CFE90" });
  const [res, setRes] = useState(null);
  const run = () => {
    const k = f.mw / 100, t = { CFE75: 0.8, CFE90: 1, CFE95: 1.18 }[f.target];
    const st = STATES.find(s => s.name === f.state);
    const greens = st.gates.filter(g => g === 2).length;
    const route = greens === 8 ? "Quote now" : greens >= 5 ? "Shadow mode, then quote" : "Wait: state not open";
    setRes({ solar: 380 * k * t, wind: 110 * k * t, batt: 100 * k * t, battH: 400 * k * t, price: 6.50 + (f.target === "CFE95" ? 0.35 : f.target === "CFE75" ? -0.30 : 0), factories: Math.round(8 * k), st, route, greens });
  };
  useEffect(() => { run(); }, []);
  const dot = g => <span title={g === 2 ? "Green" : g === 1 ? "In progress" : "Not started"} style={{ display: "inline-block", width: 13, height: 13, borderRadius: 7, background: g === 2 ? "#1f9d63" : g === 1 ? "linear-gradient(90deg,#f5b800 50%,#fff 50%)" : "#fff", border: "2px solid " + (g === 2 ? "#1f9d63" : g === 1 ? "#f5b800" : "#e5533d") }} />;
  return (
    <div>
      <Head eyebrow="Grow" title="Can we serve this customer?" lede="Enter any request. The engine sizes the partner portfolio; then each state gate decides whether we quote, shadow or wait." />
      <div className="grid g2">
        <div className="card"><h2>Request</h2>
          <label className="f">Customer</label><input type="text" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
          <div className="grid g2" style={{ marginTop: 8 }}>
            <div><label className="f">State</label><select value={f.state} onChange={e => setF({ ...f, state: e.target.value })}>{STATES.map(s => <option key={s.name}>{s.name}</option>)}</select></div>
            <div><label className="f">Average load, MW</label><input type="number" value={f.mw} onChange={e => setF({ ...f, mw: Math.max(1, +e.target.value) })} /></div>
            <div><label className="f">Load shape</label><select value={f.shape} onChange={e => setF({ ...f, shape: e.target.value })}>{Object.keys(SHAPES).map(s => <option key={s}>{s}</option>)}</select></div>
            <div><label className="f">Target</label><select value={f.target} onChange={e => setF({ ...f, target: e.target.value })}>{["CFE75", "CFE90", "CFE95"].map(s => <option key={s}>{s}</option>)}</select></div>
          </div>
          <button className="btn dark" style={{ marginTop: 12 }} onClick={run}>Assess request</button>
        </div>
        <div className="card"><h2>Result</h2>{!res ? <p className="muted">Run an assessment to see the sized partner portfolio, the state gates and the entry route.</p> : <>
          <div className="grid g3"><Kpi l="Partner solar" v={fmt(res.solar, 0) + " MWac"} /><Kpi l="Partner wind" v={fmt(res.wind, 0) + " MW"} /><Kpi l="Partner battery" v={fmt(res.batt, 0) + " MW"} s={fmt(res.battH, 0) + " MWh"} /></div>
          <div className="grid g3" style={{ marginTop: 10 }}><Kpi l="Indicative all-in price" v={"₹" + fmt(res.price, 2)} s="per kWh, 15 years" c="y" /><Kpi l="Factories to pool surplus" v={"~" + res.factories} s="day-shift members" /><Kpi l="State gates green" v={res.greens + " of 8"} c={res.greens === 8 ? "g" : "r"} /></div>
          <div className="note" style={{ marginTop: 10 }}><b>Route: {res.route}.</b> {res.st.position}</div>
          {f.target === "CFE95" && <p className="small muted">CFE95 needs ~18% more partner capacity and more storage; price rises about ₹0.35/kWh.</p>}
        </>}</div>
      </div>
      <div className="card" style={{ marginTop: 14 }}><div className="row"><h2 style={{ flex: 1 }}>State entry gates</h2><span className="small muted">Filled = green · half = in progress · empty = not started. A state opens fully only when all eight are green.</span></div>
        <Table cols={["State", ...GATE_NAMES, "Recruitment starts", "Pool opens", "Position"]} rows={STATES.map(s => [<b>{s.name}</b>, ...s.gates.map(dot), s.entry, s.poolOpen, <span className="small">{s.position}</span>])} />
      </div>
    </div>
  );
}
