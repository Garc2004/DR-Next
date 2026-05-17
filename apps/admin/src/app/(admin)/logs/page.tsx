import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageContainer, SectionHeader, Skeleton } from '@dr/ui';
import { getServerClient } from '@dr/db/client/server';
import { listAuditLogs } from '@dr/db/queries/audit';
import { AUDIT_ACTION_LABELS, AUDIT_ENTITY_LABELS } from '@dr/db/enums';

export const metadata: Metadata = { title: 'Auditoria' };
export const experimental_ppr = true;

const fmt = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

async function LogsTable() {
  const supabase = await getServerClient();
  const logs = await listAuditLogs(supabase, undefined, 200);

  return (
    <div className="overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
      <table className="w-full text-sm">
        <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-alt)] text-xs uppercase tracking-wider text-[var(--color-ink-muted)]">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Quando</th>
            <th className="px-3 py-2 text-left font-medium">Quem</th>
            <th className="px-3 py-2 text-left font-medium">O quê</th>
            <th className="px-3 py-2 text-left font-medium">Detalhe</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-3 py-6 text-center text-sm text-[var(--color-ink-mid)]">
                Nenhum registro de auditoria.
              </td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr key={log.id} className="border-b border-[var(--color-border)]">
                <td className="px-3 py-2 font-mono text-xs text-[var(--color-ink-mid)]">
                  {fmt.format(new Date(log.occurred_at))}
                </td>
                <td className="px-3 py-2">{log.actor_name ?? '—'}</td>
                <td className="px-3 py-2">
                  <span className="font-medium">{AUDIT_ACTION_LABELS[log.action]}</span>{' '}
                  <span className="text-[var(--color-ink-mid)]">
                    {AUDIT_ENTITY_LABELS[log.entity]}
                  </span>
                </td>
                <td className="px-3 py-2 font-mono text-xs text-[var(--color-ink-muted)]">
                  {log.entity_id?.slice(0, 8) ?? '—'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function LogsPage() {
  return (
    <PageContainer size="wide">
      <SectionHeader
        eyebrow="Auditoria"
        title="Registros do sistema"
        subtitle="Toda alteração é registrada automaticamente pelo trigger tg_audit."
      />
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <LogsTable />
      </Suspense>
    </PageContainer>
  );
}
