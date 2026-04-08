import Link from "next/link";
import { redirect } from "next/navigation";
import { createProjectAction, signOutAction } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="container stack">
      <section className="page-header stack">
        <div className="row">
          <h1 className="page-title">Project Operations</h1>
          <form action={signOutAction}>
            <button className="btn secondary" type="submit">
              Sign out
            </button>
          </form>
        </div>
        <p className="muted">
          Create projects, manage delivery status, and share secure tracking links.
        </p>
      </section>

      <section className="card stack">
        <div className="row">
          <h2 className="section-title">Active Projects</h2>
          <span className="chip">{(projects ?? []).length} projects</span>
        </div>
        <div className="stack">
          {((projects ?? []) as Project[]).map((project) => (
            <div className="list-card row" key={project.id}>
              <div>
                <strong>{project.name}</strong>
                <p className="muted">
                  {project.client_name} - {project.status}
                </p>
              </div>
              <Link className="btn secondary" href={`/admin/projects/${project.slug}`}>
                Open
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="card stack">
        <h2 className="section-title">Create New Project</h2>
        <form className="stack" action={createProjectAction} encType="multipart/form-data">
          <div className="form-grid">
            <label className="label">
              Project Name
              <input className="input" name="name" required />
            </label>
            <label className="label">
              Slug
              <input className="input" name="slug" placeholder="acme-site-redesign" required />
            </label>
            <label className="label">
              Client Name
              <input className="input" name="client_name" required />
            </label>
            <label className="label">
              Company Logo (optional)
              <input className="input" name="company_logo_file" type="file" accept="image/*" />
            </label>
            <label className="label">
              Status
              <select className="select" name="status" defaultValue="planning">
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="on_hold">On Hold</option>
                <option value="done">Done</option>
              </select>
            </label>
          </div>
          <button className="btn" type="submit">
            Create Project
          </button>
        </form>
      </section>
    </main>
  );
}
