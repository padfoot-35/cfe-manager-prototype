import React, { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, Line, ComposedChart, BarChart, Bar, Cell, LineChart, CartesianGrid } from "recharts";
import { useApp, Head, Kpi, Table, Scenario, COL, Barcode, fmt, pct } from "./ui.jsx";
import { P, simulate } from "./engine.js";
import { FACTORIES, SEQUENCE } from "./data.js";

const hhmm = b => `${String(Math.floor(b / 4)).padStart(2, "0")}:${String((b % 4) * 15).padStart(2, "0")}`;

export function DayControls() {
  const { day, setDay, blk, setBlk, running, setRunning } = useApp();
  return (
    <div className="row card" style={{ padding: "8px 12px", marginBottom: 14 }}>
      <button className="btn sm" onClick={() => setDay(Math.max(1, day - 1))}>‹</button>
      <b style={{ minWidth: 92, textAlign: "center" }}>{day} Oct 2030</b>
      <button className="btn sm" onClick={() => setDay(Math.min(31, day + 1))}>›</button>
      <span className="muted small" style={{ marginLeft: 10 }}>Time</span>
      <input type="range" min="0" max="95" value={blk} onChange={e => setBlk(+e.target.value)} style={{ flex: 1, minWidth: 160 }} aria-label="Time of day" />
      <b className="mono">{hhmm(blk)}</b>
      <button className="btn sm" onClick={() => setRunning(!running)}>{running ? "❚❚ Pause" : "▶ Run day"}</button>
    </div>
  );
}

function useDay() {
  const { sim, day } = useApp();
  return useMemo(() => sim.blocks.filter(b => b.day === day), [sim, day]);
}

function dayChartData(D) {
  return D.map(b => ({ t: hhmm(b.b), Solar: +b.sol.toFixed(1), Wind: +b.wind.toFixed(1), Battery: +b.dis.toFixed(1), "Green top-up": +b.top.toFixed(1), Grid: +b.grid.toFixed(1), Demand: +b.load.toFixed(1), "To factory pool": +b.pooled.toFixed(1), "To exchange": +b.exch.toFixed(1), Charging: +b.charge.toFixed(1) }));
}

function FlowDiagram({ x }) {
  const n = (v) => fmt(v, 0);
  const box = (X, Y, w, h, title, sub, val, col) => (
    <g>
      <rect x={X} y={Y} width={w} height={h} rx="8" fill="#fff" stroke="#dfe2ea" />
      <rect x={X} y={Y} width="5" height={h} rx="2" fill={col} />
      <text x={X + 14} y={Y + 18} fontSize="12.5" fontWeight="700">{title}</text>
      <text x={X + 14} y={Y + 33} fontSize="10.5" fill="#5d6478">{sub}</text>
      {val != null && <text x={X + w - 10} y={Y + 18} fontSize="12" fontWeight="700" textAnchor="end" fontFamily="monospace">{val}</text>}
    </g>
  );
  const link = (x1, y1, x2, y2, v, col) => v > 0.5 ? <path d={`M${x1},${y1} C${(x1 + x2) / 2},${y1} ${(x1 + x2) / 2},${y2} ${x2},${y2}`} stroke={col} strokeWidth={Math.max(2, v / 8)} fill="none" opacity=".75" strokeDasharray="6 4"><animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite" /></path> : null;
  return (
    <svg viewBox="0 0 640 330" className="flow">
      {box(10, 10, 170, 44, "Partner solar", "SOL-GJ-01 · 380 MWac", n(x.solRaw), COL.sol)}
      {box(10, 70, 170, 44, "Partner wind", "WND-GJ-02 · 110 MW", n(x.windRaw), COL.wind)}
      {box(10, 130, 170, 44, "Partner battery", `SoC ${pct(x.soc / P.battMWh, 0)} · ${x.dis > 0 ? "discharging" : x.charge > 0 ? "charging" : "idle"}`, x.dis > 0 ? n(x.dis) : x.charge > 0 ? "−" + n(x.charge) : "0", COL.dis)}
      {box(10, 190, 170, 44, "Green top-up", "G-DAM via trading member", n(x.top), COL.top)}
      {box(10, 250, 170, 44, "DISCOM grid", "residual · counts at zero", n(x.grid), COL.grid)}
      {box(250, 120, 130, 60, "CFE engine", "every 15 minutes", null, "#ffe600")}
      {box(450, 80, 180, 70, "Colocation A", "Navi Mumbai · demand", n(x.load) + " MW", COL.load)}
      <text x="464" y="140" fontSize="11" fill="#1f9d63" fontWeight="700">{pct(x.clean / x.load, 0)} clean this block</text>
      {box(450, 180, 180, 44, "Factory pool", "8 day-shift factories · ₹3.00", n(x.pooled), COL.pooled)}
      {box(450, 240, 180, 44, "Exchange sale", "unpooled surplus · ₹1.50", n(x.exch), COL.exch)}
      {link(180, 32, 250, 135, x.sol + x.charge * (x.solRaw / Math.max(1, x.solRaw + x.windRaw)) + x.pooled, COL.sol)}
      {link(180, 92, 250, 145, x.wind, COL.wind)}
      {link(180, 152, 250, 150, x.dis, COL.dis)}
      {link(180, 212, 250, 160, x.top, COL.top)}
      {link(180, 272, 250, 170, x.grid, COL.grid)}
      {link(380, 140, 450, 115, x.load, "#141a2e")}
      {link(380, 160, 450, 200, x.pooled, COL.pooled)}
      {link(380, 170, 450, 262, x.exch, COL.exch)}
    </svg>
  );
}

