// Edge Function: Consulta CNPJ via BrasilAPI (oficial, gratuita, sem chave)
// Documentação: https://brasilapi.com.br/docs#tag/CNPJ
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cnpj, empresa_id } = await req.json();
    const cnpjLimpo = String(cnpj || "").replace(/\D/g, "");

    if (cnpjLimpo.length !== 14) {
      return new Response(JSON.stringify({ status: "erro", mensagem: "CNPJ inválido. Informe 14 dígitos." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Identificar usuário/escritório a partir do JWT
    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(jwt);
    const userId = userData?.user?.id ?? null;
    let escritorioId: string | null = null;
    if (userId) {
      const { data: u } = await supabase.from("usuarios").select("escritorio_id").eq("id", userId).maybeSingle();
      escritorioId = (u as any)?.escritorio_id ?? null;
    }

    const url = `https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`;
    const inicio = Date.now();
    const resp = await fetch(url, { headers: { Accept: "application/json" } });
    const latencia = Date.now() - inicio;
    const body = await resp.json().catch(() => ({}));

    // Log técnico
    if (escritorioId) {
      await supabase.from("logs_integracao").insert({
        escritorio_id: escritorioId,
        empresa_id: empresa_id ?? null,
        tipo_integracao: "cnpj",
        endpoint: url,
        payload_resumido: `cnpj=${cnpjLimpo}`,
        resposta_resumida: `HTTP ${resp.status} em ${latencia}ms`,
        status: resp.ok ? "sucesso" : "erro",
        erro: resp.ok ? null : (body?.message ?? `HTTP ${resp.status}`),
      });
    }

    if (!resp.ok) {
      // registra consulta como erro
      if (escritorioId) {
        await supabase.from("consultas_fiscais").insert({
          escritorio_id: escritorioId,
          empresa_id: empresa_id ?? null,
          usuario_id: userId,
          tipo_consulta: "cnpj",
          origem: "brasilapi",
          cnpj: cnpjLimpo,
          status: "erro",
          mensagem: body?.message ?? `Não foi possível consultar o CNPJ (HTTP ${resp.status}).`,
          link_oficial: `https://solucoes.receita.fazenda.gov.br/Servicos/cnpjreva/Cnpjreva_Solicitacao.asp`,
          erro_tecnico: JSON.stringify(body).slice(0, 500),
        });
      }
      return new Response(
        JSON.stringify({ status: "erro", mensagem: body?.message ?? "Falha na consulta", http: resp.status }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Mapeamento BrasilAPI -> formato PrazoContábil
    const mapeado = {
      cnpj: body.cnpj,
      razao_social: body.razao_social,
      nome_fantasia: body.nome_fantasia || "",
      situacao_cadastral: body.descricao_situacao_cadastral,
      data_abertura: body.data_inicio_atividade,
      cnae_principal: body.cnae_fiscal ? `${body.cnae_fiscal} - ${body.cnae_fiscal_descricao ?? ""}` : "",
      cnaes_secundarios: (body.cnaes_secundarios ?? []).map((c: any) => `${c.codigo} - ${c.descricao}`),
      natureza_juridica: body.natureza_juridica,
      porte: body.porte,
      endereco: [body.descricao_tipo_de_logradouro, body.logradouro, body.numero, body.complemento]
        .filter(Boolean)
        .join(" "),
      bairro: body.bairro,
      municipio: body.municipio,
      uf: body.uf,
      cep: body.cep,
      email: body.email,
      telefone: body.ddd_telefone_1,
      qsa: body.qsa ?? [],
    };

    if (escritorioId) {
      await supabase.from("consultas_fiscais").insert({
        escritorio_id: escritorioId,
        empresa_id: empresa_id ?? null,
        usuario_id: userId,
        tipo_consulta: "cnpj",
        origem: "brasilapi",
        cnpj: cnpjLimpo,
        status: "regular",
        mensagem: `Dados cadastrais obtidos: ${mapeado.razao_social}`,
        link_oficial: `https://solucoes.receita.fazenda.gov.br/Servicos/cnpjreva/Cnpjreva_Solicitacao.asp`,
        dados_retorno: mapeado,
      });
    }

    return new Response(
      JSON.stringify({ status: "sucesso", dados: mapeado }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("consultar-cnpj erro:", err);
    return new Response(
      JSON.stringify({ status: "erro", mensagem: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
