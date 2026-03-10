import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }

  const claims = decodeJwtPayload(accessToken);

  if (!claims) {
    return NextResponse.json(
      { success: false, message: "Invalid token" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      id: claims.sub,
      email: claims.email,
      name: claims.name,
    },
  });
}
