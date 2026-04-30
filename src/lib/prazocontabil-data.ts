import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;

export type SituacaoDocumento = "Válido" | "Vencendo" | "Vencido" | "Sem arquivo" | "Aguardando cliente";
export type SituacaoRotina = "Pendente" | "Em andamento" | "Aguardando cliente" | "Concluída" | "Atrasada";

export type EmpresaReal = {
  id: string;
  escritorioId: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  regimeTributario: string;
  naturezaJuridica: string;
  setor: string;
  uf: string;
  municipio: string;
  emailCliente: string;
  telefone: string;
  responsavelId: string | null;
  responsavelInterno: string;
  situacao: string;
  risco: number;
  observacaoGeral: string;
};

export type DocumentoReal = {
  id: string;
  empresaId: string;
  escritorioId: string;
  tipo: string;
  numero: string;
  emissao: string | null;
  vencimento: string;
  arquivoUrl: string | null;
  situacao: string;
  observacoes: string;
};

export type ObrigacaoReal = {
  id: string;
  empresaId: string;
  escritorioId: string;
  rotinaId: string | null;
  calendarioFiscalId: string | null;
  tipo: string;
  competencia: string;
  vencimento: string;
  situacao: string;
  responsavelId: string | null;
  protocolo: string;
  comprovanteUrl: string | null;
  observacoes: string;
  dataEntrega: string | null;
  naoSeAplica: boolean;
};

export type RotinaFiscalReal = {
  id: string;
  escritorioId: string;
  empresaId: string;
  competencia: string;
  responsavelId: string | null;
  situacao: string;
  dataInicio: string | null;
  dataLimite: string;
  dataConclusao: string | null;
  observacoes: string;
};

export type RotinaItemReal = {
  id: string;
  rotinaId: string;
  categoria: string;
  descricao: string;
  situacao: string;
  responsavelId: string | null;
  dataLimite: string | null;
  concluidoEm: string | null;
  observacoes: string;
  arquivoUrl: string | null;
};

export type CalendarioFiscalReal = {
  id: string;
  escritorioId: string;
  nomeObrigacao: string;
  tipo: string;
  competencia: string;
  regimeTributario: string;
  uf: string;
  municipio: string;
  dataVencimento: string;
  fonte: string;
  atualizadoEm: string;
  editadoManualmente: boolean;
  observacoes: string;
};

export type AlertaReal = {
  id: string;
  escritorioId: string;
  empresaId: string | null;
  documentoId: string | null;
  obrigacaoId: string | null;
  dataAlerta: string;
  tipo: string;
  mensagem: string;
  enviado: boolean;
  resolvido: boolean;
  destinatarios: string[];
};

export type EmailAlertaReal = {
  id: string;
  empresaId: string;
  email: string;
  principal: boolean;
  rotulo: string;
};

export type UsuarioReal = {
  id: string;
  nome: string;
  email: string;
};

export type ConfiguracaoAlertaReal = {
  id: string;
  escritorioId: string;
  diasAntes: number[];
  repetirVencidoDias: number;
  alerta30Dias: boolean;
  alerta15Dias: boolean;
  alerta7Dias: boolean;
  alertaNoVencimento: boolean;
  alertaPosVencido: boolean;
  assuntoPadrao: string;
  corpoPadrao: string;
  assinaturaEscritorio: string;
};

export type WorkspaceData = {
  empresas: EmpresaReal[];
  documentos: DocumentoReal[];
  obrigacoes: ObrigacaoReal[];
  rotinas: RotinaFiscalReal[];
  rotinaItens: RotinaItemReal[];
  calendario: CalendarioFiscalReal[];
  alertas: AlertaReal[];
  emails: EmailAlertaReal[];
  usuarios: UsuarioReal[];
  configuracao: ConfiguracaoAlertaReal | null;
};

export const tiposDocumentos = [
  "CND Federal",
  "CND Estadual",
  "CND Municipal",
  "Certidão FGTS",
  "Certidão Trabalhista",
  "Alvará Municipal",
  "Alvará de Bombeiros",
  "Certificado Digital",
  "Contratos",
  "Outros documentos",
];

export const tiposObrigacoes = [
  "DCTFWeb",
  "MIT",
  "EFD-Reinf",
  "eSocial",
  "SPED Fiscal ICMS/IPI",
  "EFD-Contribuições",
  "ECD",
  "ECF",
  "PGDAS-D",
  "DEFIS",
  "ISS municipal",
  "Guia de ICMS",
  "Guia de ISS",
  "Guia de PIS/COFINS",
  "Outras obrigações",
];

