CREATE TABLE IF NOT EXISTS public.rotinas_fiscais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escritorio_id uuid NOT NULL,
  empresa_id uuid NOT NULL,
  competencia text NOT NULL,
  responsavel_id uuid,
  status text NOT NULL DEFAULT 'pendente',
  data_inicio date DEFAULT current_date,
  data_limite date NOT NULL,
  data_conclusao timestamp with time zone,
  observacoes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT rotinas_fiscais_status_check CHECK (status IN ('pendente','em_andamento','aguardando_cliente','concluida','atrasada')),
  CONSTRAINT rotinas_fiscais_empresa_competencia_unique UNIQUE (empresa_id, competencia)
);

CREATE TABLE IF NOT EXISTS public.rotina_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rotina_id uuid NOT NULL REFERENCES public.rotinas_fiscais(id) ON DELETE CASCADE,
  categoria text NOT NULL,
  descricao text NOT NULL,
  status text NOT NULL DEFAULT 'pendente',
  responsavel_id uuid,
  data_limite date,
  concluido_em timestamp with time zone,
  observacoes text,
  arquivo_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT rotina_itens_status_check CHECK (status IN ('pendente','em_andamento','aguardando_cliente','concluido','atrasado','nao_se_aplica'))
);

CREATE TABLE IF NOT EXISTS public.calendario_fiscal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escritorio_id uuid NOT NULL,
  nome_obrigacao text NOT NULL,
  tipo text NOT NULL,
  competencia text NOT NULL,
  regime_tributario text,
  uf text,
  municipio text,
  data_vencimento date NOT NULL,
  fonte text,
  atualizado_em timestamp with time zone NOT NULL DEFAULT now(),
  editado_manualmente boolean NOT NULL DEFAULT false,
  observacoes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.relatorios_gerados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escritorio_id uuid NOT NULL,
  usuario_id uuid,
  tipo_relatorio text NOT NULL,
  filtros jsonb NOT NULL DEFAULT '{}'::jsonb,
  arquivo_url text,
  periodo_inicial date,
  periodo_final date,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.obrigacoes
  ADD COLUMN IF NOT EXISTS rotina_id uuid REFERENCES public.rotinas_fiscais(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS calendario_fiscal_id uuid REFERENCES public.calendario_fiscal(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS data_entrega timestamp with time zone,
  ADD COLUMN IF NOT EXISTS nao_se_aplica boolean NOT NULL DEFAULT false;

ALTER TABLE public.emails_alerta
  ADD COLUMN IF NOT EXISTS rotulo text NOT NULL DEFAULT 'principal';

ALTER TABLE public.alertas
  ADD COLUMN IF NOT EXISTS resolvido boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS resolvido_em timestamp with time zone,
  ADD COLUMN IF NOT EXISTS enviado_em timestamp with time zone,
  ADD COLUMN IF NOT EXISTS destinatarios text[] NOT NULL DEFAULT '{}'::text[];

ALTER TABLE public.configuracoes_alerta
  ADD COLUMN IF NOT EXISTS alerta_30_dias boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS alerta_15_dias boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS alerta_7_dias boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS alerta_no_vencimento boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS alerta_pos_vencido boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS assunto_padrao text NOT NULL DEFAULT 'Aviso de vencimento - {{tipo}} - {{razao_social}}',
  ADD COLUMN IF NOT EXISTS corpo_padrao text NOT NULL DEFAULT 'Olá,

Identificamos uma pendência próxima do vencimento:

Empresa: {{razao_social}}
CNPJ: {{cnpj}}
Tipo: {{tipo}}
Data de vencimento: {{data_vencimento}}
Situação: {{situacao}}

Solicitamos a regularização ou envio do novo documento.

Acesse o PrazoContábil para mais detalhes:
{{link_sistema}}

Atenciosamente,
{{nome_escritorio}}',
  ADD COLUMN IF NOT EXISTS assinatura_escritorio text NOT NULL DEFAULT 'Equipe PrazoContábil';

CREATE INDEX IF NOT EXISTS idx_rotinas_fiscais_escritorio ON public.rotinas_fiscais(escritorio_id);
CREATE INDEX IF NOT EXISTS idx_rotinas_fiscais_empresa ON public.rotinas_fiscais(empresa_id);
CREATE INDEX IF NOT EXISTS idx_rotinas_fiscais_competencia ON public.rotinas_fiscais(competencia);
CREATE INDEX IF NOT EXISTS idx_rotina_itens_rotina ON public.rotina_itens(rotina_id);
CREATE INDEX IF NOT EXISTS idx_calendario_fiscal_escritorio ON public.calendario_fiscal(escritorio_id);
CREATE INDEX IF NOT EXISTS idx_calendario_fiscal_vencimento ON public.calendario_fiscal(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_alertas_resolvido_data ON public.alertas(resolvido, data_alerta);

ALTER TABLE public.rotinas_fiscais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rotina_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendario_fiscal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relatorios_gerados ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Rotinas fiscais acessíveis por escritório" ON public.rotinas_fiscais;
CREATE POLICY "Rotinas fiscais acessíveis por escritório"
ON public.rotinas_fiscais
FOR SELECT
TO authenticated
USING (public.can_access_empresa(empresa_id));

DROP POLICY IF EXISTS "Equipe gerencia rotinas fiscais" ON public.rotinas_fiscais;
CREATE POLICY "Equipe gerencia rotinas fiscais"
ON public.rotinas_fiscais
FOR ALL
TO authenticated
USING ((escritorio_id = public.current_user_escritorio_id()) AND (NOT public.has_role(auth.uid(), 'cliente'::app_role)))
WITH CHECK ((escritorio_id = public.current_user_escritorio_id()) AND (NOT public.has_role(auth.uid(), 'cliente'::app_role)));

DROP POLICY IF EXISTS "Itens de rotina acessíveis" ON public.rotina_itens;
CREATE POLICY "Itens de rotina acessíveis"
ON public.rotina_itens
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.rotinas_fiscais rf
  WHERE rf.id = rotina_itens.rotina_id AND public.can_access_empresa(rf.empresa_id)
));

DROP POLICY IF EXISTS "Equipe gerencia itens de rotina" ON public.rotina_itens;
CREATE POLICY "Equipe gerencia itens de rotina"
ON public.rotina_itens
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.rotinas_fiscais rf
  WHERE rf.id = rotina_itens.rotina_id
    AND rf.escritorio_id = public.current_user_escritorio_id()
    AND (NOT public.has_role(auth.uid(), 'cliente'::app_role))
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.rotinas_fiscais rf
  WHERE rf.id = rotina_itens.rotina_id
    AND rf.escritorio_id = public.current_user_escritorio_id()
    AND (NOT public.has_role(auth.uid(), 'cliente'::app_role))
));

