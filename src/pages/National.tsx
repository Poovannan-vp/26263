import { useMemo, useState } from "react";
import { useStore } from "../store";
import { INSTITUTIONS } from "../data/seed";
import { project } from "../engine/forecast";
import { activeOf, statusLabel, utilisation } from "../engine/programme";
import { toCsv, download } from "../engine/csv";
import { Chip, Empty, PageHead } from "../components/ui";

// Aggregated view across all institutions. No individual student records appear here.
export function National() {
  const { can, activeDelta, log, toast } = useStore();
  const [stateFilter, setStateFilter] = useState("all");

  const states = Array.from(new Set(INSTITUTIONS.map(i => i.state))).sort();
  const rows = useMemo(() => {
    return INSTITUTIONS
      .filter(i => stateFilter === "all" || i.state === stateFilter)
      .flatMap(i => i.programmes.map(p => {
        const active = activeOf(p, activeDelta);
        const f = project(p.snapshots, p.intake);
        const status = statusLabel(active, p.intake, f.breachDay);
        return {
          inst: i, prog: p, active, util: utilisation(active, p.intake),
          breachDay: f.breachDay, status,
        };
      }))
      .sort((a, b) => b.util - a.util);
  }, [stateFilter, activeDelta]);

  const totalIntake = rows.reduce((s, r) => s + r.prog.intake, 0);
  const totalActive = rows.reduce((s, r) => s + r.active, 0);
  const atRisk = rows.filter(r => r.status.tone !== "ok").length;

  const exportCsv = () => {
    const body = rows.map(r => [r.inst.name, r.inst.state, r.inst.type, r.prog.name, r.prog.intake, r.active, `${r.util}%`, r.status.text]);
    download("national_intake_summary.csv", toCsv(["institution", "state", "type", "programme", "intake", "active", "utilisation", "status"], body));
    void log("report.export", `national intake summary · ${rows.length} programmes`);
    toast("Report downloaded.");
  };

  return (
    <section>
      <PageHead
        eyebrow="National view · aggregated"
        title="Enrolment against intake"
        right={
          <div className="row">
            <select value={stateFilter} onChange={e => setStateFilter(e.target.value)} aria-label="Filter by state">
              <option value="all">All states</option>
              {states.map(s => <option key={s}>{s}</option>)}
            </select>
            {can("reports.export") && <button onClick={exportCsv}>Export CSV</button>}
          </div>
        }
      />

      <div className="grid-4">
        <Metric label="Programmes" value={rows.length} note="In the current filter." />
        <Metric label="Approved intake" value={totalIntake} note="Sum of approved intake." />
        <Metric label="Active enrolment" value={totalActive} note="Active rows, not raw upload rows." />
        <Metric label="Need attention" value={atRisk} note="Near, over or projected to breach." />
      </div>

      <div className="card">
        {rows.length === 0 && <Empty title="No institutions match this filter." />}
        {rows.length > 0 && (
          <table className="tbl wide">
            <thead>
              <tr>
                <th>Institution</th>
                <th>Programme</th>
                <th className="num">Intake</th>
                <th className="num">Active</th>
                <th>Utilisation</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.prog.id}>
                  <td>
                    {r.inst.name}
                    <div className="small muted">{r.inst.state} · {r.inst.type}</div>
                  </td>
                  <td>{r.prog.name}</td>
                  <td className="num">{r.prog.intake}</td>
                  <td className="num">{r.active}</td>
                  <td>
                    <div className="util">
                      <div className={`util-bar ${r.util > 100 ? "over" : r.util >= 95 ? "near" : "fine"}`} style={{ width: `${Math.min(100, r.util)}%` }} />
                      <span className="num">{r.util}%</span>
                    </div>
                  </td>
                  <td><Chip tone={r.status.tone === "ok" ? "ok" : r.status.tone === "warn" ? "warn" : "flag"}>{r.status.text}</Chip></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="small muted">Synthetic data. Bars show the percentage; the status text is shown beside each bar.</p>
    </section>
  );
}

function Metric({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div className="card metric">
      <div className="label">{label}</div>
      <div className="big">{value.toLocaleString("en-IN")}</div>
      <div className="small muted">{note}</div>
    </div>
  );
}
