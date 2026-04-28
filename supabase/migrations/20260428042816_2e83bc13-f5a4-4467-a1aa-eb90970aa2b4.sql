create type public.app_role as enum ('administrador', 'gestor', 'operador', 'cliente');

create table public.escritorios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cnpj text not null unique,
  email text,
  telefone text,
  plano text not null default 'free',
  created_at timestamptz not null default now()
);

create table public.usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  escritorio_id uuid not null references public.escritorios(id) on delete cascade,
  nome text not null,
  email text not null,
  telefone text,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create table public.empresas (
  id uuid primary key default gen_random_uuid(),
  escritorio_id uuid not null references public.escritorios(id) on delete cascade,
  grupo_empresarial_id uuid references public.empresas(id) on delete set null,
  matriz_id uuid references public.empresas(id) on delete set null,
  razao_social text not null,
  nome_fantasia text,
  cnpj text not null,
  inscricao_estadual text,
  inscricao_municipal text,
  regime_tributario text not null,
  uf text not null,
  municipio text not null,
  email_cliente text,
  telefone text,
  responsavel_id uuid references public.usuarios(id) on delete set null,
  status text not null default 'ativa',
  risco_score integer not null default 0,
  created_at timestamptz not null default now(),
  unique (escritorio_id, cnpj)
);

create table public.empresa_usuarios (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (empresa_id, usuario_id)
);

create table public.documentos (
  id uuid primary key default gen_random_uuid(),
  escritorio_id uuid not null references public.escritorios(id) on delete cascade,
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  tipo_documento text not null,
  numero_documento text,
  data_emissao date,
  data_vencimento date not null,
  arquivo_url text,
  status text not null default 'valido',
  observacoes text,
  created_at timestamptz not null default now()
);

create table public.obrigacoes (
  id uuid primary key default gen_random_uuid(),
  escritorio_id uuid not null references public.escritorios(id) on delete cascade,
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  competencia text not null,
  tipo_obrigacao text not null,
  data_limite date not null,
  status text not null default 'pendente',
  responsavel_id uuid references public.usuarios(id) on delete set null,
  protocolo text,
  arquivo_comprovante_url text,
  observacoes text,
  created_at timestamptz not null default now()
);

create table public.tarefas (
  id uuid primary key default gen_random_uuid(),
  escritorio_id uuid not null references public.escritorios(id) on delete cascade,
  empresa_id uuid references public.empresas(id) on delete cascade,
  titulo text not null,
  descricao text,
  tipo text,
  prioridade text not null default 'media',
  status text not null default 'a_fazer',
  responsavel_id uuid references public.usuarios(id) on delete set null,
  data_limite date,
  created_at timestamptz not null default now(),
  concluida_em timestamptz
);

create table public.tarefa_comentarios (
  id uuid primary key default gen_random_uuid(),
  tarefa_id uuid not null references public.tarefas(id) on delete cascade,
  usuario_id uuid references public.usuarios(id) on delete set null,
  comentario text not null,
  created_at timestamptz not null default now()
);