DROP POLICY IF EXISTS "Calendário fiscal do escritório" ON public.calendario_fiscal;
CREATE POLICY "Calendário fiscal do escritório"
ON public.calendario_fiscal
FOR SELECT
TO authenticated
USING (escritorio_id = public.current_user_escritorio_id());

DROP POLICY IF EXISTS "Administradores gerenciam calendário fiscal" ON public.calendario_fiscal;
CREATE POLICY "Administradores gerenciam calendário fiscal"
ON public.calendario_fiscal
FOR ALL
TO authenticated
USING ((escritorio_id = public.current_user_escritorio_id()) AND (public.has_role(auth.uid(), 'administrador'::app_role) OR public.has_role(auth.uid(), 'gestor'::app_role)))
WITH CHECK ((escritorio_id = public.current_user_escritorio_id()) AND (public.has_role(auth.uid(), 'administrador'::app_role) OR public.has_role(auth.uid(), 'gestor'::app_role)));

DROP POLICY IF EXISTS "Relatórios do escritório" ON public.relatorios_gerados;
CREATE POLICY "Relatórios do escritório"
ON public.relatorios_gerados
FOR SELECT
TO authenticated
USING (escritorio_id = public.current_user_escritorio_id());

DROP POLICY IF EXISTS "Equipe registra relatórios" ON public.relatorios_gerados;
CREATE POLICY "Equipe registra relatórios"
ON public.relatorios_gerados
FOR INSERT
TO authenticated
WITH CHECK ((escritorio_id = public.current_user_escritorio_id()) AND (NOT public.has_role(auth.uid(), 'cliente'::app_role)));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_rotinas_fiscais_updated_at ON public.rotinas_fiscais;
CREATE TRIGGER update_rotinas_fiscais_updated_at
BEFORE UPDATE ON public.rotinas_fiscais
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_rotina_itens_updated_at ON public.rotina_itens;
CREATE TRIGGER update_rotina_itens_updated_at
BEFORE UPDATE ON public.rotina_itens
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_calendario_fiscal_updated_at ON public.calendario_fiscal;
CREATE TRIGGER update_calendario_fiscal_updated_at
BEFORE UPDATE ON public.calendario_fiscal
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.set_rotina_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status <> 'concluida' AND NEW.data_limite < current_date THEN
    NEW.status := 'atrasada';
  END IF;
  IF NEW.status = 'concluida' AND NEW.data_conclusao IS NULL THEN
    NEW.data_conclusao := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_rotina_status_before_write ON public.rotinas_fiscais;
