import React, { useMemo, useState } from "react";
import { useApp, Head, Kpi, Table, Journey, Barcode, Scenario, fmt, pct } from "./ui.jsx";
import { P } from "./engine.js";
import { CUSTOMER_STAGES, PARTNER_STAGES, FACTORY_STAGES, TRADER_STAGES, VERIFIER_STAGES, PARTNERS, FACTORIES } from "./data.js";

function Tabs({ tabs, tab, setTab }) {
  return <div className="tabs">{tabs.map(([id, l]) => <button key={id} className={tab === id ? "on" : ""} onClick={() => setTab(id)}>{l}</button>)}</div>;
}
const dayHours = (sim, day) => sim.summary.hours.filter(h => h.day === day);

export function PortalCustomer() {
  const { sim, day, setDay } = useApp();
  const [tab, setTab] = useState("service");
  const S = sim.summary; const hrs = dayHours(sim, day);
  const pts = Math.max(0, (0.9 - S.score) * 100);
  return (
    <div>
      <Head eyebrow="Customer portal · Colocation A · Navi Mumbai · 100 MW" title="Your clean-energy service" lede="One contract, one monthly score, one bill. Everything below is what your sustainability, finance and audit teams see." />
      <Scenario />
      <Tabs tab={tab} setTab={setTab} tabs={[["service", "My service"], ["statement", "Monthly statement"], ["journey", "Onboarding journey"]]} />
      {tab === "service" && <>
        <div className="grid g4" style={{ marginBottom: 14 }}>
          <Kpi l={"Hourly score · " + P.month} v={pct(S.score, 1)} s="guaranteed floor 90%" c={S.score >= 0.9 ? "g" : "r"} />
          <Kpi l="Hours below 90%" v={S.below} s="of 744" />
          <Kpi l="Clean MWh delivered" v={fmt(S.clean, 0)} s={"of " + fmt(S.load, 0) + " MWh used"} />
          <Kpi l="CO₂ avoided" v={fmt(S.co2, 0) + " t"} s="vs grid at 0.71 t/MWh" c="y" />
        </div>
        <div className="card">
          <div className="row"><h2 style={{ flex: 1 }}>{day} October, hour by hour</h2><label className="small muted">Day</label><input type="range" min="1" max="31" value={day} onChange={e => setDay(+e.target.value)} style={{ width: 200 }} /></div>
          <Barcode hours={hrs.map(h => h.score)} />
          <div className="row small muted" style={{ marginTop: 6 }}><span><span className="sw" style={{ background: "#2fbf71" }} />≥90% clean</span><span><span className="sw" style={{ background: "#f5b800" }} />50–90%</span><span><span className="sw" style={{ background: "#8a4552" }} />below 50%</span></div>
        </div>
        <div className="card" style={{ marginTop: 14 }}><h2>Your certificates</h2><p>Every hour of the month carries a certificate per source (solar, wind, battery with its charge source, green top-up), retired to you once. <a href="https://padfoot-35.github.io/cfe-certificate/" target="_blank" rel="noreferrer">Open a sample certificate ↗</a></p></div>
      </>}
      {tab === "statement" && <div className="grid g2">
        <div className="card"><h2>Statement · {P.month}</h2>
          <Table cols={["Line", "₹ Cr"]} num={[1]} rows={[["Energy: " + fmt(S.load, 0) + " MWh × ₹6.50 (incl. delivery)", fmt(S.billEnergy, 2)], ["Platform fee: 100 MW × ₹1.5 lakh", fmt(S.fee, 2)], ["Pool rebate: ₹0.10/kWh (state pool full)", S.rebate > 0 ? "−" + fmt(S.rebate, 2) : "0.00"], ["Service credit (" + fmt(pts, 1) + " points below 90%)", S.payout > 0 ? "−" + fmt(S.payout, 2) : "0.00"], [<b>Total payable</b>, <b>{fmt(S.bill - S.payout, 2)}</b>]]} />
          <p className="small muted">All-in ₹6.70/kWh (₹6.60 after the pool rebate) vs ~₹7.00 to build it yourself, with no equity, no assets on your balance sheet and an assured hourly number.</p>
        </div>
        <div className="card"><h2>What you can report</h2><Table cols={["Framework", "Number"]} rows={[["SBTi Net-Zero v2 (C32), hourly", pct(S.score, 1)], ["Annual matching", "100%"], ["BRSR Core, renewable share", pct(S.score, 1)], ["Scope 2 market-based, t CO₂", fmt((S.load - S.clean) * 0.71, 0)]]} /><p className="small muted">Independent verifier opinion attached each month.</p></div>
      </div>}
      {tab === "journey" && <Journey stages={CUSTOMER_STAGES} who="cust" initial={8} />}
    </div>
  );
}

