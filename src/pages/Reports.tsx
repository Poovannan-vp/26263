import { useMemo, useState } from "react";
import { useStore } from "../store";
import { INSTITUTIONS } from "../data/seed";
import { scopedInstitutions, activeOf, utilisation } from "../engine/programme";
import { toCsv, download } from "../engine/csv";
import { Empty, PageHead } from "../components/ui";

type ReportId = "enrolment" | "categories" | "flags" | "quality";

const REPORTS: { id: ReportId; label: string; purpose: string }[] = [
  { id: "enrolment", label: "Enrolment vs intake", purpose: "Policy and monitoring: active seats against approved intake." },
  { id: "categories", label: "Category summary", purpose: "Accreditation: supernumerary, NRI, OCI and FN counts." },
  { id: "flags", label: "Flag log", purpose: "Regulation: every flag with its rule, state and notes." },
  { id: "quality", label: "Upload data quality", purpose: "Governance: how clean each upload was." },
];

// Reports use the same numbers and wording as the screens. The scope follows the signed-in role.
export function Reports() {
  const { session, can, activeDelta, flags, uploads, log, toast } = useStore();
  const [report, setReport] = useState<ReportId>("enrolment");
  const scope = scopedInstitutions(session?.institutionId, can("view.national"));
  const scopeIds = new Set(scope.map(i => i.id));
  const progs = useMemo(() => scope.flatMap(i => i.programmes.map(p => ({ inst: i, prog: p }))), [scope]);

  const table = useMemo((): { headers: string[]; rows: (string | number)[][] } => {
    switch (report) {
      case "enrolment":
        return {
          headers: ["Institution", "Programme", "Intake", "Active", "Utilisation %"],
          rows: progs.map(({ inst, prog }) => [inst.name, prog.name, prog.intake, activeOf(prog, activeDelta), utilisation(activeOf(prog, activeDelta), prog.intake)]),
        };
      case "categories":
        return {
          headers: ["Institution", "Programme", "Supernumerary", "NRI", "OCI", "FN"],
          rows: progs.map(({ inst, prog }) => [inst.name, prog.name, prog.supernumerary, prog.nri, prog.oci, prog.fn]),
        };
      case "flags":
        return {
          headers: ["Flag", "Institution", "Programme", "Rule", "State", "Reason", "Notes"],
          rows: flags.filter(f => scopeIds.has(f.instId)).map(f => [
            f.id,
            INSTITUTIONS.find(i => i.id === f.instId)?.name ?? f.instId,
            progs.find(p => p.prog.id === f.progId)?.prog.name ?? f.progId,
            f.rule, f.state, f.reason, f.notes.length,
          ]),
        };
      case "quality":
        return {
          headers: ["Upload", "File", "When", "Rows", "Accepted", "Correctable", "Review", "Acceptance %"],
          rows: uploads.filter(u => scopeIds.has(u.instId)).map(u => [
            u.id, u.file, u.at, u.rows, u.accepted, u.correctable, u.review,
            Math.round((u.accepted / u.rows) * 100),
          ]),
        };
    }
  }, [report, progs, activeDelta, flags, uploads, scopeIds]);

  const current = REPORTS.find(r => r.id === report)!;

  const exportCsv = () => {
    download(`${report}_report.csv`, toCsv(table.headers, table.rows));
    void log("report.export", `${current.label} · ${table.rows.length} rows`);
    toast("Report downloaded.");
  };

  const print = () => {
    void log("report.print", current.label);
    window.print();
  };

  if (!can("reports.export")) return null;

  return (
    <section>
      <PageHead
        eyebrow={`Reports · ${session ? scopeLabel(session.institutionId, can("view.national")) : ""}`}
        title="Reports for policy, accreditation and regulation"
        right={<div className="row"><button onClick={exportCsv} disabled={table.rows.length === 0}>Export CSV</button><button className="primary" onClick={print}>Print or save as PDF</button></div>}
      />

      <div className="report-picker" role="tablist" aria-label="Report type">
        {REPORTS.map(r => (
          <button key={r.id} role="tab" aria-selected={report === r.id} className={report === r.id ? "on" : ""} onClick={() => setReport(r.id)}>
            {r.label}
          </button>
        ))}
      </div>
      <p className="muted small">{current.purpose}</p>

      <div className="card report-card">
        <div className="label">{current.label}</div>
        {table.rows.length === 0 && <Empty title="No rows in this report for your scope." />}
        {table.rows.length > 0 && (
          <div className="table-scroll">
            <table className="tbl wide">
              <thead><tr>{table.headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {table.rows.map((r, i) => (
                  <tr key={i}>{r.map((c, j) => <td key={j} className={typeof c === "number" ? "num" : ""}>{typeof c === "number" ? c.toLocaleString("en-IN") : c}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="small muted">The CSV uses the same column names as this table.</div>
      </div>
    </section>
  );
}

function scopeLabel(instId: string | undefined, all: boolean): string {
  if (all || !instId) return "all institutions";
  return INSTITUTIONS.find(i => i.id === instId)?.name ?? "own institution";
}
