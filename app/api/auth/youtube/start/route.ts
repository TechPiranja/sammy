import { NextResponse } from "next/server";
import { buildYouTubeAuthUrl } from "../../../../../src/server/youtube";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  try {
    const authUrl = buildYouTubeAuthUrl(origin);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to start YouTube OAuth";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}