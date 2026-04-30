import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { EmpresaCard, PageState } from "@/components/prazocontabil/ui";
import { WorkspaceData, emptyWorkspaceData, fetchWorkspaceData } from "@/lib/prazocontabil-data";

export const Route = createFileRoute("/app/empresas")({
  head: () => ({ meta: [{ title: "Empresas — PrazoContábil" }, { name: "description", content: "Empresas como centro das rotinas fiscais, documentos, obrigações e alertas por CNPJ." }] }),
  component: EmpresasPage,
});

function EmpresasPage() {
  const [data, setData] = useState<WorkspaceData>(emptyWorkspaceData());
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { fetchWorkspaceData().then(setData).catch(() => setError("Não foi possível carregar as empresas." )).finally(() => setLoading(false)); }, []);
  const empresas = useMemo(() => data.empresas.filter((empresa) => [empresa.razaoSocial, empresa.nomeFantasia, empresa.cnpj, empresa.regimeTributario, empresa.uf, empresa.municipio, empresa.responsavelInterno].join(" ").toLowerCase().includes(busca.toLowerCase())), [data.empresas, busca]);
  if (loading || error) return <PageState loading={loading} error={error} />;
  return <div className="space-y-5"><div className="surface-card rounded-lg border p-4"><label className="text-sm font-medium">Buscar por empresa, CNPJ, regime, UF, município ou responsável</label><div className="mt-2 flex items-center gap-2"><Search className="h-4 w-4 text-muted-foreground" /><Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Digite para filtrar empresas cadastradas" /></div></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{empresas.map((empresa) => <EmpresaCard key={empresa.id} empresa={empresa} documentos={data.documentos} />)}</div>{!empresas.length && <PageState emptyText="Nenhum registro encontrado para os filtros selecionados." />}</div>;
}
