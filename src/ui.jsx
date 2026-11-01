import React, { createContext, useContext, useState } from "react";
import { fmt, pct } from "./engine.js";

export const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export const COL = { sol: "#f5b800", wind: "#2ba8d8", dis: "#7b5cf0", top: "#2fbf71", grid: "#9aa0b4", pooled: "#ff8a3d", exch: "#c7cbd8", charge: "#b9a7f7", load: "#141a2e" };

export function Head({ eyebrow, title, lede, right }) {
  return (
    <div className="row" style={{ alignItems: "flex-start", marginBottom: 6 }}>
      <div style={{ flex: 1 }}>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {lede && <p className="lede">{lede}</p>}
      </div>
      {right}
    </div>
  );
}

export function Kpi({ l, v, s, c = "" }) {
  return <div className={"kpi " + c}><div className="l">{l}</div><div className="v">{v}</div>{s && <div className="s">{s}</div>}</div>;
}

export function Table({ cols, rows, num = [] }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table>
        <thead><tr>{cols.map((c, i) => <th key={i} className={num.includes(i) ? "n" : ""}>{c}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className={num.includes(j) ? "n" : ""}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export const status = s => {
  const g = ["Live", "Signed", "Approved", "In force", "Met every year", "Done"].includes(s);
  const r = ["Rejected", "Blocked"].includes(s);
  return <span className={"pill " + (g ? "g" : r ? "r" : "y")}>{s}</span>;
};

export function Scenario() {
  const { scen } = useApp();
  if (scen.id === "normal") return null;
  return <div className="note"><b>What-if running: {scen.name}.</b> {scen.desc} Every screen shows the re-planned result.</div>;
}

// Generic stage-based onboarding journey used by every portal
export function Journey({ stages, who, initial = 0 }) {
  const { journeys, setJourney } = useApp();
  const done = journeys[who] ?? initial;
  const [sel, setSel] = useState(Math.min(done, stages.length - 1));
  const st = stages[sel];
  return (
    <div>
      <div className="row" style={{ marginBottom: 8 }}>
        <span className="muted small">Progress</span>
        <div className="bar" style={{ flex: 1, maxWidth: 360 }}><div style={{ width: (done / stages.length * 100) + "%", background: "var(--green)" }} /></div>
        <span className="mono small">{done} of {stages.length} stages done</span>
      </div>
      <div className="stages" style={{ "--n": stages.length }}>
        {stages.map((s, i) => (
          <button key={i} className={(i < done ? "done " : "") + (i === sel ? "on" : "")} onClick={() => setSel(i)}>
            <small>Stage {i + 1}{i < done ? " ✓" : ""}</small>{s[0]}
          </button>
        ))}
      </div>
      <div className="grid g2">
        <div className="card">
          <div className="eyebrow">Stage {sel + 1} of {stages.length}</div>
          <h2 style={{ marginTop: 4 }}>{st[0]}</h2>
          <div className="grid g2">
            <div className="note blue" style={{ margin: 0 }}><b>You do</b><br />{st[1]}</div>
            <div className="note" style={{ margin: 0 }}><b>CFE Manager does</b><br />{st[2]}</div>
          </div>
          <h3 style={{ marginTop: 14 }}>Documents for this stage</h3>
          {st[3].length === 0 && <div className="muted small">No documents: this stage is live operation.</div>}
          {st[3].map((d, i) => (
            <div key={i} className="row" style={{ padding: "6px 0", borderBottom: "1px solid var(--line)" }}>
              <span style={{ flex: 1 }}>📄 {d}</span>{sel < done ? <span className="pill g">Accepted</span> : sel === done ? <span className="pill y">Pending</span> : <span className="pill">Locked</span>}
            </div>
          ))}
        </div>
        <div className="card">
          <h3>What happens next</h3>
          {sel < done && <p>Stage complete. Reviewed and approved by CFE Manager.</p>}
          {sel === done && <>
            <p>Submit the documents. They land in the CFE Manager onboarding queue; approving them unlocks the next stage here.</p>
            <div className="row">
              <button className="btn dark" onClick={() => { setJourney(who, done + 1); setSel(Math.min(done + 1, stages.length - 1)); }}>Submit and approve (demo)</button>
              {done > 0 && <button className="btn" onClick={() => { setJourney(who, 0); setSel(0); }}>Reset journey</button>}
            </div>
          </>}
          {sel > done && <p className="muted">Locked until stage {done + 1} is approved.</p>}
          <p className="small muted" style={{ marginTop: 14 }}>Simulated: no real documents are uploaded or stored.</p>
        </div>
      </div>
    </div>
  );
}

export function Barcode({ hours, highlight }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(24, 1fr)", gap: 3 }}>
      {hours.map((h, i) => (
        <div key={i} title={`${String(i).padStart(2, "0")}:00 · ${pct(h, 0)} clean`} style={{ height: 22, borderRadius: 4, background: h >= 0.9 ? "#2fbf71" : h >= 0.5 ? "#f5b800" : "#8a4552", outline: highlight === i ? "2px solid #141a2e" : "none", outlineOffset: 1 }} />
      ))}
    </div>
  );
}

export { fmt, pct };
