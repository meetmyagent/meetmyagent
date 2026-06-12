# meetmyagent.app

Personality-matched real estate agent platform. Consumers take a 2-minute quiz and get matched to agents based on communication style, working pace, and client specialties — not ad spend.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Database & Auth**: Supabase (PostgreSQL + Supabase Auth)
- **Email**: Resend
- **Deployment**: Vercel
- **Styling**: Tailwind CSS
- **CRM**: HubSpot (via API)

---

## Environment Variables

Create a `.env.local` file in the root with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
HUBSPOT_ACCESS_TOKEN=
```

> Never commit `.env.local` to version control.

---

## Setup & Run

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Copy the variable names above into `.env.local` and fill in the values from:
- **Supabase**: Project Settings → API
- **Resend**: resend.com → API Keys
- **HubSpot**: Settings → Integrations → Private Apps

### 3. Run locally
```bash
npm run dev
```
App runs at `http://localhost:3000`

### 4. Deploy to Vercel
```bash
vercel --prod
```
Make sure all env vars are also added in Vercel → Settings → Environment Variables.

---

## Folder Structure

```
meetmyagent/
├── app/
│   ├── page.tsx                        # Landing page
│   ├── login/page.tsx                  # Agent login (password + magic link + Google OAuth)
│   ├── find/
│   │   ├── page.tsx                    # Consumer quiz
│   │   ├── results/page.tsx            # Match results
│   │   └── commercial/page.tsx         # Commercial quiz variant
│   ├── agents/
│   │   ├── dashboard/page.tsx          # Agent dashboard
│   │   └── [slug]/
│   │       ├── page.tsx                # Agent profile (server)
│   │       └── client.tsx              # Agent profile (client)
│   ├── compare/page.tsx                # Side-by-side agent comparison
│   ├── neighborhoods/
│   │   ├── page.tsx                    # Neighborhood index
│   │   └── [slug]/page.tsx             # Individual neighborhood page
│   ├── review/[token]/page.tsx         # Client review submission
│   ├── embed/[slug]/page.tsx           # Embeddable agent card
│   ├── consumer/page.tsx               # Consumer saved matches
│   ├── admin/page.tsx                  # Internal admin dashboard
│   └── api/
│       ├── waitlist/route.ts           # Agent signup → Supabase + HubSpot + Resend
│       ├── connect/route.ts            # Consumer → agent connection request
│       ├── consumer-save/route.ts      # Save consumer quiz results + email
│       ├── review-notify/route.ts      # Email agent when review is submitted
│       ├── weekly-digest/route.ts      # Weekly stats email to agents
│       └── ai-neighborhood/route.ts    # AI-generated neighborhood content
├── components/
│   └── WaitlistForm.tsx                # Agent signup form (landing page)
├── lib/
│   └── supabase/
│       └── client.ts                   # Supabase client helper
├── public/                             # Static assets
├── .env.local                          # Environment variables (not committed)
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Supabase Database Tables

| Table | Purpose |
|-------|---------|
| `agents` | Agent profiles, tags, personality data, broker/license info |
| `waitlist` | Agent signups before profile completion |
| `quiz_responses` | Consumer quiz sessions and derived tags |
| `connections` | Consumer → agent connection requests |
| `reviews` | Client reviews with token-based submission |
| `neighborhoods` | Neighborhood content pages |
| `neighborhood_agents` | Agent ↔ neighborhood verified associations |

### Key columns in `agents`
- `id` — Supabase auth user UUID
- `name`, `slug`, `bio`, `city`, `years_exp`
- `avatar_url`, `video_url`
- `style_tags`, `client_tags`, `area_tags` — matching tags (arrays)
- `communication_style`, `decision_style`, `stress_response`, `pace_style`
- `agent_type` — `residential` | `commercial` | `both`
- `commercial_specialties`, `deal_size_range`
- `designations` — certifications array (ABR, SRES, MRP, etc.)
- `broker_name`, `license_number`, `broker_logo_url` — compliance fields
- `is_founding` — founding agent badge
- `referral_code`, `referral_count`

---

## Key Features

### Consumer Side
- **Quiz** (`/find`) — 8-question personality + needs quiz
- **Specific needs** — VA buyers, downsizers, relocation flagged separately
- **Results** (`/find/results`) — scored agent matches, compare up to 3
- **Agent profiles** (`/agents/[slug]`) — full personality profile, reviews, video, match score
- **Neighborhoods** — AI-generated area guides linked to verified agents

### Agent Side
- **Dashboard** (`/agents/dashboard`) — profile builder with tabs
- **Login** (`/login`) — Google OAuth + password + magic link
- **Review system** — token-based review links, email notification on submission
- **Weekly digest** — automated stats email via Resend
- **Embed widget** — `/embed/[slug]` for agents to embed on their own site
- **Referral system** — unique referral codes tracked per agent

### Admin
- **Admin dashboard** (`/admin`) — waitlist, agents, connections, quiz responses

### Integrations
- **Resend** — transactional emails (waitlist, connect, review notify, weekly digest)
- **HubSpot** — new agent signups auto-synced as contacts
- **Supabase Auth** — magic link + Google OAuth + password login
- **Vercel** — deployment with env vars

---

## Profile Visibility Rules

An agent profile **will not appear in consumer search results** unless:
1. `name` is not null
2. `broker_name` is not null
3. `license_number` is not null

This is enforced in `/find/results/page.tsx` at the Supabase query level.

---

## Email Sender

All transactional emails send from:
```
hello@meetmyagent.app
```
Configured via Google Workspace. DNS (MX records) managed in Vercel.

---

## Domain & DNS

- Domain: `meetmyagent.app`
- Registrar: Namecheap (nameservers pointed to Vercel)
- DNS managed in: Vercel Domains panel
- SSL: Auto-provisioned by Vercel

---

## Notes for New Environment

- Run `npm install` before anything else
- The Supabase service role key is required for magic link generation in `/api/waitlist`
- HubSpot token needs `contacts` read/write scope
- Google OAuth redirect URI must be set to: `https://[your-supabase-project].supabase.co/auth/v1/callback`
- Resend domain (`meetmyagent.app`) must be verified in Resend dashboard
