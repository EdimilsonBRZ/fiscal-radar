import { createFileRoute } from "@tanstack/react-router";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import heroAccounting from "@/assets/landing/hero-accounting.jpg";
import accountingTeam from "@/assets/landing/accounting-team.jpg";
import soloAccountant from "@/assets/landing/solo-accountant.jpg";
import fiscalDepartment from "@/assets/landing/fiscal-department.jpg";
import businessMeeting from "@/assets/landing/business-meeting.jpg";
import documentsControl from "@/assets/landing/documents-control.jpg";
import reportsDashboard from "@/assets/landing/reports-dashboard.jpg";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Gauge,
  LayoutDashboard,
  Lock,
  Mail,
  Menu,
  Plus,
  Radar,
  Search,
  Settings,
  ShieldCheck,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Radar Contábil — Fiscal Monitor Pro" },
      {
        name: "description",
        content:
          "SaaS contábil para monitorar CNDs, certificados, alvarás, obrigações e pendências fiscais por CNPJ.",
      },
      { property: "og:title", content: "Radar Contábil — Fiscal Monitor Pro" },
      {
        property: "og:description",
        content: "Controle a rotina fiscal dos seus clientes sem depender de planilhas.",
      },
    ],
  }),
  component: FiscalMonitorPro,
});

type Empresa = {
  id: string;
  razaoSocial: string;
  fantasia: string;
  cnpj: string;
  ie: string;
  im: string;
  regime: string;
  uf: string;
  municipio: string;
  email: string;
  telefone: string;
  responsavel: string;
  status: "Ativa" | "Inativa" | "Suspensa";
  matriz?: string;
  risco: number;
};

type Documento = {
  id: string;
  empresaId: string;
  tipo: string;
  numero: string;
  emissao: string;
  vencimento: string;
  arquivo?: string;
  observacoes: string;
};

type Obrigacao = {
  id: string;
  empresaId: string;
  competencia: string;
  tipo: string;
  limite: string;
  status: "Pendente" | "Em andamento" | "Entregue" | "Atrasada" | "Não se aplica";
  responsavel: string;
  protocolo?: string;
};

type Tarefa = {
  id: string;
  empresaId: string;
  titulo: string;
  tipo: string;
  prioridade: "Baixa" | "Média" | "Alta" | "Crítica";
  responsavel: string;
  limite: string;
  status: "A fazer" | "Em andamento" | "Aguardando cliente" | "Concluído" | "Atrasado";
  descricao: string;
};

