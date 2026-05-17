-- Seed: 14 reactors (replaces hardcoded RESOURCES constant)

insert into public.resources (code, label, kind, position) values
  ('reator-01', 'Reator 01', 'reactor',  1),
  ('reator-02', 'Reator 02', 'reactor',  2),
  ('reator-03', 'Reator 03', 'reactor',  3),
  ('reator-04', 'Reator 04', 'reactor',  4),
  ('reator-05', 'Reator 05', 'reactor',  5),
  ('reator-06', 'Reator 06', 'reactor',  6),
  ('reator-07', 'Reator 07', 'reactor',  7),
  ('reator-08', 'Reator 08', 'reactor',  8),
  ('reator-09', 'Reator 09', 'reactor',  9),
  ('reator-10', 'Reator 10', 'reactor', 10),
  ('reator-11', 'Reator 11', 'reactor', 11),
  ('reator-12', 'Reator 12', 'reactor', 12),
  ('reator-13', 'Reator 13', 'reactor', 13),
  ('reator-14', 'Reator 14', 'reactor', 14)
on conflict (code) do nothing;
