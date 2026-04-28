drop policy if exists "Usuários recebem papel inicial" on public.user_roles;
create policy "Usuário recebe papel inicial seguro" on public.user_roles for insert to authenticated with check (
  user_id = auth.uid()
  and not exists (select 1 from public.usuarios u where u.id = auth.uid())
);
