import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/forgot-password", "/terms", "/privacy"];

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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;
  const hasToken = !!accessToken;

  const isPublicPath = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  // Unauthenticated users → redirect to login (except public paths)
  if (!hasToken && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated users on public paths → redirect to workspaces
  if (hasToken && isPublicPath) {
    return NextResponse.redirect(new URL("/workspaces", request.url));
  }

  // Admin route protection: check JWT roles claim
  if (pathname.startsWith("/admin") && accessToken) {
    const claims = decodeJwtPayload(accessToken);
    if (!claims) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const roles = claims.roles;
    let userRole: string;
    if (Array.isArray(roles)) {
      userRole = roles[0] as string;
    } else if (typeof roles === "string") {
      userRole = roles;
    } else {
      userRole = "USER";
    }

    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/workspaces", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
