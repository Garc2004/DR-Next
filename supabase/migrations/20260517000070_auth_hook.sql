-- Custom Access Token Hook
-- Copies profiles.role into JWT app_metadata so middleware can role-check
-- without a database query.
-- See https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_role public.user_role;
  v_display_name text;
  v_claims jsonb;
begin
  -- Lookup the profile for the user being issued a token
  select role, display_name into v_role, v_display_name
  from public.profiles
  where id = (event->>'user_id')::uuid
    and deleted_at is null;

  v_claims := coalesce(event->'claims', '{}'::jsonb);

  if v_role is not null then
    v_claims := jsonb_set(
      v_claims,
      '{app_metadata}',
      coalesce(v_claims->'app_metadata', '{}'::jsonb)
        || jsonb_build_object('role', v_role::text, 'display_name', v_display_name),
      true
    );
  end if;

  return jsonb_set(event, '{claims}', v_claims, true);
end;
$$;

-- Allow the Supabase auth admin role to call the hook
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook(jsonb) from authenticated, anon, public;

grant select on public.profiles to supabase_auth_admin;
