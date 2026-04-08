import Link from "next/link";

export default function HomePage() {
  return (
    <main className="container stack">
      <section className="page-header stack">
        <h1 className="page-title">Client Progress Tracker</h1>
        <p className="muted">
          A modern portal to share transparent project progress with clients.
        </p>
        <div className="meta-grid">
          <div className="metric">
            <p className="metric-label">Visibility</p>
            <p className="metric-value">Live timeline updates</p>
          </div>
          <div className="metric">
            <p className="metric-label">Access Model</p>
            <p className="metric-value">Public tokenized links</p>
          </div>
          <div className="metric">
            <p className="metric-label">Admin Control</p>
            <p className="metric-value">Single secure dashboard</p>
          </div>
        </div>
      </section>

      <section className="card stack">
        <h2 className="section-title">Workspace Access</h2>
        <div className="row">
          <Link className="btn" href="/admin/login">
            Open admin dashboard
          </Link>
          <span className="chip">Clients use shared tracking URLs</span>
        </div>
      </section>
    </main>
  );
}
