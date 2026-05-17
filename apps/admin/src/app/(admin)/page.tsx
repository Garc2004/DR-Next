import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageContainer, SectionHeader, Skeleton, StatBlock, SurfaceCard } from '@dr/ui';
import { getServerClient } from '@dr/db/client/server';
import { getProductionKpi, getResourceRanking } from '@dr/db/queries/kpi';
import { ChartCard, ResourceRankingChart } from '@dr/charts';

export const metadata: Metadata = { title: 'Visão geral' };
export const experimental_ppr = true;

async function OverviewData() {
  const supabase = await getServerClient();
  const [kpi, ranking] = await Promise.all([
    getProductionKpi(supabase),
    getResourceRanking(supabase),
  ]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatBlock
          label="Volume total"
          value={`${kpi.total_units.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} m³`}
          accent
        />
        <StatBlock label="Envases concluídos" value={kpi.total_runs} />
        <StatBlock label="Em andamento" value={kpi.active_runs} accent={kpi.active_runs > 0} />
        <StatBlock label="Reatores ativos" value={ranking.length} />
      </div>

      <div className="mt-4">
        <ChartCard eyebrow="Ranking" title="Produção por reator">
          <ResourceRankingChart
            data={ranking.map((r) => ({ label: r.label, total: Number(r.total_units) }))}
          />
        </ChartCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <SurfaceCard eyebrow="Atividade recente" title="Próximos passos">
          <ul className="space-y-2 text-sm text-[var(--color-ink-mid)]">
            <li>• Acompanhe envases em <a href="/producao" className="underline">/producao</a></li>
            <li>• Auditoria completa em <a href="/logs" className="underline">/logs</a></li>
            <li>• Gestão de operadores em <a href="/assiduidade" className="underline">/assiduidade</a></li>
          </ul>
        </SurfaceCard>
        <SurfaceCard eyebrow="Saúde" title="Status do sistema">
          <p className="text-sm text-[var(--color-ink-mid)]">
            Tudo operando normalmente. Use <code>pnpm db:start</code> para subir um Supabase local.
          </p>
        </SurfaceCard>
      </div>
    </>
  );
}

export default function AdminOverviewPage() {
  return (
    <PageContainer size="wide">
      <SectionHeader
        eyebrow="Painel"
        title="Visão geral"
        subtitle="Indicadores agregados de produção, assiduidade e auditoria."
      />
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <OverviewData />
      </Suspense>
    </PageContainer>
  );
}
