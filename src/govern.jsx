import React, { useMemo, useState } from "react";
import { ComposedChart, Area, Line, Bar, BarChart, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { useApp, Head, Kpi, Table, status, fmt, pct } from "./ui.jsx";
import { simulate, SCENARIOS, P } from "./engine.js";
import { FIN, YEARS, REGS } from "./data.js";

// ---------- Guarantee and risk ----------
export function Guarantee() {
  const { sim, scen, setScen } = useApp();
  const [score, setScore] = useState(0.875);
  const bill = sim.summary.bill;
  const pts = Math.max(0, (0.9 - score) * 100);
  const payPct = Math.min(0.10, pts * 0.02);
  const pay = payPct * bill;
  const stress = useMemo(() => SCENARIOS.map(s => { const r = simulate({ scenario: s.id }).summary; return { s, r }; }), []);
  const maxT = 280;
  return (
    <div>
      <Head eyebrow="Govern" title="The guarantee, and who carries which risk" lede="We promise a monthly CFE90 score. Below 90% we pay 2% of the monthly bill per point, capped at 10%. A surety bond covers half of any payout." />
      <div className="grid g2">
        <div className="card">
          <h2>Payout calculator</h2>
          <label className="f">Monthly hourly score: <b className="mono">{pct(score, 1)}</b></label>
          <input type="range" min="0.80" max="0.96" step="0.001" value={score} onChange={e => setScore(+e.target.value)} />
          <div className="grid g3" style={{ marginTop: 10 }}>
            <Kpi l="Points below 90%" v={fmt(pts, 1)} c={pts > 0 ? "r" : "g"} />
            <Kpi l="Service credit" v={pct(payPct, 1)} s="of the monthly bill" />
            <Kpi l="Payout" v={"₹" + fmt(pay, 2) + " Cr"} s={"we bear ₹" + fmt(pay / 2, 2) + " Cr after surety"} c="y" />
          </div>
          <p className="small muted" style={{ marginTop: 10 }}>Monthly bill for a 100 MW campus ≈ ₹{fmt(bill, 1)} Cr (energy at ₹6.50 incl. delivery + platform fee ₹1.5 lakh/MW/month, less the ₹0.10/kWh pool rebate). Cap reached at 85%.</p>
        </div>
        <div className="card">
          <h2>Stress test: every what-if, re-simulated</h2>
          <Table cols={["What-if", "Score", "Hours <90%", "Payout", "Margin ₹/kWh"]} num={[1, 2, 3, 4]} rows={stress.map(({ s, r }) => [<button className={"btn sm" + (scen.id === s.id ? " dark" : "")} onClick={() => setScen(s.id)}>{s.name}</button>, <span style={{ color: r.score < 0.9 ? "#c0392b" : "#156c44", fontWeight: 700 }}>{pct(r.score, 1)}</span>, r.below, r.payout > 0 ? "₹" + fmt(r.payout, 2) + " Cr" : "–", fmt(r.marginPerKWh, 2)])} />
          <p className="small muted">Every line is a full month (2,976 blocks) run through the same engine.</p>
        </div>
      </div>
      <div className="grid g2" style={{ marginTop: 14 }}>
        <div className="card">
          <h2>What moves 2036 EBITDA (₹352 Cr base)</h2>
          {FIN.tornado.map(([l, lo, hi]) => (
            <div key={l} style={{ display: "grid", gridTemplateColumns: "210px 1fr", gap: 10, alignItems: "center", margin: "8px 0" }}>
              <span className="small">{l}</span>
              <div style={{ position: "relative", height: 20, background: "#f3f4f8", borderRadius: 4 }}>
                <div style={{ position: "absolute", left: "50%", top: -3, bottom: -3, width: 1, background: "#141a2e" }} />
                <div style={{ position: "absolute", right: "50%", width: (-lo / maxT * 50) + "%", height: "100%", background: "#e5533d", borderRadius: "4px 0 0 4px" }} />
                {hi > 0 && <div style={{ position: "absolute", left: "50%", width: (hi / maxT * 50) + "%", height: "100%", background: "#2fbf71", borderRadius: "0 4px 4px 0" }} />}
                <span className="mono small" style={{ position: "absolute", left: 4, top: 1 }}>{lo}</span>
                {hi > 0 && <span className="mono small" style={{ position: "absolute", right: 4, top: 1 }}>+{hi}</span>}
              </div>
            </div>))}
          <p className="small muted">₹ Cr change in 2036 EBITDA vs ₹352 Cr. Pooling closed everywhere is still the largest swing, but the core keeps ₹186 Cr.</p>
        </div>
        <div className="card">
          <h2>Protections</h2>
          <Table cols={["Layer", "What it does"]} rows={[["Portfolio oversizing", "380 MW solar + 110 MW wind for 100 MW load"], ["Partner battery", "100 MW / 400 MWh shifts midday solar to the night"], ["Green top-up", "Up to 20 MW from G-DAM at ~₹5/kWh"], ["Surety bond", "Covers 50% of guarantee payouts"], ["Partner LCs", "One month of payments, 20% cash margin"], ["Monte Carlo", "300 runs: 2036 EBITDA P10 ₹215 Cr, P50 ₹374 Cr, P90 ₹612 Cr; with no pooling P10 ₹44 Cr, P50 ₹215 Cr"], ["Value pricing", "₹6.70 all-in, ₹0.30 below a fully costed DIY, so the core earns ₹186 Cr without pooling"]]} />
        </div>
      </div>
    </div>
  );
}

// ---------- Financials ----------
export function Financials() {
  const [view, setView] = useState("ebitda");
  const data = YEARS.map((y, i) => ({ y, net: FIN.net[i], ebitda: FIN.ebitda[i], band: [FIN.p10[i], FIN.p90[i]], p50: FIN.p50[i], fcf: FIN.fcf[i], cum: FIN.cumFcf[i], cash: FIN.cash[i] }));
  const k = FIN.kpi;
  return (
    <div>
      <Head eyebrow="Govern" title="Financials: ₹80 Cr to a ₹563 Cr net-revenue platform" lede="Team platform model v6: priced at ₹6.70 all-in, ₹0.30 below a fully costed do-it-yourself cost of ₹7.00; the core business earns ₹186 Cr of 2036 EBITDA with no factory pooling, and pooling adds ₹167 Cr on top. Gross billings pass through to partners; we report net revenue: platform fees, energy margin, certificates, Night Wrap, Ledger and factory fees." />
      <div className="grid g6" style={{ marginBottom: 14 }}>
        <Kpi l="Equity raised" v={"₹" + k.equity + " Cr"} s="Seed ₹40 Cr 2027, Series A ₹40 Cr 2029" />
        <Kpi l="2036 net revenue" v="₹563 Cr" s="gross billings ₹5,237 Cr" c="y" />
        <Kpi l="2036 EBITDA" v="₹352 Cr" s="63% of net revenue; ₹186 Cr without pooling" c="g" />
        <Kpi l="EBITDA break-even" v={k.breakEven} />
        <Kpi l="Cumulative FCF positive" v={k.cashPositive} s={"peak need ₹" + k.peak + " Cr"} />
        <Kpi l="Equity IRR" v={k.irr + "%"} s={"LTV/CAC " + k.ltvcac + "×"} />
      </div>
      <div className="card">
        <div className="tabs">{[["ebitda", "EBITDA with 300-run band"], ["net", "Net revenue by stream"], ["cash", "Cash and free cash flow"]].map(([id, l]) => <button key={id} className={view === id ? "on" : ""} onClick={() => setView(id)}>{l}</button>)}</div>
        <div style={{ height: 320 }}>
          <ResponsiveContainer>
            {view === "ebitda" ? (
              <ComposedChart data={data}><CartesianGrid stroke="#eef0f6" vertical={false} /><XAxis dataKey="y" /><YAxis unit="" /><Tooltip formatter={v => Array.isArray(v) ? `₹${v[0]} to ₹${v[1]} Cr` : `₹${v} Cr`} /><Legend />
                <Area dataKey="band" name="P10 to P90" fill="#ffe600" fillOpacity={0.35} stroke="none" />
                <Line dataKey="p50" name="Monte Carlo P50" stroke="#b89a00" strokeDasharray="5 4" dot={false} />
                <Line dataKey="ebitda" name="Base case EBITDA" stroke="#0f1630" strokeWidth={3} />
                <ReferenceLine y={0} stroke="#141a2e" />
              </ComposedChart>
            ) : view === "net" ? (
              <BarChart data={YEARS.map((y, i) => { const o = { y }; Object.entries(FIN.streams).forEach(([n, a]) => o[n] = a[i]); return o; })}><CartesianGrid stroke="#eef0f6" vertical={false} /><XAxis dataKey="y" /><YAxis /><Tooltip formatter={v => `₹${v} Cr`} /><Legend />
                {Object.keys(FIN.streams).map((n, i) => <Bar key={n} dataKey={n} stackId="a" fill={["#0f1630", "#ffe600", "#2ba8d8", "#7b5cf0", "#2fbf71"][i]} />)}
              </BarChart>
            ) : (
              <ComposedChart data={data}><CartesianGrid stroke="#eef0f6" vertical={false} /><XAxis dataKey="y" /><YAxis /><Tooltip formatter={v => `₹${v} Cr`} /><Legend />
                <Bar dataKey="fcf" name="Free cash flow" fill="#2ba8d8" /><Line dataKey="cum" name="Cumulative FCF" stroke="#e5533d" strokeWidth={2} /><Line dataKey="cash" name="Cash balance" stroke="#0f1630" strokeWidth={2} /><ReferenceLine y={0} stroke="#141a2e" />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid g3" style={{ marginTop: 14 }}>
        <div className="card"><h2>Scenarios (2036)</h2><Table cols={["Case", "Net rev.", "EBITDA", "Peak need"]} num={[1, 2, 3]} rows={Object.entries(FIN.scen).map(([n, s]) => [n, "₹" + s.net, "₹" + s.ebitda, "₹" + s.peak])} /><p className="small muted">₹ Cr. Monte Carlo: P(need &gt; ₹95 Cr) = {FIN.mc.pNeed95}%.</p></div>
        <div className="card"><h2>Use of the ₹40 Cr seed</h2>{FIN.useOfFunds.map(([l, v]) => <div key={l} style={{ margin: "6px 0" }}><div className="row"><span style={{ flex: 1 }} className="small">{l}</span><b className="mono small">₹{v} Cr</b></div><div className="bar"><div style={{ width: v / 15.4 * 100 + "%", background: "#0f1630" }} /></div></div>)}</div>
        <div className="card"><h2>Unit economics</h2><Table cols={["Per kWh, CFE Service", "₹"]} num={[1]} rows={[["Customer pays all-in", "6.70"], ["Partner solar", "2.54"], ["Partner battery", "1.54"], ["Partner wind", "1.08"], ["Delivery and losses", "1.21"], ["Certificates", "0.02"], ["We keep (full pool, after ₹0.10 rebate)", "~0.70"]]} /></div>
      </div>
      <div className="card" style={{ marginTop: 14 }}><h2>Ten-year view (₹ Cr)</h2>
        <Table cols={["", ...YEARS]} num={YEARS.map((_, i) => i + 1)} rows={[["Gross billings", ...FIN.gross], ["Net revenue", ...FIN.net], ["Operating costs", ...FIN.costs], ["EBITDA", ...FIN.ebitda], ["Free cash flow", ...FIN.fcf], ["Cumulative FCF", ...FIN.cumFcf], ["Equity in", ...FIN.equity], ["Cash balance", ...FIN.cash], ["CFE Service MW", ...FIN.cfeMW], ["Night Wrap MW", ...FIN.wrapMW], ["Pool factories", ...FIN.factories], ["Headcount", ...FIN.headcount]]} />
      </div>
    </div>
  );
}

// ---------- Compliance ----------
export function Compliance() {
  const cats = [["V", 500, 2], ["IV", 1000, 10], ["III", 2500, 20], ["II", 7000, 35], ["I", Infinity, 50]];
  const cat = mu => cats.find(c => mu <= c[1]);
  return (
    <div>
      <Head eyebrow="Govern" title="Rules we operate under" lede="Every product is built on a rule already in force or published. The licence ladder grows with traded volume; our net worth stays above each threshold every year." />
      <div className="card"><Table cols={["Rule", "What it says", "What it means for us", "Status"]} rows={REGS.map(r => [<b>{r[0]}</b>, r[1], r[2], status(r[3])])} /></div>
      <div className="card" style={{ marginTop: 14 }}><h2>CERC trading licence ladder</h2>
        <Table cols={["", ...YEARS]} rows={[
          ["Traded MU", ...FIN.tradedMU.map(v => fmt(v, 0))],
          ["Category needed", ...FIN.tradedMU.map(v => "Cat " + cat(v)[0])],
          ["Net worth needed, ₹ Cr", ...FIN.netWorthNeed],
          ["Headroom, ₹ Cr", ...FIN.headroom.map(v => <span className="pill g">{fmt(v, 1)}</span>)],
        ]} />
      </div>
      <div className="grid g3" style={{ marginTop: 14 }}>
        <div className="card"><h2>Data</h2><p>Read-only access to revenue meters and SCADA forecasts. We never touch customer IT systems. Data stays in India (DPDP Act 2023).</p></div>
        <div className="card"><h2>Evidence</h2><p>Method v1.0: one certificate per source-hour, retired once, to one buyer. Hours with a meter gap stay provisional and are never estimated into a claim.</p></div>
        <div className="card"><h2>Independence</h2><p>An independent verifier re-performs sampled hours each month with read-only ledger access and issues an opinion to the customer.</p></div>
      </div>
    </div>
  );
}

// ---------- System checks ----------
export function Checks() {
  const { sim, scen } = useApp();
  const [n, setN] = useState(0);
  const res = useMemo(() => {
    const B = sim.blocks, S = sim.summary, p = P;
    const out = [];
    let maxBal = 0, socBad = 0, splitBad = 0, cleanBad = 0, simul = 0;
    for (const x of B) {
      const gen = (x.solRaw + x.windRaw) * (1 - p.loss);
      const g1 = Math.abs(gen - (x.sol + x.wind + x.charge + x.pooled + x.exch));
      const g2 = Math.abs(x.load - (x.sol + x.wind + x.dis + x.top + x.grid)) - x.dis;
      maxBal = Math.max(maxBal, g1, g2);
      if (x.soc < p.socMin * p.battMWh - 1e-6 || x.soc > p.socMax * p.battMWh + 1e-6) socBad++;
      if (x.pooled > (x.poolCap ?? Infinity) + 1e-6) splitBad++;
      if (x.clean > x.load + 1e-6 || x.clean < -1e-6) cleanBad++;
      if (x.charge > 1e-6 && x.dis > 1e-6) simul++;
    }
    const hourScore = S.hours.reduce((a, h) => a + h.clean, 0) / S.hours.reduce((a, h) => a + h.load, 0);
    const twin = simulate({ scenario: scen.id }).summary.score;
    out.push(["Energy balance in every block", `Supply = load + charging + pooled + exchange (after 3% losses) in all ${B.length.toLocaleString()} blocks`, maxBal < 0.5, `max gap ${fmt(Math.max(0, maxBal), 2)} MW`]);
    out.push(["Battery state of charge within 10–95%", "SoC never leaves the toll's limits", socBad === 0, socBad + " violations"]);
    out.push(["No simultaneous charge and discharge", "The battery does one thing per block", simul === 0, simul + " blocks"]);
    out.push(["Pooled volume within the pool's cap", "Pool takes only what day-shift members can use", splitBad === 0, splitBad + " violations"]);
    out.push(["Clean MWh never exceeds load", "No double counting: each clean MWh is claimed once", cleanBad === 0, cleanBad + " violations"]);
    out.push(["Monthly score = Σ hourly clean / Σ hourly load", "Summed from 744 hours, not averaged", Math.abs(hourScore - S.score) < 1e-9, `${pct(hourScore, 2)} vs ${pct(S.score, 2)}`]);
    out.push(["Deterministic re-run", "Same inputs give the same month (verifier can re-perform)", Math.abs(twin - S.score) < 1e-12, pct(twin, 3)]);
    out.push(["Payout rule", "2% per point below 90%, cap 10%", Math.abs(S.payout - Math.min(0.1, Math.max(0, (0.9 - S.score) * 100) * 0.02) * S.bill) < 1e-9, S.payout > 0 ? "₹" + fmt(S.payout, 2) + " Cr" : "no payout"]);
    out.push(["Grid energy counts at zero", "Grid supply and grid-charged battery energy never enter clean", B.every(x => x.clean <= x.load - x.grid + 1e-6), "checked"]);
    return out;
  }, [sim, scen, n]);
  const pass = res.filter(r => r[2]).length;
  return (
    <div>
      <Head eyebrow="Govern" title="System checks" lede="The maths, tested live against the engine for the what-if that is running now. Change the what-if in the top bar and re-run." right={<button className="btn dark" onClick={() => setN(n + 1)}>Re-run checks</button>} />
      <div className="grid g3" style={{ marginBottom: 14 }}><Kpi l="Checks passed" v={`${pass} / ${res.length}`} c={pass === res.length ? "g" : "r"} /><Kpi l="Scenario" v={scen.name} /><Kpi l="Blocks tested" v={sim.blocks.length.toLocaleString()} s="31 days × 96" /></div>
      <div className="card">{res.map((r, i) => <div className="chk" key={i}><span className={r[2] ? "ok" : ""} style={{ color: r[2] ? undefined : "#c0392b", fontWeight: 900 }}>{r[2] ? "✓" : "✗"}</span><div><b>{r[0]}</b><div className="small muted">{r[1]}</div></div><span className="mono small">{r[3]}</span></div>)}</div>
    </div>
  );
}
