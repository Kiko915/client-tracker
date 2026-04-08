import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createUpdateAction, updateProjectAction } from "@/app/actions";
import { UpdateList } from "@/components/timeline/update-list";
import { createClient } from "@/lib/supabase/server";
import type { Project, ProjectUpdate } from "@/lib/types";

export default async function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!project) notFound();

  const { data: updates } = await supabase
    .from("project_updates")
    .select("*")
    .eq("project_id", (project as Project).id)
    .order("created_at", { ascending: false });

  return (
    <main className="container stack">
      <section className="page-header stack">
        <div className="row">
          <div>
            <h1 className="page-title">{(project as Project).name}</h1>
            <p className="muted">
              Client: {(project as Project).client_name} | Status:{" "}
              {(project as Project).status}
            </p>
          </div>
          <Link
            className="btn secondary"
            href={`/track/${(project as Project).share_token}`}
          >
            Public page
          </Link>
        </div>
      </section>

      <section className="card stack">
        <h2 className="section-title">Edit Project Info</h2>
        <form
          className="stack"
          encType="multipart/form-data"
          action={async (formData) => {
            "use server";
            await updateProjectAction((project as Project).id, formData);
          }}
        >
          <div className="form-grid">
            <label className="label">
              Project Name
              <input
                className="input"
                name="name"
                defaultValue={(project as Project).name}
                required
              />
            </label>
            <label className="label">
              Slug
              <input
                className="input"
                name="slug"
                defaultValue={(project as Project).slug}
                required
              />
            </label>
            <label className="label">
              Client Name
              <input
                className="input"
                name="client_name"
                defaultValue={(project as Project).client_name}
                required
              />
            </label>
            <label className="label">
              Company Logo (optional)
              <input
                className="input"
                name="company_logo_file"
                type="file"
                accept="image/*"
              />
            </label>
            <label className="label" style={{ alignSelf: "end" }}>
              <span>Remove current logo</span>
              <input name="remove_company_logo" type="checkbox" />
            </label>
            <label className="label">
              Status
              <select
                className="select"
                name="status"
                defaultValue={(project as Project).status}
              >
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="on_hold">On Hold</option>
                <option value="done">Done</option>
              </select>
            </label>
          </div>
          <button className="btn secondary" type="submit">
            Save Project Info
          </button>
        </form>
      </section>

      <section className="card stack">
        <h2 className="section-title">Add Timeline Update</h2>
        <form
          className="stack"
          encType="multipart/form-data"
          action={async (formData) => {
            "use server";
            await createUpdateAction((project as Project).id, formData);
          }}
        >
          <div className="form-grid">
            <label className="label full-span">
              Title
              <input className="input" name="title" required />
            </label>
            <label className="label full-span">
              Notes
              <textarea className="textarea" name="body" required />
            </label>
            <label className="label">
              Progress %
              <input
                className="input"
                min={0}
                max={100}
                name="progress_percent"
                type="number"
                required
              />
            </label>
            <label className="label full-span">
              Images (optional)
              <input
                className="input"
                name="timeline_images"
                type="file"
                accept="image/*"
                multiple
              />
            </label>
            <label className="label full-span">
              Videos (optional)
              <input
                className="input"
                name="timeline_videos"
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                multiple
              />
            </label>
            <label className="label full-span">
              Documents (optional)
              <input
                className="input"
                name="timeline_documents"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                multiple
              />
            </label>
          </div>
          <button className="btn" type="submit">
            Save Update
          </button>
        </form>
      </section>

      <UpdateList updates={(updates ?? []) as ProjectUpdate[]} isAdmin={true} />
    </main>
  );
}
