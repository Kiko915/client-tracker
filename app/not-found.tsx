import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container">
      <section className="card stack">
        <h1>Page not found</h1>
        <p className="muted">
          The link might be invalid or this project is no longer shared.
        </p>
        <Link className="btn secondary" href="/">
          Back to home
        </Link>
      </section>
    </main>
  );
}
