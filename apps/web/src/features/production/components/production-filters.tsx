'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@dr/ui';
import { PRODUCTION_STATUSES, PRODUCTION_STATUS_LABELS } from '@dr/db/enums';
import { productionFiltersAtom } from '@/lib/atoms/filters';
import { useResources } from '../hooks';

export function ProductionFiltersBar() {
  const [filters, setFilters] = useAtom(productionFiltersAtom);
  const resources = useResources();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        placeholder="Buscar ordem ou lote…"
        value={filters.query ?? ''}
        onChange={(e) => setFilters({ ...filters, query: e.target.value })}
        className="h-9 w-full max-w-xs"
      />
      <Select
        value={filters.status}
        onValueChange={(v) => setFilters({ ...filters, status: v as typeof filters.status })}
      >
        <SelectTrigger className="h-9 w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          {PRODUCTION_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {PRODUCTION_STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.resource_id}
        onValueChange={(v) => setFilters({ ...filters, resource_id: v })}
      >
        <SelectTrigger className="h-9 w-44">
          <SelectValue placeholder="Reator" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os reatores</SelectItem>
          {resources.data?.map((r) => (
            <SelectItem key={r.id} value={r.id}>
              {r.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
