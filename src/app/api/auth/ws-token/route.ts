/**
 * API route to provide the access token to the frontend for WebSocket auth.
 * Since cookies are httpOnly, the client cannot read them directly via JS.
 * This endpoint safely returns the token via a server-side Next.js API route.
 */
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { token: null },
      { status: 401 }
    );
  }

  return NextResponse.json({ token: accessToken });
}
