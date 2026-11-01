import React, { useEffect, useMemo, useRef, useState } from "react";
import { Ctx } from "./ui.jsx";
import { simulate, SCENARIOS } from "./engine.js";
import { JUDGE, TOUR, USECASES } from "./data.js";
import { Home } from "./home.jsx";
import { Control, Block, Pool, Orchestration, Evidence, Analytics } from "./operate.jsx";
import { Money, Network, Unit, Value } from "./platform.jsx";
import { Diagnostic, Pipeline, Queue, Customers, Partners, Contracts, Feasibility } from "./grow.jsx";
import { Guarantee, Financials, Compliance, Checks } from "./govern.jsx";
import { PortalCustomer, PortalPartner, PortalFactory, PortalTrader, PortalVerifier } from "./portals.jsx";

const NAV = [
  ["OPERATE", [["control", "Control room"], ["block", "Block by block"], ["pool", "Pool manager"], ["orchestration", "Orchestration"], ["evidence", "Evidence and certificates"], ["analytics", "Month analytics"]]],
  ["PLATFORM", [["money", "Follow the ₹100"], ["network", "Network effect"], ["unit", "Unit economics"], ["value", "Platform value"]]],
  ["GROW", [["diagnostic", "Hourly diagnostic", true], ["pipeline", "Pipeline and waves"], ["queue", "Onboarding queue"], ["customers", "Customers"], ["partners", "Partners"], ["contracts", "Contracts and risk"], ["feasibility", "Feasibility"]]],
  ["GOVERN", [["guarantee", "Guarantee and risk"], ["financials", "Financials"], ["compliance", "Compliance"], ["checks", "System checks"]]],
];
const PORTALS = [["portal-customer", "Customer"], ["portal-partner", "Partner"], ["portal-factory", "Factory"], ["portal-trader", "Trading member"], ["portal-verifier", "Verifier"]];
const PAGES = { home: Home, control: Control, block: Block, pool: Pool, orchestration: Orchestration, evidence: Evidence, analytics: Analytics, money: Money, network: Network, unit: Unit, value: Value, diagnostic: Diagnostic, pipeline: Pipeline, queue: Queue, customers: Customers, partners: Partners, contracts: Contracts, feasibility: Feasibility, guarantee: Guarantee, financials: Financials, compliance: Compliance, checks: Checks, "portal-customer": PortalCustomer, "portal-partner": PortalPartner, "portal-factory": PortalFactory, "portal-trader": PortalTrader, "portal-verifier": PortalVerifier };
const TITLE = Object.fromEntries([["home", "Home"], ...NAV.flatMap(g => g[1]), ...PORTALS.map(([id, l]) => [id, l + " portal"])]);

