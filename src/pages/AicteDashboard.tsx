import { useEffect, useMemo, useState } from "react";
import { useStore } from "../store";
import { DUPLICATE_SEED, INSTITUTIONS, type Flag } from "../data/seed";
import { ghostSeats, GHOST_RULE } from "../engine/rules";
import { scopedInstitutions, activeOf, utilisation } from "../engine/programme";
import { keyedRef, maskApaar } from "../engine/format";
import { SeatLedger } from "../components/SeatLedger";
import { ForecastChart } from "../components/ForecastChart";
import { Chip, Confirm, Empty, PageHead, type Tone } from "../components/ui";
import { tr } from "../i18n";

const RULE_FAMILIES = ["All rules", "GS", "BR", "DQ"] as const;

const FLAG_TONE: Record<Flag["state"], Tone> = { open: "flag", dismissed: "neutral", escalated: "warn" };

export function AicteDashboard() {
  const store = useStore();
  const { session, can, flags, setFlags, bumpClosed, toast, log, audit, auditVersion, activeDelta, lang } = store;
  const t = (k: string) => tr(lang, k);

  const scope = scopedInstitutions(session?.institutionId, can("view.national"));
  const programmes = useMemo(() => scope.flatMap(i => i.programmes.map(p => ({ inst: i, prog: p }))), [scope]);

  const [progId, setProgId] = useState(programmes[0]?.prog.id ?? "");
  const [ruleFilter, setRuleFilter] = useState<(typeof RULE_FAMILIES)[number]>("All rules");
  const [progFilter, setProgFilter] = useState("all");
  const [sortAsc, setSortAsc] = useState(true);
  const [confirming, setConfirming] = useState<Flag | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [integrity, setIntegrity] = useState<number | null>(null);

  useEffect(() => { audit.verify().then(setIntegrity); }, [audit, auditVersion]);

  const selected = programmes.find(p => p.prog.id === progId) ?? programmes[0];
  const scopeIds = new Set(scope.map(i => i.id));
  const scopedFlags = flags.filter(f => scopeIds.has(f.instId));

  const visibleFlags = scopedFlags
    .filter(f => progFilter === "all" || f.progId === progFilter)
    .filter(f => ruleFilter === "All rules" || f.rule.startsWith(ruleFilter))
    .sort((a, b) => (sortAsc ? a.days - b.days : b.days - a.days));

  const waiting = scopedFlags.filter(f => f.state === "open").length;
  const minutes = selected ? INSTITUTIONS.find(i => i.id === selected.inst.id)?.lastSyncedMinutes ?? 0 : 0;

  const setState = (f: Flag, state: Flag["state"], reason: string) => {
    setFlags(fs => fs.map(x => (x.id === f.id ? { ...x, state, reason } : x)));
    if (state !== "open") bumpClosed();
    void log(`flag.${state}`, `${f.rule} · ${f.title} · reason: ${reason}`);
  };

  const dismiss = (f: Flag, reason: string) => {
    const prev = f;
    setState(f, "dismissed", reason);
    setConfirming(null);
    toast("Flag dismissed.", () => {
      setFlags(fs => fs.map(x => (x.id === prev.id ? prev : x)));
      void log("flag.restored", `${f.rule} · ${f.title} · undo`);
    });
  };

  const escalate = (f: Flag) => {
    const prev = f;
    setState(f, "escalated", f.reason);
    toast("Escalated to review. Reason saved.", () => {
      setFlags(fs => fs.map(x => (x.id === prev.id ? prev : x)));
      void log("flag.restored", `${f.rule} · ${f.title} · undo`);
    });
  };

  const addNote = (f: Flag) => {
    const text = (drafts[f.id] ?? "").trim();
    if (!text) return;
    const note = { author: session ? `${session.name}` : "Officer", at: new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }), text };
    setFlags(fs => fs.map(x => (x.id === f.id ? { ...x, notes: [...x.notes, note] } : x)));
    setDrafts(d => ({ ...d, [f.id]: "" }));
    void log("flag.note", `${f.rule} · note added`);
    toast("Note saved.");
  };

  const reviewDuplicate = (ref: string) => {
    void log("duplicate.reviewed", `${ref} · match details withheld`);
    toast("Marked for review. Details stay withheld.");
  };

  if (!selected) return <Empty title="No programmes in your scope." />;

  const act = activeOf(selected.prog, activeDelta);
  const cats = selected.prog;

  return (
    <section className="dash">
      <PageHead
        eyebrow={`${selected.inst.name} · ${selected.inst.state} · ${selected.inst.type}`}
        title={selected.prog.name}
        right={
          <div className="queue">
            <span><b>{waiting}</b> waiting</span>
            <span><b>{store.closedToday}</b> done today</span>
            <span className="muted small">last synced {minutes} min ago</span>
          </div>
        }
      />

      <div className="row wrap">
        <label className="field inline">
          <span>Programme</span>
          <select value={selected.prog.id} onChange={e => setProgId(e.target.value)}>
            {programmes.map(p => <option key={p.prog.id} value={p.prog.id}>{p.inst.name} · {p.prog.name}</option>)}
          </select>
        </label>
        <span className="muted small">Intake {selected.prog.intake} · reported {selected.prog.reported} · active {act}</span>
      </div>

      <div className="grid-2">
        <div className="card"><SeatLedger prog={selected.prog} active={act} /></div>
        <div className="card"><ForecastChart prog={selected.prog} /></div>
      </div>

      <div className="grid-4">
        <Metric label="Supernumerary seats" value={cats.supernumerary} note="Seats beyond approved intake, filled under rule." />
        <Metric label="NRI category" value={cats.nri} note="Non-resident Indian admissions." />
        <Metric label="OCI status" value={cats.oci} note="Overseas Citizen of India admissions." />
        <Metric label="Foreign national (FN)" value={cats.fn} note="Foreign national admissions." />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="filters">
            <div className="label">Flag queue · explained, never convicted</div>
            <div className="row wrap">
              <select value={progFilter} onChange={e => setProgFilter(e.target.value)} aria-label="Filter by programme">
                <option value="all">All programmes</option>
                {programmes.map(p => <option key={p.prog.id} value={p.prog.id}>{p.prog.name}</option>)}
              </select>
              <select value={ruleFilter} onChange={e => setRuleFilter(e.target.value as (typeof RULE_FAMILIES)[number])} aria-label="Filter by rule">
                {RULE_FAMILIES.map(r => <option key={r}>{r}</option>)}
              </select>
              <button onClick={() => setSortAsc(s => !s)} aria-label="Sort by days to deadline">
                Days to deadline {sortAsc ? "↑" : "↓"}
              </button>
            </div>
          </div>

          {visibleFlags.length === 0 && <Empty title="No flags match these filters.">Clear a filter to see the rest of the queue.</Empty>}

          {visibleFlags.map(f => {
            const progName = scope.flatMap(i => i.programmes).find(p => p.id === f.progId)?.name ?? f.progId;
            const canReview = can("flags.review");
            return (
              <div key={f.id} className={`flagcard ${f.state}`}>
                <div className="flag-head">
                  <b>{f.title}</b>
                  <span className="rule" title="Rule code and version">{f.rule}</span>
                </div>
                <div className="small muted">{progName} · {f.days} days to deadline</div>
                <p className="small">{f.evidence}</p>
                <div className="row wrap">
                  <Chip tone={FLAG_TONE[f.state]}>{f.state}</Chip>
                  <span className="small muted">Reason: {f.reason}</span>
                </div>

                {f.notes.length > 0 && (
                  <ul className="notes">
                    {f.notes.map((n, i) => (
                      <li key={i}><b>{n.author}</b> <span className="muted small">{n.at}</span><div>{n.text}</div></li>
                    ))}
                  </ul>
                )}
                <div className="row wrap">
                  <input
                    className="note-input"
                    placeholder="Add a note for the file"
                    value={drafts[f.id] ?? ""}
                    onChange={e => setDrafts(d => ({ ...d, [f.id]: e.target.value }))}
                    aria-label={`Note for ${f.title}`}
                  />
                  <button onClick={() => addNote(f)}>Add note</button>
                </div>

                {f.state === "open" && canReview && (
                  <div className="row">
                    <button onClick={() => setConfirming(f)}>Dismiss…</button>
                    <button className="primary" onClick={() => escalate(f)}>Escalate</button>
                  </div>
                )}
                {f.state === "open" && !canReview && (
                  <div className="small muted">Read only for your role. Only AICTE officers can dismiss or escalate.</div>
                )}
              </div>
            );
          })}
        </div>

        <div className="stack">
          {can("duplicates.view") && (
            <div className="card">
              <div className="label">Cross-institution matches · masked</div>
              {DUPLICATE_SEED.filter(d => d.state === "open").map(d => (
                <div key={d.ref} className="dup">
                  <div><code>{d.ref}</code> <Chip tone="warn">match</Chip></div>
                  <div className="small muted">
                    Found in {d.instIds.length} institutions. Other colleges' records are not shown.
                  </div>
                  <div className="row">
                    <button onClick={() => reviewDuplicate(d.ref)}>Mark for review</button>
                  </div>
                </div>
              ))}
              <div className="small muted">Matches use a keyed reference (e.g. {keyedRef("AP10428841")}), never the raw APAAR ID.</div>
            </div>
          )}

          <div className="card">
            <div className="label">Audit chain · hash-linked</div>
            <div className={`integrity ${integrity === -1 ? "ok" : "bad"}`}>
              {integrity === null ? "checking…" : integrity === -1 ? "✓ chain intact" : `✗ broken at entry ${integrity + 1}`}
            </div>
            {audit.entries.length === 0 && <div className="small muted">No decisions yet. Actions you take appear here.</div>}
            <ol className="chain">
              {audit.entries.slice(-5).reverse().map(e => (
                <li key={e.n}>
                  <code>#{e.n} {e.action}</code>
                  <div className="small muted">{e.actor}</div>
                  <div className="small">{e.detail}</div>
                  <code className="hash">{e.hash.slice(0, 12)}… ← {e.prevHash.slice(0, 6)}…</code>
                </li>
              ))}
            </ol>
          </div>

          <div className="card">
            <div className="label">Utilisation in scope</div>
            <table className="tbl">
              <tbody>
                {scope.flatMap(i => i.programmes).map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td className="num">{utilisation(activeOf(p, activeDelta), p.intake)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="small muted">Example masked record: {maskApaar("AP10428841")}</div>
          </div>
        </div>
      </div>

      {confirming && (
        <Confirm
          title="Dismiss this flag?"
          confirmLabel="Dismiss flag"
          danger
          onCancel={() => setConfirming(null)}
          onConfirm={() => dismiss(confirming, confirming.reason)}
        >
          <p className="small">{confirming.title}. The reason below is saved in the audit chain. You can undo for a few seconds after dismissing.</p>
          <div className="small"><b>Reason:</b> {confirming.reason}</div>
          <div className="small muted">Ghost-seat rule {GHOST_RULE.code} v{GHOST_RULE.version}: {ghostSeats(cats.reported, cats.active)} seats are unverified.</div>
        </Confirm>
      )}
    </section>
  );
}

function Metric({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div className="card metric">
      <div className="label">{label}</div>
      <div className="big">{value}</div>
      <div className="small muted">{note}</div>
    </div>
  );
}
