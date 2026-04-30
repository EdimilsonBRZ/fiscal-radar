import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Bell, Building2, CalendarDays, Clock, FileWarning, ListChecks } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageState, StatCard, StatusBadge } from "@/components/prazocontabil/ui";
import { WorkspaceData, documentoSituacao, emptyWorkspaceData, fetchWorkspaceData, formatDate } from "@/lib/prazocontabil-data";

export const Route = createFileRoute("/app/painel")({
  head: () => ({ meta: [{ title: "Painel — PrazoContábil" }, { name: "description", content: "Painel de prazos, rotinas fiscais, documentos, obrigações e alertas por empresa/CNPJ." }] }),
  component: PainelPage,
});

function PainelPage() {
  const [data, setData] = useState<WorkspaceData>(emptyWorkspaceData());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWorkspaceData().then(setData).catch(() => setError("Não foi possível carregar os dados reais do sistema.")).finally(() => setLoading(false));
  }, []);

  const metrics = useMemo(() => {
    const docsVencidos = data.documentos.filter((doc) => documentoSituacao(doc) === "Vencido").length;
    const docsVencendo = data.documentos.filter((doc) => documentoSituacao(doc) === "Vencendo").length;
    const obrigacoesAtrasadas = data.obrigacoes.filter((item) => item.situacao === "atrasada").length;
    const rotinasPendentes = data.rotinas.filter((item) => item.situacao !== "concluida").length;
    const alertasAtivos = data.alertas.filter((item) => !item.resolvido).length;
    const criticas = data.empresas.filter((empresa) => empresa.risco >= 70).length;
    return { docsVencidos, docsVencendo, obrigacoesAtrasadas, rotinasPendentes, alertasAtivos, criticas };
  }, [data]);

  const pendenciasPorResponsavel = useMemo(() => {
    const map = new Map<string, number>();
    data.rotinas.filter((r) => r.situacao !== "concluida").forEach((r) => map.set(data.usuarios.find((u) => u.id === r.responsavelId)?.nome ?? "Equipe Fiscal", (map.get(data.usuarios.find((u) => u.id === r.responsavelId)?.nome ?? "Equipe Fiscal") ?? 0) + 1));
    data.obrigacoes.filter((o) => !["entregue", "nao_se_aplica"].includes(o.situacao)).forEach((o) => map.set(data.usuarios.find((u) => u.id === o.responsavelId)?.nome ?? "Equipe Fiscal", (map.get(data.usuarios.find((u) => u.id === o.responsavelId)?.nome ?? "Equipe Fiscal") ?? 0) + 1));
    return [...map.entries()].map(([nome, total]) => ({ nome, total })).sort((a, b) => b.total - a.total);
  }, [data]);

  if (loading || error) return <PageState loading={loading} error={error} />;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total de empresas" value={data.empresas.length} icon={Building2} />
        <StatCard label="Empresas críticas" value={metrics.criticas} tone="critical" icon={AlertTriangle} />
        <StatCard label="Documentos vencidos" value={metrics.docsVencidos} tone="critical" icon={FileWarning} />
        <StatCard label="Documentos vencendo" value={metrics.docsVencendo} tone="warning" icon={Clock} />
        <StatCard label="Obrigações atrasadas" value={metrics.obrigacoesAtrasadas} tone="critical" icon={ListChecks} />
        <StatCard label="Rotinas fiscais pendentes" value={metrics.rotinasPendentes} tone="warning" icon={CalendarDays} />
        <StatCard label="Alertas ativos" value={metrics.alertasAtivos} tone="critical" icon={Bell} />
        <StatCard label="Próximos vencimentos oficiais" value={data.calendario.filter((c) => new Date(c.dataVencimento) >= new Date()).length} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="surface-card rounded-lg border p-5">
          <h2 className="font-semibold">Ranking de empresas críticas</h2>
          <div className="mt-4 space-y-3">
            {data.empresas.slice().sort((a, b) => b.risco - a.risco).slice(0, 6).map((empresa) => (
              <div key={empresa.id} className="flex items-center justify-between rounded-md border bg-card p-3">
                <div><p className="font-medium">{empresa.razaoSocial}</p><p className="text-xs text-muted-foreground">{empresa.cnpj}</p></div>
                <strong>{empresa.risco}</strong>
              </div>
            ))}
            {!data.empresas.length && <PageState emptyText="Nenhum registro encontrado para os filtros selecionados." />}
          </div>
        </section>
        <section className="surface-card rounded-lg border p-5">
          <h2 className="font-semibold">Pendências por responsável</h2>
          <div className="mt-4 space-y-2">
            {pendenciasPorResponsavel.map((item) => <div key={item.nome} className="flex items-center justify-between rounded-md border bg-card p-3 text-sm"><span>{item.nome}</span><strong>{item.total}</strong></div>)}
            {!pendenciasPorResponsavel.length && <PageState emptyText="Nenhum registro encontrado para os filtros selecionados." />}
          </div>
        </section>
      </div>

      <section className="surface-card rounded-lg border p-5">
        <h2 className="font-semibold">Calendário fiscal do mês</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="py-2">Obrigação</th><th>Competência</th><th>Regime</th><th>UF</th><th>Vencimento</th><th>Situação</th></tr></thead><tbody>{data.calendario.slice(0, 10).map((item) => <tr key={item.id} className="border-b"><td className="py-3 font-medium">{item.nomeObrigacao}</td><td>{item.competencia}</td><td>{item.regimeTributario}</td><td>{item.uf}</td><td>{formatDate(item.dataVencimento)}</td><td><StatusBadge value={item.editadoManualmente ? "Editado manualmente" : "Configurado"} /></td></tr>)}</tbody></table>
          {!data.calendario.length && <PageState emptyText="Nenhum registro encontrado para os filtros selecionados." />}
        </div>
      </section>
    </div>
  );
}
