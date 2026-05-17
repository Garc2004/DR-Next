'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBrowserClient } from '@dr/db/client/browser';
import { qk } from '@dr/db/queries/keys';
import {
  cancelProductionRun,
  createProductionRun,
  finishProductionRun,
  getActiveRunForResource,
  listProductionRuns,
  softDeleteProductionRun,
  startProductionRun,
  type ProductionRunWithRelations,
} from '@dr/db/queries/production';
import { listResources } from '@dr/db/queries/resources';
import { useRealtimeSubscription } from '@dr/db/realtime/provider';
import type { ProductionFilters } from '@dr/db/schemas/production-run';
import { toast } from '@dr/ui';
import { useAtomValue } from 'jotai';
import { userAtom } from '@/lib/atoms/session';

export function useResources() {
  return useQuery({
    queryKey: qk.resources.all,
    queryFn: () => listResources(getBrowserClient(), { active: true }),
  });
}

export function useProductionRuns(filters: ProductionFilters) {
  const qc = useQueryClient();

  useRealtimeSubscription('production_runs', () => {
    qc.invalidateQueries({ queryKey: qk.production.all });
  });
  useRealtimeSubscription('production_orders', () => {
    qc.invalidateQueries({ queryKey: qk.production.all });
  });

  return useQuery({
    queryKey: qk.production.list(filters),
    queryFn: () => listProductionRuns(getBrowserClient(), filters),
  });
}

export function useActiveRunForResource(resourceId: string | null) {
  return useQuery({
    queryKey: ['production', 'active-for-resource', resourceId ?? 'none'],
    queryFn: () => {
      if (!resourceId) return null;
      return getActiveRunForResource(getBrowserClient(), resourceId);
    },
    enabled: Boolean(resourceId),
  });
}

interface CreateRunVars {
  order_number: number;
  batch_number: number;
  resource_id: string;
  product_name?: string;
  notes?: string;
}

export function useCreateRun() {
  const qc = useQueryClient();
  const user = useAtomValue(userAtom);
  return useMutation({
    mutationFn: async (vars: CreateRunVars) => {
      if (!user) throw new Error('Não autenticado');
      return createProductionRun(getBrowserClient(), { ...vars, created_by: user.id });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.production.all });
      toast.success('Registro criado');
    },
    onError: (err: Error) => {
      toast.error('Erro ao criar registro', { description: err.message });
    },
  });
}

export function useStartRun() {
  const qc = useQueryClient();
  const user = useAtomValue(userAtom);

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Não autenticado');
      return startProductionRun(getBrowserClient(), id, user.id);
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: qk.production.all });
      const snapshot = qc.getQueriesData<ProductionRunWithRelations[]>({
        queryKey: qk.production.all,
      });
      for (const [key, runs] of snapshot) {
        qc.setQueryData<ProductionRunWithRelations[]>(key, (prev) =>
          prev?.map((r) =>
            r.id === id ? { ...r, status: 'active', started_at: new Date().toISOString() } : r,
          ),
        );
      }
      return { snapshot };
    },
    onError: (err: Error, _id, ctx) => {
      ctx?.snapshot.forEach(([key, value]) => qc.setQueryData(key, value));
      toast.error('Erro ao iniciar', { description: err.message });
    },
    onSettled: () => qc.invalidateQueries({ queryKey: qk.production.all }),
  });
}

export function useFinishRun() {
  const qc = useQueryClient();
  const user = useAtomValue(userAtom);

  return useMutation({
    mutationFn: async (vars: { id: string; units_produced: number }) => {
      if (!user) throw new Error('Não autenticado');
      return finishProductionRun(getBrowserClient(), { ...vars, finished_by: user.id });
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: qk.production.all });
      const snapshot = qc.getQueriesData<ProductionRunWithRelations[]>({
        queryKey: qk.production.all,
      });
      for (const [key, runs] of snapshot) {
        qc.setQueryData<ProductionRunWithRelations[]>(key, (prev) =>
          prev?.map((r) =>
            r.id === vars.id
              ? {
                  ...r,
                  status: 'completed',
                  ended_at: new Date().toISOString(),
                  units_produced: vars.units_produced,
                }
              : r,
          ),
        );
      }
      return { snapshot };
    },
    onError: (err: Error, _vars, ctx) => {
      ctx?.snapshot.forEach(([key, value]) => qc.setQueryData(key, value));
      toast.error('Erro ao finalizar', { description: err.message });
    },
    onSuccess: () => toast.success('Envase finalizado'),
    onSettled: () => qc.invalidateQueries({ queryKey: qk.production.all }),
  });
}

export function useCancelRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelProductionRun(getBrowserClient(), id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.production.all });
      toast.success('Registro cancelado');
    },
    onError: (err: Error) =>
      toast.error('Erro ao cancelar', { description: err.message }),
  });
}

export function useDeleteRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => softDeleteProductionRun(getBrowserClient(), id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.production.all });
      toast.success('Registro excluído');
    },
    onError: (err: Error) =>
      toast.error('Erro ao excluir', { description: err.message }),
  });
}
