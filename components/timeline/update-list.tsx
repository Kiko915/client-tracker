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
      <div className="card">
        <p className="muted">No updates yet. Check back soon.</p>
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