export const checklistRotina = [
  ["Movimento fiscal", "Teve saídas?"],
  ["Movimento fiscal", "Teve entradas?"],
  ["Movimento fiscal", "Teve serviços tomados?"],
  ["Movimento fiscal", "Teve serviços prestados?"],
  ["Movimento fiscal", "Teve retenções?"],
  ["Conferências", "Conferir notas fiscais de entrada"],
  ["Conferências", "Conferir notas fiscais de saída"],
  ["Conferências", "Conferir serviços tomados"],
  ["Conferências", "Conferir serviços prestados"],
  ["Guias e impostos", "Guia de ICMS"],
  ["Guias e impostos", "Guia de ISS"],
  ["Guias e impostos", "Guia de PIS/COFINS"],
  ["Guias e impostos", "Guia DCTFWeb"],
  ["Guias e impostos", "Guia MIT"],
  ["Obrigações acessórias", "EFD-Reinf"],
  ["Obrigações acessórias", "SPED ICMS/IPI"],
  ["Obrigações acessórias", "EFD-Contribuições"],
  ["Obrigações acessórias", "Conferência de eSocial"],
  ["Pós-entrega", "Anexar comprovantes"],
  ["Pós-entrega", "Salvar protocolos"],
  ["Pós-entrega", "Marcar rotina como concluída"],
] as const;

export const modeloEmailPadrao = {
  assunto: "Aviso de vencimento - {{tipo}} - {{razao_social}}",
  corpo: `Olá,

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
{{nome_escritorio}}`,
};

