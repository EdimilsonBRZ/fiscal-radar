import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ChevronRight, Radar } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroAccounting from "@/assets/landing/hero-accounting.jpg";
import accountingTeam from "@/assets/landing/accounting-team.jpg";
import documentsControl from "@/assets/landing/documents-control.jpg";
import reportsDashboard from "@/assets/landing/reports-dashboard.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PrazoContábil — Rotinas fiscais por CNPJ" },
      { name: "description", content: "Controle de prazos, documentos e rotinas fiscais por empresa/CNPJ para escritórios contábeis." },
      { property: "og:title", content: "PrazoContábil — Rotinas fiscais por CNPJ" },
      { property: "og:description", content: "Gestão de prazos e rotinas fiscais para escritórios contábeis." },
    ],
  }),
  component: HomePage,
});

const beneficios = [
  { title: "Empresas como centro", text: "Painel por CNPJ com dados cadastrais, e-mails, rotinas, documentos, obrigações, alertas, relatórios e histórico.", image: accountingTeam, alt: "Equipe contábil organizando empresas e rotinas fiscais" },
  { title: "Rotinas fiscais mensais", text: "Checklist por competência com movimento fiscal, conferências, guias, obrigações acessórias e pós-entrega.", image: documentsControl, alt: "Profissional conferindo documentos fiscais" },
  { title: "Relatórios reais", text: "Filtros por empresa, CNPJ, regime, responsável, documento, obrigação, competência e período.", image: reportsDashboard, alt: "Painel de relatórios contábeis" },
];

function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Radar className="h-5 w-5" /></span>
            <span><strong>PrazoContábil</strong><p className="text-xs text-muted-foreground">Controle de prazos, documentos e rotinas fiscais por empresa/CNPJ.</p></span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#beneficios">Benefícios</a>
            <a href="#fluxo">Fluxo</a>
            <Link to="/app/painel">Painel</Link>
          </nav>
          <Button variant="panel" asChild><Link to="/login">Entrar</Link></Button>
        </div>
      </header>
      <main>
        <section className="overflow-hidden">
          <div className="mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl items-center gap-10 px-4 py-12 md:grid-cols-[0.95fr_1.05fr] md:px-8 lg:py-16">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-md bg-success px-3 py-1 text-sm font-medium text-success-foreground">Gestão de prazos e rotinas fiscais para escritórios contábeis</span>
              <h1 className="mt-6 text-4xl font-bold leading-tight md:text-6xl">PrazoContábil</h1>
              <p className="mt-6 text-lg text-muted-foreground md:text-xl">Controle documentos, obrigações, rotinas fiscais, alertas e relatórios por empresa e CNPJ usando dados salvos no sistema.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button variant="hero" size="lg" asChild><Link to="/login">Entrar no sistema <ChevronRight className="h-4 w-4" /></Link></Button>
                <Button variant="outline" size="lg" asChild><Link to="/app/painel">Ver painel</Link></Button>
              </div>
              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {["Rotinas por empresa", "Alertas por e-mail", "Relatórios reais"].map((item) => <div key={item} className="surface-card rounded-lg border p-4 text-sm font-semibold"><CheckCircle2 className="mb-3 h-5 w-5 text-success" />{item}</div>)}
              </div>
            </div>
            <div className="relative">
              <img src={heroAccounting} alt="Profissional contábil analisando prazos e documentos fiscais" className="h-[560px] w-full rounded-lg border object-cover shadow-2xl" loading="eager" />
              <div className="absolute inset-x-4 bottom-4 rounded-lg border bg-card/95 p-4 shadow-2xl backdrop-blur md:inset-x-8 md:bottom-8">
                <p className="text-sm text-muted-foreground">Sistema ativo</p>
                <h2 className="text-xl font-semibold">Prioridade fiscal hoje</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">{[["Empresas", "—"], ["Alertas", "—"], ["Rotinas", "—"], ["Risco", "—"]].map(([label, value]) => <div key={label} className="rounded-md border bg-secondary/45 p-3"><p className="text-xs text-muted-foreground">{label}</p><strong className="text-2xl">{value}</strong></div>)}</div>
              </div>
            </div>
          </div>
        </section>
        <section id="beneficios" className="border-y bg-secondary/55">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-8"><h2 className="text-3xl font-bold">Organizado como rotina real de escritório contábil</h2><div className="mt-8 grid gap-5 md:grid-cols-3">{beneficios.map((item) => <article className="surface-card overflow-hidden rounded-lg border" key={item.title}><img src={item.image} alt={item.alt} className="h-44 w-full object-cover" loading="lazy" /><div className="p-5"><strong>{item.title}</strong><p className="mt-2 text-sm text-muted-foreground">{item.text}</p></div></article>)}</div></div>
        </section>
        <section id="fluxo" className="mx-auto max-w-7xl px-4 py-16 md:px-8"><h2 className="text-3xl font-bold">Fluxo ideal do sistema</h2><div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">{["Cadastrar empresa", "Configurar e-mails", "Gerar rotinas fiscais", "Criar obrigações", "Gerar relatórios"].map((item, index) => <div key={item} className="surface-card rounded-lg border p-4"><span className="text-sm text-muted-foreground">Etapa {index + 1}</span><p className="mt-2 font-semibold">{item}</p></div>)}</div></section>
      </main>
      <footer className="border-t px-4 py-8 text-center text-sm text-muted-foreground">PrazoContábil · Página inicial · Política de Privacidade · Termos de Uso</footer>
    </div>
  );
}
