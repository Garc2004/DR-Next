import type { ProductionFilters } from '../schemas/production-run';
import type { AuditFilters } from '../schemas/audit-log';

/**
 * Stable, exhaustive query-key factory. Every list/detail key starts with the
 * feature namespace so a feature can invalidate all of its queries with
 * `qc.invalidateQueries({ queryKey: qk.production.all })`.
 */
export const qk = {
  production: {
    all: ['production'] as const,
    list: (filters?: ProductionFilters) => ['production', 'list', filters ?? null] as const,
    detail: (id: string) => ['production', 'detail', id] as const,
    kpi: ['production', 'kpi'] as const,
    daily: (month: string) => ['production', 'daily', month] as const,
    ranking: (month: string) => ['production', 'ranking', month] as const,
    orders: ['production', 'orders'] as const,
  },
  attendance: {
    all: ['attendance'] as const,
    month: (year: number, month: number) => ['attendance', 'month', year, month] as const,
    summary: (month: string) => ['attendance', 'summary', month] as const,
  },
  operators: {
    all: ['operators'] as const,
    list: (active?: boolean) => ['operators', 'list', active ?? null] as const,
  },
  resources: {
    all: ['resources'] as const,
    list: (active?: boolean) => ['resources', 'list', active ?? null] as const,
  },
  audit: {
    all: ['audit'] as const,
    list: (filters?: AuditFilters) => ['audit', 'list', filters ?? null] as const,
  },
  profile: (id: string) => ['profile', id] as const,
  session: ['session'] as const,
} as const;

/**
 * Server-side cache tags (used by `revalidateTag` in server actions).
 */
export const tags = {
  productionList: 'production:list',
  productionKpi: 'production:kpi',
  productionRun: (id: string) => `production:run:${id}`,
  productionDaily: (month: string) => `production:daily:${month}`,
  productionRanking: (month: string) => `production:ranking:${month}`,
  attendanceMonth: (year: number, month: number) => `attendance:month:${year}-${month}`,
  attendanceSummary: 'attendance:summary',
  auditList: 'audit:list',
  resourcesAll: 'resources:all',
  operatorsAll: 'operators:all',
  profile: (id: string) => `profile:${id}`,
} as const;
