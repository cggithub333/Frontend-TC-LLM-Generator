import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getBackendApiUrl } from "@/lib/env";


export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (accessToken) {
    try {
      await fetch(`${getBackendApiUrl()}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch {
      // Backend may be down — still clear cookies locally
    }
  }

  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");

  return NextResponse.json({ success: true });
}
