import { getTimelineMedia } from "@/lib/timeline-media";
import { FileText } from "lucide-react";

import type { ProjectUpdate } from "@/lib/types";

import { TimelineMediaGallery } from "./timeline-media-gallery";
import { UpdateControls } from "./update-controls";

export function UpdateItem({
  item,
  isAdmin,
}: {
  item: ProjectUpdate;
  isAdmin?: boolean;
}) {
  const media = getTimelineMedia(item);
  const galleryMedia = media.filter((m) => m.type !== "document");
  const documents = media.filter((m) => m.type === "document");

  return (
    <article className="timeline-item stack">
      <div className="row">
        <strong style={{ fontSize: "14px" }}>{item.title}</strong>

        <span className="badge">{item.progress_percent}%</span>
      </div>

      <p className="muted">{item.body}</p>

      {galleryMedia.length > 0 && <TimelineMediaGallery media={galleryMedia} />}

      {documents.length > 0 && (
        <div className="stack" style={{ gap: "0.5rem" }}>
          {documents.map((doc, idx) => (
            <a
              key={`${doc.url}-${idx}`}
              href={doc.url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 0.75rem",
                backgroundColor: "var(--card-bg-alt, rgba(0,0,0,0.02))",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                color: "inherit",
                fontSize: "13px",
                fontWeight: 500,
                width: "fit-content",
              }}
            >
              <FileText size={16} color="var(--color-primary, #2563eb)" />
              {doc.name || "Attached Document"}
            </a>
          ))}
        </div>
      )}

      <small className="muted">
        {new Date(item.created_at).toLocaleString()}
      </small>

      {isAdmin && <UpdateControls item={item} projectId={item.project_id} />}
    </article>
  );
}
