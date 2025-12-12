# LinkedIn Voice Program Tracker

A gamified leaderboard application for tracking and celebrating the LinkedIn posting activity of Brevo's Sales team members participating in the Voice Program.

![Next.js](https://img.shields.io/badge/Next.js-16.x-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?style=flat-square&logo=tailwind-css)

## Overview

The LinkedIn Voice Program Tracker replaces manual Google Sheets tracking with an automated, visually engaging dashboard. It integrates with Make.com and PhantomBuster to automatically scrape LinkedIn posts and calculate engagement scores.

### Key Features

- **Public Dashboard**: No login required - anyone can view the leaderboard
- **Real-time Leaderboard**: Ranks team members by their engagement score
- **Gamification**: Trophy emojis, rank badges, and score animations
- **Team Filtering**: Filter by Sales Enterprise, Sales Pro, or BDR teams
- **Posts Explorer**: Browse all scraped posts with engagement metrics
- **Admin Panel**: Password-protected interface for managing tracked users
- **Automated Scraping**: Triggers Make.com webhooks to fetch new data

### Scoring Formula

```
Score = (likes × 1) + (comments × 2) + (reposts × 3) + type_bonus

Where type_bonus:
  - Original post: +2 points
  - Repost: +1 point
```

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Next.js App   │────▶│    Supabase     │◀────│   Make.com      │
│   (Frontend)    │     │   (Database)    │     │  (Automation)   │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │  PhantomBuster  │
                                                │  (LinkedIn API) │
                                                └─────────────────┘
```

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16.x (App Router) |
| Language | TypeScript (strict mode) |
| Database | Supabase PostgreSQL |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Validation | Zod |
| Charts | Recharts (optional) |

## Project Structure

```
brevo-linkedin-leaderboard/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Dashboard (public)
│   ├── dashboard-client.tsx      # Dashboard client component
│   ├── admin/                    # Admin panel (password-protected)
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── posts/                    # Posts explorer
│   │   ├── page.tsx
│   │   └── posts-client.tsx
│   └── api/                      # API routes
│       ├── jobs/
│       │   ├── trigger/route.ts  # POST - Trigger scrape
│       │   └── status/[jobId]/route.ts  # GET - Job status
│       ├── webhooks/
│       │   └── ingest/route.ts   # POST - Receive scraped data
│       └── admin/
│           ├── check-password/route.ts
│           └── users/route.ts    # CRUD for tracked users
├── components/
│   ├── ui/                       # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── badge.tsx
│   │   └── avatar.tsx
│   └── business/                 # Domain-specific components
│       ├── kpi-card.tsx
│       ├── leaderboard-table.tsx
│       └── scrape-progress-modal.tsx
├── lib/
│   ├── db.ts                     # Supabase client configuration
│   ├── env.ts                    # Environment variable validation
│   ├── scoring.ts                # Score calculation utilities
│   ├── hooks/
│   │   └── use-scrape-polling.ts # Polling hook for job status
│   └── validation/
│       ├── user-schema.ts        # Zod schemas for users
│       └── ingest-schema.ts      # Zod schemas for webhook payload
├── types/
│   ├── database.types.ts         # Supabase generated types
│   └── domain.ts                 # Application domain types
├── config/
│   └── branding.ts               # Brevo brand colors & formatting
├── supabase/
│   └── schema.sql                # Database schema
└── public/                       # Static assets
```

## Database Schema

### Tables

#### `tracked_users`
Stores team members being tracked in the Voice Program.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Full name |
| linkedin_url | VARCHAR(500) | LinkedIn profile URL (unique) |
| team | ENUM | 'Sales_Enterprise', 'Sales_Pro', 'BDR' |
| is_active | BOOLEAN | Whether to include in scrapes |
| last_scraped_at | TIMESTAMPTZ | Last successful scrape |
| created_at | TIMESTAMPTZ | Record creation time |
| updated_at | TIMESTAMPTZ | Last update time |

#### `linkedin_posts`
Stores all scraped LinkedIn posts with engagement metrics.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| tracked_user_id | UUID | Foreign key to tracked_users |
| external_post_id | VARCHAR(255) | LinkedIn's post ID (unique) |
| post_url | TEXT | Direct link to the post |
| content_snippet | TEXT | First ~200 chars of post content |
| post_type | ENUM | 'original' or 'repost' |
| published_at | TIMESTAMPTZ | When the post was published |
| likes_count | INT | Number of likes |
| comments_count | INT | Number of comments |
| reposts_count | INT | Number of reposts |
| score | INT | Computed score (generated column) |
| scraped_at | TIMESTAMPTZ | When we scraped this post |
| updated_at | TIMESTAMPTZ | Last update time |

#### `scrape_jobs`
Tracks the status of scraping operations.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| status | ENUM | 'pending', 'processing', 'completed', 'failed' |
| triggered_by | VARCHAR(100) | Who/what triggered the scrape |
| total_users | INT | Total users to process |
| processed_users | INT | Users processed so far |
| new_posts | INT | New posts found |
| updated_posts | INT | Existing posts updated |
| error_message | TEXT | Error details if failed |
| created_at | TIMESTAMPTZ | Job creation time |
| completed_at | TIMESTAMPTZ | Job completion time |

### Views

- **`leaderboard_view`**: Aggregates user stats with total posts, engagement, and rank
- **`monthly_leaderboard_view`**: Same as above but filtered to current month

## API Endpoints

### Public Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Dashboard with leaderboard |
| GET | `/posts` | Posts explorer with filtering |

### Protected Endpoints (require admin password)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin` | Admin panel |
| POST | `/api/admin/check-password` | Validate admin password |
| GET | `/api/admin/users` | List all tracked users |
| POST | `/api/admin/users` | Create new tracked user |
| PUT | `/api/admin/users` | Update tracked user |
| DELETE | `/api/admin/users` | Delete tracked user |

### Webhook Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/jobs/trigger` | Trigger a new scrape job |
| GET | `/api/jobs/status/[jobId]` | Get job progress |
| POST | `/api/webhooks/ingest` | Receive data from Make.com |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Make.com account (for automation)
- PhantomBuster account (for LinkedIn scraping)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/brevogrowth/brevo-linkedin-leaderboard.git
   cd brevo-linkedin-leaderboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your values:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   MAKE_WEBHOOK_URL=https://hook.eu1.make.com/your-webhook-id
   ADMIN_PASSWORD=your-secure-admin-password
   ```

4. **Set up the database**

   Run the SQL from `supabase/schema.sql` in your Supabase SQL Editor.

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Deployment (Netlify)

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables in Netlify dashboard
5. Deploy!

## Make.com Integration

The app integrates with Make.com to automate LinkedIn scraping:

1. **Trigger Flow**: When the "Refresh Data" button is clicked:
   - Frontend calls `/api/jobs/trigger`
   - Backend creates a job record and calls Make.com webhook
   - Make.com receives list of users to scrape

2. **Scraping Flow**: Make.com scenario:
   - Iterates through user list
   - Calls PhantomBuster for each user
   - Collects post data
   - Sends batch results to `/api/webhooks/ingest`

3. **Ingest Flow**: When data is received:
   - Validates payload with Zod
   - Upserts posts (insert or update engagement counts)
   - Updates job progress
   - Frontend polls `/api/jobs/status/[jobId]` for updates

### Webhook Payload Format

```json
{
  "job_id": "uuid",
  "user_id": "uuid",
  "posts": [
    {
      "external_post_id": "linkedin-post-id",
      "post_url": "https://linkedin.com/feed/update/...",
      "content_snippet": "First 200 chars...",
      "post_type": "original",
      "published_at": "2024-01-15T10:30:00Z",
      "likes_count": 42,
      "comments_count": 5,
      "reposts_count": 3
    }
  ]
}
```

## Development

### Type Checking

```bash
npm run type-check
# or
npx tsc --noEmit
```

### Linting

```bash
npm run lint
```

### Building

```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary to Brevo. All rights reserved.

## Support

For questions or issues, contact the Revenue Marketing team or open an issue in this repository.

---

Built with love by the Brevo Growth team
