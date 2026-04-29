ALTER TABLE public.empresas
ADD COLUMN IF NOT EXISTS natureza_juridica TEXT,
ADD COLUMN IF NOT EXISTS setor TEXT,
ADD COLUMN IF NOT EXISTS endereco TEXT,
ADD COLUMN IF NOT EXISTS cep TEXT,
ADD COLUMN IF NOT EXISTS responsavel_interno TEXT,
ADD COLUMN IF NOT EXISTS observacao_geral TEXT;

CREATE INDEX IF NOT EXISTS idx_empresas_natureza_juridica ON public.empresas (natureza_juridica);
CREATE INDEX IF NOT EXISTS idx_empresas_setor ON public.empresas (setor);
CREATE INDEX IF NOT EXISTS idx_empresas_uf_municipio ON public.empresas (uf, municipio);