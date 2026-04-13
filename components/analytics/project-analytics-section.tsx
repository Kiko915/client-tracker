"use client";

import dynamic from "next/dynamic";
import type { ProjectStatus, ProjectUpdate } from "@/lib/types";

type HeatmapCell = { date: string; count: number; level: number };
type HeatmapMarker = { index: number; label: string };

const ProjectAnalyticsTabs = dynamic(
  () =>
    import("./project-analytics-tabs").then((mod) => mod.ProjectAnalyticsTabs),
  {
    ssr: false,
    loading: () => (
      <section className="card stack">
        <div className="row">
          <h2 className="section-title">Project Analytics</h2>
          <span className="chip">Loading charts...</span>
        </div>
        <p className="muted">Preparing analytics view.</p>
      </section>
    ),
  },
);

export function ProjectAnalyticsSection({
  updates,
  status,
  heatmap,
}: {
  updates: ProjectUpdate[];
  status: ProjectStatus;
  heatmap: {
    weeks: HeatmapCell[][];
    monthMarkers: HeatmapMarker[];
    totalUpdates: number;
    activeDays: number;
    maxCount: number;
  };
}) {
  return (
    <ProjectAnalyticsTabs updates={updates} status={status} heatmap={heatmap} />
  );
}
