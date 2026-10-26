import { useState } from "react";
import type { Page, Role } from "../auth/roles";
import { ROLE_INFO, ROLE_ORDER } from "../auth/roles";
import { useStore } from "../store";

// The four-slide flow is the proven single-file demo. It is embedded as-is and told which role is
// watching, so its branches and badge reflect that role.
export function Home({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const { session } = useStore();
  const [role, setRole] = useState<Role>(session?.role ?? "college");

  return (
    <section className="home">
      <div className="flow-col">
        <div className="panel-title">End-to-end flow · watching as</div>
        <div className="role-tabs" role="tablist" aria-label="Flow view role">
          {ROLE_ORDER.map(r => (
            <button key={r} role="tab" aria-selected={role === r} className={role === r ? "on" : ""} onClick={() => setRole(r)}>
              {ROLE_INFO[r].label}
            </button>
          ))}
        </div>
        <iframe key={role} className="flow-frame" src={`flow/index.html?role=${role}`} title={`APAAR end-to-end flow, ${ROLE_INFO[role].label} view`} />
      </div>
      <div className="entry">
        <div className="eyebrow">SIH 2026 · PS 26263 · SMART AUTOMATION</div>
        <h1>APAAR Intake Guard</h1>
        <p className="pitch">
          AICTE sees excess admissions before they happen, explains every flag, and lets anyone verify a
          student record without seeing more than they need.
        </p>
        <div className="btns">
          <button className="primary" onClick={() => onNavigate("demo")}>▶ Start guided demo</button>
          <button onClick={() => onNavigate("dashboard")}>AICTE dashboard</button>
          <button onClick={() => onNavigate("verifier")}>Verifier portal</button>
          <button onClick={() => onNavigate("login")}>Sign in with a role</button>
        </div>
        <ul className="pillars">
          <li><b>Predict</b> · breach forecast with a range</li>
          <li><b>Explain</b> · every flag shows rule, evidence and decision trail</li>
          <li><b>Verify</b> · signed yes or no for one claim, nothing more</li>
          <li><b>Control</b> · each role sees only what it needs, and denied attempts are logged</li>
        </ul>
        <p className="small muted">Why we built this: a college's total enrolment figure should not be the only evidence AICTE has of how many students are really there.</p>
      </div>
    </section>
  );
}
