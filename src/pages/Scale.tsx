import { PageHead, Chip } from "../components/ui";

// Static slide content: rollout phases, load handling, and the API design (not implemented here).
export function Scale() {
  return (
    <section className="scale">
      <PageHead eyebrow="Platform scalability and adoption phasing" title="From 0.2 million students to 10 million" />

      <div className="grid-2">
        <div className="card phase">
          <div className="label">Phase 1 · now</div>
          <div className="big">PGDM institutions</div>
          <div className="muted">About 0.15–0.25 M students. These autonomous institutes already hold digitised student records, so the first rollout needs no data migration.</div>
        </div>
        <div className="card phase">
          <div className="label">Phase 2 · two to three years</div>
          <div className="big">Non-PGDM institutions</div>
          <div className="muted">About 8–10 M students across B.Tech, M.Tech, MCA, B.Pharm, diploma and engineering programmes, onboarded in batches.</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="label">How the load is handled</div>
          <ul className="list">
            <li><b>Upload queue.</b> Every batch moves through Queued → Processing → Completed with warnings, or Failed.</li>
            <li><b>Partitioning.</b> Enrolment and flag tables are split by academic year and institution.</li>
            <li><b>Read-only dashboards.</b> AICTE views read from snapshots, so reporting never blocks uploads.</li>
            <li><b>Idempotent APIs.</b> Repeated submissions are safe to retry.</li>
          </ul>
        </div>
        <div className="card">
          <div className="label">Beyond AICTE</div>
          <ul className="list">
            <li>UGC and state education boards, through the same API-first design.</li>
            <li>Skill-certification registries, using the same verifiable-claim flow.</li>
          </ul>
          <div className="small muted">Scale figures are from the solution document. The load test measures one browser, not production capacity.</div>
        </div>
      </div>

      <div className="card">
        <div className="label row"><span>Integration API</span> <Chip tone="info">design only · not implemented</Chip></div>
        <table className="tbl wide">
          <thead><tr><th>Endpoint</th><th>Who calls it</th><th>What it does</th></tr></thead>
          <tbody>
            <tr><td><code>POST /v1/uploads</code></td><td>College system</td><td>Send a batch keyed on APAAR ID; returns per-row status</td></tr>
            <tr><td><code>GET /v1/programmes/{"{id}"}/enrolment</code></td><td>AICTE, regulators</td><td>Active enrolment against intake, aggregated</td></tr>
            <tr><td><code>POST /v1/claims</code></td><td>Employer or verifier</td><td>Request one claim with a stated purpose; returns a signed yes or no</td></tr>
            <tr><td><code>GET /v1/credentials/{"{id}"}/status</code></td><td>Anyone with the QR</td><td>Valid, revoked or invalid; no record fields</td></tr>
          </tbody>
        </table>
        <div className="small muted">Authentication uses scoped keys. Every call is logged and rate-limited.</div>
      </div>
    </section>
  );
}
