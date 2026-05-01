-- =====================================================
-- MÓDULO CONSULTAS FISCAIS - PrazoContábil
-- =====================================================

-- 1) integracoes_fiscais
CREATE TABLE public.integracoes_fiscais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escritorio_id uuid NOT NULL,
  tipo_integracao text NOT NULL, -- cnpj, cnd_federal, cnd_estadual, cnd_municipal, fgts, trabalhista, e_cac
  nome text NOT NULL,
  descricao text,
  ativo boolean NOT NULL DEFAULT true,
  usa_api boolean NOT NULL DEFAULT false,
  usa_consulta_assistida boolean NOT NULL DEFAULT true,
  url_base text,
  uf text,
  municipio text,
  requer_certificado boolean NOT NULL DEFAULT false,
  requer_govbr boolean NOT NULL DEFAULT false,
  requer_procuracao boolean NOT NULL DEFAULT false,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_integracoes_escritorio ON public.integracoes_fiscais(escritorio_id);
CREATE INDEX idx_integracoes_tipo ON public.integracoes_fiscais(tipo_integracao);

-- 2) consultas_fiscais
CREATE TABLE public.consultas_fiscais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escritorio_id uuid NOT NULL,
  empresa_id uuid,
  usuario_id uuid,
  tipo_consulta text NOT NULL, -- cnpj, regularidade_federal, cnd_federal, cnd_estadual, cnd_municipal, fgts, trabalhista
  origem text, -- brasilapi, receita_federal, sefaz_sp, prefeitura_sp, manual, etc
  cnpj text,
  status text NOT NULL DEFAULT 'em_andamento', -- regular, pendencia, certidao_emitida, consulta_assistida, indisponivel, aguardando_acesso, erro, em_andamento
  mensagem text,
  data_consulta timestamptz NOT NULL DEFAULT now(),
  link_oficial text,
  arquivo_pdf_url text,
  dados_retorno jsonb DEFAULT '{}'::jsonb,
  erro_tecnico text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_consultas_escritorio ON public.consultas_fiscais(escritorio_id);
CREATE INDEX idx_consultas_empresa ON public.consultas_fiscais(empresa_id);
CREATE INDEX idx_consultas_tipo ON public.consultas_fiscais(tipo_consulta);
CREATE INDEX idx_consultas_data ON public.consultas_fiscais(data_consulta DESC);

-- 3) pendencias_fiscais
CREATE TABLE public.pendencias_fiscais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escritorio_id uuid NOT NULL,
  empresa_id uuid NOT NULL,
  consulta_id uuid,
  origem text NOT NULL, -- receita_federal, pgfn, sefaz, prefeitura, fgts, trabalhista, interno
  tipo_pendencia text NOT NULL,
  descricao text NOT NULL,
  grau_risco text NOT NULL DEFAULT 'medio', -- baixo, medio, alto, critico
  status text NOT NULL DEFAULT 'aberta', -- aberta, em_analise, aguardando_cliente, regularizada, sem_acao
  prazo_regularizacao date,
  link_oficial text,
  arquivo_pdf_url text,
  responsavel_id uuid,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  regularizada_em timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_pendencias_escritorio ON public.pendencias_fiscais(escritorio_id);
CREATE INDEX idx_pendencias_empresa ON public.pendencias_fiscais(empresa_id);
CREATE INDEX idx_pendencias_status ON public.pendencias_fiscais(status);

-- 4) certidoes
CREATE TABLE public.certidoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escritorio_id uuid NOT NULL,
  empresa_id uuid NOT NULL,
  tipo_certidao text NOT NULL, -- cnd_federal, cpend, cpd, cnd_estadual, cnd_municipal, fgts, trabalhista
  esfera text NOT NULL, -- federal, estadual, municipal, fgts, trabalhista
  uf text,
  municipio text,
  numero_certidao text,
  codigo_validacao text,
  data_emissao date,
  data_validade date,
  status text NOT NULL DEFAULT 'valida', -- valida, vencendo, vencida, revogada, pendente
  arquivo_pdf_url text,
  origem_emissao text, -- automatica, manual, portal_oficial
  consulta_id uuid,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_certidoes_escritorio ON public.certidoes(escritorio_id);
CREATE INDEX idx_certidoes_empresa ON public.certidoes(empresa_id);
CREATE INDEX idx_certidoes_validade ON public.certidoes(data_validade);

-- 5) certificados_digitais (NUNCA armazena senha)
CREATE TABLE public.certificados_digitais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escritorio_id uuid NOT NULL,
  empresa_id uuid,
  tipo text NOT NULL DEFAULT 'A1', -- A1, A3
  titular text NOT NULL,
  cpf_cnpj text NOT NULL,
  validade date NOT NULL,
  status text NOT NULL DEFAULT 'ativo', -- ativo, vencido, revogado
  arquivo_url text, -- referência criptografada/segura, NUNCA texto aberto da senha
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_certificados_escritorio ON public.certificados_digitais(escritorio_id);
CREATE INDEX idx_certificados_empresa ON public.certificados_digitais(empresa_id);

-- 6) logs_integracao
CREATE TABLE public.logs_integracao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escritorio_id uuid NOT NULL,
  empresa_id uuid,
  tipo_integracao text NOT NULL,
  endpoint text,
  payload_resumido text,
  resposta_resumida text,
  status text NOT NULL, -- sucesso, erro, timeout
  erro text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_logs_escritorio ON public.logs_integracao(escritorio_id);
