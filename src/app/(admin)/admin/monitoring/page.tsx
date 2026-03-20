"use client";

import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import {
  Activity,
  BarChart3,
  ScrollText,
  ExternalLink,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useHttpRequestRate,
  useJvmHeap,
  useMetricStats,
  useLogVolume,
  useLogCountStat,
  useRecentErrors,
  useCpuUsage,
  useHikariPool,
  useJvmThreads,
  useGcPause,
} from "@/hooks/use-monitoring";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend
);

// ── Constants ─────────────────────────────────────────────────────────────────

const GRAFANA_BASE = "https://bavanchun.grafana.net";

type TabKey = "metrics" | "logs";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(unixSeconds: number) {
  return new Date(unixSeconds * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateTime(unixSeconds: number) {
  return new Date(unixSeconds * 1000).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// ── Shared chart options ──────────────────────────────────────────────────────

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index" as const, intersect: false },
  plugins: { legend: { display: false }, tooltip: { mode: "index" as const } },
  scales: {
    x: {
      grid: { color: "rgba(128,128,128,0.1)" },
      ticks: { maxTicksLimit: 8, font: { size: 11 } },
    },
    y: {
      grid: { color: "rgba(128,128,128,0.1)" },
      ticks: { font: { size: 11 } },
      beginAtZero: true,
    },
  },
};

const lineOptionsMulti = {
  ...lineOptions,
  plugins: {
    legend: { display: true, position: "top" as const, labels: { font: { size: 11 }, boxWidth: 12 } },
    tooltip: { mode: "index" as const },
  },
};

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index" as const, intersect: false },
  plugins: {
    legend: { position: "top" as const, labels: { font: { size: 12 }, boxWidth: 12 } },
  },
  scales: {
    x: {
      stacked: true,
      grid: { color: "rgba(128,128,128,0.1)" },
      ticks: { maxTicksLimit: 8, font: { size: 11 } },
    },
    y: {
      stacked: true,
      grid: { color: "rgba(128,128,128,0.1)" },
      ticks: { font: { size: 11 } },
      beginAtZero: true,
    },
  },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function TabButton({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </button>
  );
}

function StatCardItem({
  label,
  value,
  unit,
  loading,
}: {
  label: string;
  value: string;
  unit?: string;
  loading: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {loading ? (
        <div className="h-7 w-16 rounded bg-muted animate-pulse" />
      ) : (
        <p className="text-2xl font-bold tabular-nums">
          {value}
          {unit && (
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              {unit}
            </span>
          )}
        </p>
      )}
    </div>
  );
}

function ChartCard({
  title,
  height = 220,
  loading,
  error,
  children,
}: {
  title: string;
  height?: number;
  loading: boolean;
  error: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <p className="text-sm font-semibold mb-4">{title}</p>
      {loading ? (
        <div
          className="rounded-lg bg-muted animate-pulse"
          style={{ height }}
        />
      ) : error ? (
        <div
          className="flex flex-col items-center justify-center gap-2 text-muted-foreground"
          style={{ height }}
        >
          <AlertCircle className="h-5 w-5" />
          <p className="text-xs">No data</p>
        </div>
      ) : (
        <div style={{ height }}>{children}</div>
      )}
    </div>
  );
}

function LevelBadge({ level }: { level: string }) {
  if (level === "ERROR")
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-red-50 dark:bg-red-950/40 px-2 py-0.5 text-[10px] font-semibold text-red-600 dark:text-red-400">
        <AlertCircle className="h-3 w-3" />
        ERROR
      </span>
    );
  if (level === "WARN")
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
        <AlertTriangle className="h-3 w-3" />
        WARN
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
      <Info className="h-3 w-3" />
      INFO
    </span>
  );
}

// ── Metrics Tab ───────────────────────────────────────────────────────────────

