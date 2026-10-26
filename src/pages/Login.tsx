import { useState } from "react";
import { useStore } from "../store";
import { ROLE_INFO, ROLE_ORDER, PERM_LABEL, LANDING, type Page, type Role } from "../auth/roles";
import { INSTITUTIONS } from "../data/seed";
import { PageHead } from "../components/ui";

// Demo one-time code for the student sign-in. Shown on screen on purpose, so it works in a recording.
const DEMO_OTP = "482913";

export function Login({ onSignedIn }: { onSignedIn: (p: Page) => void }) {
  const { signIn, toast, session } = useStore();
  const [picked, setPicked] = useState<Role | null>(null);
  const [instId, setInstId] = useState("dit");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState(false);

  const finish = (role: Role) => {
    signIn({
      role,
      name: ROLE_INFO[role].user,
      institutionId: role === "college" ? instId : undefined,
    });
    toast(`Signed in as ${ROLE_INFO[role].label}`);
    onSignedIn(LANDING[role]);
  };

  const choose = (role: Role) => {
    setOtp("");
    setOtpError(false);
    if (role === "student") {
      setPicked(role);
      return;
    }
    finish(role);
  };

  const verifyOtp = () => {
    if (otp.trim() === DEMO_OTP) {
      finish("student");
    } else {
      setOtpError(true);
    }
  };

  return (
    <section className="login">
      <PageHead
        eyebrow="Sign in · choose your role"
        title="Who is signing in?"
        right={session ? <span className="muted small">Signed in as {ROLE_INFO[session.role].label}</span> : undefined}
      />
      <p className="muted">
        Each role sees only what it needs. Pick a role to see its permissions, then sign in.
        This prototype simulates sign-in; production uses one-time codes and a managed role store.
      </p>

      <div className="role-grid">
        {ROLE_ORDER.map(role => {
          const info = ROLE_INFO[role];
          const active = picked === role;
          return (
            <div key={role} className={`card role-card ${active ? "on" : ""}`}>
              <div className="label">{info.scope}</div>
              <h3>{info.label}</h3>
              <p className="small muted">{info.blurb}</p>
              <ul className="perms">
                {info.perms.map(p => <li key={p}>✓ {PERM_LABEL[p]}</li>)}
                {info.perms.length === 0 && <li className="muted">No actions</li>}
              </ul>
              <div className="small muted">Demo user: {info.user}</div>

              {role === "college" && (
                <label className="field">
                  <span>Institution</span>
                  <select value={instId} onChange={e => setInstId(e.target.value)} aria-label="Institution">
                    {INSTITUTIONS.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </label>
              )}

              {role === "student" && active ? (
                <div className="otp">
                  <div className="small">One-time code sent to your registered contact (demo code shown):</div>
                  <div className="otp-code" aria-label="Demo one-time code">{DEMO_OTP}</div>
                  <input
                    value={otp}
                    onChange={e => { setOtp(e.target.value); setOtpError(false); }}
                    placeholder="Enter 6-digit code"
                    inputMode="numeric"
                    maxLength={6}
                    aria-label="One-time code"
                    aria-invalid={otpError}
                  />
                  {otpError && <div className="warn small">That code does not match. Try again.</div>}
                  <button className="primary" onClick={verifyOtp}>Verify and sign in</button>
                </div>
              ) : (
                <button className="primary" onClick={() => choose(role)}>
                  {role === "student" ? "Sign in with one-time code" : `Sign in as ${info.label}`}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
