import { useState } from "react";
import { useStore } from "../store";
import { STUDENT, type Consent as ConsentRecord } from "../data/seed";
import { Chip, Empty, PageHead } from "../components/ui";

// The student's own view: who verified the record, when, why, and the power to stop it.
export function Consent() {
  const { consents, setConsents, log, toast, session } = useStore();
  const [correction, setCorrection] = useState("");
  const [sent, setSent] = useState(false);
  const mine = consents.filter(c => c.studentRef === STUDENT.ref);

  const setStatus = (c: ConsentRecord, status: ConsentRecord["status"]) => {
    const prev = c.status;
    setConsents(cs => cs.map(x => (x.id === c.id ? { ...x, status } : x)));
    void log(status === "revoked" ? "consent.revoked" : "consent.restored", `${c.id} · ${c.requester}`);
    toast(status === "revoked" ? `Access revoked for ${c.requester}.` : `Access restored for ${c.requester}.`, () => {
      setConsents(cs => cs.map(x => (x.id === c.id ? { ...x, status: prev } : x)));
      void log("consent.undo", `${c.id} · ${c.requester}`);
    });
  };

  const sendCorrection = () => {
    if (!correction.trim()) return;
    void log("correction.requested", `${STUDENT.studentId} · ${correction.trim().slice(0, 80)}`);
    setCorrection("");
    setSent(true);
    toast("Correction request sent to your institution.");
  };

  return (
    <section>
      <PageHead
        eyebrow={`Signed in as ${session?.name ?? "student"} · record ${STUDENT.apaar.slice(0, 2)}••••••${STUDENT.apaar.slice(-2)}`}
        title="Who has verified my record"
      />
      <p className="muted">Each request shows who asked, why, and what they were told. You can stop access at any time.</p>

      <div className="grid-2">
        <div className="card">
          <div className="label">Requests and access</div>
          {mine.length === 0 && <Empty title="No one has asked to verify your record." />}
          {mine.map(c => (
            <div key={c.id} className="consent-row">
              <div className="row between wrap">
                <b>{c.requester}</b>
                <Chip tone={c.status === "granted" ? "ok" : "neutral"}>{c.status === "granted" ? "access on" : "access stopped"}</Chip>
              </div>
              <div className="small"><b>Asked for:</b> {c.claim}</div>
              <div className="small muted"><b>Purpose:</b> {c.purpose} · {c.at}</div>
              <div className="small muted">They received one signed yes or no. Your full record was not shared.</div>
              <div className="row">
                {c.status === "granted"
                  ? <button className="danger" onClick={() => setStatus(c, "revoked")}>Stop access</button>
                  : <button onClick={() => setStatus(c, "granted")}>Restore access</button>}
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="label">Something looks wrong?</div>
          <p className="small muted">Ask your institution to correct your record. The request is logged with the time it was sent.</p>
          <textarea
            value={correction}
            onChange={e => setCorrection(e.target.value)}
            placeholder="For example: my programme should read 2026-27, not 2025-26."
            rows={4}
            aria-label="Correction request"
          />
          <div className="row">
            <button className="primary" onClick={sendCorrection} disabled={!correction.trim()}>Send correction request</button>
          </div>
          {sent && <div className="small ok">Sent. You will see the status here.</div>}
        </div>
      </div>
    </section>
  );
}
