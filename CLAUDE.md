# CLAUDE.md - LinkedIn Voice Program Tracker

This file provides context for Claude Code when working on this codebase.

## Project Overview

This is a **LinkedIn Voice Program Tracker** - an internal tool for Brevo's Revenue Marketing team to gamify and track LinkedIn posting activity of their Sales team members.

**Key Concept**: Sales team members post on LinkedIn as part of the "Voice Program". This app automatically scrapes their posts, calculates engagement scores, and displays a public leaderboard to encourage participation.

## Architecture

```
Frontend (Next.js) → Supabase (PostgreSQL) ← Make.com → PhantomBuster (LinkedIn)
```

- **Next.js 16.x** with App Router for the web application
- **Supabase** for database (PostgreSQL) with Row Level Security
- **Make.com** for automation workflows
- **PhantomBuster** for LinkedIn data extraction

## Tech Stack & Conventions

| Technology | Version | Notes |
|------------|---------|-------|
| Next.js | 16.x | App Router, Server Components |
| TypeScript | 5.x | Strict mode enabled |
| Tailwind CSS | 4.x | Using @theme directive for custom properties |
| Supabase | Latest | PostgreSQL with typed client |
| Zod | 3.x | Runtime validation for all external data |
| Lucide React | Latest | Icon library |

### TypeScript Patterns

- **Strict mode** is enabled - no `any` types allowed
- Use `interface` for object shapes, `type` for unions/primitives
- Database types are in `types/database.types.ts` (matches Supabase schema)
- Domain types are in `types/domain.ts`

### Component Patterns

- **Server Components** by default (no `'use client'` unless needed)
- **Client Components** only for interactivity (forms, modals, polling)
- UI components in `components/ui/` - generic, reusable
- Business components in `components/business/` - domain-specific

### File Naming

- Components: `PascalCase.tsx` or `kebab-case.tsx`
- Utilities: `kebab-case.ts`
- API routes: `route.ts` in appropriate folder

## Key Files to Know

### Database & Types

- `lib/db.ts` - Supabase client factory (singleton pattern)
- `types/database.types.ts` - Generated Supabase types + convenience aliases
- `types/domain.ts` - Application-specific types (KPIs, etc.)

### Validation Schemas

- `lib/validation/user-schema.ts` - Zod schemas for tracked users
- `lib/validation/ingest-schema.ts` - Zod schemas for webhook payloads

### API Routes

- `app/api/jobs/trigger/route.ts` - Triggers scrape via Make.com
- `app/api/jobs/status/[jobId]/route.ts` - Returns job progress
- `app/api/webhooks/ingest/route.ts` - Receives scraped data from Make.com
- `app/api/admin/users/route.ts` - CRUD for tracked users
- `app/api/admin/check-password/route.ts` - Simple password auth

### Core Components

- `components/business/leaderboard-table.tsx` - Main leaderboard with expandable rows
- `components/business/scrape-progress-modal.tsx` - Progress UI during scraping
- `components/business/kpi-card.tsx` - Dashboard metric cards

### Hooks

- `lib/hooks/use-scrape-polling.ts` - Polls job status every 2s during scrape

## Database Schema

### Tables

1. **tracked_users** - Team members to track
   - `id`, `name`, `linkedin_url`, `team`, `is_active`, `last_scraped_at`

2. **linkedin_posts** - Scraped posts with engagement
   - `id`, `tracked_user_id`, `external_post_id`, `post_url`, `content_snippet`
   - `post_type` ('original' | 'repost')
   - `likes_count`, `comments_count`, `reposts_count`
   - `score` - **Generated column** computed from engagement

3. **scrape_jobs** - Tracks scraping operations
   - `id`, `status`, `total_users`, `processed_users`, `new_posts`, `updated_posts`

### Views

- `leaderboard_view` - Aggregated user stats with rank
- `monthly_leaderboard_view` - Current month only

### Scoring Formula

```sql
score = (likes × 1) + (comments × 2) + (reposts × 3) + type_bonus
-- type_bonus: original = 2, repost = 1
```

The score is a **generated stored column** in PostgreSQL, computed automatically.

## Environment Variables

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...           # Public, read-only access
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Admin access (optional, for writes)
MAKE_WEBHOOK_URL=https://hook.eu1.make.com/xxx
ADMIN_PASSWORD=secret123
```

**Note**: Variables do NOT use `NEXT_PUBLIC_` prefix - they're all server-side.

## Common Tasks

### Adding a New Team Type

1. Update `TeamType` in `types/database.types.ts`
2. Update `TEAM_DISPLAY_NAMES` in `lib/validation/user-schema.ts`
3. Update the database CHECK constraint
4. Update filter options in `leaderboard-table.tsx`

### Adding a New KPI Card

1. Add the metric to `DashboardKPIs` interface in `types/domain.ts`
2. Compute it in `getDashboardData()` in `app/page.tsx`
3. Add a `KPICard` component in `dashboard-client.tsx`

### Modifying the Scoring Formula

1. Update the generated column in database (requires migration)
2. Update documentation in this file and README.md
3. The `scoring.ts` utilities are only for display, not calculation

### Adding a New API Endpoint

1. Create `route.ts` in appropriate `app/api/` folder
2. Use `getSupabaseClient()` for reads, `getSupabaseAdmin()` for writes
3. Validate input with Zod schemas
4. Return `NextResponse.json()` with appropriate status codes

## Testing Considerations

- No test framework is currently set up
- For testing, use TypeScript type checking: `npx tsc --noEmit`
- Manual testing via the UI or API calls

## Deployment

- Deployed on **Netlify**
- Uses **Netlify Functions** for API routes (automatic with Next.js)
- Environment variables configured in Netlify dashboard

## Gotchas & Edge Cases

1. **Nullable View Types**: `leaderboard_view` returns nullable fields. Use `LeaderboardEntryRequired` type after validating data.

2. **RLS Policies**: Tables have Row Level Security. Anonymous users can read, only service role can write.

3. **Generated Column**: The `score` column in `linkedin_posts` cannot be directly inserted/updated - it's computed automatically.

4. **External Post ID**: Must be unique. Upsert logic uses this for deduplication.

5. **Team Enum**: Values are `'Sales_Enterprise'`, `'Sales_Pro'`, `'BDR'` - note the underscore format.

## Quick Commands

```bash
# Development
npm run dev

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Build
npm run build

# Supabase CLI (if linked)
npx supabase@2.66.1 db push
```

## Related Resources

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Make.com Scenarios](https://make.com)
- [PhantomBuster](https://phantombuster.com)
- [Next.js 16 Docs](https://nextjs.org/docs)
