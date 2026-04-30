import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { BarChart3, Bell, Building2, CalendarDays, ClipboardCheck, FileText, Gauge, Menu, Radar, Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/app/painel", label: "Painel", icon: Gauge },
  { to: "/app/empresas", label: "Empresas", icon: Building2 },
  { to: "/app/rotinas", label: "Rotinas fiscais", icon: CalendarDays },
  { to: "/app/documentos", label: "Documentos", icon: FileText },
  { to: "/app/obrigacoes", label: "Obrigações", icon: ClipboardCheck },
  { to: "/app/alertas", label: "Alertas", icon: Bell },
  { to: "/app/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/app/configuracoes", label: "Configurações", icon: Settings },
] as const;

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const active = navItems.find((item) => location.pathname.startsWith(item.to));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 border-r bg-panel text-panel-foreground transition-transform lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center gap-3 border-b border-border/20 px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Radar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-panel-foreground/70">PrazoContábil</p>
            <strong className="text-sm">Rotinas fiscais por CNPJ</strong>
          </div>
        </div>
        <nav className="space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-panel-foreground/80 transition-all hover:bg-primary/25"
                activeProps={{ className: "bg-accent text-accent-foreground shadow-sm" }}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-border/20 p-4 text-xs text-panel-foreground/70">
          <p>Sistema ativo</p>
          <p>Controle de prazos, documentos e rotinas fiscais por empresa/CNPJ.</p>
        </div>
      </aside>
      <main className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/85 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button className="rounded-md border p-2 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Abrir menu">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold md:text-2xl">{active?.label ?? "PrazoContábil"}</h1>
              <p className="hidden text-sm text-muted-foreground md:block">Gestão de prazos e rotinas fiscais para escritórios contábeis</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-md border bg-success px-2.5 py-1 text-xs font-medium text-success-foreground">Sistema ativo</span>
            <Button variant="outline" asChild><Link to="/">Página inicial</Link></Button>
          </div>
        </header>
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
