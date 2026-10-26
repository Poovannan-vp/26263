import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useStore } from "../store";
import { INSTITUTIONS, PROGRAMME, STUDENT } from "../data/seed";
import { PageHead } from "../components/ui";

// A certificate printed with the APAAR ID next to the student ID, as the brief asks.
export function Certificate() {
  const { log, toast } = useStore();
  const [qr, setQr] = useState<string | null>(null);
  const inst = INSTITUTIONS.find(i => i.id === STUDENT.instId);
  const verifyRef = `https://verify.example/c/${STUDENT.studentId.replace(/\//g, "-")}`;

  useEffect(() => {
    QRCode.toDataURL(verifyRef, { margin: 1, width: 150, color: { dark: "#0B1220", light: "#FFFFFF" } }).then(setQr);
  }, [verifyRef]);

  const print = () => {
    void log("certificate.printed", `${STUDENT.studentId} · APAAR and student ID shown`);
    toast("Opening print dialog. Choose 'Save as PDF' to keep a copy.");
    window.print();
  };

  return (
    <section>
      <PageHead
        eyebrow="Degree-awarding body · certificate"
        title="Certificate preview"
        right={<button className="primary" onClick={print}>Print or save as PDF</button>}
      />
      <div className="certificate" id="certificate">
        <div className="cert-head">
          <div>
            <div className="cert-inst">{inst?.name ?? "Institution"}</div>
            <div className="small muted">{inst?.state} · approved by AICTE (synthetic)</div>
          </div>
          <div className="small muted">Certificate no. {STUDENT.studentId}</div>
        </div>
        <div className="cert-title">Certificate of Completion</div>
        <p className="cert-body">
          This certifies that <b>{STUDENT.name}</b> has completed the <b>{PROGRAMME.name}</b> programme
          in the academic year {PROGRAMME.year}.
        </p>
        <div className="cert-ids">
          <div><div className="label">Student ID</div><div className="big">{STUDENT.studentId}</div></div>
          <div><div className="label">APAAR ID</div><div className="big">{STUDENT.apaar}</div></div>
        </div>
        <div className="cert-foot">
          {qr && <img src={qr} alt="QR code to verify this certificate" className="qr-small" />}
          <div className="small muted">
            Scan to check this certificate's authenticity and revocation status. The verifier sees only the claim
            "holds a B.Tech in Computer Science from an approved institution", not the full record.
          </div>
        </div>
      </div>
      <p className="small muted">Synthetic certificate for demonstration only.</p>
    </section>
  );
}
