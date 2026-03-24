import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getBackendApiUrl } from "@/lib/env";

async function refreshTokens(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) return null;

  try {
    const res = await fetch(`${getBackendApiUrl()}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return null;

    const data = await res.json();
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

    return data.accessToken;
  } catch {
    return null;
  }
}

async function forwardRequest(
  request: NextRequest,
  path: string,
  token: string | undefined,
): Promise<Response> {
  const url = new URL(`${getBackendApiUrl()}/${path}`);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const init: RequestInit = {
    method: request.method,
    headers,
  };

  if (!["GET", "HEAD"].includes(request.method)) {
    try {
      const body = await request.text();
      if (body) init.body = body;
    } catch {
      // no body
    }
  }

  return fetch(url.toString(), init);
}

async function handleProxy(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const joinedPath = path.join("/");
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  let res = await forwardRequest(request, joinedPath, accessToken);

  if (res.status === 401 && accessToken) {
    const newToken = await refreshTokens();
    if (newToken) {
      res = await forwardRequest(request, joinedPath, newToken);
    } else {
      cookieStore.delete("accessToken");
      cookieStore.delete("refreshToken");
      return NextResponse.json(
        { success: false, message: "Session expired" },
        { status: 401 },
      );
    }
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  }

  return new NextResponse(res.body, {
    status: res.status,
    headers: { "Content-Type": contentType },
  });
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
