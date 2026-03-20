import { NextRequest, NextResponse } from "next/server";

const GRAFANA_BASE = process.env.GRAFANA_BASE_URL!;
const SA_TOKEN = process.env.GRAFANA_SA_TOKEN!;
const DS_UID = process.env.GRAFANA_LOKI_DATASOURCE_UID!;

/**
 * Server-side proxy to Grafana Cloud Loki datasource.
 * Keeps the SA token out of the browser.
 *
 * Usage:
 *   GET /api/grafana/loki?type=range&query={...}&start=...&end=...&step=60&limit=100
 *   GET /api/grafana/loki?type=instant&query={...}&time=...&limit=50
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type") ?? "range";

  const basePath = `${GRAFANA_BASE}/api/datasources/proxy/uid/${DS_UID}/loki/api/v1`;
  const endpoint = type === "instant" ? "query" : "query_range";
  const upstreamUrl = new URL(`${basePath}/${endpoint}`);

  const forward = ["query", "start", "end", "step", "limit", "time", "direction"];
  for (const key of forward) {
    const val = searchParams.get(key);
    if (val) upstreamUrl.searchParams.set(key, val);
  }

  try {
    const res = await fetch(upstreamUrl.toString(), {
      headers: {
        Authorization: `Bearer ${SA_TOKEN}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10_000),
    });

    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch (err) {
    console.error("[grafana/loki] fetch error:", err);
    return NextResponse.json({ error: "Grafana proxy error" }, { status: 502 });
  }
}
