'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  FileText,
  TrendingUp,
  Trophy,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { KPICard } from '@/components/business/kpi-card';
import { LeaderboardTable } from '@/components/business/leaderboard-table';
import { ScrapeProgressModal } from '@/components/business/scrape-progress-modal';
import { AppHeader } from '@/components/layout/app-header';
import { useScrapePolling } from '@/lib/hooks/use-scrape-polling';
import { formatRelativeTime } from '@/config/branding';
import type { DashboardKPIs } from '@/types/domain';
import type { LeaderboardEntryRequired, LinkedInPost } from '@/types/database.types';

interface LeaderboardUser extends LeaderboardEntryRequired {
  trend: 'up' | 'down' | 'stable';
  topPosts?: LinkedInPost[];
}

interface DashboardClientProps {
  initialData: {
    kpis: DashboardKPIs;
    leaderboard: LeaderboardUser[];
  };
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const router = useRouter();
  const [showProgressModal, setShowProgressModal] = useState(false);

  const { triggerScrape, isPolling, progress, reset } = useScrapePolling({
    onComplete: () => {
      // Refresh the page data
      router.refresh();
    },
    onError: (error) => {
      console.error('Scrape error:', error);
    },
  });

  const handleRefresh = useCallback(async () => {
    setShowProgressModal(true);
    await triggerScrape();
  }, [triggerScrape]);

  const handleCloseModal = useCallback(() => {
    setShowProgressModal(false);
    reset();
  }, [reset]);

  const handleRetry = useCallback(async () => {
    reset();
    await triggerScrape();
  }, [reset, triggerScrape]);

  const { kpis, leaderboard } = initialData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AppHeader currentPage="dashboard" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-sm text-gray-500">
              {kpis.lastUpdated
                ? `Last updated ${formatRelativeTime(kpis.lastUpdated)}`
                : 'No data yet - click Refresh to start'}
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            isLoading={isPolling}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh Data
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard
            title="Active Posters"
            value={kpis.activePosters.count}
            subtitle={`of ${kpis.activePosters.total}`}
            progress={{
              current: kpis.activePosters.count,
              total: kpis.activePosters.total,
            }}
            icon={<Users className="h-5 w-5" />}
          />
          <KPICard
            title="Total Posts"
            value={kpis.totalPosts.count}
            subtitle="this month"
            trend={{
              value: kpis.totalPosts.changePercent,
              label: 'vs last month',
            }}
            icon={<FileText className="h-5 w-5" />}
          />
          <KPICard
            title="Total Engagement"
            value={kpis.totalEngagement.formatted}
            subtitle="interactions"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          {kpis.topPerformer ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-gray-500 mb-3">
                  Top Performer
                </p>
                <div className="flex items-center gap-3">
                  <Avatar name={kpis.topPerformer.name} size="lg" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {kpis.topPerformer.name}
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {kpis.topPerformer.score}
                      <span className="text-sm font-normal text-gray-500 ml-1">
                        pts
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <KPICard
              title="Top Performer"
              value="-"
              subtitle="No data yet"
              icon={<Trophy className="h-5 w-5" />}
            />
          )}
        </div>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length > 0 ? (
              <LeaderboardTable users={leaderboard} />
            ) : (
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No data yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Add some users and run a scrape to see the leaderboard.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Link href="/admin">
                    <Button variant="outline" size="sm">
                      Add Users
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    onClick={handleRefresh}
                    isLoading={isPolling}
                  >
                    Refresh Data
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Scrape Progress Modal */}
      <ScrapeProgressModal
        isOpen={showProgressModal}
        onClose={handleCloseModal}
        progress={progress}
        onRetry={handleRetry}
      />
    </div>
  );
}
