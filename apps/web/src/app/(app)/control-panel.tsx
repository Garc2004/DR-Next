'use client';

import * as React from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { Plus } from 'lucide-react';
import { Button, SectionHeader, StatBlock } from '@dr/ui';
import { productionDialogAtom } from '@/lib/atoms/dialogs';
import { productionFiltersAtom } from '@/lib/atoms/filters';
import { useProductionRuns } from '@/features/production/hooks';
import { ProductionTable } from '@/features/production/components/production-table';
import { ProductionFiltersBar } from '@/features/production/components/production-filters';
import { AddRunDialog } from '@/features/production/components/add-run-dialog';
import { FinishRunDialog } from '@/features/production/components/finish-run-dialog';
import {
  CancelRunDialog,
  DeleteRunDialog,
} from '@/features/production/components/confirm-dialogs';
import { fmtVolume } from '@/lib/format';

export function ControlPanel() {
  const filters = useAtomValue(productionFiltersAtom);
  const openDialog = useSetAtom(productionDialogAtom);
  const runs = useProductionRuns(filters);

  const filteredData = React.useMemo(() => {
    const data = runs.data ?? [];
    if (!filters.query) return data;
    const q = filters.query.toLowerCase();
    return data.filter((r) => {
      const order = String(r.order?.order_number ?? '');
      const batch = String(r.order?.batch_number ?? '');
      return order.includes(q) || batch.includes(q);
    });
  }, [runs.data, filters.query]);

  const stats = React.useMemo(() => {
    const data = runs.data ?? [];
    const active = data.filter((r) => r.status === 'active').length;
    const pending = data.filter((r) => r.status === 'pending').length;
    const completed = data.filter((r) => r.status === 'completed');
    const totalUnits = completed.reduce((sum, r) => sum + Number(r.units_produced), 0);
    return { active, pending, completed: completed.length, totalUnits };
  }, [runs.data]);

  return (
    <>
      <SectionHeader
        title="Envases"
        subtitle="Painel operacional sincronizado em tempo real com o reator."
        actions={
          <Button variant="accent" onClick={() => openDialog({ kind: 'add' })}>
            <Plus className="size-4" />
            Novo registro
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatBlock label="Em andamento" value={stats.active} accent={stats.active > 0} />
        <StatBlock label="Pendentes" value={stats.pending} />
        <StatBlock label="Finalizados" value={stats.completed} />
        <StatBlock
          label="Volume total"
          value={`${fmtVolume(stats.totalUnits)} m³`}
          hint="Apenas envases finalizados"
        />
      </div>

      <div className="mb-3">
        <ProductionFiltersBar />
      </div>

      <ProductionTable data={filteredData} loading={runs.isLoading} />

      <AddRunDialog />
      <FinishRunDialog />
      <CancelRunDialog />
      <DeleteRunDialog />
    </>
  );
}
