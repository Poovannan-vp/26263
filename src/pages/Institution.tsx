import { useState } from "react";
import { useStore } from "../store";
import { INSTITUTIONS, type Flag } from "../data/seed";
import { activeOf, utilisation } from "../engine/programme";
import { Chip, Empty, PageHead } from "../components/ui";

const FLAG_TONE = { open: "flag", dismissed: "neutral", escalated: "warn" } as const;

// A college sees its own institution; AICTE and regulators can pick any institution.
export function Institution() {
  const { session, can, flags, activeDelta, uploads: liveUploads } = useStore();
  const canPickAny = can("view.national");
  const [instId, setInstId] = useState(session?.institutionId ?? INSTITUTIONS[0].id);
  const inst = INSTITUTIONS.find(i => i.id === (canPickAny ? instId : session?.institutionId)) ?? INSTITUTIONS[0];

  // uploads made this session come first, then the seeded history
  const uploads = liveUploads.filter(u => u.instId === inst.id);
  const instFlags: Flag[] = flags.filter(f => f.instId === inst.id);

  return (
    <section>
      <PageHead
        eyebrow={`${inst.state} · ${inst.type} · last synced ${inst.lastSyncedMinutes} min ago`}
        title={inst.name}
        right={canPickAny ? (
          <select value={inst.id} onChange={e => setInstId(e.target.value)} aria-label="Choose institution">
            {INSTITUTIONS.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        ) : undefined}
      />

      <div className="card">
        <div className="label">Programmes</div>
        <table className="tbl wide">
          <thead>
            <tr><th>Programme</th><th className="num">Intake</th><th className="num">Active</th><th className="num">Utilisation</th><th className="num">Supernumerary</th><th className="num">NRI</th><th className="num">OCI</th><th className="num">FN</th></tr>
          </thead>
          <tbody>
            {inst.programmes.map(p => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td className="num">{p.intake}</td>
                <td className="num">{activeOf(p, activeDelta)}</td>
                <td className="num">{utilisation(activeOf(p, activeDelta), p.intake)}%</td>
                <td className="num">{p.supernumerary}</td>
                <td className="num">{p.nri}</td>
                <td className="num">{p.oci}</td>
                <td className="num">{p.fn}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="label">Upload history</div>
          {uploads.length === 0 && <Empty title="No uploads yet.">Upload a batch to see it here.</Empty>}
          {uploads.length > 0 && (
            <table className="tbl">
              <thead><tr><th>File</th><th>When</th><th className="num">Rows</th><th className="num">Accepted</th></tr></thead>
              <tbody>
                {uploads.map(u => (
                  <tr key={u.id}>
                    <td><code className="small">{u.file}</code></td>
                    <td className="small">{u.at}</td>
                    <td className="num">{u.rows}</td>
                    <td className="num">{u.accepted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <div className="label">Flag history</div>
          {instFlags.length === 0 && <Empty title="No flags for this institution." />}
          {instFlags.map(f => (
            <div key={f.id} className="history-row">
              <div><b>{f.title}</b> <span className="rule">{f.rule}</span></div>
              <div className="small muted">{f.evidence}</div>
              <div className="row"><Chip tone={FLAG_TONE[f.state]}>{f.state}</Chip>{f.notes.length > 0 && <span className="small muted">{f.notes.length} note(s)</span>}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
