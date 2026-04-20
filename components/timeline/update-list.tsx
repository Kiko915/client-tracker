import { ClipboardList } from "lucide-react";
import type { ProjectUpdate } from "@/lib/types";
import { UpdateItem } from "./update-item";

export function UpdateList({
  updates,
  isAdmin = false,
  projectName,
  clientName,
}: {
  updates: ProjectUpdate[];
  isAdmin?: boolean;
  projectName?: string;
  clientName?: string;
}) {
  if (!updates.length) {
    return (
      <section className="card empty-state stack" role="status" aria-live="polite">
        <div className="empty-state-icon-wrap" aria-hidden="true">
          <ClipboardList size={26} color="#1d4ed8" />
        </div>
        <h3 className="empty-state-title">No Updates Yet</h3>
        <p className="empty-state-body">
          {isAdmin
            ? "No timeline entries have been published. Add the first project update to start client-facing reporting."
            : "There are no timeline entries yet. Updates will appear here as progress is published."}
        </p>
      </section>
    );
  }

  return (
    <section className="card timeline-shell stack">
      <div className="row">
        <h2 className="section-title">Progress Timeline</h2>
        <span className="chip">{updates.length} updates</span>
      </div>
      <div className="timeline-list">
        {updates.map((item, index) => (
          <UpdateItem
            key={item.id}
            item={item}
            isAdmin={isAdmin}
            isLatest={index === 0}
            isLast={index === updates.length - 1}
            projectName={projectName}
            clientName={clientName}
          />
        ))}
      </div>
    </section>
  );
}
