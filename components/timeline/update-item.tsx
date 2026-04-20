import { getTimelineMedia } from "@/lib/timeline-media";
import { FileText } from "lucide-react";

import type { ProjectUpdate } from "@/lib/types";

import { TimelineMediaGallery } from "./timeline-media-gallery";
import { UpdateControls } from "./update-controls";

export function UpdateItem({
  item,
  isAdmin,
  isLatest = false,
  isLast = false,
  projectName,
  clientName,
}: {
  item: ProjectUpdate;
  isAdmin?: boolean;
  isLatest?: boolean;
  isLast?: boolean;
  projectName?: string;
  clientName?: string;
}) {
  const media = getTimelineMedia(item);
  const galleryMedia = media.filter((m) => m.type !== "document");
  const documents = media.filter((m) => m.type === "document");
  const updateDateLabel = new Date(item.created_at).toLocaleString();

  return (
    <article className={`timeline-entry ${isLatest ? "is-latest" : ""}`}>
      <aside className="timeline-rail" aria-hidden="true">
        <span
          className="timeline-dot"
          title={updateDateLabel}
          aria-label={`Update created at ${updateDateLabel}`}
        />
        {!isLast && <span className="timeline-line" />}
      </aside>
      <div className="timeline-item stack">
        <div className="row">
          <strong className="timeline-title">{item.title}</strong>
          <span className="badge timeline-progress">{item.progress_percent}%</span>
        </div>

        <p className="muted timeline-body">{item.body}</p>

        {galleryMedia.length > 0 && <TimelineMediaGallery media={galleryMedia} />}

        {documents.length > 0 && (
          <div className="stack timeline-documents" style={{ gap: "0.5rem" }}>
            {documents.map((doc, idx) => (
              <a
                key={`${doc.url}-${idx}`}
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                className="timeline-doc-link"
              >
                <FileText size={16} color="#2563eb" />
                {doc.name || "Attached Document"}
              </a>
            ))}
          </div>
        )}

        <small className="muted timeline-date">
          {new Date(item.created_at).toLocaleString()}
        </small>

        {isAdmin && (
          <UpdateControls
            item={item}
            projectId={item.project_id}
            projectName={projectName}
            clientName={clientName}
          />
        )}
      </div>
    </article>
  );
}
