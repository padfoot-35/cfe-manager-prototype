import React from "react";
import { useApp, Kpi, fmt, pct } from "./ui.jsx";
import { P } from "./engine.js";

const PORTALS = [
  ["portal-customer", "Customer", "Data centres and campuses", ["Hourly score and barcode", "Monthly statement and guarantee", "Certificates and onboarding"], "#ffe600"],
  ["portal-partner", "Partner", "Solar, wind and battery owners", ["Generation and dispatch", "Monthly settlement and LC", "Six-gate qualification"], "#2ba8d8"],
  ["portal-factory", "Factory", "Day-shift pool members", ["Pooled midday solar", "Landed ₹4.1/kWh vs tariff", "Equity sized to use"], "#ff8a3d"],
  ["portal-trader", "Trading member", "Licensed exchange member", ["G-DAM top-up bids", "Surplus sale orders", "Confirmations as evidence"], "#7b5cf0"],
  ["portal-verifier", "Verifier", "Independent assurance", ["Read-only ledgers", "Re-perform sampled hours", "Monthly opinion"], "#2fbf71"],
];

export function Home({ startDemo }) {
  const { sim, setPage } = useApp();
  const S = sim.summary;
  return (
    <div>
      <div className="hero">
        <div>
          <div className="eyebrow" style={{ color: "#ffe600" }}>CFE Manager · interactive prototype</div>
          <h1>Clean energy every hour, guaranteed and certified.</h1>
          <p style={{ fontSize: 15 }}>An asset-light platform for Indian data centres. Partners own the solar, wind and batteries; our engine dispatches them every 15 minutes, pools the midday surplus to day-shift factories, and proves every hour with a certificate. We guarantee a CFE90 score, or we pay.</p>
          <div className="row" style={{ marginTop: 16 }}>
            <button className="btn yel" onClick={() => startDemo("judge")}>▶ 2-minute judge demo</button>
            <button className="btn" onClick={() => startDemo("tour")}>Guided tour (13 stops)</button>
            <button className="btn" onClick={() => setPage("control")}>Open the control room</button>
          </div>
        </div>
        <div className="grid g2">
          <div className="stat"><b>{pct(S.score, 1)}</b><span>hourly clean score, {P.month}, 100 MW campus</span></div>
          <div className="stat"><b>₹6.50</b><span>all-in per kWh vs ~₹6.51 to do it yourself</span></div>
          <div className="stat"><b>{fmt(S.pooled, 0)} MWh</b><span>midday surplus pooled to 8 factories this month</span></div>
          <div className="stat"><b>0 MW</b><span>assets owned by CFE Manager</span></div>
        </div>
      </div>

      <h2 style={{ margin: "22px 0 10px" }}>Five sides, one engine</h2>
      <div className="grid g5">{PORTALS.map(([id, t, s, li, c]) => (
        <button key={id} className="portalcard" style={{ borderTopColor: c }} onClick={() => setPage(id)}>
          <div className="eyebrow">{s}</div><h2 style={{ margin: "4px 0 0" }}>{t} portal →</h2><ul>{li.map(x => <li key={x}>{x}</li>)}</ul>
        </button>))}
      </div>

      <div className="grid g2" style={{ marginTop: 14 }}>
        <div className="card">
          <h2>CFE Manager console</h2>
          <p className="muted">Run the platform: dispatch, pooling, evidence, growth and governance.</p>
          <div className="grid g2">{[["control", "Control room", "Live 15-minute dispatch"], ["block", "Block by block", "Merit order in one block"], ["pool", "Pool manager", "The network effect"], ["evidence", "Evidence", "Meter to certificate"], ["diagnostic", "Diagnostic", "Free product, opens every sale"], ["feasibility", "Feasibility", "Size a request, 8 state gates"], ["guarantee", "Guarantee", "Payout and stress test"], ["financials", "Financials", "₹80 Cr to ₹486 Cr net revenue"]].map(([id, t, s]) => (
            <button key={id} className="uc" style={{ gridTemplateColumns: "1fr auto", marginBottom: 0 }} onClick={() => setPage(id)}><div><b>{t}</b><div className="small muted">{s}</div></div><span>→</span></button>))}</div>
        </div>
        <div className="card">
          <h2>Five things to buy</h2>
          {[["Diagnostic", "Free", "True hourly score and path to 75% / 90%"], ["Hourly Certificates", "₹145/MWh", "For tenants with no open access"], ["Night Wrap", "₹8 lakh/MW/yr", "Battery-shifted solar + night blocks to ~75%"], ["CFE Service", "₹6.50/kWh all-in", "Full supply, CFE90 guaranteed, 15 years"], ["CFE Ledger", "₹12 lakh/pool/yr", "Assured hourly reporting for SBTi and BRSR"]].map(([n, p, d]) => (
            <div key={n} className="row" style={{ padding: "7px 0", borderBottom: "1px solid var(--line)" }}><b style={{ width: 150 }}>{n}</b><span className="pill y">{p}</span><span className="small muted" style={{ flex: 1 }}>{d}</span></div>))}
          <div className="grid g3" style={{ marginTop: 12 }}><Kpi l="2036 net revenue" v="₹486 Cr" c="y" /><Kpi l="2036 EBITDA" v="₹273 Cr" c="g" /><Kpi l="Equity" v="₹80 Cr" /></div>
        </div>
      </div>
    </div>
  );
}
