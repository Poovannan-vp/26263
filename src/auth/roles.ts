// Roles, permissions and demo users. Authentication is simulated in this prototype;
// production would use real OTP sign-in and a managed role store.

export type Role = "college" | "aicte" | "student" | "verifier" | "regulator" | "sysadmin";

export type Perm =
  | "upload"
  | "benchmark.run"
  | "view.own_institution"
  | "view.national"
  | "flags.view_own"
  | "flags.review"
  | "duplicates.view"
  | "reports.export"
  | "record.view_own"
  | "consent.manage"
  | "certificate.view"
  | "claim.request"
  | "credential.revoke"
  | "users.manage";

export const PERM_LABEL: Record<Perm, string> = {
  "upload": "Upload student records",
  "benchmark.run": "Run load test",
  "view.own_institution": "View own institution",
  "view.national": "View all institutions",
  "flags.view_own": "View flags for own institution",
  "flags.review": "Dismiss or escalate flags",
  "duplicates.view": "See cross-institution matches (masked)",
  "reports.export": "Export reports",
  "record.view_own": "View own academic record",
  "consent.manage": "See who verified and revoke access",
  "certificate.view": "View and print certificate",
  "claim.request": "Request a verifiable claim",
  "credential.revoke": "Revoke a credential",
  "users.manage": "Manage users and permissions",
};

export const ROLE_INFO: Record<Role, { label: string; blurb: string; user: string; scope: string; perms: Perm[] }> = {
  college: {
    label: "College administrator",
    blurb: "Uploads and fixes your institution's records. Sees only your own institution.",
    user: "Dr. Asha Rao, Registrar",
    scope: "Demo Institute of Technology",
    perms: ["upload", "benchmark.run", "view.own_institution", "flags.view_own", "reports.export", "certificate.view"],
  },
  aicte: {
    label: "AICTE official",
    blurb: "Monitors all institutions, reviews flags, and revokes credentials when needed.",
    user: "R. Menon, AICTE Regional Office",
    scope: "All institutions",
    perms: ["view.national", "view.own_institution", "flags.view_own", "flags.review", "duplicates.view", "reports.export", "credential.revoke", "benchmark.run"],
  },
  student: {
    label: "Student",
    blurb: "Sees your own record, who verified it, and can revoke access.",
    user: "Student 1042 (ref-7f3a9c)",
    scope: "Own record only",
    perms: ["record.view_own", "consent.manage", "certificate.view"],
  },
  verifier: {
    label: "Employer or verifier",
    blurb: "Asks for one claim with a stated purpose and gets a signed yes or no.",
    user: "HR, Ramesh Industries",
    scope: "Claims only",
    perms: ["claim.request"],
  },
  regulator: {
    label: "Other regulatory body",
    blurb: "Runs national reports. Sees aggregates, never individual student records.",
    user: "Policy analyst, regulatory body (demo)",
    scope: "Aggregates only",
    perms: ["view.national", "reports.export"],
  },
  sysadmin: {
    label: "System administrator",
    blurb: "Manages users and settings. Cannot open student records.",
    user: "IT administrator (demo)",
    scope: "Users and settings",
    perms: ["users.manage"],
  },
};

export const ROLE_ORDER: Role[] = ["college", "aicte", "student", "verifier", "regulator", "sysadmin"];

// the page each role lands on after sign-in
export const LANDING: Record<Role, Page> = {
  college: "upload",
  aicte: "dashboard",
  student: "consent",
  verifier: "verifier",
  regulator: "national",
  sysadmin: "admin",
};

export function allows(role: Role | undefined, perm: Perm): boolean {
  return !!role && ROLE_INFO[role].perms.includes(perm);
}

// A page opens if the user holds any of these permissions (empty list = open to everyone).
export type Page =
  | "home" | "demo" | "login" | "denied" | "upload" | "benchmark" | "institution" | "national"
  | "dashboard" | "verifier" | "consent" | "certificate" | "reports" | "admin" | "scale";

export const PAGE_GATE: Record<Page, Perm[]> = {
  home: [], demo: [], login: [], denied: [], verifier: [], scale: [],
  upload: ["upload"],
  benchmark: ["benchmark.run"],
  institution: ["view.own_institution", "view.national"],
  national: ["view.national"],
  dashboard: ["flags.view_own", "view.national"],
  consent: ["consent.manage"],
  certificate: ["certificate.view"],
  reports: ["reports.export"],
  admin: ["users.manage"],
};

export function pageAllowed(role: Role | undefined, page: Page): boolean {
  const gate = PAGE_GATE[page];
  if (gate.length === 0) return true;
  return gate.some(p => allows(role, p));
}

export function pageNeedsSignIn(page: Page): boolean {
  return PAGE_GATE[page].length > 0;
}
