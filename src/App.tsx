import { useEffect, useState } from "react";
import { StoreProvider, useStore } from "./store";
import { ROLE_INFO, PAGE_GATE, LANDING, pageAllowed, pageNeedsSignIn, type Page } from "./auth/roles";
import { INSTITUTIONS } from "./data/seed";
import { tr } from "./i18n";
import { Toasts } from "./components/ui";
import { Home } from "./home/Home";
import { Login } from "./pages/Login";
import { Stepper } from "./demo/Stepper";
import { AicteDashboard } from "./pages/AicteDashboard";
import { National } from "./pages/National";
import { Institution } from "./pages/Institution";
import { Upload } from "./pages/Upload";
import { UploadBenchmark } from "./pages/UploadBenchmark";
import { Verifier } from "./pages/Verifier";
import { Consent } from "./pages/Consent";
import { Certificate } from "./pages/Certificate";
import { Reports } from "./pages/Reports";
import { Admin } from "./pages/Admin";
import { Scale } from "./pages/Scale";

const NAV: { page: Page; key: string }[] = [
  { page: "home", key: "home" },
  { page: "demo", key: "demo" },
  { page: "dashboard", key: "dashboard" },
  { page: "national", key: "national" },
  { page: "institution", key: "institution" },
  { page: "upload", key: "upload" },
  { page: "benchmark", key: "benchmark" },
  { page: "verifier", key: "verifier" },
  { page: "consent", key: "consent" },
  { page: "certificate", key: "certificate" },
  { page: "reports", key: "reports" },
  { page: "admin", key: "admin" },
  { page: "scale", key: "scale" },
];

// ?view=dashboard opens a page directly; the access check still applies on the way in
function requestedPage(): Page | null {
  const v = new URLSearchParams(window.location.search).get("view") as Page | null;
  return v && (v === "login" || NAV.some(n => n.page === v)) ? v : null;
}

export function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}

function Shell() {
  const store = useStore();
  const { session, signOut, lang, setLang, theme, setTheme, log, toast } = store;
  const [page, setPage] = useState<Page>("home");
  const [deniedFrom, setDeniedFrom] = useState<Page | null>(null);
  const t = (k: string) => tr(lang, k);
  const role = session?.role;

  const go = (target: Page) => {
    if (pageAllowed(role, target)) {
      setPage(target);
      return;
    }
    if (!session && pageNeedsSignIn(target)) {
      setPage("login");
      return;
    }
    // signed in, but the role does not allow this page: say so and log the attempt
    void log("access.denied", `${ROLE_INFO[role!].label} tried to open ${target}`);
    toast(`${ROLE_INFO[role!].label}: this page is not permitted for your role.`);
    setDeniedFrom(target);
    setPage("denied");
  };

  // open the page from the link, if there is one
  useEffect(() => {
    const req = requestedPage();
    if (req && req !== "home") go(req);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSignedIn = (target: Page) => setPage(target);

  const onSignOut = () => {
    signOut();
    setPage("home");
  };

  return (
    <div className="app">
      <header className="top">
        <div className="brand">APAAR INTAKE GUARD</div>
        <nav className="nav" aria-label="Main">
          {NAV.map(n => {
            const locked = !!session && !pageAllowed(role, n.page) && PAGE_GATE[n.page].length > 0;
            return (
              <button
                key={n.page}
                className={`${page === n.page ? "on" : ""} ${locked ? "locked" : ""}`}
                onClick={() => go(n.page)}
                aria-label={locked ? `${t(n.key)} (${t("locked")})` : t(n.key)}
              >
                {locked && <span aria-hidden="true">🔒 </span>}
                {t(n.key)}
              </button>
            );
          })}
        </nav>
        <div className="top-right">
          <button className="ghost small" onClick={() => setLang(lang === "en" ? "hi" : "en")} aria-label="Change language">
            {lang === "en" ? "हिन्दी" : "English"}
          </button>
          <button className="ghost small" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label="Toggle theme">
            {theme === "light" ? "Dark" : "Light"}
          </button>
          {session ? (
            <div className="session">
              <span className="role-badge">
                <b>{ROLE_INFO[session.role].label}</b>
                <span className="muted small"> · {session.role === "college"
                  ? INSTITUTIONS.find(i => i.id === session.institutionId)?.name ?? ROLE_INFO.college.scope
                  : ROLE_INFO[session.role].scope}</span>
              </span>
              <button className="ghost small" onClick={onSignOut}>{t("signout")}</button>
            </div>
          ) : (
            <button className="primary small" onClick={() => setPage("login")}>{t("signin")}</button>
          )}
        </div>
      </header>

      <div className="sim-banner">{t("simulated")} · authentication is simulated in this prototype</div>

      <main className="main" key={page}>
        {page === "home" && <Home onNavigate={go} />}
        {page === "login" && <Login onSignedIn={onSignedIn} />}
        {page === "denied" && (
          <div className="card denied">
            <div className="label">{t("locked")}</div>
            <h2>{session ? `${ROLE_INFO[session.role].label} cannot open this page` : "Sign in first"}</h2>
            <p className="muted">
              {deniedFrom && `The "${deniedFrom}" page needs permissions your role does not have. The attempt has been logged in the audit chain.`}
            </p>
            <div className="row">
              <button onClick={() => setPage("home")}>Back to home</button>
              {session && <button className="primary" onClick={() => setPage(LANDING[session.role])}>Go to my page</button>}
            </div>
          </div>
        )}
        {page === "demo" && <Stepper />}
        {page === "dashboard" && <AicteDashboard />}
        {page === "national" && <National />}
        {page === "institution" && <Institution />}
        {page === "upload" && <Upload />}
        {page === "benchmark" && <UploadBenchmark />}
        {page === "verifier" && <Verifier />}
        {page === "consent" && <Consent />}
        {page === "certificate" && <Certificate />}
        {page === "reports" && <Reports />}
        {page === "admin" && <Admin />}
        {page === "scale" && <Scale />}
      </main>

      <Toasts />
    </div>
  );
}
