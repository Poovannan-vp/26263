import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AuditChain } from "./engine/audit";
import { FLAG_SEED, CONSENT_SEED, UPLOAD_SEED, type Flag, type Consent, type Upload } from "./data/seed";
import { allows, ROLE_INFO, type Perm, type Role } from "./auth/roles";
// (defaultSession is defined below and used for the ?as= deep link)
import type { Lang } from "./i18n";

export type Session = { role: Role; name: string; institutionId?: string };
export type Toast = { id: number; message: string; undo?: () => void };
export type Theme = "light" | "dark";

type Store = {
  session: Session | null;
  signIn: (s: Session) => void;
  signOut: () => void;
  can: (p: Perm) => boolean;

  audit: AuditChain;
  auditVersion: number;
  log: (action: string, detail: string) => Promise<void>;

  toasts: Toast[];
  toast: (message: string, undo?: () => void) => void;
  dismissToast: (id: number) => void;

  flags: Flag[];
  setFlags: (fn: (prev: Flag[]) => Flag[]) => void;
  closedToday: number;
  bumpClosed: () => void;

  consents: Consent[];
  setConsents: (fn: (prev: Consent[]) => Consent[]) => void;

  uploads: Upload[];
  addUpload: (u: Upload) => void;

  // seats added by accepted uploads this session, per programme
  activeDelta: Record<string, number>;
  addActive: (progId: string, n: number) => void;

  lang: Lang;
  setLang: (l: Lang) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
};

const Ctx = createContext<Store | null>(null);

export function defaultSession(role: Role): Session {
  return {
    role,
    name: ROLE_INFO[role].user,
    institutionId: role === "college" ? "dit" : undefined,
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  // ?as=college signs straight in as that role, which makes each screen easy to open and record
  const [session, setSession] = useState<Session | null>(() => {
    const as = new URLSearchParams(window.location.search).get("as");
    return as && as in ROLE_INFO ? defaultSession(as as Role) : null;
  });
  const audit = useMemo(() => new AuditChain(), []);
  const [auditVersion, setAuditVersion] = useState(0);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const [flags, setFlags] = useState<Flag[]>(FLAG_SEED);
  const [closedToday, setClosedToday] = useState(3);
  const [consents, setConsents] = useState<Consent[]>(CONSENT_SEED);
  const [uploads, setUploads] = useState<Upload[]>(UPLOAD_SEED);
  const [activeDelta, setActiveDelta] = useState<Record<string, number>>({});

  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem("aig-lang") as Lang) || "en");
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem("aig-theme") as Theme) || "light");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("aig-theme", theme);
  }, [theme]);
  useEffect(() => { localStorage.setItem("aig-lang", lang); }, [lang]);

  const log = useCallback(async (action: string, detail: string) => {
    const actor = session ? `${ROLE_INFO[session.role].label} · ${session.name}` : "anonymous";
    await audit.append(actor, action, detail);
    setAuditVersion(v => v + 1);
  }, [audit, session]);

  const dismissToast = useCallback((id: number) => {
    setToasts(ts => ts.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message: string, undo?: () => void) => {
    const id = ++toastId.current;
    setToasts(ts => [...ts.slice(-2), { id, message, undo }]);
    setTimeout(() => dismissToast(id), undo ? 6000 : 3500);
  }, [dismissToast]);

  const signIn = useCallback((s: Session) => {
    setSession(s);
    const who = ROLE_INFO[s.role].label;
    void audit.append(`${who} · ${s.name}`, "auth.login", `signed in as ${who}`).then(() => setAuditVersion(v => v + 1));
  }, [audit]);

  const signOut = useCallback(() => {
    if (session) {
      void audit.append(`${ROLE_INFO[session.role].label} · ${session.name}`, "auth.logout", "signed out")
        .then(() => setAuditVersion(v => v + 1));
    }
    setSession(null);
  }, [audit, session]);

  const can = useCallback((p: Perm) => allows(session?.role, p), [session]);

  const addUpload = useCallback((u: Upload) => setUploads(us => [u, ...us]), []);
  const addActive = useCallback((progId: string, n: number) => {
    setActiveDelta(d => ({ ...d, [progId]: (d[progId] ?? 0) + n }));
  }, []);
  const bumpClosed = useCallback(() => setClosedToday(n => n + 1), []);

  const value: Store = {
    session, signIn, signOut, can,
    audit, auditVersion, log,
    toasts, toast, dismissToast,
    flags, setFlags, closedToday, bumpClosed,
    consents, setConsents,
    uploads, addUpload,
    activeDelta, addActive,
    lang, setLang, theme, setTheme,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore must be used inside StoreProvider");
  return v;
}
