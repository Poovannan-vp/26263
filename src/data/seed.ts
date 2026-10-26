// All data is synthetic and labelled as such in the UI.

// mulberry32: small seeded RNG so every run shows the same numbers
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Headline programme used by the story and by the unit tests.
export const PROGRAMME = {
  institution: "Demo Institute of Technology (synthetic)",
  institutionId: "dit",
  name: "B.Tech Computer Science",
  year: "2026-27",
  intake: 100,
  reported: 120,
  active: 96,
  flags: 2,
};

// cumulative active admissions, one value per day from day 0 (19 days)
export const SNAPSHOTS = [10, 22, 33, 44, 55, 64, 72, 79, 85, 89, 91, 92, 93, 94, 95, 95, 95, 96, 96];
const ECE_SNAP = [6, 14, 23, 32, 40, 47, 54, 60, 65, 69, 72, 74, 76, 77, 78, 79, 80, 80, 81];
const MECH_SNAP = [20, 34, 47, 60, 72, 83, 92, 97, 100, 101, 102, 102, 103, 103, 103, 103, 104, 104, 104];
const CIVIL_SNAP = [8, 15, 22, 28, 33, 37, 40, 42, 44, 45, 46, 46, 47, 47, 48, 48, 49, 49, 49];
const PGDM_SNAP = [40, 60, 78, 92, 101, 107, 111, 113, 114, 115, 115, 116, 116, 116, 117, 117, 117, 117, 117];

export type Programme = {
  id: string;
  name: string;
  intake: number;
  reported: number;
  active: number;
  supernumerary: number;
  nri: number;
  oci: number;
  fn: number;
  snapshots: number[];
};

export type Institution = {
  id: string;
  name: string;
  state: string;
  type: "Non-PGDM" | "PGDM";
  lastSyncedMinutes: number;
  programmes: Programme[];
};

export const INSTITUTIONS: Institution[] = [
  {
    id: "dit", name: "Demo Institute of Technology", state: "Karnataka", type: "Non-PGDM", lastSyncedMinutes: 14,
    programmes: [
      { id: "dit-cse", name: "B.Tech Computer Science", intake: 100, reported: 120, active: 96, supernumerary: 4, nri: 6, oci: 1, fn: 0, snapshots: SNAPSHOTS },
      { id: "dit-ece", name: "B.Tech Electronics", intake: 84, reported: 86, active: 81, supernumerary: 2, nri: 3, oci: 0, fn: 1, snapshots: ECE_SNAP },
    ],
  },
  {
    id: "mgit", name: "Metro Gateway Institute of Technology", state: "Tamil Nadu", type: "Non-PGDM", lastSyncedMinutes: 52,
    programmes: [
      { id: "mgit-mech", name: "B.E. Mechanical", intake: 112, reported: 110, active: 104, supernumerary: 3, nri: 2, oci: 0, fn: 0, snapshots: MECH_SNAP },
      { id: "mgit-civil", name: "B.E. Civil", intake: 60, reported: 58, active: 49, supernumerary: 0, nri: 1, oci: 0, fn: 0, snapshots: CIVIL_SNAP },
    ],
  },
  {
    id: "sbc", name: "Sri Bhavani College of Management", state: "Telangana", type: "PGDM", lastSyncedMinutes: 3,
    programmes: [
      { id: "sbc-pgdm", name: "PGDM Business Analytics", intake: 120, reported: 118, active: 117, supernumerary: 0, nri: 4, oci: 1, fn: 0, snapshots: PGDM_SNAP },
    ],
  },
];

export const CATEGORIES = ["General", "OBC", "SC", "ST", "EWS", "NRI", "OCI", "FN"] as const;

// the student whose record the student role sees, and the certificate is issued for
export const STUDENT = {
  ref: "ref-7f3a9c",
  name: "Student 1042",
  apaar: "AP10428841",
  studentId: "DIT/2026/0412",
  instId: "dit",
  progId: "dit-cse",
};

export type SyntheticRow = {
  apaar: string | null;
  name: string;
  category: string | null;
};

