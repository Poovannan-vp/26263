# APAAR Intake Guard

A front-end prototype for **SIH 2026, Problem Statement 26263**: an APAAR ID-based student data management and verification platform for AICTE-approved institutions.

The demo shows one story end to end: **predict breach → explain flags → verify minimally → prove it cryptographically**, with role-based access and a tamper-evident audit trail.

> All data is synthetic and every screen says so. Sign-in is simulated. This is a prototype, not a production system.

## What it covers

| Area | What you can see |
|---|---|
| **Home** | A four-slide animated flow of the architecture, shown from the point of view of the selected role. |
| **Guided demo** | Eight steps that switch role at each step: upload, flow, forecast, ghost seats, query, verify, prove, consent. |
| **Upload** | A college uploads a CSV. Each row is checked and marked accepted, correctable or needs review. Rows beyond the seats left are held. You can fix an APAAR ID, recheck, download an error report, and accept the valid rows. |
| **AICTE dashboard** | Seat Ledger, breach forecast, category counts (supernumerary, NRI, OCI, FN), a filterable flag queue with notes, confirm-then-undo on dismiss, and a masked cross-institution match panel. |
| **National view** | Enrolment against intake across institutions, aggregated. No individual student records. |
| **Institution** | Programmes, upload history and flag history for one institution. |
| **Verifier** | A verifier requests one claim with a stated purpose and gets a signed yes or no, shown as a QR code. Only AICTE officers can revoke. |
| **My consent** | A student sees who asked to verify their record, why, and can stop or restore access. Can also request a correction. |
| **Certificate** | A printable certificate that shows the APAAR ID next to the student ID. |
| **Reports** | Enrolment vs intake, category summary, flag log and upload quality. Export as CSV, or print to PDF. |
| **Load test** | Generates 100,000 synthetic rows in the browser and runs every rule on each. Browser-side only. |
| **Admin** | Users, roles and the permissions matrix. Cannot open student records. Shows the API client design. |
| **Scale** | Rollout phases (PGDM first, then non-PGDM) and the integration API design. The API is design only. |

### Roles

Six roles, each with its own permissions:

- **College administrator**: uploads and fixes their own institution's records.
- **AICTE official**: monitors all institutions, reviews flags, revokes credentials.
- **Student**: sees their own record and who verified it.
- **Employer or verifier**: requests one claim.
- **Other regulatory body**: runs reports on aggregates only.
- **System administrator**: manages users. No access to student records.

Opening a page the role cannot use shows a "not permitted" page and writes an entry to the audit chain.

## Getting started

Requirements: Node.js 18 or newer, and npm.

```bash
npm install
npm run dev        # start the dev server, then open the local address it prints
```

On Windows PowerShell, if scripts are blocked, use `npm.cmd` instead of `npm`, or run this for the current window only:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### Other commands

```bash
npm run build      # type-check and build to dist/
npm run preview    # serve the production build locally
npm test           # run the unit tests
```

## Opening screens directly

Two URL parameters are useful for demos and recording:

- `?view=<page>` opens a page. Examples: `dashboard`, `national`, `upload`, `verifier`, `consent`, `certificate`, `reports`, `admin`, `demo`, `login`.
- `?as=<role>` signs in as a role straight away. Roles: `college`, `aicte`, `student`, `verifier`, `regulator`, `sysadmin`.

Example: `http://localhost:5173/?as=aicte&view=dashboard`

The access check still applies, so a role that cannot open a page sees the "not permitted" screen.

## Project layout

```
apaar-intake-guard/
├── index.html              # app entry
├── public/flow/index.html  # the animated flow slideshow (embedded on Home)
├── src/
│   ├── App.tsx             # shell: navigation, role badge, language and theme, access checks
│   ├── store.tsx           # shared state: session, flags, consents, uploads, toasts, audit
│   ├── auth/roles.ts       # roles, permissions, page gates
│   ├── data/seed.ts        # synthetic institutions, programmes, flags, uploads, consents
│   ├── engine/             # rules, forecast, upload validation, CSV, Ed25519 signing, audit chain
│   ├── pages/              # one file per screen
│   ├── components/         # Seat Ledger, forecast chart, toasts, dialogs
│   ├── demo/Stepper.tsx    # guided demo
│   └── home/Home.tsx       # home page
└── UI_CHANGES.md           # change log and status of each planned item
```

## How the core checks work

- **Row rules** (`src/engine/rules.ts`): missing or badly formatted APAAR ID, duplicates within an upload, missing or unknown category, wrong-case category, date not in YYYY-MM-DD, and admission beyond the approved intake. Each rule has a version number, so an explanation stays correct when rules change.
- **Forecast** (`src/engine/forecast.ts`): a linear pace fitted to the last seven days, with a range from a slower and a faster pace. It gives a breach day, or "no breach projected".
- **Credentials** (`src/engine/crypto.ts`): claims are signed with Ed25519 using WebCrypto, with `@noble/ed25519` as a fallback. A credential checks as VALID, REVOKED or INVALID.
- **Audit chain** (`src/engine/audit.ts`): each entry stores the SHA-256 hash of the entry before it. Changing any past entry breaks the chain, and the dashboard shows where.
- **Masking**: APAAR IDs are masked on screen. Cross-institution matches use a keyed-looking reference, not the raw ID. This is a demo stand-in, not a real HMAC.

## Limits

- Authentication is simulated. Student sign-in uses a demo one-time code that is shown on screen.
- Data is synthetic and held in the browser. Nothing is saved between page reloads.
- The QR scan re-reads the credential data; it does not decode a camera image.
- The load-test timing measures one browser, not a server.
- The integration API is a design only.
- Hindi translation covers navigation and buttons only. Most pages are in English.
- The animated flow is dark-only.

## Testing

The unit tests cover the rules, the forecast, upload validation, CSV parsing, permissions, credential signing and the audit chain.

```bash
npm test
```

Some interactions (upload, dismiss with undo, revoke, load-test progress) have been checked by rendering pages, not by clicking through a live session. Please click through them before relying on the demo.

## Licence and data

Prepared for a student hackathon. All names, institutions, students and figures are fictional.
