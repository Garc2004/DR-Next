'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarCheck2, FactoryIcon, LineChart, UserCircle2 } from 'lucide-react';
import { cn } from '@dr/ui';

const ITEMS = [
  { href: '/', label: 'Envase', icon: FactoryIcon },
  { href: '/assiduidade', label: 'Assid.', icon: CalendarCheck2 },
  { href: '/grafico', label: 'Indic.', icon: LineChart },
  { href: '/perfil', label: 'Perfil', icon: UserCircle2 },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-0 z-30 grid grid-cols-4 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-md md:hidden">
      {ITEMS.map((item) => {
        const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-0.5 px-2 py-2 text-[10px] font-medium transition-colors',
              active ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-muted)]',
            )}
          >
            <Icon className="size-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
