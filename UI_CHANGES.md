# APAAR Intake Guard · UI change list

Consolidated from the review rounds. Status key: **Done** (built and checked in a headless render), **Partial** (built but missing part of the idea), **To do** (agreed, not built).

Projects:
- React app: `apaar-intake-guard/`
- Single-file slideshow (embedded at `public/flow/index.html`)

---

## 1. Home screen and animation

| Item | Status | Notes |
|---|---|---|
| Four-slide flow: box, record out, card runs, branches, next page | Done | Embedded from the single-file demo. |
| APAAR ID card character with face, lanyard, hologram strip | Done | Only character kept. Other characters removed. |
| Stage rail (seven dots, active stage label) | Done | Bottom strip of the flow. |
| HUD: Reported / Active / Flags | Done | Changes per slide. |
| Scene wipe between slides | Done | Not yet checked in a live browser. |
| Sound cues (jump, gate cleared, stamp), off by default | Partial | Built. Not yet heard in a live browser. |
| Callouts beside the card ("Rule GS-01 v1.2 · evidence shown") | Done | Shown while the card clears each gate. |
| Controls: previous, play/pause (Space), next, restart, progress bar | Done | |
| Seat Ledger fill animation (tiles fill, ghosts pulse) | Partial | Fill and pulse are in. The amber sweep across the grid is not. |
| Forecast breach draw animation (line draws forward, range band, breach marker) | Partial | Static chart with a dashed projection. Not yet drawn in as an animation. |
| Credential reveal (QR assembles, signature scrolls, VERIFIED stamp) | Partial | Stamp animation is in. QR assembly and signature scroll are not. |
| Role lanes in the flow: login gate, role-specific lanes, branch unlock by role, data boundary, role-coloured tokens | To do | See section 4. |
| Animation placement: flow on home, Seat Ledger on dashboard, forecast on institution page, credential on verifier result | Partial | Seat Ledger and forecast are on the dashboard. Credential is on the verifier. Institution page is not built. |

## 2. Pages and features

