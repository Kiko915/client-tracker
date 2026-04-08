import { getTimelineMedia } from "@/lib/timeline-media";

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

  return (
    <article className="timeline-item stack">
      <div className="row">
        <strong style={{ fontSize: "14px" }}>{item.title}</strong>

        <span className="badge">{item.progress_percent}%</span>
      </div>

      <p className="muted">{item.body}</p>

      <TimelineMediaGallery media={media} />

      <small className="muted">
        {new Date(item.created_at).toLocaleString()}
      </small>

      {isAdmin && <UpdateControls item={item} projectId={item.project_id} />}
    </article>
  );
}
