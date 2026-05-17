import { redirect } from 'next/navigation';
import { getSession } from '@dr/db/auth/get-session';
import { AdminSidebar } from '@/components/admin-sidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, role } = await getSession();
  if (!user) redirect('/login');
  if (role !== 'leader') redirect('/forbidden');

  return (
    <div className="flex min-h-screen bg-[var(--color-canvas)]">
      <AdminSidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
