'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { AppHeader } from '@/components/layout/app-header';
import { formatRelativeTime } from '@/config/branding';
import { TEAM_OPTIONS, TEAM_DISPLAY_NAMES } from '@/lib/validation/user-schema';
import type { TrackedUser, TeamType } from '@/types/database.types';

// This component is used by the admin layout which handles authentication
interface AdminUsersPageProps {
  isAuthenticated?: boolean;
}

export default function AdminUsersPage({ isAuthenticated = true }: AdminUsersPageProps) {
  const [users, setUsers] = useState<TrackedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<TrackedUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<TrackedUser | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    linkedin_url: '',
    team: 'Sales_Enterprise' as TeamType,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch users on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setUsers(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    const linkedInRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/;
    if (!linkedInRegex.test(formData.linkedin_url)) {
      errors.linkedin_url = 'Please enter a valid LinkedIn profile URL';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const isEditing = !!editingUser;
      const url = '/api/admin/users';
      const method = isEditing ? 'PUT' : 'POST';
      const body = isEditing
        ? { id: editingUser.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Update local state
      if (isEditing) {
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? data.user : u))
        );
      } else {
        setUsers((prev) => [...prev, data.user]);
      }

      // Reset form
      setShowAddDialog(false);
      setEditingUser(null);
      setFormData({ name: '', linkedin_url: '', team: 'Sales_Enterprise' });
      setFormErrors({});
    } catch (err) {
      setFormErrors({
        submit: err instanceof Error ? err.message : 'Failed to save user',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/users?id=${deletingUser.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      setShowDeleteDialog(false);
      setDeletingUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (user: TrackedUser) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          is_active: !user.is_active,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? data.user : u))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  const openEditDialog = (user: TrackedUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      linkedin_url: user.linkedin_url,
      team: user.team,
    });
    setFormErrors({});
    setShowAddDialog(true);
  };

  const openAddDialog = () => {
    setEditingUser(null);
    setFormData({ name: '', linkedin_url: '', team: 'Sales_Enterprise' });
    setFormErrors({});
    setShowAddDialog(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Add User button in rightContent */}
      <AppHeader
        currentPage="admin"
        adminTab="users"
        rightContent={
          <Button
            onClick={openAddDialog}
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add User
          </Button>
        }
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
            <button
              onClick={() => setError('')}
              className="ml-auto p-1 hover:bg-red-100 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="mt-4 text-gray-500">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 mb-4">No users added yet</p>
                <Button onClick={openAddDialog} size="sm">
                  Add Your First User
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>LinkedIn URL</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Scraped</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>
                        <a
                          href={user.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm truncate block max-w-[200px]"
                        >
                          {user.linkedin_url.replace('https://www.linkedin.com/in/', '')}
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {TEAM_DISPLAY_NAMES[user.team]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                            user.is_active
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {user.is_active ? (
                            <>
                              <Check className="h-3 w-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <X className="h-3 w-3" />
                              Inactive
                            </>
                          )}
                        </button>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {user.last_scraped_at
                          ? formatRelativeTime(user.last_scraped_at)
                          : 'Never'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDeletingUser(user);
                              setShowDeleteDialog(true);
                            }}
                            className="text-error hover:text-error hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Add/Edit User Dialog */}
      <Dialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        title={editingUser ? 'Edit User' : 'Add User'}
        description={
          editingUser
            ? 'Update the user information below'
            : 'Add a new LinkedIn profile to track'
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            error={formErrors.name}
            placeholder="John Doe"
            required
          />
          <Input
            label="LinkedIn URL"
            value={formData.linkedin_url}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, linkedin_url: e.target.value }))
            }
            error={formErrors.linkedin_url}
            placeholder="https://linkedin.com/in/johndoe"
            required
          />
          <Select
            label="Team"
            value={formData.team}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                team: e.target.value as TeamType,
              }))
            }
            options={TEAM_OPTIONS.map((t) => ({ value: t.value, label: t.label }))}
          />

          {formErrors.submit && (
            <p className="text-sm text-error">{formErrors.submit}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddDialog(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingUser ? 'Save Changes' : 'Add User'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="Delete User"
        size="sm"
      >
        <p className="text-gray-600">
          Are you sure you want to delete <strong>{deletingUser?.name}</strong>?
          This will also delete all their posts and cannot be undone.
        </p>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowDeleteDialog(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={isSubmitting}
          >
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
