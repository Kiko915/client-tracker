import type { ProjectUpdate, TimelineMediaItem } from "@/lib/types";

export function getTimelineMedia(item: ProjectUpdate): TimelineMediaItem[] {
  if (item.media && item.media.length > 0) {
    return item.media;
  }
  if (item.image_url) {
    return [{ type: "image", url: item.image_url }];
  }
  return [];
}
