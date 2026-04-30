import { Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertaReal, DocumentoReal, EmpresaReal, ObrigacaoReal, RotinaFiscalReal, documentoSituacao, formatDate, labelSituacao } from "@/lib/prazocontabil-data";

export function PageState({ loading, error, emptyText }: { loading?: boolean; error?: string; emptyText?: string }) {
  if (loading) return <div className="surface-card rounded-lg border p-6 text-sm text-muted-foreground">Carregando dados reais do sistema...</div>;
  if (error) return <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">{error}</div>;
  if (emptyText) return <div className="surface-card rounded-lg border p-6 text-sm text-muted-foreground">{emptyText}</div>;
  return null;
}

export function StatCard({ label, value, tone = "default", icon: Icon = FileText }: { label: string; value: string | number; tone?: "default" | "success" | "warning" | "critical"; icon?: any }) {
  const toneClass = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : tone === "critical" ? "text-critical" : "text-primary";
  return (
    <div className="surface-card rounded-lg border p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className={`h-4 w-4 ${toneClass}`} />
      </div>
      <strong className="mt-2 block text-2xl text-foreground">{value}</strong>
    </div>
  );
}

export function StatusBadge({ value }: { value?: string | null }) {
  const label = labelSituacao(value);
  const lower = label.toLowerCase();
  const cls = lower.includes("venc") || lower.includes("atras") || lower.includes("crítica")
    ? "bg-critical text-critical-foreground"
    : lower.includes("concl") || lower.includes("entreg") || lower.includes("válido") || lower.includes("ativa")
      ? "bg-success text-success-foreground"
      : lower.includes("andamento") || lower.includes("aguard") || lower.includes("pend")
        ? "bg-warning text-warning-foreground"
        : "bg-secondary text-secondary-foreground";
  return <span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${cls}`}>{label}</span>;
}

export function EmpresaResumoCards({ empresa, documentos, obrigacoes, rotinas, alertas }: { empresa: EmpresaReal; documentos: DocumentoReal[]; obrigacoes: ObrigacaoReal[]; rotinas: RotinaFiscalReal[]; alertas: AlertaReal[] }) {
  const docsEmpresa = documentos.filter((doc) => doc.empresaId === empresa.id);
  const obrEmpresa = obrigacoes.filter((item) => item.empresaId === empresa.id);
  const rotinasEmpresa = rotinas.filter((item) => item.empresaId === empresa.id);
  const alertasEmpresa = alertas.filter((item) => item.empresaId === empresa.id && !item.resolvido);
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Documentos válidos" value={docsEmpresa.filter((doc) => documentoSituacao(doc) === "Válido").length} tone="success" icon={CheckCircle2} />
      <StatCard label="Documentos vencendo" value={docsEmpresa.filter((doc) => documentoSituacao(doc) === "Vencendo").length} tone="warning" icon={Clock} />
      <StatCard label="Documentos vencidos" value={docsEmpresa.filter((doc) => documentoSituacao(doc) === "Vencido").length} tone="critical" icon={AlertTriangle} />
      <StatCard label="Obrigações pendentes" value={obrEmpresa.filter((item) => !["entregue", "nao_se_aplica"].includes(item.situacao)).length} tone="warning" />
      <StatCard label="Obrigações atrasadas" value={obrEmpresa.filter((item) => item.situacao === "atrasada").length} tone="critical" />
      <StatCard label="Rotinas do mês" value={rotinasEmpresa.length} />
      <StatCard label="Alertas ativos" value={alertasEmpresa.length} tone="critical" icon={AlertTriangle} />
      <StatCard label="Nota de risco" value={empresa.risco} tone={empresa.risco >= 70 ? "critical" : empresa.risco >= 40 ? "warning" : "success"} />
    </div>
  );
}

export function EmpresaCard({ empresa, documentos }: { empresa: EmpresaReal; documentos: DocumentoReal[] }) {
  const docs = documentos.filter((doc) => doc.empresaId === empresa.id);
  const proximo = docs.slice().sort((a, b) => a.vencimento.localeCompare(b.vencimento))[0];
  return (
    <article className="surface-card rounded-lg border p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-foreground">{empresa.razaoSocial}</h2>
          <p className="text-sm text-muted-foreground">{empresa.cnpj}</p>
          <p className="mt-1 text-xs text-muted-foreground">Responsável: {empresa.responsavelInterno}</p>
        </div>
        <StatusBadge value={empresa.situacao} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <MiniMetric label="Válidos" value={docs.filter((doc) => documentoSituacao(doc) === "Válido").length} />
        <MiniMetric label="Vencendo" value={docs.filter((doc) => documentoSituacao(doc) === "Vencendo").length} />
        <MiniMetric label="Vencidos" value={docs.filter((doc) => documentoSituacao(doc) === "Vencido").length} />
        <MiniMetric label="Sem arquivo" value={docs.filter((doc) => documentoSituacao(doc) === "Sem arquivo").length} />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">Próximo vencimento: <strong className="text-foreground">{proximo ? `${proximo.tipo} em ${formatDate(proximo.vencimento)}` : "Sem documentos"}</strong></p>
      <Button className="mt-4 w-full" asChild><Link to="/app/empresas/$id" params={{ id: empresa.id }}>Ver empresa</Link></Button>
    </article>
  );
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-md border bg-card p-3"><span className="block text-xs text-muted-foreground">{label}</span><strong>{value}</strong></div>;
}