CREATE TRIGGER set_rotina_status_before_write
BEFORE INSERT OR UPDATE ON public.rotinas_fiscais
FOR EACH ROW EXECUTE FUNCTION public.set_rotina_status();

DROP TRIGGER IF EXISTS set_documento_status_before_write ON public.documentos;
CREATE TRIGGER set_documento_status_before_write
BEFORE INSERT OR UPDATE ON public.documentos
FOR EACH ROW EXECUTE FUNCTION public.set_documento_status();

DROP TRIGGER IF EXISTS set_obrigacao_status_before_write ON public.obrigacoes;
CREATE TRIGGER set_obrigacao_status_before_write
BEFORE INSERT OR UPDATE ON public.obrigacoes
FOR EACH ROW EXECUTE FUNCTION public.set_obrigacao_status();

DROP TRIGGER IF EXISTS recalcular_risco_documentos_after_write ON public.documentos;
CREATE TRIGGER recalcular_risco_documentos_after_write
AFTER INSERT OR UPDATE OR DELETE ON public.documentos
FOR EACH ROW EXECUTE FUNCTION public.recalcular_risco_trigger();

DROP TRIGGER IF EXISTS recalcular_risco_obrigacoes_after_write ON public.obrigacoes;
CREATE TRIGGER recalcular_risco_obrigacoes_after_write
AFTER INSERT OR UPDATE OR DELETE ON public.obrigacoes
FOR EACH ROW EXECUTE FUNCTION public.recalcular_risco_trigger();

DROP TRIGGER IF EXISTS recalcular_risco_tarefas_after_write ON public.tarefas;
CREATE TRIGGER recalcular_risco_tarefas_after_write
AFTER INSERT OR UPDATE OR DELETE ON public.tarefas
FOR EACH ROW EXECUTE FUNCTION public.recalcular_risco_trigger();

