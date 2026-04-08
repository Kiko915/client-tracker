import { ClipboardList } from "lucide-react";
import type { ProjectUpdate } from "@/lib/types";
import { UpdateItem } from "./update-item";

export function UpdateList({
  updates,
  isAdmin = false,
}: {
  updates: ProjectUpdate[];
  isAdmin?: boolean;
}) {
  if (!updates.length) {
    return (
      <div
        className="card stack"
        style={{
          alignItems: "center",
          justifyContent: "center",
          padding: "4rem 2rem",
          textAlign: "center",
          border: "1px dashed var(--border)",
          backgroundColor: "var(--card-bg-alt, rgba(0,0,0,0.02))",
        }}
      >
        <div
          style={{
            background: "var(--card-bg)",
            padding: "1rem",
            borderRadius: "50%",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            marginBottom: "1rem",
          }}
        >
          <ClipboardList size={32} color="var(--color-primary, #2563eb)" />
        </div>
        <h3
          className="section-title"
          style={{ fontSize: "18px", marginBottom: "0.5rem" }}
        >
          No Updates Yet
        </h3>
        <p className="muted" style={{ maxWidth: "400px", margin: "0 auto" }}>
          The project timeline is currently empty. Check back later for the
          latest progress reports, milestones, and media.
        </p>
      </div>
    );
  }

  return (
    <section className="card stack">
      <div className="row">
        <h2 className="section-title">Progress Timeline</h2>
        <span className="chip">{updates.length} updates</span>
      </div>
      {updates.map((item) => (
        <UpdateItem key={item.id} item={item} isAdmin={isAdmin} />
      ))}
    </section>
  );
}
