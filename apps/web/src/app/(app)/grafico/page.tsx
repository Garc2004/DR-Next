import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageContainer, SectionHeader, Skeleton, StatBlock } from '@dr/ui';
import { ChartCard, DailyBarChart, CumulativeLineChart } from '@dr/charts';
import { getServerClient } from '@dr/db/client/server';
import { getDailyProduction, getResourceRanking } from '@dr/db/queries/kpi';
import { Header } from '@/components/header';

export const metadata: Metadata = { title: 'Indicadores' };
export const experimental_ppr = true;

function startOfMonth(d: Date): string {
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}
function endOfMonth(d: Date): string {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
}

async function GraficoData() {
  const supabase = await getServerClient();
  const now = new Date();
  const [daily, ranking] = await Promise.all([
    getDailyProduction(supabase, startOfMonth(now), endOfMonth(now)),
    getResourceRanking(supabase),
  ]);

  const totalUnits = ranking.reduce((s, r) => s + Number(r.total_units), 0);
  const totalRuns = ranking.reduce((s, r) => s + r.completed_runs, 0);

  const dailyData = daily.map((d) => ({
    day: new Date(d.production_day).getDate().toString().padStart(2, '0'),
    units: Number(d.total_units),
  }));

  let acc = 0;
  const cumulative = dailyData.map((d) => {
    acc += d.units;
    return { day: d.day, cumulative: acc };
  });

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatBlock
          label="Volume total no mês"
          value={`${totalUnits.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} m³`}
          accent
        />
        <StatBlock label="Envases concluídos" value={totalRuns} />
        <StatBlock
          label="Média por reator"
          value={
            ranking.length
              ? (totalUnits / ranking.length).toLocaleString('pt-BR', {
                  maximumFractionDigits: 2,
                })
              : '—'
          }
          hint="m³ por reator"
        />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
        <ChartCard eyebrow="Diário" title="Volume produzido por dia">
          <DailyBarChart data={dailyData} />
        </ChartCard>
        <ChartCard eyebrow="Tendência" title="Acumulado do mês">
          <CumulativeLineChart data={cumulative} />
        </ChartCard>
      </div>
    </>
  );
}

export default function GraficoPage() {
  return (
    <>
      <Header title="Indicadores de produção" subtitle="Acompanhe os números do mês" />
      <PageContainer size="wide">
        <SectionHeader title="Visão geral" subtitle="Dados consolidados em tempo real" />
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          }
        >
          <GraficoData />
        </Suspense>
      </PageContainer>
    </>
  );
}
