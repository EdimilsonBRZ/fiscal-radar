REVOKE ALL ON FUNCTION public.gerar_alertas_documentos() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.gerar_alertas_documentos() FROM anon;
REVOKE ALL ON FUNCTION public.gerar_alertas_documentos() FROM authenticated;

REVOKE ALL ON FUNCTION public.criar_itens_padrao_rotina(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.criar_itens_padrao_rotina(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.criar_itens_padrao_rotina(uuid) FROM authenticated;