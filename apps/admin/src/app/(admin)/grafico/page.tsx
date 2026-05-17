import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageContainer, SectionHeader, Skeleton } from '@dr/ui';
import { ChartCard, CumulativeLineChart, DailyBarChart, ResourceRankingChart } from '@dr/charts';
import { getServerClient } from '@dr/db/client/server';
import { getDailyProduction, getResourceRanking } from '@dr/db/queries/kpi';

export const metadata: Metadata = { title: 'Indicadores' };
export const experimental_ppr = true;

async function Data() {
  const supabase = await getServerClient();
  const now = new Date();
  const fromDate = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().slice(0, 10);
  const toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  const [daily, ranking] = await Promise.all([
    getDailyProduction(supabase, fromDate, toDate),
    getResourceRanking(supabase),
  ]);

  const dailyData = daily.map((d) => ({
    day: new Date(d.production_day).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    units: Number(d.total_units),
  }));
  let acc = 0;
  const cumulative = dailyData.map((d) => ({ day: d.day, cumulative: (acc += d.units) }));

  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
      <ChartCard eyebrow="Volume" title="Produção diária (últimos 3 meses)">
        <DailyBarChart data={dailyData} />
      </ChartCard>
      <ChartCard eyebrow="Tendência" title="Acumulado">
        <CumulativeLineChart data={cumulative} />
      </ChartCard>
      <ChartCard
        eyebrow="Ranking"
        title="Produção total por reator"
        className="xl:col-span-2"
      >
        <ResourceRankingChart
          data={ranking.map((r) => ({ label: r.label, total: Number(r.total_units) }))}
        />
      </ChartCard>
    </div>
  );
}

export default function AdminGraficoPage() {
  return (
    <PageContainer size="wide">
      <SectionHeader eyebrow="Indicadores" title="Análise avançada" />
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <Data />
      </Suspense>
    </PageContainer>
  );
}
