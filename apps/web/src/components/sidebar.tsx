'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAtomValue } from 'jotai';
import { CalendarCheck2, FactoryIcon, LineChart, UserCircle2 } from 'lucide-react';
import { cn } from '@dr/ui';
import { isLeaderAtom } from '@/lib/atoms/session';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Envase', icon: FactoryIcon },
  { href: '/assiduidade', label: 'Assiduidade', icon: CalendarCheck2 },
  { href: '/grafico', label: 'Indicadores', icon: LineChart },
  { href: '/perfil', label: 'Perfil', icon: UserCircle2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const isLeader = useAtomValue(isLeaderAtom);
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3001';

  return (
    <aside className="hidden h-screen w-60 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] md:flex">
      <div className="flex h-14 items-center gap-2 border-b border-[var(--color-border)] px-4">
        <div className="grid size-7 place-items-center rounded-md bg-[var(--color-accent)] text-xs font-bold text-white">
          DR
        </div>
        <span className="text-sm font-semibold tracking-tight">DR-Next</span>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[var(--color-surface-alt)] text-[var(--color-ink)]'
                  : 'text-[var(--color-ink-mid)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-ink)]',
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
        {isLeader ? (
          <a
            href={adminUrl}
            className="mt-auto flex items-center gap-2.5 rounded-md border border-dashed border-[var(--color-border-strong)] px-2.5 py-2 text-xs font-medium text-[var(--color-ink-mid)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-ink)]"
          >
            Acessar painel de líder →
          </a>
        ) : null}
      </nav>
    </aside>
  );
}