// deterministic synthetic upload used by the load test
export function generateRows(count: number, seed = 2026): SyntheticRow[] {
  const rand = rng(seed);
  const rows: SyntheticRow[] = new Array(count);
  for (let i = 0; i < count; i++) {
    const r = rand();
    let apaar: string | null = "AP" + String(10000000 + Math.floor(rand() * 89999999)).padStart(8, "0");
    if (r < 0.01) apaar = null;                  // missing ID
    else if (r < 0.015) apaar = "AP-" + i;        // bad format
    else if (r < 0.018 && i > 0) apaar = rows[Math.floor(rand() * i)].apaar; // duplicate
    const category = rand() < 0.02 ? null : CATEGORIES[Math.floor(rand() * CATEGORIES.length)];
    rows[i] = { apaar, name: "Student " + i, category };
  }
  return rows;
}

// ---- flags, duplicates, uploads, consents (seed state) ----

export type FlagState = "open" | "dismissed" | "escalated";
export type Note = { author: string; at: string; text: string };
export type Flag = {
  id: string;
  instId: string;
  progId: string;
  rule: string;
  title: string;
  evidence: string;
  days: number;          // days to the admission deadline or projected breach
  state: FlagState;
  reason: string;
  notes: Note[];
};

export const FLAG_SEED: Flag[] = [
  {
    id: "F-1", instId: "dit", progId: "dit-cse", rule: "GS-01 v1.2", title: "Unverified seats · 24",
    evidence: "No fee, exam or attendance signal in 30 days for 24 enrolments.", days: 14, state: "open",
    reason: "Fee feed lag suspected; re-check after sync",
    notes: [{ author: "Dr. Asha Rao (Registrar)", at: "18 Oct, 16:20", text: "Fee portal was down on 12th. Re-sync requested." }],
  },
  {
    id: "F-2", instId: "dit", progId: "dit-cse", rule: "BR-02 v1.0", title: "Breach projected · B.Tech CSE",
    evidence: "Pace from the last 7 days reaches intake 100 within the range shown.", days: 9, state: "open",
    reason: "Intake review requested before the next admission round", notes: [],
  },
  {
    id: "F-3", instId: "dit", progId: "dit-ece", rule: "DQ-01 v1.0", title: "NRI count differs from upload file",
    evidence: "Upload file has 3 NRI rows; the record shows 2.", days: 20, state: "open",
    reason: "Possible late correction; ask the college to confirm", notes: [],
  },
  {
    id: "F-4", instId: "mgit", progId: "mgit-mech", rule: "BR-02 v1.0", title: "Near intake · B.E. Mechanical",
    evidence: "104 of 112 seats used; pace projects a breach in about 40 days.", days: 40, state: "open",
    reason: "Watch list for the next round", notes: [],
  },
];

export type Duplicate = { ref: string; instIds: string[]; state: "open" | "cleared" };
export const DUPLICATE_SEED: Duplicate[] = [
  { ref: "kh_3f9a21c7", instIds: ["dit", "mgit"], state: "open" },
];

export type Upload = {
  id: string;
  instId: string;
  file: string;
  at: string;
  rows: number;
  accepted: number;
  correctable: number;
  review: number;
};
export const UPLOAD_SEED: Upload[] = [
  { id: "UP-2611", instId: "dit", file: "dit_cse_batch_2026-08.csv", at: "18 Aug 2026, 10:42", rows: 120, accepted: 112, correctable: 6, review: 2 },
  { id: "UP-2598", instId: "dit", file: "dit_ece_batch_2026-07.csv", at: "02 Jul 2026, 15:08", rows: 86, accepted: 84, correctable: 2, review: 0 },
  { id: "UP-2540", instId: "mgit", file: "mgit_mech_2026-08.csv", at: "11 Aug 2026, 09:15", rows: 110, accepted: 108, correctable: 1, review: 1 },
];

export type Consent = {
  id: string;
  studentRef: string;
  requester: string;
  purpose: string;
  claim: string;
  at: string;
  status: "granted" | "revoked";
};
export const CONSENT_SEED: Consent[] = [
  { id: "REQ-901", studentRef: STUDENT.ref, requester: "Ramesh Industries HR", purpose: "Employment background check", claim: "holds a B.Tech in Computer Science from an approved institution", at: "20 Oct 2026, 11:04", status: "granted" },
  { id: "REQ-887", studentRef: STUDENT.ref, requester: "State Bank of India (KYC)", purpose: "Account opening", claim: "graduate of an approved institution", at: "02 Oct 2026, 13:22", status: "revoked" },
];
