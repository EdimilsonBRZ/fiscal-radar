import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock, Radar } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — PrazoContábil" }, { name: "description", content: "Acesse o PrazoContábil para controlar prazos, documentos e rotinas fiscais por empresa/CNPJ." }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "cadastro">("login");
  const [message, setMessage] = useState("");
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("senha") ?? "");
    setMessage("Processando...");
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setMessage("Verifique e-mail, senha ou confirmação do cadastro."); return; }
      await navigate({ to: "/app/painel" });
      return;
    }
    const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/login" } });
    setMessage(error ? "Não foi possível criar o cadastro agora." : "Cadastro criado. Confirme seu e-mail para acessar com segurança.");
  }
  async function googleLogin() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/app/painel" });
    if (result.error) setMessage("Não foi possível iniciar o login com Google.");
  }
  return <div className="flex min-h-screen items-center justify-center bg-background px-4"><section className="surface-card w-full max-w-md rounded-lg border p-6"><Link to="/" className="mb-6 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Radar className="h-5 w-5"/></span><span><strong>PrazoContábil</strong><p className="text-xs text-muted-foreground">Controle de prazos, documentos e rotinas fiscais por empresa/CNPJ.</p></span></Link><h1 className="text-2xl font-semibold">{mode === "login" ? "Entrar no sistema" : "Criar cadastro"}</h1><form className="mt-5 space-y-3" onSubmit={handleSubmit}><div><label className="text-sm font-medium">E-mail</label><Input name="email" type="email" required placeholder="seu@email.com"/></div><div><label className="text-sm font-medium">Senha</label><Input name="senha" type="password" required placeholder="Digite sua senha"/></div><Button className="w-full"><Lock className="h-4 w-4"/> {mode === "login" ? "Entrar" : "Criar cadastro"}</Button></form><Button variant="outline" className="mt-3 w-full" onClick={googleLogin}>Entrar com Google</Button><button className="mt-4 text-sm text-primary" onClick={()=>setMode(mode === "login" ? "cadastro" : "login")}>{mode === "login" ? "Ainda não tenho cadastro" : "Já tenho cadastro"}</button>{message && <p className="mt-3 text-sm text-muted-foreground">{message}</p>}</section></div>;
}
