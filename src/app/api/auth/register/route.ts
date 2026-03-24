import { NextResponse } from "next/server";
import { getBackendApiUrl } from "@/lib/env";


export async function POST(request: Request) {
  try {
    const body = await request.json();

    const res = await fetch(`${getBackendApiUrl()}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    // New signup flow: return SignupResponse (message, expiresInSeconds, cooldownSeconds)
    // No auth tokens — user must verify email first
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to connect to server" },
      { status: 502 }
    );
  }
}
