"use client";

import { useQuery } from "@tanstack/react-query";

// ── Time helpers ──────────────────────────────────────────────────────────────

function nowUnix() {
  return Math.floor(Date.now() / 1000);
}

function hoursAgoUnix(h: number) {
  return Math.floor(Date.now() / 1000) - h * 3600;
}

// ── Raw response types ────────────────────────────────────────────────────────

interface PromMatrixResult {
  metric: Record<string, string>;
  values: [number, string][];
}

interface PromVectorResult {
  metric: Record<string, string>;
  value: [number, string];
}

interface PromRangeResponse {
  status: string;
  data: { resultType: "matrix"; result: PromMatrixResult[] };
}

interface PromInstantResponse {
  status: string;
  data: { resultType: "vector"; result: PromVectorResult[] };
}

// Loki stream query (log entries)
interface LokiStream {
  stream: Record<string, string>;
  values: [string, string][]; // [nanosecond_timestamp_string, log_line]
}

interface LokiStreamResponse {
  status: string;
  data: { resultType: "streams"; result: LokiStream[] };
}

// Loki metric query (count_over_time etc.) — same format as Prometheus matrix
interface LokiMatrixResponse {
  status: string;
  data: { resultType: "matrix"; result: PromMatrixResult[] };
}

// ── Fetch helpers ─────────────────────────────────────────────────────────────

async function fetchProm(
  type: "range" | "instant",
  params: Record<string, string>
): Promise<PromRangeResponse | PromInstantResponse> {
  const url = new URL("/api/grafana/prometheus", window.location.origin);
  url.searchParams.set("type", type);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Prometheus proxy ${res.status}`);
  return res.json();
}

async function fetchLokiStreams(
  params: Record<string, string>
): Promise<LokiStreamResponse> {
  const url = new URL("/api/grafana/loki", window.location.origin);
  url.searchParams.set("type", "range");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Loki proxy ${res.status}`);
  return res.json();
}

