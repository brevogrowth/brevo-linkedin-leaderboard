'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Auth context to share authentication state with child pages
interface AdminAuthContextType {
  isAuthenticated: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType>({ isAuthenticated: false });

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

interface AdminAuthWrapperProps {
  children: ReactNode;
}

export function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Check auth on mount
  useEffect(() => {
    // Check if we have a stored auth token (session)
    const checkAuth = () => {
      const authStatus = sessionStorage.getItem('admin_authenticated');
      if (authStatus === 'true') {
        setIsAuthenticated(true);
      }
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      const response = await fetch('/api/admin/check-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.valid) {
        setIsAuthenticated(true);
        // Store auth status in session
        sessionStorage.setItem('admin_authenticated', 'true');
      } else {
        setAuthError('Invalid password');
      }
    } catch {
      setAuthError('An error occurred. Please try again.');
    }
  };

  // Auth check loading state
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Admin Access</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={authError}
                placeholder="Enter admin password"
                autoFocus
              />
              <Button type="submit" className="w-full">
                Access Admin Panel
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Link
                href="/"
                className="text-sm text-gray-500 hover:text-primary"
              >
                Back to Dashboard
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Authenticated - render children with context
  return (
    <AdminAuthContext.Provider value={{ isAuthenticated }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
