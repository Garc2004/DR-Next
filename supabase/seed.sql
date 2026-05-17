-- Local dev seed: creates 1 leader + 2 operators + a handful of operators on the floor.
-- This file runs after migrations on `supabase db reset`.

-- ────────────────────────────────────────────────────────────────────────────
-- Auth users (only for local dev — DO NOT run in production)
-- Passwords: "DrNext!2026" for all dev users.
-- ────────────────────────────────────────────────────────────────────────────

insert into auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values
(
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated',
  'lider@dr.local',
  crypt('DrNext!2026', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"username":"lider","display_name":"Líder Industrial","role":"leader"}'::jsonb,
  false, now(), now(),
  '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '22222222-2222-2222-2222-222222222222',
  'authenticated', 'authenticated',
  'operador1@dr.local',
  crypt('DrNext!2026', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"username":"operador1","display_name":"Operador Um","role":"operator"}'::jsonb,
  false, now(), now(),
  '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '33333333-3333-3333-3333-333333333333',
  'authenticated', 'authenticated',
  'operador2@dr.local',
  crypt('DrNext!2026', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"username":"operador2","display_name":"Operador Dois","role":"operator"}'::jsonb,
  false, now(), now(),
  '', '', '', ''
)
on conflict (id) do nothing;

-- handle_new_user trigger will populate public.profiles automatically.

-- ────────────────────────────────────────────────────────────────────────────
-- Floor operators
-- ────────────────────────────────────────────────────────────────────────────
insert into public.operators (full_name, job_title) values
  ('João da Silva',     'Envasador'),
  ('Maria Oliveira',    'Envasadora'),
  ('Carlos Souza',      'Auxiliar de produção'),
  ('Ana Pereira',       'Envasadora'),
  ('Pedro Lima',        'Operador de reator'),
  ('Juliana Costa',     'Operadora de reator'),
  ('Rafael Mendes',     'Auxiliar de produção'),
  ('Beatriz Ferreira',  'Envasadora')
on conflict do nothing;