export function Control() {
  const { sim, day, blk, setPage, scen } = useApp();
  const D = useDay();
  const x = D[blk];
  const hourB = D.slice(Math.floor(blk / 4) * 4, Math.floor(blk / 4) * 4 + 4);
  const hourScore = hourB.reduce((a, b) => a + b.clean, 0) / hourB.reduce((a, b) => a + b.load, 0);
  const upto = sim.blocks.filter(b => b.day < day || (b.day === day && b.b <= blk));
  const mtd = upto.reduce((a, b) => a + b.clean, 0) / upto.reduce((a, b) => a + b.load, 0);
  const s = sim.summary;
  const data = dayChartData(D);
  const dayH = []; for (let k = 0; k < 96; k += 4) { const q = D.slice(k, k + 4); dayH.push(q.reduce((a, b) => a + b.clean, 0) / q.reduce((a, b) => a + b.load, 0)); }
  const below = dayH.map((v, i) => [i, v]).filter(([, v]) => v < 0.9);
  const next = [1, 2, 3].map(k => { const i = Math.floor(blk / 4) + k; if (i > 23) return null; const q = D.slice(i * 4, i * 4 + 4); const l = q.reduce((a, b) => a + b.load, 0) / 4, c = q.reduce((a, b) => a + b.clean, 0) / 4; return [String(i).padStart(2, "0") + ":00", fmt(l, 0), fmt(c, 0), fmt(l - c, 0), pct(c / l, 0)]; }).filter(Boolean);
  return (
    <div>
      <Head eyebrow="Operations console · Operate" title="Control room" lede="Colocation A · Navi Mumbai campus · 100 MW · CFE90 contract. Partners own every asset; the engine dispatches them every 15 minutes." />
      <Scenario />
      <DayControls />
      <div className="note">CFE90 means 90% of the month's consumption is matched with clean supply in the same hour. It does not mean 90% clean in every hour.</div>
      <div className="grid g6" style={{ marginBottom: 14 }}>
        <Kpi l="Demand now" v={fmt(x.load, 0) + " MW"} s={hhmm(x.b) + " block"} />
        <Kpi l="Clean now" v={pct(x.clean / x.load, 0)} s={`${fmt(x.clean, 0)} of ${fmt(x.load, 0)} MW`} c="g" />
        <Kpi l="This hour" v={pct(hourScore, 0)} s="hourly match" />
        <Kpi l="Month to date" v={pct(mtd)} s="operational estimate" c="y" />
        <Kpi l="Battery" v={pct(x.soc / P.battMWh, 0)} s={fmt(x.soc, 0) + " MWh stored"} />
        <Kpi l="Forecast month" v={pct(s.score)} s={s.score >= 0.9 ? "no guarantee exposure" : `payout ₹${fmt(s.payout, 2)} Cr`} c={s.score >= 0.9 ? "g" : "r"} />
      </div>
      <div className="grid g2">
        <div className="card">
          <div className="row"><h2 style={{ flex: 1 }}>Live flows · MW</h2><button className="btn sm" onClick={() => setPage("block")}>Explain this block →</button></div>
          <FlowDiagram x={x} />
        </div>
        <div className="card">
          <div className="row"><h2 style={{ flex: 1 }}>Demand vs supply · {day} Oct</h2><button className="btn sm" onClick={() => setPage("analytics")}>Detailed charts →</button></div>
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={data}>
              <XAxis dataKey="t" interval={15} fontSize={11} /><YAxis fontSize={11} />
              <Tooltip />
              {["Solar", "Wind", "Battery", "Green top-up", "Grid"].map((k, i) => <Area key={k} stackId="a" dataKey={k} fill={[COL.sol, COL.wind, COL.dis, COL.top, COL.grid][i]} stroke="none" fillOpacity={.9} isAnimationActive={false} />)}
              <Line dataKey="Demand" stroke="#141a2e" dot={false} strokeWidth={1.5} isAnimationActive={false} />
              <ReferenceLine x={hhmm(blk)} stroke="#e5533d" />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="small muted"><span className="sw" style={{ background: COL.sol }} />Solar <span className="sw" style={{ background: COL.wind }} />Wind <span className="sw" style={{ background: COL.dis }} />Battery <span className="sw" style={{ background: COL.top }} />Green top-up <span className="sw" style={{ background: COL.grid }} />Grid at zero</div>
        </div>
      </div>
      <div className="grid g3" style={{ marginTop: 14 }}>
        <div className="card"><h2>Next hours · plan</h2><Table cols={["Hour", "Demand MWh", "Clean", "Grid", "CFE"]} rows={next} num={[1, 2, 3, 4]} /></div>
        <div className="card"><h2>Coordination feed</h2>
          {SEQUENCE.slice(5, 11).map((r, i) => <div key={i} className="small" style={{ padding: "5px 0", borderBottom: "1px solid var(--line)" }}><span className="mono muted">{r[0]}</span> · <b>{r[1]} → {r[2]}</b><br />{r[3]}</div>)}
        </div>
        <div className="card"><h2>Alerts</h2>
          {below.length === 0 ? <div className="pill g">No hour below 90% today</div> : <>
            <div className="note red" style={{ marginBottom: 8 }}><b>{below.length} hours below 90% today.</b> Lowest: {String(below.reduce((m, v) => v[1] < m[1] ? v : m)[0]).padStart(2, "0")}:00 at {pct(below.reduce((m, v) => v[1] < m[1] ? v : m)[1], 0)}.</div>
            <p className="small muted">Uncovered demand stays on normal grid supply and counts at zero. The monthly score is what the guarantee is measured on.</p></>}
          <Barcode hours={dayH} highlight={Math.floor(blk / 4)} />
          <div className="small muted" style={{ marginTop: 6 }}>Today, hour by hour: {dayH.filter(v => v >= 0.9).length} of 24 hours at 90% or better.</div>
        </div>
      </div>
    </div>
  );
}

