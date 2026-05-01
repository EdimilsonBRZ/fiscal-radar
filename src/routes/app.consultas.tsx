import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ExternalLink, FileSearch, Loader2, ShieldCheck, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fetchWorkspaceData, formatDate, onlyDigits, type EmpresaReal } from "@/lib/prazocontabil-data";
import { PageState, StatusBadge } from "@/components/prazocontabil/ui";

export const Route = createFileRoute("/app/consultas")({
  component: ConsultasFiscaisPage,
});

const db = supabase as any;

const PORTAIS = {
  cnd_federal: "https://solucoes.receita.fazenda.gov.br/Servicos/certidaointernet/PJ/Emitir",
  fgts: "https://consulta-crf.caixa.gov.br/consultacrf/pages/consultaEmpregador.jsf",
  trabalhista: "https://www.tst.jus.br/certidao",
  receita_cnpj: "https://solucoes.receita.fazenda.gov.br/Servicos/cnpjreva/Cnpjreva_Solicitacao.asp",
};

type ConsultaRow = {
  id: string;
  empresa_id: string | null;
  cnpj: string | null;
  tipo_consulta: string;
  origem: string | null;
  status: string;
  mensagem: string | null;
  link_oficial: string | null;
  arquivo_pdf_url: string | null;
  data_consulta: string;
};

type PendenciaRow = {
  id: string;
  empresa_id: string;
  origem: string;
  tipo_pendencia: string;
  descricao: string;
  grau_risco: string;
  status: string;
  prazo_regularizacao: string | null;
  link_oficial: string | null;
  arquivo_pdf_url: string | null;
};

type CertidaoRow = {
  id: string;
  empresa_id: string;
  tipo_certidao: string;
  esfera: string;
  uf: string | null;
  municipio: string | null;
  numero_certidao: string | null;
  data_emissao: string | null;
  data_validade: string | null;
  status: string;
  arquivo_pdf_url: string | null;
};

function ConsultasFiscaisPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [empresas, setEmpresas] = useState<EmpresaReal[]>([]);
  const [consultas, setConsultas] = useState<ConsultaRow[]>([]);
  const [pendencias, setPendencias] = useState<PendenciaRow[]>([]);
  const [certidoes, setCertidoes] = useState<CertidaoRow[]>([]);

  async function recarregar() {
    try {
      setLoading(true);
      const [ws, c, p, cert] = await Promise.all([
        fetchWorkspaceData(),
        db.from("consultas_fiscais").select("*").order("data_consulta", { ascending: false }).limit(200),
        db.from("pendencias_fiscais").select("*").order("created_at", { ascending: false }),
        db.from("certidoes").select("*").order("data_validade", { ascending: true }),
      ]);
      setEmpresas(ws.empresas);
      setConsultas((c.data ?? []) as ConsultaRow[]);
      setPendencias((p.data ?? []) as PendenciaRow[]);
      setCertidoes((cert.data ?? []) as CertidaoRow[]);
    } catch (err: any) {
      setError(err?.message ?? "Falha ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    recarregar();
  }, []);

  return (
    <div className="space-y-6">
      <div className="surface-card rounded-lg border p-4 text-sm text-muted-foreground">
        O PrazoContábil consulta dados fiscais por CNPJ utilizando integrações oficiais ou consultas assistidas.
        Quando houver pendência, o sistema registra o alerta, gera tarefa para o responsável e permite acessar o
        portal oficial para regularização. Consultas que dependem de e-CAC, certificado digital ou procuração
        eletrônica são executadas com acesso autorizado do cliente.
      </div>

      {(loading || error) && <PageState loading={loading} error={error} />}

      {!loading && !error && (
        <Tabs defaultValue="cnpj" className="w-full">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted p-1">
            <TabsTrigger value="cnpj">Consulta CNPJ</TabsTrigger>
            <TabsTrigger value="regularidade">Regularidade Federal</TabsTrigger>
            <TabsTrigger value="cnd_fed">CND Federal</TabsTrigger>
            <TabsTrigger value="cnd_est">CND Estadual</TabsTrigger>
            <TabsTrigger value="cnd_mun">CND Municipal</TabsTrigger>
            <TabsTrigger value="fgts">FGTS</TabsTrigger>
            <TabsTrigger value="trab">Trabalhista</TabsTrigger>
            <TabsTrigger value="pend">Pendências encontradas</TabsTrigger>
            <TabsTrigger value="hist">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="cnpj" className="mt-4">
            <ConsultaCnpjTab onChange={recarregar} empresas={empresas} />
          </TabsContent>
          <TabsContent value="regularidade" className="mt-4">
            <ConsultaAssistidaTab
              titulo="Regularidade Federal (e-CAC / PGFN)"
              descricao="A consulta detalhada da situação fiscal federal exige acesso autorizado via gov.br, certificado digital ou procuração eletrônica no e-CAC. Use o botão abaixo para abrir o portal oficial e anexe o relatório retornado."
              tipoConsulta="regularidade_federal"
              esfera="federal"
              urlPortal="https://cav.receita.fazenda.gov.br/autenticacao/login"
              empresas={empresas}
              onChange={recarregar}
            />
          </TabsContent>
          <TabsContent value="cnd_fed" className="mt-4">
            <ConsultaAssistidaTab
              titulo="CND Federal (Receita Federal / PGFN)"
              descricao="Quando a empresa estiver regular, o sistema permite anexar a certidão emitida no portal oficial. Caso existam pendências, registre-as na aba 'Pendências encontradas'."
              tipoConsulta="cnd_federal"
              esfera="federal"
              urlPortal={PORTAIS.cnd_federal}
              empresas={empresas}
              onChange={recarregar}
            />
          </TabsContent>
          <TabsContent value="cnd_est" className="mt-4">
            <ConsultaAssistidaTab
              titulo="CND Estadual (SEFAZ)"
              descricao="As consultas estaduais dependem das regras de cada UF. Quando não houver integração automática disponível, o sistema usará consulta assistida: abra o portal da SEFAZ correspondente e anexe o PDF."
              tipoConsulta="cnd_estadual"
              esfera="estadual"
              urlPortal={null}
              empresas={empresas}
              onChange={recarregar}
              precisaUf
            />
          </TabsContent>
          <TabsContent value="cnd_mun" className="mt-4">
            <ConsultaAssistidaTab
              titulo="CND Municipal (Prefeitura)"
              descricao="As consultas municipais dependem das regras de cada prefeitura. Use o botão para acessar o portal e anexe a certidão emitida."
              tipoConsulta="cnd_municipal"
              esfera="municipal"
              urlPortal={null}
              empresas={empresas}
              onChange={recarregar}
              precisaUf
              precisaMunicipio
            />
          </TabsContent>
          <TabsContent value="fgts" className="mt-4">
            <ConsultaAssistidaTab
              titulo="Certificado de Regularidade do FGTS (CRF)"
              descricao="Consulta no portal da Caixa Econômica Federal. Anexe o CRF emitido para registrá-lo na empresa."
              tipoConsulta="fgts"
              esfera="fgts"
              urlPortal={PORTAIS.fgts}
              empresas={empresas}
              onChange={recarregar}
            />
          </TabsContent>
          <TabsContent value="trab" className="mt-4">
            <ConsultaAssistidaTab
              titulo="Certidão Negativa de Débitos Trabalhistas (CNDT)"
              descricao="Consulta no portal do TST. Anexe a CNDT emitida para registrá-la na empresa."
              tipoConsulta="trabalhista"
              esfera="trabalhista"
              urlPortal={PORTAIS.trabalhista}
              empresas={empresas}
              onChange={recarregar}
            />
          </TabsContent>
          <TabsContent value="pend" className="mt-4">
            <PendenciasTab pendencias={pendencias} empresas={empresas} onChange={recarregar} />
          </TabsContent>
          <TabsContent value="hist" className="mt-4">
            <HistoricoTab consultas={consultas} empresas={empresas} certidoes={certidoes} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

// ============ CONSULTA CNPJ ============
function ConsultaCnpjTab({ empresas, onChange }: { empresas: EmpresaReal[]; onChange: () => void }) {
  const [cnpj, setCnpj] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);

  async function consultar() {
    const c = onlyDigits(cnpj);
    if (c.length !== 14) {
      toast.error("Informe um CNPJ válido (14 dígitos)");
      return;
    }
    try {
      setLoading(true);
      setResultado(null);
      const { data, error } = await supabase.functions.invoke("consultar-cnpj", { body: { cnpj: c } });
      if (error) throw error;
      if (data?.status !== "sucesso") {
        toast.error(data?.mensagem ?? "Falha na consulta");
        setResultado({ erro: data?.mensagem });
      } else {
        setResultado(data.dados);
        toast.success("Dados cadastrais obtidos via Receita/BrasilAPI");
      }
      onChange();
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao consultar CNPJ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="surface-card rounded-lg border p-4">
        <h3 className="text-base font-semibold">Consulta de CNPJ na Receita Federal</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Fonte: BrasilAPI (proxy oficial da base CNPJ da Receita Federal). Os dados retornados incluem situação
          cadastral, CNAEs, natureza jurídica, endereço e quadro societário.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <div>
            <Label>CNPJ</Label>
            <Input
              placeholder="00.000.000/0000-00"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              maxLength={18}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={consultar} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSearch className="h-4 w-4" />}
              Consultar CNPJ
            </Button>
          </div>
        </div>
      </div>

      {resultado && !resultado.erro && (
        <div className="surface-card rounded-lg border p-4">
          <h4 className="text-sm font-semibold">Dados retornados</h4>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <Info label="Razão social" value={resultado.razao_social} />
            <Info label="Nome fantasia" value={resultado.nome_fantasia || "—"} />
            <Info label="CNPJ" value={resultado.cnpj} />
            <Info label="Situação cadastral" value={resultado.situacao_cadastral} />
            <Info label="Data de abertura" value={formatDate(resultado.data_abertura)} />
            <Info label="Porte" value={resultado.porte} />
            <Info label="Natureza jurídica" value={resultado.natureza_juridica} />
            <Info label="CNAE principal" value={resultado.cnae_principal} />
            <Info label="Endereço" value={`${resultado.endereco}, ${resultado.bairro}`} />
            <Info label="Município/UF" value={`${resultado.municipio} / ${resultado.uf}`} />
            <Info label="CEP" value={resultado.cep} />
            <Info label="Telefone" value={resultado.telefone || "—"} />
            <Info label="E-mail" value={resultado.email || "—"} />
          </div>
          {resultado.cnaes_secundarios?.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground">CNAEs secundários</p>
              <ul className="mt-1 list-disc pl-5 text-sm">
                {resultado.cnaes_secundarios.slice(0, 6).map((c: string, i: number) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
          {resultado.qsa?.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground">Quadro societário</p>
              <ul className="mt-1 list-disc pl-5 text-sm">
                {resultado.qsa.map((s: any, i: number) => (
                  <li key={i}>{s.nome_socio} — {s.qualificacao_socio}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            Para usar estes dados em uma empresa existente, copie e cole no cadastro. A criação automática de empresa
            a partir desta consulta pode ser ativada no fluxo de cadastro de Empresas.
          </p>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Total de empresas no escritório: {empresas.length}
      </p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || "—"}</p>
    </div>
  );
}

// ============ CONSULTA ASSISTIDA (CND/REGULARIDADE) ============
function ConsultaAssistidaTab({
  titulo,
  descricao,
  tipoConsulta,
  esfera,
  urlPortal,
  empresas,
  onChange,
  precisaUf,
  precisaMunicipio,
}: {
  titulo: string;
  descricao: string;
  tipoConsulta: string;
  esfera: string;
  urlPortal: string | null;
  empresas: EmpresaReal[];
  onChange: () => void;
  precisaUf?: boolean;
  precisaMunicipio?: boolean;
}) {
  const [empresaId, setEmpresaId] = useState<string>("");
  const [status, setStatus] = useState<string>("regular");
  const [mensagem, setMensagem] = useState<string>("");
  const [numeroCertidao, setNumeroCertidao] = useState<string>("");
  const [dataValidade, setDataValidade] = useState<string>("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);

  const empresa = empresas.find((e) => e.id === empresaId);
  const portalFinal = urlPortal ?? (precisaUf && empresa
    ? `https://www.google.com/search?q=consulta+CND+SEFAZ+${empresa.uf}`
    : precisaMunicipio && empresa
      ? `https://www.google.com/search?q=consulta+CND+prefeitura+${empresa.municipio}+${empresa.uf}`
      : "#");

  async function registrar() {
    if (!empresaId) {
      toast.error("Selecione uma empresa");
      return;
    }
    try {
      setEnviando(true);
      const empresa = empresas.find((e) => e.id === empresaId)!;

      let arquivoUrl: string | null = null;
      if (arquivo) {
        const path = `${empresa.escritorioId}/${empresaId}/${tipoConsulta}-${Date.now()}-${arquivo.name}`;
        const { error: upErr } = await supabase.storage.from("certidoes").upload(path, arquivo, { upsert: false });
        if (upErr) throw upErr;
        arquivoUrl = path;
      }

      // 1) consulta_fiscal
      const { data: consultaIns, error: cErr } = await db
        .from("consultas_fiscais")
        .insert({
          escritorio_id: empresa.escritorioId,
          empresa_id: empresaId,
          tipo_consulta: tipoConsulta,
          origem: "consulta_assistida",
          cnpj: empresa.cnpj,
          status,
          mensagem: mensagem || null,
          link_oficial: urlPortal,
          arquivo_pdf_url: arquivoUrl,
        })
        .select()
        .single();
      if (cErr) throw cErr;

      // 2) se regular/emitida, registra certidão
      if (status === "regular" || status === "certidao_emitida") {
        await db.from("certidoes").insert({
          escritorio_id: empresa.escritorioId,
          empresa_id: empresaId,
          tipo_certidao: tipoConsulta,
          esfera,
          uf: empresa.uf,
          municipio: empresa.municipio,
          numero_certidao: numeroCertidao || null,
          data_emissao: new Date().toISOString().slice(0, 10),
          data_validade: dataValidade || null,
          status: "valida",
          arquivo_pdf_url: arquivoUrl,
          origem_emissao: "portal_oficial",
          consulta_id: (consultaIns as any).id,
        });
      }

      // 3) se pendência, cria pendência fiscal
      if (status === "pendencia") {
        await db.from("pendencias_fiscais").insert({
          escritorio_id: empresa.escritorioId,
          empresa_id: empresaId,
          consulta_id: (consultaIns as any).id,
          origem: esfera === "federal" ? "receita_federal" : esfera === "estadual" ? "sefaz" : esfera === "municipal" ? "prefeitura" : esfera,
          tipo_pendencia: tipoConsulta,
          descricao: mensagem || "Pendência identificada na consulta",
          grau_risco: "alto",
          status: "aberta",
          link_oficial: urlPortal,
          arquivo_pdf_url: arquivoUrl,
        });
      }

      toast.success("Consulta registrada");
      setMensagem("");
      setNumeroCertidao("");
      setDataValidade("");
      setArquivo(null);
      onChange();
    } catch (err: any) {
      toast.error(err?.message ?? "Falha ao registrar");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="surface-card rounded-lg border p-4">
        <h3 className="text-base font-semibold">{titulo}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{descricao}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild variant="outline" className="gap-2">
            <a href={portalFinal} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" /> Abrir portal oficial
            </a>
          </Button>
        </div>
      </div>

      <div className="surface-card rounded-lg border p-4">
        <h4 className="text-sm font-semibold">Registrar resultado da consulta</h4>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <Label>Empresa</Label>
            <Select value={empresaId} onValueChange={setEmpresaId}>
              <SelectTrigger><SelectValue placeholder="Selecione a empresa" /></SelectTrigger>
              <SelectContent>
                {empresas.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.razaoSocial} — {e.cnpj}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Situação</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Regular / Certidão emitida</SelectItem>
                <SelectItem value="pendencia">Pendência encontrada</SelectItem>
                <SelectItem value="indisponivel">Consulta indisponível</SelectItem>
                <SelectItem value="aguardando_acesso">Aguardando acesso autorizado</SelectItem>
                <SelectItem value="erro">Erro na consulta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Número da certidão (se aplicável)</Label>
            <Input value={numeroCertidao} onChange={(e) => setNumeroCertidao(e.target.value)} />
          </div>
          <div>
            <Label>Data de validade</Label>
            <Input type="date" value={dataValidade} onChange={(e) => setDataValidade(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label>Mensagem / observações</Label>
            <Textarea value={mensagem} onChange={(e) => setMensagem(e.target.value)} rows={3} />
          </div>
          <div className="md:col-span-2">
            <Label>Anexar PDF (certidão ou relatório de pendências)</Label>
            <Input type="file" accept="application/pdf" onChange={(e) => setArquivo(e.target.files?.[0] ?? null)} />
            <p className="mt-1 text-xs text-muted-foreground">Arquivos vão para o bucket privado <code>certidoes</code>.</p>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={registrar} disabled={enviando} className="gap-2">
            {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Registrar consulta
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============ PENDÊNCIAS ============
function PendenciasTab({ pendencias, empresas, onChange }: { pendencias: PendenciaRow[]; empresas: EmpresaReal[]; onChange: () => void }) {
  const empresaMap = new Map(empresas.map((e) => [e.id, e]));
  const abertas = pendencias.filter((p) => p.status !== "regularizada" && p.status !== "sem_acao");

  async function regularizar(id: string) {
    try {
      const { error } = await db
        .from("pendencias_fiscais")
        .update({ status: "regularizada", regularizada_em: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      toast.success("Pendência marcada como regularizada");
      onChange();
    } catch (err: any) {
      toast.error(err?.message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="surface-card rounded-lg border p-4 text-sm text-muted-foreground">
        Reúne pendências detectadas em consultas de Receita Federal, PGFN, SEFAZ, prefeituras, FGTS e Justiça do
        Trabalho.
      </div>
      {pendencias.length === 0 ? (
        <div className="surface-card rounded-lg border p-6 text-sm text-muted-foreground">
          Nenhuma pendência registrada. Pendências aparecem aqui automaticamente quando uma consulta retorna status
          "Pendência encontrada".
        </div>
      ) : (
        <div className="surface-card rounded-lg border">
          <div className="grid grid-cols-7 gap-2 border-b bg-muted/40 p-3 text-xs font-semibold text-muted-foreground">
            <span>Empresa</span>
            <span>Origem</span>
            <span>Tipo</span>
            <span>Risco</span>
            <span>Status</span>
            <span>Prazo</span>
            <span className="text-right">Ações</span>
          </div>
          {pendencias.map((p) => {
            const emp = empresaMap.get(p.empresa_id);
            return (
              <div key={p.id} className="grid grid-cols-7 items-center gap-2 border-b p-3 text-sm last:border-0">
                <span className="truncate">{emp?.razaoSocial ?? "—"}</span>
                <span className="text-xs uppercase text-muted-foreground">{p.origem}</span>
                <span>{p.tipo_pendencia}</span>
                <span><StatusBadge value={p.grau_risco} /></span>
                <span><StatusBadge value={p.status} /></span>
                <span className="text-xs">{formatDate(p.prazo_regularizacao)}</span>
                <span className="flex justify-end gap-1">
                  {p.link_oficial && (
                    <Button asChild size="sm" variant="outline">
                      <a href={p.link_oficial} target="_blank" rel="noopener noreferrer">Portal</a>
                    </Button>
                  )}
                  {p.status !== "regularizada" && (
                    <Button size="sm" onClick={() => regularizar(p.id)}>Regularizar</Button>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}
      <p className="text-xs text-muted-foreground">{abertas.length} pendência(s) em aberto.</p>
    </div>
  );
}

// ============ HISTÓRICO ============
function HistoricoTab({ consultas, empresas, certidoes }: { consultas: ConsultaRow[]; empresas: EmpresaReal[]; certidoes: CertidaoRow[] }) {
  const empresaMap = new Map(empresas.map((e) => [e.id, e]));
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="surface-card rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Consultas registradas</p>
          <strong className="text-2xl">{consultas.length}</strong>
        </div>
        <div className="surface-card rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Certidões válidas</p>
          <strong className="text-2xl">{certidoes.filter((c) => c.status === "valida").length}</strong>
        </div>
        <div className="surface-card rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Erros recentes</p>
          <strong className="text-2xl">{consultas.filter((c) => c.status === "erro").length}</strong>
        </div>
      </div>

      <div className="surface-card rounded-lg border">
        <div className="grid grid-cols-6 gap-2 border-b bg-muted/40 p-3 text-xs font-semibold text-muted-foreground">
          <span>Data</span>
          <span>Empresa / CNPJ</span>
          <span>Tipo</span>
          <span>Origem</span>
          <span>Status</span>
          <span>Mensagem</span>
        </div>
        {consultas.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">Nenhuma consulta registrada ainda.</div>
        ) : (
          consultas.map((c) => {
            const emp = c.empresa_id ? empresaMap.get(c.empresa_id) : null;
            return (
              <div key={c.id} className="grid grid-cols-6 items-center gap-2 border-b p-3 text-sm last:border-0">
                <span className="text-xs">{new Date(c.data_consulta).toLocaleString("pt-BR")}</span>
                <span className="truncate">{emp?.razaoSocial ?? c.cnpj ?? "—"}</span>
                <span>{c.tipo_consulta}</span>
                <span className="text-xs uppercase">{c.origem ?? "—"}</span>
                <span><StatusBadge value={c.status} /></span>
                <span className="truncate text-xs text-muted-foreground" title={c.mensagem ?? ""}>{c.mensagem ?? "—"}</span>
              </div>
            );
          })
        )}
      </div>

      <div className="surface-card rounded-lg border p-4">
        <h4 className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="h-4 w-4 text-success" /> Segurança</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          PDFs ficam em bucket privado. URLs de download são geradas sob demanda e expiram. Senhas de certificado
          digital nunca são armazenadas. Todas as chamadas a APIs externas são registradas em <code>logs_integracao</code>.
        </p>
      </div>
    </div>
  );
}