export function PortalPartner() {
  const { sim } = useApp();
  const [tab, setTab] = useState("asset");
  const [asset, setAsset] = useState("sol");
  const S = sim.summary;
  const mwh = useMemo(() => { const B = sim.blocks; return { sol: B.reduce((a, x) => a + x.solRaw, 0) / 4, wind: B.reduce((a, x) => a + x.windRaw, 0) / 4, batt: B.reduce((a, x) => a + x.dis, 0) / 4 }; }, [sim]);
  const kWh = S.load * 1000;
  const pay = { sol: kWh * P.cost.solar / 1e7, wind: kWh * P.cost.wind / 1e7, batt: kWh * P.cost.battery / 1e7 };
  const meta = { sol: ["Sunfield Solar SPV", "380 MWac solar, Gujarat", "Solar PPA SOL-GJ-01"], wind: ["Westwind IPP", "110 MW wind, Gujarat", "Wind PPA WND-GJ-02"], batt: ["Gridstore Battery Co.", "100 MW / 400 MWh battery", "Battery toll BES-GJ-01"] }[asset];
  return (
    <div>
      <Head eyebrow={"Partner portal · " + meta[0]} title="Your asset, our dispatch" lede="You own and operate the asset under a 15-year contract with CFE Manager. We schedule it every 15 minutes and pay you monthly, backed by an LC." />
      <Tabs tab={tab} setTab={setTab} tabs={[["asset", "My asset"], ["journey", "Onboarding journey"]]} />
      {tab === "asset" && <>
        <div className="row" style={{ marginBottom: 12 }}>{[["sol", "Solar"], ["wind", "Wind"], ["batt", "Battery"]].map(([id, l]) => <button key={id} className={"btn" + (asset === id ? " dark" : "")} onClick={() => setAsset(id)}>{l}</button>)}</div>
        <div className="grid g4" style={{ marginBottom: 14 }}>
          <Kpi l="Asset" v={meta[1].split(",")[0]} s={meta[2]} />
          <Kpi l={asset === "batt" ? "Discharged this month" : "Generated this month"} v={fmt(mwh[asset], 0) + " MWh"} />
          <Kpi l="Settlement this month" v={"₹" + fmt(pay[asset], 2) + " Cr"} s="cost-plus, passed through" c="g" />
          <Kpi l="Payment security" v="1 month LC" s="20% cash margin" c="y" />
        </div>
        <div className="card"><h2>Partner settlement, all assets ({P.month})</h2><Table cols={["Partner", "Asset", "Contract", "₹/kWh of campus load", "₹ Cr this month"]} num={[3, 4]} rows={[["Sunfield Solar SPV", "380 MWac solar", "PPA", "2.54", fmt(pay.sol, 2)], ["Gridstore Battery Co.", "100 MW / 400 MWh", "Toll", "1.54", fmt(pay.batt, 2)], ["Westwind IPP", "110 MW wind", "PPA", "1.08", fmt(pay.wind, 2)], ["Transmission, losses, OA charges", "Delivery", "Regulated", "1.21", fmt(kWh * 1.21 / 1e7, 2)], [<b>Total to partners</b>, "", "", <b>6.37</b>, <b>{fmt(S.partner - kWh * 0.02 / 1e7, 2)}</b>]]} /></div>
        <div className="card" style={{ marginTop: 14 }}><h2>Partner pipeline</h2><Table cols={["Asset", "Partner", "Type", "Capacity", "Status"]} rows={PARTNERS.map(p => [p.id, p.name, p.kind, p.mw + " " + p.unit, p.status])} /></div>
      </>}
      {tab === "journey" && <Journey stages={PARTNER_STAGES} who="partner" initial={4} />}
    </div>
  );
}

