import { NextRequest, NextResponse } from "next/server";

const GRAFANA_BASE = process.env.GRAFANA_BASE_URL!;
const SA_TOKEN = process.env.GRAFANA_SA_TOKEN!;
const DS_UID = process.env.GRAFANA_PROM_DATASOURCE_UID!;

/**
 * Server-side proxy to Grafana Cloud Prometheus datasource.
 * Keeps the SA token out of the browser.
 *
 * Usage:
 *   GET /api/grafana/prometheus?type=instant&query=up&time=1710000000
 *   GET /api/grafana/prometheus?type=range&query=up&start=...&end=...&step=60
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type") ?? "range"; // "instant" | "range"

  // Build Grafana datasource proxy URL
  const basePath = `${GRAFANA_BASE}/api/datasources/proxy/uid/${DS_UID}/api/v1`;
  const endpoint = type === "instant" ? "query" : "query_range";
  const upstreamUrl = new URL(`${basePath}/${endpoint}`);

  // Forward relevant query params
  const forward = ["query", "start", "end", "step", "time"];
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
      // 10-second server-side timeout
      signal: AbortSignal.timeout(10_000),
    });

    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch (err) {
    console.error("[grafana/prometheus] fetch error:", err);
    return NextResponse.json({ error: "Grafana proxy error" }, { status: 502 });
  }
}