CREATE INDEX idx_logs_data ON public.logs_integracao(created_at DESC);

-- =====================================================
-- TRIGGERS de updated_at
-- =====================================================
CREATE TRIGGER trg_integracoes_updated BEFORE UPDATE ON public.integracoes_fiscais FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_pendencias_updated BEFORE UPDATE ON public.pendencias_fiscais FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_certidoes_updated BEFORE UPDATE ON public.certidoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_certificados_updated BEFORE UPDATE ON public.certificados_digitais FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- RLS
-- =====================================================
ALTER TABLE public.integracoes_fiscais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultas_fiscais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pendencias_fiscais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certidoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificados_digitais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_integracao ENABLE ROW LEVEL SECURITY;

-- integracoes_fiscais: equipe vê e gerencia
CREATE POLICY "Integrações do escritório" ON public.integracoes_fiscais
  FOR SELECT TO authenticated USING (escritorio_id = current_user_escritorio_id());
CREATE POLICY "Equipe gerencia integrações" ON public.integracoes_fiscais
  FOR ALL TO authenticated
  USING (escritorio_id = current_user_escritorio_id() AND (has_role(auth.uid(),'administrador') OR has_role(auth.uid(),'gestor')))
  WITH CHECK (escritorio_id = current_user_escritorio_id() AND (has_role(auth.uid(),'administrador') OR has_role(auth.uid(),'gestor')));

-- consultas_fiscais
CREATE POLICY "Consultas acessíveis por empresa" ON public.consultas_fiscais
  FOR SELECT TO authenticated
  USING (empresa_id IS NULL AND escritorio_id = current_user_escritorio_id() OR can_access_empresa(empresa_id));
CREATE POLICY "Equipe gerencia consultas" ON public.consultas_fiscais
  FOR ALL TO authenticated
  USING (escritorio_id = current_user_escritorio_id() AND NOT has_role(auth.uid(),'cliente'))
  WITH CHECK (escritorio_id = current_user_escritorio_id() AND NOT has_role(auth.uid(),'cliente'));

-- pendencias_fiscais
CREATE POLICY "Pendências acessíveis por empresa" ON public.pendencias_fiscais
  FOR SELECT TO authenticated USING (can_access_empresa(empresa_id));
CREATE POLICY "Equipe gerencia pendências" ON public.pendencias_fiscais
  FOR ALL TO authenticated
  USING (escritorio_id = current_user_escritorio_id() AND NOT has_role(auth.uid(),'cliente'))
  WITH CHECK (escritorio_id = current_user_escritorio_id() AND NOT has_role(auth.uid(),'cliente'));

-- certidoes
CREATE POLICY "Certidões acessíveis por empresa" ON public.certidoes
  FOR SELECT TO authenticated USING (can_access_empresa(empresa_id));
CREATE POLICY "Equipe gerencia certidões" ON public.certidoes
  FOR ALL TO authenticated
  USING (escritorio_id = current_user_escritorio_id() AND NOT has_role(auth.uid(),'cliente'))
  WITH CHECK (escritorio_id = current_user_escritorio_id() AND NOT has_role(auth.uid(),'cliente'));

-- certificados_digitais (somente equipe)
CREATE POLICY "Certificados do escritório" ON public.certificados_digitais
  FOR SELECT TO authenticated
  USING (escritorio_id = current_user_escritorio_id() AND (has_role(auth.uid(),'administrador') OR has_role(auth.uid(),'gestor')));
CREATE POLICY "Admins gerenciam certificados" ON public.certificados_digitais
  FOR ALL TO authenticated
  USING (escritorio_id = current_user_escritorio_id() AND has_role(auth.uid(),'administrador'))
  WITH CHECK (escritorio_id = current_user_escritorio_id() AND has_role(auth.uid(),'administrador'));

-- logs_integracao
CREATE POLICY "Logs do escritório" ON public.logs_integracao
  FOR SELECT TO authenticated
  USING (escritorio_id = current_user_escritorio_id() AND (has_role(auth.uid(),'administrador') OR has_role(auth.uid(),'gestor')));
CREATE POLICY "Equipe registra logs" ON public.logs_integracao
  FOR INSERT TO authenticated
  WITH CHECK (escritorio_id = current_user_escritorio_id());

-- =====================================================
-- STORAGE: bucket privado 'certidoes'
-- =====================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('certidoes', 'certidoes', false)
ON CONFLICT (id) DO NOTHING;

-- Caminho esperado: {escritorio_id}/{empresa_id}/{arquivo}.pdf
CREATE POLICY "Equipe lê certidões do escritório"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'certidoes'
  AND (storage.foldername(name))[1]::uuid = current_user_escritorio_id()
);

CREATE POLICY "Equipe envia certidões"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'certidoes'
  AND (storage.foldername(name))[1]::uuid = current_user_escritorio_id()
  AND NOT has_role(auth.uid(),'cliente')
);

CREATE POLICY "Equipe atualiza certidões"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'certidoes'
  AND (storage.foldername(name))[1]::uuid = current_user_escritorio_id()
);

CREATE POLICY "Admins removem certidões"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'certidoes'
  AND (storage.foldername(name))[1]::uuid = current_user_escritorio_id()
  AND has_role(auth.uid(),'administrador')
);