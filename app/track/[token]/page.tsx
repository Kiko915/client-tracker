import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { ProjectAnalyticsSection } from "@/components/analytics/project-analytics-section";
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

  const monthMarkers: { index: number; label: string }[] = [];
  const currentYear = new Date().getFullYear();
  let lastMonthKey = "";
  weeks.forEach((week, index) => {
    const firstDay = week[0];
    if (!firstDay) return;

    const monthDate = new Date(`${firstDay.date}T00:00:00`);
    const monthKey = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;
    if (monthKey === lastMonthKey) return;

    const month = monthDate.toLocaleString("en-US", { month: "short" });
    const yearSuffix =
      monthDate.getFullYear() === currentYear
        ? ""
        : ` '${String(monthDate.getFullYear()).slice(-2)}`;
    monthMarkers.push({ index, label: `${month}${yearSuffix}` });
    lastMonthKey = monthKey;
  });

  return {
    weeks,
    monthMarkers,
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
  const heatmap = buildHeatmap(typedUpdates, 84);

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

      <ProjectAnalyticsSection
        updates={typedUpdates}
        status={(project as Project).status}
        heatmap={heatmap}
      />

      <UpdateList updates={typedUpdates} />
    </main>
  );
}
