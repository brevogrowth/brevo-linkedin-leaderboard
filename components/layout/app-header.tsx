'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, BookOpen, Users, FileText, Home, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type NavPage = 'dashboard' | 'posts' | 'users' | 'docs';

interface NavItem {
  page: NavPage;
  href: string;
  label: string;
  icon: React.ReactNode;
  requiresAuth?: boolean;
}

// All navigation items in a single flat list
const navItems: NavItem[] = [
  { page: 'dashboard', href: '/', label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
  { page: 'posts', href: '/posts', label: 'Posts', icon: <BookOpen className="h-4 w-4" /> },
  { page: 'users', href: '/admin/users', label: 'Users', icon: <Users className="h-4 w-4" />, requiresAuth: true },
  { page: 'docs', href: '/admin/docs', label: 'Docs', icon: <FileText className="h-4 w-4" />, requiresAuth: true },
];

interface AppHeaderProps {
  currentPage: NavPage;
  rightContent?: React.ReactNode;
}

export function AppHeader({ currentPage, rightContent }: AppHeaderProps) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = sessionStorage.getItem('admin_authenticated');
      setIsAdminAuthenticated(authStatus === 'true');
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/check-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.valid) {
        setIsAdminAuthenticated(true);
        sessionStorage.setItem('admin_authenticated', 'true');
        setShowAuthModal(false);
        setPassword('');

        // Navigate to the pending page if any
        if (pendingNavigation) {
          window.location.href = pendingNavigation;
        }
      } else {
        setAuthError('Invalid password');
      }
    } catch {
      setAuthError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavClick = (item: NavItem, e: React.MouseEvent) => {
    if (item.requiresAuth && !isAdminAuthenticated) {
      e.preventDefault();
      setPendingNavigation(item.href);
      setShowAuthModal(true);
    }
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setPassword('');
    setAuthError('');
    setPendingNavigation(null);
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900">
                  LinkedIn Voice Program
                </h1>
                <p className="text-xs text-gray-500">Brevo Sales Leaderboard</p>
              </div>
            </Link>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <nav className="flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = currentPage === item.page;
                  const needsAuth = item.requiresAuth && !isAdminAuthenticated && !isCheckingAuth;

                  return (
                    <Link
                      key={item.page}
                      href={item.href}
                      onClick={(e) => handleNavClick(item, e)}
                    >
                      <button
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                          isActive
                            ? 'bg-primary text-white'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
                          needsAuth && 'opacity-60'
                        )}
                      >
                        {item.icon}
                        <span className="hidden sm:inline">{item.label}</span>
                        {needsAuth && (
                          <Lock className="h-3 w-3 ml-0.5" />
                        )}
                      </button>
                    </Link>
                  );
                })}
              </nav>

              {/* Right Content (contextual actions like Add User) */}
              {rightContent && (
                <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
                  {rightContent}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <Dialog
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        title="Admin Access Required"
        size="sm"
      >
        <form onSubmit={handleLogin} className="space-y-4">
          <p className="text-sm text-gray-600">
            Enter the admin password to access this section.
          </p>
          <Input
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={authError}
            placeholder="Enter admin password"
            autoFocus
          />
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={closeAuthModal}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Unlock
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
