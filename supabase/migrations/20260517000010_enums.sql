-- Domain enums (PostgreSQL native types)

create type public.user_role as enum ('leader', 'operator');

create type public.production_status as enum ('pending', 'active', 'completed', 'cancelled');

create type public.attendance_status as enum (
  'present',
  'other_sector',
  'medical_leave',
  'absent',
  'holiday'
);

create type public.resource_kind as enum ('reactor', 'filler', 'mixer', 'other');

create type public.audit_entity as enum (
  'production_order',
  'production_run',
  'attendance',
  'operator',
  'resource',
  'profile'
);

create type public.audit_action as enum (
  'create',
  'update',
  'delete',
  'start',
  'finish',
  'cancel'
);
