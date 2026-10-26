import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useStore } from "../store";
import { createSigner, issue, checkCredential, revoked, type Credential, type Signer } from "../engine/crypto";
import { ROLE_INFO } from "../auth/roles";
import { STUDENT, PROGRAMME } from "../data/seed";
import { maskApaar } from "../engine/format";
import { PageHead } from "../components/ui";

const CLAIMS = [
  "holds a B.Tech in Computer Science from an approved institution",
  "completed the programme in 2026-27",
];

// Anyone can scan a credential. Only an employer or verifier can request one.
// Only an AICTE official can revoke one.
export function Verifier() {
  const { can, setConsents, log, toast, session } = useStore();
  const [signer, setSigner] = useState<Signer | null>(null);
  const [claim, setClaim] = useState(CLAIMS[0]);
  const [purpose, setPurpose] = useState("Employment background check");
  const [cred, setCred] = useState<Credential | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [scan, setScan] = useState<string | null>(null);
  const [isRevoked, setIsRevoked] = useState(false);

  useEffect(() => { createSigner().then(setSigner); }, []);

  const request = async () => {
    if (!signer || !can("claim.request")) return;
    const c = await issue(signer, {
      id: "CRED-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      student: STUDENT.ref,
      claim, purpose,
      issuer: "AICTE (simulated)",
      issuedAt: new Date().toISOString(),
      result: "yes",
    });
    setCred(c);
    setIsRevoked(false);
    setScan(null);
    const payload = JSON.stringify(c);
    setQr(await QRCode.toDataURL(payload, { margin: 1, width: 220, color: { dark: "#0B1220", light: "#FFFFFF" } }));

    // the student sees this request on their consent page
    setConsents(cs => [{
      id: "REQ-" + c.claim.id.slice(-4),
      studentRef: STUDENT.ref,
      requester: ROLE_INFO.verifier.user,
      purpose,
      claim,
      at: new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      status: "granted",
    }, ...cs]);
    void log("claim.issued", `${c.claim.id} · purpose: ${purpose}`);
    toast("Signed claim issued. The student can see this request.");
  };

  const runScan = async () => {
    if (!signer || !cred) return;
    // reads the credential back as a scanner would, then checks signature and revocation
    const parsed = JSON.parse(JSON.stringify(cred)) as Credential;
    const result = await checkCredential(signer, parsed);
    setScan(result);
    void log("claim.scanned", `${parsed.claim.id} → ${result}`);
  };

  const toggleRevoke = () => {
    if (!cred || !can("credential.revoke")) return;
    const id = cred.claim.id;
    const next = !revoked.has(id);
    if (next) revoked.add(id); else revoked.delete(id);
    setIsRevoked(next);
    setScan(null);
    void log(next ? "claim.revoked" : "claim.reinstated", id);
    toast(next ? "Credential revoked. Scans now fail." : "Credential reinstated.");
  };

  return (
    <section className="verify">
      <PageHead
        eyebrow="Verifier portal · minimum disclosure"
        title="Request one claim"
        right={<span className="muted small">signer: {signer ? signer.kind : "starting…"}{session ? ` · signed in as ${ROLE_INFO[session.role].label}` : " · not signed in"}</span>}
      />

      <div className="grid-2">
        <div className="card">
          <div className="label">Full record (held by the institution)</div>
          <div className="record">
            <div><b>Name</b> <span className="blur">{"Student 1042"}</span></div>
            <div><b>APAAR ID</b> <span className="blur">{maskApaar(STUDENT.apaar)}</span></div>
            <div><b>Programme</b> <span className="blur">{PROGRAMME.name} · {PROGRAMME.year}</span></div>
            <div><b>Fees paid</b> <span className="blur">₹ 1,20,000</span></div>
            <div><b>Exam results</b> <span className="blur">Sem 1–3 · 8.4 CGPA</span></div>
          </div>
          <div className="small muted">Withheld from the verifier. Only the claim leaves the system.</div>
        </div>

        <div className="card">
          <div className="label">Claim request</div>
          {!can("claim.request") && (
            <div className="notice">Your role cannot request claims. Sign in as an employer or verifier to try this.</div>
          )}
          <label className="field">
            <span>Claim</span>
            <select value={claim} onChange={e => setClaim(e.target.value)} disabled={!can("claim.request")}>
              {CLAIMS.map(c => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Purpose (logged)</span>
            <input value={purpose} onChange={e => setPurpose(e.target.value)} disabled={!can("claim.request")} />
          </label>
          <button className="primary" onClick={request} disabled={!signer || !can("claim.request")}>Request signed claim</button>
        </div>
      </div>

      {cred && qr && (
        <div className="grid-2">
          <div className="card reveal">
            <div className="label">Signed result</div>
            <div className={`verdict ${isRevoked ? "bad" : "ok"}`}>{isRevoked ? "REVOKED" : "YES"}</div>
            <div className="small">"{cred.claim.claim}"</div>
            <div className="small muted">purpose: {cred.claim.purpose} · issued {new Date(cred.claim.issuedAt).toLocaleTimeString("en-IN")}</div>
            <code className="sig">{cred.signature.slice(0, 48)}…</code>
            <div className="row wrap">
              <button onClick={runScan}>Scan QR</button>
              <button onClick={toggleRevoke} disabled={!can("credential.revoke")} title={can("credential.revoke") ? "" : "Only AICTE officers can revoke"}>
                {isRevoked ? "Reinstate" : "Revoke credential"}
              </button>
            </div>
            {!can("credential.revoke") && <div className="small muted">Revoking is limited to AICTE officers.</div>}
            {scan && (
              <div className={`scan ${scan === "VALID" ? "ok" : "bad"}`}>
                Scan result: {scan === "VALID" ? "✓ VALID" : scan === "REVOKED" ? "✗ REVOKED" : "✗ INVALID"}
              </div>
            )}
          </div>
          <div className="card reveal">
            <div className="label">Verifiable credential</div>
            <div className="qr-wrap">
              <img src={qr} alt="QR code of the signed claim" className="qr" />
              {!isRevoked && <div className="stamp">VERIFIED</div>}
            </div>
            <div className="small muted">Scan offline. A revoked credential fails here.</div>
          </div>
        </div>
      )}
    </section>
  );
}