export function PortalFactory() {
  const { sim } = useApp();
  const [tab, setTab] = useState("savings");
  const [tariff, setTariff] = useState(8.2);
  const S = sim.summary;
  const f = FACTORIES[0];
  const share = S.pooled / P.factories; // MWh per factory
  const landed = 4.1, save = (tariff - landed) * share * 1000 / 1e5; // lakh
  const fee = save * 0.10;
  return (
    <div>
      <Head eyebrow={"Factory portal · " + f.name + " · " + f.city} title="Cheaper daytime power from the pool" lede="Your day shift buys the data centre's midday solar surplus through a group-captive pool. You take equity sized to your use, and pay a 10% share of your saving as the membership fee." />
      <Scenario />
      <Tabs tab={tab} setTab={setTab} tabs={[["savings", "My savings"], ["journey", "Onboarding journey"]]} />
      {tab === "savings" && <>
        <div className="grid g4" style={{ marginBottom: 14 }}>
          <Kpi l="Pooled solar this month" v={fmt(share, 0) + " MWh"} s={"pool total " + fmt(S.pooled, 0) + " MWh"} />
          <Kpi l="Landed cost" v={"₹" + landed + "/kWh"} s="₹3.00 energy + charges" c="y" />
          <Kpi l="Your saving" v={"₹" + fmt(save, 1) + " lakh"} s="this month, before fee" c="g" />
          <Kpi l="Membership fee (10%)" v={"₹" + fmt(fee, 1) + " lakh"} />
        </div>
        <div className="grid g2">
          <div className="card"><h2>Your tariff today</h2><label className="f">Solar-hours DISCOM tariff: <b className="mono">₹{fmt(tariff, 2)}/kWh</b></label><input type="range" min="6" max="10" step="0.05" value={tariff} onChange={e => setTariff(+e.target.value)} /><p className="small muted">Saving per kWh: ₹{fmt(tariff - landed, 2)}. The model assumes ₹2.00/kWh of saving on average.</p></div>
          <div className="card"><h2>Pool members</h2><Table cols={["Factory", "City", "MW", "Equity ₹ Cr", "Use %"]} num={[2, 3, 4]} rows={FACTORIES.map(x => [x.name, x.city, x.mw, x.equity, x.use])} /><p className="small muted">2026 Rules: each member's use capped at its ownership share; the group passes 26% ownership / 51% use.</p></div>
        </div>
      </>}
      {tab === "journey" && <Journey stages={FACTORY_STAGES} who="factory" initial={6} />}
    </div>
  );
}

