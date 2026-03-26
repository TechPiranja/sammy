# Sammy — social media manager

Next.js + TypeScript web app for planning and monitoring short-form content across Instagram, YouTube, and TikTok. Includes scheduling, a content calendar, and dashboards for followers and views using a modern MUI-based UI.

## Getting started

```bash
npm install
npm run dev
# production build
npm run build
# run production server
npm run start
```

## Environment

The frontend now calls Next.js API routes directly:

- `POST /api/uploads`
- `GET /api/analytics`
- `GET /api/schedule`

Those route handlers can proxy to your real backend by setting:

```
BACKEND_API_BASE_URL=https://your-backend.example.com
```

For direct YouTube integration in Next.js API routes (no separate backend), set:

```
YOUTUBE_CLIENT_ID=your-google-oauth-client-id
YOUTUBE_CLIENT_SECRET=your-google-oauth-client-secret
# optional: defaults to {origin}/api/auth/youtube/callback
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/auth/youtube/callback
```

Expected upstream backend endpoints (adjust as needed):

- `POST /uploads` — multipart form-data with `file`, optional `thumbnail`, `title`, `description`, `scheduledAt`, and `platforms` (JSON array). Should fan out to Instagram/YouTube/TikTok uploads.
- `GET /analytics` — follower + view series per platform.
- `GET /schedule` — scheduled posts to hydrate the calendar.

Without `BACKEND_API_BASE_URL`, API routes return demo/stub responses so the UI still works locally.
If YouTube is selected and OAuth is connected, `/api/uploads` uploads directly to YouTube (private video).

## Can I avoid a separate backend?

This repo already uses **Next.js API routes** as the proxy layer:

- Frontend calls `/api/uploads`, `/api/analytics`, and `/api/schedule`.
- API routes hold server-side credentials/secrets and call Instagram/YouTube/TikTok or your backend adapters.
- Responses are returned to the UI.

### Keeping your data private on a public deploy

- **Never ship platform client secrets to the browser.** They must live in the API route environment (`process.env`), not in browser-exposed env variables.
- Use **OAuth per user**: redirect users to each platform’s auth, then store their access/refresh tokens server-side (or in HttpOnly cookies scoped to your domain). Do not embed tokens in the static frontend bundle.
- For early testing without a DB, you can keep tokens in encrypted, HttpOnly cookies set by your API routes. This keeps tokens out of localStorage and out of the built assets.
- The static site remains public, but only users who complete OAuth on your domain will have valid tokens stored in their own cookies; others cannot access your data.

## Platform setup (real integrations)

**Instagram (Graph API)**

- Create a Meta app and add Instagram Graph API.
- Convert the target account to Business/Creator and link to a Facebook Page.
- Scopes: `instagram_content_publish`, `pages_show_list`, `pages_read_engagement`, `instagram_basic`, `instagram_manage_insights`.
- Exchange the user token for a long-lived token and refresh server-side.

**YouTube (Data API v3)**

- Create a Google Cloud project and OAuth client (Web application).
- Enable YouTube Data API v3.
- Scopes: `https://www.googleapis.com/auth/youtube.upload` (uploads) and `https://www.googleapis.com/auth/youtube.readonly` (analytics).
- Handle OAuth and refresh tokens on your backend; do not expose secrets to the client.

**TikTok (Open API)**

- Create a TikTok for Developers app.
- Request scopes: `video.upload`, `video.publish`, `video.list`, `user.info.basic`.
- Obtain user authorization via OAuth; store access/refresh tokens securely.

## Current capabilities

- Instagram, YouTube, TikTok placeholders with connection status.
- Upload form for short videos (title for YouTube, description for all, optional thumbnail).
- Scheduling with datetime picker and per-platform selection.
- Content calendar (monthly) with platform filters.
- Dashboard charts for follower growth and short-form views, plus per-platform cards.
- Demo data when no backend is configured; ready to call real APIs via your proxy.

## Next steps you can take

1. Wire `/uploads`, `/analytics`, and `/schedule` endpoints to your backend adapters.
2. Add “Connect” buttons that start OAuth flows via your backend.
3. Persist scheduled posts and poll platform processing state to confirm publish status.

## Quick YouTube test flow

1. Add the YouTube env vars and set your Google OAuth redirect URI to `/api/auth/youtube/callback`.
2. Open `/api/auth/youtube/start` (or use the “Connect YouTube” button in the header) and complete consent.
3. In Schedule, select YouTube, attach a video, and submit. The upload runs through `/api/uploads`.

You can verify your connected channel stats (including subscribers) at:

- `GET /api/youtube/channel`

For historical YouTube chart data, call:

- `GET /api/youtube/history`

If you connected before analytics scope was added, reconnect once via `/api/auth/youtube/start`.