export function Block() {
  const { blk, setBlk } = useApp();
  const D = useDay();
  const x = D[blk];
  const [step, setStep] = useState(6);
  const [auto, setAuto] = useState(false);
  useEffect(() => { setStep(6); }, [blk]);
  useEffect(() => { if (!auto) return; const t = setInterval(() => setBlk(b => (b + 1) % 96), 700); return () => clearInterval(t); }, [auto]);
  const order = [["Solar, direct", x.sol, COL.sol], ["Wind, direct", x.wind, COL.wind], ["Battery discharge", x.dis, COL.dis], ["Green top-up (exchange)", x.top, COL.top], ["Grid (counts at zero)", x.grid, COL.grid]];
  const surplus = [["Battery charging", x.charge, COL.charge], ["Factory pool at ₹3.00", x.pooled, COL.pooled], ["Exchange at ₹1.50", x.exch, COL.exch]];
  let acc = 0;
  const play = () => { setStep(0); let k = 0; const t = setInterval(() => { k++; setStep(k); if (k >= 6) clearInterval(t); }, 550); };
  return (
    <div>
      <Head eyebrow="Operations console · Operate" title="How one 15-minute block is filled" lede="96 blocks a day. In each block the engine fills demand in a fixed merit order (clean first, grid last) and sends any midday surplus to the battery, then the factory pool, then the exchange." />
      <Scenario />
      <DayControls />
      <div className="row" style={{ marginBottom: 14 }}>
        <button className="btn dark" onClick={play}>▶ Play this block</button>
        <button className="btn" onClick={() => setAuto(!auto)}>{auto ? "❚❚ Stop" : "▶▶ Run block after block"}</button>
        <button className="btn" onClick={() => setBlk(Math.max(0, blk - 1))}>◀ Previous</button>
        <button className="btn" onClick={() => setBlk(Math.min(95, blk + 1))}>Next ▶</button>
      </div>
      <div className="grid g2">
        <div className="card">
          <h2>The demand bucket · {hhmm(blk)}–{hhmm(blk + 1)}</h2>
          <div style={{ display: "flex", flexDirection: "column-reverse", height: 260, border: "2px solid #141a2e", borderRadius: 8, overflow: "hidden", width: 170, margin: "8px auto" }}>
            {order.map(([n, v, c], i) => <div key={n} title={n} style={{ height: (i < step ? v / x.load * 100 : 0) + "%", background: c, transition: "height .45s" }} />)}
          </div>
          <div className="mono" style={{ textAlign: "center" }}>{fmt(x.load, 1)} MW demand · {pct(x.clean / x.load, 0)} clean</div>
        </div>
        <div className="card">
          <h2>Merit order · who supplies, in order</h2>
          {order.map(([n, v, c], i) => { acc += v; return (
            <div key={n} className="row" style={{ padding: "8px 0", borderBottom: "1px solid var(--line)", opacity: i < step ? 1 : .35 }}>
              <span className="pill" style={{ background: c, color: "#111", minWidth: 24 }}>{i + 1}</span>
              <span style={{ flex: 1 }}>{n}</span><b className="mono">{fmt(v, 1)} MW</b>
            </div>); })}
          <h3 style={{ marginTop: 14 }}>Where the surplus goes</h3>
          {surplus.map(([n, v, c], i) => (
            <div key={n} className="row" style={{ padding: "6px 0", borderBottom: "1px solid var(--line)", opacity: step >= 5 ? 1 : .35 }}>
              <span className="sw" style={{ background: c }} /><span style={{ flex: 1 }}>{n}</span><b className="mono">{fmt(v, 1)} MW</b>
            </div>))}
          <p className="small muted">Pooling is capped at 70% of the surplus and at the factories' day-shift demand (08:00–18:00, not Sundays).</p>
        </div>
      </div>
      <div className="card" style={{ marginTop: 14 }}>
        <h2>The whole day · click any block</h2>
        <div className="blocks96">{D.map(b => <div key={b.b} onClick={() => setBlk(b.b)} title={hhmm(b.b) + " · " + pct(b.clean / b.load, 0)} style={{ background: b.clean / b.load >= 0.9 ? "#2fbf71" : b.clean / b.load >= 0.5 ? "#f5b800" : "#8a4552", outline: b.b === blk ? "2px solid #141a2e" : "none" }} />)}</div>
        <div className="row small muted" style={{ justifyContent: "space-between" }}><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div>
      </div>
    </div>
  );
}