create table public.alertas (
  id uuid primary key default gen_random_uuid(),
  escritorio_id uuid not null references public.escritorios(id) on delete cascade,
  empresa_id uuid references public.empresas(id) on delete cascade,
  documento_id uuid references public.documentos(id) on delete cascade,
  obrigacao_id uuid references public.obrigacoes(id) on delete cascade,
  tipo_alerta text not null,
  mensagem text not null,
  data_alerta date not null,
  enviado boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.emails_alerta (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  email text not null,
  principal boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.historico_acoes (
  id uuid primary key default gen_random_uuid(),
  escritorio_id uuid not null references public.escritorios(id) on delete cascade,
  empresa_id uuid references public.empresas(id) on delete cascade,
  usuario_id uuid references public.usuarios(id) on delete set null,
  acao text not null,
  detalhes text,
  created_at timestamptz not null default now()
);

create table public.configuracoes_alerta (
  id uuid primary key default gen_random_uuid(),
  escritorio_id uuid not null unique references public.escritorios(id) on delete cascade,
  dias_antes integer[] not null default array[30,15,7,0],
  repetir_vencido_dias integer not null default 5,
  modelos_email jsonb not null default '{}'::jsonb,
  tipos_documentos text[] not null default array['CND Federal','CND Estadual','CND Municipal','FGTS','Trabalhista','Alvará Municipal','Alvará de Bombeiros','Certificado Digital','Contratos','Outros documentos'],
  tipos_obrigacoes text[] not null default array['DCTFWeb','EFD-Reinf','eSocial','SPED Fiscal','SPED Contribuições','PGDAS-D','DEFIS','DIRF','ECD','ECF','MIT','Outras obrigações'],
  created_at timestamptz not null default now()
);

create index idx_usuarios_escritorio on public.usuarios(escritorio_id);
create index idx_empresas_escritorio on public.empresas(escritorio_id);
create index idx_empresas_cnpj on public.empresas(cnpj);
create index idx_documentos_empresa_vencimento on public.documentos(empresa_id, data_vencimento);
create index idx_obrigacoes_empresa_limite on public.obrigacoes(empresa_id, data_limite);
create index idx_tarefas_responsavel_status on public.tarefas(responsavel_id, status);
create index idx_alertas_data on public.alertas(data_alerta, enviado);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create or replace function public.current_user_escritorio_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select escritorio_id from public.usuarios where id = auth.uid() and ativo = true limit 1
$$;

create or replace function public.user_belongs_to_office(_office_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.usuarios
    where id = auth.uid() and escritorio_id = _office_id and ativo = true
  )
$$;

create or replace function public.can_access_empresa(_empresa_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.empresas e
    join public.usuarios u on u.id = auth.uid() and u.ativo = true
    where e.id = _empresa_id
      and e.escritorio_id = u.escritorio_id
      and (
        public.has_role(auth.uid(), 'administrador')
        or public.has_role(auth.uid(), 'gestor')
        or (public.has_role(auth.uid(), 'operador') and e.responsavel_id = auth.uid())
        or (public.has_role(auth.uid(), 'cliente') and exists (
          select 1 from public.empresa_usuarios eu
          where eu.empresa_id = e.id and eu.usuario_id = auth.uid()
        ))
      )
  )
$$;

create or replace function public.set_documento_status()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.data_vencimento < current_date then
    new.status := 'vencido';
  elsif new.data_vencimento <= current_date + 30 then
    new.status := 'vencendo';
  else
    new.status := 'valido';
  end if;
  return new;
end;
$$;

create or replace function public.set_obrigacao_status()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status <> 'entregue' and new.data_limite < current_date then
    new.status := 'atrasada';
  end if;
  return new;
end;
$$;

create or replace function public.recalcular_risco_empresa(_empresa_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  score integer := 0;
begin
  select coalesce(sum(
    case
      when status = 'vencido' and tipo_documento ilike '%certificado%' then 30
      when status = 'vencido' then 20
      when status = 'vencendo' then 10
      else 0
    end
  ), 0) into score
  from public.documentos where empresa_id = _empresa_id;

  score := score + coalesce((select count(*) * 25 from public.obrigacoes where empresa_id = _empresa_id and status = 'atrasada'), 0);
  score := score + coalesce((select count(*) * 15 from public.tarefas where empresa_id = _empresa_id and status <> 'concluido' and data_limite < current_date), 0);
  score := least(score, 100);

  update public.empresas set risco_score = score where id = _empresa_id;
  return score;
end;
$$;

create or replace function public.recalcular_risco_trigger()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  perform public.recalcular_risco_empresa(coalesce(new.empresa_id, old.empresa_id));
  return coalesce(new, old);
end;
$$;

create trigger trg_documentos_status
before insert or update of data_vencimento on public.documentos
for each row execute function public.set_documento_status();

create trigger trg_obrigacoes_status
before insert or update of data_limite, status on public.obrigacoes
for each row execute function public.set_obrigacao_status();

create trigger trg_documentos_risco
after insert or update or delete on public.documentos
for each row execute function public.recalcular_risco_trigger();

create trigger trg_obrigacoes_risco
after insert or update or delete on public.obrigacoes
for each row execute function public.recalcular_risco_trigger();

create trigger trg_tarefas_risco
after insert or update or delete on public.tarefas
for each row execute function public.recalcular_risco_trigger();

alter table public.escritorios enable row level security;
alter table public.usuarios enable row level security;
alter table public.user_roles enable row level security;
alter table public.empresas enable row level security;
alter table public.empresa_usuarios enable row level security;
alter table public.documentos enable row level security;
alter table public.obrigacoes enable row level security;
alter table public.tarefas enable row level security;
alter table public.tarefa_comentarios enable row level security;
alter table public.alertas enable row level security;
alter table public.emails_alerta enable row level security;
alter table public.historico_acoes enable row level security;
alter table public.configuracoes_alerta enable row level security;

create policy "Usuários veem seu escritório" on public.escritorios for select to authenticated using (id = public.current_user_escritorio_id());
create policy "Administradores atualizam escritório" on public.escritorios for update to authenticated using (id = public.current_user_escritorio_id() and public.has_role(auth.uid(), 'administrador'));
create policy "Usuários criam escritório no cadastro" on public.escritorios for insert to authenticated with check (true);

create policy "Usuários veem equipe do escritório" on public.usuarios for select to authenticated using (escritorio_id = public.current_user_escritorio_id());
create policy "Usuários criam próprio cadastro" on public.usuarios for insert to authenticated with check (id = auth.uid());
create policy "Administradores gerenciam usuários" on public.usuarios for update to authenticated using (escritorio_id = public.current_user_escritorio_id() and public.has_role(auth.uid(), 'administrador'));

create policy "Usuários veem permissões do escritório" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(), 'administrador'));
create policy "Administradores gerenciam permissões" on public.user_roles for all to authenticated using (public.has_role(auth.uid(), 'administrador')) with check (public.has_role(auth.uid(), 'administrador'));
create policy "Usuários recebem papel inicial" on public.user_roles for insert to authenticated with check (user_id = auth.uid());

create policy "Acesso a empresas por perfil" on public.empresas for select to authenticated using (public.can_access_empresa(id));
create policy "Administradores e gestores criam empresas" on public.empresas for insert to authenticated with check (escritorio_id = public.current_user_escritorio_id() and (public.has_role(auth.uid(), 'administrador') or public.has_role(auth.uid(), 'gestor')));
create policy "Administradores gestores e operadores atualizam empresas" on public.empresas for update to authenticated using (public.can_access_empresa(id) and not public.has_role(auth.uid(), 'cliente'));
create policy "Administradores excluem empresas" on public.empresas for delete to authenticated using (escritorio_id = public.current_user_escritorio_id() and public.has_role(auth.uid(), 'administrador'));

create policy "Vínculos de empresa do escritório" on public.empresa_usuarios for select to authenticated using (public.can_access_empresa(empresa_id));
create policy "Administradores gerenciam vínculos" on public.empresa_usuarios for all to authenticated using (public.has_role(auth.uid(), 'administrador')) with check (public.has_role(auth.uid(), 'administrador'));

create policy "Documentos acessíveis por empresa" on public.documentos for select to authenticated using (public.can_access_empresa(empresa_id));
create policy "Equipe gerencia documentos" on public.documentos for all to authenticated using (escritorio_id = public.current_user_escritorio_id() and not public.has_role(auth.uid(), 'cliente')) with check (escritorio_id = public.current_user_escritorio_id() and not public.has_role(auth.uid(), 'cliente'));
create policy "Clientes enviam documentos próprios" on public.documentos for insert to authenticated with check (public.can_access_empresa(empresa_id));

create policy "Obrigações acessíveis por empresa" on public.obrigacoes for select to authenticated using (public.can_access_empresa(empresa_id));
create policy "Equipe gerencia obrigações" on public.obrigacoes for all to authenticated using (escritorio_id = public.current_user_escritorio_id() and not public.has_role(auth.uid(), 'cliente')) with check (escritorio_id = public.current_user_escritorio_id() and not public.has_role(auth.uid(), 'cliente'));

create policy "Tarefas acessíveis por empresa" on public.tarefas for select to authenticated using (empresa_id is null or public.can_access_empresa(empresa_id));
create policy "Equipe gerencia tarefas" on public.tarefas for all to authenticated using (escritorio_id = public.current_user_escritorio_id() and not public.has_role(auth.uid(), 'cliente')) with check (escritorio_id = public.current_user_escritorio_id() and not public.has_role(auth.uid(), 'cliente'));

create policy "Comentários de tarefas acessíveis" on public.tarefa_comentarios for select to authenticated using (exists (select 1 from public.tarefas t where t.id = tarefa_id and (t.empresa_id is null or public.can_access_empresa(t.empresa_id))));
create policy "Equipe comenta tarefas" on public.tarefa_comentarios for insert to authenticated with check (usuario_id = auth.uid());

create policy "Alertas do escritório" on public.alertas for select to authenticated using (escritorio_id = public.current_user_escritorio_id());
create policy "Equipe gerencia alertas" on public.alertas for all to authenticated using (escritorio_id = public.current_user_escritorio_id() and not public.has_role(auth.uid(), 'cliente')) with check (escritorio_id = public.current_user_escritorio_id() and not public.has_role(auth.uid(), 'cliente'));

create policy "E-mails de alerta acessíveis por empresa" on public.emails_alerta for select to authenticated using (public.can_access_empresa(empresa_id));
create policy "Equipe gerencia e-mails de alerta" on public.emails_alerta for all to authenticated using (exists (select 1 from public.empresas e where e.id = empresa_id and e.escritorio_id = public.current_user_escritorio_id() and not public.has_role(auth.uid(), 'cliente'))) with check (exists (select 1 from public.empresas e where e.id = empresa_id and e.escritorio_id = public.current_user_escritorio_id() and not public.has_role(auth.uid(), 'cliente')));

create policy "Histórico do escritório" on public.historico_acoes for select to authenticated using (escritorio_id = public.current_user_escritorio_id());
create policy "Equipe registra histórico" on public.historico_acoes for insert to authenticated with check (escritorio_id = public.current_user_escritorio_id());

create policy "Configurações por administradores" on public.configuracoes_alerta for select to authenticated using (escritorio_id = public.current_user_escritorio_id() and (public.has_role(auth.uid(), 'administrador') or public.has_role(auth.uid(), 'gestor')));
create policy "Administradores alteram configurações" on public.configuracoes_alerta for all to authenticated using (escritorio_id = public.current_user_escritorio_id() and public.has_role(auth.uid(), 'administrador')) with check (escritorio_id = public.current_user_escritorio_id() and public.has_role(auth.uid(), 'administrador'));

insert into storage.buckets (id, name, public) values ('documentos-fiscais', 'documentos-fiscais', false)
on conflict (id) do nothing;

create policy "Arquivos do escritório visíveis" on storage.objects for select to authenticated using (bucket_id = 'documentos-fiscais' and public.user_belongs_to_office((storage.foldername(name))[1]::uuid));
create policy "Equipe envia arquivos" on storage.objects for insert to authenticated with check (bucket_id = 'documentos-fiscais' and public.user_belongs_to_office((storage.foldername(name))[1]::uuid));
create policy "Equipe atualiza arquivos" on storage.objects for update to authenticated using (bucket_id = 'documentos-fiscais' and public.user_belongs_to_office((storage.foldername(name))[1]::uuid));
create policy "Administradores removem arquivos" on storage.objects for delete to authenticated using (bucket_id = 'documentos-fiscais' and public.user_belongs_to_office((storage.foldername(name))[1]::uuid) and public.has_role(auth.uid(), 'administrador'));
