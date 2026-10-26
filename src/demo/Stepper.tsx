import { useState } from "react";
import { useStore, defaultSession } from "../store";
import type { Role } from "../auth/roles";
import { ROLE_INFO } from "../auth/roles";
import { Home } from "../home/Home";
import { AicteDashboard } from "../pages/AicteDashboard";
import { Verifier } from "../pages/Verifier";
import { UploadBenchmark } from "../pages/UploadBenchmark";
import { Upload } from "../pages/Upload";
import { Consent } from "../pages/Consent";
import type { Page } from "../auth/roles";

type Step = { key: string; title: string; body: string; role: Role; target: Page | "static" };

// Each step signs in as the role that performs it, so the demo shows the roles working together.
const STEPS: Step[] = [
  { key: "upload", title: "College uploads a batch", body: "The college checks each row. Valid rows are kept, errors are explained, and nothing is dropped silently.", role: "college", target: "upload" },
  { key: "flow", title: "The whole flow", body: "Record enters the engine, the checks run, the flow branches to each stage, and only the permitted lanes open for this role.", role: "college", target: "home" },
  { key: "forecast", title: "AICTE predicts the breach", body: "The pace of the last seven days projects a breach date, shown with its range.", role: "aicte", target: "dashboard" },
  { key: "ghost", title: "Unverified seats and flags", body: "Reported seats are not all active. Each flag shows its rule, evidence, notes and a decision trail.", role: "aicte", target: "dashboard" },
  { key: "query", title: "Ask in plain English", body: "A regulator's question maps to an approved read-only template, and the template is shown with the answer. Narrated over a static card.", role: "regulator", target: "static" },
  { key: "verify", title: "Employer asks for one claim", body: "The employer states a purpose and receives a signed yes. The full record stays withheld.", role: "verifier", target: "verifier" },
  { key: "prove", title: "Prove it, then revoke", body: "Scan the QR to check it offline. An AICTE official revokes the credential, and the same scan fails.", role: "aicte", target: "verifier" },
  { key: "consent", title: "The student sees who verified", body: "The student sees the employer's request, its purpose and what was shared, and can stop access.", role: "student", target: "consent" },
];

export function Stepper() {
  const { session, signIn, toast, log } = useStore();
  const [i, setI] = useState(0);
  const step = STEPS[i];

  // switch role when a step needs a different one
  const goTo = (n: number) => {
    const next = STEPS[n];
    if (session?.role !== next.role) {
      signIn(defaultSession(next.role));
      toast(`Signed in as ${ROLE_INFO[next.role].label}`);
      void log("demo.role_switch", `step ${n + 1}: ${ROLE_INFO[next.role].label}`);
    }
    setI(n);
  };

  const content = () => {
    switch (step.target) {
      case "upload": return <Upload />;
      case "home": return <Home onNavigate={() => undefined} />;
      case "dashboard": return <AicteDashboard />;
      case "verifier": return <Verifier />;
      case "consent": return <Consent />;
      case "benchmark": return <UploadBenchmark />;
      default:
        return (
          <div className="card static">
            <div className="label">Screen cut from this build · narrated</div>
            <h2>{step.title}</h2>
            <p className="muted">{step.body}</p>
          </div>
        );
    }
  };

  return (
    <section className="stepper">
      <div className="steps">
        {STEPS.map((s, n) => (
          <button key={s.key} className={n === i ? "on" : n < i ? "done" : ""} onClick={() => goTo(n)}>
            {n + 1}. {s.title}
          </button>
        ))}
      </div>

      <div className="ring" key={step.target}>{content()}</div>

      <div className="caption-bar">
        <div>
          <div className="label">Step {i + 1} of {STEPS.length} · {ROLE_INFO[step.role].label}</div>
          <div className="caption-title">{step.title}</div>
          <div className="muted small">{step.body}</div>
        </div>
        <div className="row">
          <button onClick={() => goTo(Math.max(0, i - 1))} disabled={i === 0}>◀ Back</button>
          <button className="primary" onClick={() => goTo(Math.min(STEPS.length - 1, i + 1))} disabled={i === STEPS.length - 1}>Next ▶</button>
        </div>
      </div>
    </section>
  );
}
