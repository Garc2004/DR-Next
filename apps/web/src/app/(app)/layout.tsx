import { redirect } from 'next/navigation';
import { getSession } from '@dr/db/auth/get-session';
import { Sidebar } from '@/components/sidebar';
import { BottomNav } from '@/components/bottom-nav';
import { SessionSync } from '@/components/session-sync';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getSession();
  if (!user) redirect('/login');

  return (
    <div className="flex min-h-screen bg-[var(--color-canvas)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <SessionSync />
        <main className="flex-1">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