CREATE OR REPLACE FUNCTION public.gerar_alertas_documentos()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  inserted_count integer := 0;
BEGIN
  INSERT INTO public.alertas (data_alerta, mensagem, tipo_alerta, documento_id, empresa_id, escritorio_id, destinatarios)
  SELECT
    current_date,
    'Documento ' || d.tipo_documento || ' da empresa ' || e.razao_social || ' vence em ' || to_char(d.data_vencimento, 'DD/MM/YYYY') || '.',
    'documento',
    d.id,
    d.empresa_id,
    d.escritorio_id,
    coalesce(array_agg(ea.email) FILTER (WHERE ea.email IS NOT NULL), '{}'::text[])
  FROM public.documentos d
  JOIN public.empresas e ON e.id = d.empresa_id
  LEFT JOIN public.emails_alerta ea ON ea.empresa_id = e.id
  WHERE d.status IN ('vencendo','vencido')
    AND NOT EXISTS (
      SELECT 1 FROM public.alertas a
      WHERE a.documento_id = d.id
        AND a.tipo_alerta = 'documento'
        AND a.data_alerta = current_date
    )
  GROUP BY d.id, e.razao_social;

  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RETURN inserted_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.criar_itens_padrao_rotina(_rotina_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  inserted_count integer := 0;
BEGIN
  INSERT INTO public.rotina_itens (rotina_id, categoria, descricao, status)
  SELECT _rotina_id, categoria, descricao, 'pendente'
  FROM (VALUES
    ('Movimento fiscal','Teve saídas?'),
    ('Movimento fiscal','Teve entradas?'),
    ('Movimento fiscal','Teve serviços tomados?'),
    ('Movimento fiscal','Teve serviços prestados?'),
    ('Movimento fiscal','Teve retenções?'),
    ('Movimento fiscal','Teve notas canceladas?'),
    ('Movimento fiscal','Teve devoluções?'),
    ('Movimento fiscal','Teve importação/exportação?'),
    ('Movimento fiscal','Teve ausência de movimento?'),
    ('Conferências','Conferir notas fiscais de entrada'),
    ('Conferências','Conferir notas fiscais de saída'),
    ('Conferências','Conferir serviços tomados'),
    ('Conferências','Conferir serviços prestados'),
    ('Conferências','Conferir CFOP'),
    ('Conferências','Conferir CST/CSOSN'),
    ('Conferências','Conferir NCM'),
    ('Conferências','Conferir alíquotas'),
    ('Conferências','Conferir retenções'),
    ('Conferências','Conferir notas sem escrituração'),
    ('Conferências','Conferir divergências entre XML e lançamento'),
    ('Guias e impostos','Guia de ICMS'),
    ('Guias e impostos','Guia de ICMS-ST'),
    ('Guias e impostos','Guia DIFAL'),
    ('Guias e impostos','Guia de ISS'),
    ('Guias e impostos','Guia de PIS'),
    ('Guias e impostos','Guia de COFINS'),
    ('Guias e impostos','Guia de IRRF'),
    ('Guias e impostos','Guia de CSLL'),
    ('Guias e impostos','Guia de INSS/Retenção'),
    ('Guias e impostos','Guia de DCTFWeb'),
    ('Guias e impostos','Guia de MIT'),
    ('Guias e impostos','Guia de Reinf, quando aplicável'),
    ('Obrigações acessórias','Elaboração e entrega do SPED ICMS/IPI'),
    ('Obrigações acessórias','Elaboração e entrega da EFD-Contribuições'),
    ('Obrigações acessórias','Elaboração e entrega da EFD-Reinf'),
    ('Obrigações acessórias','Elaboração e entrega da DCTFWeb'),
    ('Obrigações acessórias','Elaboração e entrega da MIT'),
    ('Obrigações acessórias','Conferência do eSocial'),
    ('Obrigações acessórias','Conferência de eventos da Reinf'),
    ('Obrigações acessórias','Conferência de débitos confessados'),
    ('Obrigações acessórias','Geração de comprovantes de entrega'),
    ('Pós-entrega','Salvar protocolo'),
    ('Pós-entrega','Anexar comprovante'),
    ('Pós-entrega','Marcar obrigação como entregue'),
    ('Pós-entrega','Registrar data de entrega'),
    ('Pós-entrega','Registrar responsável'),
    ('Pós-entrega','Registrar observações'),
    ('Pós-entrega','Atualizar situação da empresa')
  ) AS itens(categoria, descricao)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.rotina_itens ri
    WHERE ri.rotina_id = _rotina_id AND ri.descricao = itens.descricao
  );

  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RETURN inserted_count;
END;
$$;