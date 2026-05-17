'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarCheck2,
  Cpu,
  FactoryIcon,
  Gauge,
  LineChart,
  ScrollText,
  Users,
} from 'lucide-react';
import { cn } from '@dr/ui';

const ITEMS = [
  { href: '/', label: 'Visão geral', icon: Gauge },
  { href: '/producao', label: 'Produção', icon: FactoryIcon },
  { href: '/assiduidade', label: 'Assiduidade', icon: CalendarCheck2 },
  { href: '/grafico', label: 'Indicadores', icon: LineChart },
  { href: '/logs', label: 'Auditoria', icon: ScrollText },
  { href: '/usuarios', label: 'Usuários', icon: Users },
  { href: '/recursos', label: 'Reatores', icon: Cpu },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const webUrl = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000';

  return (
    <aside className="hidden h-screen w-60 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] md:flex">
      <div className="flex h-14 items-center gap-2 border-b border-[var(--color-border)] px-4">
        <div className="grid size-7 place-items-center rounded-md bg-[var(--color-ink)] text-xs font-bold text-white">
          DR
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">DR-Next</p>
          <p className="text-[10px] uppercase tracking-wider text-[var(--color-ink-muted)]">
            Admin
          </p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {ITEMS.map((item) => {
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
        <a
          href={webUrl}
          className="mt-auto flex items-center gap-2.5 rounded-md border border-dashed border-[var(--color-border-strong)] px-2.5 py-2 text-xs font-medium text-[var(--color-ink-mid)] hover:bg-[var(--color-surface-alt)]"
        >
          ← Voltar para operação
        </a>
      </nav>
    </aside>
  );
}
