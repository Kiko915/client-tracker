"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ProjectStatus, ProjectUpdate, TimelineMediaItem } from "@/lib/types";

type HeatmapCell = { date: string; count: number; level: number };
type HeatmapMarker = { index: number; label: string };

type ProjectAnalyticsTabsProps = {
  updates: ProjectUpdate[];
  status: ProjectStatus;
  heatmap: {
    weeks: HeatmapCell[][];
    monthMarkers: HeatmapMarker[];
    totalUpdates: number;
    activeDays: number;
    maxCount: number;
  };
};

type AnalyticsView = "simple" | "advanced";

const PIE_COLORS = ["#2563eb", "#60a5fa", "#93c5fd", "#c7ddff"];

function normalizeMedia(update: ProjectUpdate): TimelineMediaItem[] {
  if (update.media && update.media.length > 0) {
    return update.media;
  }
  if (update.image_url) {
    return [{ type: "image", url: update.image_url }];
  }
  return [];
}

function getWeekLabel(week: HeatmapCell[]) {
  const start = week[0]?.date;
  const end = week[week.length - 1]?.date;
  if (!start || !end) return "N/A";
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  const startLabel = startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const endLabel = endDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return `${startLabel} - ${endLabel}`;
}

export function ProjectAnalyticsTabs({
  updates,
  status,
  heatmap,
}: ProjectAnalyticsTabsProps) {
  const [view, setView] = useState<AnalyticsView>("simple");

  const overallProgress = updates.reduce(
    (sum, update) => sum + update.progress_percent,
    0,
  );
  const progressBarValue = Math.min(100, overallProgress);
  const latestIncrement = updates[0]?.progress_percent ?? 0;

  const advanced = useMemo(() => {
    const ascending = [...updates].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

    const progressTrend = ascending.map((update) => ({
      label: new Date(update.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      progress: update.progress_percent,
      fullDate: new Date(update.created_at).toLocaleString(),
      title: update.title,
    }));

    const velocityTrend = ascending.map((update, index) => {
      const previous = ascending[index - 1];
      const delta = previous
        ? update.progress_percent - previous.progress_percent
        : update.progress_percent;
      return {
        label: new Date(update.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        delta,
      };
    });

    const weeklyActivity = heatmap.weeks.map((week) => ({
      label: getWeekLabel(week),
      updates: week.reduce((sum, day) => sum + day.count, 0),
    }));

    const mediaCounts: Record<string, number> = {
      image: 0,
      video: 0,
      document: 0,
      text_only: 0,
    };
    updates.forEach((update) => {
      const media = normalizeMedia(update);
      if (media.length === 0) {
        mediaCounts.text_only += 1;
        return;
      }
      media.forEach((item) => {
        mediaCounts[item.type] += 1;
      });
    });

    const mediaMix = [
      { name: "Images", value: mediaCounts.image },
      { name: "Videos", value: mediaCounts.video },
      { name: "Documents", value: mediaCounts.document },
      { name: "Text Only", value: mediaCounts.text_only },
    ].filter((entry) => entry.value > 0);

    return {
      progressTrend,
      velocityTrend,
      weeklyActivity,
      mediaMix,
    };
  }, [heatmap.weeks, updates]);
  const hasProgressTrend = advanced.progressTrend.length > 0;
  const hasVelocityTrend = advanced.velocityTrend.length > 0;
  const hasMediaMix = advanced.mediaMix.length > 0;

  return (
    <section className="card stack">
      <div className="row">
        <h2 className="section-title">Project Analytics</h2>
        <span className="chip">Last 12 weeks</span>
      </div>

      <div className="analytics-tabs" role="tablist" aria-label="Analytics view">
        <button
          className={`analytics-tab ${view === "simple" ? "is-active" : ""}`}
          onClick={() => setView("simple")}
          role="tab"
          type="button"
          aria-selected={view === "simple"}
        >
          Simple
        </button>
        <button
          className={`analytics-tab ${view === "advanced" ? "is-active" : ""}`}
          onClick={() => setView("advanced")}
          role="tab"
          type="button"
          aria-selected={view === "advanced"}
        >
          Advanced
        </button>
      </div>

      {view === "simple" ? (
        <>
          <div className="analytics-grid">
            <div className="progress-card stack">
              <div className="row">
                <p className="metric-label">Overall Progress</p>
                <strong className="progress-percent">{overallProgress}%</strong>
              </div>
              <div className="progress-track" aria-label="Project progress">
                <div
                  className="progress-fill"
                  style={{ width: `${progressBarValue}%` }}
                />
              </div>
              <div className="row">
                <small className="muted">
                  Cumulative completion across all updates
                </small>
                <small className="progress-positive">
                  +{latestIncrement}% added in latest update
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
                <p className="kpi-value">{status.replace("_", " ")}</p>
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
            <div className="heatmap-center">
              <div
                className="heatmap-months"
                style={{
                  gridTemplateColumns: `repeat(${heatmap.weeks.length}, 14px)`,
                }}
                aria-hidden="true"
              >
                {heatmap.monthMarkers.map((marker) => (
                  <span
                    className="heatmap-month-label"
                    key={`${marker.index}-${marker.label}`}
                    style={{ gridColumnStart: marker.index + 1 }}
                  >
                    {marker.label}
                  </span>
                ))}
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
            </div>
            <div className="heatmap-scale">
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
        </>
      ) : (
        <div className="advanced-grid">
          <article className="advanced-chart-card stack">
            <div className="row">
              <h3 className="section-title">Progress Trend</h3>
              <small className="muted">Per update</small>
            </div>
            <div className="chart-surface">
              {hasProgressTrend ? (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={advanced.progressTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#dbe2ea" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value) => [`${value}%`, "Progress"]}
                      labelFormatter={(value, payload) =>
                        payload?.[0]?.payload?.fullDate ?? value
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="progress"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="muted">No updates yet for trend analysis.</p>
              )}
            </div>
          </article>

          <article className="advanced-chart-card stack">
            <div className="row">
              <h3 className="section-title">Weekly Activity</h3>
              <small className="muted">Updates per week</small>
            </div>
            <div className="chart-surface">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={advanced.weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dbe2ea" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    interval={2}
                    angle={-18}
                    textAnchor="end"
                    height={52}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="updates" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="advanced-chart-card stack">
            <div className="row">
              <h3 className="section-title">Progress Velocity</h3>
              <small className="muted">Delta per update</small>
            </div>
            <div className="chart-surface">
              {hasVelocityTrend ? (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={advanced.velocityTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#dbe2ea" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => [`${value}%`, "Change"]} />
                    <Area
                      type="monotone"
                      dataKey="delta"
                      stroke="#1d4ed8"
                      fill="rgba(37, 99, 235, 0.25)"
                      strokeWidth={2.5}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="muted">No updates yet for velocity analysis.</p>
              )}
            </div>
          </article>

          <article className="advanced-chart-card stack">
            <div className="row">
              <h3 className="section-title">Update Content Mix</h3>
              <small className="muted">Media distribution</small>
            </div>
            <div className="chart-surface">
              {hasMediaMix ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={advanced.mediaMix}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={86}
                      innerRadius={50}
                      paddingAngle={3}
                      label
                    >
                      {advanced.mediaMix.map((entry, index) => (
                        <Cell
                          key={`${entry.name}-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="muted">No media data yet for distribution analysis.</p>
              )}
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