const readHash = () => { const h = (window.location.hash || "").replace(/^#\/?/, ""); return PAGES[h] ? h : "home"; };

export default function App() {
  const [page, setPageRaw] = useState(readHash);
  const [scenId, setScen] = useState("normal");
  const [day, setDay] = useState(15);
  const [blk, setBlk] = useState(84);
  const [running, setRunning] = useState(false);
  const [journeys, setJ] = useState({});
  const [menu, setMenu] = useState(null); // 'whatif' | 'portal' | 'uc'
  const [demo, setDemo] = useState(null); // { name, steps:[{page,scenario,title,text}], i }
  const mainRef = useRef(null);

  const scen = SCENARIOS.find(s => s.id === scenId);
  const sim = useMemo(() => simulate({ scenario: scenId }), [scenId]);
  const setPage = p => { setPageRaw(p); setMenu(null); try { window.history.replaceState(null, "", "#/" + p); } catch (e) { } window.scrollTo(0, 0); };
  const setJourney = (k, v) => setJ(j => ({ ...j, [k]: v }));

  useEffect(() => { const f = () => setPageRaw(readHash()); window.addEventListener("hashchange", f); return () => window.removeEventListener("hashchange", f); }, []);
  useEffect(() => { if (!running) return; const t = setInterval(() => setBlk(b => (b + 1) % 96), 450); return () => clearInterval(t); }, [running]);
  useEffect(() => { if (["windlull", "batttrip", "aiload", "cloud", "noclear"].includes(scenId)) setDay(15); if (scenId === "badweek") setDay(15); }, [scenId]);

  const startDemo = kind => {
    let steps;
    if (kind === "judge") steps = JUDGE.map(s => ({ ...s }));
    else if (kind === "tour") steps = TOUR.map(([p, t], i) => ({ page: p, scenario: "normal", title: `Tour ${i + 1} of ${TOUR.length}`, text: t }));
    else { const u = USECASES.find(x => x.id === kind); steps = u.steps.map(([p, s, t], i) => ({ page: p, scenario: s, title: `${u.id} · ${u.title} (${i + 1}/${u.steps.length})`, text: t })); }
    setMenu(null); setDemo({ steps, i: 0 }); go(steps[0]);
  };
  const go = st => { setScen(st.scenario || "normal"); setPage(st.page); if (st.page === "block") setBlk(st.text.startsWith("Evening") ? 80 : 48); };
  const step = d => { const i = demo.i + d; if (i < 0 || i >= demo.steps.length) { setDemo(null); return; } setDemo({ ...demo, i }); go(demo.steps[i]); };

  const ctx = { page, setPage, scen, setScen, sim, day, setDay, blk, setBlk, running, setRunning, journeys, setJourney };
  const Page = PAGES[page] || Home;
  const inPortal = page.startsWith("portal-");

  return (
    <Ctx.Provider value={ctx}>
      <header className="topbar">
        <button className="brand" onClick={() => setPage("home")}><span className="logo">CFE</span>CFE Manager</button>
        <span className="crumb">{inPortal ? "Portal" : "Console"} / <b>{TITLE[page]}</b></span>
        <span className="sp" />
        <span className="badge">SIMULATED</span>
        <div style={{ position: "relative" }}>
          <button className="btn" onClick={() => setMenu(menu === "portal" ? null : "portal")}>Switch portal ▾</button>
          {menu === "portal" && <div className="menu" style={{ width: 260 }}>
            <button className="opt" style={{ width: "100%", marginBottom: 6 }} onClick={() => setPage("home")}><b>CFE Manager console</b><span>Operate, grow and govern</span></button>
            {PORTALS.map(([id, l]) => <button key={id} className={"opt" + (page === id ? " on" : "")} style={{ width: "100%", marginBottom: 6 }} onClick={() => setPage(id)}><b>{l} portal</b></button>)}
          </div>}
        </div>
        <div style={{ position: "relative" }}>
          <button className={"btn" + (scenId !== "normal" ? " yel" : "")} onClick={() => setMenu(menu === "whatif" ? null : "whatif")}>What-if: {scen.name} ▾</button>
          {menu === "whatif" && <div className="menu">
            <div className="eyebrow" style={{ marginBottom: 8 }}>Run a what-if. The whole month is re-simulated and every screen updates.</div>
            <div className="grid g2">{SCENARIOS.map(s => <button key={s.id} className={"opt" + (s.id === scenId ? " on" : "")} onClick={() => { setScen(s.id); setMenu(null); }}><b>{s.name}</b><span>{s.desc}</span></button>)}</div>
          </div>}
        </div>
        <button className="btn yel" onClick={() => startDemo("judge")}>▶ Judge demo</button>
        <button className="btn" onClick={() => startDemo("tour")}>Tour</button>
        <button className="btn" onClick={() => setMenu(menu === "uc" ? null : "uc")}>Q&amp;A use cases</button>
      </header>
      <div className="layout">
        <aside className="side">
          <div className="who"><span className="logo">CFE</span><div><b>{inPortal ? TITLE[page] : "CFE Manager"}</b><span>{inPortal ? "External view" : "Platform operator console"}</span></div></div>
          <nav className="nav">
            <button className={page === "home" ? "on" : ""} onClick={() => setPage("home")}>Home</button>
            {NAV.map(([g, items]) => <React.Fragment key={g}><h6>{g}</h6>{items.map(([id, l, nw]) => <button key={id} className={page === id ? "on" : ""} onClick={() => setPage(id)}>{l}{nw && <span className="new">FREE</span>}</button>)}</React.Fragment>)}
            <h6>PORTALS</h6>
            {PORTALS.map(([id, l]) => <button key={id} className={page === id ? "on" : ""} onClick={() => setPage(id)}>{l}</button>)}
          </nav>
        </aside>
        <main className="main" ref={mainRef}>
          <Page startDemo={startDemo} />
          <div className="foot">Prototype by team EasY Peasy (ISB) for the EY-Parthenon Quest EYP finale. All data simulated: one month (October 2030) of 15-minute blocks for a 100 MW campus and an 8-factory pool, anchored to the team's platform model v6 (₹6.70 all-in, ₹7.00 do-it-yourself, pooling as upside). Partner, customer and factory names are illustrative.</div>
        </main>
      </div>

      {menu === "uc" && <div className="modal" onClick={() => setMenu(null)}><div onClick={e => e.stopPropagation()}>
        <div className="row"><h2 style={{ flex: 1, margin: 0 }}>Q&amp;A use cases</h2><button className="btn sm" onClick={() => setMenu(null)}>Close</button></div>
        <p className="muted">Each one plays a short walkthrough on the right screen with the right what-if switched on.</p>
        {USECASES.map(u => <button key={u.id} className="uc" onClick={() => startDemo(u.id)}><span className="tag">{u.id}</span><b>{u.title}</b><span className="small muted">{u.steps.length} step{u.steps.length > 1 ? "s" : ""} ▶</span></button>)}
      </div></div>}

      {demo && <div className="overlay">
        <div><b>{demo.steps[demo.i].title}</b><p>{demo.steps[demo.i].text}</p></div>
        <div className="row">
          <button className="btn sm" disabled={demo.i === 0} onClick={() => step(-1)}>◀</button>
          <span className="mono small">{demo.i + 1}/{demo.steps.length}</span>
          <button className="btn sm yel" onClick={() => step(1)}>{demo.i === demo.steps.length - 1 ? "Finish" : "Next ▶"}</button>
          <button className="btn sm" onClick={() => setDemo(null)}>✕</button>
        </div>
      </div>}
    </Ctx.Provider>
  );
}
