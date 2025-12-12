'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, ExternalLink, Copy, Check } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Collapsible section component
function Section({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <span className="font-semibold text-gray-900">{title}</span>
        {isOpen ? (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-500" />
        )}
      </button>
      {isOpen && <div className="p-4 border-t border-gray-200">{children}</div>}
    </div>
  );
}

// Code block component
function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-400" />
        ) : (
          <Copy className="h-4 w-4 text-gray-300" />
        )}
      </button>
    </div>
  );
}

// Table component for API docs
function ApiTable({
  data,
}: {
  data: { method: string; path: string; description: string; protected?: boolean }[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 px-3 font-medium text-gray-500">Method</th>
            <th className="text-left py-2 px-3 font-medium text-gray-500">Path</th>
            <th className="text-left py-2 px-3 font-medium text-gray-500">Description</th>
            <th className="text-left py-2 px-3 font-medium text-gray-500">Auth</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="py-2 px-3">
                <Badge
                  variant={
                    row.method === 'GET'
                      ? 'success'
                      : row.method === 'POST'
                      ? 'info'
                      : row.method === 'PUT'
                      ? 'warning'
                      : 'error'
                  }
                  size="sm"
                >
                  {row.method}
                </Badge>
              </td>
              <td className="py-2 px-3 font-mono text-xs">{row.path}</td>
              <td className="py-2 px-3 text-gray-600">{row.description}</td>
              <td className="py-2 px-3">
                {row.protected ? (
                  <Badge variant="outline" size="sm">Protected</Badge>
                ) : (
                  <Badge variant="default" size="sm">Public</Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader currentPage="admin" adminTab="docs" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Documentation</h1>
          <p className="text-gray-600">
            Complete guide for the LinkedIn Voice Program Tracker - Product &amp; Technical
          </p>
        </div>

        {/* Product Documentation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📦</span>
              Product Documentation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Voice Program */}
            <Section title="Voice Program - What is it?" defaultOpen>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-600 mb-4">
                  The <strong>Voice Program</strong> is a Brevo initiative to encourage Sales teams
                  to develop their LinkedIn presence. Participants regularly publish
                  professional content to increase their visibility and Brevo&apos;s brand awareness.
                </p>
                <h4 className="font-semibold text-gray-900 mt-4 mb-2">Objectives</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Increase Brevo&apos;s visibility on LinkedIn</li>
                  <li>Develop personal branding for Sales team members</li>
                  <li>Generate inbound leads through content</li>
                  <li>Create a culture of sharing and engagement</li>
                </ul>
                <h4 className="font-semibold text-gray-900 mt-4 mb-2">Participants</h4>
                <p className="text-gray-600">
                  All members of Sales Enterprise, Sales Pro, and BDR teams can participate.
                  Profiles are added via the Admin interface.
                </p>
              </div>
            </Section>

            {/* Scoring System */}
            <Section title="Scoring System">
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-600 mb-4">
                  Each LinkedIn post generates a score based on the engagement received.
                  The formula values quality interactions.
                </p>
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <p className="font-mono text-sm mb-2">
                    <strong>Score</strong> = (likes × 1) + (comments × 2) + (reposts × 3) + type_bonus
                  </p>
                  <p className="text-xs text-gray-500">
                    type_bonus: Original post = +2 pts | Repost = +1 pt
                  </p>
                </div>
                <h4 className="font-semibold text-gray-900 mt-4 mb-2">Calculation Example</h4>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Original post with 50 likes, 10 comments, 5 reposts:
                  </p>
                  <p className="font-mono text-sm">
                    Score = (50 × 1) + (10 × 2) + (5 × 3) + 2 = <strong>87 points</strong>
                  </p>
                </div>
                <h4 className="font-semibold text-gray-900 mt-4 mb-2">Score Tiers</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded text-green-600 bg-green-50">51+</span>
                    <span className="text-gray-600">Excellent engagement</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded text-blue-600 bg-blue-50">11-50</span>
                    <span className="text-gray-600">Good engagement</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded text-gray-600 bg-gray-50">0-10</span>
                    <span className="text-gray-600">Standard engagement</span>
                  </li>
                </ul>
              </div>
            </Section>

            {/* Teams */}
            <Section title="Teams">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Sales Enterprise</h4>
                  <p className="text-sm text-blue-700">
                    Team dedicated to large accounts and strategic enterprises.
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Sales Pro</h4>
                  <p className="text-sm text-green-700">
                    Team targeting SMBs and mid-market companies.
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">BDR</h4>
                  <p className="text-sm text-purple-700">
                    Business Development Representatives - prospecting and qualification.
                  </p>
                </div>
              </div>
            </Section>

            {/* User Guide */}
            <Section title="User Guide">
              <div className="prose prose-sm max-w-none">
                <h4 className="font-semibold text-gray-900 mb-2">Dashboard (Homepage)</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1 mb-4">
                  <li><strong>KPIs</strong>: Number of active posters, posts this month, total engagement</li>
                  <li><strong>Leaderboard</strong>: Real-time ranking by total score</li>
                  <li><strong>Refresh Data</strong>: Triggers a LinkedIn data update</li>
                </ul>

                <h4 className="font-semibold text-gray-900 mb-2">Posts Explorer</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1 mb-4">
                  <li>Browse all scraped posts</li>
                  <li>Filter by user</li>
                  <li>Sort by date or score</li>
                  <li>View engagement details for each post</li>
                </ul>

                <h4 className="font-semibold text-gray-900 mb-2">Admin Panel</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Add/edit/delete tracked users</li>
                  <li>Enable/disable tracking for a user</li>
                  <li>View last scrape date per user</li>
                </ul>
              </div>
            </Section>
          </CardContent>
        </Card>

        {/* Technical Documentation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🔧</span>
              Technical Documentation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Architecture */}
            <Section title="Architecture" defaultOpen>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-600 mb-4">
                  The application follows a modern architecture based on Next.js with Supabase
                  as backend and Make.com for automation.
                </p>
                <CodeBlock
                  code={`┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
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
                                                └─────────────────┘`}
                />
                <h4 className="font-semibold text-gray-900 mt-4 mb-2">Tech Stack</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li><strong>Frontend</strong>: Next.js 16.x (App Router), TypeScript, Tailwind CSS v4</li>
                  <li><strong>Backend</strong>: Supabase PostgreSQL, Next.js API Routes</li>
                  <li><strong>Automation</strong>: Make.com (webhooks), PhantomBuster (scraping)</li>
                  <li><strong>Deployment</strong>: Netlify</li>
                </ul>
              </div>
            </Section>

            {/* Database Schema */}
            <Section title="Database Schema">
              <div className="prose prose-sm max-w-none">
                <h4 className="font-semibold text-gray-900 mb-2">Table: tracked_users</h4>
                <p className="text-gray-600 text-sm mb-2">
                  Stores Sales team members participating in the Voice Program.
                </p>
                <CodeBlock
                  code={`CREATE TABLE tracked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  linkedin_url VARCHAR(500) NOT NULL UNIQUE,
  team VARCHAR(50) CHECK (team IN ('Sales_Enterprise', 'Sales_Pro', 'BDR')),
  is_active BOOLEAN DEFAULT TRUE,
  last_scraped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`}
                />

                <h4 className="font-semibold text-gray-900 mt-6 mb-2">Table: linkedin_posts</h4>
                <p className="text-gray-600 text-sm mb-2">
                  Stores all scraped LinkedIn posts with their metrics.
                </p>
                <CodeBlock
                  code={`CREATE TABLE linkedin_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracked_user_id UUID REFERENCES tracked_users(id) ON DELETE CASCADE,
  external_post_id VARCHAR(255) UNIQUE,
  post_url TEXT NOT NULL,
  content_snippet TEXT,
  post_type VARCHAR(20) CHECK (post_type IN ('original', 'repost')),
  published_at TIMESTAMPTZ NOT NULL,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  reposts_count INT DEFAULT 0,
  -- Auto-calculated score (generated column)
  score INT GENERATED ALWAYS AS (
    (likes_count * 1) + (comments_count * 2) + (reposts_count * 3) +
    CASE WHEN post_type = 'original' THEN 2 ELSE 1 END
  ) STORED
);`}
                />

                <h4 className="font-semibold text-gray-900 mt-6 mb-2">Table: scrape_jobs</h4>
                <p className="text-gray-600 text-sm mb-2">
                  Tracks scraping operations (status, progress, errors).
                </p>
                <CodeBlock
                  code={`CREATE TABLE scrape_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status VARCHAR(20) CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  triggered_by VARCHAR(100),
  total_users INT,
  processed_users INT DEFAULT 0,
  new_posts INT DEFAULT 0,
  updated_posts INT DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);`}
                />

                <h4 className="font-semibold text-gray-900 mt-6 mb-2">SQL Views</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                  <li><code className="bg-gray-100 px-1 rounded">leaderboard_view</code>: Global ranking with aggregated stats</li>
                  <li><code className="bg-gray-100 px-1 rounded">monthly_leaderboard_view</code>: Current month ranking</li>
                </ul>

                <h4 className="font-semibold text-gray-900 mt-6 mb-2">Row Level Security (RLS)</h4>
                <p className="text-gray-600 text-sm">
                  All tables are protected by RLS:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm mt-2">
                  <li><strong>Public read</strong>: Everyone can read (public dashboard)</li>
                  <li><strong>Service role write</strong>: Only service role can write</li>
                </ul>
              </div>
            </Section>

            {/* API Endpoints */}
            <Section title="API Endpoints">
              <div className="prose prose-sm max-w-none">
                <h4 className="font-semibold text-gray-900 mb-4">Public Routes</h4>
                <ApiTable
                  data={[
                    { method: 'GET', path: '/', description: 'Dashboard with leaderboard' },
                    { method: 'GET', path: '/posts', description: 'Posts explorer' },
                  ]}
                />

                <h4 className="font-semibold text-gray-900 mt-6 mb-4">Admin Routes (Protected)</h4>
                <ApiTable
                  data={[
                    { method: 'POST', path: '/api/admin/check-password', description: 'Validate admin password', protected: true },
                    { method: 'GET', path: '/api/admin/users', description: 'List all tracked users', protected: true },
                    { method: 'POST', path: '/api/admin/users', description: 'Create a user', protected: true },
                    { method: 'PUT', path: '/api/admin/users', description: 'Update a user', protected: true },
                    { method: 'DELETE', path: '/api/admin/users', description: 'Delete a user', protected: true },
                  ]}
                />

                <h4 className="font-semibold text-gray-900 mt-6 mb-4">Webhook Routes</h4>
                <ApiTable
                  data={[
                    { method: 'POST', path: '/api/jobs/trigger', description: 'Trigger a new scrape' },
                    { method: 'GET', path: '/api/jobs/status/[jobId]', description: 'Get scrape job status' },
                    { method: 'POST', path: '/api/webhooks/ingest', description: 'Receive data from Make.com' },
                  ]}
                />
              </div>
            </Section>

            {/* Make.com Integration */}
            <Section title="Make.com Integration">
              <div className="prose prose-sm max-w-none">
                <h4 className="font-semibold text-gray-900 mb-2">Data Flow</h4>
                <ol className="list-decimal list-inside text-gray-600 space-y-2 mb-4">
                  <li>User clicks &quot;Refresh Data&quot; in the dashboard</li>
                  <li>Frontend calls <code className="bg-gray-100 px-1 rounded">/api/jobs/trigger</code></li>
                  <li>Backend creates a job and calls the Make.com webhook</li>
                  <li>Make.com receives the list of users to scrape</li>
                  <li>For each user, Make.com calls PhantomBuster</li>
                  <li>PhantomBuster scrapes LinkedIn posts</li>
                  <li>Make.com sends results to <code className="bg-gray-100 px-1 rounded">/api/webhooks/ingest</code></li>
                  <li>Frontend polls <code className="bg-gray-100 px-1 rounded">/api/jobs/status</code> to display progress</li>
                </ol>

                <h4 className="font-semibold text-gray-900 mt-4 mb-2">Webhook Payload Format</h4>
                <CodeBlock
                  code={`{
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
}`}
                />
              </div>
            </Section>

            {/* Deployment */}
            <Section title="Deployment">
              <div className="prose prose-sm max-w-none">
                <h4 className="font-semibold text-gray-900 mb-2">Required Environment Variables</h4>
                <CodeBlock
                  code={`# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Make.com
MAKE_WEBHOOK_URL=https://hook.eu1.make.com/your-webhook-id

# Admin
ADMIN_PASSWORD=your-secure-admin-password`}
                />

                <h4 className="font-semibold text-gray-900 mt-6 mb-2">Netlify Deployment</h4>
                <ol className="list-decimal list-inside text-gray-600 space-y-1">
                  <li>Connect the GitHub repository to Netlify</li>
                  <li>Build command: <code className="bg-gray-100 px-1 rounded">npm run build</code></li>
                  <li>Publish directory: <code className="bg-gray-100 px-1 rounded">.next</code></li>
                  <li>Add environment variables in Netlify Dashboard</li>
                  <li>Deploy!</li>
                </ol>

                <h4 className="font-semibold text-gray-900 mt-6 mb-2">Useful Commands</h4>
                <CodeBlock
                  code={`# Development
npm run dev

# Production build
npm run build

# Type checking
npm run type-check

# Linting
npm run lint`}
                />
              </div>
            </Section>

            {/* Troubleshooting */}
            <Section title="Troubleshooting">
              <div className="prose prose-sm max-w-none">
                <h4 className="font-semibold text-gray-900 mb-2">Common Issues</h4>

                <div className="space-y-4 mt-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="font-medium text-yellow-800 mb-1">Scrape does not trigger</p>
                    <ul className="text-sm text-yellow-700 list-disc list-inside">
                      <li>Verify MAKE_WEBHOOK_URL is properly configured</li>
                      <li>Check that the Make.com scenario is active</li>
                      <li>Verify PhantomBuster quotas</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="font-medium text-yellow-800 mb-1">&quot;Invalid environment configuration&quot; error</p>
                    <ul className="text-sm text-yellow-700 list-disc list-inside">
                      <li>Verify all env variables are defined</li>
                      <li>Restart the server after modifying .env.local</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="font-medium text-yellow-800 mb-1">Data does not display</p>
                    <ul className="text-sm text-yellow-700 list-disc list-inside">
                      <li>Verify users are added and active</li>
                      <li>Check RLS policies in Supabase</li>
                      <li>Check API logs in the console</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Section>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
          <a
            href="https://github.com/brevogrowth/brevo-linkedin-leaderboard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-primary"
          >
            GitHub Repository
            <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href="https://supabase.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-primary"
          >
            Supabase Docs
            <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href="https://www.make.com/en/help"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-primary"
          >
            Make.com Help
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </main>
    </div>
  );
}
