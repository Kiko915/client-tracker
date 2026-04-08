"use client";

export default function Error({
  error,
  reset
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="container">
      <section className="card stack">
        <h1>Something went wrong</h1>
        <p className="muted">{error.message}</p>
        <button className="btn" onClick={reset} type="button">
          Try again
        </button>
      </section>
    </main>
  );
}
