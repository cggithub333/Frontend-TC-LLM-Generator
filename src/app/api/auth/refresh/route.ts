import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:8080/api/v1";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { success: false, message: "No refresh token" },
      { status: 401 }
    );
  }

  try {
    const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await res.json();

    if (!res.ok) {
      cookieStore.delete("accessToken");
      cookieStore.delete("refreshToken");
      return NextResponse.json(data, { status: res.status });
    }

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

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to connect to server" },
      { status: 502 }
    );
  }
}
