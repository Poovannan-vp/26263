import { useMemo, useState, type DragEvent } from "react";
import { useStore } from "../store";
import { INSTITUTIONS } from "../data/seed";
import { parseCsv, SAMPLE_CSV, TEMPLATE_HEADERS, toCsv, download } from "../engine/csv";
import { validateUpload, summarise, type RowResult, type UploadRow } from "../engine/upload";
import { activeOf } from "../engine/programme";
import { maskApaar } from "../engine/format";
import { RULES } from "../engine/rules";
import { Chip, Empty, PageHead } from "../components/ui";

const TONE = { accepted: "ok", correctable: "warn", review: "flag" } as const;
const LABEL = { accepted: "Accepted", correctable: "Correctable", review: "Needs review" } as const;

// College upload: check each row, keep the valid ones, explain the rest, let the college fix and resubmit.
export function Upload() {
  const { session, activeDelta, addActive, addUpload, log, toast } = useStore();
  const inst = INSTITUTIONS.find(i => i.id === session?.institutionId) ?? INSTITUTIONS[0];
  const [progId, setProgId] = useState(inst.programmes[0].id);
  const prog = inst.programmes.find(p => p.id === progId) ?? inst.programmes[0];
  const remaining = Math.max(0, prog.intake - activeOf(prog, activeDelta));

  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<UploadRow[] | null>(null);
  const [fixes, setFixes] = useState<Record<number, string>>({});
  const [dragging, setDragging] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const results: RowResult[] = useMemo(() => (rows ? validateUpload(rows, remaining) : []), [rows, remaining]);
  const totals = summarise(results);

  const load = (name: string, text: string) => {
    setFileName(name);
    setRows(parseCsv(text));
    setFixes({});
    setAccepted(false);
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    load(file.name, await file.text());
    void log("upload.received", `${file.name} · ${prog.name}`);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    void onFile(e.dataTransfer.files[0]);
  };

  const recheck = () => {
    if (!rows) return;
    const next = rows.map(r => (fixes[r.line] !== undefined ? { ...r, apaar: fixes[r.line].trim() } : r));
    setRows(next);
    setFixes({});
    void log("upload.resubmitted", `${fileName} · ${Object.keys(fixes).length} row(s) corrected`);
    toast("Rows rechecked.");
  };

  const acceptValid = () => {
    addActive(prog.id, totals.accepted);
    addUpload({
      id: "UP-" + Math.floor(2700 + Math.random() * 100),
      instId: inst.id,
      file: fileName ?? "upload.csv",
      at: new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      rows: totals.rows,
      accepted: totals.accepted,
      correctable: totals.correctable,
      review: totals.review,
    });
    setAccepted(true);
    void log("upload.accepted", `${fileName} · ${totals.accepted} accepted · ${totals.correctable} correctable · ${totals.review} review`);
    toast(`${totals.accepted} rows accepted. Errors kept for correction.`);
  };

  const errorReport = () => {
    const bad = results.filter(r => r.status !== "accepted");
    const body = bad.map(r => [r.row.line, r.row.apaar, r.row.name, r.row.category, r.row.admissionDate, LABEL[r.status], r.reasons.join("; ")]);
    download("error_report.csv", toCsv(["line", ...TEMPLATE_HEADERS, "status", "reasons"], body));
    void log("upload.error_report", `${fileName} · ${bad.length} rows`);
  };

  const downloadTemplate = () => download("apaar_upload_template.csv", toCsv(TEMPLATE_HEADERS, []));

  return (
    <section>
      <PageHead
        eyebrow={`${inst.name} · upload`}
        title="Upload student records"
        right={
          <label className="field inline">
            <span>Programme</span>
            <select value={prog.id} onChange={e => { setProgId(e.target.value); setAccepted(false); }}>
              {inst.programmes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
        }
      />

      <div className="grid-2">
        <div
          className={`dropzone ${dragging ? "over" : ""}`}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          role="region"
          aria-label="Drop a CSV file here"
        >
          <div className="empty-title">Drop a CSV file here</div>
          <div className="small muted">Columns: apaar, name, category, admission_date (YYYY-MM-DD)</div>
          <div className="row wrap center">
            <label className="button-like">
              Choose file
              <input type="file" accept=".csv,text/csv" hidden onChange={e => void onFile(e.target.files?.[0])} />
            </label>
            <button onClick={() => load("sample_cse_batch.csv", SAMPLE_CSV)}>Use sample file</button>
            <button className="ghost" onClick={downloadTemplate}>Download template</button>
          </div>
        </div>

        <div className="card">
          <div className="label">Seats for this programme</div>
          <div className="big">{remaining} left</div>
          <div className="small muted">Intake {prog.intake} · active {activeOf(prog, activeDelta)}. Rows beyond the seats left are held for review.</div>
          {rows && (
            <div className="summary">
              <div><b className="ok">{totals.accepted}</b> accepted</div>
              <div><b className="warn">{totals.correctable}</b> correctable</div>
              <div><b className="flag">{totals.review}</b> need review</div>
              <div className="muted small">{totals.rows} rows in {fileName}</div>
            </div>
          )}
          {rows && (
            <div className="row wrap">
              <button onClick={errorReport} disabled={totals.correctable + totals.review === 0}>Download error report</button>
              <button className="primary" onClick={acceptValid} disabled={totals.accepted === 0 || accepted}>
                {accepted ? "Accepted" : `Accept ${totals.accepted} valid rows`}
              </button>
            </div>
          )}
        </div>
      </div>

      {!rows && <Empty title="No file yet.">Use the sample file to see how each row is checked.</Empty>}

      {rows && (
        <div className="card">
          <div className="filters">
            <div className="label">Row results · {fileName}</div>
            {Object.keys(fixes).length > 0 && (
              <button className="primary small" onClick={recheck}>Recheck {Object.keys(fixes).length} corrected row(s)</button>
            )}
          </div>
          <div className="table-scroll">
            <table className="tbl wide">
              <thead>
                <tr><th>Line</th><th>APAAR ID</th><th>Name</th><th>Category</th><th>Date</th><th>Status</th><th>Why</th></tr>
              </thead>
              <tbody>
                {results.map(r => {
                  const needsId = r.failed.includes("MISSING_ID") || r.failed.includes("FORMAT");
                  return (
                    <tr key={r.row.line} className={r.status !== "accepted" ? "flagged-row" : ""}>
                      <td className="num">{r.row.line}</td>
                      <td>
                        {needsId ? (
                          <input
                            className="id-input"
                            placeholder="AP + 8 digits"
                            value={fixes[r.row.line] ?? r.row.apaar}
                            onChange={e => setFixes(f => ({ ...f, [r.row.line]: e.target.value }))}
                            aria-label={`APAAR ID for line ${r.row.line}`}
                          />
                        ) : <code>{maskApaar(r.row.apaar)}</code>}
                      </td>
                      <td>{r.row.name}</td>
                      <td>{r.row.category || "—"}</td>
                      <td className="small">{r.row.admissionDate || "—"}</td>
                      <td><Chip tone={TONE[r.status]}>{LABEL[r.status]}</Chip></td>
                      <td className="small">{r.reasons.length ? r.reasons.join("; ") : "Clean row"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="small muted">
            Rules: {Object.values(RULES).map(r => `${r.code} v${r.version}`).join(" · ")}
          </div>
        </div>
      )}

      {accepted && <div className="card ok-note">Accepted rows are now counted as active. Errors stay in the file for correction, and nothing was dropped silently.</div>}
    </section>
  );
}
