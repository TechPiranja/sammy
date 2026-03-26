import { NextResponse } from "next/server";
import {
  exchangeYouTubeCode,
  setYouTubeAuthCookie,
} from "../../../../../src/server/youtube";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/schedule?youtube=missing-code", request.url));
  }

  try {
    const tokens = await exchangeYouTubeCode(code, url.origin);
    const response = NextResponse.redirect(new URL("/schedule?youtube=connected", request.url));
    setYouTubeAuthCookie(response, tokens);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "YouTube OAuth failed";
    return NextResponse.redirect(
      new URL(`/schedule?youtube=error&message=${encodeURIComponent(message)}`, request.url),
    );
  }
}