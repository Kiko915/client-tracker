export type ProjectStatus = "planning" | "in_progress" | "on_hold" | "done";

export type Project = {
  id: string;
  name: string;
  slug: string;
  client_name: string;
  company_logo_url: string | null;
  status: ProjectStatus;
  share_token: string;
  created_at: string;
};

export type TimelineMediaItem = {
  type: "image" | "video" | "document";
  url: string;
  name?: string;
};

export type ProjectUpdate = {
  id: string;
  project_id: string;
  title: string;
  body: string;
  progress_percent: number;
  image_url: string | null;
  media: TimelineMediaItem[] | null;
  created_at: string;
};
