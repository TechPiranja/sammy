import type { NextResponse } from "next/server";

export const YOUTUBE_AUTH_COOKIE = "yt_auth";

type YouTubeTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  token_type: string;
};

export type YouTubeAuthCookie = {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
};

const YOUTUBE_SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
];

const getRequiredEnv = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const getYoutubeRedirectUri = (origin: string) => {
  return process.env.YOUTUBE_REDIRECT_URI ?? `${origin}/api/auth/youtube/callback`;
};

const mapTokenResponse = (
  tokenResponse: YouTubeTokenResponse,
  existingRefreshToken?: string,
): YouTubeAuthCookie => {
  return {
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token ?? existingRefreshToken,
    expiresAt: Date.now() + tokenResponse.expires_in * 1000,
  };
};

const parseTokenResponse = async (response: Response): Promise<YouTubeTokenResponse> => {
  const payload = await response.json();

  if (!response.ok) {
    const message =
      payload?.error_description ??
      payload?.error ??
      "Failed to authenticate with YouTube";
    throw new Error(message);
  }

  return payload as YouTubeTokenResponse;
};

export const buildYouTubeAuthUrl = (origin: string) => {
  const clientId = getRequiredEnv("YOUTUBE_CLIENT_ID");
  const redirectUri = getYoutubeRedirectUri(origin);

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("scope", YOUTUBE_SCOPES.join(" "));

  return url.toString();
};

export const exchangeYouTubeCode = async (code: string, origin: string) => {
  const clientId = getRequiredEnv("YOUTUBE_CLIENT_ID");
  const clientSecret = getRequiredEnv("YOUTUBE_CLIENT_SECRET");
  const redirectUri = getYoutubeRedirectUri(origin);

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });

  const tokenResponse = await parseTokenResponse(response);
  return mapTokenResponse(tokenResponse);
};

export const refreshYouTubeToken = async (refreshToken: string) => {
  const clientId = getRequiredEnv("YOUTUBE_CLIENT_ID");
  const clientSecret = getRequiredEnv("YOUTUBE_CLIENT_SECRET");

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });

  const tokenResponse = await parseTokenResponse(response);
  return mapTokenResponse(tokenResponse, refreshToken);
};

export const readYouTubeAuthCookie = (value?: string): YouTubeAuthCookie | null => {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as YouTubeAuthCookie;
    if (!parsed.accessToken || !parsed.expiresAt) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const setYouTubeAuthCookie = (response: NextResponse, tokens: YouTubeAuthCookie) => {
  response.cookies.set({
    name: YOUTUBE_AUTH_COOKIE,
    value: JSON.stringify(tokens),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
};

const concatUint8Arrays = (chunks: Uint8Array[]) => {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
};

export const uploadToYouTube = async ({
  accessToken,
  file,
  title,
  description,
}: {
  accessToken: string;
  file: File;
  title: string;
  description: string;
}) => {
  const metadata = {
    snippet: {
      title,
      description,
      categoryId: "22",
    },
    status: {
      privacyStatus: "private",
      selfDeclaredMadeForKids: false,
    },
  };

  const boundary = `youtube-upload-${crypto.randomUUID()}`;
  const encoder = new TextEncoder();

  const metadataPart = encoder.encode(
    `--${boundary}\r\n` +
      "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
      `${JSON.stringify(metadata)}\r\n`,
  );

  const mediaHeader = encoder.encode(
    `--${boundary}\r\n` +
      `Content-Type: ${file.type || "application/octet-stream"}\r\n\r\n`,
  );

  const mediaBody = new Uint8Array(await file.arrayBuffer());
  const footer = encoder.encode(`\r\n--${boundary}--\r\n`);

  const body = concatUint8Arrays([metadataPart, mediaHeader, mediaBody, footer]);

  const response = await fetch(
    "https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status&uploadType=multipart",
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": `multipart/related; boundary=${boundary}`,
      },
      body,
    },
  );

  const payload = await response.json();
  if (!response.ok) {
    const message =
      payload?.error?.message ?? payload?.error ?? "YouTube upload failed";
    throw new Error(message);
  }

  return payload as { id?: string };
};