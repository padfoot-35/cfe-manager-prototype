import React, { useMemo, useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, ReferenceLine } from "recharts";
import { useApp, Head, Kpi, Table, Scenario, fmt, pct } from "./ui.jsx";
import { P, simulate } from "./engine.js";
import { FIN, YEARS } from "./data.js";

const SC = { "Platform fee": "#ffe600", "Energy margin": "#ffb800", "Certificates": "#3cc8ff", "Night Wrap": "#7b8cff", "Ledger + factory": "#3cdc8c" };

function Ribbon({ x1, y1a, y1b, x2, y2a, y2b, fill, op = .45 }) {
  const m = (x1 + x2) / 2;
  return <path d={`M${x1},${y1a} C${m},${y1a} ${m},${y2a} ${x2},${y2a} L${x2},${y2b} C${m},${y2b} ${m},${y1b} ${x1},${y1b} Z`} fill={fill} opacity={op} />;
}

export function Money() {
  const [yi, setYi] = useState(9);
  const gross = FIN.gross[yi], net = FIN.net[yi], pass = gross - net;
  const per = v => v / gross * 100;
  const partners = [["Solar", 2.54], ["Batteries", 1.54], ["Grid delivery", 1.21], ["Wind", 1.08], ["Exchange top-up", 0.37]];
  const pt = partners.reduce((a, p) => a + p[1], 0);
  const streams = Object.entries(FIN.streams).map(([k, v]) => [k, v[yi]]).sort((a, b) => b[1] - a[1]);
  const H = 300, top = 30, X0 = 120, X1 = 360, X2 = 600, scale = H / 100;
  let ya = top, yb = top;
  const parts = [];
  partners.forEach(([n, c]) => { const v = per(pass) * c / pt; parts.push({ n, v, ya, yb }); ya += v * scale; yb += v * scale + 6; });
  const keptA = ya, keptB = yb + 8, keptV = per(net);
  let yz = top; const zH = H * 0.9; const zs = streams.map(([n, v]) => { const h = v / net * zH; const r = { n, v, y: yz, h }; yz += h; return r; });
  return (
    <div>
      <Head eyebrow="Platform economics" title="Follow the ₹100 we bill" lede="As principal we bill the full price (gross revenue under Ind AS 115) and pass most of it to the partners who own the assets. What we keep is net revenue, split across five streams. Move the year to watch the mix shift." />
      <div className="row card" style={{ marginBottom: 14 }}>
        <span className="muted small">Year</span>
        <input type="range" min="0" max="9" value={yi} onChange={e => setYi(+e.target.value)} style={{ flex: 1 }} aria-label="Year" />
        <b className="mono">{YEARS[yi]}</b>
      </div>
      <div className="grid g4" style={{ marginBottom: 14 }}>
        <Kpi l="Gross revenue" v={"₹" + fmt(gross, 0) + " Cr"} s="accounting top line" />
        <Kpi l="Passed to partners" v={"₹" + fmt(pass, 0) + " Cr"} s={fmt(per(pass), 1) + " of every ₹100"} />
        <Kpi l="Net revenue (kept)" v={"₹" + fmt(net, 1) + " Cr"} s={fmt(per(net), 1) + " of every ₹100"} c="y" />
        <Kpi l="Subscriptions" v={pct((FIN.streams["Platform fee"][yi] + FIN.streams["Night Wrap"][yi] + FIN.streams["Ledger + factory"][yi]) / net, 0)} s="platform fee, Night Wrap, Ledger, factory fees" />
      </div>
      <div className="card">
        <svg viewBox="0 0 900 380" className="flow">
          <rect x={X0} y={top} width="16" height={H} fill="#141a2e" rx="3" />
          <text x={X0 - 10} y={top + H / 2 - 6} textAnchor="end" fontSize="22" fontWeight="800" fontFamily="monospace">₹100</text>
          <text x={X0 - 10} y={top + H / 2 + 14} textAnchor="end" fontSize="12" fill="#5d6478">billed</text>
          {parts.map(p => <g key={p.n}>
            <Ribbon x1={X0 + 16} y1a={p.ya} y1b={p.ya + p.v * scale} x2={X1} y2a={p.yb} y2b={p.yb + p.v * scale} fill="#4a5170" />
            <rect x={X1} y={p.yb} width="14" height={Math.max(2, p.v * scale)} fill="#4a5170" />
            <text x={X1 + 22} y={p.yb + p.v * scale / 2 + 4} fontSize="12">{p.n} <tspan fontWeight="700" fontFamily="monospace">₹{fmt(p.v, 1)}</tspan></text>
          </g>)}
          <Ribbon x1={X0 + 16} y1a={keptA} y1b={keptA + keptV * scale} x2={X1} y2a={keptB} y2b={keptB + keptV * scale} fill="#ffe600" op={.7} />
          <rect x={X1} y={keptB} width="14" height={keptV * scale} fill="#ffe600" stroke="#b89a00" />
          <text x={X1 + 22} y={keptB + 10} fontSize="13" fontWeight="800">₹{fmt(keptV, 1)} kept</text>
          <path d={`M${X1 + 14},${keptB} L${X2},${top}`} stroke="#b89a00" strokeDasharray="5 4" fill="none" />
          <path d={`M${X1 + 14},${keptB + keptV * scale} L${X2},${top + zH}`} stroke="#b89a00" strokeDasharray="5 4" fill="none" />
          {zs.map(z => <g key={z.n}><rect x={X2} y={z.y} width="18" height={z.h} fill={SC[z.n]} /><text x={X2 + 28} y={z.y + z.h / 2 + 4} fontSize="12.5"><tspan fontWeight="700">{z.n}</tspan> <tspan fontFamily="monospace">₹{fmt(per(z.v), 2)} · ₹{fmt(z.v, 1)} Cr</tspan></text></g>)}
          <text x={X2} y={top - 10} fontSize="12" fill="#5d6478">zoomed: what we keep, by stream</text>
          <text x={X1} y={top - 10} fontSize="12" fill="#5d6478">partners own the assets</text>
        </svg>
        <p className="small muted">Source: team platform model v6 (PnL). Partner split of pass-through uses the 100 MW cost stack (solar 2.54, battery 1.54, delivery 1.21, wind 1.08, top-up 0.37 per kWh) and is an estimate.</p>
      </div>
      <div className="card" style={{ marginTop: 14 }}>
        <h2>Revenue mix, 2027–36 (₹ Cr kept)</h2>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={YEARS.map((y, i) => ({ y, ...Object.fromEntries(Object.entries(FIN.streams).map(([k, v]) => [k, v[i]])) }))}>
            <XAxis dataKey="y" fontSize={11} /><YAxis fontSize={11} /><Tooltip />
            {["Platform fee", "Energy margin", "Ledger + factory", "Certificates", "Night Wrap"].map(k => <Area key={k} stackId="a" dataKey={k} fill={SC[k]} stroke="none" fillOpacity={.9} />)}
            <ReferenceLine x={YEARS[yi]} stroke="#e5533d" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function Network() {
  const { scen } = useApp();
  const [n, setN] = useState(8);
  const curve = useMemo(() => [0, 2, 4, 6, 8, 10, 12].map(k => { const s = simulate({ scenario: scen.id === "poolblock" ? "normal" : scen.id, params: { factories: k } }).summary; return { k, margin: +s.marginPerKWh.toFixed(3), pooled: Math.round(s.pooled), netCost: +(P.cost.solar + P.cost.battery + P.cost.wind + P.cost.delivery + P.cost.cert + s.topCost * 1e7 / (s.load * 1000) - (s.pooled * P.poolPrice + s.exch * P.exchangePrice) * 1000 / (s.load * 1000)).toFixed(2) }; }), [scen.id]);
  const cur = simulate({ scenario: scen.id, params: { factories: n } }).summary;
  const netCost = P.cost.solar + P.cost.battery + P.cost.wind + P.cost.delivery + P.cost.cert + cur.topCost * 1e7 / (cur.load * 1000) - (cur.pooled * P.poolPrice + cur.exch * P.exchangePrice) * 1000 / (cur.load * 1000);
  const loop = [["More data centres", "₹0.30 below the ₹7.00 DIY cost"], ["More midday surplus", "~0.47 kWh per kWh of load here"], ["More factories join pools", "~8 factories per 100 MW, at ₹3.00 vs ₹1.50"], ["Lower cost per clean hour", "₹30 Cr a year per 100 MW (model)"], ["Lower price", "₹0.10/kWh rebate once a pool is 80% full"]];
  return (
    <div>
      <Head eyebrow="Platform economics" title="The network effect" lede="Our edge is pooling the midday surplus of several data centres in one state with daytime demand; it is upside on top of a core that already pays. Slide the number of factories in a 100 MW pool and watch the cost of each clean hour fall." />
      <Scenario />
      <div className="grid g12">
        <div className="card">
          <h2>Flywheel</h2>
          {loop.map(([a, b], i) => <div key={a} className="row" style={{ padding: "8px 0", borderBottom: "1px solid var(--line)" }}><span className="pill y">{i + 1}</span><div style={{ flex: 1 }}><b>{a}</b><div className="small muted">{b}</div></div><span className="muted">↓</span></div>)}
          <div className="note" style={{ marginTop: 10 }}>By 2036 the model has <b>50 factories in four state pools</b>, adding <b>₹167 Cr</b> to 2036 EBITDA. Without any pooling the core business still earns <b>₹186 Cr</b>, with no credit line.</div>
        </div>
        <div className="card">
          <div className="row"><h2 style={{ flex: 1 }}>Factories in this 100 MW pool: <span className="mono">{n}</span></h2></div>
          <input type="range" min="0" max="12" value={n} onChange={e => setN(+e.target.value)} aria-label="Factories in the pool" />
          <div className="grid g4" style={{ margin: "12px 0" }}>
            <Kpi l="Pooled per month" v={fmt(cur.pooled, 0) + " MWh"} c="y" />
            <Kpi l="Net cost per kWh" v={"₹" + fmt(netCost, 2)} s="partner costs − surplus credit" />
            <Kpi l="Our margin per kWh" v={"₹" + fmt(cur.marginPerKWh, 2)} s="incl. platform fee" c="g" />
            <Kpi l="Factory savings / month" v={"₹" + fmt(cur.pooled * 1000 * 2 / 1e7, 2) + " Cr"} s="₹2.0/kWh each" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={curve}><CartesianGrid stroke="#eef0f6" /><XAxis dataKey="k" fontSize={11} label={{ value: "factories in pool", position: "insideBottom", offset: -2, fontSize: 11 }} /><YAxis yAxisId="a" fontSize={11} /><YAxis yAxisId="b" orientation="right" fontSize={11} /><Tooltip />
              <Line yAxisId="a" dataKey="netCost" name="Net cost ₹/kWh" stroke="#e5533d" strokeWidth={2} />
              <Line yAxisId="a" dataKey="margin" name="Margin ₹/kWh" stroke="#1f9d63" strokeWidth={2} />
              <Line yAxisId="b" dataKey="pooled" name="Pooled MWh" stroke="#ff8a3d" strokeDasharray="4 3" />
              <ReferenceLine yAxisId="a" x={n} stroke="#141a2e" />
            </LineChart>
          </ResponsiveContainer>
          <p className="small muted">Each run re-simulates the month. Gains flatten once factories absorb the pool-eligible surplus (70% cap, day shift only).</p>
        </div>
      </div>
    </div>
  );
}

export function Unit() {
  const [batt, setBatt] = useState(0), [part, setPart] = useState(0), [pool, setPool] = useState(3.0), [fee, setFee] = useState(1.5), [ex, setEx] = useState(1.5);
  const c = P.cost;
  const stack = [["Solar", c.solar * (1 + part / 100)], ["Battery", c.battery * (1 + batt / 100) * (1 + part / 100)], ["Wind", c.wind * (1 + part / 100)], ["Delivery", c.delivery], ["Top-up incl. certification", 0.37]];
  const partner = stack.reduce((a, s) => a + s[1], 0);
  const surplus = 0.3294 * (0.7 * pool + 0.3 * ex);
  const feeKWh = fee * 1e5 / 730 / 1000;
  const energy = 6.65 - 0.75 * feeKWh; // v6 list price
  const allIn = energy + feeKWh;
  const margin = allIn - partner + surplus;
  const per100 = margin * 876e6 / 1e7;
  return (
    <div>
      <Head eyebrow="Platform economics" title="Unit economics per 100 MW" lede="Cost to price, per kWh of load, for a 2027 CFE Service contract. Move the drivers to stress the margin; the base case matches platform model v6 (₹0.80/kWh kept on a ₹6.70 all-in price, ₹0.70 after the ₹0.10 pool rebate; ₹0.46 with no pool)." />
      <div className="grid g12">
        <div className="card">
          <h2>Drivers</h2>
          {[["Battery toll change", batt, setBatt, -30, 20, "%"], ["All partner prices at signing", part, setPart, -5, 5, "%"], ["Pool price ₹/kWh", pool, setPool, 2.5, 3.5, ""], ["Exchange price ₹/kWh", ex, setEx, 1.0, 2.2, ""], ["Platform fee ₹ lakh/MW/month", fee, setFee, 0.5, 2.5, ""]].map(([l, v, f, a, b, u]) => (
            <div key={l} style={{ marginBottom: 10 }}><label className="f">{l}: <b className="mono">{fmt(v, u ? 0 : 2)}{u}</b></label><input type="range" min={a} max={b} step={u ? 1 : 0.05} value={v} onChange={e => f(+e.target.value)} /></div>))}
          <p className="small muted">75% of the fee is carved out of the energy price, so the all-in price barely moves.</p>
        </div>
        <div className="card">
          <h2>Cost to price, ₹ per kWh of load</h2>
          <Table num={[1]} cols={["Line", "₹/kWh"]} rows={[
            ...stack.map(s => [s[0], fmt(s[1], 2)]),
            [<b>Partner costs</b>, <b>{fmt(partner, 2)}</b>],
            ["Surplus sold (70% pooled, 30% exchange)", "−" + fmt(surplus, 2)],
            [<b>Net cost</b>, <b>{fmt(partner - surplus, 2)}</b>],
            [<b style={{ color: margin >= 0 ? "#1f9d63" : "#e5533d" }}>Our margin incl. platform fee</b>, <b style={{ color: margin >= 0 ? "#1f9d63" : "#e5533d" }}>{(margin >= 0 ? "+" : "") + fmt(margin, 2)}</b>],
            [<b>All-in price</b>, <b>{fmt(allIn, 2)}</b>],
            ["Customer's do-it-yourself cost, fully costed", "7.00"],
          ]} />
          <div className="grid g3" style={{ marginTop: 12 }}>
            <Kpi l="Net revenue per 100 MW" v={"₹" + fmt(per100, 1) + " Cr"} s="a year" c="y" />
            <Kpi l="All-in vs DIY" v={fmt(allIn - 7.00, 2)} s="₹/kWh vs ₹7.00 (negative = cheaper)" c={allIn <= 7.00 ? "g" : "r"} />
            <Kpi l="Lifetime value ÷ cost to win" v="23×" s="₹147 Cr PV ÷ ~₹6.3 Cr, fully loaded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Value() {
  const { scen } = useApp();
  const a = simulate({ scenario: scen.id, mode: "fixed" }).summary, b = simulate({ scenario: scen.id }).summary;
  const row = (l, x, y, f, d = 1, better = "up") => { const diff = y - x; return [l, f(x, d), f(y, d), <b style={{ color: (better === "up" ? diff >= 0 : diff <= 0) ? "#1f9d63" : "#e5533d" }}>{(diff >= 0 ? "+" : "") + f(diff, d)}</b>]; };
  const m = (v, d) => fmt(v, d);
  return (
    <div>
      <Head eyebrow="Platform economics" title="Platform value" lede="Same campus, same weather, same partner assets. Only the operating decisions differ: a fixed battery schedule with no pooling, versus the CFE Manager engine." />
      <Scenario />
      <div className="card">
        <Table num={[1, 2, 3]} cols={["October 2030", "Fixed schedule, no pool", "With CFE Manager", "Difference"]} rows={[
          row("Monthly CFE score, %", a.score * 100, b.score * 100, m, 1),
          ["Meets the CFE90 floor", a.score >= .9 ? "Yes" : "No", b.score >= .9 ? "Yes" : "No", ""],
          row("Hours below 90%", a.below, b.below, m, 0, "down"),
          row("Grid MWh (counts at zero)", a.grid, b.grid, m, 0, "down"),
          row("Green top-up MWh", a.top, b.top, m, 0),
          row("Surplus pooled to factories, MWh", a.pooled, b.pooled, m, 0),
          row("Guarantee payout, ₹ Cr", a.payout, b.payout, m, 2, "down"),
          row("Our margin, ₹ Cr / month", a.margin, b.margin, m, 2),
          row("Margin per kWh, ₹", a.marginPerKWh, b.marginPerKWh, m, 2),
        ]} />
      </div>
      <div className="grid g2" style={{ marginTop: 14 }}>
        <div className="card"><h3>Fixed schedule</h3><p className="muted">Battery discharges at a flat rate from 18:00 to 06:00 whatever the wind does; top-up is bought late and thin; surplus is dumped on the exchange at ₹1.50.</p></div>
        <div className="card"><h3>With CFE Manager</h3><p className="muted">The engine spreads stored energy across the dark hours, plans green top-up block by block, and pools the midday surplus at ₹3.00 with day-shift factories.</p></div>
      </div>
    </div>
  );
}