export function PortalTrader() {
  const { sim, day } = useApp();
  const [tab, setTab] = useState("desk");
  const blocks = sim.blocks.filter(x => x.day === day);
  const hrs = []; for (let h = 0; h < 24; h++) { const s = blocks.slice(h * 4, h * 4 + 4); hrs.push({ h, top: s.reduce((a, x) => a + x.top, 0) / 4, exch: s.reduce((a, x) => a + x.exch, 0) / 4 }); }
  const rows = hrs.filter(x => x.top > 0.05 || x.exch > 0.05).map(x => [String(x.h).padStart(2, "0") + ":00", x.top > 0.05 ? <span className="pill b">Buy green top-up</span> : <span className="pill y">Sell surplus</span>, fmt(x.top > 0.05 ? x.top : x.exch, 1), x.top > 0.05 ? "≤ ₹5.00" : "≥ ₹1.50", <span className="pill g">Cleared</span>]);
  return (
    <div>
      <Head eyebrow="Trading member portal" title="Order desk" lede="A licensed exchange member executes our G-DAM top-up bids and surplus sales within a signed mandate. Every confirmation is evidence in the hourly ledger." />
      <Tabs tab={tab} setTab={setTab} tabs={[["desk", "Order desk"], ["journey", "Onboarding journey"]]} />
      {tab === "desk" && <>
        <div className="grid g3" style={{ marginBottom: 14 }}><Kpi l={"Top-up bought, " + day + " Oct"} v={fmt(hrs.reduce((a, x) => a + x.top, 0), 0) + " MWh"} c="y" /><Kpi l="Surplus sold" v={fmt(hrs.reduce((a, x) => a + x.exch, 0), 0) + " MWh"} /><Kpi l="Mandate limits" v="20 MW · ₹5.00" s="buy cap, max price" /></div>
        <div className="card"><h2>Orders for {day} October (placed D-1 10:00)</h2>{rows.length ? <Table cols={["Hour", "Order", "MWh", "Limit price", "Status"]} num={[2]} rows={rows} /> : <p className="muted">No orders this day.</p>}</div>
      </>}
      {tab === "journey" && <Journey stages={TRADER_STAGES} who="trader" initial={4} />}
    </div>
  );
}

export function PortalVerifier() {
  const { sim } = useApp();
  const [tab, setTab] = useState("review");
  const [seed, setSeed] = useState(1);
  const S = sim.summary;
  const sample = useMemo(() => { const out = []; let s = seed * 7919; for (let i = 0; i < 10; i++) { s = (s * 1103515245 + 12345) % 2147483648; out.push(S.hours[s % S.hours.length]); } return out; }, [seed, S]);
  return (
    <div>
      <Head eyebrow="Verifier portal · independent assurance" title={"Month review · " + P.month} lede="Read-only access to every ledger. Draw a random sample of hours, re-perform them from meter data, and sign the monthly opinion." />
      <Tabs tab={tab} setTab={setTab} tabs={[["review", "Month review"], ["journey", "Onboarding journey"]]} />
      {tab === "review" && <>
        <div className="grid g4" style={{ marginBottom: 14 }}><Kpi l="Reported score" v={pct(S.score, 2)} /><Kpi l="Re-performed score" v={pct(S.hours.reduce((a, h) => a + h.clean, 0) / S.hours.reduce((a, h) => a + h.load, 0), 2)} c="g" /><Kpi l="Sample size" v="10 hours" s="random, re-drawable" /><Kpi l="Exceptions" v="0" c="g" /></div>
        <div className="card"><div className="row"><h2 style={{ flex: 1 }}>Sampled hours</h2><button className="btn" onClick={() => setSeed(seed + 1)}>Draw a new sample</button></div>
          <Table cols={["Hour", "Load MWh", "Clean MWh (ledger)", "Clean MWh (re-performed)", "Hourly score", "Result"]} num={[1, 2, 3, 4]} rows={sample.map(h => [`${h.day} Oct ${String(h.hour).padStart(2, "0")}:00`, fmt(h.load, 1), fmt(h.clean, 1), fmt(h.clean, 1), pct(h.score, 1), <span className="pill g">Agrees</span>])} />
        </div>
        <div className="note blue" style={{ marginTop: 14 }}><b>Opinion (draft):</b> In our opinion the hourly CFE score of {pct(S.score, 1)} for Colocation A for {P.month} is fairly stated in accordance with evidence method v1.0.</div>
      </>}
      {tab === "journey" && <Journey stages={VERIFIER_STAGES} who="verifier" initial={4} />}
    </div>
  );
}
