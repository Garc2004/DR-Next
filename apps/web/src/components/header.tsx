'use client';

import * as React from 'react';
import { useAtomValue } from 'jotai';
import { useRouter } from 'next/navigation';
import { LogOut, MoreHorizontal } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@dr/ui';
import { getBrowserClient } from '@dr/db/client/browser';
import { displayNameAtom, userRoleAtom } from '@/lib/atoms/session';

interface Props {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: Props) {
  const router = useRouter();
  const displayName = useAtomValue(displayNameAtom);
  const role = useAtomValue(userRoleAtom);

  const initials = React.useMemo(() => {
    if (!displayName) return 'DR';
    return displayName
      .split(' ')
      .map((s) => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [displayName]);

  async function signOut() {
    await getBrowserClient().auth.signOut();
    router.replace('/login');
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-canvas)]/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="min-w-0">
        <h1 className="truncate text-sm font-semibold tracking-tight">{title}</h1>
        {subtitle ? (
          <p className="truncate text-xs text-[var(--color-ink-mid)]">{subtitle}</p>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden text-xs text-[var(--color-ink-muted)] sm:inline">
          {role === 'leader' ? 'Líder' : 'Operador'}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Menu do usuário">
              <Avatar className="size-8">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{displayName ?? 'Usuário'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => router.push('/perfil')}>
              <MoreHorizontal className="size-4" />
              Perfil e preferências
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={signOut} className="text-[var(--color-status-error)]">
              <LogOut className="size-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