export function Pool() {
  const { sim, day, scen } = useApp();
  const D = useDay();
  const [extra, setExtra] = useState(0);
  const s = sim.summary;
  const withMore = useMemo(() => extra ? simulate({ scenario: scen.id, params: { factories: P.factories + extra } }).summary : s, [extra, scen.id, s]);
  const total = FACTORIES.reduce((a, f) => a + f.mw, 0);
  const dayPooled = D.reduce((a, b) => a + b.pooled, 0) / 4;
  const rows = FACTORIES.map(f => {
    const share = f.mw / total, mtd = s.pooled * share;
    return [f.name, f.city + ", " + f.state, fmt(f.mw, 1), fmt(dayPooled * share, 1), fmt(mtd, 0), "₹" + fmt(mtd * 1000 * P.factorySaving / 1e5, 1) + " lakh", "₹" + fmt(mtd * 1000 * P.factorySaving * P.factoryFeeShare / 1e5, 1) + " lakh", fmt(f.equity, 1) + "% / " + fmt(f.use, 1) + "%", <span className="pill g">Pass</span>];
  });
  const data = D.map(b => ({ t: hhmm(b.b), "To factory pool": +b.pooled.toFixed(1), "To exchange": +b.exch.toFixed(1), "Factory demand cap": +b.poolCap.toFixed(1) }));
  return (
    <div>
      <Head eyebrow="Operations console · Operate · network effect" title="Pool manager" lede="A portfolio sized for nights makes a midday surplus. Day-shift factories buy it at ₹3.00/kWh (landed ~₹4.1 vs a ₹5.6–6.8 solar-hour HT tariff). Pooling is upside: a full pool lifts our margin from ₹0.46 to ₹0.70/kWh after the ₹0.10 customer rebate." />
      <Scenario />
      <DayControls />
      <div className="grid g5" style={{ marginBottom: 14 }}>
        <Kpi l="Factories in this pool" v={scen.id === "factoryleaves" ? "6" : "8"} s="Gujarat pool · ~8 per 100 MW" />
        <Kpi l="Pooled this month" v={fmt(s.pooled, 0) + " MWh"} s={pct(s.pooled / Math.max(1, s.pooled + s.exch), 0) + " of surplus"} c="y" />
        <Kpi l="Sold to exchange" v={fmt(s.exch, 0) + " MWh"} s="at ₹1.50/kWh" />
        <Kpi l="Factory savings" v={"₹" + fmt(s.pooled * 1000 * P.factorySaving / 1e7, 2) + " Cr"} s="₹2.0/kWh vs HT tariff" c="g" />
        <Kpi l="Our factory fees" v={"₹" + fmt(s.factoryFees, 2) + " Cr"} s="10% of their saving" />
      </div>
      <div className="grid g21">
        <div className="card">
          <h2>Surplus allocation · {day} Oct</h2>
          <ResponsiveContainer width="100%" height={230}>
            <ComposedChart data={data}><XAxis dataKey="t" interval={15} fontSize={11} /><YAxis fontSize={11} /><Tooltip />
              <Area stackId="a" dataKey="To factory pool" fill={COL.pooled} stroke="none" isAnimationActive={false} />
              <Area stackId="a" dataKey="To exchange" fill={COL.exch} stroke="none" isAnimationActive={false} />
              <Line dataKey="Factory demand cap" stroke="#141a2e" strokeDasharray="4 3" dot={false} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h2>Add factories (what-if)</h2>
          <input type="range" min="0" max="6" value={extra} onChange={e => setExtra(+e.target.value)} aria-label="Extra factories" />
          <div className="mono">+{extra} factories → {P.factories + extra} in the pool</div>
          <Table cols={["", "Now", "With more"]} num={[1, 2]} rows={[
            ["Pooled MWh / month", fmt(s.pooled, 0), fmt(withMore.pooled, 0)],
            ["Margin per kWh", "₹" + fmt(s.marginPerKWh, 2), "₹" + fmt(withMore.marginPerKWh, 2)],
            ["Monthly margin", "₹" + fmt(s.margin, 2) + " Cr", "₹" + fmt(withMore.margin, 2) + " Cr"],
          ]} />
          <p className="small muted">The extra margin can be shared with every member as a lower price: the network effect behind the platform.</p>
        </div>
      </div>
      <div className="card" style={{ marginTop: 14 }}>
        <h2>Members and captive compliance</h2>
        <Table cols={["Factory", "Location", "MW", "Today MWh", "Month MWh", "Their saving", "Our fee", "Equity / use", "26% / 51% test"]} num={[2, 3, 4]} rows={rows} />
        <p className="small muted">Electricity (Amendment) Rules 2026 test 26% ownership and 51% use across the group and cap each member at its ownership share, so each factory's equity is sized to its use.</p>
      </div>
    </div>
  );
}