function MetricsTab() {
  const httpRate = useHttpRequestRate();
  const jvmHeap = useJvmHeap();
  const stats = useMetricStats();
  const cpuUsage = useCpuUsage();
  const hikariPool = useHikariPool();
  const jvmThreads = useJvmThreads();
  const gcPause = useGcPause();

  const rateLabels = (httpRate.data ?? []).map((p) => formatTime(p.ts));
  const rateValues = (httpRate.data ?? []).map((p) => p.value);

  const heapLabels = (jvmHeap.data ?? []).map((p) => formatTime(p.ts));
  const heapValues = (jvmHeap.data ?? []).map((p) => p.value);

  const cpuLabels = (cpuUsage.data?.timestamps ?? []).map(formatTime);
  const hikariLabels = (hikariPool.data?.timestamps ?? []).map(formatTime);
  const threadLabels = (jvmThreads.data?.timestamps ?? []).map(formatTime);

  const gcLabels = (gcPause.data ?? []).map((p) => formatTime(p.ts));
  const gcValues = (gcPause.data ?? []).map((p) => p.value);

  // Detect if Prometheus has no data yet (all stat cards are N/A)
  const promNoData =
    !stats.isLoading &&
    stats.data?.every((c) => c.value === "N/A");

  return (
    <div className="space-y-5">
      {/* Prometheus not yet available banner */}
      {promNoData && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm">
          <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-amber-700 dark:text-amber-400">
              Prometheus metrics not yet available.
            </span>{" "}
            <span className="text-amber-600 dark:text-amber-500">
              Alloy needs ~2 scrape cycles (2 min) to push data to Grafana Cloud after startup.
              Charts will auto-update once data arrives.
            </span>
          </div>
        </div>
      )}

      {/* Stat cards — 6 cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <StatCardItem key={i} label="—" value="—" loading />
            ))
          : (stats.data ?? []).map((card) => (
              <StatCardItem
                key={card.label}
                label={card.label}
                value={card.value}
                unit={card.unit}
                loading={false}
              />
            ))}
      </div>

      {/* Row 1: Request Rate + JVM Heap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard
          title="Request Rate (req/s)"
          height={220}
          loading={httpRate.isLoading}
          error={!httpRate.isLoading && !httpRate.data?.length}
        >
          <Line
            data={{
              labels: rateLabels,
              datasets: [
                {
                  label: "req/s",
                  data: rateValues,
                  borderColor: "rgb(13, 148, 136)",
                  backgroundColor: "rgba(13, 148, 136, 0.08)",
                  borderWidth: 2,
                  fill: true,
                  tension: 0.3,
                  pointRadius: 0,
                },
              ],
            }}
            options={{
              ...lineOptions,
              scales: {
                ...lineOptions.scales,
                y: {
                  ...lineOptions.scales.y,
                  ticks: {
                    ...lineOptions.scales.y.ticks,
                    callback: (v) => `${Number(v).toFixed(2)}`,
                  },
                },
              },
            }}
          />
        </ChartCard>

        <ChartCard
          title="JVM Heap Used (MB)"
          height={220}
          loading={jvmHeap.isLoading}
          error={!jvmHeap.isLoading && !jvmHeap.data?.length}
        >
          <Line
            data={{
              labels: heapLabels,
              datasets: [
                {
                  label: "Heap MB",
                  data: heapValues,
                  borderColor: "rgb(99, 102, 241)",
                  backgroundColor: "rgba(99, 102, 241, 0.08)",
                  borderWidth: 2,
                  fill: true,
                  tension: 0.3,
                  pointRadius: 0,
                },
              ],
            }}
            options={{
              ...lineOptions,
              scales: {
                ...lineOptions.scales,
                y: {
                  ...lineOptions.scales.y,
                  ticks: {
                    ...lineOptions.scales.y.ticks,
                    callback: (v) => `${Math.round(Number(v))} MB`,
                  },
                },
              },
            }}
          />
        </ChartCard>
      </div>

      {/* Row 2: CPU Usage + HikariCP Pool */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard
          title="CPU Usage (%)"
          height={220}
          loading={cpuUsage.isLoading}
          error={!cpuUsage.isLoading && !cpuUsage.data?.timestamps.length}
        >
          <Line
            data={{
              labels: cpuLabels,
              datasets: [
                {
                  label: "Process CPU",
                  data: cpuUsage.data?.process ?? [],
                  borderColor: "rgb(13, 148, 136)",
                  backgroundColor: "rgba(13, 148, 136, 0.08)",
                  borderWidth: 2,
                  fill: false,
                  tension: 0.3,
                  pointRadius: 0,
                },
                {
                  label: "System CPU",
                  data: cpuUsage.data?.system ?? [],
                  borderColor: "rgb(148, 163, 184)",
                  backgroundColor: "rgba(148, 163, 184, 0.08)",
                  borderWidth: 2,
                  fill: false,
                  tension: 0.3,
                  pointRadius: 0,
                },
              ],
            }}
            options={{
              ...lineOptionsMulti,
              scales: {
                ...lineOptions.scales,
                y: {
                  ...lineOptions.scales.y,
                  ticks: {
                    ...lineOptions.scales.y.ticks,
                    callback: (v) => `${Number(v).toFixed(1)}%`,
                  },
                },
              },
            }}
          />
        </ChartCard>

        <ChartCard
          title="HikariCP Pool"
          height={220}
          loading={hikariPool.isLoading}
          error={!hikariPool.isLoading && !hikariPool.data?.timestamps.length}
        >
          <Line
            data={{
              labels: hikariLabels,
              datasets: [
                {
                  label: "Active",
                  data: hikariPool.data?.active ?? [],
                  borderColor: "rgb(13, 148, 136)",
                  backgroundColor: "rgba(13, 148, 136, 0.08)",
                  borderWidth: 2,
                  fill: false,
                  tension: 0.3,
                  pointRadius: 0,
                },
                {
                  label: "Idle",
                  data: hikariPool.data?.idle ?? [],
                  borderColor: "rgb(99, 102, 241)",
                  backgroundColor: "rgba(99, 102, 241, 0.08)",
                  borderWidth: 2,
                  fill: false,
                  tension: 0.3,
                  pointRadius: 0,
                },
                {
                  label: "Max",
                  data: hikariPool.data?.max ?? [],
                  borderColor: "rgb(245, 158, 11)",
                  backgroundColor: "rgba(245, 158, 11, 0.08)",
                  borderWidth: 2,
                  borderDash: [4, 4],
                  fill: false,
                  tension: 0.3,
                  pointRadius: 0,
                },
              ],
            }}
            options={{
              ...lineOptionsMulti,
              scales: {
                ...lineOptions.scales,
                y: {
                  ...lineOptions.scales.y,
                  ticks: {
                    ...lineOptions.scales.y.ticks,
                    callback: (v) => `${Math.round(Number(v))}`,
                  },
                },
              },
            }}
          />
        </ChartCard>
      </div>

      {/* Row 3: JVM Threads + GC Pause */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard
          title="JVM Threads"
          height={220}
          loading={jvmThreads.isLoading}
          error={!jvmThreads.isLoading && !jvmThreads.data?.timestamps.length}
        >
          <Line
            data={{
              labels: threadLabels,
              datasets: [
                {
                  label: "Live",
                  data: jvmThreads.data?.live ?? [],
                  borderColor: "rgb(13, 148, 136)",
                  backgroundColor: "rgba(13, 148, 136, 0.08)",
                  borderWidth: 2,
                  fill: false,
                  tension: 0.3,
                  pointRadius: 0,
                },
                {
                  label: "Daemon",
                  data: jvmThreads.data?.daemon ?? [],
                  borderColor: "rgb(99, 102, 241)",
                  backgroundColor: "rgba(99, 102, 241, 0.08)",
                  borderWidth: 2,
                  fill: false,
                  tension: 0.3,
                  pointRadius: 0,
                },
                {
                  label: "Peak",
                  data: jvmThreads.data?.peak ?? [],
                  borderColor: "rgb(245, 158, 11)",
                  backgroundColor: "rgba(245, 158, 11, 0.08)",
                  borderWidth: 2,
                  fill: false,
                  tension: 0.3,
                  pointRadius: 0,
                },
              ],
            }}
            options={{
              ...lineOptionsMulti,
              scales: {
                ...lineOptions.scales,
                y: {
                  ...lineOptions.scales.y,
                  ticks: {
                    ...lineOptions.scales.y.ticks,
                    callback: (v) => `${Math.round(Number(v))}`,
                  },
                },
              },
            }}
          />
        </ChartCard>

        <ChartCard
          title="GC Pause Time (s/s)"
          height={220}
          loading={gcPause.isLoading}
          error={!gcPause.isLoading && !gcPause.data?.length}
        >
          <Line
            data={{
              labels: gcLabels,
              datasets: [
                {
                  label: "GC pause s/s",
                  data: gcValues,
                  borderColor: "rgb(239, 68, 68)",
                  backgroundColor: "rgba(239, 68, 68, 0.08)",
                  borderWidth: 2,
                  fill: true,
                  tension: 0.3,
                  pointRadius: 0,
                },
              ],
            }}
            options={{
              ...lineOptions,
              scales: {
                ...lineOptions.scales,
                y: {
                  ...lineOptions.scales.y,
                  ticks: {
                    ...lineOptions.scales.y.ticks,
                    callback: (v) => `${Number(v).toFixed(4)}`,
                  },
                },
              },
            }}
          />
        </ChartCard>
      </div>
    </div>
  );
}

// ── Logs Tab ──────────────────────────────────────────────────────────────────

function LogsTab() {
  const volume = useLogVolume();
  const errors = useRecentErrors();
  const logCount = useLogCountStat();

  const volLabels = (volume.data?.timestamps ?? []).map((t) => formatTime(t));

  const total = logCount.data?.total ?? 0;
  const errs = logCount.data?.errors ?? 0;
  const errorRatePct =
    !logCount.isLoading && total > 0
      ? `${((errs / total) * 100).toFixed(1)}`
      : logCount.isLoading ? "—" : "0";

  return (
    <div className="space-y-5">
      {/* Loki stat cards — 4 cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCardItem
          label="Total Lines (1h)"
          value={logCount.isLoading ? "—" : String(Math.round(total))}
          unit={logCount.isLoading ? undefined : "lines"}
          loading={logCount.isLoading}
        />
        <StatCardItem
          label="Errors (1h)"
          value={logCount.isLoading ? "—" : String(Math.round(errs))}
          unit={logCount.isLoading ? undefined : "lines"}
          loading={logCount.isLoading}
        />
        <StatCardItem
          label="Warnings (1h)"
          value={logCount.isLoading ? "—" : String(Math.round(logCount.data?.warns ?? 0))}
          unit={logCount.isLoading ? undefined : "lines"}
          loading={logCount.isLoading}
        />
        <StatCardItem
          label="Error Rate (1h)"
          value={errorRatePct}
          unit={logCount.isLoading ? undefined : "%"}
          loading={logCount.isLoading}
        />
      </div>

      {/* Log volume chart */}
      <ChartCard
        title="Log Volume by Level (5-min buckets, last 3 h)"
        height={240}
        loading={volume.isLoading}
        error={!volume.isLoading && !volume.data?.timestamps.length}
      >
        <Bar
          data={{
            labels: volLabels,
            datasets: [
              {
                label: "ERROR",
                data: volume.data?.error ?? [],
                backgroundColor: "rgba(239, 68, 68, 0.8)",
              },
              {
                label: "WARN",
                data: volume.data?.warn ?? [],
                backgroundColor: "rgba(245, 158, 11, 0.8)",
              },
              {
                label: "INFO",
                data: volume.data?.info ?? [],
                backgroundColor: "rgba(59, 130, 246, 0.6)",
              },
            ],
          }}
          options={barOptions}
        />
      </ChartCard>

      {/* Recent error/warn log table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <p className="text-sm font-semibold">Recent Errors &amp; Warnings (last 30 min)</p>
          {errors.isFetching && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          )}
        </div>

        {errors.isLoading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-9 rounded bg-muted animate-pulse" />
            ))}
          </div>
        ) : !errors.data?.length ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
            <Activity className="h-5 w-5" />
            <p className="text-sm">No errors or warnings in the last 30 minutes</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {errors.data.map((entry, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3">
                <LevelBadge level={entry.level} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground truncate font-mono">
                    {entry.message}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {formatDateTime(entry.ts)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MonitoringPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("metrics");
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Track auto-refresh timestamp
  useEffect(() => {
    const id = setInterval(() => setLastRefreshed(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: "metrics", label: "System Metrics", icon: BarChart3 },
    { key: "logs", label: "Logs Explorer", icon: ScrollText },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* ── Header ── */}
      <div className="px-8 pt-8 pb-6 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 shrink-0">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                System Monitoring
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Real-time metrics and logs from Grafana Cloud — updates every 60 s
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground">
              Refreshed {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            <a
              href={`${GRAFANA_BASE}/dashboards`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open Grafana
            </a>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1 mt-6">
          {tabs.map(({ key, label, icon }) => (
            <TabButton
              key={key}
              label={label}
              icon={icon}
              active={activeTab === key}
              onClick={() => setActiveTab(key)}
            />
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 p-8 pt-6">
        {activeTab === "metrics" ? <MetricsTab /> : <LogsTab />}
      </div>

      {/* ── Footer ── */}
      <div className="px-8 pb-6">
        <p className="text-xs text-muted-foreground text-center">
          Data via Grafana Alloy → Prometheus &amp; Loki (Grafana Cloud ·
          bavanchun) · Auto-refreshes every 60 s
        </p>
      </div>
    </div>
  );
}
