import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  readYouTubeAuthCookie,
  refreshYouTubeToken,
  setYouTubeAuthCookie,
  YOUTUBE_AUTH_COOKIE,
} from "../../../../src/server/youtube";

type AnalyticsResponse = {
  rows?: Array<[string, number, number, number]>;
  error?: {
    message?: string;
  };
};

type ChannelResponse = {
  items?: Array<{
    statistics?: {
      subscriberCount?: string;
    };
  }>;
};

const monthKey = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export async function GET() {
  const cookieStore = await cookies();
  const auth = readYouTubeAuthCookie(cookieStore.get(YOUTUBE_AUTH_COOKIE)?.value);

  if (!auth) {
    return NextResponse.json(
      { connected: false, error: "YouTube is not connected." },
      { status: 401 },
    );
  }

  let nextAuth = auth;
  if (nextAuth.expiresAt <= Date.now() + 30_000 && nextAuth.refreshToken) {
    nextAuth = await refreshYouTubeToken(nextAuth.refreshToken);
  }

  const now = new Date();
  const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));
  const startDateStr = startDate.toISOString().slice(0, 10);
  const endDateStr = now.toISOString().slice(0, 10);

  const analyticsUrl = new URL("https://youtubeanalytics.googleapis.com/v2/reports");
  analyticsUrl.searchParams.set("ids", "channel==MINE");
  analyticsUrl.searchParams.set("startDate", startDateStr);
  analyticsUrl.searchParams.set("endDate", endDateStr);
  analyticsUrl.searchParams.set("dimensions", "month");
  analyticsUrl.searchParams.set("metrics", "subscribersGained,subscribersLost,views");
  analyticsUrl.searchParams.set("sort", "month");

  const [channelRes, analyticsRes] = await Promise.all([
    fetch("https://www.googleapis.com/youtube/v3/channels?part=statistics&mine=true", {
      headers: { authorization: `Bearer ${nextAuth.accessToken}` },
      cache: "no-store",
    }),
    fetch(analyticsUrl.toString(), {
      headers: { authorization: `Bearer ${nextAuth.accessToken}` },
      cache: "no-store",
    }),
  ]);

  const channelPayload = (await channelRes.json()) as ChannelResponse;
  const analyticsPayload = (await analyticsRes.json()) as AnalyticsResponse;

  if (!channelRes.ok || !analyticsRes.ok) {
    const analyticsMessage = analyticsPayload?.error?.message;
    const message =
      analyticsMessage ??
      "Failed to load YouTube history. Reconnect YouTube to grant analytics scope.";

    return NextResponse.json(
      {
        connected: true,
        error: message,
      },
      { status: analyticsRes.ok ? channelRes.status : analyticsRes.status },
    );
  }

  const currentSubscribers = Number(
    channelPayload.items?.[0]?.statistics?.subscriberCount ?? "0",
  );

  const rows = analyticsPayload.rows ?? [];

  const netByMonth = new Map<string, number>();
  const viewsByMonth = new Map<string, number>();

  for (const row of rows) {
    const [month, gained, lost, views] = row;
    netByMonth.set(month, Number(gained) - Number(lost));
    viewsByMonth.set(month, Number(views));
  }

  const points: Array<{ date: string; youtubeFollowers: number; youtubeViews: number }> = [];
  for (let idx = 0; idx < 6; idx += 1) {
    const d = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth() + idx, 1));
    const key = monthKey(d);
    points.push({
      date: `${key}-01`,
      youtubeFollowers: 0,
      youtubeViews: viewsByMonth.get(key) ?? 0,
    });
  }

  if (points.length > 0) {
    points[points.length - 1].youtubeFollowers = currentSubscribers;

    for (let idx = points.length - 2; idx >= 0; idx -= 1) {
      const nextMonthKey = points[idx + 1].date.slice(0, 7);
      const nextNet = netByMonth.get(nextMonthKey) ?? 0;
      points[idx].youtubeFollowers = Math.max(
        0,
        points[idx + 1].youtubeFollowers - nextNet,
      );
    }
  }

  const response = NextResponse.json({
    connected: true,
    history: points,
  });

  if (
    nextAuth.accessToken !== auth.accessToken ||
    nextAuth.expiresAt !== auth.expiresAt
  ) {
    setYouTubeAuthCookie(response, nextAuth);
  }

  return response;
}
