'use client';

import Link from 'next/link';
import { Trophy, BookOpen, Settings, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type MainPage = 'dashboard' | 'posts' | 'admin';
type AdminTab = 'users' | 'docs';

interface AppHeaderProps {
  currentPage: MainPage;
  adminTab?: AdminTab;
  rightContent?: React.ReactNode;
}

// Main navigation items
const mainNavItems: { page: MainPage; href: string; label: string; icon: React.ReactNode }[] = [
  { page: 'dashboard', href: '/', label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
  { page: 'posts', href: '/posts', label: 'Posts', icon: <BookOpen className="h-4 w-4" /> },
  { page: 'admin', href: '/admin', label: 'Admin', icon: <Settings className="h-4 w-4" /> },
];

// Admin sub-tabs
const adminTabs: { tab: AdminTab; href: string; label: string }[] = [
  { tab: 'users', href: '/admin/users', label: 'Users' },
  { tab: 'docs', href: '/admin/docs', label: 'Docs' },
];

export function AppHeader({ currentPage, adminTab, rightContent }: AppHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                LinkedIn Voice Program
              </h1>
              <p className="text-xs text-gray-500">Brevo Sales Leaderboard</p>
            </div>
          </Link>

          {/* Main Navigation */}
          <nav className="flex items-center gap-1">
            {mainNavItems.map((item) => {
              const isActive = currentPage === item.page;
              return (
                <Link key={item.page} href={item.href}>
                  <Button
                    variant={isActive ? 'primary' : 'ghost'}
                    size="sm"
                    leftIcon={item.icon}
                  >
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Admin Sub-navigation (only shown on admin pages) */}
      {currentPage === 'admin' && (
        <div className="border-t border-gray-100 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-12">
              {/* Admin Tabs */}
              <nav className="flex items-center gap-1">
                {adminTabs.map((tab) => {
                  const isActive = adminTab === tab.tab;
                  return (
                    <Link key={tab.tab} href={tab.href}>
                      <button
                        className={cn(
                          'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                          isActive
                            ? 'text-primary bg-white shadow-sm border border-gray-200'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                        )}
                      >
                        {tab.label}
                      </button>
                    </Link>
                  );
                })}
              </nav>

              {/* Right Content (e.g., Add User button) */}
              {rightContent && (
                <div className="flex items-center gap-2">
                  {rightContent}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
