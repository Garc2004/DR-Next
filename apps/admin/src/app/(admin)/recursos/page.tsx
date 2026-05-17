import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageContainer, SectionHeader, Skeleton, Badge } from '@dr/ui';
import { getServerClient } from '@dr/db/client/server';
import { listResources } from '@dr/db/queries/resources';
import { RESOURCE_KIND_LABELS } from '@dr/db/enums';

export const metadata: Metadata = { title: 'Reatores' };
export const experimental_ppr = true;

async function ResourcesList() {
  const supabase = await getServerClient();
  const resources = await listResources(supabase);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {resources.map((r) => (
        <div
          key={r.id}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">{r.label}</h3>
            <Badge variant={r.active ? 'success' : 'outline'}>
              {r.active ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
          <p className="mt-1 font-mono text-xs text-[var(--color-ink-muted)]">{r.code}</p>
          <p className="mt-2 text-xs text-[var(--color-ink-mid)]">
            {RESOURCE_KIND_LABELS[r.kind]} · posição {r.position}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function RecursosPage() {
  return (
    <PageContainer size="wide">
      <SectionHeader
        eyebrow="Recursos"
        title="Reatores"
        subtitle="Gestão dos equipamentos de envase. Adicione novos reatores conforme necessário."
      />
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <ResourcesList />
      </Suspense>
    </PageContainer>
  );
}
