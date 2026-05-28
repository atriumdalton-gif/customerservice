# Inbox Copilot

AI-assisted email reply dashboard for reviewing and approving draft replies.

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- Deploy: Railway

## Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and AUTH_TOKEN

# Run database migration
npx prisma migrate deploy

# Seed the database with fake data
npx prisma db seed

# Start dev server
npm run dev
```

Visit `http://localhost:3000/?key=YOUR_AUTH_TOKEN` to authenticate.

## Railway Deployment

### 1. Create a Railway project

- Go to [railway.app](https://railway.app) and create a new project
- Add a **PostgreSQL** plugin — this auto-sets `DATABASE_URL`

### 2. Set environment variables

In your Railway service settings, add:

| Variable | Value |
|----------|-------|
| `AUTH_TOKEN` | A strong secret string |
| `NEXT_PUBLIC_APP_URL` | Your Railway service URL |

### 3. Deploy

Railway will auto-detect the `railway.toml` and run:

- **Build:** `npx prisma generate && npm run build`
- **Start:** `npx prisma migrate deploy && npm start`

### 4. Run migrations and seed

After the first deploy, open the Railway shell and run:

```bash
npx prisma migrate deploy
npx prisma db seed
```

### 5. Access the app

Visit `https://your-app.railway.app/?key=YOUR_AUTH_TOKEN` to authenticate. The cookie persists for 1 year.

## Healthcheck

`GET /api/health` returns `{ "status": "ok" }` — configured in `railway.toml`.

## Auth

- Set `AUTH_TOKEN` env var
- Visit `/?key=YOUR_TOKEN` once to set an auth cookie
- All routes are protected by middleware
- No login screen — cookie lasts 1 year

## Screens

- `/inbox` — Email list with Pending / Sent / All tabs
- `/email/[id]` — Review and approve/reject draft replies
- `/history` — Sent and rejected emails (read-only)
