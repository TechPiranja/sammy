import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  readYouTubeAuthCookie,
  refreshYouTubeToken,
  setYouTubeAuthCookie,
  uploadToYouTube,
  YOUTUBE_AUTH_COOKIE,
} from "../../../src/server/youtube";

const backendBase = process.env.BACKEND_API_BASE_URL;

const toTargetUrl = (path: string) => {
  if (!backendBase) return null;
  return new URL(path, backendBase).toString();
};

export async function POST(request: Request) {
  const target = toTargetUrl("/uploads");

  const formData = await request.formData();

  if (!target) {
    const rawPlatforms = formData.get("platforms");
    let platforms: string[] = [];

    if (typeof rawPlatforms === "string") {
      try {
        platforms = JSON.parse(rawPlatforms) as string[];
      } catch {
        return NextResponse.json(
          { error: "Invalid platforms payload." },
          { status: 400 },
        );
      }
    }

    if (!platforms.includes("youtube")) {
      return NextResponse.json({
        id: crypto.randomUUID?.() ?? String(Date.now()),
        status: "stubbed",
        note: "No external backend configured and YouTube was not selected.",
      });
    }

    const maybeFile = formData.get("file");
    if (!(maybeFile instanceof File)) {
      return NextResponse.json(
        { error: "Missing video file for YouTube upload." },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const auth = readYouTubeAuthCookie(
      cookieStore.get(YOUTUBE_AUTH_COOKIE)?.value,
    );

    if (!auth) {
      return NextResponse.json(
        {
          error:
            "YouTube is not connected. Open /api/auth/youtube/start first.",
        },
        { status: 401 },
      );
    }

    let nextAuth = auth;
    if (nextAuth.expiresAt <= Date.now() + 30_000 && nextAuth.refreshToken) {
      nextAuth = await refreshYouTubeToken(nextAuth.refreshToken);
    }

    const title =
      (typeof formData.get("title") === "string"
        ? (formData.get("title") as string)
        : "Sammy short upload") || "Sammy short upload";

    const description =
      typeof formData.get("description") === "string"
        ? (formData.get("description") as string)
        : "Uploaded via Sammy";

    const uploadResult = await uploadToYouTube({
      accessToken: nextAuth.accessToken,
      file: maybeFile,
      title,
      description,
    });

    const response = NextResponse.json({
      id: uploadResult.id ?? crypto.randomUUID?.() ?? String(Date.now()),
      status: "queued",
      note: "Uploaded to YouTube as private video.",
    });

    if (
      nextAuth.accessToken !== auth.accessToken ||
      nextAuth.expiresAt !== auth.expiresAt
    ) {
      setYouTubeAuthCookie(response, nextAuth);
    }

    return response;
  }

  const upstream = await fetch(target, {
    method: "POST",
    body: formData,
  });

  const contentType =
    upstream.headers.get("content-type") ?? "application/json";
  if (contentType.includes("application/json")) {
    const payload = await upstream.json();
    return NextResponse.json(payload, { status: upstream.status });
  }

  const payload = await upstream.text();
  return new NextResponse(payload, {
    status: upstream.status,
    headers: { "content-type": contentType },
  });
}