export function Orchestration() {
  return (
    <div>
      <Head eyebrow="Operations console · Operate" title="A normal day of coordination" lede="From day-ahead forecasts to certificates retired to the buyer: who sends what to whom, and when. The exchange, SLDCs and regulators do not log in; we coordinate through statutory channels and the trading member." />
      <div className="grid g21">
        <div className="card"><h2>Coordination sequence</h2><Table cols={["When", "From", "To", "Message"]} rows={SEQUENCE} /></div>
        <div className="card"><h2>Dispatch merit order</h2>
          {[["1", "Partner solar, direct to load", COL.sol], ["2", "Partner wind, direct to load", COL.wind], ["3", "Battery discharge (clean-charged only)", COL.dis], ["4", "Green top-up from G-DAM (cap 20 MW)", COL.top], ["5", "Grid, counts at zero", COL.grid]].map(r => <div key={r[0]} className="row" style={{ padding: "7px 0", borderBottom: "1px solid var(--line)" }}><span className="pill" style={{ background: r[2] }}>{r[0]}</span>{r[1]}</div>)}
          <h3 style={{ marginTop: 14 }}>Surplus order</h3>
          {[["1", "Charge the battery", COL.charge], ["2", "Factory pool (≤70%, day shift)", COL.pooled], ["3", "Exchange at ₹1.50", COL.exch]].map(r => <div key={r[0]} className="row" style={{ padding: "7px 0", borderBottom: "1px solid var(--line)" }}><span className="pill" style={{ background: r[2] }}>{r[0]}</span>{r[1]}</div>)}
        </div>
      </div>
    </div>
  );
}

