drop policy if exists "Usuários criam escritório no cadastro" on public.escritorios;
create policy "Usuários autenticados criam escritório" on public.escritorios for insert to authenticated with check (auth.uid() is not null);

revoke execute on function public.has_role(uuid, public.app_role) from public, anon, authenticated;
revoke execute on function public.current_user_escritorio_id() from public, anon, authenticated;
revoke execute on function public.user_belongs_to_office(uuid) from public, anon, authenticated;
revoke execute on function public.can_access_empresa(uuid) from public, anon, authenticated;
revoke execute on function public.recalcular_risco_empresa(uuid) from public, anon, authenticated;

grant execute on function public.has_role(uuid, public.app_role) to postgres, service_role;
grant execute on function public.current_user_escritorio_id() to postgres, service_role;
grant execute on function public.user_belongs_to_office(uuid) to postgres, service_role;
grant execute on function public.can_access_empresa(uuid) to postgres, service_role;
grant execute on function public.recalcular_risco_empresa(uuid) to postgres, service_role;
