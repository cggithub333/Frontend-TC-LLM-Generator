import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:8080/api/v1";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], "base64url").toString("utf-8");
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const res = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === "production";

    cookieStore.set("accessToken", data.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });

    cookieStore.set("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    // Extract role from JWT to enable role-based redirect on client
    const claims = decodeJwtPayload(data.accessToken);
    const roles = claims?.roles;
    let role = "USER";
    if (Array.isArray(roles)) {
      role = (roles[0] as string) || "USER";
    } else if (typeof roles === "string") {
      role = roles;
    }

    return NextResponse.json({ success: true, role });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to connect to server" },
      { status: 502 }
    );
  }
}
