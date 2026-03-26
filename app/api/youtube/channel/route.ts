import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  readYouTubeAuthCookie,
  refreshYouTubeToken,
  setYouTubeAuthCookie,
  YOUTUBE_AUTH_COOKIE,
} from "../../../../src/server/youtube";

type YouTubeChannelResponse = {
  items?: Array<{
    id?: string;
    snippet?: {
      title?: string;
      thumbnails?: {
        default?: { url?: string };
        medium?: { url?: string };
        high?: { url?: string };
      };
    };
    statistics?: {
      subscriberCount?: string;
      viewCount?: string;
      videoCount?: string;
      hiddenSubscriberCount?: boolean;
    };
  }>;
  error?: {
    message?: string;
  };
};

export async function GET() {
  const cookieStore = await cookies();
  const auth = readYouTubeAuthCookie(cookieStore.get(YOUTUBE_AUTH_COOKIE)?.value);

  if (!auth) {
    return NextResponse.json(
      {
        connected: false,
        error: "YouTube is not connected. Open /api/auth/youtube/start first.",
      },
      { status: 401 },
    );
  }

  let nextAuth = auth;
  if (nextAuth.expiresAt <= Date.now() + 30_000 && nextAuth.refreshToken) {
    nextAuth = await refreshYouTubeToken(nextAuth.refreshToken);
  }

  const upstream = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
    {
      headers: {
        authorization: `Bearer ${nextAuth.accessToken}`,
      },
      cache: "no-store",
    },
  );

  const payload = (await upstream.json()) as YouTubeChannelResponse;

  if (!upstream.ok) {
    return NextResponse.json(
      {
        connected: true,
        error: payload.error?.message ?? "Failed to load YouTube channel data.",
      },
      { status: upstream.status },
    );
  }

  const channel = payload.items?.[0];
  const response = NextResponse.json({
    connected: true,
    channelId: channel?.id ?? null,
    title: channel?.snippet?.title ?? null,
    profileImageUrl:
      channel?.snippet?.thumbnails?.high?.url ??
      channel?.snippet?.thumbnails?.medium?.url ??
      channel?.snippet?.thumbnails?.default?.url ??
      null,
    subscribers: channel?.statistics?.subscriberCount
      ? Number(channel.statistics.subscriberCount)
      : null,
    subscribersHidden: channel?.statistics?.hiddenSubscriberCount ?? false,
    views: channel?.statistics?.viewCount
      ? Number(channel.statistics.viewCount)
      : null,
    videos: channel?.statistics?.videoCount
      ? Number(channel.statistics.videoCount)
      : null,
  });

  if (
    nextAuth.accessToken !== auth.accessToken ||
    nextAuth.expiresAt !== auth.expiresAt
  ) {
    setYouTubeAuthCookie(response, nextAuth);
  }

  return response;
}
