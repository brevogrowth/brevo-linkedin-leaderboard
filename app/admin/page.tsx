import { redirect } from 'next/navigation';

// Redirect /admin to /admin/users
export default function AdminPage() {
  redirect('/admin/users');
}
