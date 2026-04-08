import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { UpdateList } from "@/components/timeline/update-list";
import { isRateLimited } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/server";
import type { Project, ProjectUpdate } from "@/lib/types";

function getDayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildHeatmap(updates: ProjectUpdate[], days = 84) {
  const counts = new Map<string, number>();
  updates.forEach((update) => {
    const key = getDayKey(new Date(update.created_at));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cells: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = getDayKey(date);
    cells.push({ date: key, count: counts.get(key) ?? 0 });
  }

  const maxCount = Math.max(...cells.map((c) => c.count), 1);
  const weeks: { date: string; count: number; level: number }[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    const week = cells.slice(i, i + 7).map((cell) => ({
      ...cell,
      level:
        cell.count === 0
          ? 0
          : Math.min(4, Math.ceil((cell.count / maxCount) * 4)),
    }));
    weeks.push(week);
  }

  return {
    weeks,
    totalUpdates: updates.length,
    activeDays: cells.filter((c) => c.count > 0).length,
    maxCount,
  };
}

export default async function TrackPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const ip = (await headers()).get("x-forwarded-for") ?? "unknown";
  const key = `${ip}:${token}`;
  if (isRateLimited(key)) {
    return (
      <main className="container">
        <section className="card">
          <p className="muted">Too many requests. Please retry in a minute.</p>
        </section>
      </main>
    );
  }
  const supabase = createAdminClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("share_token", token)
    .single();

  if (!project) notFound();

  const { data: updates } = await supabase
    .from("project_updates")
    .select("*")
    .eq("project_id", (project as Project).id)
    .order("created_at", { ascending: false });

  const typedUpdates = (updates ?? []) as ProjectUpdate[];
  const latestProgress = typedUpdates.reduce(
    (sum, update) => sum + update.progress_percent,
    0,
  );
  const heatmap = buildHeatmap(typedUpdates, 84);
  const progressDelta = typedUpdates[0]?.progress_percent ?? 0;

  return (
    <main className="container stack">
      <section className="page-header stack">
        {(project as Project).company_logo_url ? (
          <div className="client-logo-wrap">
            <img
              src={(project as Project).company_logo_url ?? ""}
              alt={`${(project as Project).client_name} logo`}
              className="client-logo"
            />
          </div>
        ) : null}
        <h1 className="page-title">{(project as Project).name}</h1>
        <p className="muted">
          Client: {(project as Project).client_name} | Status:{" "}
          {(project as Project).status}
        </p>
        <p className="muted">
          Last updated:{" "}
          {typedUpdates[0]?.created_at
            ? new Date(typedUpdates[0].created_at).toLocaleString()
            : "No updates yet"}
        </p>
      </section>

      <section className="card stack">
        <div className="row">
          <h2 className="section-title">Project Analytics</h2>
          <span className="chip">Last 12 weeks</span>
        </div>

        <div className="analytics-grid">
          <div className="progress-card stack">
            <div className="row">
              <p className="metric-label">Overall Progress</p>
              <strong className="progress-percent">{latestProgress}%</strong>
            </div>
            <div className="progress-track" aria-label="Project progress">
              <div
                className="progress-fill"
                style={{ width: `${latestProgress}%` }}
              />
            </div>
            <div className="row">
              <small className="muted">
                Current completion based on latest update
              </small>
              <small
                className={
                  progressDelta >= 0 ? "progress-positive" : "progress-negative"
                }
              >
                {progressDelta >= 0 ? "+" : ""}
                {progressDelta}% since previous update
              </small>
            </div>
          </div>

          <div className="kpi-grid">
            <div className="metric">
              <p className="metric-label">Total Updates</p>
              <p className="kpi-value">{heatmap.totalUpdates}</p>
            </div>
            <div className="metric">
              <p className="metric-label">Active Days</p>
              <p className="kpi-value">{heatmap.activeDays}</p>
            </div>
            <div className="metric">
              <p className="metric-label">Peak Updates/Day</p>
              <p className="kpi-value">{heatmap.maxCount}</p>
            </div>
            <div className="metric">
              <p className="metric-label">Status</p>
              <p className="kpi-value">
                {(project as Project).status.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>

        <div className="heatmap-wrap">
          <div className="row">
            <h3 className="section-title" style={{ fontSize: "14px" }}>
              Update Activity Heatmap
            </h3>
            <small className="muted">
              Darker cells indicate higher activity
            </small>
          </div>
          <div
            className="heatmap-grid"
            aria-label="Daily update activity heatmap"
          >
            {heatmap.weeks.map((week, weekIndex) => (
              <div className="heatmap-week" key={`week-${weekIndex}`}>
                {week.map((day) => (
                  <div
                    className={`heatmap-cell heatmap-l${day.level}`}
                    key={day.date}
                    title={`${day.date}: ${day.count} update${day.count === 1 ? "" : "s"}`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="row">
            <small className="muted">Less</small>
            <div className="heatmap-legend">
              <span className="heatmap-cell heatmap-l0" />
              <span className="heatmap-cell heatmap-l1" />
              <span className="heatmap-cell heatmap-l2" />
              <span className="heatmap-cell heatmap-l3" />
              <span className="heatmap-cell heatmap-l4" />
            </div>
            <small className="muted">More</small>
          </div>
        </div>
      </section>

      <UpdateList updates={typedUpdates} />
    </main>
  );
}