const today = new Date();
const iso = (offset: number) => {
  const d = new Date(today);
  d.setDate(today.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

const responsaveis = ["Ana Martins", "Bruno Costa", "Camila Rocha", "Diego Alves"];
const defaultContactEmail = "edicunhabr@gmail.com";
const tiposDocumento = [
  "CND Federal",
  "CND Estadual",
  "CND Municipal",
  "FGTS",
  "Trabalhista",
  "Alvará Municipal",
  "Alvará de Bombeiros",
  "Certificado Digital",
  "Contratos",
  "Outros documentos",
];
const tiposObrigacao = [
  "DCTFWeb",
  "EFD-Reinf",
  "eSocial",
  "SPED Fiscal",
  "SPED Contribuições",
  "PGDAS-D",
  "DEFIS",
  "DIRF",
  "ECD",
  "ECF",
  "MIT",
];

const audienceCards = [
  {
    title: "Escritórios contábeis",
    text: "Operação fiscal com equipe, carteira de clientes e prazos simultâneos.",
    image: accountingTeam,
    alt: "Equipe contábil reunida em escritório profissional",
  },
  {
    title: "Contadores autônomos",
    text: "Rotina individual com controle de documentos, CNDs e entregas mensais.",
    image: soloAccountant,
    alt: "Contador autônomo trabalhando com notebook e documentos",
  },
  {
    title: "Departamentos fiscais",
    text: "Times corporativos acompanhando indicadores, responsáveis e vencimentos.",
    image: fiscalDepartment,
    alt: "Equipe fiscal analisando indicadores corporativos",
  },
  {
    title: "Empresas com várias filiais",
    text: "Gestão multiunidade com visão por CNPJ, matriz, filial e risco operacional.",
    image: businessMeeting,
    alt: "Reunião empresarial para gestão de várias unidades",
  },
];

const benefitCards = [
  {
    title: "Alertas automáticos",
    text: "30, 15 e 7 dias antes, no vencimento e recorrência pós-vencido.",
    image: documentsControl,
    alt: "Profissional revisando documentos fiscais e prazos",
  },
  {
    title: "Controle de vencimentos",
    text: "CNDs, certificados, alvarás, contratos e obrigações em uma fila priorizada.",
    image: reportsDashboard,
    alt: "Dashboard corporativo com gráficos e indicadores financeiros",
  },
  {
    title: "Tarefas por responsável",
    text: "Kanban fiscal com prioridade, histórico, cliente vinculado e responsável interno.",
    image: accountingTeam,
    alt: "Equipe organizando tarefas em ambiente corporativo",
  },
  {
    title: "Relatórios executivos",
    text: "Exportações por risco, empresa, competência, pendência e responsável.",
    image: fiscalDepartment,
    alt: "Analistas revisando relatórios em tela corporativa",
  },
  {
    title: "Monitoramento por CNPJ",
    text: "Cada empresa recebe score, status, alertas e documentos críticos em tempo real.",
    image: businessMeeting,
    alt: "Gestores acompanhando carteira empresarial por unidades",
  },
];

const planCards = [
  {
    name: "Free",
    price: "R$ 0",
    text: "Para validar o fluxo com controles essenciais.",
    features: ["Até 5 empresas", "Documentos e vencimentos", "Dashboard básico"],
  },
  {
    name: "Pro",
    price: "R$ 97/mês",
    text: "Para escritórios que precisam de alertas e produtividade.",
    features: ["Até 60 empresas", "Alertas automáticos", "Kanban fiscal", "Relatórios CSV/PDF"],
  },
  {
    name: "Premium",
    price: "R$ 247/mês",
    text: "Para operações com múltiplos responsáveis e filiais.",
    features: [
      "Empresas ilimitadas",
      "Permissões avançadas",
      "E-mails do app",
      "Prioridade por risco",
    ],
  },
];

const initialEmpresas: Empresa[] = [
  {
    id: "e1",
    razaoSocial: "Aurum Comércio de Alimentos Ltda",
    fantasia: "Aurum Foods",
    cnpj: "12.345.678/0001-90",
    ie: "110.042.129.114",
    im: "54890",
    regime: "Lucro Presumido",
    uf: "SP",
    municipio: "São Paulo",
    email: defaultContactEmail,
    telefone: "(11) 4002-1122",
    responsavel: "Ana Martins",
    status: "Ativa",
    risco: 86,
  },
  {
    id: "e2",
    razaoSocial: "Nexo Engenharia e Serviços S.A.",
    fantasia: "Nexo Engenharia",
    cnpj: "21.764.998/0001-33",
    ie: "445.871.309.010",
    im: "90123",
    regime: "Lucro Real",
    uf: "RJ",
    municipio: "Rio de Janeiro",
    email: defaultContactEmail,
    telefone: "(21) 3555-0808",
    responsavel: "Bruno Costa",
    status: "Ativa",
    risco: 62,
  },
  {
    id: "e3",
    razaoSocial: "Clínica Vista Sul Ltda",
    fantasia: "Vista Sul",
    cnpj: "08.991.220/0001-44",
    ie: "Isento",
    im: "77310",
    regime: "Simples Nacional",
    uf: "PR",
    municipio: "Curitiba",
    email: defaultContactEmail,
    telefone: "(41) 3222-3311",
    responsavel: "Camila Rocha",
    status: "Ativa",
    risco: 28,
  },
  {
    id: "e4",
    razaoSocial: "Grupo Prisma Logística Ltda",
    fantasia: "Prisma Log",
    cnpj: "33.812.101/0001-66",
    ie: "883.200.445.119",
    im: "10022",
    regime: "Lucro Presumido",
    uf: "MG",
    municipio: "Belo Horizonte",
    email: defaultContactEmail,
    telefone: "(31) 3003-2020",
    responsavel: "Diego Alves",
    status: "Ativa",
    risco: 74,
  },
  {
    id: "e5",
    razaoSocial: "Prisma Logística Filial Campinas",
    fantasia: "Prisma Campinas",
    cnpj: "33.812.101/0002-47",
    ie: "244.760.990.010",
    im: "55320",
    regime: "Lucro Presumido",
    uf: "SP",
    municipio: "Campinas",
    email: defaultContactEmail,
    telefone: "(19) 3444-7890",
    responsavel: "Diego Alves",
    status: "Ativa",
    matriz: "e4",
    risco: 43,
  },
];

const initialDocumentos: Documento[] = [
  {
    id: "d1",
    empresaId: "e1",
    tipo: "CND Federal",
    numero: "CND-8831",
    emissao: iso(-120),
    vencimento: iso(-3),
    observacoes: "Cliente solicitou regularização.",
  },
  {
    id: "d2",
    empresaId: "e1",
    tipo: "Certificado Digital",
    numero: "A1-2201",
    emissao: iso(-320),
    vencimento: iso(9),
    observacoes: "Renovação com prioridade.",
  },
  {
    id: "d3",
    empresaId: "e2",
    tipo: "FGTS",
    numero: "FGTS-551",
    emissao: iso(-20),
    vencimento: iso(21),
    observacoes: "Acompanhar baixa.",
  },
  {
    id: "d4",
    empresaId: "e3",
    tipo: "Alvará Municipal",
    numero: "ALV-903",
    emissao: iso(-90),
    vencimento: iso(120),
    observacoes: "Ok.",
  },
  {
    id: "d5",
    empresaId: "e4",
    tipo: "CND Estadual",
    numero: "EST-442",
    emissao: iso(-70),
    vencimento: iso(-12),
    observacoes: "Pendência de inscrição estadual.",
  },
  {
    id: "d6",
    empresaId: "e5",
    tipo: "Alvará de Bombeiros",
    numero: "BOM-118",
    emissao: iso(-230),
    vencimento: iso(29),
    observacoes: "Solicitar vistoria.",
  },
];

const initialObrigacoes: Obrigacao[] = [
  {
    id: "o1",
    empresaId: "e1",
    competencia: "Março",
    tipo: "DCTFWeb",
    limite: iso(-6),
    status: "Atrasada",
    responsavel: "Ana Martins",
  },
  {
    id: "o2",
    empresaId: "e2",
    competencia: "Abril",
    tipo: "SPED Fiscal",
    limite: iso(5),
    status: "Em andamento",
    responsavel: "Bruno Costa",
  },
  {
    id: "o3",
    empresaId: "e3",
    competencia: "Abril",
    tipo: "PGDAS-D",
    limite: iso(11),
    status: "Entregue",
    responsavel: "Camila Rocha",
    protocolo: "PG-2026-778",
  },
  {
    id: "o4",
    empresaId: "e4",
    competencia: "Março",
    tipo: "EFD-Reinf",
    limite: iso(-14),
    status: "Atrasada",
    responsavel: "Diego Alves",
  },
  {
    id: "o5",
    empresaId: "e5",
    competencia: "Abril",
    tipo: "eSocial",
    limite: iso(8),
    status: "Pendente",
    responsavel: "Diego Alves",
  },
];

const initialTarefas: Tarefa[] = [
  {
    id: "t1",
    empresaId: "e1",
    titulo: "Regularizar CND Federal",
    tipo: "Certidão",
    prioridade: "Crítica",
    responsavel: "Ana Martins",
    limite: iso(-2),
    status: "Atrasado",
    descricao: "Conferir débitos e anexar comprovantes.",
  },
  {
    id: "t2",
    empresaId: "e1",
    titulo: "Renovar certificado A1",
    tipo: "Certificado",
    prioridade: "Alta",
    responsavel: "Ana Martins",
    limite: iso(7),
    status: "Em andamento",
    descricao: "Confirmar validação com responsável legal.",
  },
  {
    id: "t3",
    empresaId: "e2",
    titulo: "Enviar comprovante SPED",
    tipo: "Obrigação",
    prioridade: "Média",
    responsavel: "Bruno Costa",
    limite: iso(5),
    status: "A fazer",
    descricao: "Aguardar fechamento fiscal.",
  },
  {
    id: "t4",
    empresaId: "e5",
    titulo: "Solicitar AVCB atualizado",
    tipo: "Alvará",
    prioridade: "Alta",
    responsavel: "Diego Alves",
    limite: iso(12),
    status: "Aguardando cliente",
    descricao: "Cliente precisa enviar laudo técnico.",
  },
];

const nav = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["empresas", "Empresas", Building2],
  ["documentos", "Documentos", FileText],
  ["obrigacoes", "Obrigações", ClipboardCheck],
  ["tarefas", "Tarefas", CalendarDays],
  ["alertas", "Alertas", Bell],
  ["relatorios", "Relatórios", BarChart3],
  ["config", "Configurações", Settings],
] as const;

function FiscalMonitorPro() {
  const [authOpen, setAuthOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "cadastro">("cadastro");
  const [appOpen, setAppOpen] = useState(false);
  const [active, setActive] = useState("dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [empresas, setEmpresas] = useState(initialEmpresas);
  const [documentos, setDocumentos] = useState(initialDocumentos);
  const [obrigacoes, setObrigacoes] = useState(initialObrigacoes);
  const [tarefas, setTarefas] = useState(initialTarefas);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(initialEmpresas[0]);
  const [authMessage, setAuthMessage] = useState("");

  const enrichedDocs = useMemo(
    () =>
      documentos.map((doc) => ({
        ...doc,
        status: documentStatus(doc.vencimento),
        empresa:
          empresas.find((empresa) => empresa.id === doc.empresaId)?.razaoSocial ?? "Sem empresa",
      })),
    [documentos, empresas],
  );

  const metrics = useMemo(() => {
    const vencidos = enrichedDocs.filter((doc) => doc.status === "Vencido").length;
    const vencendo = enrichedDocs.filter((doc) => doc.status === "Vencendo").length;
    const certs = enrichedDocs.filter(
      (doc) => doc.tipo === "Certificado Digital" && doc.status !== "Válido",
    ).length;
    const atrasadas = obrigacoes.filter((item) => item.status === "Atrasada").length;
    const abertas =
      vencidos +
      vencendo +
      atrasadas +
      tarefas.filter((task) => task.status !== "Concluído").length;
    return { empresas: empresas.length, abertas, vencidos, vencendo, certs, atrasadas };
  }, [empresas, enrichedDocs, obrigacoes, tarefas]);

  const filteredEmpresas = empresas.filter((empresa) => {
    const term = query.toLowerCase();
    const matches = [
      empresa.cnpj,
      empresa.razaoSocial,
      empresa.municipio,
      empresa.regime,
      empresa.responsavel,
    ].some((value) => value.toLowerCase().includes(term));
    const byStatus =
      statusFilter === "Todos" ||
      riskStatus(empresa.risco) === statusFilter ||
      empresa.status === statusFilter;
    return matches && byStatus;
  });

  const addEmpresa = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const cnpj = String(form.get("cnpj") ?? "");
    if (
      !isValidCnpj(cnpj) ||
      empresas.some((empresa) => onlyDigits(empresa.cnpj) === onlyDigits(cnpj))
    )
      return;
    const nova: Empresa = {
      id: crypto.randomUUID(),
      razaoSocial: String(form.get("razao") ?? ""),
      fantasia: String(form.get("fantasia") ?? ""),
      cnpj,
      ie: String(form.get("ie") ?? ""),
      im: String(form.get("im") ?? ""),
      regime: String(form.get("regime") ?? "Simples Nacional"),
      uf: String(form.get("uf") ?? "SP"),
      municipio: String(form.get("municipio") ?? ""),
      email: String(form.get("email") ?? ""),
      telefone: String(form.get("telefone") ?? ""),
      responsavel: String(form.get("responsavel") ?? responsaveis[0]),
      status: "Ativa",
      matriz: String(form.get("matriz") ?? "") || undefined,
      risco: 18,
    };
    setEmpresas((items) => [nova, ...items]);
    setSelectedEmpresa(nova);
    event.currentTarget.reset();
  };

  const addDocumento = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get("arquivo") as File | null;
    setDocumentos((items) => [
      {
        id: crypto.randomUUID(),
        empresaId: String(form.get("empresa")),
        tipo: String(form.get("tipo")),
        numero: String(form.get("numero") ?? ""),
        emissao: String(form.get("emissao") ?? iso(0)),
        vencimento: String(form.get("vencimento") ?? iso(30)),
        arquivo: file?.name,
        observacoes: String(form.get("observacoes") ?? ""),
      },
      ...items,
    ]);
    event.currentTarget.reset();
  };

  const addObrigacao = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setObrigacoes((items) => [
      {
        id: crypto.randomUUID(),
        empresaId: String(form.get("empresa")),
        competencia: String(form.get("competencia")),
        tipo: String(form.get("tipo")),
        limite: String(form.get("limite")),
        status: "Pendente",
        responsavel: String(form.get("responsavel")),
      },
      ...items,
    ]);
    event.currentTarget.reset();
  };

  const addTarefa = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setTarefas((items) => [
      {
        id: crypto.randomUUID(),
        empresaId: String(form.get("empresa")),
        titulo: String(form.get("titulo")),
        tipo: String(form.get("tipo")),
        prioridade: String(form.get("prioridade")) as Tarefa["prioridade"],
        responsavel: String(form.get("responsavel")),
        limite: String(form.get("limite")),
        status: "A fazer",
        descricao: String(form.get("descricao")),
      },
      ...items,
    ]);
    event.currentTarget.reset();
  };

  const signInGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) setAuthMessage("Não foi possível iniciar o login com Google.");
  };

  const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("senha") ?? "");
    setAuthMessage("Processando...");
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setAuthMessage(
        error
          ? "Verifique e-mail, senha ou confirmação de cadastro."
          : "Login realizado. Abrindo painel demonstrativo.",
      );
      if (!error) setAppOpen(true);
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) {
      setAuthMessage("Não foi possível criar o cadastro agora.");
      return;
    }
    if (data.user && data.session) {
      const escritorio = await supabase
        .from("escritorios")
        .insert([
          {
            nome: String(form.get("escritorio")),
            cnpj: String(form.get("cnpj")),
            email,
            telefone: String(form.get("telefone") ?? ""),
          },
        ])
        .select("id")
        .single();
      if (escritorio.data) {
        await supabase.from("user_roles").insert({ user_id: data.user.id, role: "administrador" });
        await supabase.from("usuarios").insert([
          {
            id: data.user.id,
            escritorio_id: escritorio.data.id,
            nome: String(form.get("responsavel")),
            email,
            telefone: String(form.get("telefone") ?? ""),
          },
        ]);
      }
    }
    setAuthMessage("Cadastro criado. Confirme seu e-mail para acessar com segurança.");
  };

  if (appOpen) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 border-r bg-panel text-panel-foreground transition-transform lg:translate-x-0 ${mobileMenu ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex h-16 items-center gap-3 border-b border-border/20 px-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <Radar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-panel-foreground/70">RADAR CONTÁBIL</p>
              <strong>Fiscal Monitor Pro</strong>
            </div>
          </div>
          <nav className="space-y-1 p-3">
            {nav.map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => {
                  setActive(id);
                  setMobileMenu(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all hover:bg-primary/25 ${active === id ? "bg-accent text-accent-foreground shadow-sm" : "text-panel-foreground/80"}`}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 border-t border-border/20 p-4 text-xs text-panel-foreground/70">
            <p>Plano Profissional</p>
            <p>Alertas: 30, 15, 7, vencimento e pós-vencido</p>
          </div>
        </aside>
        <main className="lg:pl-72">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/85 px-4 backdrop-blur md:px-8">
            <div className="flex items-center gap-3">
              <button
                className="rounded-md border p-2 lg:hidden"
                onClick={() => setMobileMenu(true)}
                aria-label="Abrir menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-lg font-semibold md:text-2xl">
                  {nav.find(([id]) => id === active)?.[1]}
                </h1>
                <p className="hidden text-sm text-muted-foreground md:block">
                  Gestão fiscal estratégica por CNPJ, risco e responsável
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="success">Cloud ativo</Badge>
              <Button variant="outline" onClick={() => setAppOpen(false)}>
                Landing
              </Button>
            </div>
          </header>
          <div className="p-4 md:p-8">{renderAppSection()}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Radar className="h-5 w-5" />
            </div>
            <div>
              <strong>Radar Contábil</strong>
              <p className="text-xs text-muted-foreground">Fiscal Monitor Pro</p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#beneficios">Benefícios</a>
            <a href="#planos">Planos</a>
            <a href="#demo">Demonstração</a>
          </nav>
          <Button variant="panel" onClick={() => setAuthOpen(true)}>
            <Lock className="h-4 w-4" /> Entrar
          </Button>
        </div>
      </header>
      <section className="overflow-hidden">
        <div className="mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl items-center gap-10 px-4 py-12 md:grid-cols-[0.95fr_1.05fr] md:px-8 lg:py-16">
          <div className="max-w-3xl">
            <Badge tone="success">Radar automático de risco fiscal</Badge>
            <h1 className="mt-6 text-4xl font-bold leading-tight md:text-6xl">
              Controle a rotina fiscal dos seus clientes sem depender de planilhas.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Monitore vencimentos, documentos, obrigações e pendências contábeis com alertas
              automáticos e visão estratégica por CNPJ.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button variant="hero" size="lg" onClick={() => setAuthOpen(true)}>
                Começar agora <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => setAppOpen(true)}>
                Ver demonstração
              </Button>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {["125 CNPJs monitorados", "38 alertas ativos", "92% das pendências em dia"].map(
                (item) => (
                  <div
                    key={item}
                    className="surface-card rounded-xl border p-4 text-sm font-semibold"
                  >
                    <CheckCircle2 className="mb-3 h-5 w-5 text-success" />
                    {item}
                  </div>
                ),
              )}
            </div>
          </div>
          <div className="relative" id="demo">
            <img
              src={heroAccounting}
              alt="Profissional contábil analisando documentos fiscais em escritório corporativo"
              className="h-[560px] w-full rounded-2xl border object-cover shadow-2xl"
              loading="eager"
            />
            <div className="absolute inset-x-4 bottom-4 rounded-2xl border bg-card/95 p-4 shadow-2xl backdrop-blur md:inset-x-8 md:bottom-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Radar Contábil</p>
                  <h2 className="text-xl font-semibold">Prioridade fiscal hoje</h2>
                </div>
                <Badge tone="critical">7 críticas</Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                <Metric label="Críticas" value="7" tone="critical" />
                <Metric label="Vencem" value="18" tone="warning" />
                <Metric label="CNDs" value="4" tone="critical" />
                <Metric label="Ok" value="96" tone="success" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="max-w-3xl">
          <Badge>Produto B2B para rotina fiscal</Badge>
          <h2 className="mt-4 text-3xl font-bold">Para quem é</h2>
          <p className="mt-3 text-muted-foreground">
            Cada perfil recebe uma visão de operação, carteira e risco fiscal com imagens e contexto
            profissional.
          </p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {audienceCards.map((item) => (
            <article className="surface-card overflow-hidden rounded-2xl border" key={item.title}>
              <img
                src={item.image}
                alt={item.alt}
                className="h-44 w-full object-cover"
                loading="lazy"
              />
              <div className="p-5">
                <strong>{item.title}</strong>
                <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="border-y bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="text-sm font-semibold text-primary">Contato comercial e alertas demonstrativos</p>
            <p className="text-muted-foreground">Todas as comunicações provisórias ficam centralizadas neste e-mail.</p>
          </div>
          <a className="text-lg font-semibold text-foreground underline-offset-4 hover:underline" href={`mailto:${defaultContactEmail}`}>
            {defaultContactEmail}
          </a>
        </div>
      </section>
      <section id="beneficios" className="border-y bg-secondary/55">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <Badge tone="success">Benefícios operacionais</Badge>
              <h2 className="mt-4 text-3xl font-bold">
                Menos apagão fiscal, mais previsibilidade para o escritório.
              </h2>
              <p className="mt-4 text-muted-foreground">
                A landing agora usa fotos reais, thumbnails consistentes e uma leitura mais
                comercial para vender confiança.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {benefitCards.map((item) => (
                <article
                  className="surface-card overflow-hidden rounded-2xl border"
                  key={item.title}
                >
                  <img
                    src={item.image}
                    alt={item.alt}
                    className="h-32 w-full object-cover"
                    loading="lazy"
                  />
                  <div className="p-4">
                    <strong>{item.title}</strong>
                    <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="surface-card rounded-2xl border bg-card p-4 shadow-2xl">
            <DashboardMockup />
          </div>
          <div>
            <Badge>Screenshot do produto</Badge>
            <h2 className="mt-4 text-3xl font-bold">Demonstração com aparência de sistema real.</h2>
            <p className="mt-4 text-muted-foreground">
              Cards, gráficos, tabelas, alertas e ranking por risco reforçam a proposta de painel
              único para escritórios contábeis.
            </p>
            <Button className="mt-6" variant="panel" onClick={() => setAppOpen(true)}>
              Abrir painel completo
            </Button>
          </div>
        </div>
      </section>
      <section id="planos" className="border-y bg-secondary/55">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <Badge>Assinatura SaaS</Badge>
              <h2 className="mt-4 text-3xl font-bold">Planos para crescer com o escritório</h2>
            </div>
            <p className="max-w-xl text-sm text-muted-foreground">
              Pagamentos reais podem ser ativados com Paddle, recomendado para este SaaS contábil.
            </p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {planCards.map((plan, i) => (
              <div
                key={plan.name}
                className={`surface-card rounded-2xl border p-6 ${i === 1 ? "ring-2 ring-primary" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold">{plan.name}</h3>
                  {i === 1 && <Badge tone="success">mais vendido</Badge>}
                </div>
                <p className="mt-4 text-4xl font-bold">{plan.price}</p>
                <p className="mt-3 text-muted-foreground">{plan.text}</p>
                <div className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <p className="flex items-center gap-2 text-sm" key={feature}>
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      {feature}
                    </p>
                  ))}
                </div>
                <Button
                  className="mt-6 w-full"
                  variant={i === 1 ? "hero" : "outline"}
                  onClick={() => setAuthOpen(true)}
                >
                  Selecionar plano
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-4xl px-4 py-16 text-center md:px-8">
        <h2 className="text-3xl font-bold">
          Sua contabilidade não precisa viver apagando incêndio. Transforme pendências em gestão.
        </h2>
        <Button className="mt-7" variant="success" size="lg" onClick={() => setAuthOpen(true)}>
          Criar escritório
        </Button>
      </section>
      <footer className="border-t px-4 py-8 text-center text-sm text-muted-foreground">
        Política de Privacidade · Termos de Uso · Contato
      </footer>
      {authOpen && (
        <AuthModal
          mode={mode}
          setMode={setMode}
          onClose={() => setAuthOpen(false)}
          onSubmit={handleAuth}
          onGoogle={signInGoogle}
          message={authMessage}
        />
      )}
    </div>
  );

  function renderAppSection() {
    if (active === "empresas")
      return (
        <EmpresasSection
          empresas={filteredEmpresas}
          allEmpresas={empresas}
          query={query}
          setQuery={setQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          addEmpresa={addEmpresa}
          selectEmpresa={setSelectedEmpresa}
          selectedEmpresa={selectedEmpresa}
          documentos={enrichedDocs}
          obrigacoes={obrigacoes}
          tarefas={tarefas}
        />
      );
    if (active === "documentos")
      return (
        <DocumentosSection
          empresas={empresas}
          documentos={enrichedDocs}
          addDocumento={addDocumento}
        />
      );
    if (active === "obrigacoes")
      return (
        <ObrigacoesSection
          empresas={empresas}
          obrigacoes={obrigacoes}
          addObrigacao={addObrigacao}
        />
      );
    if (active === "tarefas")
      return (
        <TarefasSection
          empresas={empresas}
          tarefas={tarefas}
          addTarefa={addTarefa}
          moveTask={(id, status) =>
            setTarefas((items) =>
              items.map((item) => (item.id === id ? { ...item, status } : item)),
            )
          }
        />
      );
    if (active === "alertas")
      return (
        <AlertasSection documentos={enrichedDocs} obrigacoes={obrigacoes} empresas={empresas} />
      );
    if (active === "relatorios")
      return (
        <RelatoriosSection
          empresas={empresas}
          documentos={enrichedDocs}
          obrigacoes={obrigacoes}
          tarefas={tarefas}
        />
      );
    if (active === "config") return <ConfigSection />;
    return (
      <DashboardSection
        metrics={metrics}
        empresas={empresas}
        documentos={enrichedDocs}
        obrigacoes={obrigacoes}
        tarefas={tarefas}
        setActive={setActive}
      />
    );
  }
}

function DashboardMockup() {
  const bars = [72, 46, 88, 64, 38, 55];
  return (
    <div className="overflow-hidden rounded-xl border bg-background">
      <div className="flex items-center justify-between border-b bg-secondary/55 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-critical" />
          <span className="h-3 w-3 rounded-full bg-warning" />
          <span className="h-3 w-3 rounded-full bg-success" />
        </div>
        <p className="text-xs font-medium text-muted-foreground">Fiscal Monitor Pro · Dashboard</p>
      </div>
      <div className="grid gap-4 p-4 md:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Empresas", "125"],
              ["Alertas", "38"],
              ["Vencidos", "11"],
              ["Risco médio", "42"],
            ].map(([label, value]) => (
              <div className="rounded-lg border bg-card p-3" key={label}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-2 text-2xl font-bold">{value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="mb-4 flex items-center justify-between">
              <strong className="text-sm">Pendências por tipo</strong>
              <Badge tone="warning">abril</Badge>
            </div>
            <div className="flex h-36 items-end gap-3">
              {bars.map((bar, index) => (
                <div className="flex flex-1 flex-col items-center gap-2" key={bar}>
                  <div className="w-full rounded-t-md bg-primary" style={{ height: `${bar}%` }} />
                  <span className="text-[10px] text-muted-foreground">{index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-4 flex items-center justify-between">
            <strong className="text-sm">Radar Contábil</strong>
            <Badge tone="critical">prioridade</Badge>
          </div>
          <div className="space-y-3">
            {initialEmpresas.slice(0, 4).map((empresa) => (
              <div
                className="grid grid-cols-[1fr_auto] gap-3 rounded-lg border bg-secondary/35 p-3"
                key={empresa.id}
              >
                <div>
                  <p className="text-sm font-semibold">{empresa.fantasia}</p>
                  <p className="text-xs text-muted-foreground">
                    {empresa.cnpj} · {empresa.responsavel}
                  </p>
                </div>
                <Badge tone={toneFromRisk(empresa.risco)}>{empresa.risco}</Badge>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-critical/30 bg-critical/10 p-3">
            <p className="text-sm font-semibold">CND Federal vencida</p>
            <p className="text-xs text-muted-foreground">
              Aurum Foods · alerta enviado ao responsável
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardSection({
  metrics,
  empresas,
  documentos,
  obrigacoes,
  tarefas,
  setActive,
}: {
  metrics: Record<string, number>;
  empresas: Empresa[];
  documentos: Array<Documento & { status: string; empresa: string }>;
  obrigacoes: Obrigacao[];
  tarefas: Tarefa[];
  setActive: (id: string) => void;
}) {
  const chartData = [
    {
      name: "Fiscal",
      value:
        obrigacoes.filter((item) => item.tipo.includes("DCTF") || item.tipo.includes("SPED"))
          .length + 2,
    },
    {
      name: "Trabalhista",
      value: documentos.filter((item) => item.tipo === "Trabalhista").length + 1,
    },
    {
      name: "Certidões",
      value: documentos.filter((item) => item.tipo.includes("CND") || item.tipo === "FGTS").length,
    },
    { name: "Alvarás", value: documentos.filter((item) => item.tipo.includes("Alvará")).length },
    {
      name: "Certificado",
      value: documentos.filter((item) => item.tipo.includes("Certificado")).length,
    },
    { name: "Mensais", value: obrigacoes.length },
  ];
  const ranking = [...empresas].sort((a, b) => b.risco - a.risco).slice(0, 5);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <Kpi icon={Building2} label="Empresas" value={metrics.empresas} />
        <Kpi icon={AlertTriangle} label="Pendências" value={metrics.abertas} tone="warning" />
        <Kpi icon={FileText} label="Vencidos" value={metrics.vencidos} tone="critical" />
        <Kpi icon={Clock} label="Vencem 30 dias" value={metrics.vencendo} tone="warning" />
        <Kpi icon={ShieldCheck} label="Certificados" value={metrics.certs} tone="critical" />
        <Kpi
          icon={ClipboardCheck}
          label="Obrigações atrasadas"
          value={metrics.atrasadas}
          tone="critical"
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card
          title="Radar Contábil"
          icon={Radar}
          action={
            <Button variant="success" onClick={() => setActive("alertas")}>
              Ver alertas
            </Button>
          }
        >
          <div className="grid gap-3 md:grid-cols-2">
            {[
              [
                "Empresas em situação crítica",
                ranking.filter((e) => e.risco >= 71).length,
                "critical",
              ],
              [
                "Documentos que vencem primeiro",
                documentos.filter((d) => d.status === "Vencendo").length,
                "warning",
              ],
              [
                "Obrigações atrasadas",
                obrigacoes.filter((o) => o.status === "Atrasada").length,
                "critical",
              ],
              [
                "Clientes precisam enviar docs",
                tarefas.filter((t) => t.status === "Aguardando cliente").length,
                "warning",
              ],
              [
                "Certificados próximos",
                documentos.filter((d) => d.tipo === "Certificado Digital" && d.status !== "Válido")
                  .length,
                "critical",
              ],
              ["Responsável mais carregado", "Diego", "success"],
            ].map(([label, value, tone]) => (
              <div className="rounded-xl border bg-secondary/45 p-4" key={label}>
                <Badge tone={tone as Tone}>{String(value)}</Badge>
                <p className="mt-3 text-sm font-medium">{label}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Pendências por tipo" icon={BarChart3}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="var(--color-primary)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Card title="Empresas com maior risco" icon={Gauge}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-3">CNPJ</th>
                  <th>Razão social</th>
                  <th>Pendências</th>
                  <th>Documento urgente</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((empresa) => (
                  <tr key={empresa.id} className="border-b last:border-0">
                    <td className="py-3 font-mono text-xs">{empresa.cnpj}</td>
                    <td className="font-medium">{empresa.razaoSocial}</td>
                    <td>{Math.ceil(empresa.risco / 18)}</td>
                    <td>
                      {documentos.find((d) => d.empresaId === empresa.id)?.tipo ?? "Sem urgência"}
                    </td>
                    <td>
                      <Badge tone={toneFromRisk(empresa.risco)}>{riskStatus(empresa.risco)}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Calendário fiscal e alertas" icon={CalendarDays}>
          <div className="space-y-3">
            {[...obrigacoes]
              .sort((a, b) => a.limite.localeCompare(b.limite))
              .slice(0, 4)
              .map((item) => (
                <div
                  className="flex items-center justify-between rounded-xl border p-3"
                  key={item.id}
                >
                  <div>
                    <p className="font-medium">{item.tipo}</p>
                    <p className="text-sm text-muted-foreground">
                      {empresaName(empresas, item.empresaId)} · {item.competencia}
                    </p>
                  </div>
                  <Badge
                    tone={
                      item.status === "Atrasada"
                        ? "critical"
                        : item.status === "Entregue"
                          ? "success"
                          : "warning"
                    }
                  >
                    {formatDate(item.limite)}
                  </Badge>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function EmpresasSection(props: {
  empresas: Empresa[];
  allEmpresas: Empresa[];
  query: string;
  setQuery: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  addEmpresa: (e: React.FormEvent<HTMLFormElement>) => void;
  selectEmpresa: (e: Empresa) => void;
  selectedEmpresa: Empresa | null;
  documentos: Array<Documento & { status: string; empresa: string }>;
  obrigacoes: Obrigacao[];
  tarefas: Tarefa[];
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
      <div className="space-y-6">
        <Card title="Cadastro e busca de empresas" icon={Building2}>
          <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                value={props.query}
                onChange={(e) => props.setQuery(e.target.value)}
                placeholder="Buscar por CNPJ, razão social, cidade, regime ou responsável"
              />
            </div>
            <select
              className="rounded-md border bg-background px-3 text-sm"
              value={props.statusFilter}
              onChange={(e) => props.setStatusFilter(e.target.value)}
            >
              <option>Todos</option>
              <option>Regular</option>
              <option>Atenção</option>
              <option>Crítico</option>
              <option>Ativa</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-3">Razão social</th>
                  <th>CNPJ</th>
                  <th>Regime</th>
                  <th>Cidade</th>
                  <th>Responsável</th>
                  <th>Risco</th>
                </tr>
              </thead>
              <tbody>
                {props.empresas.map((empresa) => (
                  <tr
                    className="cursor-pointer border-b transition-colors hover:bg-secondary/60"
                    key={empresa.id}
                    onClick={() => props.selectEmpresa(empresa)}
                  >
                    <td className="py-3 font-medium">
                      {empresa.razaoSocial}
                      <p className="text-xs text-muted-foreground">
                        {empresa.fantasia}
                        {empresa.matriz ? " · filial" : ""}
                      </p>
                    </td>
                    <td className="font-mono text-xs">{empresa.cnpj}</td>
                    <td>{empresa.regime}</td>
                    <td>
                      {empresa.municipio}/{empresa.uf}
                    </td>
                    <td>{empresa.responsavel}</td>
                    <td>
                      <Badge tone={toneFromRisk(empresa.risco)}>{empresa.risco}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Nova empresa cliente" icon={Plus}>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={props.addEmpresa}>
            <Input name="razao" required placeholder="Razão social" />
            <Input name="fantasia" placeholder="Nome fantasia" />
            <Input name="cnpj" required placeholder="CNPJ válido" />
            <Input name="ie" placeholder="Inscrição estadual" />
            <Input name="im" placeholder="Inscrição municipal" />
            <select name="regime" className="rounded-md border bg-background px-3 text-sm">
              <option>Simples Nacional</option>
              <option>Lucro Presumido</option>
              <option>Lucro Real</option>
              <option>MEI</option>
            </select>
            <Input name="uf" maxLength={2} placeholder="UF" />
            <Input name="municipio" required placeholder="Município" />
            <Input name="email" type="email" placeholder="E-mail do cliente" />
            <Input name="telefone" placeholder="Telefone" />
            <select name="responsavel" className="rounded-md border bg-background px-3 text-sm">
              {responsaveis.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <select name="matriz" className="rounded-md border bg-background px-3 text-sm">
              <option value="">Matriz / sem grupo</option>
              {props.allEmpresas.map((e) => (
                <option value={e.id} key={e.id}>
                  {e.razaoSocial}
                </option>
              ))}
            </select>
            <Button className="md:col-span-2" variant="hero">
              <Plus className="h-4 w-4" />
              Cadastrar empresa
            </Button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            A validação evita CNPJ inválido e duplicidade na demonstração.
          </p>
        </Card>
      </div>
      <EmpresaPanel
        empresa={props.selectedEmpresa}
        documentos={props.documentos}
        obrigacoes={props.obrigacoes}
        tarefas={props.tarefas}
      />
    </div>
  );
}

function EmpresaPanel({
  empresa,
  documentos,
  obrigacoes,
  tarefas,
}: {
  empresa: Empresa | null;
  documentos: Array<Documento & { status: string; empresa: string }>;
  obrigacoes: Obrigacao[];
  tarefas: Tarefa[];
}) {
  if (!empresa)
    return (
      <Card title="Painel da empresa" icon={Building2}>
        <p>Selecione uma empresa.</p>
      </Card>
    );
  const docs = documentos.filter((d) => d.empresaId === empresa.id);
  const obs = obrigacoes.filter((o) => o.empresaId === empresa.id);
  const tasks = tarefas.filter((t) => t.empresaId === empresa.id);
  return (
    <Card title="Painel da empresa" icon={Gauge}>
      <div className="space-y-5">
        <div className="rounded-xl border bg-secondary/45 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">{empresa.razaoSocial}</h3>
              <p className="text-sm text-muted-foreground">
                {empresa.cnpj} · {empresa.municipio}/{empresa.uf} · {empresa.regime}
              </p>
            </div>
            <Badge tone={toneFromRisk(empresa.risco)}>{riskStatus(empresa.risco)}</Badge>
          </div>
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-sm">
              <span>Nota de risco</span>
              <strong>{empresa.risco}/100</strong>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${empresa.risco}%` }}
              />
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Info label="Responsável" value={empresa.responsavel} />
          <Info label="E-mail" value={empresa.email} />
          <Info label="Status" value={empresa.status} />
          <Info label="Telefone" value={empresa.telefone} />
        </div>
        <ModuleList
          title="Pendências fiscais"
          items={[
            ...docs.filter((d) => d.status !== "Válido").map((d) => `${d.tipo} · ${d.status}`),
            ...obs.filter((o) => o.status === "Atrasada").map((o) => `${o.tipo} · atrasada`),
          ]}
        />
        <ModuleList
          title="Documentos anexados"
          items={docs.map((d) => `${d.tipo} · ${d.arquivo ?? "PDF pendente"}`)}
        />
        <ModuleList
          title="Obrigações acessórias"
          items={obs.map((o) => `${o.competencia} · ${o.tipo} · ${o.status}`)}
        />
        <ModuleList
          title="Tarefas vinculadas"
          items={tasks.map((t) => `${t.titulo} · ${t.status}`)}
        />
        <ModuleList
          title="Histórico de ações"
          items={[
            "Risco recalculado automaticamente",
            "Alerta de vencimento gerado",
            "Responsável interno atualizado",
          ]}
        />
      </div>
    </Card>
  );
}

function DocumentosSection({
  empresas,
  documentos,
  addDocumento,
}: {
  empresas: Empresa[];
  documentos: Array<Documento & { status: string; empresa: string }>;
  addDocumento: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
      <Card title="Adicionar documento" icon={Upload}>
        <form className="space-y-3" onSubmit={addDocumento}>
          <select
            name="empresa"
            required
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            {empresas.map((e) => (
              <option value={e.id} key={e.id}>
                {e.razaoSocial}
              </option>
            ))}
          </select>
          <select name="tipo" className="h-10 w-full rounded-md border bg-background px-3 text-sm">
            {tiposDocumento.map((tipo) => (
              <option key={tipo}>{tipo}</option>
            ))}
          </select>
          <Input name="numero" placeholder="Número do documento" />
          <div className="grid grid-cols-2 gap-3">
            <Input name="emissao" type="date" />
            <Input name="vencimento" type="date" required />
          </div>
          <Input name="arquivo" type="file" accept="application/pdf" />
          <Input name="observacoes" placeholder="Observações" />
          <Button className="w-full" variant="hero">
            Salvar documento
          </Button>
        </form>
        <p className="mt-3 text-xs text-muted-foreground">
          Status automático: válido, vencendo ou vencido conforme a data de vencimento.
        </p>
      </Card>
      <Card title="Controle de documentos" icon={FileText}>
        <div className="mb-4 flex gap-2">
          <Input placeholder="Filtrar por empresa, CNPJ, status ou vencimento" />
          <Button variant="outline">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-3">Empresa</th>
                <th>Tipo</th>
                <th>Número</th>
                <th>Emissão</th>
                <th>Vencimento</th>
                <th>Status</th>
                <th>Arquivo</th>
              </tr>
            </thead>
            <tbody>
              {documentos.map((doc) => (
                <tr key={doc.id} className="border-b last:border-0">
                  <td className="py-3 font-medium">{doc.empresa}</td>
                  <td>{doc.tipo}</td>
                  <td>{doc.numero}</td>
                  <td>{formatDate(doc.emissao)}</td>
                  <td>{formatDate(doc.vencimento)}</td>
                  <td>
                    <Badge
                      tone={
                        doc.status === "Válido"
                          ? "success"
                          : doc.status === "Vencendo"
                            ? "warning"
                            : "critical"
                      }
                    >
                      {doc.status}
                    </Badge>
                  </td>
                  <td>{doc.arquivo ?? "PDF"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function ObrigacoesSection({
  empresas,
  obrigacoes,
  addObrigacao,
}: {
  empresas: Empresa[];
  obrigacoes: Obrigacao[];
  addObrigacao: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="space-y-6">
      <Card title="Nova obrigação acessória" icon={ClipboardCheck}>
        <form className="grid gap-3 md:grid-cols-6" onSubmit={addObrigacao}>
          <select
            name="empresa"
            className="rounded-md border bg-background px-3 text-sm md:col-span-2"
          >
            {empresas.map((e) => (
              <option value={e.id} key={e.id}>
                {e.razaoSocial}
              </option>
            ))}
          </select>
          <select name="competencia" className="rounded-md border bg-background px-3 text-sm">
            <option>Janeiro</option>
            <option>Fevereiro</option>
            <option>Março</option>
            <option>Abril</option>
            <option>Maio</option>
            <option>Junho</option>
            <option>Julho</option>
            <option>Agosto</option>
            <option>Setembro</option>
            <option>Outubro</option>
            <option>Novembro</option>
            <option>Dezembro</option>
          </select>
          <select name="tipo" className="rounded-md border bg-background px-3 text-sm">
            {tiposObrigacao.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <Input name="limite" type="date" required />
          <select name="responsavel" className="rounded-md border bg-background px-3 text-sm">
            {responsaveis.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <Button className="md:col-span-6" variant="hero">
            Criar obrigação
          </Button>
        </form>
      </Card>
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card title="Visão por competência" icon={CalendarDays}>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              "Janeiro",
              "Fevereiro",
              "Março",
              "Abril",
              "Maio",
              "Junho",
              "Julho",
              "Agosto",
              "Setembro",
              "Outubro",
              "Novembro",
              "Dezembro",
            ].map((mes) => (
              <div className="rounded-xl border p-4" key={mes}>
                <p className="font-semibold">{mes}</p>
                <p className="text-sm text-muted-foreground">
                  {obrigacoes.filter((o) => o.competencia === mes).length} obrigações
                </p>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Por empresa e responsável" icon={Users}>
          <div className="space-y-3">
            {obrigacoes.map((item) => (
              <div className="rounded-xl border p-3" key={item.id}>
                <div className="flex items-center justify-between gap-3">
                  <strong>{item.tipo}</strong>
                  <Badge
                    tone={
                      item.status === "Entregue"
                        ? "success"
                        : item.status === "Atrasada"
                          ? "critical"
                          : "warning"
                    }
                  >
                    {item.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {empresaName(empresas, item.empresaId)} · {item.competencia} · {item.responsavel}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function TarefasSection({
  empresas,
  tarefas,
  addTarefa,
  moveTask,
}: {
  empresas: Empresa[];
  tarefas: Tarefa[];
  addTarefa: (e: React.FormEvent<HTMLFormElement>) => void;
  moveTask: (id: string, status: Tarefa["status"]) => void;
}) {
  const columns: Tarefa["status"][] = [
    "A fazer",
    "Em andamento",
    "Aguardando cliente",
    "Concluído",
    "Atrasado",
  ];
  return (
    <div className="space-y-6">
      <Card title="Nova tarefa interna" icon={Plus}>
        <form className="grid gap-3 md:grid-cols-4" onSubmit={addTarefa}>
          <Input name="titulo" required placeholder="Título" />
          <select name="empresa" className="rounded-md border bg-background px-3 text-sm">
            {empresas.map((e) => (
              <option value={e.id} key={e.id}>
                {e.razaoSocial}
              </option>
            ))}
          </select>
          <Input name="tipo" placeholder="Tipo" />
          <select name="prioridade" className="rounded-md border bg-background px-3 text-sm">
            <option>Baixa</option>
            <option>Média</option>
            <option>Alta</option>
            <option>Crítica</option>
          </select>
          <select name="responsavel" className="rounded-md border bg-background px-3 text-sm">
            {responsaveis.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <Input name="limite" type="date" />
          <Input name="descricao" className="md:col-span-2" placeholder="Descrição" />
          <Button className="md:col-span-4" variant="hero">
            Adicionar ao kanban
          </Button>
        </form>
      </Card>
      <div className="grid gap-4 xl:grid-cols-5">
        {columns.map((column) => (
          <div className="min-h-80 rounded-2xl border bg-secondary/40 p-3" key={column}>
            <div className="mb-3 flex items-center justify-between">
              <strong>{column}</strong>
              <Badge>{tarefas.filter((t) => t.status === column).length}</Badge>
            </div>
            <div className="space-y-3">
              {tarefas
                .filter((task) => task.status === column)
                .map((task) => (
                  <div className="surface-card rounded-xl border p-3" key={task.id}>
                    <Badge
                      tone={
                        task.prioridade === "Crítica"
                          ? "critical"
                          : task.prioridade === "Alta"
                            ? "warning"
                            : "success"
                      }
                    >
                      {task.prioridade}
                    </Badge>
                    <h3 className="mt-3 font-semibold">{task.titulo}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {empresaName(empresas, task.empresaId)} · {task.responsavel}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Histórico: criado, movimentado e comentado pela equipe.
                    </p>
                    <select
                      className="mt-3 w-full rounded-md border bg-background px-2 py-1 text-xs"
                      value={task.status}
                      onChange={(e) => moveTask(task.id, e.target.value as Tarefa["status"])}
                    >
                      {columns.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlertasSection({
  documentos,
  obrigacoes,
  empresas,
}: {
  documentos: Array<Documento & { status: string; empresa: string }>;
  obrigacoes: Obrigacao[];
  empresas: Empresa[];
}) {
  const alerts = [
    ...documentos
      .filter((d) => d.status !== "Válido")
      .map((d) => ({
        title: d.tipo,
        company: d.empresa,
        date: d.vencimento,
        status: d.status,
        type: "Documento",
      })),
    ...obrigacoes
      .filter((o) => o.status === "Atrasada" || o.status === "Pendente")
      .map((o) => ({
        title: o.tipo,
        company: empresaName(empresas, o.empresaId),
        date: o.limite,
        status: o.status,
        type: "Obrigação",
      })),
  ].sort((a, b) => a.date.localeCompare(b.date));
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
      <Card title="Alertas automáticos" icon={Bell}>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              className="flex items-center justify-between rounded-xl border p-4"
              key={`${alert.title}${alert.company}${alert.date}`}
            >
              <div>
                <Badge
                  tone={
                    alert.status === "Vencido" || alert.status === "Atrasada"
                      ? "critical"
                      : "warning"
                  }
                >
                  {alert.type}
                </Badge>
                <p className="mt-2 font-semibold">{alert.title}</p>
                <p className="text-sm text-muted-foreground">
                  {alert.company} · vence em {formatDate(alert.date)}
                </p>
              </div>
              <Mail className="h-5 w-5 text-primary" />
            </div>
          ))}
        </div>
      </Card>
      <Card title="Configuração de e-mails" icon={Settings}>
        <div className="space-y-4">
          <ConfigLine label="30 dias antes" active />
          <ConfigLine label="15 dias antes" active />
          <ConfigLine label="7 dias antes" active />
          <ConfigLine label="No dia do vencimento" active />
          <ConfigLine label="Após vencido a cada 5 dias" active />
          <div className="rounded-xl border p-4">
            <p className="font-semibold">Destinatários por empresa</p>
            <p className="mt-1 text-sm text-muted-foreground">
              E-mail principal + até 3 adicionais com mensagem contendo empresa, CNPJ, tipo,
              vencimento, status e link do sistema.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function RelatoriosSection({
  empresas,
  documentos,
  obrigacoes,
  tarefas,
}: {
  empresas: Empresa[];
  documentos: Array<Documento & { status: string; empresa: string }>;
  obrigacoes: Obrigacao[];
  tarefas: Tarefa[];
}) {
  const reports = [
    "Empresas com documentos vencidos",
    "Empresas com documentos vencendo",
    "Obrigações atrasadas por competência",
    "Pendências por responsável",
    "Pendências por tipo",
    "Certificados digitais próximos do vencimento",
    "Alvarás vencidos",
  ];
  const exportCsv = () => {
    const csv = [
      "razao_social,cnpj,risco,status",
      ...empresas.map((e) => `${e.razaoSocial},${e.cnpj},${e.risco},${riskStatus(e.risco)}`),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "radar-contabil-relatorio.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <Card title="Filtros de relatório" icon={Filter}>
        <div className="space-y-3">
          <Input placeholder="Empresa ou CNPJ" />
          <select className="h-10 w-full rounded-md border bg-background px-3 text-sm">
            <option>Status</option>
            <option>Vencido</option>
            <option>Vencendo</option>
            <option>Atrasada</option>
          </select>
          <Input type="date" />
          <select className="h-10 w-full rounded-md border bg-background px-3 text-sm">
            <option>Responsável</option>
            {responsaveis.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <select className="h-10 w-full rounded-md border bg-background px-3 text-sm">
            <option>Competência</option>
            <option>Janeiro</option>
            <option>Fevereiro</option>
            <option>Março</option>
            <option>Abril</option>
          </select>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={exportCsv}>
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </Button>
            <Button variant="panel">
              <Download className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>
      </Card>
      <Card title="Relatórios prontos" icon={BarChart3}>
        <div className="grid gap-3 md:grid-cols-2">
          {reports.map((report) => (
            <div className="surface-card rounded-xl border p-4" key={report}>
              <FileText className="mb-3 h-5 w-5 text-primary" />
              <strong>{report}</strong>
              <p className="mt-2 text-sm text-muted-foreground">
                Cabeçalho profissional, data de geração e filtros utilizados.
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: "Docs", value: documentos.length },
                  { name: "Obrigações", value: obrigacoes.length },
                  { name: "Tarefas", value: tarefas.length },
                ]}
                dataKey="value"
                nameKey="name"
                outerRadius={86}
              >
                {["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)"].map(
                  (fill) => (
                    <Cell key={fill} fill={fill} />
                  ),
                )}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function ConfigSection() {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Card title="Cadastro do escritório" icon={Building2}>
        <div className="space-y-3">
          <Input defaultValue="Radar Contábil Consultoria" />
          <Input defaultValue="00.111.222/0001-33" />
          <Input defaultValue={defaultContactEmail} />
          <Input defaultValue="(11) 3000-4040" />
          <Button variant="hero">Salvar configurações</Button>
        </div>
      </Card>
      <Card title="Usuários e permissões" icon={Users}>
        <div className="space-y-3">
          {[
            "Administrador — acesso total",
            "Gestor — empresas, tarefas e relatórios",
            "Operador — documentos e tarefas vinculadas",
            "Cliente — própria empresa e envio de documentos",
          ].map((item) => (
            <div className="rounded-xl border p-3 text-sm" key={item}>
              {item}
            </div>
          ))}
        </div>
      </Card>
      <Card title="Modelos e tipos personalizados" icon={Settings}>
        <div className="space-y-3">
          <Input defaultValue="Modelo de e-mail: vencimento próximo" />
          <Input defaultValue="Tipos de documentos personalizados" />
          <Input defaultValue="Tipos de obrigações personalizadas" />
          <Badge tone="success">Plano Profissional ativo</Badge>
        </div>
      </Card>
    </div>
  );
}

function AuthModal({
  mode,
  setMode,
  onClose,
  onSubmit,
  onGoogle,
  message,
}: {
  mode: "login" | "cadastro";
  setMode: (mode: "login" | "cadastro") => void;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogle: () => void;
  message: string;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-panel/60 p-4 backdrop-blur">
      <div className="surface-card max-h-[92vh] w-full max-w-2xl overflow-auto rounded-2xl border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {mode === "login" ? "Entrar" : "Cadastro de escritório contábil"}
            </h2>
            <p className="text-sm text-muted-foreground">Acesso seguro por e-mail e senha.</p>
          </div>
          <button onClick={onClose} className="rounded-md border p-2" aria-label="Fechar">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-secondary p-1">
          <button
            className={`rounded-lg px-3 py-2 text-sm ${mode === "login" ? "bg-card shadow" : ""}`}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            className={`rounded-lg px-3 py-2 text-sm ${mode === "cadastro" ? "bg-card shadow" : ""}`}
            onClick={() => setMode("cadastro")}
          >
            Cadastro
          </button>
        </div>
        <form className="mt-5 grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
          {mode === "cadastro" && (
            <>
              <Input name="escritorio" required placeholder="Nome do escritório" />
              <Input name="cnpj" required placeholder="CNPJ do escritório" />
              <Input name="responsavel" required placeholder="Nome do responsável" />
              <Input name="telefone" placeholder="Telefone" />
            </>
          )}
          <Input
            name="email"
            type="email"
            required
            placeholder="E-mail"
            className={mode === "login" ? "md:col-span-2" : ""}
          />
          <Input
            name="senha"
            type="password"
            required
            minLength={6}
            placeholder="Senha"
            className={mode === "login" ? "md:col-span-2" : ""}
          />
          <Button className="md:col-span-2" variant="hero">
            {mode === "login" ? "Entrar" : "Criar escritório vinculado"}
          </Button>
        </form>
        <Button className="mt-3 w-full" variant="outline" onClick={onGoogle}>
          Entrar com Google
        </Button>
        {message && (
          <p className="mt-4 rounded-lg bg-secondary p-3 text-sm text-muted-foreground">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

function Card({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  icon: React.ElementType;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-card rounded-2xl border bg-card p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  tone?: Tone | "default";
}) {
  return (
    <div className="surface-card rounded-2xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <Icon className="h-5 w-5 text-primary" />
        <Badge tone={tone === "default" ? undefined : tone}>
          {tone === "default" ? "Hoje" : tone}
        </Badge>
      </div>
      <p className="mt-4 text-3xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: Tone }) {
  return (
    <div className="rounded-xl border border-border/20 bg-background/10 p-4">
      <Badge tone={tone}>{label}</Badge>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
}
function RiskRow({ empresa, compact = false }: { empresa: Empresa; compact?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-background/10 p-3">
      <div>
        <p className="font-medium">{empresa.fantasia}</p>
        {!compact && <p className="text-sm opacity-70">{empresa.cnpj}</p>}
      </div>
      <Badge tone={toneFromRisk(empresa.risco)}>{empresa.risco}</Badge>
    </div>
  );
}

type Tone = "success" | "warning" | "critical";
function Badge({ children, tone }: { children: React.ReactNode; tone?: Tone }) {
  const cls =
    tone === "success"
      ? "bg-success/15 text-success"
      : tone === "warning"
        ? "bg-warning/20 text-warning-foreground"
        : tone === "critical"
          ? "bg-critical/15 text-critical"
          : "bg-secondary text-secondary-foreground";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}
    >
      {children}
    </span>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
function ModuleList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="mb-2 font-semibold">{title}</h4>
      <div className="space-y-2">
        {items.length ? (
          items.map((item) => (
            <p className="rounded-lg bg-secondary/55 px-3 py-2 text-sm" key={item}>
              {item}
            </p>
          ))
        ) : (
          <p className="rounded-lg bg-secondary/55 px-3 py-2 text-sm text-muted-foreground">
            Sem registros.
          </p>
        )}
      </div>
    </div>
  );
}
function ConfigLine({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border p-3">
      <span>{label}</span>
      <Badge tone={active ? "success" : undefined}>ativo</Badge>
    </div>
  );
}
function empresaName(empresas: Empresa[], id: string) {
  return empresas.find((empresa) => empresa.id === id)?.fantasia ?? "Empresa";
}
function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR");
}
function documentStatus(date: string) {
  const target = new Date(`${date}T12:00:00`);
  const diff = Math.ceil((target.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return "Vencido";
  if (diff <= 30) return "Vencendo";
  return "Válido";
}
function riskStatus(score: number) {
  if (score <= 30) return "Regular";
  if (score <= 70) return "Atenção";
  return "Crítico";
}
function toneFromRisk(score: number): Tone {
  if (score <= 30) return "success";
  if (score <= 70) return "warning";
  return "critical";
}
function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}
function isValidCnpj(value: string) {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
  const calc = (base: string, weights: number[]) => {
    const sum = weights.reduce((acc, weight, index) => acc + Number(base[index]) * weight, 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  return (
    calc(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === Number(cnpj[12]) &&
    calc(cnpj.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === Number(cnpj[13])
  );
}
