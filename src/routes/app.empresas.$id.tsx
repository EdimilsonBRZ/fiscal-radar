import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmpresaResumoCards, PageState, StatusBadge } from "@/components/prazocontabil/ui";
import { WorkspaceData, documentoSituacao, emptyWorkspaceData, fetchWorkspaceData, formatDate } from "@/lib/prazocontabil-data";

export const Route = createFileRoute("/app/empresas/$id")({
  head: () => ({ meta: [{ title: "Painel da empresa — PrazoContábil" }, { name: "description", content: "Painel completo da empresa com dados cadastrais, e-mails, rotinas, documentos, obrigações, alertas, relatórios e histórico." }] }),
  component: EmpresaDetalhePage,
});

const abas = ["Dados cadastrais", "E-mails de alerta", "Rotinas fiscais", "Documentos", "Obrigações", "Alertas", "Relatórios", "Histórico"];

function EmpresaDetalhePage() {
  const { id } = Route.useParams();
  const [data, setData] = useState<WorkspaceData>(emptyWorkspaceData());
  const [aba, setAba] = useState(abas[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { fetchWorkspaceData().then(setData).catch(() => setError("Não foi possível carregar o painel da empresa." )).finally(() => setLoading(false)); }, []);
  const empresa = data.empresas.find((item) => item.id === id);
  const docs = data.documentos.filter((item) => item.empresaId === id);
  const obrigacoes = data.obrigacoes.filter((item) => item.empresaId === id);
  const rotinas = data.rotinas.filter((item) => item.empresaId === id);
  const alertas = data.alertas.filter((item) => item.empresaId === id);
  const emails = data.emails.filter((item) => item.empresaId === id);
  const docsPorSituacao = useMemo(() => ({ válidos: docs.filter((d) => documentoSituacao(d) === "Válido"), vencendo: docs.filter((d) => documentoSituacao(d) === "Vencendo"), vencidos: docs.filter((d) => documentoSituacao(d) === "Vencido"), semArquivo: docs.filter((d) => documentoSituacao(d) === "Sem arquivo"), aguardando: docs.filter((d) => documentoSituacao(d) === "Aguardando cliente") }), [docs]);
  if (loading || error) return <PageState loading={loading} error={error} />;
  if (!empresa) return <PageState emptyText="Empresa não encontrada." />;
  return <div className="space-y-5"><section className="surface-card rounded-lg border p-5"><div className="flex flex-col justify-between gap-3 md:flex-row md:items-start"><div><h2 className="text-2xl font-semibold">{empresa.razaoSocial}</h2><p className="text-sm text-muted-foreground">{empresa.cnpj} · {empresa.regimeTributario} · {empresa.municipio}/{empresa.uf}</p></div><StatusBadge value={empresa.situacao} /></div><div className="mt-5"><EmpresaResumoCards empresa={empresa} documentos={data.documentos} obrigacoes={data.obrigacoes} rotinas={data.rotinas} alertas={data.alertas} /></div></section><div className="flex flex-wrap gap-2">{abas.map((item) => <Button key={item} variant={aba === item ? "default" : "outline"} size="sm" onClick={() => setAba(item)}>{item}</Button>)}</div><section className="surface-card rounded-lg border p-5">{aba === "Dados cadastrais" && <div className="grid gap-4 md:grid-cols-2"><Info label="Nome fantasia" value={empresa.nomeFantasia} /><Info label="Natureza jurídica" value={empresa.naturezaJuridica} /><Info label="Setor" value={empresa.setor} /><Info label="Responsável interno" value={empresa.responsavelInterno} /><Info label="E-mail do cliente" value={empresa.emailCliente} /><Info label="Telefone" value={empresa.telefone} /></div>}{aba === "E-mails de alerta" && <div className="grid gap-3 md:grid-cols-2"><Input defaultValue={emails.find((e) => e.principal)?.email ?? ""} placeholder="E-mail principal" /><Input defaultValue={emails.find((e) => e.rotulo === "adicional_1")?.email ?? ""} placeholder="E-mail adicional 1" /><Input defaultValue={emails.find((e) => e.rotulo === "adicional_2")?.email ?? ""} placeholder="E-mail adicional 2" /><Input defaultValue={emails.find((e) => e.rotulo === "adicional_3")?.email ?? ""} placeholder="E-mail adicional 3" /><Button className="md:col-span-2">Salvar e-mails da empresa</Button></div>}{aba === "Rotinas fiscais" && <Table rows={rotinas.map((r) => [r.competencia, formatDate(r.dataLimite), <StatusBadge value={r.situacao} />, r.observacoes || "—"])} headers={["Competência", "Data limite", "Situação", "Observações"]} />}{aba === "Documentos" && <div className="space-y-5"><DocGroup title="Válidos" docs={docsPorSituacao.válidos} /><DocGroup title="Vencendo" docs={docsPorSituacao.vencendo} /><DocGroup title="Vencidos" docs={docsPorSituacao.vencidos} /><DocGroup title="Sem arquivo" docs={docsPorSituacao.semArquivo} /><DocGroup title="Aguardando cliente" docs={docsPorSituacao.aguardando} /></div>}{aba === "Obrigações" && <Table rows={obrigacoes.map((o) => [o.tipo, o.competencia, formatDate(o.vencimento), <StatusBadge value={o.situacao} />, o.protocolo || "—"])} headers={["Obrigação", "Competência", "Vencimento", "Situação", "Protocolo"]} />}{aba === "Alertas" && <Table rows={alertas.map((a) => [formatDate(a.dataAlerta), a.tipo, a.mensagem, a.destinatarios.join(", ") || "Sem e-mail", <StatusBadge value={a.resolvido ? "Concluído" : "Pendente"} />])} headers={["Data", "Tipo", "Mensagem", "Destinatários", "Situação"]} />}{aba === "Relatórios" && <PageState emptyText="Use a tela Relatórios para gerar visões reais por empresa, CNPJ, competência e responsável." />}{aba === "Histórico" && <PageState emptyText="O histórico de alterações da empresa será listado conforme as rotinas, documentos e obrigações forem atualizados." />}</section></div>;
}
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-md border bg-card p-3"><p className="text-xs text-muted-foreground">{label}</p><strong className="text-sm">{value || "—"}</strong></div>; }
function Table({ headers, rows }: { headers: string[]; rows: any[][] }) { return rows.length ? <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-sm"><thead><tr className="border-b text-left text-muted-foreground">{headers.map((h) => <th key={h} className="py-2">{h}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i} className="border-b">{row.map((cell, j) => <td key={j} className="py-3 pr-4">{cell}</td>)}</tr>)}</tbody></table></div> : <PageState emptyText="Nenhum registro encontrado para os filtros selecionados." />; }
function DocGroup({ title, docs }: { title: string; docs: any[] }) { return <div><h3 className="mb-2 font-semibold">{title}</h3><Table headers={["Tipo", "Número", "Vencimento", "Arquivo"]} rows={docs.map((d) => [d.tipo, d.numero || "—", formatDate(d.vencimento), d.arquivoUrl ? "Anexado" : "Sem arquivo"])} /></div>; }