export function Evidence() {
  const { sim, day, blk, setDay, setBlk, scen } = useApp();
  const hr = Math.floor(blk / 4);
  const q = sim.blocks.filter(b => b.day === day && Math.floor(b.b / 4) === hr);
  const S = k => q.reduce((a, b) => a + b[k], 0) / 4;
  const load = S("load"), clean = S("clean"), sol = S("sol"), wind = S("wind"), dis = S("dis"), top = S("top"), grid = S("grid");
  const solRaw = S("solRaw"), windRaw = S("windRaw");
  const s = sim.summary;
  const days = []; for (let d = 1; d <= 31; d++) { const hs = s.hours.filter(h => h.day === d); days.push(hs); }
  const steps = [["Generated", fmt(solRaw + windRaw, 1) + " MWh", "partner meters"], ["Delivered after losses", fmt((solRaw + windRaw) * (1 - P.loss), 1) + " MWh", "3% losses"], ["Stored or discharged", fmt(dis, 1) + " MWh out", scen.id === "gridcharge" ? "charge source tracked" : "clean-charged only"], ["Matched to campus", fmt(clean, 1) + " MWh", "of " + fmt(load, 1) + " MWh load"], ["Certificates issued", "per source", "issuer, D+1"], ["Independently reviewed", "pending", "month-end sample"]];
  return (
    <div>
      <Head eyebrow="Operations console · Operate" title={`Tracing ${String(hr).padStart(2, "0")}:00–${String(hr + 1).padStart(2, "0")}:00 on ${day} Oct`} lede="Follow one hour from partner generation to an independently reviewed, retired certificate. Click any hour in the month grid to trace it." right={<div className="kpi g"><div className="l">Eligible clean share</div><div className="v">{pct(clean / load)}</div></div>} />
      <Scenario />
      <div className="grid g6" style={{ marginBottom: 14 }}>{steps.map((st, i) => <div key={i} className="kpi"><div className="l">Step {i + 1}</div><b>{st[0]}</b><div className="v" style={{ fontSize: 17 }}>{st[1]}</div><div className="s">{st[2]}</div></div>)}</div>
      {scen.id === "gridcharge" && <div className="note red"><b>Charge-source tracking.</b> Part of the battery's energy came from the grid at night, so that share counts at zero. A naive dashboard would have counted it as clean.</div>}
      <div className="grid g3">
        <div className="card"><h2>Physical ledger · MWh</h2><Table num={[1]} cols={["What flowed", "MWh"]} rows={[["Solar to load", fmt(sol, 1)], ["Wind to load", fmt(wind, 1)], ["Battery discharged", fmt(dis, 1)], ["Green top-up", fmt(top, 1)], ["Grid residual", fmt(grid, 1)], ["Campus load", fmt(load, 1)]]} /></div>
        <div className="card"><h2>Settlement ledger · who bills whom</h2><Table cols={["Line", "Basis"]} rows={[["Solar PPA", "SOL-GJ-01 · pass-through"], ["Wind PPA", "WND-GJ-02 · pass-through"], ["Battery toll", "BES-GJ-01 · availability"], ["Top-up", "G-DAM confirmation"], ["Customer bill", "₹6.50/kWh energy + platform fee (₹6.70 all-in) − ₹0.10 pool rebate"]]} /></div>
        <div className="card"><h2>Attribute ledger · what can be claimed</h2><Table num={[1]} cols={["Source", "MWh"]} rows={[["Solar, retired", fmt(sol, 1)], ["Wind, retired", fmt(wind, 1)], ["Stored solar/wind", fmt(dis * (scen.id === "gridcharge" ? 0.7 : 1), 1)], ["Green top-up", fmt(top, 1)], ["Grid (0)", "0.0"], [<b>Matched / load</b>, <b>{fmt(clean, 1)} / {fmt(load, 1)}</b>]]} /></div>
      </div>
      <div className="card" style={{ marginTop: 14 }}>
        <div className="row"><h2 style={{ flex: 1 }}>Every hour of October · click to trace</h2><a className="btn yel" href="https://padfoot-35.github.io/cfe-certificate/" target="_blank" rel="noreferrer">Open a sample hourly certificate ↗</a></div>
        <div style={{ display: "grid", gridTemplateColumns: "40px repeat(24, 1fr)", gap: 2, fontSize: 10 }}>
          {days.map((hs, d) => <React.Fragment key={d}><div className="mono muted">{d + 1}</div>{hs.map(h => <div key={h.hour} onClick={() => { setDay(d + 1); setBlk(h.hour * 4); }} title={`${d + 1} Oct ${h.hour}:00 · ${pct(h.score, 0)}`} style={{ height: 11, borderRadius: 2, cursor: "pointer", background: h.score >= 0.9 ? "#2fbf71" : h.score >= 0.5 ? "#f5b800" : "#8a4552", outline: d + 1 === day && h.hour === hr ? "2px solid #141a2e" : "none" }} />)}</React.Fragment>)}
        </div>
        <div className="row small muted" style={{ marginTop: 8 }}><span className="sw" style={{ background: "#2fbf71" }} />≥90% <span className="sw" style={{ background: "#f5b800" }} />50–90% <span className="sw" style={{ background: "#8a4552" }} />below 50% · Month score {pct(s.score)}</div>
      </div>
    </div>
  );
}

export function Analytics() {
  const { sim } = useApp();
  const s = sim.summary;
  const D = useDay();
  const daily = []; for (let d = 1; d <= 31; d++) { const hs = s.hours.filter(h => h.day === d); const l = hs.reduce((a, h) => a + h.load, 0), c = hs.reduce((a, h) => a + h.clean, 0); daily.push({ d: String(d), score: +(c / l * 100).toFixed(1) }); }
  const byHour = []; for (let h = 0; h < 24; h++) { const hs = s.hours.filter(x => x.hour === h); byHour.push({ h: String(h).padStart(2, "0"), score: +(hs.reduce((a, x) => a + x.clean, 0) / hs.reduce((a, x) => a + x.load, 0) * 100).toFixed(1) }); }
  const mix = [["Solar", sim.blocks.reduce((a, b) => a + b.sol, 0) / 4, COL.sol], ["Wind", sim.blocks.reduce((a, b) => a + b.wind, 0) / 4, COL.wind], ["Battery", s.dis, COL.dis], ["Green top-up", s.top, COL.top], ["Grid", s.grid, COL.grid]];
  return (
    <div>
      <Head eyebrow="Operations console · Operate" title="Analytics" lede="The month at a glance: where the score comes from and when it is weakest." />
      <Scenario />
      <div className="grid g4" style={{ marginBottom: 14 }}>
        <Kpi l="October score" v={pct(s.score)} s={s.score >= 0.9 ? "meets CFE90" : "below CFE90"} c={s.score >= 0.9 ? "g" : "r"} />
        <Kpi l="Hours below 90%" v={s.below} s="of 744" />
        <Kpi l="Clean MWh" v={fmt(s.clean, 0)} s={"of " + fmt(s.load, 0) + " MWh"} />
        <Kpi l="CO₂ avoided" v={fmt(s.co2, 0) + " t"} s="0.71 t/MWh residual mix" />
      </div>
      <div className="grid g2">
        <div className="card"><h2>Supply mix · October</h2>{mix.map(([n, v, c]) => <div key={n} style={{ marginBottom: 8 }}><div className="row small"><span style={{ flex: 1 }}>{n}</span><b className="mono">{fmt(v, 0)} MWh · {pct(v / s.load, 0)}</b></div><div className="bar"><div style={{ width: v / s.load * 100 + "%", background: c }} /></div></div>)}</div>
        <div className="card"><h2>Daily score · October</h2><ResponsiveContainer width="100%" height={200}><BarChart data={daily}><XAxis dataKey="d" fontSize={10} /><YAxis domain={[50, 100]} fontSize={11} /><Tooltip /><ReferenceLine y={90} stroke="#e5533d" strokeDasharray="4 3" /><Bar dataKey="score" isAnimationActive={false}>{daily.map((x, i) => <Cell key={i} fill={x.score >= 90 ? "#2fbf71" : "#f5b800"} />)}</Bar></BarChart></ResponsiveContainer></div>
        <div className="card"><h2>When the month is weakest · score by hour of day</h2><ResponsiveContainer width="100%" height={200}><BarChart data={byHour}><XAxis dataKey="h" fontSize={10} /><YAxis domain={[0, 100]} fontSize={11} /><Tooltip /><ReferenceLine y={90} stroke="#e5533d" strokeDasharray="4 3" /><Bar dataKey="score" fill="#2ba8d8" isAnimationActive={false} /></BarChart></ResponsiveContainer></div>
        <div className="card"><h2>Battery charge level · today</h2><ResponsiveContainer width="100%" height={200}><LineChart data={D.map(b => ({ t: hhmm(b.b), "SoC %": +(b.soc / P.battMWh * 100).toFixed(0) }))}><XAxis dataKey="t" interval={15} fontSize={11} /><YAxis domain={[0, 100]} fontSize={11} /><Tooltip /><Line dataKey="SoC %" stroke="#7b5cf0" dot={false} isAnimationActive={false} /></LineChart></ResponsiveContainer></div>
      </div>
    </div>
  );
}
