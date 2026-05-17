'use client';

import * as React from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useSetAtom } from 'jotai';
import { ChevronDown, ChevronUp, MoreHorizontal, Play, Square, Trash2, XCircle } from 'lucide-react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  EmptyState,
} from '@dr/ui';
import type { ProductionRunWithRelations } from '@dr/db/queries/production';
import { productionDialogAtom } from '@/lib/atoms/dialogs';
import { fmtDateTime, fmtDuration, fmtVolume } from '@/lib/format';
import { useStartRun } from '../hooks';
import { ProductionStatusBadge } from './production-status-badge';

const ROW_HEIGHT = 52;

const COLUMNS: ColumnDef<ProductionRunWithRelations>[] = [
  {
    id: 'order',
    accessorFn: (row) => row.order?.order_number ?? 0,
    header: 'Ordem',
    cell: ({ row }) => (
      <span className="font-mono tabular-nums text-[var(--color-ink)]">
        {row.original.order?.order_number ?? '—'}
      </span>
    ),
    size: 110,
  },
  {
    id: 'batch',
    accessorFn: (row) => row.order?.batch_number ?? 0,
    header: 'Lote',
    cell: ({ row }) => (
      <span className="font-mono tabular-nums text-[var(--color-ink-mid)]">
        {row.original.order?.batch_number ?? '—'}
      </span>
    ),
    size: 130,
  },
  {
    id: 'resource',
    accessorFn: (row) => row.resource?.label ?? '',
    header: 'Reator',
    cell: ({ row }) => row.original.resource?.label ?? '—',
    size: 110,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <ProductionStatusBadge status={row.original.status} />,
    size: 130,
  },
  {
    id: 'units',
    accessorKey: 'units_produced',
    header: () => <span className="block text-right">Volume (m³)</span>,
    cell: ({ row }) => (
      <span className="block text-right font-mono tabular-nums">
        {row.original.status === 'completed' ? fmtVolume(row.original.units_produced) : '—'}
      </span>
    ),
    size: 120,
  },
  {
    id: 'started',
    accessorKey: 'started_at',
    header: 'Início',
    cell: ({ row }) => (
      <span className="text-[var(--color-ink-mid)]">{fmtDateTime(row.original.started_at)}</span>
    ),
    size: 150,
  },
  {
    id: 'ended',
    accessorKey: 'ended_at',
    header: 'Fim',
    cell: ({ row }) => (
      <span className="text-[var(--color-ink-mid)]">{fmtDateTime(row.original.ended_at)}</span>
    ),
    size: 150,
  },
  {
    id: 'duration',
    header: 'Duração',
    cell: ({ row }) => (
      <span className="text-[var(--color-ink-mid)]">
        {fmtDuration(row.original.started_at, row.original.ended_at)}
      </span>
    ),
    size: 100,
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => <RowActions run={row.original} />,
    size: 48,
    enableSorting: false,
  },
];

function RowActions({ run }: { run: ProductionRunWithRelations }) {
  const startRun = useStartRun();
  const openDialog = useSetAtom(productionDialogAtom);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Ações">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {run.status === 'pending' ? (
          <DropdownMenuItem onSelect={() => startRun.mutate(run.id)}>
            <Play className="size-4" />
            Iniciar envase
          </DropdownMenuItem>
        ) : null}
        {run.status === 'active' ? (
          <DropdownMenuItem onSelect={() => openDialog({ kind: 'finish', runId: run.id })}>
            <Square className="size-4" />
            Finalizar
          </DropdownMenuItem>
        ) : null}
        {run.status !== 'cancelled' && run.status !== 'completed' ? (
          <DropdownMenuItem
            onSelect={() => openDialog({ kind: 'cancel', runId: run.id })}
            className="text-[var(--color-status-error)]"
          >
            <XCircle className="size-4" />
            Cancelar
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          onSelect={() => openDialog({ kind: 'delete', runId: run.id })}
          className="text-[var(--color-status-error)]"
        >
          <Trash2 className="size-4" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface Props {
  data: ProductionRunWithRelations[];
  loading?: boolean;
}

export function ProductionTable({ data, loading = false }: Props) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'started', desc: true },
  ]);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const table = useReactTable({
    data,
    columns: COLUMNS,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const rows = table.getRowModel().rows;
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  });

  if (!loading && data.length === 0) {
    return (
      <EmptyState
        title="Nenhum registro encontrado"
        description="Crie um novo registro de envase para começar."
      />
    );
  }

  return (
    <div
      ref={scrollRef}
      className="relative overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
      style={{ height: 'calc(100vh - 280px)', minHeight: 320 }}
    >
      <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
        <thead className="sticky top-0 z-10 bg-[var(--color-surface)]/95 backdrop-blur">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b border-[var(--color-border)]">
              {hg.headers.map((header) => {
                const sort = header.column.getIsSorted();
                return (
                  <th
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className="h-10 px-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-ink-muted)]"
                  >
                    {header.column.getCanSort() ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="inline-flex items-center gap-1 hover:text-[var(--color-ink)]"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sort === 'asc' ? <ChevronUp className="size-3" /> : null}
                        {sort === 'desc' ? <ChevronDown className="size-3" /> : null}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody
          style={{
            display: 'block',
            position: 'relative',
            height: rowVirtualizer.getTotalSize(),
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            if (!row) return null;
            return (
              <tr
                key={row.id}
                data-state={row.getIsSelected() ? 'selected' : undefined}
                className="absolute left-0 right-0 table border-b border-[var(--color-border)] hover:bg-[var(--color-surface-alt)]"
                style={{
                  height: virtualRow.size,
                  transform: `translateY(${virtualRow.start}px)`,
                  tableLayout: 'fixed',
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    style={{ width: cell.column.getSize() }}
                    className="px-3 py-2.5 align-middle"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