| Item | Status | Notes |
|---|---|---|
| Guided demo: eight steps with highlight ring and caption bar | Done | Query and consent steps use static cards. |
| AICTE dashboard: Seat Ledger, forecast, flag queue, audit chain | Done | One programme only. |
| Flag actions: dismiss and escalate, each with a reason, logged to the audit chain | Done | Confirmation dialog and undo are To do (see section 3). |
| Verifier: request one claim, signed yes, QR, scan, revoke | Done | Scan re-reads the credential data; it does not decode the QR image. |
| Load test: 100,000 rows in the browser, outcome and failures by rule | Done | Browser-side only. Progress bar is To do. |
| Scale slide: PGDM then non-PGDM, queue states, partitioning | Done | Static slide. |
| Deep links: `?view=dashboard` etc. | Done | For recording each page on its own. |
| College upload form with per-row status (accepted / correctable / review) and downloadable error report | To do | Requirement 1. |
| Institution dashboard (own records, own flags, history) | To do | |
| National AICTE view (all institutions, breach heatmap) | To do | Requirement 4. |
| Natural-language query page with template badge | To do | Cut for the finals build; keep as a static card. |
| Consent page (who verified, when; revoke) | To do | Requirement 8. Currently a static card in the stepper. |
| Certificate mock-up showing APAAR ID and student ID | To do | Requirement 10. Quick win. |
| Supernumerary, NRI, OCI and FN counts on the dashboard | To do | Requirement 2. Quick win. |
| Report export (CSV and PDF) with the same wording as the screen | To do | Requirement 9. Quick win. |
| Cross-institution duplicate candidate (shows the match, not the other college's data) | To do | Requirement 3. |
| Per-row intake excess check | To do | Requirement 3. |
| Masked APAAR ID on screens (show as keyed reference, not raw ID) | Partial | Verifier shows a blurred record. Dashboard and upload need the same treatment. |
| Integration / API (requirement 7) | Slide only | Say so in the video. |

## 3. Human touch and polish

| Item | Status | Notes |
|---|---|---|
| Messy, realistic synthetic data: name typos, mixed date formats, lower-case categories, non-round intake (e.g. 112) | To do | Current data is clean and round. |
| Timestamps from this week and a "last synced" line | To do | |
| Toast messages after each action ("Flag escalated. Reason saved.") | To do | |
| Empty states that say what to do next | To do | |
| Confirmation before dismissing a flag, with a few seconds of undo | To do | |
| Realistic loading delays and progress bar during the load test | To do | |
| Officer notes: a comment thread on each flag, with author and time | To do | |
| "My queue" view with waiting and done-today counts | To do | |
| Filter and sort flags (programme, state, rule, days to deadline) | To do | |
| Institution history: past uploads, past flags and outcomes | To do | |
| Plain-language copy: "unverified seats" with "ghost seats" in a tooltip | To do | |
| Short, direct captions; avoid one repeated sentence pattern | Partial | Captions are direct. Some repetition remains. |
| "Why we built this" note on the home page, in the team's own words | To do | |
| Team member explains one design decision on camera (e.g. why the verifier never sees the full record) | To do | Video. |
| Keep a few natural pauses and one real correction on screen | To do | Video. |
| Own-voice narration | To do | Video. |
| CSV and PDF exports with email-style summary a reviewer could forward | To do | Overlaps with report export above. |

## 4. Roles, login and permissions

| Item | Status | Notes |
|---|---|---|
| Six roles: college administrator, AICTE official, student, employer or verifier, other regulatory body, system administrator | To do | From the solution document. |
| Login screen with one card per role, each with a one-line description of its access | To do | |
| Demo accounts, clearly labelled, with one-click sign-in | To do | |
| Student sign-in with a one-time code, shown on screen in demo mode | To do | |
| College login tied to one institution, with the institution shown in the header | To do | |
| "Signed in as" badge in the top bar: role and institution or region | To do | |
| "What you can see" panel per role (allowed and blocked actions) | To do | |
| Permissions table on the admin screen (roles against actions) | To do | |
| "Not permitted" message when a user goes outside their scope, logged to the audit chain | To do | Strong demo moment. |
| System administrator can manage users but cannot open student records | To do | |
| Role lanes in the animation (see section 1) | To do | |
| Note on screen that authentication is simulated in this prototype | To do | Keep the claim accurate. |
| Five-step demo storyline: college upload → AICTE flag → employer claim → student consent and revoke → audit log | To do | About 5 seconds per switch. |

## 5. Theme and layout

| Item | Status | Notes |
|---|---|---|
| Light theme as the default, with a dark-mode toggle | To do | Currently dark only. |
| Calm status colours that meet WCAG AA contrast (4.5:1 for text) | To do | Current colours are neon. |
| Status never shown by colour alone: each one has a label or icon | Partial | Seat Ledger has a legend. Flags have labels. Check the rest. |
| Plain sans-serif body text at 16–18 px; tabular figures in tables and KPIs | To do | |
| Monospace only for IDs and hashes | To do | |
| Portal-style layout: header, breadcrumbs, bordered tables, plain cards | To do | |
| Bilingual labels: English and Hindi toggle | To do | |
| Neutral product branding; no National Emblem or government logo unless authorised | To do | Check the usage rules first. |
| Calm motion; reduced-motion setting honoured; no glow effects on light backgrounds | Partial | Reduced-motion check is in the flow. Glow effects are still in the dark theme. |
| Theme option inside the embedded slideshow | To do | The slideshow colours are set in its own file. |

## 6. Requirement coverage gaps (from the problem statement)

| Req. | Gap | Covered by |
|---|---|---|
| 1 | Upload form, update flow, per-row status | College upload (section 2) |
| 2 | Supernumerary, NRI, OCI, FN counts | Dashboard fields (section 2) |
| 3 | Intake excess per row; cross-institution duplicate | Validation items (section 2) |
| 4 | National view; institution dashboard | Dashboards (section 2) |
| 5 | Login and roles | Section 4 |
| 7 | Integration API | Slide only |
| 8 | Consent page; RBAC; masked ID | Sections 2 and 4 |
| 9 | Reports and exports | Report export (section 2) |
| 10 | Certificate with APAAR ID and student ID | Certificate mock-up (section 2) |

## 7. Suggested order of work

1. **Quick wins for the video:** certificate mock-up, supernumerary/NRI/OCI/FN fields, report export, toasts, confirmation with undo, messy realistic data.
2. **Roles and login:** login screen, role cards, signed-in badge, permissions panel, "not permitted" with audit entry.
3. **Role lanes in the animation.**
4. **Upload form with per-row status and error report.**
5. **Consent page, institution dashboard, national view.**
6. **Theme:** light default with dark toggle, contrast fixes, bilingual labels.
7. **Video:** team note, own-voice narration, pauses, one real correction.

## 8. Build status (after the implementation round)

**Built:** upload with per-row status, intake-excess check, fix and resubmit, error report and accept; national view; institution page; roles and login (six roles, OTP for students, institution picker); permissions matrix and admin page; denied-access page with an audit entry; student consent page (stop and restore access, correction request); verifier linked to consent; certificate with APAAR ID and student ID, printable; reports with CSV and print; cross-institution match panel (masked); toasts; confirm-then-undo on dismiss; officer notes; "My queue" counts; filters and sort; load test with progress bar; light theme with dark toggle; reduced-motion support; "unverified seats" wording with a tooltip; last-synced line; empty states; flow embedded with the viewer's role (badge and locked stages).

**Partial:** Hindi covers only navigation and buttons; most pages are English. Role lanes in the animation show the badge and locked stages, but not the login gate, coloured tokens or data boundary. The embedded slideshow is still dark-only. Seat Ledger amber sweep, forecast draw-in and QR assembly animations are not built.

**Not built:** the integration API (design table only, on Scale and Admin pages); the team's own-voice narration and natural pauses (video work, not code).

**Verified:** type check, build, and 23 unit tests pass. Screens checked in a headless browser: login, dashboard, upload, national, denied, consent, admin, demo. Clicking through the interactions (upload parse, dismiss with undo, revoke, load-test progress) has not been done in a live browser yet.

## 9. Run notes

- On Windows PowerShell, use `npm.cmd run dev` if script execution is blocked. Or run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` for the current window only.
- Commands: `npm run dev`, `npm run build`, `npm test`.