export function formatDate(value?: string | null) {
  if (!value) return "—";
  const [year, month, day] = value.slice(0, 10).split("-");
  return day && month && year ? `${day}/${month}/${year}` : value;
}

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function documentoSituacao(doc: Pick<DocumentoReal, "vencimento" | "arquivoUrl" | "situacao">): SituacaoDocumento {
  if (!doc.arquivoUrl) return "Sem arquivo";
  if (doc.situacao === "aguardando_cliente") return "Aguardando cliente";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${doc.vencimento}T00:00:00`);
  const days = Math.ceil((due.getTime() - today.getTime()) / 86400000);
  if (days < 0) return "Vencido";
  if (days <= 30) return "Vencendo";
  return "Válido";
}

export function labelSituacao(value?: string | null) {
  const map: Record<string, string> = {
    ativa: "Ativa",
    inativa: "Inativa",
    suspensa: "Suspensa",
    valido: "Válido",
    vencendo: "Vencendo",
    vencido: "Vencido",
    pendente: "Pendente",
    em_andamento: "Em andamento",
    aguardando_cliente: "Aguardando cliente",
    concluida: "Concluída",
    concluido: "Concluído",
    atrasada: "Atrasada",
    atrasado: "Atrasado",
    entregue: "Entregue",
    nao_se_aplica: "Não se aplica",
  };
  return value ? (map[value] ?? value) : "—";
}

export async function fetchWorkspaceData(): Promise<WorkspaceData> {
  const [empresas, documentos, obrigacoes, rotinas, rotinaItens, calendario, alertas, emails, usuarios, configs] = await Promise.all([
    db.from("empresas").select("*").order("razao_social"),
    db.from("documentos").select("*").order("data_vencimento", { ascending: true }),
    db.from("obrigacoes").select("*").order("data_limite", { ascending: true }),
    db.from("rotinas_fiscais").select("*").order("data_limite", { ascending: true }),
    db.from("rotina_itens").select("*").order("categoria", { ascending: true }),
    db.from("calendario_fiscal").select("*").order("data_vencimento", { ascending: true }),
    db.from("alertas").select("*").order("data_alerta", { ascending: false }),
    db.from("emails_alerta").select("*").order("principal", { ascending: false }),
    db.from("usuarios").select("id,nome,email").order("nome"),
    db.from("configuracoes_alerta").select("*").limit(1),
  ]);

  const error = [empresas, documentos, obrigacoes, rotinas, rotinaItens, calendario, alertas, emails, usuarios, configs].find((result) => result.error)?.error;
  if (error) throw error;

  return {
    empresas: (empresas.data ?? []).map((item: any) => ({
      id: item.id,
      escritorioId: item.escritorio_id,
      razaoSocial: item.razao_social,
      nomeFantasia: item.nome_fantasia ?? "",
      cnpj: item.cnpj,
      regimeTributario: item.regime_tributario,
      naturezaJuridica: item.natureza_juridica ?? "Não informado",
      setor: item.setor ?? "Não informado",
      uf: item.uf,
      municipio: item.municipio,
      emailCliente: item.email_cliente ?? "",
      telefone: item.telefone ?? "",
      responsavelId: item.responsavel_id,
      responsavelInterno: item.responsavel_interno ?? "Equipe Fiscal",
      situacao: item.status,
      risco: item.risco_score ?? 0,
      observacaoGeral: item.observacao_geral ?? "",
    })),
    documentos: (documentos.data ?? []).map((item: any) => ({
      id: item.id,
      empresaId: item.empresa_id,
      escritorioId: item.escritorio_id,
      tipo: item.tipo_documento,
      numero: item.numero_documento ?? "",
      emissao: item.data_emissao,
      vencimento: item.data_vencimento,
      arquivoUrl: item.arquivo_url,
      situacao: item.status,
      observacoes: item.observacoes ?? "",
    })),
    obrigacoes: (obrigacoes.data ?? []).map((item: any) => ({
      id: item.id,
      empresaId: item.empresa_id,
      escritorioId: item.escritorio_id,
      rotinaId: item.rotina_id ?? null,
      calendarioFiscalId: item.calendario_fiscal_id ?? null,
      tipo: item.tipo_obrigacao,
      competencia: item.competencia,
      vencimento: item.data_limite,
      situacao: item.nao_se_aplica ? "nao_se_aplica" : item.status,
      responsavelId: item.responsavel_id,
      protocolo: item.protocolo ?? "",
      comprovanteUrl: item.arquivo_comprovante_url ?? null,
      observacoes: item.observacoes ?? "",
      dataEntrega: item.data_entrega ?? null,
      naoSeAplica: item.nao_se_aplica ?? false,
    })),
    rotinas: (rotinas.data ?? []).map((item: any) => ({
      id: item.id,
      escritorioId: item.escritorio_id,
      empresaId: item.empresa_id,
      competencia: item.competencia,
      responsavelId: item.responsavel_id,
      situacao: item.status,
      dataInicio: item.data_inicio,
      dataLimite: item.data_limite,
      dataConclusao: item.data_conclusao,
      observacoes: item.observacoes ?? "",
    })),
    rotinaItens: (rotinaItens.data ?? []).map((item: any) => ({
      id: item.id,
      rotinaId: item.rotina_id,
      categoria: item.categoria,
      descricao: item.descricao,
      situacao: item.status,
      responsavelId: item.responsavel_id,
      dataLimite: item.data_limite,
      concluidoEm: item.concluido_em,
      observacoes: item.observacoes ?? "",
      arquivoUrl: item.arquivo_url,
    })),
    calendario: (calendario.data ?? []).map((item: any) => ({
      id: item.id,
      escritorioId: item.escritorio_id,
      nomeObrigacao: item.nome_obrigacao,
      tipo: item.tipo,
      competencia: item.competencia,
      regimeTributario: item.regime_tributario ?? "Todos",
      uf: item.uf ?? "Todos",
      municipio: item.municipio ?? "Todos",
      dataVencimento: item.data_vencimento,
      fonte: item.fonte ?? "Regra configurada",
      atualizadoEm: item.atualizado_em,
      editadoManualmente: item.editado_manualmente,
      observacoes: item.observacoes ?? "",
    })),
    alertas: (alertas.data ?? []).map((item: any) => ({
      id: item.id,
      escritorioId: item.escritorio_id,
      empresaId: item.empresa_id,
      documentoId: item.documento_id,
      obrigacaoId: item.obrigacao_id,
      dataAlerta: item.data_alerta,
      tipo: item.tipo_alerta,
      mensagem: item.mensagem,
      enviado: item.enviado,
      resolvido: item.resolvido ?? false,
      destinatarios: item.destinatarios ?? [],
    })),
    emails: (emails.data ?? []).map((item: any) => ({
      id: item.id,
      empresaId: item.empresa_id,
      email: item.email,
      principal: item.principal,
      rotulo: item.rotulo ?? "principal",
    })),
    usuarios: (usuarios.data ?? []) as UsuarioReal[],
    configuracao: configs.data?.[0]
      ? {
          id: (configs.data[0] as any).id,
          escritorioId: (configs.data[0] as any).escritorio_id,
          diasAntes: (configs.data[0] as any).dias_antes ?? [30, 15, 7, 0],
          repetirVencidoDias: (configs.data[0] as any).repetir_vencido_dias ?? 5,
          alerta30Dias: (configs.data[0] as any).alerta_30_dias ?? true,
          alerta15Dias: (configs.data[0] as any).alerta_15_dias ?? true,
          alerta7Dias: (configs.data[0] as any).alerta_7_dias ?? true,
          alertaNoVencimento: (configs.data[0] as any).alerta_no_vencimento ?? true,
          alertaPosVencido: (configs.data[0] as any).alerta_pos_vencido ?? true,
          assuntoPadrao: (configs.data[0] as any).assunto_padrao ?? modeloEmailPadrao.assunto,
          corpoPadrao: (configs.data[0] as any).corpo_padrao ?? modeloEmailPadrao.corpo,
          assinaturaEscritorio: (configs.data[0] as any).assinatura_escritorio ?? "Equipe PrazoContábil",
        }
      : null,
  };
}

export function emptyWorkspaceData(): WorkspaceData {
  return { empresas: [], documentos: [], obrigacoes: [], rotinas: [], rotinaItens: [], calendario: [], alertas: [], emails: [], usuarios: [], configuracao: null };
}
