# meetmyagent.app

Personality-matched real estate agent platform. Consumers take a short quiz and get matched to agents based on communication style, pace, and specialties instead of ad spend.

## Tech Stack

- Next.js App Router with TypeScript
- Supabase for database and auth
- Resend for transactional email
- HubSpot private app API for CRM sync
- Tailwind CSS
- Vercel deployment

## Environment

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

Required variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
HUBSPOT_ACCESS_TOKEN=
ANTHROPIC_API_KEY=
ADMIN_PASSWORD=
```

Never commit `.env.local`. Rotate any keys that were previously pasted into source files or shared in ZIP exports.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Useful Scripts

```bash
npm run lint
npm run build
node sync-agents-to-hubspot.js
```

## Launch Notes

- `/admin` uses `ADMIN_PASSWORD` through a server route, not a hardcoded browser password.
- Agent profiles should only appear publicly when required compliance fields are complete.
- App Store submission will need privacy policy, support URL, account deletion flow if accounts are user-created, and a native wrapper or native app experience that is more than a thin website shell.

## Deploy

Deploy on Vercel and add the same environment variables in Project Settings.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