async function fetchLokiMatrix(
  params: Record<string, string>
): Promise<LokiMatrixResponse> {
  const url = new URL("/api/grafana/loki", window.location.origin);
  url.searchParams.set("type", "range");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Loki proxy ${res.status}`);
  return res.json();
}

// ── Public types ──────────────────────────────────────────────────────────────

export interface TimeSeriesPoint {
  ts: number; // unix seconds
  value: number;
}

export interface StatCard {
  label: string;
  value: string;
  unit?: string;
}

export interface LogEntry {
  ts: number; // unix seconds
  level: string;
  message: string;
}

export interface LogVolumeSeries {
  timestamps: number[];
  error: number[];
  warn: number[];
  info: number[];
}

export interface CpuUsageData {
  timestamps: number[];
  process: number[];
  system: number[];
}

export interface HikariPoolData {
  timestamps: number[];
  active: number[];
  idle: number[];
  max: number[];
}

export interface JvmThreadsData {
  timestamps: number[];
  live: number[];
  daemon: number[];
  peak: number[];
}

// ── Uptime formatter ──────────────────────────────────────────────────────────

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

// ── HTTP request rate (req/s, 1-min rate, last 3 hours) ──────────────────────

export function useHttpRequestRate() {
  return useQuery({
    queryKey: ["monitoring", "http-rate"],
    queryFn: async (): Promise<TimeSeriesPoint[]> => {
      const data = (await fetchProm("range", {
        query: `sum(rate(spring_security_http_secured_requests_seconds_count{job="tc-llm-generator"}[1m]))`,
        start: String(hoursAgoUnix(3)),
        end: String(nowUnix()),
        step: "60",
      })) as PromRangeResponse;

      const series = data.data.result[0]?.values ?? [];
      return series.map(([ts, v]) => ({ ts, value: parseFloat(v) }));
    },
    refetchInterval: 60_000,
    staleTime: 55_000,
  });
}

// ── JVM heap used (last 3 hours) ─────────────────────────────────────────────

export function useJvmHeap() {
  return useQuery({
    queryKey: ["monitoring", "jvm-heap"],
    queryFn: async (): Promise<TimeSeriesPoint[]> => {
      const data = (await fetchProm("range", {
        query: `jvm_memory_used_bytes{job="tc-llm-generator",area="heap"}`,
        start: String(hoursAgoUnix(3)),
        end: String(nowUnix()),
        step: "60",
      })) as PromRangeResponse;

      const series = data.data.result[0]?.values ?? [];
      return series.map(([ts, v]) => ({
        ts,
        value: parseFloat(v) / 1024 / 1024, // bytes → MB
      }));
    },
    refetchInterval: 60_000,
    staleTime: 55_000,
  });
}

// ── CPU usage (process + system, last 3 hours) ───────────────────────────────

export function useCpuUsage() {
  return useQuery({
    queryKey: ["monitoring", "cpu-usage"],
    queryFn: async (): Promise<CpuUsageData> => {
      const [processRes, systemRes] = await Promise.all([
        fetchProm("range", {
          query: `process_cpu_usage{job="tc-llm-generator"} * 100`,
          start: String(hoursAgoUnix(3)),
          end: String(nowUnix()),
          step: "60",
        }) as Promise<PromRangeResponse>,
        fetchProm("range", {
          query: `system_cpu_usage{job="tc-llm-generator"} * 100`,
          start: String(hoursAgoUnix(3)),
          end: String(nowUnix()),
          step: "60",
        }) as Promise<PromRangeResponse>,
      ]);

      const processValues = processRes.data.result[0]?.values ?? [];
      const systemValues = systemRes.data.result[0]?.values ?? [];

      const tsSet = new Set<number>();
      for (const [ts] of processValues) tsSet.add(ts);
      for (const [ts] of systemValues) tsSet.add(ts);

      const processMap = new Map(processValues.map(([ts, v]) => [ts, parseFloat(v)]));
      const systemMap = new Map(systemValues.map(([ts, v]) => [ts, parseFloat(v)]));

      const timestamps = [...tsSet].sort((a, b) => a - b);
      return {
        timestamps,
        process: timestamps.map((t) => processMap.get(t) ?? 0),
        system: timestamps.map((t) => systemMap.get(t) ?? 0),
      };
    },
    refetchInterval: 60_000,
    staleTime: 55_000,
  });
}

// ── HikariCP connection pool (last 3 hours) ───────────────────────────────────

export function useHikariPool() {
  return useQuery({
    queryKey: ["monitoring", "hikari-pool"],
    queryFn: async (): Promise<HikariPoolData> => {
      const [activeRes, idleRes, maxRes] = await Promise.all([
        fetchProm("range", {
          query: `hikaricp_connections_active{job="tc-llm-generator"}`,
          start: String(hoursAgoUnix(3)),
          end: String(nowUnix()),
          step: "60",
        }) as Promise<PromRangeResponse>,
        fetchProm("range", {
          query: `hikaricp_connections_idle{job="tc-llm-generator"}`,
          start: String(hoursAgoUnix(3)),
          end: String(nowUnix()),
          step: "60",
        }) as Promise<PromRangeResponse>,
        fetchProm("range", {
          query: `hikaricp_connections_max{job="tc-llm-generator"}`,
          start: String(hoursAgoUnix(3)),
          end: String(nowUnix()),
          step: "60",
        }) as Promise<PromRangeResponse>,
      ]);

      const activeValues = activeRes.data.result[0]?.values ?? [];
      const idleValues = idleRes.data.result[0]?.values ?? [];
      const maxValues = maxRes.data.result[0]?.values ?? [];

      const tsSet = new Set<number>();
      for (const [ts] of activeValues) tsSet.add(ts);
      for (const [ts] of idleValues) tsSet.add(ts);
      for (const [ts] of maxValues) tsSet.add(ts);

      const activeMap = new Map(activeValues.map(([ts, v]) => [ts, parseFloat(v)]));
      const idleMap = new Map(idleValues.map(([ts, v]) => [ts, parseFloat(v)]));
      const maxMap = new Map(maxValues.map(([ts, v]) => [ts, parseFloat(v)]));

      const timestamps = [...tsSet].sort((a, b) => a - b);
      return {
        timestamps,
        active: timestamps.map((t) => activeMap.get(t) ?? 0),
        idle: timestamps.map((t) => idleMap.get(t) ?? 0),
        max: timestamps.map((t) => maxMap.get(t) ?? 0),
      };
    },
    refetchInterval: 60_000,
    staleTime: 55_000,
  });
}

// ── JVM threads (last 3 hours) ────────────────────────────────────────────────

export function useJvmThreads() {
  return useQuery({
    queryKey: ["monitoring", "jvm-threads"],
    queryFn: async (): Promise<JvmThreadsData> => {
      const [liveRes, daemonRes, peakRes] = await Promise.all([
        fetchProm("range", {
          query: `jvm_threads_live_threads{job="tc-llm-generator"}`,
          start: String(hoursAgoUnix(3)),
          end: String(nowUnix()),
          step: "60",
        }) as Promise<PromRangeResponse>,
        fetchProm("range", {
          query: `jvm_threads_daemon_threads{job="tc-llm-generator"}`,
          start: String(hoursAgoUnix(3)),
          end: String(nowUnix()),
          step: "60",
        }) as Promise<PromRangeResponse>,
        fetchProm("range", {
          query: `jvm_threads_peak_threads{job="tc-llm-generator"}`,
          start: String(hoursAgoUnix(3)),
          end: String(nowUnix()),
          step: "60",
        }) as Promise<PromRangeResponse>,
      ]);

      const liveValues = liveRes.data.result[0]?.values ?? [];
      const daemonValues = daemonRes.data.result[0]?.values ?? [];
      const peakValues = peakRes.data.result[0]?.values ?? [];

      const tsSet = new Set<number>();
      for (const [ts] of liveValues) tsSet.add(ts);
      for (const [ts] of daemonValues) tsSet.add(ts);
      for (const [ts] of peakValues) tsSet.add(ts);

      const liveMap = new Map(liveValues.map(([ts, v]) => [ts, parseFloat(v)]));
      const daemonMap = new Map(daemonValues.map(([ts, v]) => [ts, parseFloat(v)]));
      const peakMap = new Map(peakValues.map(([ts, v]) => [ts, parseFloat(v)]));

      const timestamps = [...tsSet].sort((a, b) => a - b);
      return {
        timestamps,
        live: timestamps.map((t) => liveMap.get(t) ?? 0),
        daemon: timestamps.map((t) => daemonMap.get(t) ?? 0),
        peak: timestamps.map((t) => peakMap.get(t) ?? 0),
      };
    },
    refetchInterval: 60_000,
    staleTime: 55_000,
  });
}

// ── GC pause time rate (last 3 hours) ────────────────────────────────────────

export function useGcPause() {
  return useQuery({
    queryKey: ["monitoring", "gc-pause"],
    queryFn: async (): Promise<TimeSeriesPoint[]> => {
      const data = (await fetchProm("range", {
        query: `sum(rate(jvm_gc_pause_seconds_sum{job="tc-llm-generator"}[1m]))`,
        start: String(hoursAgoUnix(3)),
        end: String(nowUnix()),
        step: "60",
      })) as PromRangeResponse;

      const series = data.data.result[0]?.values ?? [];
      return series.map(([ts, v]) => ({ ts, value: parseFloat(v) }));
    },
    refetchInterval: 60_000,
    staleTime: 55_000,
  });
}

// ── Prometheus stat cards (6 cards) ──────────────────────────────────────────

export function useMetricStats() {
  return useQuery({
    queryKey: ["monitoring", "stats"],
    queryFn: async (): Promise<StatCard[]> => {
      const now = String(nowUnix());
      const [uptime, requestRate, latencySum, latencyCount, errorRate, cpu, hikari] =
        await Promise.all([
          fetchProm("instant", {
            query: `process_uptime_seconds{job="tc-llm-generator"}`,
            time: now,
          }) as Promise<PromInstantResponse>,
          fetchProm("instant", {
            query: `sum(rate(spring_security_http_secured_requests_seconds_count{job="tc-llm-generator"}[1m]))`,
            time: now,
          }) as Promise<PromInstantResponse>,
          fetchProm("instant", {
            query: `sum(rate(spring_security_http_secured_requests_seconds_sum{job="tc-llm-generator"}[5m]))`,
            time: now,
          }) as Promise<PromInstantResponse>,
          fetchProm("instant", {
            query: `sum(rate(spring_security_http_secured_requests_seconds_count{job="tc-llm-generator"}[5m]))`,
            time: now,
          }) as Promise<PromInstantResponse>,
          fetchProm("instant", {
            query: `sum(rate(logback_events_total{job="tc-llm-generator",level="error"}[5m])) / sum(rate(logback_events_total{job="tc-llm-generator"}[5m])) * 100`,
            time: now,
          }) as Promise<PromInstantResponse>,
          fetchProm("instant", {
            query: `process_cpu_usage{job="tc-llm-generator"} * 100`,
            time: now,
          }) as Promise<PromInstantResponse>,
          fetchProm("instant", {
            query: `hikaricp_connections_active{job="tc-llm-generator"}`,
            time: now,
          }) as Promise<PromInstantResponse>,
        ]);

      const val = (r: PromInstantResponse) =>
        r.data.result[0]?.value[1] ?? null;

      const fmt = (v: string | null, decimals = 2) => {
        if (v === null) return "N/A";
        const n = parseFloat(v);
        return isNaN(n) ? "N/A" : n.toFixed(decimals);
      };

      const uptimeVal = val(uptime);
      const rateVal = val(requestRate);
      const latSumVal = val(latencySum);
      const latCntVal = val(latencyCount);
      const errVal = val(errorRate);
      const cpuVal = val(cpu);
      const hikVal = val(hikari);

      // Avg latency in ms
      let latencyMs = "N/A";
      if (latSumVal !== null && latCntVal !== null) {
        const cnt = parseFloat(latCntVal);
        latencyMs = cnt > 0
          ? String(Math.round((parseFloat(latSumVal) / cnt) * 1000))
          : "0";
      }

      return [
        {
          label: "Uptime",
          value: uptimeVal === null ? "N/A" : formatUptime(parseFloat(uptimeVal)),
        },
        {
          label: "Request Rate",
          value: rateVal === null ? "N/A" : fmt(rateVal, 2),
          unit: rateVal === null ? undefined : "req/s",
        },
        {
          label: "Avg Latency (5m)",
          value: latencyMs,
          unit: latencyMs === "N/A" ? undefined : "ms",
        },
        {
          label: "Error Log Rate (5m)",
          value: errVal === null ? "N/A" : fmt(errVal, 2),
          unit: errVal === null ? undefined : "%",
        },
        {
          label: "CPU Usage",
          value: cpuVal === null ? "N/A" : fmt(cpuVal, 1),
          unit: cpuVal === null ? undefined : "%",
        },
        {
          label: "HikariCP Active",
          value: fmt(hikVal, 0),
          unit: hikVal === null ? undefined : "conn",
        },
      ];
    },
    refetchInterval: 60_000,
    staleTime: 55_000,
  });
}

// ── Log volume by level (last 3 hours, 5-min buckets) ────────────────────────
// Uses a single Loki metric query: sum by (level) (count_over_time(...))
// Response is a Prometheus-style matrix (timestamps in seconds, not nanoseconds)

export function useLogVolume() {
  return useQuery({
    queryKey: ["monitoring", "log-volume"],
    queryFn: async (): Promise<LogVolumeSeries> => {
      const start = String(hoursAgoUnix(3));
      const end = String(nowUnix());

      const res = await fetchLokiMatrix({
        // sum by (level) gives one series per log level in a single request
        query: `sum by (level) (count_over_time({app="tc-llm-generator"}[5m]))`,
        start,
        end,
        step: "300", // 5-min buckets
      });

      const maps: Record<string, Map<number, number>> = {
        ERROR: new Map(),
        WARN: new Map(),
        INFO: new Map(),
      };
      const tsSet = new Set<number>();

      for (const series of res.data.result) {
        const lvl = series.metric.level;
        if (!lvl || !maps[lvl]) continue;
        for (const [ts, val] of series.values) {
          // Loki metric (matrix) timestamps are float seconds — same as Prometheus
          tsSet.add(ts);
          maps[lvl].set(ts, parseFloat(val));
        }
      }

      const timestamps = [...tsSet].sort((a, b) => a - b);
      return {
        timestamps,
        error: timestamps.map((t) => maps["ERROR"].get(t) ?? 0),
        warn: timestamps.map((t) => maps["WARN"].get(t) ?? 0),
        info: timestamps.map((t) => maps["INFO"].get(t) ?? 0),
      };
    },
    refetchInterval: 60_000,
    staleTime: 55_000,
  });
}

// ── Log count stat card (from Loki — available even without Prometheus) ───────

export function useLogCountStat() {
  return useQuery({
    queryKey: ["monitoring", "log-count"],
    queryFn: async (): Promise<{ total: number; errors: number; warns: number }> => {
      const start = String(hoursAgoUnix(1));
      const end = String(nowUnix());

      const res = await fetchLokiMatrix({
        query: `sum by (level) (count_over_time({app="tc-llm-generator"}[1h]))`,
        start,
        end,
        step: "3600",
      });

      let total = 0;
      let errors = 0;
      let warns = 0;

      for (const series of res.data.result) {
        const lvl = series.metric.level;
        // Last value in the range
        const last = series.values[series.values.length - 1];
        const count = last ? parseFloat(last[1]) : 0;
        total += count;
        if (lvl === "ERROR") errors += count;
        if (lvl === "WARN") warns += count;
      }

      return { total, errors, warns };
    },
    refetchInterval: 60_000,
    staleTime: 55_000,
  });
}

// ── Recent error/warn logs (last 30 min) ─────────────────────────────────────

export function useRecentErrors() {
  return useQuery({
    queryKey: ["monitoring", "recent-errors"],
    queryFn: async (): Promise<LogEntry[]> => {
      const res = await fetchLokiStreams({
        query: `{app="tc-llm-generator",level=~"ERROR|WARN"} | json`,
        start: String(hoursAgoUnix(0.5)), // 30 min
        end: String(nowUnix()),
        limit: "50",
        direction: "backward",
      });

      const entries: LogEntry[] = [];
      for (const stream of res.data.result) {
        const level = stream.stream.level ?? "UNKNOWN";
        for (const [tsNs, raw] of stream.values) {
          let message = raw;
          try {
            const parsed = JSON.parse(raw);
            message = parsed.message ?? parsed.msg ?? raw;
          } catch {
            // not JSON — use raw line
          }
          entries.push({
            ts: parseInt(tsNs) / 1_000_000_000, // nanoseconds → seconds
            level,
            message,
          });
        }
      }

      // Sort descending by time, limit to 30
      return entries
        .sort((a, b) => b.ts - a.ts)
        .slice(0, 30);
    },
    refetchInterval: 30_000,
    staleTime: 25_000,
  });
}
