# Sammy — social media manager

React + Vite + TypeScript web app for planning and monitoring short-form content across Instagram, YouTube, and TikTok. Includes scheduling, a content calendar, and dashboards for followers and views using a modern MUI-based UI.

## Getting started

```bash
npm install
npm run dev
# production build
npm run build
```

## Environment

Real uploads and analytics are proxied through your backend. Point the frontend to it with:

```
VITE_API_BASE_URL=https://your-backend.example.com
```

Expected backend endpoints (adjust as needed):

- `POST /uploads` — multipart form-data with `file`, optional `thumbnail`, `title`, `description`, `scheduledAt`, and `platforms` (JSON array). Should fan out to Instagram/YouTube/TikTok uploads.
- `GET /analytics` — follower + view series per platform.
- `GET /schedule` — scheduled posts to hydrate the calendar.

Without `VITE_API_BASE_URL`, the UI runs in demo mode with mock data.

## Can I avoid a separate backend?

If you don’t want to host a standalone API, you can use **Next.js API routes** (or any serverless functions) as the proxy. The flow stays the same:
- Frontend calls your Next.js API route (e.g., `/api/uploads`, `/api/analytics`, `/api/schedule`).
- The API route holds the server-side app credentials/secrets and calls Instagram/YouTube/TikTok on your behalf.
- Responses are returned to the React UI.

### Keeping your data private on a public deploy
- **Never ship platform client secrets to the browser.** They must live in the API route environment (`process.env`), not in Vite env files.
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
1) Wire `/uploads`, `/analytics`, and `/schedule` endpoints to your backend adapters.  
2) Add “Connect” buttons that start OAuth flows via your backend.  
3) Persist scheduled posts and poll platform processing state to confirm publish status.
