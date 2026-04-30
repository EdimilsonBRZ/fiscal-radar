import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/prazocontabil/AppShell";

export const Route = createFileRoute("/app")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/app") {
      throw redirect({ to: "/app/painel" });
    }
  },
  component: AppShell,
});
