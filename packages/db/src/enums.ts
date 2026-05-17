// Domain enums mirrored from PostgreSQL types in supabase/migrations/...010_enums.sql.
// Single source of pt-BR labels used by both apps/web and apps/admin.

export const USER_ROLES = ['leader', 'operator'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const PRODUCTION_STATUSES = ['pending', 'active', 'completed', 'cancelled'] as const;
export type ProductionStatus = (typeof PRODUCTION_STATUSES)[number];

export const ATTENDANCE_STATUSES = [
  'present',
  'other_sector',
  'medical_leave',
  'absent',
  'holiday',
] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export const RESOURCE_KINDS = ['reactor', 'filler', 'mixer', 'other'] as const;
export type ResourceKind = (typeof RESOURCE_KINDS)[number];

export const AUDIT_ENTITIES = [
  'production_order',
  'production_run',
  'attendance',
  'operator',
  'resource',
  'profile',
] as const;
export type AuditEntity = (typeof AUDIT_ENTITIES)[number];

export const AUDIT_ACTIONS = [
  'create',
  'update',
  'delete',
  'start',
  'finish',
  'cancel',
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

// ─── Labels (pt-BR) ─────────────────────────────────────────────────────────

export const PRODUCTION_STATUS_LABELS = {
  pending: 'Pendente',
  active: 'Em andamento',
  completed: 'Finalizado',
  cancelled: 'Cancelado',
} as const satisfies Record<ProductionStatus, string>;

export const ATTENDANCE_STATUS_LABELS = {
  present: 'Presente',
  other_sector: 'Outro Setor',
  medical_leave: 'Atestado',
  absent: 'Falta',
  holiday: 'Feriado',
} as const satisfies Record<AttendanceStatus, string>;

export const USER_ROLE_LABELS = {
  leader: 'Líder',
  operator: 'Operador',
} as const satisfies Record<UserRole, string>;

export const RESOURCE_KIND_LABELS = {
  reactor: 'Reator',
  filler: 'Envasadora',
  mixer: 'Misturador',
  other: 'Outro',
} as const satisfies Record<ResourceKind, string>;

export const AUDIT_ACTION_LABELS = {
  create: 'Criou',
  update: 'Atualizou',
  delete: 'Excluiu',
  start: 'Iniciou',
  finish: 'Finalizou',
  cancel: 'Cancelou',
} as const satisfies Record<AuditAction, string>;

export const AUDIT_ENTITY_LABELS = {
  production_order: 'Ordem de produção',
  production_run: 'Registro de envase',
  attendance: 'Assiduidade',
  operator: 'Operador',
  resource: 'Reator',
  profile: 'Perfil',
} as const satisfies Record<AuditEntity, string>;

// ─── Colors (consumed by StatusBadge / charts) ──────────────────────────────

export const PRODUCTION_STATUS_TOKENS = {
  pending: 'var(--color-status-pending)',
  active: 'var(--color-status-active)',
  completed: 'var(--color-status-completed)',
  cancelled: 'var(--color-status-error)',
} as const satisfies Record<ProductionStatus, string>;

export const ATTENDANCE_STATUS_TOKENS = {
  present: 'var(--color-status-active)',
  other_sector: 'var(--color-status-info)',
  medical_leave: 'var(--color-status-pending)',
  absent: 'var(--color-status-error)',
  holiday: 'var(--color-ink-muted)',
} as const satisfies Record<AttendanceStatus, string>;
