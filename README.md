# Client Progress Tracker MVP

Production-ready MVP for sharing project progress with clients.

## Stack
- Next.js (App Router, TypeScript)
- Supabase (Auth + Postgres)
- Zod validation

## Features
- Admin login via Supabase email/password.
- Admin project management (`/admin/projects`).
- Timeline updates per project.
- Public tokenized tracking page (`/track/[token]`).
- Basic request throttling for public tracking route.

## Environment Variables
Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Setup
1. Install dependencies:
   - `npm install`
2. Run SQL migrations from `supabase/migrations` in order:
   - `001_init.sql`
   - `002_rls_policies.sql`
   - `003_projects_company_logo.sql`
   - `004_company_logos_bucket.sql`
   - `005_project_updates_media.sql`
   - `006_timeline_media_bucket.sql`
3. Create at least one Supabase auth user (admin) in Supabase dashboard.
4. Start app:
   - `npm run dev`

## Routes
- `/` landing page
- `/admin/login` admin login
- `/admin/projects` create/list projects
- `/admin/projects/[slug]` add timeline updates
- `/track/[token]` public client-facing timeline

## Notes
- Public pages query through server-side service-role client so credentials never reach browser.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only and never expose it in client code.
- File uploads use Next.js Server Actions; `next.config.ts` sets `experimental.serverActions.bodySizeLimit` (default is 1 MB). Restart `npm run dev` after changing it. Hosting providers may impose their own upload limits.

### Troubleshooting: “RSC payload … development … production … client”
That message usually means the browser loaded **cached** `/_next/` JS from a **production** build (`next build` / `next start`) while the dev server (`npm run dev`) is sending **development** RSC data.

1. Stop the dev server.
2. Run `npm run clean` (deletes the `.next` folder).
3. Start again with `npm run dev` (not `npm run start` unless you intend to run the production server).
4. In the browser: hard refresh (Ctrl+Shift+R) or use a private window so old chunks are not used.

Do not mix **`npm run dev`** and **`npm run start`** on the same origin/port without a full refresh after switching.
