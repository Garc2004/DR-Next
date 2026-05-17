import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageContainer, SectionHeader, Skeleton, Badge } from '@dr/ui';
import { getServerClient } from '@dr/db/client/server';
import { USER_ROLE_LABELS as ROLE_LABELS } from '@dr/db/enums';

export const metadata: Metadata = { title: 'Usuários' };
export const experimental_ppr = true;

async function UsersList() {
  const supabase = await getServerClient();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .is('deleted_at', null)
    .order('display_name', { ascending: true });

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
      <table className="w-full text-sm">
        <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-alt)] text-xs uppercase tracking-wider text-[var(--color-ink-muted)]">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Nome</th>
            <th className="px-3 py-2 text-left font-medium">Usuário</th>
            <th className="px-3 py-2 text-left font-medium">Função</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((p) => (
            <tr key={p.id} className="border-b border-[var(--color-border)]">
              <td className="px-3 py-2 font-medium">{p.display_name}</td>
              <td className="px-3 py-2 text-[var(--color-ink-mid)]">@{p.username}</td>
              <td className="px-3 py-2">
                <Badge variant={p.role === 'leader' ? 'accent' : 'secondary'}>
                  {ROLE_LABELS[p.role]}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function UsuariosPage() {
  return (
    <PageContainer size="wide">
      <SectionHeader eyebrow="Acesso" title="Usuários" />
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <UsersList />
      </Suspense>
    </PageContainer>
  );
}
