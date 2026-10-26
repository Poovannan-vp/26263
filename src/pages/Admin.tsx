import { ROLE_INFO, ROLE_ORDER, PERM_LABEL, type Perm, type Role } from "../auth/roles";
import { PageHead, Chip } from "../components/ui";

const PERMS = Object.keys(PERM_LABEL) as Perm[];

// System administration: users, roles and the permissions matrix. No role on this page opens student records.
export function Admin() {
  return (
    <section>
      <PageHead
        eyebrow="System administration"
        title="Users, roles and permissions"
        right={<Chip tone="info">Student records: blocked on this page</Chip>}
      />

      <div className="card">
        <div className="label">Demo users</div>
        <table className="tbl wide">
          <thead>
            <tr><th>Role</th><th>User</th><th>Scope</th><th>Status</th></tr>
          </thead>
          <tbody>
            {ROLE_ORDER.map((r: Role) => (
              <tr key={r}>
                <td>{ROLE_INFO[r].label}</td>
                <td>{ROLE_INFO[r].user}</td>
                <td>{ROLE_INFO[r].scope}</td>
                <td><Chip tone="ok">active</Chip></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="label">Permissions matrix</div>
        <div className="table-scroll">
          <table className="tbl matrix">
            <thead>
              <tr>
                <th>Permission</th>
                {ROLE_ORDER.map(r => <th key={r} className="center">{ROLE_INFO[r].label}</th>)}
              </tr>
            </thead>
            <tbody>
              {PERMS.map(p => (
                <tr key={p}>
                  <td>{PERM_LABEL[p]}</td>
                  {ROLE_ORDER.map(r => (
                    <td key={r} className="center" aria-label={ROLE_INFO[r].perms.includes(p) ? "allowed" : "not allowed"}>
                      {ROLE_INFO[r].perms.includes(p) ? <span className="ok">✓</span> : <span className="muted">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="small muted">Every permission check is enforced on the page it protects. Denied attempts are logged.</div>
      </div>

      <div className="card">
        <div className="label">API clients (design only, not implemented)</div>
        <table className="tbl">
          <thead><tr><th>Client</th><th>Scopes</th><th>Rate limit</th></tr></thead>
          <tbody>
            <tr><td>Institution SIS connector</td><td className="small">uploads:write, enrolment:read</td><td>60 requests / min</td></tr>
            <tr><td>Employer verification</td><td className="small">claims:request</td><td>20 requests / min</td></tr>
          </tbody>
        </table>
        <div className="small muted">Keys are stored hashed, scoped and rate-limited. This table shows the design only.</div>
      </div>
    </section>
  );
}
