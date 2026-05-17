-- Extensions required by the DR-Next schema
create extension if not exists "pg_trgm" with schema extensions;
create extension if not exists "btree_gist" with schema extensions;
create extension if not exists "citext" with schema extensions;
create extension if not exists "pgcrypto" with schema extensions;
